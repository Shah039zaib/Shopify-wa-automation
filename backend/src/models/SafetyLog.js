/**
 * Safety Log Model
 * Tracks safety events, rate limits, and potential issues
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class SafetyLog {
  /**
   * Create a new safety log entry
   */
  static async create({
    account_id,
    event_type,
    severity,
    message,
    metadata = {}
  }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO safety_logs (
        id, account_id, event_type, severity,
        message, metadata, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      id, account_id, event_type, severity,
      message, JSON.stringify(metadata)
    ]);

    return result.rows[0];
  }

  /**
   * Get logs with pagination
   */
  static async getAll({ 
    page = 1, 
    limit = 50, 
    account_id = null,
    severity = null,
    event_type = null 
  }) {
    const offset = (page - 1) * limit;

    let sql = `
      SELECT sl.*, wa.phone_number, wa.name as account_name
      FROM safety_logs sl
      LEFT JOIN whatsapp_accounts wa ON sl.account_id = wa.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (account_id) {
      sql += ` AND sl.account_id = $${paramCount}`;
      params.push(account_id);
      paramCount++;
    }

    if (severity) {
      sql += ` AND sl.severity = $${paramCount}`;
      params.push(severity);
      paramCount++;
    }

    if (event_type) {
      sql += ` AND sl.event_type = $${paramCount}`;
      params.push(event_type);
      paramCount++;
    }

    sql += ` ORDER BY sl.timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) FROM safety_logs WHERE 1=1`;
    const countParams = [];
    if (account_id) {
      countSql += ` AND account_id = $1`;
      countParams.push(account_id);
    }
    if (severity) {
      countSql += ` AND severity = $${countParams.length + 1}`;
      countParams.push(severity);
    }
    if (event_type) {
      countSql += ` AND event_type = $${countParams.length + 1}`;
      countParams.push(event_type);
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
   * Get logs by account
   */
  static async getByAccount(account_id, limit = 50) {
    const sql = `
      SELECT * FROM safety_logs
      WHERE account_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;

    const result = await query(sql, [account_id, limit]);
    return result.rows;
  }

  /**
   * Get recent critical events
   */
  static async getCriticalEvents(limit = 20) {
    const sql = `
      SELECT sl.*, wa.phone_number, wa.name as account_name
      FROM safety_logs sl
      LEFT JOIN whatsapp_accounts wa ON sl.account_id = wa.id
      WHERE sl.severity IN ('high', 'critical')
      ORDER BY sl.timestamp DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * Get event statistics
   */
  static async getStats(account_id = null, start_date = null, end_date = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_severity,
        COUNT(CASE WHEN event_type = 'rate_limit_warning' THEN 1 END) as rate_limit_warnings,
        COUNT(CASE WHEN event_type = 'rate_limit_exceeded' THEN 1 END) as rate_limit_exceeded
      FROM safety_logs
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (account_id) {
      sql += ` AND account_id = $${paramCount}`;
      params.push(account_id);
      paramCount++;
    }

    if (start_date) {
      sql += ` AND timestamp >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      sql += ` AND timestamp <= $${paramCount}`;
      params.push(end_date);
    }

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Calculate risk level for account
   */
  static async calculateRiskLevel(account_id, hours = 24) {
    const sql = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_events,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_events
      FROM safety_logs
      WHERE account_id = $1
        AND timestamp >= NOW() - INTERVAL '${hours} hours'
    `;

    const result = await query(sql, [account_id]);
    const stats = result.rows[0];

    const criticalCount = parseInt(stats.critical_events);
    const highCount = parseInt(stats.high_events);
    const totalCount = parseInt(stats.total_events);

    if (criticalCount > 0 || highCount > 3) {
      return 'high';
    } else if (totalCount > 10 || highCount > 0) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Delete old logs (cleanup)
   */
  static async deleteOlderThan(days = 30) {
    const sql = `
      DELETE FROM safety_logs
      WHERE timestamp < NOW() - INTERVAL '${days} days'
    `;

    const result = await query(sql);
    return result.rowCount;
  }

  /**
   * Get event types count
   */
  static async getEventTypesCount(account_id = null, days = 7) {
    let sql = `
      SELECT 
        event_type,
        COUNT(*) as count
      FROM safety_logs
      WHERE timestamp >= NOW() - INTERVAL '${days} days'
    `;
    const params = [];

    if (account_id) {
      sql += ` AND account_id = $1`;
      params.push(account_id);
    }

    sql += ` GROUP BY event_type ORDER BY count DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Check if account has recent critical events
   */
  static async hasRecentCritical(account_id, minutes = 60) {
    const sql = `
      SELECT COUNT(*) as count
      FROM safety_logs
      WHERE account_id = $1
        AND severity = 'critical'
        AND timestamp >= NOW() - INTERVAL '${minutes} minutes'
    `;

    const result = await query(sql, [account_id]);
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = SafetyLog;
