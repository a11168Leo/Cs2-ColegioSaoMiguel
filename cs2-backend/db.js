// ─── db.js ───────────────────────────────────────────────────
//  Ligação partilhada ao MySQL usando mysql2/promise pool
// ─────────────────────────────────────────────────────────────
'use strict';
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'cs2csm',
  waitForConnections: true,
  connectionLimit:    10,
  charset:            'utf8mb4'
});

module.exports = pool;
