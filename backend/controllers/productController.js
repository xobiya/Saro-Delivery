const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get products by vendor
// @route   GET /api/products/vendor/:vendorId
// @access  Public
const getProductsByVendor = asyncHandler(async (req, res) => {
    const products = await Product.find({ vendor: req.params.vendorId });
    res.json(products);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Vendor
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, image } = req.body;

    const product = new Product({
        name,
        description,
        price,
        category,
        image,
        vendor: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Vendor
const updateProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, image, available } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to update this product');
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.image = image || product.image;
        product.available = available !== undefined ? available : product.available;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Vendor
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to delete this product');
        }

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    getProductsByVendor,
    createProduct,
    updateProduct,
    deleteProduct,
};
