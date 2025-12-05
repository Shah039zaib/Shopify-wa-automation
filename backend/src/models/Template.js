/**
 * Template Model
 * Manages message templates
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Template {
  /**
   * Create a new template
   */
  static async create({
    name,
    content,
    variables = [],
    language = 'urdu',
    category = 'general'
  }) {
    const id = uuidv4();

    const sql = `
      INSERT INTO templates (
        id, name, content, variables, language, category
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(sql, [
      id, name, content, 
      JSON.stringify(variables), language, category
    ]);

    return result.rows[0];
  }

  /**
   * Find template by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM templates WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Get templates by category
   */
  static async getByCategory(category) {
    const sql = `
      SELECT * FROM templates
      WHERE category = $1
      ORDER BY usage_count DESC, created_at DESC
    `;
    const result = await query(sql, [category]);
    return result.rows;
  }

  /**
   * Get templates by language
   */
  static async getByLanguage(language) {
    const sql = `
      SELECT * FROM templates
      WHERE language = $1
      ORDER BY category, usage_count DESC
    `;
    const result = await query(sql, [language]);
    return result.rows;
  }

  /**
   * Get all templates
   */
  static async getAll({ category = null, language = null } = {}) {
    let sql = `SELECT * FROM templates WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (category) {
      sql += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (language) {
      sql += ` AND language = $${paramCount}`;
      params.push(language);
    }

    sql += ` ORDER BY category, language, usage_count DESC`;

    const result = await query(sql,params);
return result.rows;
}
/**
Update template
*/
static async update(id, data) {
const fields = [];
const values = [];
let paramCount = 1;
Object.keys(data).forEach(key => {
  if (key === 'variables') {
    fields.push(`${key} = $${paramCount}`);
    values.push(JSON.stringify(data[key]));
  } else {
    fields.push(`${key} = $${paramCount}`);
    values.push(data[key]);
  }
  paramCount++;
});

values.push(id);

const sql = `
  UPDATE templates
  SET ${fields.join(', ')}, updated_at = NOW()
  WHERE id = $${paramCount}
  RETURNING *
`;

const result = await query(sql, values);
return result.rows[0];
}
/**
Increment usage count
*/
static async incrementUsage(id) {
const sql = UPDATE templates SET usage_count = usage_count + 1 WHERE id = $1 RETURNING *;
const result = await query(sql, [id]);
return result.rows[0];
}
/**
Render template with variables
*/
static async render(id, variableValues = {}) {
const template = await this.findById(id);
if (!template) return null;
let content = template.content;

// Replace variables in format {{variable_name}}
Object.keys(variableValues).forEach(key => {
  const regex = new RegExp(`{{${key}}}`, 'g');
  content = content.replace(regex, variableValues[key]);
});

// Increment usage count
await this.incrementUsage(id);

return content;
}
/**
Delete template
*/
static async delete(id) {
const sql = DELETE FROM templates WHERE id = $1;
await query(sql, [id]);
return true;
}
/**
Get template categories
*/
static async getCategories() {
const sql = SELECT DISTINCT category  FROM templates  ORDER BY category;
const result = await query(sql);
return result.rows.map(row => row.category);
}
/**
Get most used templates
*/
static async getMostUsed(limit = 10) {
const sql = SELECT * FROM templates ORDER BY usage_count DESC LIMIT $1;
const result = await query(sql, [limit]);
return result.rows;
}
/**
Search templates
*/
static async search(searchTerm) {
const sql = SELECT * FROM templates WHERE name ILIKE $1 OR content ILIKE $1 ORDER BY usage_count DESC LIMIT 20;
const result = await query(sql, [%${searchTerm}%]);
return result.rows;
}
}
module.exports = Template;
