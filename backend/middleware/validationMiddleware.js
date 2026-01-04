const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('customer', 'vendor', 'admin').default('customer'),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const productSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().required(),
    image: Joi.string().uri().allow('').optional(),
    available: Joi.boolean().optional(),
});

const orderSchema = Joi.object({
    pickupLocation: Joi.object({
        address: Joi.string().required(),
        coordinates: Joi.object({
            lat: Joi.number().optional(),
            lng: Joi.number().optional()
        }).optional()
    }).required(),
    dropoffLocation: Joi.object({
        address: Joi.string().required(),
        coordinates: Joi.object({
            lat: Joi.number().optional(),
            lng: Joi.number().optional()
        }).optional()
    }).required(),
    items: Joi.array().items(Joi.object({
        product: Joi.string().optional(),
        name: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required(),
    })).min(1).required(),
    totalAmount: Joi.number().min(0).required(),
    paymentMethod: Joi.string().optional(),
    notes: Joi.string().allow('').optional(),
    vendorId: Joi.string().optional(),
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'preparing', 'ready', 'on-the-way', 'delivered', 'cancelled').required(),
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        const message = error.details.map((detail) => detail.message).join(', ');
        throw new Error(message);
    }
    next();
};

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    productSchema,
    orderSchema,
    updateOrderStatusSchema,
};
