const express = require('express');
const { 
  createGig, 
  getGigs, 
  getGigById, 
  updateGig, 
  updateGigStatus, 
  deleteGig 
} = require('../controllers/gigController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize'); // Assuming you have an authorize middleware for role-based access
const router = express.Router();

// Public routes
router.get('/', getGigs);
router.get('/:id', getGigById);

// Student routes (requires auth and student role)
router.post('/', auth, authorize(['student']), createGig);
router.put('/:id', auth, authorize(['student']), updateGig);
router.delete('/:id', auth, authorize(['student', 'admin']), deleteGig); // Student owner or Admin can delete

// Admin routes (requires auth and admin role)
router.patch('/:id/status', auth, authorize(['admin']), updateGigStatus);

module.exports = router;
