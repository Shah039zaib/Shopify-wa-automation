/**
 * Safety Log Model
 * Tracks safety events and rate limit violations
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
   * Get recent logs
   */
  static async getRecent(limit = 50) {
    const sql = `
      SELECT sl.*, wa.phone_number, wa.name as account_name
      FROM safety_logs sl
      LEFT JOIN whatsapp_accounts wa ON sl.account_id = wa.id
      ORDER BY sl.timestamp DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
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
   * Get logs by severity
   */
  static async getBySeverity(severity, limit = 50) {
    const sql = `
      SELECT sl.*, wa.phone_number, wa.name as account_name
      FROM safety_logs sl
      LEFT JOIN whatsapp_accounts wa ON sl.account_id = wa.id
      WHERE sl.severity = $1
      ORDER BY sl.timestamp DESC
      LIMIT $2
    `;

    const result = await query(sql, [severity, limit]);
    return result.rows;
  }

  /**
   * Get logs by event type
   */
  static async getByEventType(event_type, limit = 50) {
    const sql = `
      SELECT sl.*, wa.phone_number, wa.name as account_name
      FROM safety_logs sl
      LEFT JOIN whatsapp_accounts wa ON sl.account_id = wa.id
      WHERE sl.event_type = $1
      ORDER BY sl.timestamp DESC
      LIMIT $2
    `;

    const result = await query(sql, [event_type, limit]);
    return result.rows;
  }

  /**
   * Get logs by date range
   */
  static async getByDateRange(start_date, end_date, account_id = null) {
    let sql = `
      SELECT sl.*, wa.phone_number, wa.name as account_name
      FROM safety_logs sl
      LEFT JOIN whatsapp_accounts wa ON sl.account_id = wa.id
      WHERE sl.timestamp >= $1 AND sl.timestamp <= $2
    `;
    const params = [start_date, end_date];

    if (account_id) {
      sql += ` AND sl.account_id = $3`;
      params.push(account_id);
    }

    sql += ` ORDER BY sl.timestamp DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Calculate risk level for account
   */
  static async calculateRiskLevel(account_id) {
    const sql = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_severity,
        COUNT(CASE WHEN timestamp > NOW() - INTERVAL '1 hour' THEN 1 END) as recent_events
      FROM safety_logs
      WHERE account_id = $1
        AND timestamp > NOW() - INTERVAL '24 hours'
    `;

    const result = await query(sql, [account_id]);
    const stats = result.rows[0];

    // Calculate risk level based on events
    let riskLevel = 'low';
    
    if (stats.critical_severity > 0 || stats.high_severity >= 5) {
      riskLevel = 'high';
    } else if (stats.high_severity >= 2 || stats.recent_events >= 10) {
      riskLevel = 'medium';
    }

    return {
      riskLevel,
      stats
    };
  }

  /**
   * Get statistics for account
   */
  static async getAccountStats(account_id, days = 7) {
    const sql = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_severity,
        COUNT(CASE WHEN event_type = 'rate_limit_warning' THEN 1 END) as rate_limit_warnings,
        COUNT(CASE WHEN event_type = 'rate_limit_exceeded' THEN 1 END) as rate_limit_exceeded
      FROM safety_logs
      WHERE account_id = $1
        AND timestamp > NOW() - INTERVAL '${days} days'
    `;

    const result = await query(sql, [account_id]);
    return result.rows[0];
  }

  /**
   * Get all accounts with their risk levels
   */
  static async getAllAccountRisks() {
    const sql = `
      SELECT 
        wa.id,
        wa.phone_number,
        wa.name,
        wa.risk_level as current_risk_level,
        COUNT(sl.id) as total_safety_events,
        COUNT(CASE WHEN sl.severity = 'high' OR sl.severity = 'critical' THEN 1 END) as critical_events
      FROM whatsapp_accounts wa
      LEFT JOIN safety_logs sl ON wa.id = sl.account_id 
        AND sl.timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY wa.id
      ORDER BY critical_events DESC, total_safety_events DESC
    `;

    const result = await query(sql);
    return result.rows;
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
   * Get critical alerts (for notifications)
   */
  static async getCriticalAlerts(limit = 10) {
    const sql = `
      SELECT sl.*, wa.phone_number, wa.name as account_name
      FROM safety_logs sl
      LEFT JOIN whatsapp_accounts wa ON sl.account_id = wa.id
      WHERE sl.severity IN ('high', 'critical')
        AND sl.timestamp > NOW() - INTERVAL '1 hour'
      ORDER BY sl.timestamp DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * Get daily event count (for charts)
   */
  static async getDailyEventCount(days = 30, account_id = null) {
    let sql = `
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as event_count,
        COUNT(CASE WHEN severity = 'high' OR severity = 'critical' THEN 1 END) as critical_count
      FROM safety_logs
      WHERE timestamp >= NOW() - INTERVAL '${days} days'
    `;
    const params = [];

    if (account_id) {
      sql += ` AND account_id = $1`;
      params.push(account_id);
    }

    sql += ` GROUP BY DATE(timestamp) ORDER BY date ASC`;

    const result = await query(sql, params);
    return result.rows;
  }
}

module.exports = SafetyLog;
