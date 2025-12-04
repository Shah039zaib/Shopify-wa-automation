/**
 * Conversation Model
 * Manages chat conversations between customers and the bot
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Conversation {
  /**
   * Create a new conversation
   */
  static async create({ customer_id, whatsapp_account_id, status = 'active' }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO conversations (id, customer_id, whatsapp_account_id, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await query(sql, [id, customer_id, whatsapp_account_id, status]);
    return result.rows[0];
  }

  /**
   * Find conversation by ID
   */
  static async findById(id) {
    const sql = `
      SELECT c.*, 
             cu.phone_number, cu.name as customer_name,
             wa.phone_number as wa_phone_number
      FROM conversations c
      LEFT JOIN customers cu ON c.customer_id = cu.id
      LEFT JOIN whatsapp_accounts wa ON c.whatsapp_account_id = wa.id
      WHERE c.id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Find active conversation by customer
   */
  static async findActiveByCustomer(customer_id) {
    const sql = `
      SELECT * FROM conversations
      WHERE customer_id = $1 AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await query(sql, [customer_id]);
    return result.rows[0];
  }

  /**
   * Get all conversations with pagination
   */
  static async getAll({ page = 1, limit = 20, status = null }) {
    const offset = (page - 1) * limit;

    let sql = `
      SELECT c.*, 
             cu.phone_number, cu.name as customer_name,
             wa.phone_number as wa_phone_number
      FROM conversations c
      LEFT JOIN customers cu ON c.customer_id = cu.id
      LEFT JOIN whatsapp_accounts wa ON c.whatsapp_account_id = wa.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      sql += ` AND c.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    sql += ` ORDER BY c.last_message_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    const countSql = `SELECT COUNT(*) FROM conversations WHERE 1=1 ${status ? 'AND status = $1' : ''}`;
    const countResult = await query(countSql, status ? [status] : []);
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
   * Update conversation
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
      UPDATE conversations
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Update last message time
   */
  static async updateLastMessage(id) {
    const sql = `
      UPDATE conversations
      SET last_message_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Increment message count
   */
  static async incrementMessageCount(id) {
    const sql = `
      UPDATE conversations
      SET messages_count = messages_count + 1
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Update context summary
   */
  static async updateContext(id, context_summary) {
    const sql = `
      UPDATE conversations
      SET context_summary = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [context_summary, id]);
    return result.rows[0];
  }

  /**
   * Close conversation
   */
  static async close(id) {
    const sql = `
      UPDATE conversations
      SET status = 'closed', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Reopen conversation
   */
  static async reopen(id) {
    const sql = `
      UPDATE conversations
      SET status = 'active', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Get conversation with messages
   */
  static async getWithMessages(id, messageLimit = 50) {
    const conversationSql = `
      SELECT c.*, 
             cu.phone_number, cu.name as customer_name,
             wa.phone_number as wa_phone_number
      FROM conversations c
      LEFT JOIN customers cu ON c.customer_id = cu.id
      LEFT JOIN whatsapp_accounts wa ON c.whatsapp_account_id = wa.id
      WHERE c.id = $1
    `;

    const messagesSql = `
      SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;

    const [conversationResult, messagesResult] = await Promise.all([
      query(conversationSql, [id]),
      query(messagesSql, [id, messageLimit])
    ]);

    const conversation = conversationResult.rows[0];
    if (!conversation) return null;

    conversation.messages = messagesResult.rows.reverse(); // Reverse to get chronological order
    return conversation;
  }

  /**
   * Delete conversation
   */
  static async delete(id) {
    const sql = `DELETE FROM conversations WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }
}

module.exports = Conversation;
