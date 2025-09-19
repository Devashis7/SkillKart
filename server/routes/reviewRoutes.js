const express = require('express');
const { 
  createReview, 
  updateReview, 
  deleteReview, 
  getGigReviews 
} = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();

// Public route to get reviews for a specific gig
router.get('/gig/:id', getGigReviews);

// Client routes (requires auth and client role)
router.post('/', auth, authorize(['client']), createReview);
router.put('/:id', auth, authorize(['client']), updateReview);
router.delete('/:id', auth, authorize(['client', 'admin']), deleteReview); // Client owner or Admin can delete

module.exports = router;
