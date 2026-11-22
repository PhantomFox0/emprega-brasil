// src/repositories/sessionRepository.js
const { pool } = require("../config/database");

async function createSession({ perfilId, jti, tokenHash, userAgent, ipAddress, expiresAt }) {
  const sql = `
    INSERT INTO Sessions (perfil_id, jti, token_hash, user_agent, ip_address, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await pool.execute(sql, [
    perfilId,
    jti,
    tokenHash,
    userAgent ? String(userAgent).slice(0, 255) : null,
    ipAddress ? String(ipAddress).slice(0, 45) : null,
    expiresAt,
  ]);
}

async function findActiveByJti(jti) {
  const sql = `
    SELECT id, perfil_id, jti, token_hash, revoked, expires_at
    FROM Sessions
    WHERE jti = ? AND revoked = 0 AND expires_at > UTC_TIMESTAMP()
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [jti]);
  return rows[0] || null;
}

async function revokeSessionByJti(jti, perfilId) {
  const sql = `UPDATE Sessions SET revoked = 1 WHERE jti = ? AND perfil_id = ?`;
  const [result] = await pool.execute(sql, [jti, perfilId]);
  return result.affectedRows > 0;
}

module.exports = { createSession, findActiveByJti, revokeSessionByJti };
