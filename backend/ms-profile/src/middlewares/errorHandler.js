const env = require("../config/env");
function notFoundHandler(req, res) { res.status(404).json({ error: "Rota não encontrada: " + req.method + " " + req.originalUrl }); }
function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = status === 500 && env.nodeEnv === "production" ? "Erro interno no servidor." : (err.message || "Erro interno no servidor.");
  if (status >= 500) console.error("[ERROR]", err);
  res.status(status).json({ error: message });
}
module.exports = { notFoundHandler, errorHandler };
