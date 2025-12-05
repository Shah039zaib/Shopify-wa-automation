/**
 * WhatsApp Account Model
 * Manages multiple WhatsApp accounts for load balancing
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class WhatsAppAccount {
  /**
   * Create a new WhatsApp account
   */
  static async create({ phone_number, name, is_primary = false, daily_limit = 500 }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO whatsapp_accounts (
        id, phone_number, name, is_primary, 
        daily_limit, status, risk_level
      )
      VALUES ($1, $2, $3, $4, $5, 'disconnected', 'low')
      RETURNING *
    `;

    const result = await query(sql, [id, phone_number, name, is_primary, daily_limit]);
    return result.rows[0];
  }

  /**
   * Find account by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM whatsapp_accounts WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Find account by phone number
   */
  static async findByPhone(phone_number) {
    const sql = `SELECT * FROM whatsapp_accounts WHERE phone_number = $1`;
    const result = await query(sql, [phone_number]);
    return result.rows[0];
  }

  /**
   * Get primary account
   */
  static async getPrimary() {
    const sql = `
      SELECT * FROM whatsapp_accounts 
      WHERE is_primary = true 
      LIMIT 1
    `;
    const result = await query(sql);
    return result.rows[0];
  }

  /**
   * Get all active accounts
   */
  static async getActive() {
    const sql = `
      SELECT * FROM whatsapp_accounts 
      WHERE status IN ('connected', 'ready')
      ORDER BY daily_message_count ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get all accounts
   */
  static async getAll() {
    const sql = `
      SELECT * FROM whatsapp_accounts 
      ORDER BY is_primary DESC, created_at ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Update account status
   */
  static async updateStatus(id, status) {
    const sql = `
      UPDATE whatsapp_accounts
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [status, id]);
    return result.rows[0];
  }

  /**
   * Increment daily message count
   */
  static async incrementMessageCount(id) {
    const sql = `
      UPDATE whatsapp_accounts
      SET daily_message_count = daily_message_count + 1,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Reset daily message count
   */
  static async resetDailyCount(id) {
    const sql = `
      UPDATE whatsapp_accounts
      SET daily_message_count = 0,
          last_reset_time = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Reset all accounts daily count (cron job)
   */
  static async resetAllDailyCounts() {
    const sql = `
      UPDATE whatsapp_accounts
      SET daily_message_count = 0,
          last_reset_time = NOW(),
          updated_at = NOW()
      WHERE last_reset_time < CURRENT_DATE
    `;
    await query(sql);
    return true;
  }

  /**
   * Update risk level
   */
  static async updateRiskLevel(id, risk_level) {
    const sql = `
      UPDATE whatsapp_accounts
      SET risk_level = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [risk_level, id]);
    return result.rows[0];
  }

  /**
   * Set primary account
   */
  static async setPrimary(id) {
    // First, unset all other primary accounts
    await query('UPDATE whatsapp_accounts SET is_primary = false');
    
    // Then set this one as primary
    const sql = `
      UPDATE whatsapp_accounts
      SET is_primary = true, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Update account settings
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
      UPDATE whatsapp_accounts
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Get account statistics
   */
  static async getStats(id) {
    const sql = `
      SELECT 
        wa.*,
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(DISTINCT m.id) as total_messages
      FROM whatsapp_accounts wa
      LEFT JOIN conversations c ON wa.id = c.whatsapp_account_id
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE wa.id = $1
      GROUP BY wa.id
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Check if account is within limits
   */
  static async checkLimits(id) {
    const account = await this.findById(id);
    if (!account) return false;

    return {
      withinDailyLimit: account.daily_message_count < account.daily_limit,
      remainingMessages: account.daily_limit - account.daily_message_count,
      utilizationPercent: (account.daily_message_count / account.daily_limit) * 100
    };
  }

  /**
   * Get least busy account
   */
  static async getLeastBusy() {
    const sql = `
      SELECT * FROM whatsapp_accounts
      WHERE status IN ('connected', 'ready')
        AND daily_message_count < daily_limit
        AND risk_level != 'high'
      ORDER BY daily_message_count ASC
      LIMIT 1
    `;
    const result = await query(sql);
    return result.rows[0];
  }

  /**
   * Delete account
   */
  static async delete(id) {
    const sql = `DELETE FROM whatsapp_accounts WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }
}

module.exports = WhatsAppAccount;
