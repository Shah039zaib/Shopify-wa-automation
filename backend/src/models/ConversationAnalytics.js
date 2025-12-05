/**
 * Conversation Analytics Model
 * Aggregates conversation statistics
 */

const { query } = require('../config/database');

class ConversationAnalytics {
  /**
   * Get conversation statistics for date range
   */
  static async getStats(start_date, end_date) {
    const sql = `
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_conversations,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_conversations,
        AVG(messages_count) as avg_messages_per_conversation,
        SUM(messages_count) as total_messages
      FROM conversations
      WHERE created_at >= $1 AND created_at <= $2
    `;

    const result = await query(sql, [start_date, end_date]);
    return result.rows[0];
  }

  /**
   * Get daily conversation count
   */
  static async getDailyCount(days = 30) {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as conversation_count,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count
      FROM conversations
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get conversation duration statistics
   */
  static async getDurationStats(start_date, end_date) {
    const sql = `
      SELECT 
        AVG(EXTRACT(EPOCH FROM (last_message_at - created_at))/60) as avg_duration_minutes,
        MAX(EXTRACT(EPOCH FROM (last_message_at - created_at))/60) as max_duration_minutes,
        MIN(EXTRACT(EPOCH FROM (last_message_at - created_at))/60) as min_duration_minutes
      FROM conversations
      WHERE created_at >= $1 
        AND created_at <= $2
        AND last_message_at IS NOT NULL
    `;

    const result = await query(sql, [start_date, end_date]);
    return result.rows[0];
  }

  /**
   * Get peak hours
   */
  static async getPeakHours(days = 30) {
    const sql = `
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as conversation_count
      FROM conversations
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY conversation_count DESC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get response rate (bot vs admin)
   */
  static async getResponseRate(start_date, end_date) {
    const sql = `
      SELECT 
        COUNT(DISTINCT CASE WHEN sender = 'bot' THEN conversation_id END) as bot_responses,
        COUNT(DISTINCT CASE WHEN sender = 'admin' THEN conversation_id END) as admin_responses,
        COUNT(DISTINCT conversation_id) as total_conversations
      FROM messages
      WHERE timestamp >= $1 AND timestamp <= $2
    `;

    const result = await query(sql, [start_date, end_date]);
    return result.rows[0];
  }

  /**
   * Get conversation conversion rate
   */
  static async getConversionRate(start_date, end_date) {
    const sql = `
      SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(DISTINCT o.customer_id) as converted_customers,
        (COUNT(DISTINCT o.customer_id)::float / NULLIF(COUNT(DISTINCT c.id), 0) * 100) as conversion_rate
      FROM conversations c
      LEFT JOIN orders o ON c.customer_id = o.customer_id
      WHERE c.created_at >= $1 AND c.created_at <= $2
    `;

    const result = await query(sql, [start_date, end_date]);
    return result.rows[0];
  }
}

module.exports = ConversationAnalytics;
