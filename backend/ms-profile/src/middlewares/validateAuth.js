// src/middlewares/validateAuth.js
function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function validateRegister(req, res, next) {
  const { nome, email, usuario } = req.body;
  const senha = req.body.senha || req.body.password;

  if (!isNonEmptyString(nome)) return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
  if (!isNonEmptyString(email) || !email.includes("@")) {
    return res.status(400).json({ error: 'O campo "email" válido é obrigatório.' });
  }
  if (!isNonEmptyString(usuario)) return res.status(400).json({ error: 'O campo "usuario" é obrigatório.' });
  if (typeof senha !== "string" || senha.length < 8 || senha.length > 72) {
    return res.status(400).json({ error: "A senha deve ter entre 8 e 72 caracteres." });
  }
  return next();
}

module.exports = { validateRegister };
