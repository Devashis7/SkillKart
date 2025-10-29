const Review = require('../models/Review');
const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Helper function to calculate and update gig average rating and review count
const updateGigRating = async (gigId) => {
  try {
    console.log('Updating gig rating for gigId:', gigId);
    
    const stats = await Review.aggregate([
      { $match: { gigId: new mongoose.Types.ObjectId(gigId) } },
      { $group: {
          _id: '$gigId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    console.log('Aggregation stats:', stats);

    if (stats.length > 0) {
      const updatedGig = await Gig.findByIdAndUpdate(gigId, {
        averageRating: stats[0].averageRating,
        reviewCount: stats[0].reviewCount,
      }, { new: true });
      console.log('Updated gig:', updatedGig);
    } else {
      // If no reviews, reset to default
      await Gig.findByIdAndUpdate(gigId, { averageRating: 0, reviewCount: 0 }, { new: true });
      console.log('No reviews found, reset to 0');
    }
  } catch (error) {
    console.error('Error updating gig rating:', error);
  }
};

// Helper function to calculate and update student average rating
const updateStudentRating = async (studentId) => {
  try {
    console.log('Updating student rating for studentId:', studentId);
    
    const stats = await Review.aggregate([
      { $match: { revieweeId: new mongoose.Types.ObjectId(studentId), role: 'client' } },
      { $group: {
          _id: '$revieweeId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    console.log('Student rating stats:', stats);

    if (stats.length > 0) {
      const updatedStudent = await User.findByIdAndUpdate(studentId, {
        averageStudentRating: stats[0].averageRating,
      }, { new: true });
      console.log('Updated student rating:', updatedStudent.averageStudentRating);
    } else {
      // If no reviews, reset to default
      await User.findByIdAndUpdate(studentId, { averageStudentRating: 0 }, { new: true });
      console.log('No student reviews found, reset to 0');
    }
  } catch (error) {
    console.error('Error updating student rating:', error);
  }
};

// Helper function to calculate and update client average rating
const updateClientRating = async (clientId) => {
  try {
    console.log('Updating client rating for clientId:', clientId);
    
    const stats = await Review.aggregate([
      { $match: { revieweeId: new mongoose.Types.ObjectId(clientId), role: 'student' } },
      { $group: {
          _id: '$revieweeId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    console.log('Client rating stats:', stats);

    if (stats.length > 0) {
      const updatedClient = await User.findByIdAndUpdate(clientId, {
        averageClientRating: stats[0].averageRating,
      }, { new: true });
      console.log('Updated client rating:', updatedClient.averageClientRating);
    } else {
      // If no reviews, reset to default
      await User.findByIdAndUpdate(clientId, { averageClientRating: 0 }, { new: true });
      console.log('No client reviews found, reset to 0');
    }
  } catch (error) {
    console.error('Error updating client rating:', error);
  }
};

// @desc    Create a new review (Client reviews Student/Gig)
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

    // Update student average rating
    await updateStudentRating(gig.studentId);

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

// @desc    Create a client review (Student reviews Client)
// @route   POST /api/reviews/client
// @access  Private (Student only)
exports.createClientReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const studentId = req.user.id;

    // Ensure only students can create client reviews
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can review clients' });
    }

    // Check if the order exists, belongs to the student, and is completed
    const order = await Order.findOne({ _id: orderId, studentId, status: 'completed' }).populate('gigId');

    if (!order) {
      return res.status(400).json({ message: 'Cannot review: Order not found, not yours, or not completed' });
    }

    // Check if a client review already exists for this order
    const existingReview = await Review.findOne({ orderId, role: 'student' });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this client' });
    }

    const review = await Review.create({
      gigId: order.gigId._id,
      orderId,
      reviewerId: studentId,
      revieweeId: order.clientId,
      rating,
      comment,
      role: 'student', // The reviewer's role
    });

    // Update client average rating
    await updateClientRating(order.clientId);

    // Mark the order as reviewed by student
    order.hasReviewedClient = true;
    await order.save();

    // Notify client about new review
    await Notification.create({
      userId: order.clientId,
      type: 'new_review',
      message: `You received a new ${rating}-star review from a freelancer.`,
      link: `/profile`,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: 'Error creating client review', error: err.message });
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

// @desc    Get all reviews by a specific client
// @route   GET /api/reviews/client/:id
// @access  Private
exports.getClientReviews = async (req, res) => {
  try {
    const clientId = req.params.id;

    // Ensure user can only see their own reviews or is admin
    if (req.user.id !== clientId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these reviews' });
    }

    const reviews = await Review.find({ reviewerId: clientId, role: 'client' })
      .populate('gigId', 'title')
      .populate('revieweeId', 'name profilePic')
      .populate('orderId', 'price createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching client reviews', error: err.message });
  }
};

// @desc    Get all reviews by a specific student
// @route   GET /api/reviews/student/:id
// @access  Private
exports.getStudentReviews = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Ensure user can only see their own reviews or is admin
    if (req.user.id !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these reviews' });
    }

    const reviews = await Review.find({ reviewerId: studentId, role: 'student' })
      .populate('revieweeId', 'name profilePic')
      .populate('orderId', 'price createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student reviews', error: err.message });
  }
};

// @desc    Get all reviews FOR a specific student (received from clients)
// @route   GET /api/reviews/for-student/:id
// @access  Public (anyone can view student reviews)
exports.getReviewsForStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    const reviews = await Review.find({ revieweeId: studentId, role: 'client' })
      .populate('reviewerId', 'name profilePic')
      .populate('gigId', 'title')
      .populate('orderId', 'price createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student reviews', error: err.message });
  }
};

// @desc    Get all reviews FOR a specific client (received from students)
// @route   GET /api/reviews/for-client/:id
// @access  Public (anyone can view client reviews)
exports.getReviewsForClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    const reviews = await Review.find({ revieweeId: clientId, role: 'student' })
      .populate('reviewerId', 'name profilePic')
      .populate('gigId', 'title')
      .populate('orderId', 'price createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching client reviews', error: err.message });
  }
};
