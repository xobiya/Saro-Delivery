const express = require('express');
const router = express.Router();
const { validateCoupon, createCoupon, getCoupons } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/validate', protect, validateCoupon);
router.route('/')
    .post(protect, admin, createCoupon)
    .get(protect, admin, getCoupons);

module.exports = router;
