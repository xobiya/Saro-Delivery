const express = require('express');
const router = express.Router();
const { getVendors, getVendorById, getVendorProfile, updateVendorProfile, createVendor, updateVendor, deleteVendor } = require('../controllers/vendorController');
const { protect, vendor, admin } = require('../middleware/authMiddleware');

router.route('/').get(getVendors).post(protect, admin, createVendor);
router.route('/me').get(protect, vendor, getVendorProfile).put(protect, vendor, updateVendorProfile);
router.route('/:id').get(getVendorById).put(protect, admin, updateVendor).delete(protect, admin, deleteVendor);

module.exports = router;
