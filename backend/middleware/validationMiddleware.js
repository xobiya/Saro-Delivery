const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('customer', 'vendor', 'driver', 'admin').default('customer'),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const otpStartSchema = Joi.object({
    phone: Joi.string().min(9).required(),
    purpose: Joi.string().valid('login', 'signup').optional(),
});

const otpVerifySchema = Joi.object({
    phone: Joi.string().min(9).required(),
    code: Joi.string().pattern(/^\d{6}$/).required(),
});

const otpCompleteSchema = Joi.object({
    otpSessionToken: Joi.string().required(),
    name: Joi.string().min(2).required(),
    role: Joi.string().valid('customer', 'driver').optional(),
    email: Joi.string().email().allow('').optional(),
});

const productSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(0.01).required().messages({
        'number.min': 'Price must be greater than 0'
    }),
    category: Joi.string().required(),
    image: Joi.string().uri().allow('').optional(),
    available: Joi.boolean().optional(),
});

const orderSchema = Joi.object({
    pickupLocation: Joi.object({
        address: Joi.string().required(),
        landmark: Joi.string().allow('').optional(),
        coordinates: Joi.object({
            lat: Joi.number().optional(),
            lng: Joi.number().optional()
        }).optional()
    }).required(),
    dropoffLocation: Joi.object({
        address: Joi.string().required(),
        landmark: Joi.string().allow('').optional(),
        phone: Joi.string().pattern(/^[0-9+\s-]+$/).allow('').optional(),
        instructions: Joi.string().allow('').optional(),
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
    paymentMethod: Joi.string().valid('cash', 'chapa', 'telebirr', 'cbe_birr', 'mbirr').optional(),
    contactPhone: Joi.string().pattern(/^[0-9+\s-]+$/).allow('').optional(),
    notes: Joi.string().allow('').optional(),
    vendorId: Joi.string().optional(),
    couponCode: Joi.string().allow('').optional(),
    discountAmount: Joi.number().min(0).optional(),
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled').required(),
    paymentStatus: Joi.string().valid('pending', 'completed', 'failed').optional(),
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
    otpStartSchema,
    otpVerifySchema,
    otpCompleteSchema,
    productSchema,
    orderSchema,
    updateOrderStatusSchema,
};
