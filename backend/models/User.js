const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = mongoose.Schema({
    label: { type: String, default: 'Home' }, // e.g., Home, Work
    city: { type: String, required: true },
    area: { type: String, default: '' }, // neighborhood / kebele
    streetOrLandmark: { type: String, required: true },
    notes: { type: String, default: '' },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    isDefault: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
}, { _id: true });

const paymentMethodSchema = mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['cash_on_delivery', 'mobile_money', 'card'],
            required: true,
        },
        label: { type: String, default: '' },

        // For mobile money (store only what is needed)
        mobileMoneyProvider: { type: String, default: '' }, // e.g. telebirr, cbe_birr
        maskedPhone: { type: String, default: '' },

        // For cards (tokenized only)
        cardBrand: { type: String, default: '' },
        cardLast4: { type: String, default: '' },
        tokenRef: { type: String, default: '' }, // token from payment provider (never raw card)

        isDefault: { type: Boolean, default: false },
        active: { type: Boolean, default: true },
    },
    { timestamps: true, _id: true }
);

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: false,
        minlength: 6,
        select: false, // Don't return password by default
    },
    role: {
        type: String,
        enum: ['customer', 'vendor', 'driver', 'admin'],
        default: 'customer',
    },
    phone: {
        type: String,
        required: false,
        default: null,
    },
    phoneVerifiedAt: {
        type: Date,
        default: null,
    },
    emailVerifiedAt: {
        type: Date,
        default: null,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        default: 'local',
    },
    googleId: {
        type: String,
        default: '',
    },
    facebookId: {
        type: String,
        default: '',
    },
    avatarUrl: {
        type: String,
        default: '',
    },
    addresses: [addressSchema],
    paymentMethods: [paymentMethodSchema],
    preferences: {
        language: { type: String, enum: ['en', 'am'], default: 'en' },
        theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
        notifications: {
            sms: { type: Boolean, default: true },
            email: { type: Boolean, default: false },
            push: { type: Boolean, default: false },
            promotions: { type: Boolean, default: true },
        },
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    tokenVersion: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
    deletedAt: {
        type: Date,
        default: null,
    },

    // One-time re-auth token for sensitive actions (hashed)
    reauthTokenHash: {
        type: String,
        default: '',
        select: false,
    },
    reauthTokenExpiresAt: {
        type: Date,
        default: null,
        select: false,
    },
}, {
    timestamps: true,
});

// Email already has a unique index via `unique: true` above.
// Phone should be unique when present (OTP login)
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    // Only hash when password exists and was changed.
    if (!this.password || !this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Remove password from JSON output
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);
