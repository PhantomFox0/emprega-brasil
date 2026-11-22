// src/middlewares/authenticateJwt.js
// Valida o JWT Bearer (RFC 6750) e confere a sessão no banco (permite revogação via logout).
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const sessionRepository = require("../repositories/sessionRepository");

function sha256(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function unauthorized(res, error, description) {
  const params = error
    ? `Bearer realm="perfil-api", error="${error}", error_description="${description}"`
    : 'Bearer realm="perfil-api"';
  res.set("WWW-Authenticate", params);
  return res.status(401).json({ error: description || "Token de acesso ausente." });
}

async function authenticateJwt(req, res, next) {
  try {
    const header = req.get("Authorization") || "";
    const [scheme, token] = header.split(" ");

    if (!token || String(scheme).toLowerCase() !== "bearer") {
      return unauthorized(res);
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwt.secret, { algorithms: ["HS256"] });
    } catch (err) {
      const msg = err.name === "TokenExpiredError" ? "Token expirado." : "Token inválido.";
      return unauthorized(res, "invalid_token", msg);
    }

    const perfilId = Number(payload.sub);
    if (!payload.jti || !Number.isInteger(perfilId) || perfilId <= 0) {
      return unauthorized(res, "invalid_token", "Token inválido.");
    }

    const session = await sessionRepository.findActiveByJti(payload.jti);
    if (
      !session ||
      Number(session.perfil_id) !== perfilId ||
      session.token_hash !== sha256(token)
    ) {
      return unauthorized(res, "invalid_token", "Sessão inválida, expirada ou revogada.");
    }

    req.user = { id: perfilId, jti: payload.jti, usuario: payload.usuario };
    req.token = token;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = authenticateJwt;
