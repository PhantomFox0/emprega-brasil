const perfilService = require('../services/perfilService');

async function index(req, res, next) {
  try {
    const perfis = await perfilService.listarPerfis();
    return res.status(200).json({ data: perfis });
  } catch (error) {
    return next(error);
  }
}

async function show(req, res, next) {
  try {
    const perfil = await perfilService.buscarPerfilPorId(req.params.id);
    return res.status(200).json({ data: perfil });
  } catch (error) {
    return next(error);
  }
}

async function store(req, res, next) {
  try {
    const payload = {
      ...req.body,
      ...(req.fotoUrl ? { avatar_url: req.fotoUrl } : {}),
    };

    const perfil = await perfilService.criarPerfil(payload);
    return res.status(201).json({
      message: 'Perfil criado com sucesso.',
      data: perfil,
    });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const payload = {
      ...req.body,
      ...(req.fotoUrl ? { avatar_url: req.fotoUrl } : {}),
    };

    const perfil = await perfilService.atualizarPerfil(req.params.id, payload);
    return res.status(200).json({
      message: 'Alterações salvas com sucesso.',
      data: perfil,
    });
  } catch (error) {
    return next(error);
  }
}

async function destroy(req, res, next) {
  try {
    await perfilService.removerPerfil(req.params.id);
    return res.status(200).json({
      message: 'Perfil removido com sucesso.',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
};