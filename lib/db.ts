import mysql from 'mysql2/promise'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306'),
  user: process.env.DB_USER || process.env.MYSQL_USER || 'u970747117_test1',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || 's9N>J&|Fz5?',
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'u970747117_test1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
}

// Create connection pool
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Initialize database tables
export async function initDatabase() {
  const connection = await mysql.createConnection(dbConfig)
  
  try {
    // Create factions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS factions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        head_faction_name VARCHAR(255) NOT NULL,
        faction_name VARCHAR(255) NOT NULL,
        faction_story TEXT NOT NULL,
        members TEXT NOT NULL,
        hood_location VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        notes TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_submitted_at (submitted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create faction_files table for storing file paths
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS faction_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faction_id INT NOT NULL,
        file_type ENUM('hood_image', 'clothing_file') NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size BIGINT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE,
        INDEX idx_faction_id (faction_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('Database tables initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    await connection.end()
  }
}

// Test database connection
export async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    await connection.ping()
    await connection.end()
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}
