const { Pool } = require('pg');

const pool = new Pool({
  user: 'adminpoderoso',
  host: 'sisa-db.cecw5lrqczvv.us-east-1.rds.amazonaws.com',
  database: 'sisa',
  password: '6L!v#JpMxKtN0sW',
  port: 5432,
  ssl: false,
});

module.exports = pool;
