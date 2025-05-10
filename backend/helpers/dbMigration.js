const mysql = require('mysql2/promise');
require('dotenv').config();

const runMigration = async () => {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    });
    
    console.log('Connected to MySQL. Running migrations...');
    
    // Check if reset_token and reset_token_expiry columns exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('reset_token', 'reset_token_expiry')
    `, [process.env.MYSQL_DATABASE]);
    
    // Add reset_token column if it doesn't exist
    if (!columns.some(col => col.COLUMN_NAME === 'reset_token')) {
      console.log('Adding reset_token column to users table');
      await connection.execute(`
        ALTER TABLE users
        ADD COLUMN reset_token VARCHAR(255) NULL
      `);
      console.log('reset_token column added successfully');
    } else {
      console.log('reset_token column already exists');
    }
    
    // Add reset_token_expiry column if it doesn't exist
    if (!columns.some(col => col.COLUMN_NAME === 'reset_token_expiry')) {
      console.log('Adding reset_token_expiry column to users table');
      await connection.execute(`
        ALTER TABLE users
        ADD COLUMN reset_token_expiry DATETIME NULL
      `);
      console.log('reset_token_expiry column added successfully');
    } else {
      console.log('reset_token_expiry column already exists');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
};

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration().then(() => process.exit(0));
}

module.exports = { runMigration };
