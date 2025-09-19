const express = require('express');
const { register, login, googleAuth, requestPasswordReset, resetPassword, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/request-reset', requestPasswordReset);
router.post('/reset', resetPassword);
router.get('/me', auth, getMe);

module.exports = router;
