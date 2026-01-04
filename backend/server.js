const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { swaggerUi, specs } = require('./config/swagger');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiter to all api routes
app.use('/api/', limiter);

// Middleware
app.use(express.json());
app.use(cors());

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
    origin: "*", // Allow all for dev
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_order', (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined order: ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available in routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
