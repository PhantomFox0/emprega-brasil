import { useEffect, useId, useState } from 'react';
import { perfilApi } from '../services/perfilApi';
import '../stylesheet/PerfilPage.css';

const ESTADO_VAZIO = {
  nome: '',
  email: '',
  telefone: '',
  escolaridade: '',
  carreira: '',
  area_interesse: '',
  avatar_url: '',
  habilidades_texto: '',
  competencias_tecnicas: [],
  competencias_comportamentais: [],
};

const TIPOS_IMAGEM_PERMITIDOS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

// Garante que caminhos relativos vindos do backend (ex.: /fotos/arquivo.jpg) sejam resolvidos corretamente
function resolverUrlFoto(avatarUrl, baseApiUrl) {
  if (!avatarUrl || typeof avatarUrl !== 'string') return '';
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('blob:')) {
    return avatarUrl;
  }
  const backendOrigin = (baseApiUrl || 'http://localhost:3000/api').replace(/\/api\/?$/, '');
  const caminhoNormalizado = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
  return `${backendOrigin}${caminhoNormalizado}`;
}

export default function Perfil({ perfilId = 1, onIrParaCadastro }) {
  const fotoInputId = useId();
  const [modoEdicao, setModoEdicao] = useState(false);
  const [perfilAtual, setPerfilAtual] = useState(ESTADO_VAZIO);
  const [form, setForm] = useState(ESTADO_VAZIO);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState('');
  const [tecnicasTexto, setTecnicasTexto] = useState('');
  const [comportamentaisTexto, setComportamentaisTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  function sincronizarEstados(perfil) {
    const urlResolvida = resolverUrlFoto(perfil?.avatar_url, apiBaseUrl);

    const normalizado = {
      nome: perfil?.nome || '',
      email: perfil?.email || '',
      telefone: perfil?.telefone || '',
      escolaridade: perfil?.escolaridade || '',
      carreira: perfil?.carreira || '',
      area_interesse: perfil?.area_interesse || '',
      avatar_url: urlResolvida,
      habilidades_texto: perfil?.habilidades_texto || '',
      competencias_tecnicas: perfil?.competencias_tecnicas || [],
      competencias_comportamentais: perfil?.competencias_comportamentais || [],
    };

    setPerfilAtual(normalizado);
    setForm(normalizado);
    setFotoFile(null);
    setTecnicasTexto(normalizado.competencias_tecnicas.join(', '));
    setComportamentaisTexto(normalizado.competencias_comportamentais.join(', '));
  }

  // Atualiza a prévia quando o usuário seleciona um novo arquivo ou volta para a foto atual do backend
  useEffect(() => {
    if (fotoFile instanceof File) {
      const objectUrl = URL.createObjectURL(fotoFile);
      setFotoPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setFotoPreviewUrl(form.avatar_url || '');
    return undefined;
  }, [fotoFile, form.avatar_url]);

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      setLoading(true);
      setFeedback(null);

      try {
        const perfil = await perfilApi.buscarPorId(perfilId);
        if (!ativo) return;
        sincronizarEstados(perfil);
      } catch (error) {
        if (!ativo) return;
        setFeedback({
          tipo: 'erro',
          mensagem:
            error.response?.data?.error ||
            'Perfil não encontrado ou erro ao carregar dados.',
        });
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarPerfil();
    return () => {
      ativo = false;
    };
  }, [perfilId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!TIPOS_IMAGEM_PERMITIDOS.includes(file.type)) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Selecione uma imagem válida (JPG, PNG, WEBP ou GIF).',
      });
      e.target.value = '';
      return;
    }

    if (file.size > TAMANHO_MAXIMO_BYTES) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'A foto de perfil deve ter no máximo 5 MB.',
      });
      e.target.value = '';
      return;
    }

    setFeedback(null);
    setFotoFile(file);
  }

  function handleDescartarFoto() {
    const inputEl = document.getElementById(fotoInputId);
    if (inputEl) inputEl.value = '';
    setFotoFile(null);
  }

  function parseLista(texto) {
    return texto
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function ativarVisualizacao() {
    setForm(perfilAtual);
    handleDescartarFoto();
    setTecnicasTexto(perfilAtual.competencias_tecnicas.join(', '));
    setComportamentaisTexto(perfilAtual.competencias_comportamentais.join(', '));
    setFeedback(null);
    setModoEdicao(false);
  }

  function ativarEdicao() {
    setFeedback(null);
    handleDescartarFoto();
    setModoEdicao(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = {
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      escolaridade: form.escolaridade,
      carreira: form.carreira,
      area_interesse: form.area_interesse,
      habilidades_texto: form.habilidades_texto,
      competencias_tecnicas: parseLista(tecnicasTexto),
      competencias_comportamentais: parseLista(comportamentaisTexto),
      ...(fotoFile instanceof File ? { foto: fotoFile } : {}),
    };

    try {
      const resultado = await perfilApi.atualizar(perfilId, payload);
      const salvo = resultado.data || {
        ...payload,
        avatar_url: perfilAtual.avatar_url,
      };
      sincronizarEstados(salvo);
      setModoEdicao(false);
      setFeedback({
        tipo: 'sucesso',
        mensagem: resultado.message || 'Alterações salvas com sucesso.',
      });
    } catch (error) {
      setFeedback({
        tipo: 'erro',
        mensagem:
          error.response?.data?.error || 'Não foi possível salvar as alterações.',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="perfil-container">
        <p className="perfil-subtitulo">Carregando perfil...</p>
      </div>
    );
  }

  const dadosExibicao = modoEdicao
    ? {
        ...form,
        competencias_tecnicas: parseLista(tecnicasTexto),
        competencias_comportamentais: parseLista(comportamentaisTexto),
      }
    : perfilAtual;

  return (
    <div className="perfil-container">
      <div className="perfil-topbar">
        <div>
          <h1 className="perfil-titulo">Perfil</h1>
          <p className="perfil-subtitulo">
            {modoEdicao
              ? 'Modo de edição: atualize os campos ou a foto e clique em Salvar Alterações.'
              : 'Visualização completa do perfil e habilidades do usuário.'}
          </p>
        </div>

        <div className="perfil-acoes-topo">
          <button
            type="button"
            className={`btn-modo ${!modoEdicao ? 'btn-modo--ativo' : ''}`}
            onClick={ativarVisualizacao}
          >
            Visualizar perfil
          </button>

          <button
            type="button"
            className={`btn-modo ${modoEdicao ? 'btn-modo--ativo' : ''}`}
            onClick={ativarEdicao}
          >
            Editar perfil
          </button>

          {typeof onIrParaCadastro === 'function' && (
            <button
              type="button"
              className="btn-secundario"
              onClick={onIrParaCadastro}
            >
              Novo cadastro
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <p
          role="alert"
          className={`perfil-feedback ${
            feedback.tipo === 'sucesso'
              ? 'perfil-feedback--sucesso'
              : 'perfil-feedback--erro'
          }`}
        >
          {feedback.mensagem}
        </p>
      )}

      <div className="perfil-layout">
        <div className="perfil-form-column">
          {!modoEdicao ? (
            <>
              <div className="perfil-detalhes-grid">
                <div className="perfil-dado-card">
                  <span className="perfil-dado-label">Nome do usuário</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.nome || 'Não informado'}
                  </strong>
                </div>

                <div className="perfil-dado-card">
                  <span className="perfil-dado-label">Email do usuário</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.email || 'Não informado'}
                  </strong>
                </div>

                <div className="perfil-dado-card">
                  <span className="perfil-dado-label">Telefone do usuário</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.telefone || 'Não informado'}
                  </strong>
                </div>

                <div className="perfil-dado-card">
                  <span className="perfil-dado-label">Escolaridade do usuário</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.escolaridade || 'Não informado'}
                  </strong>
                </div>

                <div className="perfil-dado-card">
                  <span className="perfil-dado-label">Carreira do usuário</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.carreira || 'Não informado'}
                  </strong>
                </div>

                <div className="perfil-dado-card">
                  <span className="perfil-dado-label">Área de Interesse</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.area_interesse || 'Não informado'}
                  </strong>
                </div>
              </div>

              <h2 className="habilidades-titulo">Habilidades</h2>
              <p className="habilidades-texto-exibicao">
                {perfilAtual.habilidades_texto ||
                  'Nenhuma descrição de habilidades cadastrada até o momento.'}
              </p>

              <div className="competencias-grid">
                <div>
                  <h3 className="competencias-coluna-titulo">
                    Competências Técnicas
                  </h3>
                  <div className="competencias-lista">
                    {perfilAtual.competencias_tecnicas.length > 0 ? (
                      perfilAtual.competencias_tecnicas.map((item) => (
                        <span key={item} className="competencia-item">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="competencia-item competencia-item--vazio">
                        Nenhuma competência técnica
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="competencias-coluna-titulo">
                    Competências Comportamentais
                  </h3>
                  <div className="competencias-lista">
                    {perfilAtual.competencias_comportamentais.length > 0 ? (
                      perfilAtual.competencias_comportamentais.map((item) => (
                        <span key={item} className="competencia-item">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="competencia-item competencia-item--vazio">
                        Nenhuma competência comportamental
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="perfil-campos">
                <label className="perfil-label">
                  Nome do usuário
                  <input
                    type="text"
                    name="nome"
                    className="perfil-input"
                    placeholder="Nome do usuário"
                    value={form.nome}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="perfil-label">
                  Email do usuário
                  <input
                    type="email"
                    name="email"
                    className="perfil-input"
                    placeholder="Email do usuário"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="perfil-label">
                  Telefone do usuário
                  <input
                    type="text"
                    name="telefone"
                    className="perfil-input"
                    placeholder="Telefone do usuário"
                    value={form.telefone}
                    onChange={handleChange}
                  />
                </label>

                <label className="perfil-label">
                  Escolaridade do usuário
                  <input
                    type="text"
                    name="escolaridade"
                    className="perfil-input"
                    placeholder="Escolaridade do usuário"
                    value={form.escolaridade}
                    onChange={handleChange}
                  />
                </label>

                <label className="perfil-label">
                  Carreira do usuário
                  <input
                    type="text"
                    name="carreira"
                    className="perfil-input"
                    placeholder="Carreira do usuário"
                    value={form.carreira}
                    onChange={handleChange}
                  />
                </label>

                <label className="perfil-label">
                  Área de Interesse do usuário
                  <input
                    type="text"
                    name="area_interesse"
                    className="perfil-input"
                    placeholder="Área de Interesse do usuário"
                    value={form.area_interesse}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <h2 className="habilidades-titulo">Habilidades</h2>
              <p className="habilidades-descricao">
                Área para o usuário inserir informações que esclareçam, em
                formato de texto, suas habilidades.
              </p>

              <div className="perfil-campos">
                <textarea
                  name="habilidades_texto"
                  className="perfil-textarea"
                  placeholder="Área para o usuário inserir informações que esclareçam, em formato de texto, suas habilidades."
                  value={form.habilidades_texto}
                  onChange={handleChange}
                />

                <label className="perfil-label">
                  Competências Técnicas (separadas por vírgula)
                  <input
                    type="text"
                    className="perfil-input"
                    placeholder="Excel, Java, Python, Análise de Dados"
                    value={tecnicasTexto}
                    onChange={(e) => setTecnicasTexto(e.target.value)}
                  />
                </label>

                <label className="perfil-label">
                  Competências Comportamentais (separadas por vírgula)
                  <input
                    type="text"
                    className="perfil-input"
                    placeholder="Trabalho em Equipe, Proatividade, Pensamento Crítico"
                    value={comportamentaisTexto}
                    onChange={(e) => setComportamentaisTexto(e.target.value)}
                  />
                </label>
              </div>

              <div className="competencias-grid">
                <div>
                  <h3 className="competencias-coluna-titulo">
                    Competências Técnicas
                  </h3>
                  <div className="competencias-lista">
                    {dadosExibicao.competencias_tecnicas.map((item) => (
                      <span key={item} className="competencia-item">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="competencias-coluna-titulo">
                    Competências Comportamentais
                  </h3>
                  <div className="competencias-lista">
                    {dadosExibicao.competencias_comportamentais.map((item) => (
                      <span key={item} className="competencia-item">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="perfil-acoes">
                <button
                  type="submit"
                  className="btn-salvar"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="perfil-media-column">
          {!modoEdicao ? (
            perfilAtual.avatar_url ? (
              <img
                src={perfilAtual.avatar_url}
                alt={`Foto de ${perfilAtual.nome || 'usuário'}`}
                className="perfil-avatar-img"
              />
            ) : (
              <div className="perfil-avatar-placeholder">
                <span>Sem foto de perfil</span>
              </div>
            )
          ) : (
            <div className="foto-curricular-card">
              <div className="foto-curricular-frame">
                {fotoPreviewUrl ? (
                  <img
                    src={fotoPreviewUrl}
                    alt={`Prévia da foto de ${form.nome || 'usuário'}`}
                    className="perfil-avatar-img"
                  />
                ) : (
                  <div className="perfil-avatar-placeholder">
                    <span>Adicione sua foto profissional</span>
                  </div>
                )}
              </div>

              <div className="foto-curricular-acoes">
                <label htmlFor={fotoInputId} className="btn-upload-foto">
                  {fotoPreviewUrl ? 'Alterar foto' : 'Adicionar foto'}
                </label>

                {fotoFile instanceof File && (
                  <button
                    type="button"
                    className="btn-remover-selecao"
                    onClick={handleDescartarFoto}
                  >
                    Descartar nova foto
                  </button>
                )}

                <input
                  id={fotoInputId}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFotoChange}
                  className="foto-input-oculto"
                />

                <span className="foto-curricular-ajuda">
                  JPG, PNG, WEBP ou GIF até 5 MB (padrão curricular / LinkedIn).
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}