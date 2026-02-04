const logger = require('../config/logger');

/**
 * Send an SMS message.
 *
 * In production, integrate with your SMS gateway/provider.
 * For now, this uses a safe dev-mode logger so teams can test OTP flows locally.
 */
const sendSms = async ({ toE164, message }) => {
    // Never log OTP contents in production
    if (process.env.NODE_ENV === 'production') {
        logger.info('SMS send requested', { toE164 });
        // TODO: integrate real provider
        return;
    }

    const debugEnabled = String(process.env.OTP_DEBUG || '').toLowerCase() === 'true';
    if (debugEnabled) {
        logger.info('DEV SMS (OTP_DEBUG=true)', { toE164, message });
    } else {
        logger.info('DEV SMS (hidden). Set OTP_DEBUG=true to log body.', { toE164 });
    }
};

module.exports = { sendSms };
