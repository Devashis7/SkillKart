# SkillKart - AI Coding Agent Instructions

## Project Overview
SkillKart is a MERN stack freelancing platform connecting student freelancers with clients (peers, faculty, startups). It's a complete marketplace with gig management, order lifecycle, payments (Razorpay), reviews, and admin moderation.

## Architecture & Organization

### Three Core User Roles & Flows
- **Students** (Freelancers): Create gigs → await approval → deliver work → get reviewed
- **Clients** (Buyers): Browse gigs → book with instructions → pay (Razorpay) → review delivery
- **Admins**: Approve/reject gigs → manage users → oversee order disputes

### Monorepo Structure
```
skillkart-mern/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/          # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Route-based page components
│   │   ├── services/         # API service functions
│   │   └── utils/            # Helper functions
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── vite.config.js        # Vite build configuration
├── server/                   # Express.js backend
│   ├── config/               # Configuration files (Cloudinary, etc.)
│   ├── controllers/          # Route handlers & business logic
│   ├── middleware/           # Custom middleware (auth, upload, etc.)
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express route definitions
│   ├── utils/                # Backend utility functions
│   ├── app.js                # Express app configuration
│   └── server.js             # Server entry point & MongoDB connection
├── docs/                     # Documentation files
├── scripts/                  # Build/deployment scripts
├── shared/                   # Shared utilities between client/server
└── package.json              # Root scripts with concurrently
```

- **Root**: Development scripts with `concurrently` for parallel client/server
- **`server/`**: Express.js API with MongoDB/Mongoose
- **`client/`**: React + Vite + Tailwind CSS SPA
- **Development**: Run `npm run dev` from root to start both frontend/backend

### Backend Patterns (`server/`)
- **Entry Point**: `server.js` → `app.js` (separation of server config from Express app)
- **Structure**: Feature-based organization
  - `controllers/` - Route handlers & business logic (authController.js, userController.js)
  - `models/` - Mongoose schemas (User.js, future: Gig.js, Order.js)
  - `routes/` - Express route definitions (auth.js, userRoutes.js)
  - `middleware/` - Custom middleware (auth.js, upload.js)
  - `config/` - Configuration files (cloudinary.js, database config)
  - `utils/` - Backend utility functions
- **Authentication**: JWT-based with Bearer tokens, middleware in `middleware/auth.js`
- **File Uploads**: Cloudinary integration via `multer-storage-cloudinary` in `middleware/upload.js`
- **User Model**: Mongoose schema with role-based access (`student`, `client`, `admin`)
- **API Structure**: RESTful endpoints under `/api` prefix (`/api/auth`, `/api/users`, `/api/gigs`, `/api/orders`)

### Current Implementation Status
**✅ Completed Features:**
- User authentication (register/login/me) with JWT and bcrypt password hashing
- User profile management with public/protected routes
- File uploads with Cloudinary integration (profile pictures tested via Postman)
- MongoDB Atlas connection with `skillkart` database
- Core middleware stack (CORS, Helmet, Morgan) configured

**🔄 Next Implementation Priority:**
- Gig model and CRUD operations with file upload capabilities
- Order management system with payment integration
- Admin approval workflows for gig moderation

### Frontend Patterns (`client/`)
- **React 19** with Vite build system
- **Styling**: Tailwind CSS v4+ (note: empty config suggests default setup)
- **Structure**: Feature-based organization
  - `components/` - Reusable UI components
  - `pages/` - Route-based page components (HomePage, LoginPage, CreateGigPage, etc.)
  - `context/` - React Context for global state management
  - `hooks/` - Custom React hooks for shared logic
  - `services/` - API service functions for backend communication
  - `utils/` - Frontend utility functions
- **Dev Server**: Vite HMR on port 3000 (default)

## Key Development Patterns

### Order Status Flow (Critical Business Logic)
```javascript
// Order lifecycle: booked → accepted → in_progress → in_review → completed
// Alternative paths: revision_requested, cancelled
// Track: requestedRevisionCount, deadlines, paymentId
```

### Authentication Flow
```javascript
// JWT generation in authController.js
const generateToken = userId => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Middleware pattern for protected routes
router.get('/me', auth, getMe); // auth middleware first
```

### Gig Approval Workflow
- **Student creates** → status: `pending`
- **Admin reviews** → status: `approved` (visible) or `rejected`
- **Public browsing** → only `approved` gigs shown

### Payment Integration (Razorpay)
- **Checkout**: `POST /api/payment/checkout` → create Razorpay order
- **Verification**: `POST /api/payment/verify` → verify payment → create Order with `booked` status
- **Test Mode**: Use Razorpay test credentials in development

### File Upload Integration
- **Cloudinary**: Pre-configured storage in `config/cloudinary.js`
- **Upload Pattern**: `upload.single('profilePic')` middleware → Cloudinary metadata saved to User model
- **File Storage Structure**: `profilePic: { url: String, public_id: String }`
- **Tested Implementation**: Profile picture upload working via `POST /api/users/upload-profile-pic`
- **Future Extensions**: Gig portfolio files, order delivery files following same pattern

### User Management
- **Password Hashing**: Pre-save middleware with bcryptjs (10 rounds)
- **Password Comparison**: Instance method `user.comparePassword(candidate)`
- **Profile Updates**: Uses `findByIdAndUpdate` with `{ new: true }` option
- **Public vs Protected**: Public profile view (`GET /api/users/:id`) vs protected update (`PUT /api/users/update`)
- **File Upload**: Separate endpoint for profile picture with Cloudinary integration

### Error Handling Convention
```javascript
// Consistent error response pattern
res.status(500).json({ message: 'Operation failed', error: err.message });
```

## Development Workflows

### Local Development
```bash
npm run dev          # Start both client & server concurrently
npm run client       # Frontend only (Vite dev server)
npm run server       # Backend only (nodemon server.js)
```

### Environment Configuration
- **Server**: Requires `.env` with `MONGO_URI`, `JWT_SECRET`, Cloudinary credentials
- **Client**: Environment variables prefixed with `VITE_` for build-time access

### Database Integration
- **Connection**: Direct async/await in `server.js` with graceful error handling
- **Models**: Mongoose schemas in `models/` directory
- **Validation**: Express-validator middleware for input validation
- **Database**: MongoDB Atlas with `skillkart` database name
- **Testing**: Profile picture upload tested successfully via Postman

## API Conventions & Contract

### Authentication & Authorization
- `POST /api/auth/register` - Req: `{ name, email, password, role }` - Res: `{ token, user }`
- `POST /api/auth/login` - Req: `{ email, password }` - Res: `{ token, user }`
- `POST /api/auth/google` - OAuth integration with `{ idToken }`
- `POST /api/auth/request-reset` - Email OTP for password reset
- `GET /api/auth/me` - Get current user via JWT

### User Management
- `GET /api/users/:id` - Public profile view
- `PUT /api/users/update` - Update profile (protected)
- `PATCH /api/users/:id/suspend` - Admin suspend user
- `GET /api/admin/users?search=&role=` - Admin user search/filter

### Gig Management
- `POST /api/gigs/` - Student creates gig (status: `pending`)
- `GET /api/gigs/` - Browse with filters (`q`, `category`, `priceMin/Max`, `deliveryTimeMax`, `ratingMin`)
- `PATCH /api/gigs/:id/status` - Admin approve/reject gigs
- `PUT /api/gigs/:id` - Student edit own gig

### Order Lifecycle
- `POST /api/orders/` - Create after Razorpay verification (status: `booked`)
- `GET /api/orders/student/:id` & `/api/orders/client/:id` - Role-based order views
- `PATCH /api/orders/:id/status` - Update order status through lifecycle
- `POST /api/orders/:id/delivery` - Student upload work (→ `in_review`)
- `PATCH /api/orders/:id/request-revision` - Client request changes

### Payment Integration (Razorpay)
- `POST /api/payment/checkout` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment → create Order with `booked` status

### Review System
- `POST /api/reviews/` - Create review (only after completed order)
- `GET /api/reviews/gig/:id` - List gig reviews

### Status Machines
```javascript
// Order: booked → accepted → in_progress → in_review → completed
// Alternative: revision_requested (loops back), cancelled (terminal)
// Gig: pending → approved/rejected (admin action)
```

## Security & Middleware Stack
- **helmet**: Security headers
- **morgan**: HTTP request logging
- **cors**: Cross-origin requests with credentials
- **JWT**: 30-day expiration, stored client-side
- **File Upload**: Cloudinary integration with multipart/form-data
- **CORS**: Configured for `process.env.CLIENT_URL` with credentials support

## Database Schema Patterns
```javascript
// User: role-based access (student, client, admin), password hashing, ratings
// Gig: approval workflow (pending → approved/rejected), category filtering
// Order: complex lifecycle, revision tracking, file delivery
// Review: post-completion only, affects gig and user ratings
// Notification: auto-generated for key events
```

When working on this codebase:
1. Follow the existing JWT + middleware pattern for new protected routes
2. Use Cloudinary integration pattern for any new file upload features
3. Maintain the controller → model → response pattern for API endpoints
4. Keep frontend organization by feature areas (components, pages, services)
5. Use the existing error response format for consistency