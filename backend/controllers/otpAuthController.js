const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OtpCode = require('../models/OtpCode');
const logger = require('../config/logger');
const { normalizeEthiopiaPhone } = require('../utils/phone');
const { generateOtpCode, hashOtpCode } = require('../utils/otp');
const { sendSms } = require('../utils/sms');
const { generateTokenForUser } = require('../utils/jwt');

const signOtpSession = ({ phoneE164 }) => {
    return jwt.sign(
        { phoneE164, otpVerified: true },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
    );
};

const verifyOtpSession = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.otpVerified || !decoded?.phoneE164) {
        throw new Error('Invalid OTP session');
    }
    return decoded;
};

// POST /api/auth/otp/start
const startOtp = asyncHandler(async (req, res) => {
    const phoneE164 = normalizeEthiopiaPhone(req.body.phone);
    const purpose = req.body.purpose === 'signup' ? 'signup' : 'login';

    if (!phoneE164) {
        res.status(400);
        throw new Error('Please enter a valid Ethiopian phone number');
    }

    // Basic per-phone throttling by checking recent OTPs
    const recent = await OtpCode.findOne({
        phoneE164,
        purpose,
        createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    });
    if (recent) {
        res.status(429);
        throw new Error('Please wait a moment before requesting another code');
    }

    const code = generateOtpCode();
    const codeHash = hashOtpCode(phoneE164, code, process.env.OTP_SECRET || process.env.JWT_SECRET);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRE_SECONDS, 10) || 300) * 1000);

    await OtpCode.create({ phoneE164, purpose, codeHash, expiresAt });

    await sendSms({
        toE164: phoneE164,
        message: `Your Saro Delivery verification code is ${code}. It expires in 5 minutes.`,
    });

    logger.info('OTP issued', { phoneE164, purpose });

    res.json({
        ok: true,
        phone: phoneE164,
        expiresInSeconds: Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)),
    });
});

// POST /api/auth/otp/verify
const verifyOtp = asyncHandler(async (req, res) => {
    const phoneE164 = normalizeEthiopiaPhone(req.body.phone);
    const code = String(req.body.code || '').trim();

    if (!phoneE164 || !/^\d{6}$/.test(code)) {
        res.status(400);
        throw new Error('Invalid phone number or code');
    }

    const active = await OtpCode.findOne({
        phoneE164,
        consumedAt: null,
        expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!active) {
        res.status(400);
        throw new Error('Code expired. Please request a new code.');
    }

    if (active.attempts >= active.maxAttempts) {
        res.status(429);
        throw new Error('Too many attempts. Please request a new code.');
    }

    const incomingHash = hashOtpCode(phoneE164, code, process.env.OTP_SECRET || process.env.JWT_SECRET);
    if (incomingHash !== active.codeHash) {
        active.attempts += 1;
        await active.save();
        res.status(400);
        throw new Error('Incorrect code. Please try again.');
    }

    active.consumedAt = new Date();
    await active.save();

    const user = await User.findOne({ phone: phoneE164 });

    if (user) {
        res.json({
            needsProfile: false,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            token: generateTokenForUser(user),
        });
        return;
    }

    // No user yet: return short-lived session token for completing signup.
    res.json({
        needsProfile: true,
        phone: phoneE164,
        otpSessionToken: signOtpSession({ phoneE164 }),
    });
});

// POST /api/auth/otp/complete
const completeOtpSignup = asyncHandler(async (req, res) => {
    const { otpSessionToken, name, role, email } = req.body;

    if (!otpSessionToken) {
        res.status(400);
        throw new Error('Missing OTP session');
    }

    const decoded = verifyOtpSession(otpSessionToken);
    const phoneE164 = decoded.phoneE164;

    const cleanName = String(name || '').trim();
    if (cleanName.length < 2) {
        res.status(400);
        throw new Error('Please enter your full name');
    }

    const allowedRole = role === 'driver' ? 'driver' : 'customer';

    // If email is provided, ensure not taken.
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    if (cleanEmail) {
        const existingEmail = await User.findOne({ email: cleanEmail });
        if (existingEmail) {
            res.status(400);
            throw new Error('Email already in use');
        }
    }

    const existingPhone = await User.findOne({ phone: phoneE164 });
    if (existingPhone) {
        // Treat as login
        res.json({
            _id: existingPhone._id,
            name: existingPhone.name,
            email: existingPhone.email,
            role: existingPhone.role,
            phone: existingPhone.phone || '',
            token: generateTokenForUser(existingPhone),
        });
        return;
    }

    const randomPassword = require('crypto').randomBytes(24).toString('hex');

    const user = await User.create({
        name: cleanName,
        email: cleanEmail || `${phoneE164.replace('+', '')}@saro.local`,
        password: randomPassword,
        role: allowedRole,
        phone: phoneE164,
        phoneVerifiedAt: new Date(),
        authProvider: 'local',
    });

    logger.info('OTP signup completed', { userId: user._id, phoneE164, role: allowedRole });

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        token: generateTokenForUser(user),
    });
});

module.exports = {
    startOtp,
    verifyOtp,
    completeOtpSignup,
};
