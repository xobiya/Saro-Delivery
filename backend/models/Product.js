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
    basePrice: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    imageUrl: {
        type: String,
    },
    category: {
        type: String, // e.g., "Main Dish", "Injera Combo", "Fast Food"
    },
    variants: [{
        name: { type: String, required: true }, // e.g., "Large", "Combo 1"
        price: { type: Number, required: true }
    }],
    addOns: [{
        name: { type: String, required: true }, // e.g., "Extra Ayib", "Soft Drink"
        price: { type: Number, default: 0 }
    }],
    isAvailable: {
        type: Boolean,
        default: true,
    },
    isEthiopian: {
        type: Boolean,
        default: false
    },
    tags: [String], // e.g. "Spicy", "Vegan"
    nutrition: {
        calories: Number,
        allergens: [String]
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
