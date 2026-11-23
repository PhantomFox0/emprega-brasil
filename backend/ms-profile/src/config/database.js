const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const env = require("./env");

function buildSsl() {
  if (!env.db.ssl) return undefined;
  const caPath = path.resolve(__dirname, "../..", env.db.sslCaPath);
  return { ca: fs.readFileSync(caPath), rejectUnauthorized: true };
}

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  ssl: buildSsl(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
async function testConnection() {
  const conn = await pool.getConnection();
  try { await conn.ping(); } finally { conn.release(); }
}
module.exports = { pool, testConnection };
