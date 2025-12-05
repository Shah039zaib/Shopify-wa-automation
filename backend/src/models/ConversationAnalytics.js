/**
 * Conversation Analytics Model
 * Tracks and analyzes conversation metrics
 */

const { query } = require('../config/database');

class ConversationAnalytics {
  /**
   * Get overall conversation statistics
   */
  static async getOverallStats(start_date = null, end_date = null) {
    let sql = `
      SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(DISTINCT c.customer_id) as unique_customers,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_conversations,
        COUNT(DISTINCT CASE WHEN c.status = 'closed' THEN c.id END) as closed_conversations,
        AVG(c.messages_count) as avg_messages_per_conversation,
        AVG(EXTRACT(EPOCH FROM (c.updated_at - c.created_at))/60) as avg_duration_minutes
      FROM conversations c
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
   * Get conversation trends (daily counts)
   */
  static async getDailyTrends(days = 30) {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as conversation_count,
        COUNT(DISTINCT customer_id) as unique_customers,
        AVG(messages_count) as avg_messages
      FROM conversations
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get hourly distribution (peak hours)
   */
  static async getHourlyDistribution() {
    const sql = `
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as conversation_count
      FROM conversations
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get response time statistics
   */
  static async getResponseTimeStats(start_date = null, end_date = null) {
    let sql = `
      SELECT 
        AVG(
          EXTRACT(EPOCH FROM (
            (SELECT MIN(timestamp) FROM messages 
             WHERE conversation_id = c.id AND sender = 'bot')
            -
            (SELECT MIN(timestamp) FROM messages 
             WHERE conversation_id = c.id AND sender = 'customer')
          ))
        ) as avg_first_response_seconds,
        AVG(
          EXTRACT(EPOCH FROM (updated_at - created_at))
        ) as avg_conversation_duration_seconds
      FROM conversations c
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
   * Get conversation by status breakdown
   */
  static async getStatusBreakdown() {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM conversations), 2) as percentage
      FROM conversations
      GROUP BY status
      ORDER BY count DESC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get top active customers
   */
  static async getTopActiveCustomers(limit = 10) {
    const sql = `
      SELECT 
        c.name,
        c.phone_number,
        COUNT(co.id) as conversation_count,
        SUM(co.messages_count) as total_messages,
        MAX(co.last_message_at) as last_conversation
      FROM customers c
      JOIN conversations co ON c.id = co.customer_id
      GROUP BY c.id
      ORDER BY conversation_count DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * Get conversation completion rate
   */
  static async getCompletionRate(start_date = null, end_date = null) {
    let sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as completed,
        ROUND(
          COUNT(CASE WHEN status = 'closed' THEN 1 END) * 100.0 / COUNT(*), 
          2
        ) as completion_rate
      FROM conversations
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
   * Get message type distribution
   */
  static async getMessageTypeDistribution() {
    const sql = `
      SELECT 
        message_type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM messages), 2) as percentage
      FROM messages
      GROUP BY message_type
      ORDER BY count DESC
    `;

    const result = await query(sql);
    return result.rows;
  }
}

module.exports = ConversationAnalytics;
