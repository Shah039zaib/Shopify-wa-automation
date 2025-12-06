/**
 * Health Check Routes
 * Server health and status endpoints
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * GET /api/health
 * Basic health check
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

/**
 * GET /api/health/detailed
 * Detailed health check with database
 */
router.get('/detailed', async (req, res) => {
  try {
    // Check database connection
    const dbStart = Date.now();
    await pool.query('SELECT NOW()');
    const dbDuration = Date.now() - dbStart;

    res.status(200).json({
      success: true,
      message: 'All systems operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        api: {
          status: 'healthy',
          uptime: process.uptime()
        },
        database: {
          status: 'healthy',
          responseTime: `${dbDuration}ms`
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
        }
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service degraded',
      timestamp: new Date().toISOString(),
      services: {
        api: { status: 'healthy' },
        database: { 
          status: 'unhealthy',
          error: error.message 
        }
      }
    });
  }
});

module.exports = router;
