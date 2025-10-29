const express = require('express');
const { 
  createGig, 
  getGigs, 
  getGigById, 
  updateGig, 
  updateGigStatus, 
  deleteGig,
  getAdminGigs,
  getMyGigs,
  getGigForEdit
} = require('../controllers/gigController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize'); // Assuming you have an authorize middleware for role-based access
const router = express.Router();

// Public routes
router.get('/', getGigs);

// Student routes (requires auth and student role) - Must come before /:id
router.get('/my-gigs', auth, authorize(['student']), getMyGigs); // Get student's own gigs
router.get('/:id/edit-details', auth, authorize(['student']), getGigForEdit); // Get gig for editing

// Public routes continued (/:id must come after specific routes)
router.get('/:id', getGigById);
router.post('/', auth, authorize(['student']), upload.array('portfolioFiles', 5), createGig);
router.put('/:id', auth, authorize(['student']), updateGig);
router.delete('/:id', auth, authorize(['student', 'admin']), deleteGig); // Student owner or Admin can delete

// Admin routes (requires auth and admin role)
router.get('/admin/all', auth, authorize(['admin']), getAdminGigs);
router.patch('/:id/status', auth, authorize(['admin']), updateGigStatus);

module.exports = router;
