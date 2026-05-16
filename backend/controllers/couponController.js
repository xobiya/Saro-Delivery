const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
        res.status(404);
        throw new Error('Invalid or expired coupon code');
    }

    if (new Date() > coupon.expiresAt) {
        res.status(400);
        throw new Error('Coupon has expired');
    }

    if (orderAmount < coupon.minOrderAmount) {
        res.status(400);
        throw new Error(`Minimum order amount for this coupon is ${coupon.minOrderAmount} ETB`);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        res.status(400);
        throw new Error('Coupon usage limit reached');
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
        discount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
    } else {
        discount = coupon.discountValue;
    }

    res.json({
        code: coupon.code,
        discount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
    });
});

// @desc    Create a coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiresAt, usageLimit } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
        res.status(400);
        throw new Error('Coupon code already exists');
    }

    const coupon = await Coupon.create({
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        expiresAt,
        usageLimit
    });

    res.status(201).json(coupon);
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
});

module.exports = {
    validateCoupon,
    createCoupon,
    getCoupons
};
