/**
 * Dashboard Controller
 * Dashboard statistics and overview
 */

const ConversationAnalytics = require('../models/ConversationAnalytics');
const SalesAnalytics = require('../models/SalesAnalytics');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Conversation = require('../models/Conversation');
const AILog = require('../models/AILog');

/**
 * Get overall dashboard statistics
 * GET /api/dashboard/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get various statistics
    const [
      conversationStats,
      salesStats,
      orderStats,
      recentOrders,
      recentCustomers
    ] = await Promise.all([
      ConversationAnalytics.getOverallStats(),
      SalesAnalytics.getOverallStats(),
      Order.getRevenueStats(startOfToday, new Date()),
      Order.getRecent(5),
      Customer.getRecent(5)
    ]);

    res.json({
      success: true,
      data: {
        conversations: conversationStats,
        sales: salesStats,
        today: orderStats,
        recentOrders,
        recentCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activity feed
 * GET /api/dashboard/recent-activity
 */
exports.getRecentActivity = async (req, res, next) => {
  try {
    const [recentOrders, recentConversations, recentAIActivity] = await Promise.all([
      Order.getRecent(10),
      Conversation.getAll({ page: 1, limit: 10 }),
      AILog.getRecentActivity(10)
    ]);

    // Combine and sort by timestamp
    const activities = [
      ...recentOrders.map(order => ({
        type: 'order',
        data: order,
        timestamp: order.created_at
      })),
      ...recentConversations.data.map(conv => ({
        type: 'conversation',
        data: conv,
        timestamp: conv.last_message_at
      })),
      ...recentAIActivity.map(activity => ({
        type: 'ai',
        data: activity,
        timestamp: activity.timestamp
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get quick metrics (today's stats)
 * GET /api/dashboard/quick-metrics
 */
exports.getQuickMetrics = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const [todayOrders, todayRevenue, activeConversations] = await Promise.all([
      Order.getAll({ page: 1, limit: 1000, status: null }).then(result => 
        result.data.filter(order => new Date(order.created_at) >= startOfToday).length
      ),
      Order.getRevenueStats(startOfToday, endOfToday),
      Conversation.getAll({ page: 1, limit: 1, status: 'active' })
    ]);

    res.json({
      success: true,
      data: {
        todayOrders,
        todayRevenue: todayRevenue.total_revenue || 0,
        activeConversations: activeConversations.pagination.total,
        conversionRate: todayOrders > 0 ? 
          ((todayRevenue.completed_orders || 0) / todayOrders * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chart data
 * GET /api/dashboard/charts
 */
exports.getCharts = async (req, res, next) => {
  try {
    const [dailyRevenue, conversationTrends, aiUsage] = await Promise.all([
      SalesAnalytics.getDailyRevenue(7),
      ConversationAnalytics.getDailyTrends(7),
      AILog.getAll({ page: 1, limit: 1000 }).then(result => {
        // Group by day
        const grouped = {};
        result.data.forEach(log => {
          const date = new Date(log.timestamp).toISOString().split('T')[0];
          grouped[date] = (grouped[date] || 0) + 1;
        });
        return Object.entries(grouped).map(([date, count]) => ({ date, count }));
      })
    ]);

    res.json({
      success: true,
      data: {
        revenue: dailyRevenue,
        conversations: conversationTrends,
        aiUsage
      }
    });
  } catch (error) {
    next(error);
  }
};
