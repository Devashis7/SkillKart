const express = require('express');
const { 
  getUserById, 
  updateProfile, 
  uploadProfilePicture,
  suspendUser, 
  getAdminUsers,
  deleteUser,
  updateUserRole
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const router = express.Router();

// Private route for a logged-in user to update their own profile
router.put('/update', auth, updateProfile);

// Private route for profile picture upload
router.post('/upload-profile-pic', auth, upload.single('profilePic'), uploadProfilePicture);

// Admin routes (require admin role) - keep before parameterized routes
router.get('/admin/users', auth, authorize(['admin']), getAdminUsers); // Admin search/filter users
router.patch('/:id/suspend', auth, authorize(['admin']), suspendUser);
router.patch('/:id/role', auth, authorize(['admin']), updateUserRole);
router.delete('/:id', auth, authorize(['admin']), deleteUser);

// Public route to get a user profile by ID
router.get('/:id', getUserById);

module.exports = router;
