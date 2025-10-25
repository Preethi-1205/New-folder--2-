const db = require('../config/database');

class Assignment {
  static async create({ title, description, due_date, total_marks, group_id, created_by }) {
    const result = await db.query(
      `INSERT INTO assignments (title, description, due_date, total_marks, group_id, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [title, description, due_date, total_marks, group_id, created_by]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT a.*, g.name as group_name, u.name as creator_name
       FROM assignments a
       LEFT JOIN groups g ON a.group_id = g.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows;
  }

  static async getAll(userId = null, role = null) {
    let query = `
      SELECT a.*, g.name as group_name, u.name as creator_name,
      (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as submission_count
      FROM assignments a
      LEFT JOIN groups g ON a.group_id = g.id
      LEFT JOIN users u ON a.created_by = u.id
    `;

    if (role === 'student' && userId) {
      query += ` WHERE a.group_id IN (
        SELECT group_id FROM group_members WHERE user_id = $1
      )`;
      const result = await db.query(query + ' ORDER BY a.due_date DESC', [userId]);
      return result.rows;
    }

    const result = await db.query(query + ' ORDER BY a.due_date DESC');
    return result.rows;
  }

  static async update(id, { title, description, due_date, total_marks }) {
    const result = await db.query(
      `UPDATE assignments 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date),
           total_marks = COALESCE($4, total_marks),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [title, description, due_date, total_marks, id]
    );
    return result.rows;
  }

  static async delete(id) {
    await db.query('DELETE FROM assignments WHERE id = $1', [id]);
  }
}

module.exports = Assignment;
