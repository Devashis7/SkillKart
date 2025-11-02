# SkillKart – Student Freelancing Marketplace (MERN)

SkillKart is a full‑stack freelancing platform that connects student freelancers with clients (peers, faculty, startups). Students can publish gigs, get booked, deliver work, and get paid. Clients can browse approved gigs, pay securely via Stripe, and review the work. Admins moderate gigs and oversee disputes.

> Monorepo: React + Vite + Tailwind (client) and Express + MongoDB + Mongoose (server). Run both with one command.

## Highlights

- Three roles and flows
	- Students: create gigs → await admin approval → accept orders → deliver → get reviewed
	- Clients: browse gigs → book via Stripe → track order → review delivery
	- Admins: approve/reject gigs → manage users → oversee orders and notifications
- Secure auth with JWT (30d) and role-based access
- Payments with Stripe Checkout and post-payment order creation
- Order lifecycle with status machine: booked → accepted → in_progress → in_review → completed (plus revision_requested, cancelled)
- Bidirectional reviews (client ↔ student) and per-role ratings on profiles
- File uploads to Cloudinary (profile pics, portfolio, order delivery files)
- OTP-based password reset via email (SMTP)
- CORS, Helmet, and logging (morgan) enabled by default

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS
- Backend: Node.js, Express 5, Mongoose 8
- Database: MongoDB Atlas
- Auth: JWT (Bearer)
- Payments: Stripe Checkout
- File Storage: Cloudinary via multer-storage-cloudinary
- Email: Nodemailer (Gmail SMTP in dev)

## Repository Structure

```
skillkart-mern/
├── client/                    # React + Vite SPA
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Context providers
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Route-based pages
│   │   ├── services/          # API client
│   │   └── utils/
│   └── vite.config.js
├── server/                    # Express API
│   ├── config/                # Cloudinary and other config
│   ├── controllers/           # Route handlers & business logic
│   ├── middleware/            # auth, authorize, upload
│   ├── models/                # Mongoose schemas (User, Gig, Order, Review, Notification)
│   ├── routes/                # Express routes (auth, users, gigs, orders, reviews, payment, notifications, contact)
│   ├── app.js                 # Express app & middleware stack
│   └── server.js              # Mongo connection & server start
├── ORDER_MANAGEMENT_ANALYSIS.md
├── STRIPE_INTEGRATION.md
├── Testing.md
└── package.json               # Root scripts (concurrently)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A MongoDB Atlas database (or local MongoDB)
- Stripe account (test mode is fine)
- Cloudinary account
- An SMTP provider for email (Gmail SMTP recommended for dev)

### 1) Clone and install

```bash
git clone https://github.com/Devashis7/SkillKart.git
cd skillkart-mern

# Install root tools (concurrently)
npm install

# Install backend deps
cd server && npm install

# Install frontend deps
cd ../client && npm install
```

### 2) Environment variables

Create a `.env` file in `server/` with:

```env
# Server
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

# CORS (client origin)
CLIENT_URL=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
# Optional when enabling webhooks later
# STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (Gmail SMTP in dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

Create a `.env` file in `client/` with:

```env
# Client
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 3) Run in development

From the repo root:

```bash
# Runs both servers (Express on 5000, Vite on 5173)
npm run dev
```

Individual apps:

```bash
# Backend only
npm run server

# Frontend only
npm run client
```

Once running:
- API: http://localhost:5000/api
- Web: http://localhost:5173

## Deployment

Deploy to production in minutes:
- **Frontend** → Vercel (automatic builds from GitHub)
- **Backend** → Render (one-click deploy with render.yaml)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete step-by-step instructions including:
- Environment variable setup for production
- One-click Render deployment via Blueprint
- Vercel project configuration
- CORS and domain setup
- Troubleshooting common deployment issues

Quick links:
- [Deploy to Render](https://dashboard.render.com/select-repo?type=blueprint)
- [Deploy to Vercel](https://vercel.com/new)

## Core Concepts

### Order lifecycle

```
booked → accepted → in_progress → in_review → completed
					 ↘ revision_requested ↗
cancelled (terminal)
```

Each order stores: price, deadlines, requestedRevisionCount, paymentId, and status history via updates.

### Gig approval workflow

- Student creates gig → status: pending
- Admin approves/rejects
- Only approved gigs appear in public browse/search

### Authentication

- JWT issued on login/register, stored client-side, attached as `Authorization: Bearer <token>`
- Protected routes use auth middleware in `server/middleware/auth.js`

### File uploads

- Cloudinary integration via `multer-storage-cloudinary`
- Profile pictures, gig portfolio files, and order deliveries follow the same upload pattern

## API Overview

Base URL: `http://localhost:5000/api`

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/request-reset`, `POST /auth/reset-password`
- Users: `GET /users/:id`, `PUT /users/update`, `POST /users/upload-profile-pic` (multipart), admin search/suspend
- Gigs: `POST /gigs`, `GET /gigs`, `GET /gigs/:id`, `PUT /gigs/:id`, `PATCH /gigs/:id/status` (admin)
- Orders: `POST /orders`, `GET /orders/student/:id`, `GET /orders/client/:id`, `GET /orders/:id`, `PATCH /orders/:id/status`, `POST /orders/:id/delivery`, `PATCH /orders/:id/request-revision`
- Reviews: `POST /reviews` (client→student), `POST /reviews/client` (student→client), `GET /reviews/gig/:id`, `GET /reviews/for-student/:id`, `GET /reviews/for-client/:id`
- Payments (Stripe): `POST /payment/checkout`, `POST /payment/confirm-payment`
- Notifications: `GET /notifications`, `PATCH /notifications/:id/read` (plus admin endpoints)
- Contact: `POST /contact`, `GET /contact/received`, `PATCH /contact/:id/read`

More details in:

- `STRIPE_INTEGRATION.md` – end-to-end flow and field mapping
- `ORDER_MANAGEMENT_ANALYSIS.md` – lifecycle, edge cases and status machine
- `Testing.md` – manual testing checklists and tips

## Screenshots / Demo

Add screenshots or a short demo GIF here (Home, Browse Gigs, Gig Details, Checkout, Order, Profile, Admin).

## Testing

- Server has Jest + Supertest deps available; you can add tests under `server/`.
- Manual testing flows are documented in `Testing.md` (auth, gig creation, checkout, orders, reviews, OTP reset).

## Troubleshooting

- CORS blocked: ensure `CLIENT_URL` matches the Vite origin (http://localhost:5173) and that the server is on 5000.
- Invalid OTP: verify Gmail SMTP envs and that `otp` fields are selected in controller (already handled in code).
- Stripe errors: confirm `STRIPE_SECRET_KEY` and that the publishable key is set on the client; use Stripe test cards.
- Cloudinary upload fails: check cloud name/api key/secret; ensure multipart routes use the upload middleware.
- Port already in use: change `PORT` or stop the process using 5000/5173.

## Roadmap (Next up)

- Quick Accept action for orders
- OTP rate limiting and resend cooldown
- Stripe webhook verification and idempotency keys
- Notifications UI (unread count, mark-as-read), pagination for reviews

## Contributing

1. Fork the repo and create a topic branch
2. Run the app locally and add your changes with tests where relevant
3. Open a PR with a clear description and screenshots for UI changes

## License

ISC — see `package.json`.

---

Made with ❤️ by the SkillKart team. If you have questions or feature ideas, please open an issue.
