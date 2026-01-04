const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vendor',
    },
    name: {
        type: String,
        required: [true, 'Please add a product name'],
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    imageUrl: {
        type: String,
    },
    category: {
        type: String, // e.g., "Main Dish", "Drink"
    },
    options: [{
        name: { type: String }, // e.g., "Extra Cheese"
        priceModifier: { type: Number, default: 0 }
    }],
    isAvailable: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
