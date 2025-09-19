const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['gig_approved', 'new_order', 'delivery_submitted', 'revision_requested', 'order_completed'],
    required: true
  },
  message: { type: String, required: true, maxlength: 500 },
  link: { type: String }, // Link to the related resource (e.g., gig, order page)
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
