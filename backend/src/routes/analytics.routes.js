/**
 * Analytics Routes
 * Analytics and reporting endpoints
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateQuery } = require('../middleware/validate.middleware');

/**
 * GET /api/analytics/conversations
 * Get conversation analytics
 */
router.get(
  '/conversations',
  requireAuth,
  validateQuery({
    start_date: { type: 'string' },
    end_date: { type: 'string' }
  }),
  analyticsController.getConversationAnalytics
);

/**
 * GET /api/analytics/conversations/trends
 * Get conversation trends
 */
router.get(
  '/conversations/trends',
  requireAuth,
  validateQuery({
    days: { type: 'number' }
  }),
  analyticsController.getConversationTrends
);

/**
 * GET /api/analytics/sales
 * Get sales analytics
 */
router.get(
  '/sales',
  requireAuth,
  validateQuery({
    start_date: { type: 'string' },
    end_date: { type: 'string' }
  }),
  analyticsController.getSalesAnalytics
);

/**
 * GET /api/analytics/sales/revenue
 * Get revenue trends
 */
router.get(
  '/sales/revenue',
  requireAuth,
  validateQuery({
    days: { type: 'number' },
    period: { type: 'string', enum: ['daily', 'weekly', 'monthly'] }
  }),
  analyticsController.getRevenueTrends
);

/**
 * GET /api/analytics/sales/funnel
 * Get conversion funnel
 */
router.get(
  '/sales/funnel',
  requireAuth,
  validateQuery({
    start_date: { type: 'string' },
    end_date: { type: 'string' }
  }),
  analyticsController.getConversionFunnel
);

/**
 * GET /api/analytics/ai
 * Get AI analytics
 */
router.get(
  '/ai',
  requireAuth,
  validateQuery({
    start_date: { type: 'string' },
    end_date: { type: 'string' }
  }),
  analyticsController.getAIAnalytics
);

/**
 * GET /api/analytics/ai/providers
 * Get AI provider comparison
 */
router.get(
  '/ai/providers',
  requireAuth,
  validateQuery({
    start_date: { type: 'string' },
    end_date: { type: 'string' }
  }),
  analyticsController.getAIProviderComparison
);

/**
 * GET /api/analytics/ai/usage
 * Get AI usage trends
 */
router.get(
  '/ai/usage',
  requireAuth,
  validateQuery({
    days: { type: 'number' }
  }),
  analyticsController.getAIUsageTrends
);

/**
 * GET /api/analytics/customers
 * Get customer analytics
 */
router.get(
  '/customers',
  requireAuth,
  validateQuery({
    start_date: { type: 'string' },
    end_date: { type: 'string' }
  }),
  analyticsController.getCustomerAnalytics
);

/**
 * GET /api/analytics/customers/segmentation
 * Get customer segmentation
 */
router.get(
  '/customers/segmentation',
  requireAuth,
  analyticsController.getCustomerSegmentation
);

/**
 * GET /api/analytics/customers/retention
 * Get customer retention rate
 */
router.get(
  '/customers/retention',
  requireAuth,
  validateQuery({
    period_days: { type: 'number' }
  }),
  analyticsController.getCustomerRetention
);

/**
 * POST /api/analytics/report/generate
 * Generate custom report
 */
router.post(
  '/report/generate',
  requireAuth,
  analyticsController.generateReport
);

/**
 * POST /api/analytics/report/export
 * Export report (PDF/Excel/CSV)
 */
router.post(
  '/report/export',
  requireAuth,
  validateQuery({
    format: { required: true, enum: ['pdf', 'excel', 'csv'] }
  }),
  analyticsController.exportReport
);

/**
 * GET /api/analytics/overview
 * Get analytics overview (all metrics)
 */
router.get('/overview', requireAuth, analyticsController.getOverview);

module.exports = router;
