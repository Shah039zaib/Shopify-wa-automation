/**
 * Analytics Controller
 * Analytics and reporting logic
 */

const ConversationAnalytics = require('../models/ConversationAnalytics');
const SalesAnalytics = require('../models/SalesAnalytics');
const AIAnalytics = require('../models/AIAnalytics');
const CustomerAnalytics = require('../models/CustomerAnalytics');

/**
 * Get conversation analytics
 * GET /api/analytics/conversations
 */
exports.getConversationAnalytics = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const stats = await ConversationAnalytics.getOverallStats(start_date, end_date);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get conversation trends
 * GET /api/analytics/conversations/trends
 */
exports.getConversationTrends = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const trends = await ConversationAnalytics.getDailyTrends(parseInt(days));

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sales analytics
 * GET /api/analytics/sales
 */
exports.getSalesAnalytics = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const [stats, packagePerformance, statusDistribution] = await Promise.all([
      SalesAnalytics.getOverallStats(start_date, end_date),
      SalesAnalytics.getPackagePerformance(),
      SalesAnalytics.getOrderStatusDistribution()
    ]);

    res.json({
      success: true,
      data: {
        overall: stats,
        packagePerformance,
        statusDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue trends
 * GET /api/analytics/sales/revenue
 */
exports.getRevenueTrends = async (req, res, next) => {
  try {
    const { days = 30, period = 'daily' } = req.query;

    let revenue;
    if (period === 'monthly') {
      revenue = await SalesAnalytics.getMonthlyRevenue(parseInt(days) / 30);
    } else {
      revenue = await SalesAnalytics.getDailyRevenue(parseInt(days));
    }

    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get conversion funnel
 * GET /api/analytics/sales/funnel
 */
exports.getConversionFunnel = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const funnel = await SalesAnalytics.getConversionFunnel(start_date, end_date);

    res.json({
      success: true,
      data: funnel
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI analytics
 * GET /api/analytics/ai
 */
exports.getAIAnalytics = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const [stats, errorAnalysis, costEstimation] = await Promise.all([
      AIAnalytics.getOverallStats(start_date, end_date),
      AIAnalytics.getErrorAnalysis(10),
      AIAnalytics.getCostEstimation(start_date, end_date)
    ]);

    res.json({
      success: true,
      data: {
        overall: stats,
        errors: errorAnalysis,
        costs: costEstimation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI provider comparison
 * GET /api/analytics/ai/providers
 */
exports.getAIProviderComparison = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const comparison = await AIAnalytics.getProviderComparison(start_date, end_date);

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI usage trends
 * GET /api/analytics/ai/usage
 */
exports.getAIUsageTrends = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    const usage = await AIAnalytics.getDailyUsage(parseInt(days));

    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer analytics
 * GET /api/analytics/customers
 */
exports.getCustomerAnalytics = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const [stats, lifetimeValue, churnAnalysis] = await Promise.all([
      CustomerAnalytics.getOverallStats(start_date, end_date),
      CustomerAnalytics.getLifetimeValueDistribution(),
      CustomerAnalytics.getChurnAnalysis()
    ]);

    res.json({
      success: true,
      data: {
        overall: stats,
        lifetimeValue,
        churnAnalysis
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer segmentation
 * GET /api/analytics/customers/segmentation
 */
exports.getCustomerSegmentation = async (req, res, next) => {
  try {
    const segmentation = await CustomerAnalytics.getCustomerSegmentation();

    res.json({
      success: true,
      data: segmentation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer retention rate
 * GET /api/analytics/customers/retention
 */
exports.getCustomerRetention = async (req, res, next) => {
  try {
    const { period_days = 30 } = req.query;

    const retention = await CustomerAnalytics.getRetentionRate(parseInt(period_days));

    res.json({
      success: true,
      data: retention
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate custom report
 * POST /api/analytics/report/generate
 */
exports.generateReport = async (req, res, next) => {
  try {
    const { reportType, startDate, endDate, metrics } = req.body;

    // Generate report based on type
    let reportData = {};

    switch (reportType) {
      case 'conversations':
        reportData = await ConversationAnalytics.getOverallStats(startDate, endDate);
        break;
      case 'sales':
        reportData = await SalesAnalytics.getOverallStats(startDate, endDate);
        break;
      case 'ai':
        reportData = await AIAnalytics.getOverallStats(startDate, endDate);
        break;
      case 'customers':
        reportData = await CustomerAnalytics.getOverallStats(startDate, endDate);
        break;
      default:
        // Comprehensive report
        reportData = await Promise.all([
          ConversationAnalytics.getOverallStats(startDate, endDate),
          SalesAnalytics.getOverallStats(startDate, endDate),
          AIAnalytics.getOverallStats(startDate, endDate),
          CustomerAnalytics.getOverallStats(startDate, endDate)
        ]).then(([conversations, sales, ai, customers]) => ({
          conversations,
          sales,
          ai,
          customers
        }));
    }

    res.json({
      success: true,
      data: {
        reportType,
        period: { startDate, endDate },
        generatedAt: new Date(),
        data: reportData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export report
 * POST /api/analytics/report/export
 */
exports.exportReport = async (req, res, next) => {
  try {
    const { format } = req.query;
    const reportData = req.body;

    // For now, just return the data
    // In production, you'd generate PDF/Excel/CSV files here
    res.json({
      success: true,
      message: `Report export in ${format} format`,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics overview (all metrics)
 * GET /api/analytics/overview
 */
exports.getOverview = async (req, res, next) => {
  try {
    const [
      conversationStats,
      salesStats,
      aiStats,
      customerStats
    ] = await Promise.all([
      ConversationAnalytics.getOverallStats(),
      SalesAnalytics.getOverallStats(),
      AIAnalytics.getOverallStats(),
      CustomerAnalytics.getOverallStats()
    ]);

    res.json({
      success: true,
      data: {
        conversations: conversationStats,
        sales: salesStats,
        ai: aiStats,
        customers: customerStats
      }
    });
  } catch (error) {
    next(error);
  }
};
