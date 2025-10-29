const Notification = require('../models/Notification');

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notifications.length, notifications });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    let notification = await Notification.findOne({ _id: notificationId, userId });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or not authorized' });
    }

    notification.isRead = true;
    notification = await notification.save();

    res.status(200).json({ success: true, notification, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking notification as read', error: err.message });
  }
};

// @desc    Get all notifications (Admin only)
// @route   GET /api/notifications/admin/all
// @access  Private (Admin only)
exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', type = '', unreadOnly = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery.$or = [
        { message: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) {
      searchQuery.type = type;
    }
    if (unreadOnly === 'true') {
      searchQuery.isRead = false;
    }

    const notifications = await Notification.find(searchQuery)
      .populate('userId', 'name email role profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalNotifications = await Notification.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total: totalNotifications,
      page: parseInt(page),
      pages: Math.ceil(totalNotifications / parseInt(limit)),
      notifications
    });
  } catch (err) {
    console.error('Error fetching all notifications:', err);
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
};

// @desc    Get notification statistics (Admin only)
// @route   GET /api/notifications/admin/stats
// @access  Private (Admin only)
exports.getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });
    const contactRequests = await Notification.countDocuments({ type: 'contact_request' });
    const orderNotifications = await Notification.countDocuments({ type: { $regex: 'order' } });

    // Get notification types breakdown
    const notificationsByType = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalNotifications,
        unreadNotifications,
        contactRequests,
        orderNotifications,
        readRate: totalNotifications > 0 ? ((totalNotifications - unreadNotifications) / totalNotifications * 100).toFixed(2) : 0,
        notificationsByType
      }
    });
  } catch (err) {
    console.error('Error fetching notification stats:', err);
    res.status(500).json({ message: 'Error fetching notification statistics', error: err.message });
  }
};

// @desc    Mark any notification as read (Admin only)
// @route   PATCH /api/notifications/admin/:id/read
// @access  Private (Admin only)
exports.markNotificationAsReadAdmin = async (req, res) => {
  try {
    const notificationId = req.params.id;

    let notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    notification = await notification.save();

    res.status(200).json({ 
      success: true, 
      notification, 
      message: 'Notification marked as read by admin' 
    });
  } catch (err) {
    console.error('Error marking notification as read (admin):', err);
    res.status(500).json({ message: 'Error marking notification as read', error: err.message });
  }
};
