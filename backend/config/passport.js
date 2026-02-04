const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const crypto = require('crypto');
const User = require('../models/User');
const logger = require('./logger');

const upsertOAuthUser = async ({ provider, providerId, email, name, avatarUrl }) => {
    if (!email) {
        throw new Error(`${provider} account did not return an email address`);
    }

    const providerField = provider === 'google' ? 'googleId' : 'facebookId';

    let user = await User.findOne({ email });

    if (!user) {
        // Create a user that can later set password/phone in profile.
        const randomPassword = crypto.randomBytes(24).toString('hex');
        user = await User.create({
            name: name || 'User',
            email,
            password: randomPassword,
            role: 'customer',
            phone: null,
            authProvider: provider,
            [providerField]: providerId,
            avatarUrl: avatarUrl || '',
        });

        return user;
    }

    // Link provider to existing account if needed.
    let changed = false;
    if (!user[providerField]) {
        user[providerField] = providerId;
        changed = true;
    }
    if (!user.authProvider) {
        user.authProvider = 'local';
        changed = true;
    }
    if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        changed = true;
    }
    if (changed) {
        await user.save();
    }

    return user;
};

const configurePassport = () => {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const email = profile?.emails?.[0]?.value;
                        const name = profile?.displayName;
                        const avatarUrl = profile?.photos?.[0]?.value;

                        const user = await upsertOAuthUser({
                            provider: 'google',
                            providerId: profile.id,
                            email,
                            name,
                            avatarUrl,
                        });

                        return done(null, user);
                    } catch (err) {
                        logger.error('Google OAuth failed', { error: err.message });
                        return done(err);
                    }
                }
            )
        );
    } else {
        logger.warn('Google OAuth not configured (missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET)');
    }

    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
        passport.use(
            new FacebookStrategy(
                {
                    clientID: process.env.FACEBOOK_APP_ID,
                    clientSecret: process.env.FACEBOOK_APP_SECRET,
                    callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
                    profileFields: ['id', 'displayName', 'photos', 'email'],
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const email = profile?.emails?.[0]?.value;
                        const name = profile?.displayName;
                        const avatarUrl = profile?.photos?.[0]?.value;

                        const user = await upsertOAuthUser({
                            provider: 'facebook',
                            providerId: profile.id,
                            email,
                            name,
                            avatarUrl,
                        });

                        return done(null, user);
                    } catch (err) {
                        logger.error('Facebook OAuth failed', { error: err.message });
                        return done(err);
                    }
                }
            )
        );
    } else {
        logger.warn('Facebook OAuth not configured (missing FACEBOOK_APP_ID/FACEBOOK_APP_SECRET)');
    }
};

module.exports = {
    passport,
    configurePassport,
};
