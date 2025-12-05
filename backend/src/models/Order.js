/**
 * Order Model
 * Manages customer orders and sales
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Order {
  /**
   * Create a new order
   */
  static async create({
    customer_id,
    package_id,
    amount,
    status = 'pending',
    payment_method_id = null,
    payment_screenshot_url = null,
    store_details = {}
  }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO orders (
        id, customer_id, package_id, amount, status,
        payment_method_id, payment_screenshot_url, store_details
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await query(sql, [
      id, customer_id, package_id, amount, status,
      payment_method_id, payment_screenshot_url, 
      JSON.stringify(store_details)
    ]);

    return result.rows[0];
  }

  /**
   * Find order by ID
   */
  static async findById(id) {
    const sql = `
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone_number as customer_phone,
        p.name as package_name,
        pm.type as payment_method_type
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN packages p ON o.package_id = p.id
      LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
      WHERE o.id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Get all orders with pagination
   */
  static async getAll({ page = 1, limit = 20, status = null, customer_id = null }) {
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone_number as customer_phone,
        p.name as package_name,
        pm.type as payment_method_type
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN packages p ON o.package_id = p.id
      LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      sql += ` AND o.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (customer_id) {
      sql += ` AND o.customer_id = $${paramCount}`;
      params.push(customer_id);
      paramCount++;
    }

    sql += ` ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) FROM orders WHERE 1=1`;
    const countParams = [];
    if (status) {
      countSql += ` AND status = $1`;
      countParams.push(status);
    }
    if (customer_id) {
      countSql += ` AND customer_id = $${countParams.length + 1}`;
      countParams.push(customer_id);
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get orders by customer
   */
  static async getByCustomer(customer_id) {
    const sql = `
      SELECT 
        o.*,
        p.name as package_name,
        pm.type as payment_method_type
      FROM orders o
      LEFT JOIN packages p ON o.package_id = p.id
      LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC
    `;

    const result = await query(sql, [customer_id]);
    return result.rows;
  }

  /**
   * Update order status
   */
  static async updateStatus(id, status) {
    let sql = `
      UPDATE orders
      SET status = $1, updated_at = NOW()
    `;
    const params = [status, id];

    // Set timestamp fields based on status
    if (status === 'paid') {
      sql += `, paid_at = NOW()`;
    } else if (status === 'completed') {
      sql += `, completed_at = NOW()`;
    }

    sql += ` WHERE id = $2 RETURNING *`;

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Update payment screenshot
   */
  static async updatePaymentScreenshot(id, screenshot_url) {
    const sql = `
      UPDATE orders
      SET payment_screenshot_url = $1, 
          status = 'payment_pending',
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [screenshot_url, id]);
    return result.rows[0];
  }

  /**
   * Update store details
   */
  static async updateStoreDetails(id, store_details) {
    const sql = `
      UPDATE orders
      SET store_details = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [JSON.stringify(store_details), id]);
    return result.rows[0];
  }

  /**
   * Get revenue statistics
   */
  static async getRevenueStats(start_date = null, end_date = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        SUM(amount) as total_revenue,
        SUM(CASE WHEN status = 'paid' OR status = 'completed' THEN amount ELSE 0 END) as confirmed_revenue,
        AVG(amount) as avg_order_value
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
   * Get recent orders
   */
  static async getRecent(limit = 10) {
    const sql = `
      SELECT 
        o.*,
        c.name as customer_name,
        p.name as package_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN packages p ON o.package_id = p.id
      ORDER BY o.created_at DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * Get orders by date range
   */
  static async getByDateRange(start_date, end_date) {
    const sql = `
      SELECT 
        o.*,
        c.name as customer_name,
        p.name as package_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN packages p ON o.package_id = p.id
      WHERE o.created_at >= $1 AND o.created_at <= $2
      ORDER BY o.created_at DESC
    `;

    const result = await query(sql, [start_date, end_date]);
    return result.rows;
  }

  /**
   * Delete order
   */
  static async delete(id) {
    const sql = `DELETE FROM orders WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }

  /**
   * Get daily revenue (for charts)
   */
  static async getDailyRevenue(days = 30) {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(amount) as revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${days} days'
        AND (status = 'paid' OR status = 'completed')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const result = await query(sql);
    return result.rows;
  }
}

module.exports = Order;
