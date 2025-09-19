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

module.exports = router;
