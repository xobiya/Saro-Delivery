const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('../config/logger');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, phone } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            logger.warn('Registration attempted with existing email', { email });
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            phone
        });

        if (user) {
            logger.info('New user registered', {
                userId: user._id,
                email: user.email,
                role: user.role
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        logger.error('User registration failed', {
            email,
            error: error.message
        });
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            logger.info('User logged in successfully', {
                userId: user._id,
                email: user.email,
                role: user.role
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            logger.warn('Failed login attempt', { email });
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        logger.error('Login error', {
            email,
            error: error.message
        });
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        logger.error('Failed to fetch users', { error: error.message });
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

module.exports = { registerUser, loginUser, getUsers };
