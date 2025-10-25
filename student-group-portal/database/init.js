const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Giri1205@',
  database: 'postgres' // Connect to default database first
});

async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    await pool.query(`
      DROP DATABASE IF EXISTS student_portal;
    `);
    
    await pool.query(`
      CREATE DATABASE student_portal;
    `);

    // Close connection to default database
    await pool.end();

    // Connect to student_portal database
    const studentPortalPool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'Giri1205@',
      database: 'student_portal'
    });

    // Read and execute init.sql
    const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await studentPortalPool.query(initSql);

    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();