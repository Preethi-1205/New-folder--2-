const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Giri1205@',
  database: 'student_portal'
});

async function updateDemoUsers() {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    // Update admin user
    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [adminPassword, 'admin@example.com']
    );

    // Update student user
    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [studentPassword, 'student@example.com']
    );

    // Verify users exist
    const result = await pool.query('SELECT email, role FROM users');
    console.log('Updated users:', result.rows);
    
    console.log('Demo users updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating demo users:', error);
    process.exit(1);
  }
}

updateDemoUsers();