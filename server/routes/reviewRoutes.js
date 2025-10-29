const express = require('express');
const { 
  createReview,
  createClientReview,
  updateReview, 
  deleteReview, 
  getGigReviews,
  getClientReviews,
  getStudentReviews,
  getReviewsForStudent,
  getReviewsForClient
} = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();

// Public route to get reviews for a specific gig
router.get('/gig/:id', getGigReviews);

// Public routes to get reviews RECEIVED by users
router.get('/for-student/:id', getReviewsForStudent);
router.get('/for-client/:id', getReviewsForClient);

// Get client reviews (reviews written by client)
router.get('/client/:id', auth, getClientReviews);

// Get student reviews (reviews written by student)
router.get('/student/:id', auth, getStudentReviews);

// Client routes (requires auth and client role)
router.post('/', auth, authorize(['client']), createReview);

// Student route to review clients
router.post('/client', auth, authorize(['student']), createClientReview);

router.put('/:id', auth, authorize(['client']), updateReview);
router.delete('/:id', auth, authorize(['client', 'admin']), deleteReview); // Client owner or Admin can delete

module.exports = router;

