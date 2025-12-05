/**
 * Package Model
 * Manages service packages (Shopify store packages)
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Package {
  /**
   * Create a new package
   */
  static async create({
    name,
    description,
    price,
    features = [],
    is_active = true,
    display_order = 0
  }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO packages (
        id, name, description, price, 
        features, is_active, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(sql, [
      id, name, description, price,
      JSON.stringify(features), is_active, display_order
    ]);

    return result.rows[0];
  }

  /**
   * Find package by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM packages WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Get all active packages
   */
  static async getActive() {
    const sql = `
      SELECT * FROM packages
      WHERE is_active = true
      ORDER BY display_order ASC, price ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get all packages
   */
  static async getAll() {
    const sql = `
      SELECT * FROM packages
      ORDER BY display_order ASC, price ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Update package
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      if (key === 'features') {
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
      UPDATE packages
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Toggle active status
   */
  static async toggleActive(id) {
    const sql = `
      UPDATE packages
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Reorder packages
   */
  static async reorder(orderedIds) {
    const promises = orderedIds.map((id, index) => {
      const sql = `
        UPDATE packages
        SET display_order = $1
        WHERE id = $2
      `;
      return query(sql, [index, id]);
    });

    await Promise.all(promises);
    return true;
  }

  /**
   * Get package with sales statistics
   */
  static async getWithStats(id) {
    const sql = `
      SELECT 
        p.*,
        COUNT(o.id) as total_orders,
        SUM(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(o.amount) as total_revenue
      FROM packages p
      LEFT JOIN orders o ON p.id = o.package_id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Get all packages with statistics
   */
  static async getAllWithStats() {
    const sql = `
      SELECT 
        p.*,
        COUNT(o.id) as total_orders,
        SUM(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(o.amount) as total_revenue
      FROM packages p
      LEFT JOIN orders o ON p.id = o.package_id
      GROUP BY p.id
      ORDER BY p.display_order ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Format package for customer display
   */
  static async formatForCustomer(id) {
    const pkg = await this.findById(id);
    if (!pkg) return null;

    let message = `\n📦 *${pkg.name}*\n`;
    message += `💰 Price: Rs. ${pkg.price.toLocaleString()}\n`;
    message += `\n📋 Features:\n`;

    const features = typeof pkg.features === 'string' 
      ? JSON.parse(pkg.features) 
      : pkg.features;

    features.forEach(feature => {
      message += `✅ ${feature}\n`;
    });

    return message;
  }

  /**
   * Format all active packages for customer
   */
  static async formatAllForCustomer() {
    const packages = await this.getActive();
    
    let message = '\n🛍️ *Available Packages:*\n';
    
    for (const pkg of packages) {
      message += `\n${await this.formatForCustomer(pkg.id)}`;
    }

    return message;
  }

  /**
   * Delete package
   */
  static async delete(id) {
    const sql = `DELETE FROM packages WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }

  /**
   * Get most popular package
   */
  static async getMostPopular() {
    const sql = `
      SELECT 
        p.*,
        COUNT(o.id) as order_count
      FROM packages p
      LEFT JOIN orders o ON p.id = o.package_id
      WHERE p.is_active = true
      GROUP BY p.id
      ORDER BY order_count DESC
      LIMIT 1
    `;

    const result = await query(sql);
    return result.rows[0];
  }
}

module.exports = Package;
