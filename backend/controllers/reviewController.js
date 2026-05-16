const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const logger = require('../config/logger');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if order belongs to user
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to review this order');
  }

  // Check if order is delivered
  if (order.status !== 'delivered') {
    res.status(400);
    throw new Error('You can only review delivered orders');
  }

  // Check if already reviewed
  const alreadyReviewed = await Review.findOne({ order: orderId });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Order already reviewed');
  }

  const review = await Review.create({
    user: req.user._id,
    vendor: order.vendor,
    order: orderId,
    rating: Number(rating),
    comment,
  });

  // Update vendor average rating
  const reviews = await Review.find({ vendor: order.vendor });
  const numReviews = reviews.length;
  const ratingSum = reviews.reduce((acc, item) => item.rating + acc, 0);
  const averageRating = ratingSum / numReviews;

  await Vendor.findByIdAndUpdate(order.vendor, {
    rating: averageRating.toFixed(1),
    numReviews,
  });

  logger.info('New review created', { reviewId: review._id, orderId, rating });

  res.status(201).json(review);
});

// @desc    Get reviews for a vendor
// @route   GET /api/reviews/vendor/:vendorId
// @access  Public
const getVendorReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ vendor: req.params.vendorId })
    .populate('user', 'name avatarUrl')
    .sort({ createdAt: -1 });

  res.json(reviews);
});

module.exports = {
  createReview,
  getVendorReviews,
};
