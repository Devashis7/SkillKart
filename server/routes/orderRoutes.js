
const express = require('express');
const router = express.Router();
const { 
  getStudentOrders, 
  getClientOrders, 
  getOrderById,
  updateOrderStatus, 
  uploadDelivery, 
  requestRevision, 
  createOrder,
  getAdminOrders,
  getOrderStats
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

// Create a new order (client books a gig)
router.post('/', auth, authorize(['client']), createOrder);

// Admin routes
router.get('/admin/all', auth, authorize(['admin']), getAdminOrders);
router.get('/admin/stats', auth, authorize(['admin']), getOrderStats);

// Get orders for a specific student (student owner or admin)
router.get('/student/:id', auth, authorize(['student', 'admin']), getStudentOrders);

// Get orders for a specific client (client owner or admin)
router.get('/client/:id', auth, authorize(['client', 'admin']), getClientOrders);

// Get specific order by ID (order participants or admin)
router.get('/:id', auth, getOrderById);

// Update order status (student, client, or admin based on transition rules)
router.patch('/:id/status', auth, updateOrderStatus);

// Student uploads delivery files
router.post('/:id/delivery', auth, authorize(['student']), upload.array('deliveryFiles', 5), uploadDelivery);

// Client requests revision
router.patch('/:id/request-revision', auth, authorize(['client']), requestRevision);

module.exports = router;
