const express = require('express');
const router = express.Router();
const { getAdminStats, getTickets, updateTicket, bulkImport } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getAdminStats);
router.get('/tickets', protect, admin, getTickets);
router.put('/tickets/:id', protect, admin, updateTicket);
router.post('/import', protect, admin, bulkImport);

module.exports = router;
