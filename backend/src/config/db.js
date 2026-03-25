const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render PostgreSQL requires SSL in production
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  max: 10,                    // max connections in pool
  idleTimeoutMillis: 30000,   // close idle connections after 30s
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[db] unexpected pool error:', err);
  process.exit(-1);
});

module.exports = pool;
