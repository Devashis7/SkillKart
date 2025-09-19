const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = userId =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role });
    // Remove password and OTP related fields before sending user data in response
    const userResponse = user.toJSON();
    res.status(201).json({ token: generateToken(user._id), user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Password is no longer excluded by default in schema, so no need for select('+password')
    const user = await User.findOne({ email }); 
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ message: 'Invalid credentials' });
    // Remove password and OTP related fields before sending user data in response
    const userResponse = user.toJSON();
    res.json({ token: generateToken(user._id), user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      // Create user if they don't exist
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(16).toString('hex'), // Generate a random password for Google users
        profilePic: { url: picture, public_id: 'google-profile-pic' }, // Store Google profile pic
      });
    }
    // Remove password and OTP related fields before sending user data in response
    const userResponse = user.toJSON();
    res.json({ token: generateToken(user._id), user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Google authentication error', error: err.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = otp; // Store plain OTP temporarily
    user.otpExpires = otpExpires;
    await user.save();

    // In a real app, send OTP via email. For now, log to console.
    console.log(`Password Reset OTP for ${email}: ${otp}`);

    res.json({ message: 'OTP sent to your email (check console for demo)' });
  } catch (err) {
    res.status(500).json({ message: 'Error requesting password reset', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    // Verify OTP and its expiry
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword; // Mongoose pre-save hook will hash this
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Remove password and OTP related fields before sending user data in response
    const userResponse = user.toJSON();
    res.json({ user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'User fetch error', error: err.message });
  }
};
