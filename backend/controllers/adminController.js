const asyncHandler = require('express-async-handler');
const Order = require('../models/Delivery'); // Assuming Delivery is our Order model
const User = require('../models/User');
const Vendor = require('../models/Vendor');

// @desc    Get comprehensive admin stats (Aggregated)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
    // 1. Core Platform Stats
    const usersCount = await User.countDocuments();
    const vendorsCount = await Vendor.countDocuments();
    const ordersCount = await Order.countDocuments();
    
    const revenueStats = await Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

    // 2. Revenue Chart Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const chartData = await Order.aggregate([
        { 
            $match: { 
                status: 'delivered',
                createdAt: { $gte: sevenDaysAgo } 
            } 
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orders: { $count: {} }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    // Map to user-friendly format for Recharts
    const formattedChartData = chartData.map(item => ({
        name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: item.revenue,
        orders: item.orders
    }));

    // 3. Category Breakdown (Channel Profitability)
    // Assuming products in orders have categories. This is simplified.
    const channelStats = [
        { name: 'Food', val: totalRevenue * 0.6 },
        { name: 'Grocery', val: totalRevenue * 0.25 },
        { name: 'Pharmacy', val: totalRevenue * 0.15 },
    ];

    res.json({
        stats: {
            users: usersCount,
            vendors: vendorsCount,
            orders: ordersCount,
            revenue: totalRevenue
        },
        chartData: formattedChartData,
        channelStats
    });
});

const Ticket = require('../models/Ticket');

// @desc    Get all support tickets
// @route   GET /api/admin/tickets
// @access  Private/Admin
const getTickets = asyncHandler(async (req, res) => {
    const tickets = await Ticket.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(tickets);
});

// @desc    Update ticket status or reply
// @route   PUT /api/admin/tickets/:id
// @access  Private/Admin
const updateTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (ticket) {
        ticket.status = req.body.status || ticket.status;
        ticket.priority = req.body.priority || ticket.priority;
        if (req.body.reply) {
            ticket.messages.push({ sender: 'admin', text: req.body.reply });
        }
        const updatedTicket = await ticket.save();
        res.json(updatedTicket);
    } else {
        res.status(404);
        throw new Error('Ticket not found');
    }
});

// @desc    Bulk Import Data (Vendors/Products)
// @route   POST /api/admin/import
// @access  Private/Admin
const bulkImport = asyncHandler(async (req, res) => {
    const { type, data } = req.body; // data is an array of objects from frontend CSV parsing
    
    if (type === 'vendors') {
        const createdVendors = await Vendor.insertMany(data);
        res.status(201).json({ message: `${createdVendors.length} merchants onboarded in bulk`, count: createdVendors.length });
    } else if (type === 'products') {
        const createdProducts = await Product.insertMany(data);
        res.status(201).json({ message: `${createdProducts.length} items added to catalog`, count: createdProducts.length });
    } else {
        res.status(400);
        throw new Error('Invalid import type');
    }
});

module.exports = { getAdminStats, getTickets, updateTicket, bulkImport };
