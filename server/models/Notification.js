const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'gig_approved',
      'gig_rejected',
      'new_order',
      'order_booked',
      'order_accepted',
      'order_in_progress',
      'order_in_review',
      'order_completed',
      'order_cancelled',
      'delivery_submitted',
      'revision_requested',
      'review_added',
      'user_suspended',
  'admin_message',
  'new_review'
    ],
    required: true
  },
  message: { type: String, required: true, maxlength: 500 },
  link: { type: String }, // Link to the related resource (e.g., gig, order page)
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
