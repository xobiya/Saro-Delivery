const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/deliveries
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const {
        pickupLocation,
        dropoffLocation,
        items,
        totalAmount,
        notes,
    } = req.body;

    if (items && items.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        const order = new Order({
            user: req.user._id,
            pickupLocation,
            dropoffLocation,
            items,
            totalAmount,
            notes,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
});

// @desc    Get user orders (or all if admin/driver)
// @route   GET /api/deliveries
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
    let orders;
    if (req.user.role === 'admin') {
        orders = await Order.find({}).populate('user', 'id name');
    } else if (req.user.role === 'driver') {
        // Drivers see available orders (pending/preparing) or orders assigned to them
        orders = await Order.find({
            $or: [
                { driver: req.user._id },
                { status: 'pending' },
                { status: 'preparing' },
                { status: 'ready' }
            ]
        }).populate('user', 'id name');
    } else {
        orders = await Order.find({ user: req.user._id });
    }
    res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/deliveries/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('driver', 'name email');

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order status
// @route   PUT /api/deliveries/:id
// @access  Private (Driver/Vendor/Admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Logic for assigning driver
        if (req.body.status === 'in_transit' && !order.driver) {
            order.driver = req.user._id;
        }

        order.status = req.body.status || order.status;
        if (req.body.paymentStatus) {
            order.paymentStatus = req.body.paymentStatus;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
};
