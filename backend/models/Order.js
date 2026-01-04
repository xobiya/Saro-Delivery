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

module.exports = mongoose.model('Order', orderSchema);
