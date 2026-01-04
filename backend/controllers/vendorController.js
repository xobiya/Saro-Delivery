const asyncHandler = require('express-async-handler');
const Vendor = require('../models/Vendor');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
const getVendors = asyncHandler(async (req, res) => {
    const vendors = await Vendor.find({});
    res.json(vendors);
});

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Public
const getVendorById = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);
    if (vendor) {
        res.json(vendor);
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
});

module.exports = { getVendors, getVendorById };
