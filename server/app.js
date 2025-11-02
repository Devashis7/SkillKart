const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/payment');
const gigRoutes = require('./routes/gigRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // Import notification routes
const contactRoutes = require('./routes/contactRoutes'); // Import contact routes

const app = express();

// CORS configuration - allow both common dev ports and environment variable
const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    'https://skill-kart-topaz.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes); // Use notification routes
app.use('/api/contact', contactRoutes); // Use contact routes

app.get('/', (req, res) => res.json({ service: 'SkillKart API', status: 'OK' }));

module.exports = app;
