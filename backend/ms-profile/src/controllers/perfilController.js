// src/controllers/perfilController.js
const perfilRepository = require("../repositories/perfilRepository");

async function getMeuPerfil(req, res, next) {
  try {
    const perfil = await perfilRepository.findByIdSafe(req.user.id);
    if (!perfil) {
      return res.status(404).json({ error: "Perfil não encontrado." });
    }
    return res.status(200).json(perfil);
  } catch (err) {
    return next(err);
  }
}

async function getPerfilById(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return res.status(400).json({ error: "ID de perfil inválido." });
    }
    if (targetId !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado a este perfil." });
    }

    const perfil = await perfilRepository.findByIdSafe(targetId);
    if (!perfil) {
      return res.status(404).json({ error: "Perfil não encontrado." });
    }
    return res.status(200).json(perfil);
  } catch (err) {
    return next(err);
  }
}

async function updateMeuPerfil(req, res, next) {
  try {
    // Impede alteração de id ou senha por essa rota de perfil
    const { id, senha, senhaHash, ...safeBody } = req.body;
    const atualizado = await perfilRepository.updatePerfilById(req.user.id, safeBody);
    return res.status(200).json(atualizado);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getMeuPerfil,
  getPerfilById,
  updateMeuPerfil,
};