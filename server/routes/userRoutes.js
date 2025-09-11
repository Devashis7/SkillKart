const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getUserById, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/:id', getUserById);
router.put('/update', auth, updateProfile);

router.post('/upload-profile-pic', auth, upload.single('profilePic'), async (req, res) => {
  try {
    if(!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    // Save Cloudinary file info in user profilePic field
    user.profilePic = {
      url: req.file.path,
      public_id: req.file.filename,
    };
    await user.save();

    res.json({ message: 'Profile picture uploaded', profilePic: user.profilePic });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
