const express = require('express');
const { 
  createContactRequest, 
  getReceivedContactRequests, 
  markContactRequestAsRead 
} = require('../controllers/contactController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();

// Client routes (require client role)
router.post('/', auth, authorize(['client']), createContactRequest);

// Freelancer routes (require student role)
router.get('/received', auth, authorize(['student']), getReceivedContactRequests);
router.patch('/:id/read', auth, authorize(['student']), markContactRequestAsRead);

// Admin routes (require admin role)
router.get('/admin/all', auth, authorize(['admin']), require('../controllers/contactController').getAllContactRequests);

module.exports = router;