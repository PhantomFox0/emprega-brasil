// src/controllers/authController.js
const authService = require("../services/authServices");

function oauthError(res, status, error, description) {
  return res.status(status).json({ error, error_description: description });
}

// POST /api/auth/token — OAuth2 Resource Owner Password Credentials (RFC 6749 §4.3)
async function token(req, res, next) {
  try {
    const { grant_type: grantType, username, password } = req.body;

    if (!grantType) return oauthError(res, 400, "invalid_request", "grant_type é obrigatório.");
    if (grantType !== "password") {
      return oauthError(res, 400, "unsupported_grant_type", "Somente grant_type=password é suportado.");
    }
    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
      return oauthError(res, 400, "invalid_request", "username e password são obrigatórios.");
    }

    const result = await authService.login({
      username,
      password,
      meta: { userAgent: req.get("user-agent"), ipAddress: req.ip },
    });

    res.set({ "Cache-Control": "no-store", Pragma: "no-cache" });
    return res.status(200).json(result);
  } catch (err) {
    if (err.statusCode === 401) {
      return oauthError(res, 400, "invalid_grant", "Usuário ou senha inválidos.");
    }
    return next(err);
  }
}

async function register(req, res, next) {
  try {
    const perfil = await authService.register(req.body);
    return res.status(201).json(perfil);
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout({ jti: req.user.jti, perfilId: req.user.id });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { token, register, logout };
