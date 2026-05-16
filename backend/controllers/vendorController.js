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

// @desc    Get vendor profile for logged in user
// @route   GET /api/vendors/me
// @access  Private (Vendor)
const getVendorProfile = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (vendor) {
        res.json(vendor);
    } else {
        res.status(404);
        throw new Error('Vendor profile not found');
    }
});

// @desc    Update vendor profile
// @route   PUT /api/vendors/me
// @access  Private (Vendor)
const updateVendorProfile = asyncHandler(async (req, res) => {
    let vendor = await Vendor.findOne({ owner: req.user._id });

    if (!vendor) {
        // Create one if it doesn't exist
        vendor = new Vendor({
            owner: req.user._id,
            businessName: req.body.businessName || `${req.user.name}'s Restaurant`,
            location: {
                type: 'Point',
                coordinates: [0, 0],
                address: req.body.address || ''
            }
        });
    }

    // Update fields
    vendor.businessName = req.body.businessName || vendor.businessName;
    vendor.description = req.body.description !== undefined ? req.body.description : vendor.description;
    vendor.categories = req.body.categories || vendor.categories;
    if (req.body.address !== undefined) {
        vendor.location.address = req.body.address;
    }
    vendor.bannerUrl = req.body.bannerUrl !== undefined ? req.body.bannerUrl : vendor.bannerUrl;
    vendor.isOpen = req.body.isOpen !== undefined ? req.body.isOpen : vendor.isOpen;
    vendor.deliveryAvailable = req.body.deliveryAvailable !== undefined ? req.body.deliveryAvailable : vendor.deliveryAvailable;
    vendor.pickupAvailable = req.body.pickupAvailable !== undefined ? req.body.pickupAvailable : vendor.pickupAvailable;
    vendor.minimumOrder = req.body.minimumOrder !== undefined ? req.body.minimumOrder : vendor.minimumOrder;
    vendor.preparationTime = req.body.preparationTime !== undefined ? req.body.preparationTime : vendor.preparationTime;
    vendor.operatingHours = req.body.operatingHours || vendor.operatingHours;
    vendor.bankDetails = req.body.bankDetails || vendor.bankDetails;
    vendor.taxId = req.body.taxId !== undefined ? req.body.taxId : vendor.taxId;

    const updatedVendor = await vendor.save();
    res.json(updatedVendor);
});

// @desc    Create a vendor
// @route   POST /api/vendors
// @access  Private (Admin)
const createVendor = asyncHandler(async (req, res) => {
    const { businessName, description, categories, status } = req.body;
    const vendor = new Vendor({
        businessName,
        description,
        categories,
        status: status || 'active',
        location: { type: 'Point', coordinates: [0, 0], address: '' }
    });
    const createdVendor = await vendor.save();
    res.status(201).json(createdVendor);
});

// @desc    Update a vendor (Admin)
// @route   PUT /api/vendors/:id
// @access  Private (Admin)
const updateVendor = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);
    if (vendor) {
        vendor.businessName = req.body.businessName || vendor.businessName;
        vendor.description = req.body.description !== undefined ? req.body.description : vendor.description;
        vendor.categories = req.body.categories || vendor.categories;
        vendor.status = req.body.status || vendor.status;
        const updatedVendor = await vendor.save();
        res.json(updatedVendor);
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
});

// @desc    Delete a vendor
// @route   DELETE /api/vendors/:id
// @access  Private (Admin)
const deleteVendor = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);
    if (vendor) {
        await vendor.deleteOne();
        res.json({ message: 'Vendor removed' });
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
});

module.exports = { 
    getVendors, 
    getVendorById, 
    getVendorProfile, 
    updateVendorProfile,
    createVendor,
    updateVendor,
    deleteVendor
};
