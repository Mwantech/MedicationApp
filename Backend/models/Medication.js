const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');

class Medication {
  static async getPool() {
    return mysql.createPool(dbConfig);
  }

  static async findByUserId(userId) {
    const pool = await this.getPool();
    const [rows] = await pool.query(
      'SELECT * FROM medications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async findById(id, userId) {
    const pool = await this.getPool();
    const [rows] = await pool.query(
      'SELECT * FROM medications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0];
  }

  static async create(medicationData) {
    const pool = await this.getPool();
    const { userId, name, dosage, instructions, time } = medicationData;
    
    const [result] = await pool.query(
      'INSERT INTO medications (user_id, name, dosage, instructions, time) VALUES (?, ?, ?, ?, ?)',
      [userId, name, dosage || null, instructions || null, time]
    );
    
    return this.findById(result.insertId, userId);
  }

  static async update(id, userId, medicationData) {
    const pool = await this.getPool();
    const { name, dosage, instructions, time } = medicationData;
    
    await pool.query(
      'UPDATE medications SET name = ?, dosage = ?, instructions = ?, time = ? WHERE id = ? AND user_id = ?',
      [name, dosage || null, instructions || null, time, id, userId]
    );
    
    return this.findById(id, userId);
  }

  static async delete(id, userId) {
    const pool = await this.getPool();
    const [result] = await pool.query(
      'DELETE FROM medications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Medication;