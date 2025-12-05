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

    // Convert value based on type
    let storedValue = value;
    if (type === 'json') {
      storedValue = JSON.stringify(value);
    } else if (type === 'boolean') {
      storedValue = value.toString();
    } else if (type === 'number') {
      storedValue = value.toString();
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

    const result = await query(sql, [id, key, storedValue, type, category, description]);
    return result.rows[0];
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

    const setting = result.rows[0];

    // Parse value based on type
    switch (setting.type) {
      case 'json':
        try {
          return JSON.parse(setting.value);
        } catch (e) {
          return defaultValue;
        }
      case 'boolean':
        return setting.value === 'true';
      case 'number':
        return parseFloat(setting.value);
      default:
        return setting.value;
    }
  }

  /**
   * Get all settings
   */
  static async getAll() {
    const sql = `
      SELECT * FROM settings
      ORDER BY category, key
    `;
    const result = await query(sql);
    
    // Parse values based on type
    return result.rows.map(setting => {
      let parsedValue = setting.value;
      
      switch (setting.type) {
        case 'json':
          try {
            parsedValue = JSON.parse(setting.value);
          } catch (e) {
            parsedValue = null;
          }
          break;
        case 'boolean':
          parsedValue = setting.value === 'true';
          break;
        case 'number':
          parsedValue = parseFloat(setting.value);
          break;
      }
      
      return { ...setting, parsedValue };
    });
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
    
    return result.rows.map(setting => {
      let parsedValue = setting.value;
      
      switch (setting.type) {
        case 'json':
          try {
            parsedValue = JSON.parse(setting.value);
          } catch (e) {
            parsedValue = null;
          }
          break;
        case 'boolean':
          parsedValue = setting.value === 'true';
          break;
        case 'number':
          parsedValue = parseFloat(setting.value);
          break;
      }
      
      return { ...setting, parsedValue };
    });
  }

  /**
   * Update setting value
   */
  static async update(key, value) {
    // Get current setting to determine type
    const currentSetting = await query('SELECT type FROM settings WHERE key = $1', [key]);
    
    if (currentSetting.rows.length === 0) {
      throw new Error(`Setting with key '${key}' not found`);
    }

    const type = currentSetting.rows[0].type;

    // Convert value based on type
    let storedValue = value;
    if (type === 'json') {
      storedValue = JSON.stringify(value);
    } else if (type === 'boolean') {
      storedValue = value.toString();
    } else if (type === 'number') {
      storedValue = value.toString();
    }

    const sql = `
      UPDATE settings
      SET value = $1, updated_at = NOW()
      WHERE key = $2
      RETURNING *
    `;

    const result = await query(sql, [storedValue, key]);
    return result.rows[0];
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
   * Check if setting exists
   */
  static async exists(key) {
    const sql = `SELECT COUNT(*) FROM settings WHERE key = $1`;
    const result = await query(sql, [key]);
    return parseInt(result.rows[0].count) > 0;
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
   * Reset to default settings
   */
  static async resetToDefaults() {
    // This would reset settings to default values
    // Implementation depends on what your default settings are
    const defaults = [
      { key: 'app_name', value: 'WhatsApp Automation', type: 'string', category: 'general' },
      { key: 'max_messages_per_day', value: '500', type: 'number', category: 'whatsapp' },
      { key: 'enable_ai', value: 'true', type: 'boolean', category: 'ai' },
      { key: 'business_hours_enabled', value: 'false', type: 'boolean', category: 'general' }
    ];

    for (const setting of defaults) {
      await this.set(setting.key, setting.value, setting.type, setting.category);
    }

    return true;
  }

  /**
   * Bulk update settings
   */
  static async bulkUpdate(settings) {
    const promises = settings.map(({ key, value }) => 
      this.update(key, value)
    );

    await Promise.all(promises);
    return true;
  }

  /**
   * Get settings as object (for easy access)
   */
  static async getAsObject() {
    const settings = await this.getAll();
    const obj = {};

    settings.forEach(setting => {
      obj[setting.key] = setting.parsedValue;
    });

    return obj;
  }
}

module.exports = Setting;
