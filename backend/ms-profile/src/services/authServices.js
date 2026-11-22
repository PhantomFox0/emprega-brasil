
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const perfilRepository = require("../repositories/perfilRepository");
const sessionRepository = require("../repositories/sessionRepository");

const BCRYPT_ROUNDS = 12;

function hashTokenSha256(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseExpiresAt(expiresIn) {
  const now = Date.now();
  if (typeof expiresIn === "number") {
    return new Date(now + expiresIn * 1000);
  }
  const match = String(expiresIn).trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return new Date(now + 60 * 60 * 1000);
  }
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(now + value * multipliers[unit]);
}

function formatMySqlDateTime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

async function register(payload) {
  const { nome, email, usuario, senha, password, ...extraFields } = payload;
  const rawPassword = senha || password;

  const existing = await perfilRepository.findExistingByEmailOrUsuario(email, usuario);
  if (existing) {
    const conflito =
      existing.email.toLowerCase() === email.trim().toLowerCase()
        ? "E-mail já cadastrado."
        : "Usuário já está em uso.";
    const err = new Error(conflito);
    err.statusCode = 409;
    throw err;
  }

  const senhaHash = await bcrypt.hash(rawPassword, BCRYPT_ROUNDS);

  return perfilRepository.createPerfil({
    nome,
    email,
    usuario,
    senhaHash,
    ...extraFields,
  });
}

async function login({ username, usuario, email, password, senha, meta }) {
  const identifier = usuario || email || username;
  const plainPassword = password || senha;

  const perfil = await perfilRepository.findByEmailOrUsuarioWithSenha(identifier);
  if (!perfil || !perfil.senha) {
    const err = new Error("Credenciais inválidas.");
    err.statusCode = 401;
    throw err;
  }

  const isValid = await bcrypt.compare(plainPassword, perfil.senha);
  if (!isValid) {
    const err = new Error("Credenciais inválidas.");
    err.statusCode = 401;
    throw err;
  }

  const jti = crypto.randomUUID();
  const expiresDate = parseExpiresAt(env.jwt.expiresIn);

  const accessToken = jwt.sign(
    { sub: perfil.id, jti, usuario: perfil.usuario },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  await sessionRepository.createSession({
    perfilId: perfil.id,
    jti,
    tokenHash: hashTokenSha256(accessToken),
    userAgent: meta?.userAgent,
    ipAddress: meta?.ipAddress,
    expiresAt: formatMySqlDateTime(expiresDate),
  });

  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: Math.floor((expiresDate.getTime() - Date.now()) / 1000),
    perfil: {
      id: perfil.id,
      nome: perfil.nome,
      email: perfil.email,
      usuario: perfil.usuario,
    },
  };
}

async function logout({ jti, perfilId }) {
  if (!jti || !perfilId) return;
  await sessionRepository.revokeSessionByJti(jti, perfilId);
}

module.exports = {
  register,
  login,
  logout,
  hashTokenSha256,
};