const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Order = require('../models/Order');

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

    // Chapa Config
    const CHAPA_URL = 'https://api.chapa.co/v1/transaction/initialize';
    // Use a test key or env variable. Here we use a public test key if available, else placeholder.
    // Ideally put this in .env: CHAPA_SECRET_KEY
    const CHAPA_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-your-chapa-test-key';

    // In production, user needs to provide their real CHAPA KEY in .env
    // We will use a dummy success structure for the demo if KEY is not valid, 
    // but code below attempts real Chapa call.

    // Construct Callback URL (frontend usually)
    const TEXT_REF = 'tx-' + order._id + '-' + Date.now();

    // Chapa often rejects 'example.com' domain in their validation rules.
    // We'll use the user's email but swap the domain if it's example.com for the Chapa call.
    let userEmail = req.user.email ? req.user.email.trim().toLowerCase() : 'customer@gmail.com';
    if (userEmail.endsWith('@example.com')) {
        userEmail = userEmail.replace('@example.com', '@gmail.com');
    }
    const userName = req.user.name || 'Saro Customer';

    const data = {
        amount: Math.round(order.totalAmount), // Chapa requires integers for some currencies, but good to be safe
        currency: 'ETB',
        email: userEmail,
        first_name: userName.split(' ')[0] || 'Customer',
        last_name: userName.split(' ')[1] || 'User',
        tx_ref: TEXT_REF,
        callback_url: `http://localhost:5000/api/payment/verify/${TEXT_REF}`,
        return_url: `http://localhost:5173/dashboard`,
        customization: {
            title: 'Saro Delivery',
            description: 'Payment for order ' + order._id
        }
    };

    console.log('Initiating Chapa Payment with data:', JSON.stringify(data, null, 2));

    try {
        const response = await axios.post(CHAPA_URL, data, {
            headers: {
                Authorization: 'Bearer ' + CHAPA_KEY,
                'Content-Type': 'application/json'
            }
        });

        // Save tx_ref to order if needed (or just rely on payment status update via webhook/callback)
        // For now, simple redirect
        res.json({ checkout_url: response.data.data.checkout_url });

    } catch (error) {
        const chapaError = error.response ? error.response.data : error.message;
        console.error('Chapa Error:', chapaError);

        res.status(500).json({
            message: 'Payment initialization failed',
            error: chapaError
        });
    }
});

const verifyPayment = asyncHandler(async (req, res) => {
    const { id } = req.params; // tx_ref
    const CHAPA_URL = `https://api.chapa.co/v1/transaction/verify/${id}`;
    const CHAPA_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-your-chapa-test-key';

    try {
        const response = await axios.get(CHAPA_URL, {
            headers: {
                Authorization: 'Bearer ' + CHAPA_KEY,
            }
        });

        if (response.data.status === 'success') {
            const tx_ref = response.data.data.tx_ref;
            const orderId = tx_ref.split('-')[1]; // Based on tx-orderId-timestamp
            const order = await Order.findById(orderId);

            if (order) {
                order.paymentStatus = 'paid';
                order.status = 'confirmed';
                await order.save();

                const io = req.app.get('io');
                io.emit('orders_updated', { type: 'payment_success', orderId });

                // Redirect to dashboard or success page on frontend
                return res.redirect(`http://localhost:5173/dashboard?payment=success&order=${orderId}`);
            }
        }

        res.redirect(`http://localhost:5173/dashboard?payment=failed`);
    } catch (error) {
        console.error('Chapa Verify Error:', error.response ? error.response.data : error.message);
        res.redirect(`http://localhost:5173/dashboard?payment=error`);
    }
});

module.exports = { initializePayment, verifyPayment };
