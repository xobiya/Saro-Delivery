const express = require('express');
const router = express.Router();
const { createReview, getVendorReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createReview);
router.route('/vendor/:vendorId').get(getVendorReviews);

module.exports = router;
