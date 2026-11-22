const perfilRepository = require('../repositories/perfilRepository');
const { removerArquivoFotoPorUrl } = require('../middlewares/uploadFoto');

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function listarPerfis() {
  return perfilRepository.findAll();
}

async function buscarPerfilPorId(id) {
  const perfil = await perfilRepository.findById(id);
  if (!perfil) {
    throw createHttpError(404, 'Perfil não encontrado.');
  }
  return perfil;
}

async function criarPerfil(payload) {
  const existente = await perfilRepository.findByEmail(payload.email);
  if (existente) {
    if (payload.avatar_url) {
      removerArquivoFotoPorUrl(payload.avatar_url);
    }
    throw createHttpError(409, 'Já existe um perfil cadastrado com este e-mail.');
  }
  return perfilRepository.create(payload);
}

async function atualizarPerfil(id, payload) {
  const perfilAtual = await buscarPerfilPorId(id);

  if (payload.email) {
    const perfilComEmail = await perfilRepository.findByEmail(payload.email);
    if (perfilComEmail && Number(perfilComEmail.id) !== Number(id)) {
      if (payload.avatar_url) {
        removerArquivoFotoPorUrl(payload.avatar_url);
      }
      throw createHttpError(409, 'Este e-mail já está em uso por outro perfil.');
    }
  }

  const atualizado = await perfilRepository.update(id, payload);

  if (
    payload.avatar_url &&
    perfilAtual.avatar_url &&
    perfilAtual.avatar_url !== payload.avatar_url
  ) {
    removerArquivoFotoPorUrl(perfilAtual.avatar_url);
  }

  return atualizado;
}

async function removerPerfil(id) {
  const perfil = await buscarPerfilPorId(id);
  const removido = await perfilRepository.remove(id);
  if (removido && perfil.avatar_url) {
    removerArquivoFotoPorUrl(perfil.avatar_url);
  }
  return removido;
}

module.exports = {
  listarPerfis,
  buscarPerfilPorId,
  criarPerfil,
  atualizarPerfil,
  removerPerfil,
};