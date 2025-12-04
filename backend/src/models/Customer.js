/**
 * Customer Model
 * Manages WhatsApp customers/leads
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Customer {
  /**
   * Create a new customer
   */
  static async create({ phone_number, name, email, language_preference, tags = [] }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO customers (id, phone_number, name, email, language_preference, tags)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(sql, [
      id,
      phone_number,
      name,
      email,
      language_preference,
      JSON.stringify(tags)
    ]);

    return result.rows[0];
  }

  /**
   * Find customer by phone number
   */
  static async findByPhone(phone_number) {
    const sql = `
      SELECT * FROM customers
      WHERE phone_number = $1
    `;

    const result = await query(sql, [phone_number]);
    return result.rows[0];
  }

  /**
   * Find customer by ID
   */
  static async findById(id) {
    const sql = `
      SELECT * FROM customers
      WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Update customer information
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.keys(data).forEach(key => {
      if (key === 'tags') {
        fields.push(`${key} = $${paramCount}`);
        values.push(JSON.stringify(data[key]));
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(data[key]);
      }
      paramCount++;
    });

    values.push(id);

    const sql = `
      UPDATE customers
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Update last interaction time
   */
  static async updateLastInteraction(id) {
    const sql = `
      UPDATE customers
      SET last_interaction = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Increment order count and total spent
   */
  static async incrementOrderStats(id, amount) {
    const sql = `
      UPDATE customers
      SET total_orders = total_orders + 1,
          total_spent = total_spent + $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [amount, id]);
    return result.rows[0];
  }

  /**
   * Get all customers with pagination
   */
  static async getAll({ page = 1, limit = 20, search = '' }) {
    const offset = (page - 1) * limit;

    let sql = `
      SELECT * FROM customers
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Add search filter if provided
    if (search) {
      sql += ` AND (
        phone_number ILIKE $${paramCount} OR
        name ILIKE $${paramCount} OR
        email ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    sql += ` ORDER BY last_interaction DESC, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    const countSql = `SELECT COUNT(*) FROM customers WHERE 1=1 ${search ? 'AND (phone_number ILIKE $1 OR name ILIKE $1 OR email ILIKE $1)' : ''}`;
    const countResult = await query(countSql, search ? [`%${search}%`] : []);
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
   * Get customer statistics
   */
  static async getStats(id) {
    const sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT co.id) as conversation_count,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.amount), 0) as total_revenue
      FROM customers c
      LEFT JOIN conversations co ON c.id = co.customer_id
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE c.id = $1
      GROUP BY c.id
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Search customers
   */
  static async search(searchTerm) {
    const sql = `
      SELECT * FROM customers
      WHERE 
        phone_number ILIKE $1 OR
        name ILIKE $1 OR
        email ILIKE $1
      ORDER BY last_interaction DESC
      LIMIT 10
    `;

    const result = await query(sql, [`%${searchTerm}%`]);
    return result.rows;
  }

  /**
   * Delete customer
   */
  static async delete(id) {
    const sql = `DELETE FROM customers WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }

  /**
   * Get recent customers
   */
  static async getRecent(limit = 10) {
    const sql = `
      SELECT * FROM customers
      ORDER BY created_at DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }
}

module.exports = Customer;
