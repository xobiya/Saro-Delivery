const crypto = require('crypto');

const generateOtpCode = () => {
    // 6-digit numeric
    return String(Math.floor(100000 + Math.random() * 900000));
};

const hashOtpCode = (phoneE164, code, secret) => {
    const key = secret || 'otp-secret-missing';
    return crypto
        .createHmac('sha256', key)
        .update(`${phoneE164}:${code}`)
        .digest('hex');
};

module.exports = {
    generateOtpCode,
    hashOtpCode,
};
