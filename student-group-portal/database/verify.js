const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Giri1205@',
  database: 'student_portal'
});

async function verifyDatabase() {
  try {
    // Check if users table exists and has data
    const result = await pool.query('SELECT * FROM users');
    console.log('Database connection successful!');
    console.log(`Found ${result.rows.length} users in the database.`);
    process.exit(0);
  } catch (error) {
    console.error('Error verifying database:', error);
    process.exit(1);
  }
}

verifyDatabase();