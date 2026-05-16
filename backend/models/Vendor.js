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
            default: [0, 0]
        },
        address: {
            type: String,
            default: ''
        }
    },
    deliveryAvailable: {
        type: Boolean,
        default: true
    },
    pickupAvailable: {
        type: Boolean,
        default: true
    },
    minimumOrder: {
        type: Number,
        default: 0
    },
    preparationTime: {
        type: Number,
        default: 30
    },
    operatingHours: {
        type: Object,
        default: {
            monday: { open: '09:00', close: '22:00', closed: false },
            tuesday: { open: '09:00', close: '22:00', closed: false },
            wednesday: { open: '09:00', close: '22:00', closed: false },
            thursday: { open: '09:00', close: '22:00', closed: false },
            friday: { open: '09:00', close: '23:00', closed: false },
            saturday: { open: '10:00', close: '23:00', closed: false },
            sunday: { open: '10:00', close: '21:00', closed: false },
        }
    },
    bankDetails: {
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        bankName: { type: String, default: '' }
    },
    taxId: {
        type: String,
        default: ''
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
