import { useEffect, useId, useState } from 'react';
import { perfilApi } from '../services/perfilApi';
import '../stylesheet/PerfilPage.css';

const ESTADO_INICIAL = {
  nome: '',
  email: '',
  telefone: '',
  escolaridade: '',
  carreira: '',
  area_interesse: '',
  habilidades_texto: '',
};

const TIPOS_IMAGEM_PERMITIDOS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  
];

const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

export default function Cadastro({ onSucesso, onIrParaPerfil }) {
  const fotoInputId = useId();
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState('');
  const [tecnicasTexto, setTecnicasTexto] = useState(
    'Excel, Java, Python, Análise de Dados'
  );
  const [comportamentaisTexto, setComportamentaisTexto] = useState(
    'Trabalho em Equipe, Proatividade, Pensamento Crítico'
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Gera e limpa a URL temporária de pré-visualização da foto selecionada
  useEffect(() => {
    if (!(fotoFile instanceof File)) {
      setFotoPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(fotoFile);
    setFotoPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [fotoFile]);

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

  function handleRemoverFoto() {
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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = {
      ...form,
      competencias_tecnicas: parseLista(tecnicasTexto),
      competencias_comportamentais: parseLista(comportamentaisTexto),
      ...(fotoFile instanceof File ? { foto: fotoFile } : {}),
    };

    try {
      const resultado = await perfilApi.criar(payload);
      const criado = resultado.data;

      setFeedback({
        tipo: 'sucesso',
        mensagem: resultado.message || 'Perfil cadastrado com sucesso!',
      });

      setForm(ESTADO_INICIAL);
      handleRemoverFoto();

      if (typeof onSucesso === 'function') {
        onSucesso(criado);
      }
    } catch (error) {
      setFeedback({
        tipo: 'erro',
        mensagem:
          error.response?.data?.error || 'Não foi possível concluir o cadastro.',
      });
    } finally {
      setSaving(false);
    }
  }

  const tecnicasLista = parseLista(tecnicasTexto);
  const comportamentaisLista = parseLista(comportamentaisTexto);

  return (
    <div className="perfil-container">
      <div className="perfil-topbar">
        <div>
          <h1 className="perfil-titulo">Cadastro</h1>
          <p className="perfil-subtitulo">
            Preencha seus dados profissionais, foto, área de interesse e habilidades.
          </p>
        </div>

        {typeof onIrParaPerfil === 'function' && (
          <button
            type="button"
            className="btn-secundario"
            onClick={onIrParaPerfil}
          >
            Visualizar perfil
          </button>
        )}
      </div>

      <form className="perfil-layout" onSubmit={handleSubmit}>
        <div className="perfil-form-column">
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

          <div className="perfil-campos">
            <input
              type="text"
              name="nome"
              className="perfil-input"
              placeholder="Nome do usuário"
              value={form.nome}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              className="perfil-input"
              placeholder="Email do usuário"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="telefone"
              className="perfil-input"
              placeholder="Telefone do usuário"
              value={form.telefone}
              onChange={handleChange}
            />

            <input
              type="text"
              name="escolaridade"
              className="perfil-input"
              placeholder="Escolaridade do usuário"
              value={form.escolaridade}
              onChange={handleChange}
            />

            <input
              type="text"
              name="carreira"
              className="perfil-input"
              placeholder="Carreira do usuário"
              value={form.carreira}
              onChange={handleChange}
            />

            <input
              type="text"
              name="area_interesse"
              className="perfil-input"
              placeholder="Área de Interesse do usuário"
              value={form.area_interesse}
              onChange={handleChange}
            />
          </div>

          <h2 className="habilidades-titulo">Habilidades</h2>
          <p className="habilidades-descricao">
            Área para o usuário inserir informações que esclareçam, em formato de
            texto, suas habilidades.
          </p>

          <div className="perfil-campos">
            <textarea
              name="habilidades_texto"
              className="perfil-textarea"
              placeholder="Descreva suas principais experiências e habilidades..."
              value={form.habilidades_texto}
              onChange={handleChange}
            />

            <label className="perfil-label">
              Competências Técnicas (separadas por vírgula)
              <input
                type="text"
                className="perfil-input"
                placeholder="Ex.: Excel, Java, Python, Análise de Dados"
                value={tecnicasTexto}
                onChange={(e) => setTecnicasTexto(e.target.value)}
              />
            </label>

            <label className="perfil-label">
              Competências Comportamentais (separadas por vírgula)
              <input
                type="text"
                className="perfil-input"
                placeholder="Ex.: Trabalho em Equipe, Proatividade, Pensamento Crítico"
                value={comportamentaisTexto}
                onChange={(e) => setComportamentaisTexto(e.target.value)}
              />
            </label>
          </div>

          <div className="competencias-grid">
            <div>
              <h3 className="competencias-coluna-titulo">Competências Técnicas</h3>
              <div className="competencias-lista">
                {tecnicasLista.length > 0 ? (
                  tecnicasLista.map((item) => (
                    <span key={item} className="competencia-item">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="competencia-item competencia-item--vazio">
                    Nenhuma informada
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="competencias-coluna-titulo">
                Competências Comportamentais
              </h3>
              <div className="competencias-lista">
                {comportamentaisLista.length > 0 ? (
                  comportamentaisLista.map((item) => (
                    <span key={item} className="competencia-item">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="competencia-item competencia-item--vazio">
                    Nenhuma informada
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="perfil-acoes">
            <button type="submit" className="btn-salvar" disabled={saving}>
              {saving ? 'Cadastrando...' : 'Concluir Cadastro'}
            </button>
          </div>
        </div>

        <div className="perfil-media-column">
          <div className="foto-curricular-card">
            <div className="foto-curricular-frame">
              {fotoPreviewUrl ? (
                <img
                  src={fotoPreviewUrl}
                  alt={`Prévia de ${form.nome || 'usuário'}`}
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
                  onClick={handleRemoverFoto}
                >
                  Remover foto selecionada
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
                JPG, PNG, até 5 MB (padrão curricular / LinkedIn).
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}