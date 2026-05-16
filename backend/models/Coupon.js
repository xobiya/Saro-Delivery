const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage',
    },
    discountValue: {
        type: Number,
        required: true,
    },
    minOrderAmount: {
        type: Number,
        default: 0,
    },
    maxDiscount: {
        type: Number, // Only relevant for percentage
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usageLimit: {
        type: Number,
    },
    usedCount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
