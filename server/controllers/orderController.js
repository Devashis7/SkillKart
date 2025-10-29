// @desc    Create a new order (client books a gig)
// @route   POST /api/orders/
// @access  Private (Client only)
exports.createOrder = async (req, res) => {
  try {
    const { gigId, instructions, paymentId } = req.body;
    if (!gigId || !paymentId) {
      return res.status(400).json({ message: 'gigId and paymentId are required' });
    }


    // Find the gig and its student
    const gig = await require('../models/Gig').findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    if (gig.status !== 'approved') {
      return res.status(400).json({ message: 'Gig is not approved for booking' });
    }

    // Calculate deadline
    const now = new Date();
    const deadline = new Date(now.getTime() + gig.deliveryTime * 24 * 60 * 60 * 1000);

    const order = await require('../models/Order').create({
      gigId,
      clientId: req.user.id,
      studentId: gig.studentId,
      instructions,
      price: gig.price,
      deadline,
      paymentId,
      status: 'booked',
    });

    // Optionally: create notification for student
    await require('../models/Notification').create({
      userId: gig.studentId,
      type: 'order_booked',
      message: `You have received a new order for your gig '${gig.title}'.`,
      link: `/student/orders/${order._id}`,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};
const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get orders for a student
// @route   GET /api/orders/student/:id
// @access  Private (Student owner only)
exports.getStudentOrders = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (req.user.id !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these orders' });
    }

    const orders = await Order.find({ studentId })
      .populate('gigId', 'title price deliveryTime')
      .populate('clientId', 'name profilePic');

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student orders', error: err.message });
  }
};

// @desc    Get orders for a client
// @route   GET /api/orders/client/:id
// @access  Private (Client owner only)
exports.getClientOrders = async (req, res) => {
  try {
    const clientId = req.params.id;

    if (req.user.id !== clientId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these orders' });
    }

    const orders = await Order.find({ clientId })
      .populate('gigId', 'title price deliveryTime')
      .populate('studentId', 'name profilePic');

    // Check if each order has been reviewed
    const Review = require('../models/Review');
    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        const review = await Review.findOne({ orderId: order._id });
        return {
          ...order.toObject(),
          hasReviewed: !!review
        };
      })
    );

    res.status(200).json({ success: true, count: ordersWithReviewStatus.length, orders: ordersWithReviewStatus });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching client orders', error: err.message });
  }
};

// @desc    Get specific order by ID
// @route   GET /api/orders/:id
// @access  Private (Order participants or admin)
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate('gigId', 'title price deliveryTime category revisions')
      .populate('studentId', 'name email profilePic')
      .populate('clientId', 'name email profilePic');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    const isAuthorized = req.user.role === 'admin' || 
                        req.user.id === order.studentId._id.toString() || 
                        req.user.id === order.clientId._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order details', error: err.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Student/Client/Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const allowedStatuses = [
      'booked', 'accepted', 'in_progress', 'in_review', 'completed', 'cancelled', 'revision_requested'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const currentUser = req.user;

    // Authorization logic for status transitions
    let isAuthorized = false;
    let notificationMessage = '';
    let notificationRecipientId;
    let notificationType = '';

    switch (status) {
      case 'accepted':
        // Only student can accept an order from 'booked'
        if (currentUser.role === 'student' && order.studentId.toString() === currentUser.id && order.status === 'booked') {
          isAuthorized = true;
          notificationMessage = `Your order for gig \'${order.gigId.title}\' has been accepted by the student.`;
          notificationRecipientId = order.clientId;
          notificationType = 'order_accepted';
        }
        break;
      case 'in_progress':
        // Only student can mark as in_progress from 'accepted' or 'revision_requested'
        if (currentUser.role === 'student' && order.studentId.toString() === currentUser.id && (order.status === 'accepted' || order.status === 'revision_requested')) {
          isAuthorized = true;
          notificationMessage = `Your order for gig \'${order.gigId.title}\' is now in progress.`;
          notificationRecipientId = order.clientId;
          notificationType = 'order_in_progress';
        }
        break;
      case 'in_review':
        // Only student can mark as in_review from 'in_progress' (after delivery)
        // Delivery upload endpoint will handle this, so direct status change here might be limited
        return res.status(400).json({ message: 'Use delivery endpoint to mark as in_review' });
      case 'completed':
        // Only client can mark as completed from 'in_review'
        if (currentUser.role === 'client' && order.clientId.toString() === currentUser.id && order.status === 'in_review') {
          isAuthorized = true;
          notificationMessage = `Your gig \'${order.gigId.title}\' for order #${order._id} has been completed!`;
          notificationRecipientId = order.studentId;
          notificationType = 'order_completed';
        }
        break;
      case 'cancelled':
        // Student, Client, or Admin can cancel
        if (currentUser.role === 'admin' ||
            (currentUser.role === 'student' && order.studentId.toString() === currentUser.id) ||
            (currentUser.role === 'client' && order.clientId.toString() === currentUser.id)) {
          isAuthorized = true;
          notificationMessage = `Order #${order._id} for gig \'${order.gigId.title}\' has been cancelled.`;
          notificationRecipientId = (currentUser.id === order.studentId.toString()) ? order.clientId : order.studentId; // Notify the other party
          notificationType = 'order_cancelled';
        }
        break;
      case 'booked':
      case 'revision_requested':
          // These statuses are typically set by other actions (payment verification, revision request endpoint)
          return res.status(400).json({ message: 'Status cannot be directly set to booked or revision_requested via this endpoint' });
      default:
        return res.status(400).json({ message: 'Invalid status transition or role' });
    }

    if (!isAuthorized && currentUser.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to perform this status update' });
    }

    order.status = status;
    order = await order.save();

    // Create notification if applicable
    if (notificationRecipientId && notificationMessage && notificationType) {
      await Notification.create({
        userId: notificationRecipientId,
        type: notificationType,
        message: notificationMessage,
        link: (notificationRecipientId.toString() === order.clientId.toString()) ? `/client/orders/${order._id}` : `/student/orders/${order._id}`,
      });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status', error: err.message });
  }
};

// @desc    Upload delivery files for an order
// @route   POST /api/orders/:id/delivery
// @access  Private (Student owner only)
exports.uploadDelivery = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { message } = req.body; // Optional delivery message

    // Debug logging
    console.log('Upload delivery request for order:', orderId);
    console.log('Files received:', req.files ? req.files.length : 0);
    console.log('Message:', message);

    let order = await Order.findById(orderId).populate('gigId', 'title');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to deliver for this order' });
    }

    if (order.status !== 'in_progress' && order.status !== 'revision_requested') {
      return res.status(400).json({ message: 'Order is not in a state to accept delivery (must be in_progress or revision_requested)' });
    }

    // Process uploaded files from Cloudinary
    const deliveryFiles = req.files ? req.files.map(file => ({
      url: file.path, // Cloudinary URL
      public_id: file.filename // Cloudinary public_id
    })) : [];

    console.log('Processed delivery files:', deliveryFiles.length);

    if (deliveryFiles.length === 0) {
      console.error('No files uploaded. req.files:', req.files);
      return res.status(400).json({ 
        message: 'At least one delivery file is required',
        debug: {
          filesReceived: req.files ? req.files.length : 0,
          cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
        }
      });
    }

    order.deliveryFiles = deliveryFiles;
    if (message && message.trim()) {
      order.deliveryMessage = message.trim();
    }
    order.status = 'in_review';
    order = await order.save();

    // Notify client about delivery
    await Notification.create({
      userId: order.clientId,
      type: 'delivery_submitted',
      message: `Student has delivered work for your order on gig '${order.gigId.title}'.`,
      link: `/client/orders/${order._id}`,
    });

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('Upload delivery error:', err);
    res.status(500).json({ message: 'Error uploading delivery files', error: err.message });
  }
};

// @desc    Request a revision for an order
// @route   PATCH /api/orders/:id/request-revision
// @access  Private (Client owner only)
exports.requestRevision = async (req, res) => {
  try {
    const { feedback } = req.body;
    const orderId = req.params.id;

    let order = await Order.findById(orderId).populate('gigId', 'title');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to request revision for this order' });
    }

    if (order.status !== 'in_review') {
      return res.status(400).json({ message: 'Cannot request revision unless order is in_review' });
    }

    order.status = 'revision_requested';
    order.requestedRevisionCount += 1;
    // You might want to store revision feedback somewhere, e.g., in an array of objects in the Order model
    // For v1, we'll just update status and count
    order = await order.save();

    // Notify student about revision request
    await Notification.create({
      userId: order.studentId,
      type: 'revision_requested',
      message: `Client has requested a revision for your delivery on gig \'${order.gigId.title}\'. Feedback: ${feedback.substring(0, 100)}...`,
      link: `/student/orders/${order._id}`,
    });

    res.status(200).json({ success: true, order, message: 'Revision requested successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error requesting revision', error: err.message });
  }
};

// @desc    Get all orders for Admin with search and filter
// @route   GET /api/orders/admin/all?search=&status=&page=1
// @access  Private (Admin only)
exports.getAdminOrders = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (search) {
      // Search in gig title or student/client name
      const gigIds = await Gig.find({ 
        title: { $regex: search, $options: 'i' } 
      }).distinct('_id');

      const userIds = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');

      filter.$or = [
        { gigId: { $in: gigIds } },
        { studentId: { $in: userIds } },
        { clientId: { $in: userIds } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('gigId', 'title category price')
      .populate('studentId', 'name email profilePic')
      .populate('clientId', 'name email profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total: totalOrders,
      page: parseInt(page),
      pages: Math.ceil(totalOrders / parseInt(limit)),
      orders
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders for admin', error: err.message });
  }
};

// @desc    Get total orders count for stats
// @route   GET /api/orders/admin/stats
// @access  Private (Admin only)
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'booked' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const inProgressOrders = await Order.countDocuments({ 
      status: { $in: ['accepted', 'in_progress', 'in_review'] } 
    });

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        inProgressOrders
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order stats', error: err.message });
  }
};
