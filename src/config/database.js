const mysql = require('mysql2/promise');
require('dotenv').config();

// Create pool with more fault tolerance in production
const createConnectionPool = () => {
  try {
    // Always use SSL with rejectUnauthorized: false for Azure MySQL
    const sslConfig = { rejectUnauthorized: false };
    
    // Only log detailed config in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating database connection pool with config:');
      console.log({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        environment: process.env.NODE_ENV,
        ssl: 'enabled'
      });
    }
    
    return mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: sslConfig,
      // Add better error handling for Azure connections
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000 // 10 seconds
    });
  } catch (error) {
    console.error('Error creating connection pool:', error.message);
    console.error('Error details:', error);
    console.error('Database configuration:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      environment: process.env.NODE_ENV
    });
    
    // Return a dummy pool in case of configuration errors
    return {
      getConnection: async () => {
        throw new Error('Database connection not available - configuration error');
      },
      query: async () => {
        throw new Error('Database connection not available - configuration error');
      },
      execute: async () => {
        throw new Error('Database connection not available - configuration error');
      }
    };
  }
};

const pool = createConnectionPool();

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    
    // Test a simple query
    const [rows] = await connection.query('SELECT 1 as test');
    
    // Only log detailed info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Database connection established successfully');
      console.log(`Host: ${process.env.DB_HOST}, Database: ${process.env.DB_NAME}`);
      console.log('Query test result:', rows);
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    console.error('Error details:', error);
    console.error('Database connection details:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      environment: process.env.NODE_ENV
    });
    
    return false;
  }
}

module.exports = {
  pool,
  testConnection
}; 