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
