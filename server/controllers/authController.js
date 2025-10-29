const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

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
    // Explicitly select password for login
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
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

    // Send OTP via email
    try {
      await transporter.sendMail({
        from: `"SkillKart" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: 'Password Reset OTP - SkillKart',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password. Please use the following OTP to complete the process:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #4F46E5; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated email from SkillKart. Please do not reply to this email.
            </p>
          </div>
        `,
      });
      
      console.log(`Password Reset OTP sent to ${email}: ${otp}`);
      res.json({ message: 'OTP has been sent to your email. Please check your inbox.' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still log to console as fallback
      console.log(`Password Reset OTP for ${email}: ${otp}`);
      res.json({ message: 'OTP generated but email sending failed. Check server console for OTP.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error requesting password reset', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    // Check if OTP exists
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
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
