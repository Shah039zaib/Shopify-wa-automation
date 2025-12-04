/**
 * WhatsApp Automation Backend Server
 * Main entry point for the application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');

// Import configurations
const { connectDatabase } = require('./src/config/database');
const { logger } = require('./src/utils/logger');

// Import middleware
const { errorHandler, notFound } = require('./src/middleware/error.middleware');
const { logRequest } = require('./src/middleware/logger.middleware');
const { apiRateLimit } = require('./src/middleware/rate-limit.middleware');

// Import routes
const routes = require('./src/routes');

// Import services
const { initializeWhatsApp } = require('./src/services/whatsapp.service');
const { startKeepAlive } = require('./src/services/keep-alive.service');
const { initializeSocket } = require('./src/websocket/socket');
const { startScheduler } = require('./src/jobs/scheduler');

// Import migrations
const { runMigrations } = require('./src/migrations');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store io instance globally for access in routes
global.io = io;

// Port configuration
const PORT = process.env.PORT || 5000;

/**
 * Middleware Setup
 */

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use(logRequest);

// API rate limiting
app.use('/api/', apiRateLimit);

/**
 * Health Check Route
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * API Routes
 */
app.use('/api', routes);

/**
 * Root Route
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WhatsApp Automation API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

/**
 * Error Handling
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Initialize Application
 */
async function startServer() {
  try {
    logger.info('🚀 Starting WhatsApp Automation Server...');

    // 1. Connect to Database
    logger.info('📦 Connecting to database...');
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // 2. Run Migrations
    logger.info('🔄 Running database migrations...');
    await runMigrations();
    logger.info('✅ Migrations completed');

    // 3. Initialize Socket.io
    logger.info('🔌 Initializing WebSocket...');
    initializeSocket(io);
    logger.info('✅ WebSocket initialized');

    // 4. Initialize WhatsApp
    logger.info('📱 Initializing WhatsApp...');
    await initializeWhatsApp(io);
    logger.info('✅ WhatsApp service initialized');

    // 5. Start Cron Jobs
    logger.info('⏰ Starting scheduled jobs...');
    startScheduler();
    logger.info('✅ Scheduled jobs started');

    // 6. Start Keep-Alive Service (for Render)
    if (process.env.ENABLE_KEEP_ALIVE === 'true') {
      logger.info('💓 Starting keep-alive service...');
      startKeepAlive();
      logger.info('✅ Keep-alive service started');
    }

    // 7. Start Server
    server.listen(PORT, () => {
      logger.info(`✅ Server is running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
      logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('🎉 Server started successfully!');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

/**
 * Unhandled Errors
 */
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

/**
 * Start the server
 */
startServer();

module.exports = app;
