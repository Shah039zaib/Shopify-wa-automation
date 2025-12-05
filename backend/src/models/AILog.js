/**
 * AI Log Model
 * Tracks AI API requests, responses, and performance
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AILog {
  /**
   * Create a new log entry
   */
  static async create({
    provider_id,
    message_id = null,
    request_text,
    response_text,
    tokens_used = 0,
    response_time_ms,
    success,
    error_message = null
  }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO ai_logs (
        id, provider_id, message_id, request_text, 
        response_text, tokens_used, response_time_ms,
        success, error_message, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      id, provider_id, message_id, request_text,
      response_text, tokens_used, response_time_ms,
      success, error_message
    ]);

    return result.rows[0];
  }

  /**
   * Get logs with pagination
   */
  static async getAll({ page = 1, limit = 50, provider_id = null, success = null }) {
    const offset = (page - 1) * limit;

    let sql = `
      SELECT al.*, ap.name as provider_name
      FROM ai_logs al
      LEFT JOIN ai_providers ap ON al.provider_id = ap.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (provider_id) {
      sql += ` AND al.provider_id = $${paramCount}`;
      params.push(provider_id);
      paramCount++;
    }

    if (success !== null) {
      sql += ` AND al.success = $${paramCount}`;
      params.push(success);
      paramCount++;
    }

    sql += ` ORDER BY al.timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) FROM ai_logs WHERE 1=1`;
    const countParams = [];
    if (provider_id) {
      countSql += ` AND provider_id = $1`;
      countParams.push(provider_id);
    }
    if (success !== null) {
      countSql += ` AND success = $${countParams.length + 1}`;
      countParams.push(success);
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
   * Get logs by provider
   */
  static async getByProvider(provider_id, limit = 50) {
    const sql = `
      SELECT * FROM ai_logs
      WHERE provider_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;

    const result = await query(sql, [provider_id, limit]);
    return result.rows;
  }

  /**
   * Get error logs
   */
  static async getErrors(limit = 50) {
    const sql = `
      SELECT al.*, ap.name as provider_name
      FROM ai_logs al
      LEFT JOIN ai_providers ap ON al.provider_id = ap.id
      WHERE al.success = false
      ORDER BY al.timestamp DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * Get statistics for date range
   */
  static async getStats(start_date, end_date, provider_id = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_requests,
        COUNT(CASE WHEN success = false THEN 1 END) as failed_requests,
        AVG(response_time_ms) as avg_response_time,
        SUM(tokens_used) as total_tokens,
        AVG(tokens_used) as avg_tokens
      FROM ai_logs
      WHERE timestamp >= $1 AND timestamp <= $2
    `;
    const params = [start_date, end_date];

    if (provider_id) {
      sql += ` AND provider_id = $3`;
      params.push(provider_id);
    }

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Get performance metrics by provider
   */
  static async getPerformanceByProvider(start_date, end_date) {
    const sql = `
      SELECT 
        ap.name as provider_name,
        COUNT(*) as total_requests,
        COUNT(CASE WHEN al.success = true THEN 1 END) as successful_requests,
        COUNT(CASE WHEN al.success = false THEN 1 END) as failed_requests,
        AVG(al.response_time_ms) as avg_response_time,
        SUM(al.tokens_used) as total_tokens
      FROM ai_logs al
      JOIN ai_providers ap ON al.provider_id = ap.id
      WHERE al.timestamp >= $1 AND al.timestamp <= $2
      GROUP BY ap.id, ap.name
      ORDER BY total_requests DESC
    `;

    const result = await query(sql, [start_date, end_date]);
    return result.rows;
  }

  /**
   * Delete old logs (cleanup)
   */
  static async deleteOlderThan(days = 30) {
    const sql = `
      DELETE FROM ai_logs
      WHERE timestamp < NOW() - INTERVAL '${days} days'
    `;

    const result = await query(sql);
    return result.rowCount;
  }

  /**
   * Get recent activity
   */
  static async getRecentActivity(limit = 20) {
    const sql = `
      SELECT 
        al.id,
        al.timestamp,
        al.success,
        al.response_time_ms,
        ap.name as provider_name,
        SUBSTRING(al.request_text, 1, 100) as request_preview
      FROM ai_logs al
      LEFT JOIN ai_providers ap ON al.provider_id = ap.id
      ORDER BY al.timestamp DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }
}

module.exports = AILog;
