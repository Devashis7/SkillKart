const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Send general contact message to admins (Public contact form)
// @route   POST /api/contact/public
// @access  Public
exports.sendPublicContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: 'Name, email, subject, and message are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      return res.status(500).json({ message: 'No administrators found to receive the message' });
    }

    // Create notifications for all admins
    const notificationPromises = admins.map(admin => 
      Notification.create({
        userId: admin._id,
        type: 'contact_message',
        message: `New contact message from ${name} (${email}): ${subject}`,
        link: '/admin-dashboard',
        metadata: {
          senderName: name,
          senderEmail: email,
          subject,
          message
        }
      })
    );

    await Promise.all(notificationPromises);

    res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent successfully. We will get back to you soon!' 
    });
  } catch (err) {
    console.error('Error sending public contact message:', err);
    res.status(500).json({ message: 'Error sending message. Please try again later.', error: err.message });
  }
};

// @desc    Create a contact request from client to freelancer
// @route   POST /api/contact
// @access  Private (Client only)
exports.createContactRequest = async (req, res) => {
  try {
    const { freelancerId, subject, message, projectType, budget, deadline, gigId } = req.body;
    const clientId = req.user.id;

    // Validate required fields
    if (!freelancerId || !subject || !message) {
      return res.status(400).json({ 
        message: 'Freelancer ID, subject, and message are required' 
      });
    }

    // Verify freelancer exists and is a student
    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.role !== 'student') {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Verify client exists and is a client
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can send contact requests' });
    }

    // Create notification for the freelancer
    const notificationMessage = `New contact request from ${client.name}: ${subject}`;
    const notification = await Notification.create({
      userId: freelancerId,
      type: 'contact_request',
      message: notificationMessage,
      link: `/student-dashboard?tab=messages`,
      metadata: {
        clientId,
        clientName: client.name,
        clientEmail: client.email,
        subject,
        message,
        projectType,
        budget: budget ? parseFloat(budget) : null,
        deadline,
        gigId
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Contact request sent successfully',
      notification 
    });
  } catch (err) {
    console.error('Error creating contact request:', err);
    res.status(500).json({ message: 'Error sending contact request', error: err.message });
  }
};

// @desc    Get contact requests for a freelancer
// @route   GET /api/contact/received
// @access  Private (Student only)
exports.getReceivedContactRequests = async (req, res) => {
  try {
    const freelancerId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contactRequests = await Notification.find({
      userId: freelancerId,
      type: 'contact_request'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalRequests = await Notification.countDocuments({
      userId: freelancerId,
      type: 'contact_request'
    });

    res.status(200).json({
      success: true,
      count: contactRequests.length,
      total: totalRequests,
      page: parseInt(page),
      pages: Math.ceil(totalRequests / parseInt(limit)),
      contactRequests
    });
  } catch (err) {
    console.error('Error fetching contact requests:', err);
    res.status(500).json({ message: 'Error fetching contact requests', error: err.message });
  }
};

// @desc    Mark contact request as read
// @route   PATCH /api/contact/:id/read
// @access  Private (Student only)
exports.markContactRequestAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const freelancerId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: freelancerId, type: 'contact_request' },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Contact request not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Contact request marked as read',
      notification 
    });
  } catch (err) {
    console.error('Error marking contact request as read:', err);
    res.status(500).json({ message: 'Error updating contact request', error: err.message });
  }
};

// @desc    Get all contact requests (Admin only)
// @route   GET /api/contact/admin/all
// @access  Private (Admin only)
exports.getAllContactRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search query
    let searchQuery = { type: 'contact_request' };
    if (search) {
      searchQuery.$or = [
        { 'metadata.clientName': { $regex: search, $options: 'i' } },
        { 'metadata.subject': { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const contactRequests = await Notification.find(searchQuery)
      .populate('userId', 'name email profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalRequests = await Notification.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      count: contactRequests.length,
      total: totalRequests,
      page: parseInt(page),
      pages: Math.ceil(totalRequests / parseInt(limit)),
      contactRequests
    });
  } catch (err) {
    console.error('Error fetching all contact requests:', err);
    res.status(500).json({ message: 'Error fetching contact requests', error: err.message });
  }
};