/**
 * AI Provider Model
 * Manages AI provider configurations and statistics
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AIProvider {
  /**
   * Create a new AI provider
   */
  static async create({ 
    name, 
    is_active = true, 
    priority = 5,
    daily_limit = 1000,
    model_name = null
  }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO ai_providers (
        id, name, is_active, priority, 
        daily_limit, model_name
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(sql, [
      id, name, is_active, priority, daily_limit, model_name
    ]);
    return result.rows[0];
  }

  /**
   * Find provider by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM ai_providers WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Find provider by name
   */
  static async findByName(name) {
    const sql = `SELECT * FROM ai_providers WHERE LOWER(name) = LOWER($1)`;
    const result = await query(sql, [name]);
    return result.rows[0];
  }

  /**
   * Get all active providers sorted by priority
   */
  static async getActive() {
    const sql = `
      SELECT * FROM ai_providers
      WHERE is_active = true
        AND daily_requests < daily_limit
      ORDER BY priority ASC, success_rate DESC
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get all providers
   */
  static async getAll() {
    const sql = `
      SELECT * FROM ai_providers
      ORDER BY priority ASC, name ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Update provider
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
      UPDATE ai_providers
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Increment request count
   */
  static async incrementRequests(id) {
    const sql = `
      UPDATE ai_providers
      SET daily_requests = daily_requests + 1,
          last_used = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Update statistics (success rate, response time)
   */
  static async updateStats(id, { success, response_time_ms }) {
    const sql = `
      UPDATE ai_providers
      SET 
        success_rate = (
          CASE 
            WHEN daily_requests = 0 THEN ${success ? 100 : 0}
            ELSE (success_rate * daily_requests + ${success ? 100 : 0}) / (daily_requests + 1)
          END
        ),
        avg_response_time = (
          CASE 
            WHEN daily_requests = 0 THEN $1
            ELSE (avg_response_time * daily_requests + $1) / (daily_requests + 1)
          END
        ),
        last_used = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [response_time_ms, id]);
    return result.rows[0];
  }

  /**
   * Reset daily request count (cron job)
   */
  static async resetDailyCounts() {
    const sql = `
      UPDATE ai_providers
      SET daily_requests = 0
      WHERE last_used < CURRENT_DATE
    `;
    await query(sql);
    return true;
  }

  /**
   * Toggle provider active status
   */
  static async toggleActive(id) {
    const sql = `
      UPDATE ai_providers
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Get provider statistics
   */
  static async getStats(id) {
    const sql = `
      SELECT 
        p.*,
        COUNT(l.id) as total_requests,
        COUNT(CASE WHEN l.success = true THEN 1 END) as successful_requests,
        COUNT(CASE WHEN l.success = false THEN 1 END) as failed_requests,
        AVG(l.response_time_ms) as avg_response_time,
        SUM(l.tokens_used) as total_tokens_used
      FROM ai_providers p
      LEFT JOIN ai_logs l ON p.id = l.provider_id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Get next available provider (load balancing)
   */
  static async getNextAvailable() {
    const sql = `
      SELECT * FROM ai_providers
      WHERE is_active = true
        AND daily_requests < daily_limit
      ORDER BY 
        daily_requests ASC,
        priority ASC,
        success_rate DESC
      LIMIT 1
    `;
    const result = await query(sql);
    return result.rows[0];
  }

  /**
   * Check if provider is within limits
   */
  static async checkLimits(id) {
    const provider = await this.findById(id);
    if (!provider) return false;

    return {
      withinLimit: provider.daily_requests < provider.daily_limit,
      remainingRequests: provider.daily_limit - provider.daily_requests,
      utilizationPercent: (provider.daily_requests / provider.daily_limit) * 100
    };
  }

  /**
   * Delete provider
   */
  static async delete(id) {
    const sql = `DELETE FROM ai_providers WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }
}

module.exports = AIProvider;
