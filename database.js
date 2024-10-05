const mysql = require('mysql2');

// Create a connection pool using environment variables
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql', // Use environment variable or fallback to localhost
    user: process.env.DB_USER || 'root',      // Use environment variable or fallback to root
    password: process.env.DB_PASSWORD || 'viswa2005', // Use environment variable or fallback to 'viswa2005'
    database: process.env.DB_NAME || 'testing' // Use environment variable or fallback to 'testing'
});

// Export the pool for use in other parts of the application
module.exports = pool;
