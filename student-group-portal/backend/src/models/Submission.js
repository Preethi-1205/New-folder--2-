const db = require('../config/database');

class Submission {
  static async create({ assignment_id, user_id, content, file_url }) {
    const result = await db.query(
      `INSERT INTO submissions (assignment_id, user_id, content, file_url, status) 
       VALUES ($1, $2, $3, $4, 'submitted') 
       RETURNING *`,
      [assignment_id, user_id, content, file_url]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT s.*, a.title as assignment_title, u.name as student_name, u.email as student_email
       FROM submissions s
       LEFT JOIN assignments a ON s.assignment_id = a.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [id]
    );
    return result.rows;
  }

  static async getAll(userId = null, role = null) {
    let query = `
      SELECT s.*, a.title as assignment_title, a.total_marks, u.name as student_name
      FROM submissions s
      LEFT JOIN assignments a ON s.assignment_id = a.id
      LEFT JOIN users u ON s.user_id = u.id
    `;

    if (role === 'student' && userId) {
      query += ' WHERE s.user_id = $1';
      const result = await db.query(query + ' ORDER BY s.submitted_at DESC', [userId]);
      return result.rows;
    }

    const result = await db.query(query + ' ORDER BY s.submitted_at DESC');
    return result.rows;
  }

  static async update(id, { content, file_url }) {
    const result = await db.query(
      `UPDATE submissions 
       SET content = COALESCE($1, content),
           file_url = COALESCE($2, file_url),
           submitted_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [content, file_url, id]
    );
    return result.rows;
  }

  static async grade(id, { marks_obtained, feedback }) {
    const result = await db.query(
      `UPDATE submissions 
       SET marks_obtained = $1,
           feedback = $2,
           status = 'graded',
           graded_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [marks_obtained, feedback, id]
    );
    return result.rows;
  }

  static async delete(id) {
    await db.query('DELETE FROM submissions WHERE id = $1', [id]);
  }

  static async getByAssignmentAndUser(assignment_id, user_id) {
    const result = await db.query(
      'SELECT * FROM submissions WHERE assignment_id = $1 AND user_id = $2',
      [assignment_id, user_id]
    );
    return result.rows;
  }
}

module.exports = Submission;
