/**
 * Customer Analytics Model
 * Tracks and analyzes customer behavior and insights
 */

const { query } = require('../config/database');

class CustomerAnalytics {
  /**
   * Get overall customer statistics
   */
  static async getOverallStats(start_date = null, end_date = null) {
    let sql = `
      SELECT 
        COUNT(DISTINCT c.id) as total_customers,
        COUNT(DISTINCT CASE 
          WHEN c.created_at >= NOW() - INTERVAL '30 days' THEN c.id 
        END) as new_customers_this_month,
        COUNT(DISTINCT CASE 
          WHEN c.last_interaction >= NOW() - INTERVAL '7 days' THEN c.id 
        END) as active_customers,
        AVG(c.total_orders) as avg_orders_per_customer,
        AVG(c.total_spent) as avg_customer_value
      FROM customers c
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (start_date) {
      sql += ` AND c.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      sql += ` AND c.created_at <= $${paramCount}`;
      params.push(end_date);
    }

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Get customer acquisition trends
   */
  static async getAcquisitionTrends(days = 30) {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_customers
      FROM customers
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get customer segmentation by value
   */
  static async getCustomerSegmentation() {
    const sql = `
      SELECT 
        CASE 
          WHEN total_spent = 0 THEN 'No Purchase'
          WHEN total_spent < 10000 THEN 'Low Value'
          WHEN total_spent < 50000 THEN 'Medium Value'
          ELSE 'High Value'
        END as segment,
        COUNT(*) as customer_count,
        AVG(total_spent) as avg_spent,
        AVG(total_orders) as avg_orders
      FROM customers
      GROUP BY segment
      ORDER BY 
        CASE segment
          WHEN 'High Value' THEN 1
          WHEN 'Medium Value' THEN 2
          WHEN 'Low Value' THEN 3
          ELSE 4
        END
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get customer retention rate
   */
  static async getRetentionRate(period_days = 30) {
    const sql = `
      WITH customer_activity AS (
        SELECT 
          customer_id,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${period_days} days' THEN 1 END) as recent_orders,
          COUNT(CASE WHEN created_at < NOW() - INTERVAL '${period_days} days' THEN 1 END) as past_orders
        FROM orders
        GROUP BY customer_id
      )
      SELECT 
        COUNT(CASE WHEN past_orders > 0 AND recent_orders > 0 THEN 1 END) as retained_customers,
        COUNT(CASE WHEN past_orders > 0 THEN 1 END) as total_past_customers,
        ROUND(
          COUNT(CASE WHEN past_orders > 0 AND recent_orders > 0 THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN past_orders > 0 THEN 1 END), 0),
          2
        ) as retention_rate
      FROM customer_activity
    `;

    const result = await query(sql);
    return result.rows[0];
  }

  /**
   * Get customer lifetime value distribution
   */
  static async getLifetimeValueDistribution() {
    const sql = `
      SELECT 
        CASE 
          WHEN total_spent = 0 THEN 'Rs. 0'
          WHEN total_spent < 10000 THEN 'Rs. 1-10k'
          WHEN total_spent < 25000 THEN 'Rs. 10-25k'
          WHEN total_spent < 50000 THEN 'Rs. 25-50k'
          WHEN total_spent < 100000 THEN 'Rs. 50-100k'
          ELSE 'Rs. 100k+'
        END as value_range,
        COUNT(*) as customer_count,
        SUM(total_spent) as total_revenue
      FROM customers
      GROUP BY value_range
      ORDER BY 
        CASE value_range
          WHEN 'Rs. 100k+' THEN 1
          WHEN 'Rs. 50-100k' THEN 2
          WHEN 'Rs. 25-50k' THEN 3
          WHEN 'Rs. 10-25k' THEN 4
          WHEN 'Rs. 1-10k' THEN 5
          ELSE 6
        END
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get customer churn analysis
   */
  static async getChurnAnalysis(inactive_days = 60) {
    const sql = `
      SELECT 
        COUNT(CASE WHEN last_interaction < NOW() - INTERVAL '${inactive_days} days' THEN 1 END) as churned_customers,
        COUNT(CASE WHEN last_interaction >= NOW() - INTERVAL '${inactive_days} days' THEN 1 END) as active_customers,
        COUNT(*) as total_customers,
        ROUND(
          COUNT(CASE WHEN last_interaction < NOW() - INTERVAL '${inactive_days} days' THEN 1 END) * 100.0 / COUNT(*),
          2
        ) as churn_rate
      FROM customers
      WHERE total_orders > 0
    `;

    const result = await query(sql);
    return result.rows[0];
  }

  /**
   * Get language preference distribution
   */
  static async getLanguageDistribution() {
    const sql = `
      SELECT 
        COALESCE(language_preference, 'Not Set') as language,
        COUNT(*) as customer_count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM customers), 2) as percentage
      FROM customers
      GROUP BY language_preference
      ORDER BY customer_count DESC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get top customers by various metrics
   */
  static async getTopCustomers(metric = 'revenue', limit = 10) {
    let orderBy = 'total_spent DESC';
    
    if (metric === 'orders') {
      orderBy = 'total_orders DESC';
    } else if (metric === 'engagement') {
      orderBy = 'total_interactions DESC';
    }

    const sql = `
      SELECT 
        c.name,
        c.phone_number,
        c.total_orders,
        c.total_spent,
        COUNT(DISTINCT co.id) as total_interactions,
        c.last_interaction
      FROM customers c
      LEFT JOIN conversations co ON c.id = co.customer_id
      GROUP BY c.id
      ORDER BY ${orderBy}
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * Get customer engagement score
   */
  static async getEngagementScore(customer_id) {
    const sql = `
      SELECT 
        c.id,
        c.name,
        c.total_orders,
        COUNT(DISTINCT co.id) as conversation_count,
        COUNT(DISTINCT m.id) as message_count,
        EXTRACT(DAYS FROM (NOW() - c.last_interaction)) as days_since_last_interaction,
        CASE 
          WHEN c.last_interaction >= NOW() - INTERVAL '7 days' THEN 'Highly Engaged'
          WHEN c.last_interaction >= NOW() - INTERVAL '30 days' THEN 'Engaged'
          WHEN c.last_interaction >= NOW() - INTERVAL '90 days' THEN 'At Risk'
          ELSE 'Churned'
        END as engagement_status
      FROM customers c
      LEFT JOIN conversations co ON c.id = co.customer_id
      LEFT JOIN messages m ON co.id = m.conversation_id
      WHERE c.id = $1
      GROUP BY c.id
    `;

    const result = await query(sql, [customer_id]);
    return result.rows[0];
  }

  /**
   * Get customer purchase patterns
   */
  static async getPurchasePatterns() {
    const sql = `
      SELECT 
        CASE 
          WHEN total_orders = 1 THEN 'One-time Buyer'
          WHEN total_orders = 2 THEN 'Repeat Buyer'
          WHEN total_orders >= 3 AND total_orders < 5 THEN 'Loyal Customer'
          WHEN total_orders >= 5 THEN 'VIP Customer'
          ELSE 'No Purchase'
        END as customer_type,
        COUNT(*) as count,
        AVG(total_spent) as avg_lifetime_value
      FROM customers
      GROUP BY customer_type
      ORDER BY avg_lifetime_value DESC
    `;

    const result = await query(sql);
    return result.rows;
  }
}

module.exports = CustomerAnalytics;
