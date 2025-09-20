const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create Payment Intent for checkout
exports.checkout = async (req, res) => {
  try {
    const { amount, gigId, instructions } = req.body;

    // Validate required fields
    if (!amount || !gigId) {
      return res.status(400).json({ message: 'Amount and gigId are required' });
    }

    // Verify gig exists and is approved
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'approved') {
      return res.status(400).json({ message: 'Gig is not approved for purchase' });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to paise (Stripe expects amount in smallest currency unit)
      currency: 'inr', // Using INR currency
      metadata: {
        gigId: gigId,
        clientId: req.user._id.toString(),
        studentId: gig.studentId.toString(),
        instructions: instructions || '',
      },
      description: `Payment for gig: ${gig.title}`,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ message: 'Payment checkout error', error: err.message });
  }
};

// Confirm payment and create order
exports.confirmPayment = async (req, res) => {
  try {
    const {
      paymentIntentId,
      gigId,
      instructions,
    } = req.body;

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Extract metadata
    const clientId = paymentIntent.metadata.clientId;
    const studentId = paymentIntent.metadata.studentId;

    // Verify gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Calculate deadline
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + gig.deliveryTime);

    // Create the order in your database
    const newOrder = await Order.create({
      gigId,
      clientId,
      studentId,
      instructions: instructions || paymentIntent.metadata.instructions,
      price: paymentIntent.amount / 100, // Convert back from paise
      deadline,
      paymentId: paymentIntentId,
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
      message: 'Payment confirmed and order created',
      order: newOrder,
    });
  } catch (err) {
    console.error('Payment confirmation error:', err);
    res.status(500).json({ message: 'Payment confirmation error', error: err.message });
  }
};

// Webhook handler for Stripe events (commented out for testing without webhook secret)
// exports.handleWebhook = async (req, res) => {
//   try {
//     const sig = req.headers['stripe-signature'];
//     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       console.log(`Webhook signature verification failed.`, err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle the event
//     switch (event.type) {
//       case 'payment_intent.succeeded':
//         const paymentIntent = event.data.object;
//         console.log('PaymentIntent was successful:', paymentIntent.id);
//         // You can add additional logic here if needed
//         break;
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     res.json({ received: true });
//   } catch (err) {
//     console.error('Webhook error:', err);
//     res.status(500).json({ message: 'Webhook error', error: err.message });
//   }
// };
