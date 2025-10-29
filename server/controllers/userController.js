const User = require('../models/User');

// @desc    Get user profile by ID (public)
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Use toJSON method to remove sensitive data
    res.json({ success: true, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Update current logged in user's profile
// @route   PUT /api/users/update
// @access  Private (Owner only)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const updates = req.body;

    // Prevent updating role, status, password directly from this endpoint
    delete updates.role;
    delete updates.status;
    delete updates.password;
    delete updates.otp;
    delete updates.otpExpires;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Use toJSON method to remove sensitive data
    res.json({ success: true, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// @desc    Suspend/Activate a user (Admin only)
// @route   PATCH /api/users/:id/suspend
// @access  Private (Admin only)
exports.suspendUser = async (req, res) => {
  try {
    const { status } = req.body; // Expecting status: 'active' or 'suspended'
    const userId = req.params.id;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'active' or 'suspended'." });
    }

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, user: user.toJSON(), message: `User status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user status', error: err.message });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/upload-profile-pic
// @access  Private (Owner only)
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePic = {
      url: req.file.path, // Cloudinary URL
      public_id: req.file.filename // Cloudinary public_id
    };

    const user = await User.findByIdAndUpdate(
      userId, 
      { profilePic }, 
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ 
      success: true, 
      user: user.toJSON(),
      message: 'Profile picture updated successfully' 
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// @desc    Get all users for Admin with search and filter
// @route   GET /api/users/admin/users?search=&role=
// @access  Private (Admin only)
exports.getAdminUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      filter.role = role;
    }
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -otp -otpExpires'); // Exclude sensitive fields

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      page: parseInt(page),
      pages: Math.ceil(totalUsers / parseInt(limit)),
      users: users.map(user => user.toJSON()), // Use toJSON for each user
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users for admin', error: err.message });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['student', 'client', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'student', 'client', or 'admin'." });
    }

    // Prevent admin from changing their own role
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user: user.toJSON(), message: `User role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user role', error: err.message });
  }
};
