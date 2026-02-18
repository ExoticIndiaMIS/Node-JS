// services/userService.js

const pool = require('../config/database');

class UserService {
  // Create a new user
  async createUser(userData) {
    const { username, email, password, full_name } = userData;
    
    const query = `
      INSERT INTO users (username, email, password, full_name, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    try {
      const [result] = await pool.execute(query, [
        username,
        email,
        password,
        full_name
      ]);
      
      return {
        id: result.insertId,
        username,
        email,
        full_name
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('User already exists');
      }
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    const query = 'SELECT id, username, email, full_name, created_at FROM users WHERE id = ?';
    
    const [rows] = await pool.execute(query, [userId]);
    
    if (rows.length === 0) {
      throw new Error('User not found');
    }
    
    return rows[0];
  }

  // Get user by email
  async getUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }

  // Get all users with pagination
  async getAllUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const countQuery = 'SELECT COUNT(*) as total FROM users';
    const dataQuery = `
      SELECT id, username, email, full_name, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const [countResult] = await pool.execute(countQuery);
    const [users] = await pool.execute(dataQuery, [limit, offset]);
    
    return {
      data: users,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  // Update user
  async updateUser(userId, updateData) {
    const allowedFields = ['username', 'email', 'full_name'];
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(userId);
    
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, values);
    
    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }
    
    return await this.getUserById(userId);
  }

  // Delete user
  async deleteUser(userId) {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.execute(query, [userId]);
    
    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }
    
    return { message: 'User deleted successfully' };
  }

  // Search users
  async searchUsers(searchTerm) {
    const query = `
      SELECT id, username, email, full_name, created_at 
      FROM users 
      WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?
      ORDER BY created_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const [users] = await pool.execute(query, [
      searchPattern,
      searchPattern,
      searchPattern
    ]);
    
    return users;
  }
}

module.exports = new UserService();