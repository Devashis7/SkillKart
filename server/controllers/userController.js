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
      return res.status(400).json({ message: 'Invalid status. Must be 'active' or 'suspended'.' });
    }

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, user: user.toJSON(), message: `User status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user status', error: err.message });
  }
};

// @desc    Get all users for Admin with search and filter
// @route   GET /api/admin/users?search=&role=
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
