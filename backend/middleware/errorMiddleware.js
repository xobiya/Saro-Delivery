const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log for dev
    if (process.env.NODE_ENV !== 'production') {
        console.error(err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        error = new Error(message);
        res.status(404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new Error(message);
        res.status(400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new Error(message);
        res.status(400);
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: error.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };
