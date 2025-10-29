const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create Stripe Checkout Session for checkout
exports.checkout = async (req, res) => {
  try {
    const { amount, gigId, instructions, deadline, contactInfo } = req.body;

    // Validate required fields
    if (!amount || !gigId) {
      return res.status(400).json({ message: 'Amount and gigId are required' });
    }

    // Verify gig exists and is approved
    const gig = await Gig.findById(gigId).populate('studentId', 'name');
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'approved') {
      return res.status(400).json({ message: 'Gig is not approved for purchase' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: gig.title,
              description: `Freelance service by ${gig.studentId?.name || 'Student'}`,
            },
            unit_amount: amount * 100, // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/gig/${gigId}`,
      metadata: {
        gigId: gigId,
        clientId: req.user._id.toString(),
        studentId: gig.studentId._id.toString(),
        instructions: instructions || '',
        deadline: deadline || '',
        contactInfo: contactInfo || '',
      },
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ message: 'Payment checkout error', error: err.message });
  }
};

// Confirm payment and create order after successful Stripe payment
exports.confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Extract metadata
    const { gigId, clientId, studentId, instructions, deadline, contactInfo } = session.metadata;

    // Verify gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if order already exists for this session (prevent duplicate orders)
    const existingOrder = await Order.findOne({ paymentId: sessionId });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: 'Order already exists',
        order: existingOrder,
      });
    }

    // Calculate deadline
    const orderDeadline = deadline && deadline !== '' 
      ? new Date(deadline) 
      : new Date(Date.now() + gig.deliveryTime * 24 * 60 * 60 * 1000);

    // Create the order in your database
    const newOrder = await Order.create({
      gigId,
      clientId,
      studentId,
      instructions: instructions || '',
      price: session.amount_total / 100, // Convert back from paise
      deadline: orderDeadline,
      paymentId: sessionId,
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
