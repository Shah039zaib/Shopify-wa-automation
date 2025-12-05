/**
 * AI Prompt Model
 * Manages customizable AI prompts for different scenarios
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AIPrompt {
  /**
   * Create a new prompt
   */
  static async create({ 
    name, 
    type, 
    content, 
    language = 'urdu',
    is_active = true 
  }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO ai_prompts (
        id, name, type, content, language, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(sql, [
      id, name, type, content, language, is_active
    ]);
    return result.rows[0];
  }

  /**
   * Find prompt by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM ai_prompts WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Find prompts by type
   */
  static async findByType(type) {
    const sql = `
      SELECT * FROM ai_prompts
      WHERE type = $1 AND is_active = true
      ORDER BY usage_count DESC
    `;
    const result = await query(sql, [type]);
    return result.rows;
  }

  /**
   * Find prompt by type and language
   */
  static async findByTypeAndLanguage(type, language) {
    const sql = `
      SELECT * FROM ai_prompts
      WHERE type = $1 
        AND language = $2 
        AND is_active = true
      ORDER BY usage_count DESC
      LIMIT 1
    `;
    const result = await query(sql, [type, language]);
    return result.rows[0];
  }

  /**
   * Get all prompts
   */
  static async getAll({ type = null, language = null } = {}) {
    let sql = `SELECT * FROM ai_prompts WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (type) {
      sql += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (language) {
      sql += ` AND language = $${paramCount}`;
      params.push(language);
      paramCount++;
    }

    sql += ` ORDER BY type, language, usage_count DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Update prompt
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
      UPDATE ai_prompts
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Increment usage count
   */
  static async incrementUsage(id) {
    const sql = `
      UPDATE ai_prompts
      SET usage_count = usage_count + 1
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Toggle active status
   */
  static async toggleActive(id) {
    const sql = `
      UPDATE ai_prompts
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Delete prompt
   */
  static async delete(id) {
    const sql = `DELETE FROM ai_prompts WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }

  /**
   * Get prompt types
   */
  static async getTypes() {
    const sql = `
      SELECT DISTINCT type 
      FROM ai_prompts 
      ORDER BY type
    `;
    const result = await query(sql);
    return result.rows.map(row => row.type);
  }

  /**
   * Get supported languages
   */
  static async getLanguages() {
    const sql = `
      SELECT DISTINCT language 
      FROM ai_prompts 
      ORDER BY language
    `;
    const result = await query(sql);
    return result.rows.map(row => row.language);
  }
}

module.exports = AIPrompt;
