/**
 * Setting Model
 * Manages system-wide settings (key-value store)
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Setting {
  /**
   * Create or update a setting
   */
  static async set(key, value, type = 'string', category = 'general', description = '') {
    const id = uuidv4();

    // Convert value to appropriate format
    let formattedValue = value;
    if (type === 'json' && typeof value === 'object') {
      formattedValue = JSON.stringify(value);
    } else if (type === 'boolean') {
      formattedValue = String(value);
    } else if (type === 'number') {
      formattedValue = String(value);
    }

    const sql = `
      INSERT INTO settings (id, key, value, type, category, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = $3,
        type = $4,
        category = $5,
        description = $6,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await query(sql, [
      id, key, formattedValue, type, category, description
    ]);

    return this.formatSetting(result.rows[0]);
  }

  /**
   * Get a setting by key
   */
  static async get(key, defaultValue = null) {
    const sql = `SELECT * FROM settings WHERE key = $1`;
    const result = await query(sql, [key]);

    if (result.rows.length === 0) {
      return defaultValue;
    }

    const setting = this.formatSetting(result.rows[0]);
    return setting.value;
  }

  /**
   * Get all settings
   */
  static async getAll(category = null) {
    let sql = `SELECT * FROM settings`;
    const params = [];

    if (category) {
      sql += ` WHERE category = $1`;
      params.push(category);
    }

    sql += ` ORDER BY category, key`;

    const result = await query(sql, params);
    return result.rows.map(row => this.formatSetting(row));
  }

  /**
   * Get settings by category
   */
  static async getByCategory(category) {
    const sql = `
      SELECT * FROM settings
      WHERE category = $1
      ORDER BY key
    `;
    const result = await query(sql, [category]);
    return result.rows.map(row => this.formatSetting(row));
  }

  /**
   * Delete a setting
   */
  static async delete(key) {
    const sql = `DELETE FROM settings WHERE key = $1`;
    await query(sql, [key]);
    return true;
  }

  /**
   * Get all categories
   */
  static async getCategories() {
    const sql = `
      SELECT DISTINCT category 
      FROM settings 
      ORDER BY category
    `;
    const result = await query(sql);
    return result.rows.map(row => row.category);
  }

  /**
   * Bulk set settings
   */
  static async bulkSet(settings) {
    const promises = settings.map(({ key, value, type, category, description }) =>
      this.set(key, value, type, category, description)
    );
    return await Promise.all(promises);
  }

  /**
   * Reset to default values
   */
  static async resetToDefaults() {
    // Define default settings
    const defaults = [
      {
        key: 'business_name',
        value: 'My Business',
        type: 'string',
        category: 'general',
        description: 'Business name'
      },
      {
        key: 'max_messages_per_day',
        value: '500',
        type: 'number',
        category: 'whatsapp',
        description: 'Maximum messages per day (anti-ban)'
      },
      {
        key: 'auto_reply_enabled',
        value: 'true',
        type: 'boolean',
        category: 'whatsapp',
        description: 'Enable automatic replies'
      },
      {
        key: 'business_hours_enabled',
        value: 'false',
        type: 'boolean',
        category: 'general',
        description: 'Enable business hours restriction'
      },
      {
        key: 'default_language',
        value: 'urdu',
        type: 'string',
        category: 'general',
        description: 'Default language for responses'
      },
      {
        key: 'ai_temperature',
        value: '0.7',
        type: 'number',
        category: 'ai',
        description: 'AI response creativity (0-1)'
      }
    ];

    return await this.bulkSet(defaults);
  }

  /**
   * Format setting value based on type
   */
  static formatSetting(setting) {
    if (!setting) return null;

    const formatted = { ...setting };

    switch (setting.type) {
      case 'number':
        formatted.value = parseFloat(setting.value);
        break;
      case 'boolean':
        formatted.value = setting.value === 'true';
        break;
      case 'json':
        try {
          formatted.value = JSON.parse(setting.value);
        } catch (e) {
          formatted.value = setting.value;
        }
        break;
      default:
        formatted.value = setting.value;
    }

    return formatted;
  }

  /**
   * Export all settings as JSON
   */
  static async exportSettings() {
    const settings = await this.getAll();
    const exported = {};

    settings.forEach(setting => {
      exported[setting.key] = {
        value: setting.value,
        type: setting.type,
        category: setting.category,
        description: setting.description
      };
    });

    return exported;
  }

  /**
   * Import settings from JSON
   */
  static async importSettings(settingsJson) {
    const settings = Object.keys(settingsJson).map(key => ({
      key,
      value: settingsJson[key].value,
      type: settingsJson[key].type,
      category: settingsJson[key].category,
      description: settingsJson[key].description
    }));

    return await this.bulkSet(settings);
  }
}

module.exports = Setting;
