const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = mongoose.Schema({
    label: { type: String, default: 'Home' }, // e.g., Home, Work
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { _id: false });

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
        required: [true, 'Please add a password'],
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
        required: [true, 'Please add a phone number'],
    },
    addresses: [addressSchema],
    active: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

// Index on email for faster lookups
userSchema.index({ email: 1 });

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
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
