# Stripe Payment Integration Guide

## Overview
The SkillKart platform now uses **Stripe Checkout Sessions** for secure payment processing when booking gigs.

## How It Works

### Payment Flow:
1. **Client fills booking form** → Instructions, deadline, contact info
2. **Click "Pay & Book Now"** → Creates Stripe Checkout Session
3. **Redirect to Stripe** → Secure payment gateway (hosted by Stripe)
4. **Enter card details** → Test cards work in development mode
5. **Payment success** → Redirected back to `/payment-success`
6. **Order created** → Student gets notification, order status = "booked"

## Setup Instructions

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create account or login
3. Navigate to **Developers** → **API Keys**
4. Copy your keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### 2. Configure Environment Variables

Add to your `server/.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
CLIENT_URL=http://localhost:5173
```

**Note:** The `CLIENT_URL` is used for redirect URLs (success/cancel pages)

### 3. Test Cards (Development Mode)

Use these test card numbers in Stripe Checkout:

| Card Number | Brand | Test Scenario |
|------------|-------|---------------|
| `4242 4242 4242 4242` | Visa | Success |
| `4000 0025 0000 3155` | Visa | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Visa | Payment declined |

**Card Details for Testing:**
- **Expiry:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

### 4. Important URLs

The integration uses these endpoints:

**Backend:**
- `POST /api/payment/checkout` - Creates Stripe Checkout Session
- `POST /api/payment/confirm-payment` - Confirms payment and creates order

**Frontend:**
- `/payment-success?session_id=...` - Success page after payment

**Stripe Redirects (configured in backend):**
- Success: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`
- Cancel: `http://localhost:5173/gig/{gigId}`

## Features Implemented

### ✅ Stripe Checkout Session
- Hosted payment page (PCI compliant)
- Automatic card validation
- Support for all payment methods enabled in Stripe
- Mobile responsive
- Internationalization support

### ✅ Order Creation
- Creates order only after successful payment
- Prevents duplicate orders (checks existing paymentId)
- Stores metadata: instructions, deadline, contact info
- Notifies student about new order

### ✅ Payment Success Page
- Shows processing state while confirming payment
- Displays order details after creation
- Auto-redirects to client dashboard
- Error handling for failed confirmations

## Metadata Stored in Stripe

The following data is attached to each Stripe session:

```javascript
{
  gigId: "...",
  clientId: "...", 
  studentId: "...",
  instructions: "...",
  deadline: "...",
  contactInfo: "..."
}
```

This metadata is retrieved after payment to create the order.

## Security Features

1. **JWT Authentication** - All API calls require valid auth token
2. **Role Verification** - Only clients can book gigs
3. **Gig Validation** - Verifies gig exists and is approved
4. **Payment Verification** - Confirms payment status from Stripe
5. **Duplicate Prevention** - Checks for existing orders with same payment ID

## Troubleshooting

### Error: "Amount and gigId are required"
- Check that booking form includes gig price and ID
- Verify API request payload

### Error: "Payment not completed"
- Payment was cancelled or failed in Stripe
- Check Stripe dashboard for payment status

### Redirect not working
- Verify `CLIENT_URL` in `.env` matches your frontend URL
- Check browser console for errors

### Order not created after payment
- Check backend logs for errors
- Verify Stripe session ID in URL
- Ensure database connection is active

## Production Checklist

Before going live:

- [ ] Replace test API keys with live keys (`sk_live_...`, `pk_live_...`)
- [ ] Update `CLIENT_URL` to production domain
- [ ] Set up Stripe webhooks for production (optional but recommended)
- [ ] Test with real card (small amount)
- [ ] Enable additional payment methods (UPI, wallets, etc.)
- [ ] Configure email receipts in Stripe settings
- [ ] Add dispute handling workflow
- [ ] Implement refund functionality

## Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/checkout)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe API Reference](https://stripe.com/docs/api)

## Support

For issues related to:
- **Stripe integration:** Check Stripe logs in dashboard
- **Payment failures:** Contact Stripe support
- **Order creation:** Check backend logs and database

---

**Last Updated:** October 28, 2025
