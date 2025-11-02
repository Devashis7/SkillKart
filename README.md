# 🚀 SkillKart - Student Freelancing Marketplace

A modern, full-stack freelancing platform designed specifically for students. Built with the MERN stack (MongoDB, Express.js, React, Node.js), this platform connects talented student freelancers with clients including peers, faculty, and startups. SkillKart offers a complete marketplace experience with gig management, secure payments, order lifecycle tracking, and admin moderation.

## 🌐 Live Demo

- **🖥️ Frontend (Vercel)**: [https://skill-kart-topaz.vercel.app](https://skill-kart-topaz.vercel.app)
- **⚡ Backend API (Render)**: [https://skillkart-api-5j34.onrender.com](https://skillkart-api-5j34.onrender.com)

> **Status**: ✅ **Fully Deployed & Operational**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-19.0.0-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-purple)](https://stripe.com/)

## ✨ Features

### 🎓 **Student Features (Freelancers)**
- **Profile Management**: Create detailed profiles with skills, portfolio, and ratings
- **Gig Creation**: Publish service offerings with descriptions, pricing, and delivery time
- **Order Management**: Accept orders, track progress, and deliver work
- **File Uploads**: Upload portfolio items and delivery files via Cloudinary
- **Earnings Tracking**: Monitor completed orders and payment history
- **Review System**: Build reputation through client reviews and ratings
- **Real-time Notifications**: Stay updated on orders, messages, and admin actions
- **Dashboard Analytics**: View performance metrics and order statistics

### 👨‍💼 **Client Features (Buyers)**
- **Gig Browsing**: Explore services with advanced filters (category, price, rating, delivery time)
- **Secure Checkout**: Pay safely using Stripe payment integration
- **Order Tracking**: Monitor order status through complete lifecycle
- **Direct Communication**: Contact freelancers before booking
- **Delivery Review**: Request revisions or approve completed work
- **Rating & Reviews**: Leave feedback for completed orders
- **Order History**: Track all past and current orders
- **Dispute Resolution**: Admin-mediated conflict resolution

### 👨‍💻 **Admin Features**
- **Gig Moderation**: Approve or reject student-created gigs
- **User Management**: Full CRUD operations for user accounts
- **Order Oversight**: Monitor and intervene in order disputes
- **Platform Analytics**: Real-time statistics and insights
- **Notification System**: Send platform-wide announcements
- **Content Moderation**: Ensure quality and appropriate listings
- **Suspension Controls**: Manage user account status

### 🎨 **Design & UX**
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Smooth Animations**: Framer Motion powered transitions
- **Dark/Light Mode**: Toggle between themes for comfortable browsing
- **Mobile-First**: Fully responsive design for all devices
- **Accessibility**: WCAG compliant with proper contrast ratios
- **Fast Performance**: Vite-powered development and optimized builds

## 🛠️ Technology Stack

### **Frontend (React Application)**
- **React 19** - Modern UI library with hooks and context
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router Dom** - Client-side routing
- **React Icons** - Comprehensive icon library
- **Axios** - HTTP client for API requests

### **Backend (Node.js API)**
- **Node.js** - JavaScript runtime environment
- **Express.js 5** - Fast, minimalist web framework
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Mongoose 8** - Elegant MongoDB object modeling
- **JSON Web Tokens** - Secure authentication (30-day expiration)
- **bcryptjs** - Password hashing and security
- **Stripe** - Payment processing integration
- **Cloudinary** - Cloud-based file storage
- **Nodemailer** - Email sending (OTP, notifications)

### **Security & Middleware**
- **Helmet** - Security headers
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing
- **JWT Authentication** - Role-based access control
- **Password Encryption** - bcrypt with salt rounds
- **File Upload Security** - Validated multipart/form-data

### **Development Tools**
- **ESLint** - Code quality enforcement
- **Nodemon** - Development auto-restart
- **Concurrently** - Run multiple scripts simultaneously
- **Git** - Version control

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher)
- **MongoDB Atlas Account** (for cloud database)
- **Stripe Account** (for payment processing)
- **Cloudinary Account** (for file storage)
- **Git** (for version control)

## 🚀 Quick Start

### **💻 Local Development Setup**

#### 1. **Clone the Repository**
```bash
git clone https://github.com/Devashis7/SkillKart.git
cd skillkart-mern
```

#### 2. **Install Dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

#### 3. **Environment Setup**

Create a `.env` file in the `server` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/skillkart?retryWrites=true&w=majority

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# CORS (Frontend URL)
CLIENT_URL=http://localhost:5173

# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Cloudinary File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```

Create a `.env` file in the `client` directory:
```env
# API Configuration
VITE_API_BASE_URL=https://skillkart-api-5j34.onrender.com/api

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

#### 4. **Start Development**
```bash
# From the root directory - starts both client and server
npm run dev

# Access the application:
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api
```

#### 5. **Alternative: Run Separately**
```bash
# Backend only (from root)
npm run server

# Frontend only (from root)
npm run client
```

## 📁 Project Structure

```
skillkart-mern/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── FilePreview.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── BrowseGigsPage.jsx
│   │   │   ├── GigDetailsPage.jsx
│   │   │   ├── CreateGigPage.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── ClientDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── OrderDetailsPage.jsx
│   │   ├── context/          # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service functions
│   │   │   └── api.js
│   │   └── utils/            # Helper functions
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
├── server/                   # Node.js backend application
│   ├── controllers/          # Request handlers & business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── gigController.js
│   │   ├── orderController.js
│   │   ├── reviewController.js
│   │   ├── paymentController.js
│   │   └── notificationController.js
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── Gig.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   └── Notification.js
│   ├── routes/              # API route definitions
│   │   ├── auth.js
│   │   ├── userRoutes.js
│   │   ├── gigRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── payment.js
│   │   └── notificationRoutes.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js         # JWT authentication
│   │   ├── authorize.js    # Role-based authorization
│   │   └── upload.js       # Cloudinary file upload
│   ├── config/             # Configuration files
│   │   └── cloudinary.js
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server entry point & MongoDB connection
│   └── package.json        # Backend dependencies
├── docs/                   # Documentation files
├── scripts/                # Utility scripts
├── DEPLOYMENT.md           # Deployment guide
├── STRIPE_INTEGRATION.md   # Stripe payment integration guide
├── ORDER_MANAGEMENT_ANALYSIS.md  # Order lifecycle documentation
├── Testing.md              # Testing guidelines
├── README.md               # Project documentation
└── package.json            # Root package configuration
```

## 🔧 Available Scripts

### **Root Level Scripts**
```bash
npm run dev          # Start both client and server concurrently
npm run client       # Start frontend only (Vite dev server)
npm run server       # Start backend only (Nodemon)
npm run build        # Build client for production
```

### **Client Scripts** (from client/ directory)
```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **Server Scripts** (from server/ directory)
```bash
npm start            # Start production server
npm run dev          # Start development server with Nodemon
```

## 🔐 Authentication & Authorization

The platform implements JWT-based authentication with role-based access control:

### **User Roles**
- **Students**: Can create gigs, accept orders, deliver work, and earn money
- **Clients**: Can browse gigs, place orders, request revisions, and leave reviews
- **Admins**: Full platform access including user management and gig moderation

### **Security Features**
- **JWT Tokens**: 30-day expiration with secure Bearer token authentication
- **Password Hashing**: bcrypt with 10 salt rounds
- **Protected Routes**: Middleware ensures authenticated access
- **Role-Based Access**: Authorization middleware restricts admin-only actions
- **Token Refresh**: Automatic token validation on each request

## 📊 Database Schema

### **User Model**
```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum ["student", "client", "admin"],
  profilePic: {
    url: String,
    public_id: String
  },
  bio: String,
  skills: [String],
  ratingAsStudent: Number,
  reviewCountAsStudent: Number,
  ratingAsClient: Number,
  reviewCountAsClient: Number,
  isActive: Boolean,
  otp: String,
  otpExpiry: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Gig Model**
```javascript
{
  title: String,
  description: String,
  category: String,
  price: Number,
  deliveryTime: Number (days),
  status: Enum ["pending", "approved", "rejected"],
  student: ObjectId (ref: User),
  portfolioFiles: [{
    url: String,
    public_id: String,
    fileType: String
  }],
  rating: Number,
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### **Order Model**
```javascript
{
  gig: ObjectId (ref: Gig),
  client: ObjectId (ref: User),
  student: ObjectId (ref: User),
  price: Number,
  status: Enum ["booked", "accepted", "in_progress", "in_review", 
                "completed", "cancelled", "revision_requested"],
  clientInstructions: String,
  deliveryFiles: [{
    url: String,
    public_id: String,
    fileType: String
  }],
  deliveryNote: String,
  requestedRevisionCount: Number,
  revisionNote: String,
  deadline: Date,
  completedAt: Date,
  paymentId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Review Model**
```javascript
{
  gig: ObjectId (ref: Gig),
  order: ObjectId (ref: Order),
  reviewer: ObjectId (ref: User),
  reviewee: ObjectId (ref: User),
  reviewType: Enum ["client_to_student", "student_to_client"],
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

### **Notification Model**
```javascript
{
  recipient: ObjectId (ref: User),
  type: Enum ["order_placed", "order_accepted", "delivery_submitted", 
              "revision_requested", "order_completed", "gig_approved", 
              "gig_rejected", "review_received"],
  message: String,
  relatedGig: ObjectId (ref: Gig),
  relatedOrder: ObjectId (ref: Order),
  isRead: Boolean,
  createdAt: Date
}
```

## 🔄 Order Lifecycle

The platform features a comprehensive order management system:

```
┌─────────────────────────────────────────────────────────────┐
│                    Order Status Flow                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  booked → accepted → in_progress → in_review → completed   │
│                          ↓              ↓                   │
│                    revision_requested  ← ┘                 │
│                                                             │
│  cancelled (can occur from booked, accepted, in_progress)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Order Statuses**
1. **booked**: Order placed and payment completed
2. **accepted**: Student accepted the order
3. **in_progress**: Work is being completed
4. **in_review**: Student submitted delivery, awaiting client review
5. **revision_requested**: Client requested changes
6. **completed**: Client approved delivery, payment released
7. **cancelled**: Order cancelled by either party or admin

## 💳 Payment Integration (Stripe)

### **Payment Flow**
1. Client selects a gig and provides requirements
2. Stripe Checkout session created with order details
3. Client completes payment on Stripe's secure page
4. Payment verification via Stripe API
5. Order created with `booked` status
6. Payment held until order completion
7. Funds released to student upon client approval

### **Test Payments**
Use Stripe test cards in development:
- **Success**: 4242 4242 4242 4242
- **Requires Authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 9995

See `STRIPE_INTEGRATION.md` for detailed integration guide.

## 🎨 Theme System

The platform features a comprehensive dark/light mode:

- **ThemeContext**: React Context for global theme management
- **LocalStorage**: Persists user's theme preference
- **Tailwind Dark Mode**: Class-based dark mode with `dark:` variants
- **Smooth Transitions**: Animated theme switching
- **System Preference**: Optionally respects OS theme settings

## 📧 Email System

Nodemailer integration for transactional emails:

- **OTP Password Reset**: Secure 6-digit OTP with expiration
- **Order Notifications**: Updates on order status changes
- **Gig Approval**: Notify students of moderation decisions
- **Contact Form**: Receive and respond to user inquiries

## 🧪 Testing

### **Manual Testing**
Comprehensive testing checklists available in `Testing.md`:
- Authentication flows (register, login, password reset)
- Gig creation and approval workflow
- Order placement and payment processing
- File upload functionality
- Review and rating system

### **Test Accounts**
Create test accounts for each role:
```bash
# Student account
POST /api/auth/register
{
  "name": "Test Student",
  "email": "student@test.com",
  "password": "password123",
  "role": "student"
}

# Client account
POST /api/auth/register
{
  "name": "Test Client",
  "email": "client@test.com",
  "password": "password123",
  "role": "client"
}
```

## 🚀 Deployment

### **Production Deployment**

#### **Frontend - Vercel**
1. Push code to GitHub repository
2. Import project in Vercel Dashboard
3. Configure environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-api.onrender.com/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
   ```
4. Deploy with automatic builds

#### **Backend - Render**
1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure build settings:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
4. Add environment variables (all from server/.env)
5. Deploy with Blueprint (render.yaml included)

#### **Database - MongoDB Atlas**
1. Create free cluster (512MB)
2. Configure network access (allow all IPs for production)
3. Create database user
4. Copy connection string to MONGO_URI

See `DEPLOYMENT.md` for complete deployment guide.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**
- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Test thoroughly before submitting PR
- Update documentation as needed
- Ensure responsive design for UI changes
- Add comments for complex logic

## 🐛 Troubleshooting

### **Common Issues & Solutions**

#### **CORS Errors**
```bash
# Ensure CLIENT_URL in server/.env matches frontend URL
CLIENT_URL=http://localhost:5173

# In production, set to your Vercel domain
CLIENT_URL=https://skill-kart-topaz.vercel.app
```

#### **Authentication Issues**
- Clear browser localStorage and cookies
- Verify JWT_SECRET is set in server/.env
- Check token expiration (30 days)
- Ensure Authorization header format: `Bearer <token>`

#### **Stripe Payment Failures**
- Verify STRIPE_SECRET_KEY is correct
- Use test cards in development mode
- Check Stripe dashboard for error logs
- Ensure CLIENT_URL matches for redirect

#### **File Upload Problems**
- Verify Cloudinary credentials
- Check file size limits (default 5MB)
- Ensure multipart/form-data header
- Verify upload middleware is applied to routes

#### **MongoDB Connection Issues**
- Check MONGO_URI format and credentials
- Verify MongoDB Atlas network access settings
- Ensure database name is correct
- Check for IP whitelist restrictions

#### **Email Not Sending**
- For Gmail: Use App Password, not regular password
- Enable "Less secure app access" if needed
- Check SMTP settings (host, port, credentials)
- Verify email exists in logs but not delivered (spam folder)

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md)** - Payment integration details
- **[ORDER_MANAGEMENT_ANALYSIS.md](./ORDER_MANAGEMENT_ANALYSIS.md)** - Order lifecycle documentation
- **[Testing.md](./Testing.md)** - Manual testing guidelines

## 🗺️ Roadmap

### **Completed Features** ✅
- User authentication with JWT
- Profile management with file uploads
- Gig creation and moderation
- Order management system
- Stripe payment integration
- Review and rating system
- Admin dashboard
- Email notifications
- Dark/light mode

### **In Progress** 🔨
- Real-time chat system
- Advanced search filters
- User verification badges
- Mobile app development

### **Planned Features** 📋
- Stripe webhook integration
- Automated testing suite
- Analytics dashboard
- Referral program
- Multi-language support
- Advanced reporting
- Wallet system
- Subscription plans

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Devashis7**
- GitHub: [@Devashis7](https://github.com/Devashis7)
- Project: [SkillKart](https://github.com/Devashis7/SkillKart)

**Team Members:**
- **Devashis Kumar** - Full Stack Developer
- **Akshay Kumar** - Backend Developer
- **Rishikesh Kumar** - Frontend Developer

## 🙏 Acknowledgments

- **MERN Stack Community** - For excellent documentation and support
- **Stripe** - For comprehensive payment integration
- **Cloudinary** - For reliable file storage solution
- **MongoDB Atlas** - For scalable database hosting
- **TailwindCSS** - For beautiful utility-first CSS
- **Framer Motion** - For smooth animations
- **Open Source Community** - For inspiration and tools

## 📞 Support

If you encounter any issues or have questions:

1. **📖 Check the documentation** in the `/docs` folder
2. **🔍 Search existing issues** on GitHub
3. **🐛 Create a new issue** with detailed information
4. **💬 Join discussions** for community support

### **Quick Links**
- **📊 GitHub Repository**: [github.com/Devashis7/SkillKart](https://github.com/Devashis7/SkillKart)
- **📧 Contact**: Open an issue on GitHub
- **📚 Documentation**: See `/docs` folder

---

⭐ **Star this repository** if you find it helpful!

🐛 **Found a bug?** Please open an issue with details.

💡 **Have ideas?** We'd love to hear your suggestions!

---

**Built with ❤️ for the student freelancing community**

*Empowering students to monetize their skills and connecting clients with talented young professionals.*
