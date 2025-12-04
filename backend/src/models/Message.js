/**
 * Message Model
 * Manages individual messages in conversations
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Message {
  /**
   * Create a new message
   */
  static async create({
    conversation_id,
    sender,
    message_text,
    message_type = 'text',
    media_url = null,
    ai_used = null
  }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO messages (
        id, conversation_id, sender, message_text, 
        message_type, media_url, ai_used, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      id,
      conversation_id,
      sender,
      message_text,
      message_type,
      media_url,
      ai_used
    ]);

    return result.rows[0];
  }

  /**
   * Find message by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM messages WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Get messages by conversation
   */
  static async findByConversation(conversation_id, { limit = 50, offset = 0 } = {}) {
    const sql = `
      SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY timestamp ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [conversation_id, limit, offset]);
    return result.rows;
  }

  /**
   * Get recent messages
   */
  static async getRecent(conversation_id, limit = 10) {
    const sql = `
      SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;

    const result = await query(sql, [conversation_id, limit]);
    return result.rows.reverse(); // Return in chronological order
  }

  /**
   * Mark message as read
   */
  static async markAsRead(id) {
    const sql = `
      UPDATE messages
      SET read_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Mark all conversation messages as read
   */
  static async markConversationAsRead(conversation_id) {
    const sql = `
      UPDATE messages
      SET read_at = NOW()
      WHERE conversation_id = $1 AND read_at IS NULL
    `;

    await query(sql, [conversation_id]);
    return true;
  }

  /**
   * Get unread message count for conversation
   */
  static async getUnreadCount(conversation_id) {
    const sql = `
      SELECT COUNT(*) as count
      FROM messages
      WHERE conversation_id = $1 AND read_at IS NULL AND sender = 'customer'
    `;

    const result = await query(sql, [conversation_id]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get message statistics
   */
  static async getStats(conversation_id) {
    const sql = `
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN sender = 'customer' THEN 1 END) as customer_messages,
        COUNT(CASE WHEN sender = 'bot' THEN 1 END) as bot_messages,
        COUNT(CASE WHEN sender = 'admin' THEN 1 END) as admin_messages,
        COUNT(CASE WHEN message_type != 'text' THEN 1 END) as media_messages
      FROM messages
      WHERE conversation_id = $1
    `;

    const result = await query(sql, [conversation_id]);
    return result.rows[0];
  }

  /**
   * Delete message
   */
  static async delete(id) {
    const sql = `DELETE FROM messages WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }

  /**
   * Get messages by date range
   */
  static async getByDateRange(conversation_id, start_date, end_date) {
    const sql = `
      SELECT * FROM messages
      WHERE conversation_id = $1
        AND timestamp >= $2
        AND timestamp <= $3
      ORDER BY timestamp ASC
    `;

    const result = await query(sql, [conversation_id, start_date, end_date]);
    return result.rows;
  }

  /**
   * Search messages
   */
  static async search(conversation_id, searchTerm) {
    const sql = `
      SELECT * FROM messages
      WHERE conversation_id = $1
        AND message_text ILIKE $2
      ORDER BY timestamp DESC
      LIMIT 20
    `;

    const result = await query(sql, [conversation_id, `%${searchTerm}%`]);
    return result.rows;
  }
}

module.exports = Message;
