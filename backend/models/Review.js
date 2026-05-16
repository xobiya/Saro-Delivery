const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Vendor',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple reviews for the same order
reviewSchema.index({ order: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
