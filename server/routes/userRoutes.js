const express = require('express');
const { 
  getUserById, 
  updateProfile, 
  suspendUser, 
  getAdminUsers 
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();

// Public route to get a user profile by ID
router.get('/:id', getUserById);

// Private route for a logged-in user to update their own profile
router.put('/update', auth, updateProfile);

// Admin routes (require admin role)
router.patch('/:id/suspend', auth, authorize(['admin']), suspendUser);
router.get('/admin/users', auth, authorize(['admin']), getAdminUsers); // Admin search/filter users

module.exports = router;
