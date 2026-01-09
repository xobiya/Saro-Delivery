const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const { validate, orderSchema, updateOrderStatusSchema } = require('../middleware/validationMiddleware');

/**
 * @swagger
 * /api/deliveries:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *               - totalAmount
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               shippingAddress:
 *                 type: string
 *               totalAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Order created
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.route('/')
    .post(protect, validate(orderSchema), createOrder)
    .get(protect, getOrders);

/**
 * @swagger
 * /api/deliveries/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, validate(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
