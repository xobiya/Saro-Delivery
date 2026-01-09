const express = require('express');
const router = express.Router();
const {
    getProductsByVendor,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect, vendor } = require('../middleware/authMiddleware');

const { validate, productSchema } = require('../middleware/validationMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         image:
 *           type: string
 *         available:
 *           type: boolean
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Vendor only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *       401:
 *         description: Not authorized
 */
router.route('/').post(protect, vendor, validate(productSchema), createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Vendor only)
 *     tags: [Products]
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product (Vendor only)
 *     tags: [Products]
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
 *         description: Product removed
 */
router.route('/:id')
    .put(protect, vendor, validate(productSchema), updateProduct)
    .delete(protect, vendor, deleteProduct);

/**
 * @swagger
 * /api/products/vendor/{vendorId}:
 *   get:
 *     summary: Get products by vendor
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products
 */
router.route('/vendor/:vendorId').get(getProductsByVendor);

module.exports = router;
