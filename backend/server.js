const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { swaggerUi, specs } = require('./config/swagger');
const logger = require('./config/logger');
const { validateEnvironment, getAllowedOrigins } = require('./config/env');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

// Validate environment variables before starting
validateEnvironment();

// Connect to Database
connectDB();

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all api routes
app.use('/api/', limiter);

// CORS Configuration - Restrict to allowed origins
const allowedOrigins = getAllowedOrigins();
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// HTTP Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/deliveries', require('./routes/orderRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

app.get('/', (req, res) => {
  res.send('Saro Delivery API is running...');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

logger.info('Socket.io server initialized', {
  allowedOrigins: allowedOrigins.join(', ')
});

io.on('connection', (socket) => {
  logger.info('Socket.io client connected', {
    socketId: socket.id,
    clientAddress: socket.handshake.address
  });

  socket.on('join_order', (orderId) => {
    socket.join(orderId);
    logger.debug('Socket joined order room', {
      socketId: socket.id,
      orderId
    });
  });

  socket.on('disconnect', () => {
    logger.info('Socket.io client disconnected', { socketId: socket.id });
  });
});

// Make io available in routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info('Saro Delivery API Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});
