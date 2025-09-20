const express = require('express');
const { checkout, confirmPayment } = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const router = express.Router();

// Create payment intent for checkout
router.post('/checkout', auth, checkout);

// Confirm payment and create order
router.post('/confirm-payment', auth, confirmPayment);

// Webhook endpoint for Stripe events (commented out for testing without webhook secret)
// router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
