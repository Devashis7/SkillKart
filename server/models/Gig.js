const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  deliveryTime: { type: Number, required: true, min: 1 }, // in days
  sampleFiles: [{
    url: String,
    public_id: String
  }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

// Indexes for search and filters
gigSchema.index({ category: 1 });
gigSchema.index({ price: 1 });
gigSchema.index({ deliveryTime: 1 });
gigSchema.index({ averageRating: -1 }); // -1 for descending order
gigSchema.index({ title: "text", description: "text" }); // Text index for full-text search

module.exports = mongoose.model('Gig', gigSchema);
