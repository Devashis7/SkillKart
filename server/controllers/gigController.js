const Gig = require('../models/Gig');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private (Student only)
exports.createGig = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);
    
    const { title, description, price, category, deliveryTime } = req.body;

    // Validation
    if (!title || !description || !price || !category || !deliveryTime) {
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: { title: !title, description: !description, price: !price, category: !category, deliveryTime: !deliveryTime }
      });
    }

    // req.user.id is available from the auth middleware
    const studentId = req.user.id;
    const user = await User.findById(studentId);

    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create gigs' });
    }

    // Process uploaded files
    const sampleFiles = req.files ? req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    })) : [];

    const gigData = {
      studentId,
      title,
      description,
      price: parseFloat(price),
      category,
      deliveryTime: parseInt(deliveryTime),
      sampleFiles,
      status: 'pending', // Gigs start as pending for admin approval
    };

    console.log('Creating gig with data:', gigData);

    const gig = await Gig.create(gigData);

    res.status(201).json({ success: true, gig });
  } catch (err) {
    console.error('Error creating gig:', err);
    res.status(500).json({ message: 'Error creating gig', error: err.message });
  }
};

// @desc    Get all gigs with filters and search
// @route   GET /api/gigs
// @access  Public
exports.getGigs = async (req, res) => {
  try {
    const { q, category, priceMin, priceMax, deliveryTimeMax, ratingMin, page = 1, limit = 10 } = req.query;
    let filter = { status: 'approved' }; // Only show approved gigs to the public

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    if (category) {
      filter.category = category;
    }
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }
    if (deliveryTimeMax) {
      filter.deliveryTime = { $lte: parseInt(deliveryTimeMax) };
    }
    if (ratingMin) {
      filter.averageRating = { $gte: parseFloat(ratingMin) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gigs = await Gig.find(filter)
      .populate('studentId', 'name profilePic averageStudentRating') // Populate student details
      .skip(skip)
      .limit(parseInt(limit));

    const totalGigs = await Gig.countDocuments(filter);

    console.log(`Found ${gigs.length} gigs with filter:`, filter);
    console.log('Gig ratings:', gigs.map(g => ({ 
      id: g._id, 
      title: g.title, 
      averageRating: g.averageRating, 
      reviewCount: g.reviewCount 
    })));

    res.status(200).json({
      success: true,
      count: gigs.length,
      total: totalGigs,
      page: parseInt(page),
      pages: Math.ceil(totalGigs / parseInt(limit)),
      gigs,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching gigs', error: err.message });
  }
};

// @desc    Get a single gig by ID
// @route   GET /api/gigs/:id
// @access  Public
exports.getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('studentId', 'name profilePic averageStudentRating');

    if (!gig || gig.status !== 'approved') {
      // Only show approved gigs to the public
      return res.status(404).json({ message: 'Gig not found or not approved' });
    }

    res.status(200).json({ success: true, gig });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching gig', error: err.message });
  }
};

// @desc    Update a gig (only by student owner)
// @route   PUT /api/gigs/:id
// @access  Private (Student only)
exports.updateGig = async (req, res) => {
  try {
    const { title, description, price, category, deliveryTime, sampleFiles } = req.body;

    let gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if the logged-in user is the owner of the gig
    if (gig.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this gig' });
    }

    gig.title = title || gig.title;
    gig.description = description || gig.description;
    gig.price = price || gig.price;
    gig.category = category || gig.category;
    gig.deliveryTime = deliveryTime || gig.deliveryTime;
    gig.sampleFiles = sampleFiles || gig.sampleFiles; // Update sample files if new ones are provided
    gig.status = 'pending'; // Any update resets status to pending for re-approval

    gig = await gig.save();

    res.status(200).json({ success: true, gig });
  } catch (err) {
    res.status(500).json({ message: 'Error updating gig', error: err.message });
  }
};

// @desc    Update gig status (Admin only)
// @route   PATCH /api/gigs/:id/status
// @access  Private (Admin only)
exports.updateGigStatus = async (req, res) => {
  try {
    const { status } = req.body;

    let gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status update. Must be 'approved' or 'rejected'." });
    }

    gig.status = status;
    gig = await gig.save();

    // Send notification to student upon gig status change
    await Notification.create({
      userId: gig.studentId,
      type: 'gig_approved',
      message: `Your gig \'${gig.title}\' has been ${status}.`,
      link: `/student/gigs/${gig._id}`,
    });

    res.status(200).json({ success: true, gig });
  } catch (err) {
    res.status(500).json({ message: 'Error updating gig status', error: err.message });
  }
};

// @desc    Get all gigs for admin (including pending ones)
// @route   GET /api/admin/gigs
// @access  Private (Admin only)
exports.getAdminGigs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gigs = await Gig.find(filter)
      .populate('studentId', 'name email profilePic') // Populate student details
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(parseInt(limit));

    const totalGigs = await Gig.countDocuments(filter);

    console.log(`Admin fetched ${gigs.length} gigs with filter:`, filter);

    res.status(200).json({
      success: true,
      count: gigs.length,
      total: totalGigs,
      page: parseInt(page),
      pages: Math.ceil(totalGigs / parseInt(limit)),
      gigs,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin gigs', error: err.message });
  }
};

// @desc    Get student's own gigs (including pending)
// @route   GET /api/gigs/my-gigs
// @access  Private (Student only)
exports.getMyGigs = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    
    // Verify user is a student
    const user = await User.findById(studentId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }

    let filter = { studentId };

    // Filter by status if provided
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gigs = await Gig.find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(parseInt(limit));

    const totalGigs = await Gig.countDocuments(filter);

    console.log(`Student ${studentId} fetched ${gigs.length} of their own gigs`);

    res.status(200).json({
      success: true,
      count: gigs.length,
      total: totalGigs,
      page: parseInt(page),
      pages: Math.ceil(totalGigs / parseInt(limit)),
      gigs,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student gigs', error: err.message });
  }
};

// @desc    Get gig for editing (owner only, any status)
// @route   GET /api/gigs/:id/edit-details
// @access  Private (Student owner only)
exports.getGigForEdit = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('studentId', 'name profilePic averageStudentRating');

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if the logged-in user is the owner of the gig
    if (gig.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own gigs' });
    }

    res.status(200).json({ success: true, gig });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching gig for editing', error: err.message });
  }
};

// @desc    Delete a gig (Owner or Admin)
// @route   DELETE /api/gigs/:id
// @access  Private (Student owner or Admin)
exports.deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if the logged-in user is the owner or an admin
    if (gig.studentId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this gig' });
    }

    await gig.deleteOne();

    res.status(200).json({ success: true, message: 'Gig deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting gig', error: err.message });
  }
};
