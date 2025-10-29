# Deployment Guide – SkillKart (Vercel + Render)

This guide walks you through deploying the SkillKart MERN application:
- **Frontend (React/Vite)** → Vercel
- **Backend (Express API)** → Render

## Prerequisites

Before deploying, ensure you have:
- GitHub repository with your code pushed
- MongoDB Atlas database URL
- Stripe account (test mode is fine)
- Cloudinary account credentials
- SMTP credentials (Gmail recommended for development)

## Architecture Overview

```
Client (Vercel)  ←→  API (Render)  ←→  MongoDB Atlas
                           ↓
                     Stripe, Cloudinary, SMTP
```

---

## Part 1: Deploy Backend to Render

### Option A: One-Click Deploy (Recommended)

1. **Push render.yaml to your repo** (already included in root)
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo
5. Render will detect `render.yaml` and create the service
6. **Fill in environment variables** when prompted:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `CLIENT_URL`: Your Vercel app URL (get this after Vercel deploy, then update)
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (sk_test_...)
   - `CLOUDINARY_CLOUD_NAME`: From Cloudinary dashboard
   - `CLOUDINARY_API_KEY`: From Cloudinary dashboard
   - `CLOUDINARY_API_SECRET`: From Cloudinary dashboard
   - `SMTP_EMAIL`: Your Gmail address
   - `SMTP_PASSWORD`: Gmail app password (see [Gmail App Passwords](https://support.google.com/accounts/answer/185833))
7. Click **Apply** and wait for deployment

### Option B: Manual Deploy

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `skillkart-api` (or your choice)
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
5. **Environment Variables** – Add these:

```
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillkart?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-random-string-min-32-chars
CLIENT_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

6. Click **Create Web Service**
7. Wait for deployment (3-5 minutes)
8. **Copy your Render service URL** (e.g., `https://skillkart-api.onrender.com`)

### Verify Backend Deployment

Test your API:
```bash
# Root endpoint
curl https://your-render-url.onrender.com/

# Should return: {"service":"SkillKart API","status":"OK"}

# API endpoint
curl https://your-render-url.onrender.com/api/auth/me

# Should return 401 (auth required) - this is expected
```

---

## Part 2: Deploy Frontend to Vercel

### Step-by-Step

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. **Import your GitHub repository**
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
5. **Environment Variables** – Add these:

```
VITE_API_BASE_URL=https://your-render-url.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

6. Click **Deploy**
7. Wait for deployment (~2 minutes)
8. **Copy your Vercel app URL** (e.g., `https://skillkart.vercel.app`)

### Configure SPA Routing

The `client/vercel.json` file is already configured to handle client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This ensures routes like `/profile` or `/orders/123` work on direct access.

---

## Part 3: Connect Frontend ↔ Backend

### Update Backend with Frontend URL

1. Go to your **Render Dashboard** → Your service
2. Navigate to **Environment** tab
3. Update `CLIENT_URL` to your Vercel URL:
   ```
   CLIENT_URL=https://skillkart.vercel.app
   ```
4. Save and wait for auto-redeploy

### Verify CORS Configuration

Your `server/app.js` already handles CORS:

```javascript
const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  credentials: true
};
```

---

## Part 4: Test Deployment

### Essential Flow Tests

1. **Authentication**
   - Register a new user
   - Login
   - Check profile page

2. **Gig Creation** (Student)
   - Create a new gig
   - Upload portfolio files
   - Wait for admin approval (use admin account)

3. **Gig Booking** (Client)
   - Browse approved gigs
   - Book a gig
   - Complete Stripe payment (test card: `4242 4242 4242 4242`)
   - Verify order creation

4. **Order Flow**
   - Student accepts order
   - Student uploads delivery
   - Client reviews delivery
   - Both leave reviews

5. **Password Reset**
   - Click "Forgot Password"
   - Check email for OTP
   - Reset password
   - Login with new password

### Stripe Test Cards

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`
- CVV: Any 3 digits
- Expiry: Any future date

---

## Part 5: Environment-Specific Configuration

### Production Environment Variables

**Render (Backend)**
```env
# Required
MONGO_URI=<production MongoDB Atlas URI>
JWT_SECRET=<strong random string, min 32 chars>
CLIENT_URL=<your Vercel production URL>
STRIPE_SECRET_KEY=<Stripe live key for production or test for staging>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your API key>
CLOUDINARY_API_SECRET=<your API secret>

# SMTP (consider using SendGrid/Mailgun for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=<your email>
SMTP_PASSWORD=<app password>
```

**Vercel (Frontend)**
```env
VITE_API_BASE_URL=<your Render API URL>/api
VITE_STRIPE_PUBLISHABLE_KEY=<Stripe publishable key>
```

### Preview Deployments

Vercel automatically creates preview deployments for PRs. To connect them to your backend:

1. **Option A**: Use the same production Render URL (simple, but mixes data)
2. **Option B**: Create a staging Render service with separate DB

---

## Part 6: Monitoring & Logs

### Render Logs

1. Dashboard → Your service → **Logs** tab
2. View real-time logs
3. Filter by log level (info, error, warn)

### Vercel Logs

1. Dashboard → Your project → **Deployments**
2. Click on a deployment → **Functions** tab
3. View build and runtime logs

---

## Troubleshooting

### CORS Errors

**Symptom**: `Access-Control-Allow-Origin` error in browser console

**Fix**:
1. Verify `CLIENT_URL` in Render matches your Vercel URL exactly
2. Ensure URL includes `https://` (no trailing slash)
3. Redeploy backend after changing env vars

### API 404 from Frontend

**Symptom**: All API calls return 404

**Fix**:
1. Check `VITE_API_BASE_URL` includes `/api` suffix
2. Verify Render service is running (check Render dashboard)
3. Test API directly: `curl https://your-render-url.onrender.com/api`
4. Redeploy Vercel after changing env vars

### SPA Routes 404 on Vercel

**Symptom**: Direct navigation to `/profile` returns 404

**Fix**:
1. Ensure `client/vercel.json` exists with rewrites
2. Verify Root Directory is set to `client` in Vercel project settings
3. Redeploy

### Stripe Payment Errors

**Symptom**: Payment fails or doesn't create order

**Fix**:
1. Use Stripe test keys (not live keys) for testing
2. Check Stripe dashboard for error details
3. Verify `STRIPE_SECRET_KEY` in Render and `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel
4. Check browser console and Render logs

### MongoDB Connection Issues

**Symptom**: Backend logs show "DB Connection Error"

**Fix**:
1. Verify `MONGO_URI` is correct
2. Check MongoDB Atlas whitelist (allow connections from `0.0.0.0/0` for Render)
3. Ensure database user has read/write permissions

### Email OTP Not Received

**Symptom**: Password reset OTP doesn't arrive

**Fix**:
1. Check spam folder
2. Verify `SMTP_EMAIL` and `SMTP_PASSWORD` are correct
3. For Gmail, use [App Password](https://support.google.com/accounts/answer/185833), not regular password
4. Check Render logs for email sending errors

### Slow First Load (Cold Start)

**Symptom**: First request to Render takes 30+ seconds

**Explanation**: Render free tier spins down after inactivity

**Workarounds**:
1. Upgrade to paid plan (no cold starts)
2. Use a ping service (e.g., UptimeRobot) to keep service warm
3. Accept the delay for free tier

---

## Part 7: Production Hardening (Optional)

### Enable Stripe Webhooks

1. Uncomment webhook route in `server/routes/payment.js`
2. Get webhook secret from Stripe dashboard
3. Add `STRIPE_WEBHOOK_SECRET` to Render env vars
4. Configure webhook URL in Stripe: `https://your-render-url.onrender.com/api/payment/webhook`

### Rate Limiting

Add rate limiting for OTP endpoints:

```bash
cd server
npm install express-rate-limit
```

### Database Indexes

Ensure indexes exist for common queries (already configured in models).

### Security Headers

Helmet is already configured in `server/app.js`.

### Monitoring

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Datadog/New Relic for APM

---

## Part 8: Custom Domains (Optional)

### Vercel Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `skillkart.com`)
3. Configure DNS records as instructed
4. Update `CLIENT_URL` in Render to new domain

### Render Custom Domain

1. Render Dashboard → Service → Settings → Custom Domains
2. Add your API subdomain (e.g., `api.skillkart.com`)
3. Configure DNS CNAME record
4. Update `VITE_API_BASE_URL` in Vercel to new domain

---

## Quick Reference

| Service | What | URL Pattern | Env Vars |
|---------|------|-------------|----------|
| Render | Express API | `https://[service].onrender.com` | MONGO_URI, JWT_SECRET, CLIENT_URL, STRIPE_SECRET_KEY, Cloudinary, SMTP |
| Vercel | React SPA | `https://[project].vercel.app` | VITE_API_BASE_URL, VITE_STRIPE_PUBLISHABLE_KEY |

### Deployment Checklist

- [ ] MongoDB Atlas database created and accessible
- [ ] Stripe account with test keys ready
- [ ] Cloudinary credentials obtained
- [ ] Gmail app password created
- [ ] Backend deployed to Render
- [ ] Backend environment variables configured
- [ ] Backend API tested (curl)
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables configured
- [ ] CORS configured (CLIENT_URL updated)
- [ ] End-to-end flow tested (register → gig → order → payment → review)
- [ ] Password reset tested (OTP email received)

---

## Support

If you encounter issues:

1. Check Render logs (Dashboard → Logs)
2. Check Vercel deployment logs
3. Check browser console for frontend errors
4. Review this guide's troubleshooting section
5. Verify all environment variables are set correctly

---

**Last Updated**: October 29, 2025
