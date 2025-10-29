const express = require('express');
const { 
  getNotifications, 
  markNotificationAsRead 
} = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const router = express.Router();

// Get notifications for the logged-in user
router.get('/', auth, getNotifications);

// Mark a specific notification as read
router.patch('/:id/read', auth, markNotificationAsRead);

// Admin routes (require admin role)
const authorize = require('../middleware/authorize');
router.get('/admin/all', auth, authorize(['admin']), require('../controllers/notificationController').getAllNotifications);
router.get('/admin/stats', auth, authorize(['admin']), require('../controllers/notificationController').getNotificationStats);
router.patch('/admin/:id/read', auth, authorize(['admin']), require('../controllers/notificationController').markNotificationAsReadAdmin);

module.exports = router;
