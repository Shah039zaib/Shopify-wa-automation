/**
 * Dashboard Routes
 * Dashboard statistics and overview
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/dashboard/stats
 * Get overall dashboard statistics
 */
router.get('/stats', requireAuth, dashboardController.getStats);

/**
 * GET /api/dashboard/recent-activity
 * Get recent activity feed
 */
router.get('/recent-activity', requireAuth, dashboardController.getRecentActivity);

/**
 * GET /api/dashboard/quick-metrics
 * Get quick metrics (today's stats)
 */
router.get('/quick-metrics', requireAuth, dashboardController.getQuickMetrics);

/**
 * GET /api/dashboard/charts
 * Get chart data
 */
router.get('/charts', requireAuth, dashboardController.getCharts);

module.exports = router;
