const express = require('express');
const router = express.Router();
const { getVendors, getVendorById } = require('../controllers/vendorController');

router.route('/').get(getVendors);
router.route('/:id').get(getVendorById);

module.exports = router;
