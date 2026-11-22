function parseArrayField(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // segue para split por vírgula
      }
    }
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return null;
}

function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: 'O parâmetro id deve ser um número inteiro positivo.' });
  }
  req.params.id = id;
  return next();
}

function validateCreatePerfil(req, res, next) {
  const { nome, email } = req.body;

  if (!nome || typeof nome !== 'string' || !nome.trim()) {
    return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res
      .status(400)
      .json({ error: 'O campo "email" válido é obrigatório.' });
  }

  const tecnicas = parseArrayField(req.body.competencias_tecnicas);
  if (tecnicas === null) {
    return res
      .status(400)
      .json({ error: 'O campo "competencias_tecnicas" é inválido.' });
  }
  if (tecnicas !== undefined) req.body.competencias_tecnicas = tecnicas;

  const comportamentais = parseArrayField(req.body.competencias_comportamentais);
  if (comportamentais === null) {
    return res
      .status(400)
      .json({ error: 'O campo "competencias_comportamentais" é inválido.' });
  }
  if (comportamentais !== undefined) {
    req.body.competencias_comportamentais = comportamentais;
  }

  return next();
}

function validateUpdatePerfil(req, res, next) {
  const { email } = req.body;

  if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
    return res
      .status(400)
      .json({ error: 'O campo "email" deve ser um e-mail válido.' });
  }

  const tecnicas = parseArrayField(req.body.competencias_tecnicas);
  if (tecnicas === null) {
    return res
      .status(400)
      .json({ error: 'O campo "competencias_tecnicas" é inválido.' });
  }
  if (tecnicas !== undefined) req.body.competencias_tecnicas = tecnicas;

  const comportamentais = parseArrayField(req.body.competencias_comportamentais);
  if (comportamentais === null) {
    return res
      .status(400)
      .json({ error: 'O campo "competencias_comportamentais" é inválido.' });
  }
  if (comportamentais !== undefined) {
    req.body.competencias_comportamentais = comportamentais;
  }

  return next();
}

module.exports = {
  validateIdParam,
  validateCreatePerfil,
  validateUpdatePerfil,
};