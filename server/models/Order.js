const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instructions: { type: String, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  deadline: { type: Date, required: true },
  deliveryFiles: [{
    url: String,
    public_id: String
  }],
  status: {
    type: String,
    enum: ['booked', 'accepted', 'in_progress', 'in_review', 'revision_requested', 'completed', 'cancelled'],
    default: 'booked'
  },
  requestedRevisionCount: { type: Number, default: 0 },
  paymentId: { type: String, required: true }, // Razorpay payment ID
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
