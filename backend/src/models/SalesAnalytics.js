/**
 * Sales Analytics Model
 * Aggregates sales and revenue statistics
 */

const { query } = require('../config/database');

class SalesAnalytics {
  /**
   * Get sales statistics for date range
   */
  static async getStats(start_date, end_date) {
    const sql = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        SUM(amount) as total_revenue,
        SUM(CASE WHEN status IN ('paid', 'completed') THEN amount ELSE 0 END) as confirmed_revenue,
        AVG(amount) as avg_order_value,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM orders
      WHERE created_at >= $1 AND created_at <= $2
    `;

    const result = await query(sql, [start_date, end_date]);
    return result.rows[0];
  }

  /**
   * Get daily revenue
   */
  static async getDailyRevenue(days = 30) {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(amount) as revenue,
        SUM(CASE WHEN status IN ('paid', 'completed') THEN amount ELSE 0 END) as confirmed_revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get package-wise sales
   */
  static async getPackageSales(start_date, end_date) {
    const sql = `
      SELECT 
        p.name as package_name,
        p.price,
        COUNT(o.id) as order_count,
        SUM(o.amount) as total_revenue,
        COUNT(CASE WHEN o.status IN ('paid', 'completed') THEN 1 END) as completed_orders
      FROM orders o
      LEFT JOIN packages p ON o.package_id = p.id
      WHERE o.created_at >= $1 AND o.created_at <= $2
      GROUP BY p.id, p.name, p.price
      ORDER BY total_revenue DESC
    `;

    const result = await query(sql, [start_date, end_date]);
    return result.rows;
  }

  /**
   * Get payment method statistics
   */
  static async getPaymentMethodStats(start_date, end_date) {
    const sql = `
      SELECT 
        pm.type as payment_method,
        COUNT(o.id) as order_count,
        SUM(o.amount) as total_revenue,
        AVG(o.amount) as avg_order_value
      FROM orders o
      LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
      WHERE o.created_at >= $1 
        AND o.created_at <= $2
        AND o.status IN ('paid', 'completed')
      GROUP BY pm.id, pm.type
      ORDER BY total_revenue DESC
    `;

    const result = await query(sql, [start_date, end_date]);
    return result.rows;
  }

  /**
   * Get top customers by revenue
   */
  static async getTopCustomers(limit = 10, start_date = null, end_date = null) {
    let sql = `
      SELECT 
        c.name as customer_name,
        c.phone_number,
        COUNT(o.id) as order_count,
        SUM(o.amount) as total_spent,
        MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE o.status IN ('paid', 'completed')
    `;
    const params = [];
    let paramCount = 1;

    if (start_date && end_date) {
      sql += ` AND o.created_at >= $${paramCount} AND o.created_at <= $${paramCount + 1}`;
      params.push(start_date, end_date);
      paramCount += 2;
    }

    sql += ` GROUP BY c.id, c.name, c.phone_number ORDER BY total_spent DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get conversion funnel
   */
  static async getConversionFunnel(start_date, end_date) {
    const sql = `
      SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(DISTINCT CASE WHEN o.id IS NOT NULL THEN c.customer_id END) as customers_with_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'paid' OR o.status = 'completed' THEN o.customer_id END) as paying_customers,
        COUNT(o.id) as total_orders,
        COUNT(CASE WHEN o.status = 'paid' OR o.status = 'completed' THEN 1 END) as paid_orders
      FROM conversations c
      LEFT JOIN orders o ON c.customer_id = o.customer_id
      WHERE c.created_at >= $1 AND c.created_at <= $2
    `;

    const result = await query(sql, [start_date, end_date]);
    return result.rows[0];
  }

  /**
   * Get monthly comparison
   */
  static async getMonthlyComparison(months = 6) {
    const sql = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as order_count,
        SUM(amount) as revenue,
        SUM(CASE WHEN status IN ('paid', 'completed') THEN amount ELSE 0 END) as confirmed_revenue,
        AVG(amount) as avg_order_value
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${months} months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get growth rate
   */
  static async getGrowthRate() {
    const sql = `
      WITH current_month AS (
        SELECT COALESCE(SUM(amount), 0) as revenue
        FROM orders
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
          AND status IN ('paid', 'completed')
      ),
      previous_month AS (
        SELECT COALESCE(SUM(amount), 0) as revenue
        FROM orders
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND created_at < DATE_TRUNC('month', CURRENT_DATE)
          AND status IN ('paid', 'completed')
      )
      SELECT 
        current_month.revenue as current_revenue,
        previous_month.revenue as previous_revenue,
        CASE 
          WHEN previous_month.revenue > 0 THEN
            ((current_month.revenue - previous_month.revenue) / previous_month.revenue * 100)
          ELSE 0
        END as growth_rate
      FROM current_month, previous_month
    `;

    const result = await query(sql);
    return result.rows[0];
  }
}

module.exports = SalesAnalytics;
