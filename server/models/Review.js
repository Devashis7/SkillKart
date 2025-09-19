const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Client who made the review
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Student who received the review
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true }, // One review per order
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  role: { type: String, enum: ['student', 'client'], required: true }, // Role of the reviewer
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
