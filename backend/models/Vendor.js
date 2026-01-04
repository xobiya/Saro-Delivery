const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // The user account managing this vendor profile
    },
    businessName: {
        type: String,
        required: [true, 'Please add a business name'],
        unique: true,
    },
    description: {
        type: String, // e.g., "Best Pizza in Town"
    },
    categories: [{
        type: String, // e.g., ["Fast Food", "Pizza", "Ethiopian"]
    }],
    logoUrl: {
        type: String,
    },
    bannerUrl: {
        type: String,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
        address: {
            type: String,
            required: true,
        }
    },
    isOpen: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

vendorSchema.index({ location: '2dsphere' }); // For geospatial queries (finding nearby vendors)

module.exports = mongoose.model('Vendor', vendorSchema);
