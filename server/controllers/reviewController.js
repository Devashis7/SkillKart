const Review = require('../models/Review');
const Order = require('../models/Order');
const Gig = require('../models/Gig');
const Notification = require('../models/Notification');

// Helper function to calculate and update gig average rating and review count
const updateGigRating = async (gigId) => {
  const stats = await Review.aggregate([
    { $match: { gigId: gigId } },
    { $group: {
        _id: '$gigId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Gig.findByIdAndUpdate(gigId, {
      averageRating: stats[0].averageRating,
      reviewCount: stats[0].reviewCount,
    }, { new: true });
  } else {
    // If no reviews, reset to default
    await Gig.findByIdAndUpdate(gigId, { averageRating: 0, reviewCount: 0 }, { new: true });
  }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Client only)
exports.createReview = async (req, res) => {
  try {
    const { gigId, orderId, rating, comment } = req.body;
    const clientId = req.user.id;

    // Ensure only clients can create reviews
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can create reviews' });
    }

    // Check if the order exists, belongs to the client, and is completed
    const order = await Order.findOne({ _id: orderId, clientId, gigId, status: 'completed' });

    if (!order) {
      return res.status(400).json({ message: 'Cannot review: Order not found, not yours, or not completed' });
    }

    // Check if a review already exists for this order
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this order' });
    }

    // Get the studentId from the gig
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    const review = await Review.create({
      gigId,
      orderId,
      reviewerId: clientId,
      revieweeId: gig.studentId,
      rating,
      comment,
      role: 'client', // The reviewer's role
    });

    // Update gig average rating and review count
    await updateGigRating(gigId);

    // Notify student about new review
    await Notification.create({
      userId: gig.studentId,
      type: 'new_review',
      message: `You received a new ${rating}-star review for your gig \'${gig.title}\'.`,
      link: `/gig/${gigId}`,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: 'Error creating review', error: err.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Client owner only)
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const reviewId = req.params.id;
    const clientId = req.user.id;

    let review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure client is the owner of the review
    if (review.reviewerId.toString() !== clientId) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review = await review.save();

    // Update gig average rating and review count
    await updateGigRating(review.gigId);

    res.status(200).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: 'Error updating review', error: err.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Client owner or Admin)
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure client is the owner or user is an admin
    if (review.reviewerId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    // Update gig average rating and review count
    await updateGigRating(review.gigId);

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review', error: err.message });
  }
};

// @desc    Get all reviews for a specific gig
// @route   GET /api/reviews/gig/:id
// @access  Public
exports.getGigReviews = async (req, res) => {
  try {
    const gigId = req.params.id;

    const reviews = await Review.find({ gigId })
      .populate('reviewerId', 'name profilePic'); // Show who reviewed

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching gig reviews', error: err.message });
  }
};
