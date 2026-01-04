const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');

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
        vendorId // Explicitly passed from frontend now
    } = req.body;

    if (items && items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            user: req.user._id,
            vendor: vendorId, // Assign vendor if present
            pickupLocation,
            dropoffLocation,
            items,
            totalAmount,
            notes,
        });

        const createdOrder = await order.save();

        // Notify Vendors/Drivers (Broadcast generally or to specific rooms if implemented)
        // For simplicity, we can emit a global 'orders_changed' event or just rely on polling for lists
        // Ideally, we emit to a room 'vendor_<vendorId>'
        const io = req.app.get('io');
        io.emit('orders_updated', { type: 'new_order', order: createdOrder });

        res.status(201).json(createdOrder);
    }
});

// @desc    Get user orders (or all if admin/driver/vendor)
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
        }).populate('user', 'id name phone');
    } else if (req.user.role === 'vendor' || req.user.role === 'restaurant') {
        // Find the Vendor document owned by this user
        const vendor = await Vendor.findOne({ owner: req.user._id });
        if (vendor) {
            orders = await Order.find({ vendor: vendor._id }).populate('user', 'id name');
        } else {
            orders = [];
        }
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
        // If driver updates status and order has no driver, assign them
        if (req.user.role === 'driver' && !order.driver) {
            order.driver = req.user._id;
        }

        order.status = req.body.status || order.status;
        if (req.body.paymentStatus) {
            order.paymentStatus = req.body.paymentStatus;
        }

        let updatedOrder = await order.save();
        updatedOrder = await updatedOrder.populate('user', 'name phone');

        const io = req.app.get('io');
        // Notify anyone watching this specific order (Customer tracking page)
        io.to(order._id.toString()).emit('order_status_updated', updatedOrder);
        // Notify lists to refresh
        io.emit('orders_updated', { type: 'update', order: updatedOrder });

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
