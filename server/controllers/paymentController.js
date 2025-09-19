const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Notification = require('../models/Notification');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.checkout = async (req, res) => {
  try {
    const { amount } = req.body; // Amount should be in smallest currency unit (e.g., paise for INR)

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: crypto.randomBytes(10).toString('hex'),
    };

    const order = await instance.orders.create(options);
    res.status(200).json({
      success: true,
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    res.status(500).json({ message: 'Payment checkout error', error: err.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      gigId,
      instructions,
      clientId,
      studentId,
      price,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is authentic, create the order in your DB
      const gig = await Gig.findById(gigId);
      if (!gig) return res.status(404).json({ message: 'Gig not found' });

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + gig.deliveryTime); // Deadline = now + gig.deliveryTime days

      const newOrder = await Order.create({
        gigId,
        clientId,
        studentId,
        instructions,
        price,
        deadline,
        paymentId: razorpay_payment_id,
        status: 'booked',
      });

      // Notify student about new order
      await Notification.create({
        userId: studentId,
        type: 'new_order',
        message: `You have a new order for gig: ${gig.title}`,
        link: `/student/orders/${newOrder._id}`,
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified and order created',
        order: newOrder,
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Payment verification error', error: err.message });
  }
};
