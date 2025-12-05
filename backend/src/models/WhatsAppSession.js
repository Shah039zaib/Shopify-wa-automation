/**
 * WhatsApp Session Model
 * Manages WhatsApp session persistence in database
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { encrypt, decrypt } = require('../utils/encryption');

class WhatsAppSession {
  /**
   * Save session data
   */
  static async save({ account_id, session_data, qr_code = null }) {
    const id = uuidv4();
    
    // Encrypt session data before storing
    const encrypted_data = encrypt(JSON.stringify(session_data));

    const sql = `
      INSERT INTO whatsapp_sessions (
        id, account_id, session_data, qr_code, expires_at
      )
      VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')
      ON CONFLICT (account_id) 
      DO UPDATE SET 
        session_data = $3,
        qr_code = $4,
        last_active = NOW(),
        expires_at = NOW() + INTERVAL '7 days'
      RETURNING *
    `;

    const result = await query(sql, [id, account_id, encrypted_data, qr_code]);
    return result.rows[0];
  }

  /**
   * Get session by account ID
   */
  static async getByAccountId(account_id) {
    const sql = `
      SELECT * FROM whatsapp_sessions 
      WHERE account_id = $1
    `;
    
    const result = await query(sql, [account_id]);
    
    if (result.rows.length === 0) return null;

    const session = result.rows[0];
    
    // Decrypt session data
    if (session.session_data) {
      try {
        session.session_data = JSON.parse(decrypt(session.session_data));
      } catch (error) {
        console.error('Failed to decrypt session data:', error);
        session.session_data = null;
      }
    }

    return session;
  }

  /**
   * Update QR code
   */
  static async updateQRCode(account_id, qr_code) {
    const sql = `
      UPDATE whatsapp_sessions
      SET qr_code = $1, last_active = NOW()
      WHERE account_id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [qr_code, account_id]);
    return result.rows[0];
  }

  /**
   * Clear QR code (after successful scan)
   */
  static async clearQRCode(account_id) {
    const sql = `
      UPDATE whatsapp_sessions
      SET qr_code = NULL, last_active = NOW()
      WHERE account_id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [account_id]);
    return result.rows[0];
  }

  /**
   * Update last active time
   */
  static async updateLastActive(account_id) {
    const sql = `
      UPDATE whatsapp_sessions
      SET last_active = NOW()
      WHERE account_id = $1
    `;
    
    await query(sql, [account_id]);
    return true;
  }

  /**
   * Check if session is valid
   */
  static async isValid(account_id) {
    const sql = `
      SELECT * FROM whatsapp_sessions
      WHERE account_id = $1
        AND expires_at > NOW()
    `;
    
    const result = await query(sql, [account_id]);
    return result.rows.length > 0;
  }

  /**
   * Delete session
   */
  static async delete(account_id) {
    const sql = `DELETE FROM whatsapp_sessions WHERE account_id = $1`;
    await query(sql, [account_id]);
    return true;
  }

  /**
   * Delete expired sessions (cleanup job)
   */
  static async deleteExpired() {
    const sql = `
      DELETE FROM whatsapp_sessions 
      WHERE expires_at < NOW()
    `;
    
    const result = await query(sql);
    return result.rowCount;
  }

  /**
   * Get all active sessions
   */
  static async getAllActive() {
    const sql = `
      SELECT ws.*, wa.phone_number, wa.name
      FROM whatsapp_sessions ws
      JOIN whatsapp_accounts wa ON ws.account_id = wa.id
      WHERE ws.expires_at > NOW()
      ORDER BY ws.last_active DESC
    `;
    
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Backup session to JSON
   */
  static async backup(account_id) {
    const session = await this.getByAccountId(account_id);
    if (!session) return null;

    return {
      account_id: session.account_id,
      session_data: session.session_data,
      created_at: session.created_at,
      last_active: session.last_active
    };
  }

  /**
   * Restore session from backup
   */
  static async restore(backup) {
    return await this.save({
      account_id: backup.account_id,
      session_data: backup.session_data
    });
  }
}

module.exports = WhatsAppSession;
