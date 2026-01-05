const logger = require('./logger');

/**
 * Validate critical environment variables on application startup
 * Prevents application from running with missing or invalid configuration
 */
const validateEnvironment = () => {
    const requiredEnvVars = [
        'MONGO_URI',
        'JWT_SECRET',
        'NODE_ENV'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        logger.error('Missing required environment variables:', { missingVars });
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate JWT_SECRET strength in production
    if (process.env.NODE_ENV === 'production') {
        if (process.env.JWT_SECRET.length < 32) {
            logger.error('JWT_SECRET is too short for production use');
            throw new Error('JWT_SECRET must be at least 32 characters in production');
        }

        if (process.env.JWT_SECRET.includes('your-super-secret') ||
            process.env.JWT_SECRET.includes('change-in-production')) {
            logger.error('Default JWT_SECRET detected in production');
            throw new Error('Please change JWT_SECRET from default value in production');
        }

        // Validate CHAPA_SECRET_KEY is not using test key in production
        if (process.env.CHAPA_SECRET_KEY && process.env.CHAPA_SECRET_KEY.includes('TEST')) {
            logger.warn('WARNING: Using Chapa test key in production environment');
        }
    }

    logger.info('Environment validation passed', {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT || 5000
    });
};

/**
 * Get allowed origins for CORS configuration
 * @returns {Array<string>} List of allowed origin URLs
 */
const getAllowedOrigins = () => {
    const origins = process.env.ALLOWED_ORIGINS;

    if (!origins) {
        // Default to localhost in development
        if (process.env.NODE_ENV !== 'production') {
            return ['http://localhost:5173', 'http://localhost:3000'];
        }
        logger.warn('No ALLOWED_ORIGINS configured in production');
        return [];
    }

    return origins.split(',').map(origin => origin.trim());
};

/**
 * Get frontend URL for redirects
 * @returns {string} Frontend base URL
 */
const getFrontendUrl = () => {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
};

module.exports = {
    validateEnvironment,
    getAllowedOrigins,
    getFrontendUrl
};
