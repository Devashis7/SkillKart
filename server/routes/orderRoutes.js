const express = require('express');
const { 
  getStudentOrders, 
  getClientOrders, 
  updateOrderStatus, 
  uploadDelivery, 
  requestRevision 
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();

// Get orders for a specific student (student owner or admin)
router.get('/student/:id', auth, authorize(['student', 'admin']), getStudentOrders);

// Get orders for a specific client (client owner or admin)
router.get('/client/:id', auth, authorize(['client', 'admin']), getClientOrders);

// Update order status (student, client, or admin based on transition rules)
router.patch('/:id/status', auth, updateOrderStatus);

// Student uploads delivery files
router.post('/:id/delivery', auth, authorize(['student']), uploadDelivery);

// Client requests revision
router.patch('/:id/request-revision', auth, authorize(['client']), requestRevision);

module.exports = router;
