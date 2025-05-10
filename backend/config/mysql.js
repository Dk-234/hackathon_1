const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

const connectMySQL = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL Connected!');
    
    // Create users table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if reset_token column exists, if not, add it
    try {
      // Attempt to check if columns exist using information_schema
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('reset_token', 'reset_token_expiry')
      `, [process.env.MYSQL_DATABASE]);
      
      // If reset_token column doesn't exist, add it
      if (!columns.some(col => col.COLUMN_NAME === 'reset_token')) {
        console.log('Adding reset_token column to users table');
        await connection.execute(`
          ALTER TABLE users
          ADD COLUMN reset_token VARCHAR(255) NULL
        `);
      }
      
      // If reset_token_expiry column doesn't exist, add it
      if (!columns.some(col => col.COLUMN_NAME === 'reset_token_expiry')) {
        console.log('Adding reset_token_expiry column to users table');
        await connection.execute(`
          ALTER TABLE users
          ADD COLUMN reset_token_expiry DATETIME NULL
        `);
      }
    } catch (error) {
      console.error('Error checking or adding columns:', error);
    }
    
    connection.release();
    return pool;
  } catch (error) {
    console.error(`MySQL Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { pool, connectMySQL };
