const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, getMe } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const passport = require('passport');
const { getFrontendUrl } = require('../config/env');
const { generateTokenForUser } = require('../utils/jwt');

const requirePassportStrategy = (strategyName) => (req, res, next) => {
	try {
		const strategy = passport._strategy(strategyName);
		if (!strategy) {
			return res.status(501).json({
				success: false,
				message: `${strategyName} authentication is not configured on the server. Set the required OAuth environment variables and restart the backend.`,
			});
		}
		return next();
	} catch (err) {
		return next(err);
	}
};

// Note: token creation includes tokenVersion for logout-all support

const { validate, registerSchema, loginSchema, otpStartSchema, otpVerifySchema, otpCompleteSchema } = require('../middleware/validationMiddleware');
const { startOtp, verifyOtp, completeOtpSignup } = require('../controllers/otpAuthController');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, vendor, driver, admin]
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', validate(registerSchema), registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), loginUser);
router.get('/users', protect, admin, getUsers);

router.get('/me', protect, getMe);

// OTP auth (Ethiopia-first)
router.post('/otp/start', validate(otpStartSchema), startOtp);
router.post('/otp/verify', validate(otpVerifySchema), verifyOtp);
router.post('/otp/complete', validate(otpCompleteSchema), completeOtpSignup);

// OAuth: Google
router.get('/google', (req, res, next) => {
	// pass redirect through OAuth flow
	if (req.query.redirect) {
		req.session.oauthRedirect = String(req.query.redirect);
	}
	next();
}, requirePassportStrategy('google'), (req, res, next) => {
	passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get(
	'/google/callback',
	requirePassportStrategy('google'),
	passport.authenticate('google', { session: false, failureRedirect: `${getFrontendUrl()}/login?oauth=failed` }),
	(req, res) => {
		const frontendUrl = getFrontendUrl();
		const redirect = (req.session && req.session.oauthRedirect) ? String(req.session.oauthRedirect) : '/';
		if (req.session) req.session.oauthRedirect = undefined;
		const token = generateTokenForUser(req.user);

		res.redirect(`${frontendUrl}/oauth/callback?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(redirect)}`);
	}
);

// OAuth: Facebook
router.get('/facebook', (req, res, next) => {
	if (req.query.redirect) {
		req.session.oauthRedirect = String(req.query.redirect);
	}
	next();
}, requirePassportStrategy('facebook'), (req, res, next) => {
	passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
});

router.get(
	'/facebook/callback',
	requirePassportStrategy('facebook'),
	passport.authenticate('facebook', { session: false, failureRedirect: `${getFrontendUrl()}/login?oauth=failed` }),
	(req, res) => {
		const frontendUrl = getFrontendUrl();
		const redirect = (req.session && req.session.oauthRedirect) ? String(req.session.oauthRedirect) : '/';
		if (req.session) req.session.oauthRedirect = undefined;
		const token = generateTokenForUser(req.user);

		res.redirect(`${frontendUrl}/oauth/callback?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(redirect)}`);
	}
);

module.exports = router;
