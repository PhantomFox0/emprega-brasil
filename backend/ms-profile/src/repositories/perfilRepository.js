const { pool } = require('../config/database');

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function formatPerfil(row) {
  if (!row) return null;
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    escolaridade: row.escolaridade,
    carreira: row.carreira,
    area_interesse: row.area_interesse,
    avatar_url: row.avatar_url,
    habilidades_texto: row.habilidades_texto,
    competencias_tecnicas: parseJsonArray(row.competencias_tecnicas),
    competencias_comportamentais: parseJsonArray(row.competencias_comportamentais),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM perfis ORDER BY id DESC');
  return rows.map(formatPerfil);
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM perfis WHERE id = ?', [id]);
  return formatPerfil(rows[0]);
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM perfis WHERE email = ?', [email]);
  return formatPerfil(rows[0]);
}

async function create(data) {
  const query = `
    INSERT INTO perfis (
      nome,
      email,
      telefone,
      escolaridade,
      carreira,
      area_interesse,
      avatar_url,
      habilidades_texto,
      competencias_tecnicas,
      competencias_comportamentais
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    data.nome,
    data.email,
    data.telefone ?? null,
    data.escolaridade ?? null,
    data.carreira ?? null,
    data.area_interesse ?? null,
    data.avatar_url ?? null,
    data.habilidades_texto ?? null,
    JSON.stringify(data.competencias_tecnicas ?? []),
    JSON.stringify(data.competencias_comportamentais ?? []),
  ];

  const [result] = await pool.execute(query, params);
  return findById(result.insertId);
}

async function update(id, data) {
  const fields = [];
  const params = [];

  const scalarFields = [
    'nome',
    'email',
    'telefone',
    'escolaridade',
    'carreira',
    'area_interesse',
    'avatar_url',
    'habilidades_texto',
  ];

  for (const field of scalarFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      fields.push(`${field} = ?`);
      params.push(data[field]);
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, 'competencias_tecnicas')) {
    fields.push('competencias_tecnicas = ?');
    params.push(JSON.stringify(data.competencias_tecnicas ?? []));
  }

  if (Object.prototype.hasOwnProperty.call(data, 'competencias_comportamentais')) {
    fields.push('competencias_comportamentais = ?');
    params.push(JSON.stringify(data.competencias_comportamentais ?? []));
  }

  if (fields.length === 0) {
    return findById(id);
  }

  params.push(id);
  await pool.execute(`UPDATE perfis SET ${fields.join(', ')} WHERE id = ?`, params);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM perfis WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  remove,
};