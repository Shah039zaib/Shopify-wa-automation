/**
 * Sales Analytics Model
 * Tracks and analyzes sales metrics
 */

const { query } = require('../config/database');

class SalesAnalytics {
  /**
   * Get overall sales statistics
   */
  static async getOverallStats(start_date = null, end_date = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'paid' OR status = 'completed' THEN 1 END) as successful_orders,
        SUM(amount) as total_revenue,
        SUM(CASE WHEN status = 'paid' OR status = 'completed' THEN amount ELSE 0 END) as confirmed_revenue,
        AVG(amount) as avg_order_value,
        MAX(amount) as highest_order,
        MIN(amount) as lowest_order
      FROM orders
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (start_date) {
      sql += ` AND created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      sql += ` AND created_at <= $${paramCount}`;
      params.push(end_date);
    }

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Get daily revenue trends
   */
  static async getDailyRevenue(days = 30) {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(amount) as revenue,
        SUM(CASE WHEN status = 'paid' OR status = 'completed' THEN amount ELSE 0 END) as confirmed_revenue,
        AVG(amount) as avg_order_value
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get monthly revenue trends
   */
  static async getMonthlyRevenue(months = 12) {
    const sql = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as order_count,
        SUM(amount) as revenue,
        SUM(CASE WHEN status = 'paid' OR status = 'completed' THEN amount ELSE 0 END) as confirmed_revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${months} months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get package performance
   */
  static async getPackagePerformance() {
    const sql = `
      SELECT 
        p.name as package_name,
        p.price as package_price,
        COUNT(o.id) as total_orders,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
        SUM(o.amount) as total_revenue,
        AVG(o.amount) as avg_order_value
      FROM packages p
      LEFT JOIN orders o ON p.id = o.package_id
      GROUP BY p.id
      ORDER BY total_revenue DESC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get conversion funnel
   */
  static async getConversionFunnel(start_date = null, end_date = null) {
    let baseCondition = '1=1';
    const params = [];
    let paramCount = 1;

    if (start_date) {
      baseCondition += ` AND created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      baseCondition += ` AND created_at <= $${paramCount}`;
      params.push(end_date);
    }

    // Get counts for each stage
    const sql = `
      SELECT 
        (SELECT COUNT(DISTINCT customer_id) FROM conversations WHERE ${baseCondition}) as initial_inquiries,
        (SELECT COUNT(*) FROM orders WHERE ${baseCondition}) as orders_created,
        (SELECT COUNT(*) FROM orders WHERE status = 'payment_pending' AND ${baseCondition}) as payment_requested,
        (SELECT COUNT(*) FROM orders WHERE status = 'paid' AND ${baseCondition}) as payment_received,
        (SELECT COUNT(*) FROM orders WHERE status = 'completed' AND ${baseCondition}) as orders_completed
    `;

    const result = await query(sql, params);
    const data = result.rows[0];

    // Calculate conversion rates
    return {
      stages: [
        {
          name: 'Initial Inquiries',
          count: parseInt(data.initial_inquiries),
          percentage: 100
        },
        {
          name: 'Orders Created',
          count: parseInt(data.orders_created),
          percentage: data.initial_inquiries > 0 
            ? Math.round((data.orders_created / data.initial_inquiries) * 100) 
            : 0
        },
        {
          name: 'Payment Requested',
          count: parseInt(data.payment_requested),
          percentage: data.orders_created > 0 
            ? Math.round((data.payment_requested / data.orders_created) * 100) 
            : 0
        },
        {
          name: 'Payment Received',
          count: parseInt(data.payment_received),
          percentage: data.payment_requested > 0 
            ? Math.round((data.payment_received / data.payment_requested) * 100) 
            : 0
        },
        {
          name: 'Completed',
          count: parseInt(data.orders_completed),
          percentage: data.payment_received > 0 
            ? Math.round((data.orders_completed / data.payment_received) * 100) 
            : 0
        }
      ],
      overallConversion: data.initial_inquiries > 0 
        ? Math.round((data.orders_completed / data.initial_inquiries) * 100) 
        : 0
    };
  }

  /**
   * Get payment method usage
   */
  static async getPaymentMethodUsage() {
    const sql = `
      SELECT 
        pm.type as payment_method,
        COUNT(o.id) as order_count,
        SUM(o.amount) as total_revenue,
        ROUND(COUNT(o.id) * 100.0 / (SELECT COUNT(*) FROM orders), 2) as usage_percentage
      FROM payment_methods pm
      LEFT JOIN orders o ON pm.id = o.payment_method_id
      GROUP BY pm.id
      ORDER BY order_count DESC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get top customers by revenue
   */
  static async getTopCustomers(limit = 10) {
    const sql = `
      SELECT 
        c.name,
        c.phone_number,
        COUNT(o.id) as total_orders,
        SUM(o.amount) as total_spent,
        AVG(o.amount) as avg_order_value,
        MAX(o.created_at) as last_order_date
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      WHERE o.status IN ('paid', 'completed')
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * Get order status distribution
   */
  static async getOrderStatusDistribution() {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as revenue,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) as percentage
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get revenue growth rate
   */
  static async getGrowthRate(period = 'month') {
    const interval = period === 'month' ? '1 month' : '1 week';
    
    const sql = `
      SELECT 
        (SELECT SUM(amount) FROM orders 
         WHERE created_at >= NOW() - INTERVAL '${interval}'
           AND (status = 'paid' OR status = 'completed')
        ) as current_period,
        (SELECT SUM(amount) FROM orders 
         WHERE created_at >= NOW() - INTERVAL '${interval}' * 2
           AND created_at < NOW() - INTERVAL '${interval}'
           AND (status ='paid' OR status = 'completed')
) as previous_period
`;
const result = await query(sql);
const data = result.rows[0];

const current = parseFloat(data.current_period) || 0;
const previous = parseFloat(data.previous_period) || 0;

const growthRate = previous > 0 
  ? ((current - previous) / previous) * 100 
  : 0;

return {
  currentPeriod: current,
  previousPeriod: previous,
  growthRate: Math.round(growthRate * 100) / 100,
  growthAmount: current - previous
};
}
/**
Get average time to conversion
*/
static async getAverageTimeToConversion() {
const sql = SELECT  AVG( EXTRACT(EPOCH FROM (o.created_at - c.created_at)) / 3600 ) as avg_hours_to_order, AVG( EXTRACT(EPOCH FROM (o.paid_at - o.created_at)) / 3600 ) as avg_hours_to_payment FROM orders o JOIN conversations co ON o.customer_id = co.customer_id JOIN ( SELECT customer_id, MIN(created_at) as created_at FROM conversations GROUP BY customer_id ) c ON o.customer_id = c.customer_id WHERE o.status IN ('paid', 'completed');
const result = await query(sql);
return result.rows[0];
}
}
module.exports = SalesAnalytics;
