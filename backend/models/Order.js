const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Customer who created the order
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Vendor fulfilling the order
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Driver assigned to the order
    },
    type: {
        type: String,
        enum: ['food_delivery', 'package_delivery', 'pickup'],
        default: 'food_delivery',
    },
    pickupLocation: {
        address: { type: String, required: true },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    dropoffLocation: {
        address: { type: String, required: true },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount must be positive']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    notes: {
        type: String,
    }
}, {
    timestamps: true,
});

// Indexes for performance optimization
orderSchema.index({ user: 1, createdAt: -1 }); // User's orders sorted by date
orderSchema.index({ status: 1, vendor: 1 }); // Vendor filtering by status
orderSchema.index({ driver: 1, status: 1 }); // Driver filtering by status
orderSchema.index({ status: 1, createdAt: -1 }); // Admin filtering by status and date

module.exports = mongoose.model('Order', orderSchema);
