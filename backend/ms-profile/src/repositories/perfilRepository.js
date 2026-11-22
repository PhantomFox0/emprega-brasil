// src/repositories/perfilRepository.js
const pool = require("../config/database");

const SAFE_PERFIL_COLUMNS = `
  id,
  nome,
  email,
  usuario,
  telefone,
  escolaridade,
  carreira,
  area_interesse,
  avatar_url,
  habilidades_texto,
  competencias_tecnicas,
  competencias_comportamentais,
  created_at,
  updated_at
`;

async function findByEmailOrUsuarioWithSenha(identifier) {
  const normalized = String(identifier || "").trim().toLowerCase();
  const sql = `
    SELECT id, nome, email, usuario, senha
    FROM perfis
    WHERE LOWER(email) = ? OR LOWER(usuario) = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [normalized, normalized]);
  return rows[0] || null;
}

async function findExistingByEmailOrUsuario(email, usuario) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedUsuario = String(usuario || "").trim().toLowerCase();
  const sql = `
    SELECT id, email, usuario
    FROM perfis
    WHERE LOWER(email) = ? OR LOWER(usuario) = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [normalizedEmail, normalizedUsuario]);
  return rows[0] || null;
}

async function findByIdSafe(id) {
  const sql = `
    SELECT ${SAFE_PERFIL_COLUMNS}
    FROM perfis
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0] || null;
}

function serializeJsonField(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

async function createPerfil({
  nome,
  email,
  usuario,
  senhaHash,
  telefone,
  escolaridade,
  carreira,
  area_interesse,
  avatar_url,
  habilidades_texto,
  competencias_tecnicas,
  competencias_comportamentais,
}) {
  const sql = `
    INSERT INTO perfis (
      nome,
      email,
      usuario,
      senha,
      telefone,
      escolaridade,
      carreira,
      area_interesse,
      avatar_url,
      habilidades_texto,
      competencias_tecnicas,
      competencias_comportamentais
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    nome.trim(),
    email.trim().toLowerCase(),
    usuario.trim().toLowerCase(),
    senhaHash,
    telefone ?? null,
    escolaridade ?? null,
    carreira ?? null,
    area_interesse ?? null,
    avatar_url ?? null,
    habilidades_texto ?? null,
    serializeJsonField(competencias_tecnicas),
    serializeJsonField(competencias_comportamentais),
  ];

  const [result] = await pool.execute(sql, params);
  return findByIdSafe(result.insertId);
}

async function updatePerfilById(id, fields) {
  const allowed = [
    "nome",
    "email",
    "usuario",
    "telefone",
    "escolaridade",
    "carreira",
    "area_interesse",
    "avatar_url",
    "habilidades_texto",
    "competencias_tecnicas",
    "competencias_comportamentais",
  ];

  const setClauses = [];
  const params = [];

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(fields, key) && fields[key] !== undefined) {
      let val = fields[key];
      if (key === "email" || key === "usuario") {
        val = String(val).trim().toLowerCase();
      } else if (key === "nome" && typeof val === "string") {
        val = val.trim();
      } else if (key === "competencias_tecnicas" || key === "competencias_comportamentais") {
        val = serializeJsonField(val);
      }
      setClauses.push(`${key} = ?`);
      params.push(val);
    }
  }

  if (setClauses.length === 0) {
    return findByIdSafe(id);
  }

  params.push(id);
  const sql = `UPDATE perfis SET ${setClauses.join(", ")} WHERE id = ?`;
  await pool.execute(sql, params);
  return findByIdSafe(id);
}

module.exports = {
  findByEmailOrUsuarioWithSenha,
  findExistingByEmailOrUsuario,
  findByIdSafe,
  createPerfil,
  updatePerfilById,
};