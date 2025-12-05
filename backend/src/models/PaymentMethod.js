/**
 * Payment Method Model
 * Manages payment methods (EasyPaisa, JazzCash, Bank Transfer)
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class PaymentMethod {
  /**
   * Create a new payment method
   */
  static async create({
    type,
    account_title,
    account_number,
    iban = null,
    bank_name = null,
    qr_code_url = null,
    is_active = true,
    display_order = 0
  }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO payment_methods (
        id, type, account_title, account_number,
        iban, bank_name, qr_code_url, is_active, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await query(sql, [
      id, type, account_title, account_number,
      iban, bank_name, qr_code_url, is_active, display_order
    ]);

    return result.rows[0];
  }

  /**
   * Find payment method by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM payment_methods WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Get all active payment methods
   */
  static async getActive() {
    const sql = `
      SELECT * FROM payment_methods
      WHERE is_active = true
      ORDER BY display_order ASC, created_at ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get all payment methods
   */
  static async getAll() {
    const sql = `
      SELECT * FROM payment_methods
      ORDER BY display_order ASC, created_at ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get payment methods by type
   */
  static async getByType(type) {
    const sql = `
      SELECT * FROM payment_methods
      WHERE type = $1 AND is_active = true
      ORDER BY display_order ASC
    `;
    const result = await query(sql, [type]);
    return result.rows;
  }

  /**
   * Update payment method
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(data[key]);
      paramCount++;
    });

    values.push(id);

    const sql = `
      UPDATE payment_methods
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
      UPDATE payment_methods
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Update QR code URL
   */
  static async updateQRCode(id, qr_code_url) {
    const sql = `
      UPDATE payment_methods
      SET qr_code_url = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [qr_code_url, id]);
    return result.rows[0];
  }

  /**
   * Reorder payment methods
   */
  static async reorder(orderedIds) {
    const promises = orderedIds.map((id, index) => {
      const sql = `
        UPDATE payment_methods
        SET display_order = $1
        WHERE id = $2
      `;
      return query(sql, [index, id]);
    });

    await Promise.all(promises);
    return true;
  }

  /**
   * Delete payment method
   */
  static async delete(id) {
    const sql = `DELETE FROM payment_methods WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }

  /**
   * Format payment details for sending to customer
   */
  static async formatForCustomer(includeAll = false) {
    const methods = includeAll ? await this.getAll() : await this.getActive();

    return methods.map(method => {
      let details = `\n💳 *${method.type.toUpperCase()}*\n`;
      details += `Account Title: ${method.account_title}\n`;
      details += `Account Number: ${method.account_number}\n`;

      if (method.type === 'bank_transfer' && method.iban) {
        details += `IBAN: ${method.iban}\n`;
        details += `Bank: ${method.bank_name}\n`;
      }

      return details;
    }).join('\n');
  }

  /**
   * Get payment method usage statistics
   */
  static async getUsageStats(id) {
    const sql = `
      SELECT 
        pm.*,
        COUNT(o.id) as total_orders,
        SUM(CASE WHEN o.status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
        SUM(o.amount) as total_amount
      FROM payment_methods pm
      LEFT JOIN orders o ON pm.id = o.payment_method_id
      WHERE pm.id = $1
      GROUP BY pm.id
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = PaymentMethod;
