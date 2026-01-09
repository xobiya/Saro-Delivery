const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chapa', protect, initializePayment);
router.get('/verify/:id', verifyPayment);

module.exports = router;
