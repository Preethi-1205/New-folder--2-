const db = require('../config/database');

class Group {
  static async create({ name, description, created_by }) {
    const result = await db.query(
      `INSERT INTO groups (name, description, created_by) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description, created_by]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT g.*, u.name as creator_name, u.email as creator_email
       FROM groups g
       LEFT JOIN users u ON g.created_by = u.id
       WHERE g.id = $1`,
      [id]
    );
    return result.rows;
  }

  static async getAll() {
    const result = await db.query(
      `SELECT g.*, u.name as creator_name,
       (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
       FROM groups g
       LEFT JOIN users u ON g.created_by = u.id
       ORDER BY g.created_at DESC`
    );
    return result.rows;
  }

  static async update(id, { name, description }) {
    const result = await db.query(
      `UPDATE groups 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [name, description, id]
    );
    return result.rows;
  }

  static async delete(id) {
    await db.query('DELETE FROM groups WHERE id = $1', [id]);
  }

  static async addMember(group_id, user_id) {
    const result = await db.query(
      `INSERT INTO group_members (group_id, user_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [group_id, user_id]
    );
    return result.rows;
  }

  static async removeMember(group_id, user_id) {
    await db.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
      [group_id, user_id]
    );
  }

  static async getMembers(group_id) {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, gm.joined_at
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1
       ORDER BY gm.joined_at DESC`,
      [group_id]
    );
    return result.rows;
  }
}

module.exports = Group;
