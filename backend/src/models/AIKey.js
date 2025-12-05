/**
 * AI Key Model
 * Manages encrypted AI API keys
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { encrypt, decrypt } = require('../utils/encryption');

class AIKey {
  /**
   * Create a new AI key
   */
  static async create({ 
    provider_id, 
    api_key, 
    is_active = true,
    requests_limit = null,
    expires_at = null
  }) {
    const id = uuidv4();
    
    // Encrypt API key before storing
    const encrypted_key = encrypt(api_key);

    const sql = `
      INSERT INTO ai_keys (
        id, provider_id, api_key, is_active,
        requests_limit, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, provider_id, is_active, requests_used, 
                requests_limit, expires_at, created_at
    `;

    const result = await query(sql, [
      id, provider_id, encrypted_key, is_active,
      requests_limit, expires_at
    ]);
    return result.rows[0];
  }

  /**
   * Find key by ID
   */
  static async findById(id, includeKey = false) {
    const sql = `
      SELECT ak.*, ap.name as provider_name
      FROM ai_keys ak
      JOIN ai_providers ap ON ak.provider_id = ap.id
      WHERE ak.id = $1
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) return null;

    const key = result.rows[0];
    
    // Decrypt API key if requested
    if (includeKey && key.api_key) {
      try {
        key.api_key = decrypt(key.api_key);
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
        key.api_key = null;
      }
    } else {
      // Remove encrypted key from response
      delete key.api_key;
    }

    return key;
  }

  /**
   * Get active keys for provider
   */
  static async getByProvider(provider_id, includeKey = false) {
    const sql = `
      SELECT * FROM ai_keys
      WHERE provider_id = $1
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (requests_limit IS NULL OR requests_used < requests_limit)
      ORDER BY requests_used ASC
    `;
    
    const result = await query(sql, [provider_id]);
    
    if (!includeKey) {
      // Remove encrypted keys from response
      result.rows.forEach(key => delete key.api_key);
    } else {
      // Decrypt keys
      result.rows.forEach(key => {
        if (key.api_key) {
          try {
            key.api_key = decrypt(key.api_key);
          } catch (error) {
            console.error('Failed to decrypt API key:', error);
            key.api_key = null;
          }
        }
      });
    }

    return result.rows;
  }

  /**
   * Get all keys
   */
  static async getAll() {
    const sql = `
      SELECT ak.id, ak.provider_id, ak.is_active, ak.requests_used,
             ak.requests_limit, ak.expires_at, ak.created_at,
             ap.name as provider_name
      FROM ai_keys ak
      JOIN ai_providers ap ON ak.provider_id = ap.id
      ORDER BY ap.name, ak.created_at DESC
    `;
    
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Increment usage count
   */
  static async incrementUsage(id) {
    const sql = `
      UPDATE ai_keys
      SET requests_used = requests_used + 1
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length > 0) {
      delete result.rows[0].api_key;
    }
    
    return result.rows[0];
  }

  /**
   * Toggle key active status
   */
  static async toggleActive(id) {
    const sql = `
      UPDATE ai_keys
      SET is_active = NOT is_active
      WHERE id = $1
      RETURNING id, provider_id, is_active
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Rotate key (replace with new key)
   */
  static async rotate(id, new_api_key) {
    const encrypted_key = encrypt(new_api_key);
    
    const sql = `
      UPDATE ai_keys
      SET api_key = $1, requests_used = 0
      WHERE id = $2
      RETURNING id, provider_id, is_active
    `;
    
    const result = await query(sql, [encrypted_key, id]);
    return result.rows[0];
  }

  /**
   * Check if key is valid
   */
  static async isValid(id) {
    const sql = `
      SELECT * FROM ai_keys
      WHERE id = $1
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (requests_limit IS NULL OR requests_used < requests_limit)
    `;
    
    const result = await query(sql, [id]);
    return result.rows.length > 0;
  }

  /**
   * Delete key
   */
  static async delete(id) {
    const sql = `DELETE FROM ai_keys WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }

  /**
   * Get next available key for provider
   */
  static async getNextAvailable(provider_id) {
    const keys = await this.getByProvider(provider_id, true);
    return keys.length > 0 ? keys[0] : null;
  }
}

module.exports = AIKey;
