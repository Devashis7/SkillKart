const express = require('express');
const { checkout, verify } = require('../controllers/paymentController');
const auth = require('../middleware/auth'); // Assuming payment routes require authentication
const router = express.Router();

router.post('/checkout', auth, checkout);
router.post('/verify', auth, verify);

module.exports = router;
