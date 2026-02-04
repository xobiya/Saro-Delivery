const mongoose = require('mongoose');

const otpCodeSchema = mongoose.Schema(
    {
        phoneE164: { type: String, required: true, index: true },
        purpose: { type: String, enum: ['login', 'signup', 'phone_change', 'reauth'], default: 'login' },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
        codeHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        attempts: { type: Number, default: 0 },
        maxAttempts: { type: Number, default: 5 },
        consumedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpCode', otpCodeSchema);
