/**
 * User Model
 * Handles admin user authentication and management
 */

const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  /**
   * Create a new user
   */
  static async create({ email, password, name, role = 'admin' }) {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (id, email, password, name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, role, created_at
    `;

    const result = await query(sql, [id, email, hashedPassword, name, role]);
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const sql = `
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const sql = `
      SELECT id, email, password, name, role, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await query(sql, [email]);
    return result.rows[0];
  }

  /**
   * Update user profile
   */
  static async updateProfile(id, { name, email }) {
    const sql = `
      UPDATE users
      SET name = $1, email = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, email, name, role, updated_at
    `;

    const result = await query(sql, [name, email, id]);
    return result.rows[0];
  }

  /**
   * Update user password
   */
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const sql = `
      UPDATE users
      SET password = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `;

    const result = await query(sql, [hashedPassword, id]);
    return result.rows[0];
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get all users
   */
  static async getAll() {
    const sql = `
      SELECT id, email, name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Delete user
   */
  static async delete(id) {
    const sql = `DELETE FROM users WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }
}

module.exports = User;
