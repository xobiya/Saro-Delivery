const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const OtpCode = require('../models/OtpCode');
const logger = require('../config/logger');
const { normalizeEthiopiaPhone } = require('../utils/phone');
const { generateOtpCode, hashOtpCode } = require('../utils/otp');
const { sendSms } = require('../utils/sms');

const sanitizeText = (value, maxLen = 200) => {
    if (value === undefined || value === null) return '';
    return String(value).trim().slice(0, maxLen);
};

const maskPhone = (value) => {
    const s = String(value || '');
    if (s.length <= 5) return s;
    return s.slice(0, 4) + '***' + s.slice(-2);
};

const findAddressByParam = (addresses, addressIdParam) => {
    if (!Array.isArray(addresses)) return null;

    // Primary: match by Mongo subdocument _id
    const byId = addresses.id ? addresses.id(addressIdParam) : null;
    if (byId) return byId;

    // Back-compat fallback: allow numeric index
    const idx = Number(addressIdParam);
    if (Number.isInteger(idx) && idx >= 0 && idx < addresses.length) {
        return addresses[idx];
    }

    return null;
};

const ensureHasActiveAddressAfterChange = (user) => {
    const activeCount = Array.isArray(user.addresses)
        ? user.addresses.filter((a) => a && a.active !== false).length
        : 0;
    if (activeCount <= 0) {
        throw new Error('At least one active delivery address is required');
    }
};

// GET /api/profile
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: !!user.emailVerifiedAt,
        phone: user.phone || '',
        phoneVerified: !!user.phoneVerifiedAt,
        avatarUrl: user.avatarUrl || '',
        role: user.role,
        authProvider: user.authProvider || 'local',
        preferences: user.preferences || { language: 'en', theme: 'system', notifications: { sms: true, email: false, push: false, promotions: true } },
        addresses: (user.addresses || []).filter((a) => a && a.active !== false),
        paymentMethods: (user.paymentMethods || []).filter((m) => m && m.active !== false).map((m) => ({
            _id: m._id,
            type: m.type,
            label: m.label,
            mobileMoneyProvider: m.mobileMoneyProvider,
            maskedPhone: m.maskedPhone,
            cardBrand: m.cardBrand,
            cardLast4: m.cardLast4,
            isDefault: !!m.isDefault,
        })),
    });
});

// PUT /api/profile
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const nextName = sanitizeText(req.body.name, 80);
    const nextEmail = sanitizeText(req.body.email, 120).toLowerCase();
    const nextLanguage = sanitizeText(req.body.language, 10);

    if (nextName && nextName.length < 2) {
        res.status(400);
        throw new Error('Full name must be at least 2 characters');
    }

    if (nextEmail && !/^\S+@\S+\.\S+$/.test(nextEmail)) {
        res.status(400);
        throw new Error('Please enter a valid email');
    }

    if (nextEmail && nextEmail !== user.email) {
        const exists = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
        if (exists) {
            res.status(400);
            throw new Error('Email already in use');
        }
        user.email = nextEmail;
        user.emailVerifiedAt = null; // requires verification flow
    }

    if (nextName) user.name = nextName;

    if (!user.preferences) user.preferences = {};
    if (nextLanguage && ['en', 'am'].includes(nextLanguage)) {
        user.preferences.language = nextLanguage;
    }

    if (req.body.notifications && typeof req.body.notifications === 'object') {
        user.preferences.notifications = {
            sms: !!req.body.notifications.sms,
            email: !!req.body.notifications.email,
            push: !!req.body.notifications.push,
            promotions: !!req.body.notifications.promotions,
        };
    }

    if (req.body.theme && ['system', 'light', 'dark'].includes(String(req.body.theme))) {
        user.preferences.theme = String(req.body.theme);
    }

    await user.save();

    logger.info('Profile updated', { userId: user._id });

    res.json({ ok: true });
});

// POST /api/profile/avatar (multipart/form-data)
const updateAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    logger.info('Avatar updated', { userId: user._id });

    res.json({ avatarUrl: user.avatarUrl });
});

// Addresses
// POST /api/profile/addresses
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const address = {
        label: sanitizeText(req.body.label || 'Home', 40) || 'Home',
        city: sanitizeText(req.body.city, 80),
        area: sanitizeText(req.body.area, 80),
        streetOrLandmark: sanitizeText(req.body.streetOrLandmark, 140),
        notes: sanitizeText(req.body.notes, 200),
        coordinates: req.body.coordinates && typeof req.body.coordinates === 'object'
            ? {
                lat: typeof req.body.coordinates.lat === 'number' ? req.body.coordinates.lat : undefined,
                lng: typeof req.body.coordinates.lng === 'number' ? req.body.coordinates.lng : undefined,
            }
            : undefined,
        isDefault: !!req.body.isDefault,
        active: true,
    };

    if (!address.city) {
        res.status(400);
        throw new Error('City is required');
    }
    if (!address.streetOrLandmark) {
        res.status(400);
        throw new Error('Street or landmark is required');
    }

    if (!Array.isArray(user.addresses)) user.addresses = [];

    // If first address, force default.
    const hasActive = user.addresses.some((a) => a && a.active !== false);
    if (!hasActive) address.isDefault = true;

    if (address.isDefault) {
        user.addresses.forEach((a) => {
            if (a) a.isDefault = false;
        });
    }

    user.addresses.push(address);
    await user.save();

    logger.info('Address added', { userId: user._id });

    res.status(201).json({ ok: true, addresses: user.addresses.filter((a) => a && a.active !== false) });
});

// PUT /api/profile/addresses/:addressId
const updateAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { addressId } = req.params;
    const addr = findAddressByParam(user.addresses || [], addressId);
    if (!addr || addr.active === false) {
        res.status(404);
        throw new Error('Address not found');
    }

    if (req.body.label !== undefined) addr.label = sanitizeText(req.body.label, 40) || addr.label;
    if (req.body.city !== undefined) addr.city = sanitizeText(req.body.city, 80) || addr.city;
    if (req.body.area !== undefined) addr.area = sanitizeText(req.body.area, 80);
    if (req.body.streetOrLandmark !== undefined) addr.streetOrLandmark = sanitizeText(req.body.streetOrLandmark, 140) || addr.streetOrLandmark;
    if (req.body.notes !== undefined) addr.notes = sanitizeText(req.body.notes, 200);

    if (req.body.coordinates && typeof req.body.coordinates === 'object') {
        const lat = req.body.coordinates.lat;
        const lng = req.body.coordinates.lng;
        addr.coordinates = {
            lat: typeof lat === 'number' ? lat : addr.coordinates?.lat,
            lng: typeof lng === 'number' ? lng : addr.coordinates?.lng,
        };
    }

    if (req.body.isDefault === true) {
        (user.addresses || []).forEach((a) => {
            if (a) a.isDefault = false;
        });
        addr.isDefault = true;
    }

    await user.save();

    logger.info('Address updated', { userId: user._id, addressId });

    res.json({ ok: true, addresses: user.addresses.filter((a) => a && a.active !== false) });
});

// DELETE /api/profile/addresses/:addressId (soft delete)
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { addressId } = req.params;
    const addr = findAddressByParam(user.addresses || [], addressId);
    if (!addr || addr.active === false) {
        res.status(404);
        throw new Error('Address not found');
    }

    addr.active = false;
    addr.isDefault = false;

    // Ensure minimum one active address remains
    ensureHasActiveAddressAfterChange(user);

    // Ensure there is a default among active
    const active = user.addresses.filter((a) => a && a.active !== false);
    if (active.length > 0 && !active.some((a) => a.isDefault)) {
        active[0].isDefault = true;
    }

    await user.save();

    logger.info('Address deleted', { userId: user._id, addressId });

    res.json({ ok: true, addresses: user.addresses.filter((a) => a && a.active !== false) });
});

// Phone change OTP
// POST /api/profile/phone/start
const startPhoneChange = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const phoneE164 = normalizeEthiopiaPhone(req.body.phone);
    if (!phoneE164) {
        res.status(400);
        throw new Error('Please enter a valid Ethiopian phone number');
    }

    if (user.phone && user.phone === phoneE164) {
        res.status(400);
        throw new Error('That is already your phone number');
    }

    const existing = await User.findOne({ phone: phoneE164 });
    if (existing) {
        res.status(400);
        throw new Error('Phone number already in use');
    }

    const recent = await OtpCode.findOne({
        phoneE164,
        purpose: 'phone_change',
        user: user._id,
        createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    });
    if (recent) {
        res.status(429);
        throw new Error('Please wait a moment before requesting another code');
    }

    const code = generateOtpCode();
    const codeHash = hashOtpCode(phoneE164, code, process.env.OTP_SECRET || process.env.JWT_SECRET);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRE_SECONDS, 10) || 300) * 1000);

    await OtpCode.create({ phoneE164, purpose: 'phone_change', user: user._id, codeHash, expiresAt });

    await sendSms({
        toE164: phoneE164,
        message: `Your Saro Delivery code to change your phone is ${code}. It expires in 5 minutes.`,
    });

    logger.info('Phone change OTP issued', { userId: user._id, phone: maskPhone(phoneE164) });

    res.json({ ok: true, phone: phoneE164, expiresInSeconds: Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)) });
});

// POST /api/profile/phone/verify
const verifyPhoneChange = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const phoneE164 = normalizeEthiopiaPhone(req.body.phone);
    const code = sanitizeText(req.body.code, 6);

    if (!phoneE164 || !/^\d{6}$/.test(code)) {
        res.status(400);
        throw new Error('Invalid phone number or code');
    }

    const active = await OtpCode.findOne({
        phoneE164,
        purpose: 'phone_change',
        user: user._id,
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

    const existing = await User.findOne({ phone: phoneE164, _id: { $ne: user._id } });
    if (existing) {
        res.status(400);
        throw new Error('Phone number already in use');
    }

    active.consumedAt = new Date();
    await active.save();

    user.phone = phoneE164;
    user.phoneVerifiedAt = new Date();
    await user.save();

    logger.info('Phone changed', { userId: user._id, phone: maskPhone(phoneE164) });

    res.json({ ok: true, phone: user.phone });
});

// Security: start reauth OTP to current phone
// POST /api/profile/security/reauth/start
const startReauthOtp = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!user.phone) {
        res.status(400);
        throw new Error('No phone number on file');
    }

    const phoneE164 = user.phone;

    const recent = await OtpCode.findOne({
        phoneE164,
        purpose: 'reauth',
        user: user._id,
        createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    });
    if (recent) {
        res.status(429);
        throw new Error('Please wait a moment before requesting another code');
    }

    const code = generateOtpCode();
    const codeHash = hashOtpCode(phoneE164, code, process.env.OTP_SECRET || process.env.JWT_SECRET);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRE_SECONDS, 10) || 300) * 1000);

    await OtpCode.create({ phoneE164, purpose: 'reauth', user: user._id, codeHash, expiresAt });

    await sendSms({
        toE164: phoneE164,
        message: `Your Saro Delivery security code is ${code}. It expires in 5 minutes.`,
    });

    logger.info('Reauth OTP issued', { userId: user._id });

    res.json({ ok: true, expiresInSeconds: Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)) });
});

const verifyReauthOtp = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!user.phone) {
        res.status(400);
        throw new Error('No phone number on file');
    }

    const phoneE164 = user.phone;
    const code = sanitizeText(req.body.code, 6);

    if (!/^\d{6}$/.test(code)) {
        res.status(400);
        throw new Error('Invalid code');
    }

    const active = await OtpCode.findOne({
        phoneE164,
        purpose: 'reauth',
        user: user._id,
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
        throw new Error('Incorrect code');
    }

    active.consumedAt = new Date();
    await active.save();

    // Create a short-lived reauth token
    const token = crypto.randomBytes(24).toString('hex');
    const reauthToken = `${user._id.toString()}.${token}`;

    // Store hashed reauth token on user for one-time use
    const tokenHash = crypto.createHash('sha256').update(reauthToken).digest('hex');
    user.reauthTokenHash = tokenHash;
    user.reauthTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    res.json({ ok: true, reauthToken });
});

// POST /api/profile/security/logout-all
const logoutAllDevices = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    logger.info('Logout all devices', { userId: user._id });

    res.json({ ok: true });
});

// POST /api/profile/security/delete
const deleteAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+reauthTokenHash +reauthTokenExpiresAt');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const reauthToken = sanitizeText(req.body.reauthToken, 200);
    if (!reauthToken) {
        res.status(401);
        throw new Error('Re-auth required');
    }

    const tokenHash = crypto.createHash('sha256').update(reauthToken).digest('hex');
    const now = new Date();
    const validHash = user.reauthTokenHash && user.reauthTokenHash === tokenHash;
    const validTime = user.reauthTokenExpiresAt && user.reauthTokenExpiresAt > now;

    if (!validHash || !validTime) {
        res.status(401);
        throw new Error('Re-auth expired. Please verify again.');
    }

    user.reauthTokenHash = '';
    user.reauthTokenExpiresAt = null;

    user.active = false;
    user.deletedAt = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    logger.info('Account soft-deleted', { userId: user._id });

    res.json({ ok: true });
});

module.exports = {
    getProfile,
    updateProfile,
    updateAvatar,
    addAddress,
    updateAddress,
    deleteAddress,
    startPhoneChange,
    verifyPhoneChange,
    startReauthOtp,
    verifyReauthOtp,
    logoutAllDevices,
    deleteAccount,
};
