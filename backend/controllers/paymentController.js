const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Order = require('../models/Order');
const logger = require('../config/logger');
const { getFrontendUrl } = require('../config/env');

// Track processed payments to prevent double-processing
const processedPayments = new Set();

// @desc    Initialize Chapa Payment
// @route   POST /api/payment/chapa
// @access  Private
const initializePayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Verify user owns this order
    if (order.user._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to pay for this order');
    }

    // Check if order is already paid
    if (order.paymentStatus === 'completed') {
        res.status(400);
        throw new Error('Order is already paid');
    }

    // Chapa Config
    const CHAPA_URL = 'https://api.chapa.co/v1/transaction/initialize';
    const CHAPA_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-your-chapa-test-key';

    if (!CHAPA_KEY || CHAPA_KEY.includes('your-chapa-test-key')) {
        logger.error('Chapa secret key not configured properly');
        res.status(500);
        throw new Error('Payment gateway not configured');
    }

    const frontendUrl = getFrontendUrl();

    // Generate unique transaction reference
    const TEXT_REF = `tx-${order._id}-${Date.now()}`;

    // Sanitize user email for Chapa (they reject example.com)
    let userEmail = req.user.email ? req.user.email.trim().toLowerCase() : 'customer@gmail.com';
    if (userEmail.endsWith('@example.com')) {
        userEmail = userEmail.replace('@example.com', '@gmail.com');
    }
    const userName = req.user.name || 'Saro Customer';

    const data = {
        amount: Math.round(order.totalAmount), // Chapa requires whole numbers
        currency: 'ETB',
        email: userEmail,
        first_name: userName.split(' ')[0] || 'Customer',
        last_name: userName.split(' ')[1] || 'User',
        tx_ref: TEXT_REF,
        callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/verify/${TEXT_REF}`,
        return_url: `${frontendUrl}/dashboard`,
        customization: {
            title: 'Saro Delivery',
            description: `Payment for order ${order._id}`
        }
    };

    logger.info('Initiating Chapa payment', {
        orderId: order._id,
        amount: data.amount,
        txRef: TEXT_REF,
        userId: req.user._id
    });

    try {
        const response = await axios.post(CHAPA_URL, data, {
            headers: {
                Authorization: `Bearer ${CHAPA_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });

        logger.info('Chapa payment initialized successfully', {
            orderId: order._id,
            txRef: TEXT_REF
        });

        res.json({ checkout_url: response.data.data.checkout_url });

    } catch (error) {
        const chapaError = error.response ? error.response.data : error.message;
        logger.error('Chapa payment initialization failed', {
            orderId: order._id,
            error: chapaError,
            userId: req.user._id
        });

        res.status(500).json({
            message: 'Payment initialization failed',
            error: process.env.NODE_ENV === 'development' ? chapaError : 'Please try again later'
        });
    }
});

// @desc    Verify Chapa Payment
// @route   GET /api/payment/verify/:id
// @access  Public (called by Chapa)
const verifyPayment = asyncHandler(async (req, res) => {
    const { id } = req.params; // tx_ref

    // Prevent duplicate processing
    if (processedPayments.has(id)) {
        logger.warn('Duplicate payment verification attempt', { txRef: id });
        return res.redirect(`${getFrontendUrl()}/dashboard?payment=already_processed`);
    }

    const CHAPA_URL = `https://api.chapa.co/v1/transaction/verify/${id}`;
    const CHAPA_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-your-chapa-test-key';

    try {
        const response = await axios.get(CHAPA_URL, {
            headers: {
                Authorization: `Bearer ${CHAPA_KEY}`,
            },
            timeout: 10000
        });

        logger.info('Chapa payment verification response', {
            txRef: id,
            status: response.data.status,
            responseData: response.data.data
        });

        if (response.data.status === 'success' && response.data.data.status === 'success') {
            const tx_ref = response.data.data.tx_ref;
            const paidAmount = parseFloat(response.data.data.amount);

            // Extract orderId from tx_ref (format: tx-orderId-timestamp)
            const orderId = tx_ref.split('-')[1];
            const order = await Order.findById(orderId);

            if (!order) {
                logger.error('Order not found for payment verification', { orderId, txRef: tx_ref });
                return res.redirect(`${getFrontendUrl()}/dashboard?payment=order_not_found`);
            }

            // CRITICAL: Verify amount matches
            if (Math.abs(paidAmount - order.totalAmount) > 0.01) {
                logger.error('Payment amount mismatch detected', {
                    orderId,
                    expectedAmount: order.totalAmount,
                    paidAmount,
                    txRef: tx_ref
                });
                return res.redirect(`${getFrontendUrl()}/dashboard?payment=amount_mismatch`);
            }

            // Check if already processed
            if (order.paymentStatus === 'completed') {
                logger.warn('Order already marked as paid', { orderId, txRef: tx_ref });
                processedPayments.add(id);
                return res.redirect(`${getFrontendUrl()}/dashboard?payment=already_paid&order=${orderId}`);
            }

            // Update order
            order.paymentStatus = 'completed';
            order.status = 'confirmed';
            await order.save();

            // Mark as processed
            processedPayments.add(id);

            // Notify via Socket.io
            const io = req.app.get('io');
            io.emit('orders_updated', { type: 'payment_success', orderId });

            logger.info('Payment verification successful', {
                orderId,
                amount: paidAmount,
                txRef: tx_ref
            });

            return res.redirect(`${getFrontendUrl()}/dashboard?payment=success&order=${orderId}`);
        }

        logger.warn('Payment verification failed - not successful', {
            txRef: id,
            status: response.data.status,
            dataStatus: response.data.data?.status
        });

        res.redirect(`${getFrontendUrl()}/dashboard?payment=failed`);

    } catch (error) {
        logger.error('Chapa payment verification error', {
            txRef: id,
            error: error.response ? error.response.data : error.message
        });
        res.redirect(`${getFrontendUrl()}/dashboard?payment=error`);
    }
});

module.exports = { initializePayment, verifyPayment };
