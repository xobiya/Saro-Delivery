const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment, getPaymentStatus, verifyPaymentFromFrontend } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chapa', protect, initializePayment);
router.get('/verify/:id', verifyPayment);
router.get('/status/:orderId', protect, getPaymentStatus);
router.post('/verify-frontend', protect, verifyPaymentFromFrontend);

module.exports = router;
