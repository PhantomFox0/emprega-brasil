import { useEffect, useId, useState } from "react";
import "../stylesheet/Perfil.css";

const CHAVE_PERFIL_LOCAL = "emprega_brasil_perfil_v1";

const ESTADO_VAZIO = {
  nome: "",
  email: "",
  telefone: "",
  escolaridade: "",
  carreira: "",
  area_interesse: "",
  avatar_url: "",
  habilidades_texto: "",
  competencias_tecnicas: [],
  competencias_comportamentais: [],
};

const TIPOS_IMAGEM_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png"];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

function lerArquivoComoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}

function parseLista(texto) {
  return texto
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function carregarPerfilSalvo() {
  try {
    const bruto = localStorage.getItem(CHAVE_PERFIL_LOCAL);
    if (!bruto) return ESTADO_VAZIO;
    const parsed = JSON.parse(bruto);
    return {
      ...ESTADO_VAZIO,
      ...parsed,
      competencias_tecnicas: Array.isArray(parsed.competencias_tecnicas)
        ? parsed.competencias_tecnicas
        : [],
      competencias_comportamentais: Array.isArray(parsed.competencias_comportamentais)
        ? parsed.competencias_comportamentais
        : [],
    };
  } catch {
    return ESTADO_VAZIO;
  }
}

function Perfil() {
  const fotoInputId = useId();
  const [modoEdicao, setModoEdicao] = useState(false);
  const [perfilAtual, setPerfilAtual] = useState(ESTADO_VAZIO);
  const [form, setForm] = useState(ESTADO_VAZIO);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState("");
  const [tecnicasTexto, setTecnicasTexto] = useState("");
  const [comportamentaisTexto, setComportamentaisTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function sincronizarEstados(perfil) {
    const normalizado = {
      ...ESTADO_VAZIO,
      ...perfil,
      competencias_tecnicas: perfil?.competencias_tecnicas || [],
      competencias_comportamentais: perfil?.competencias_comportamentais || [],
    };

    setPerfilAtual(normalizado);
    setForm(normalizado);
    setFotoFile(null);
    setTecnicasTexto(normalizado.competencias_tecnicas.join(", "));
    setComportamentaisTexto(normalizado.competencias_comportamentais.join(", "));
  }

  useEffect(() => {
    const salvo = carregarPerfilSalvo();
    sincronizarEstados(salvo);
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (fotoFile instanceof File) {
      const objectUrl = URL.createObjectURL(fotoFile);
      setFotoPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setFotoPreviewUrl(form.avatar_url || "");
    return undefined;
  }, [fotoFile, form.avatar_url]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!TIPOS_IMAGEM_PERMITIDOS.includes(file.type)) {
      setFeedback({
        tipo: "erro",
        mensagem: "Selecione uma imagem válida (JPG ou PNG).",
      });
      e.target.value = "";
      return;
    }

    if (file.size > TAMANHO_MAXIMO_BYTES) {
      setFeedback({
        tipo: "erro",
        mensagem: "A foto de perfil deve ter no máximo 5 MB.",
      });
      e.target.value = "";
      return;
    }

    setFeedback(null);
    setFotoFile(file);
  }

  function handleDescartarFoto() {
    const inputEl = document.getElementById(fotoInputId);
    if (inputEl) inputEl.value = "";
    setFotoFile(null);
  }

  function ativarVisualizacao() {
    setForm(perfilAtual);
    handleDescartarFoto();
    setTecnicasTexto(perfilAtual.competencias_tecnicas.join(", "));
    setComportamentaisTexto(perfilAtual.competencias_comportamentais.join(", "));
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
    setSalvando(true);
    setFeedback(null);

    try {
      let avatarFinal = form.avatar_url || "";
      if (fotoFile instanceof File) {
        avatarFinal = await lerArquivoComoDataUrl(fotoFile);
      }

      const atualizado = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        escolaridade: form.escolaridade.trim(),
        carreira: form.carreira.trim(),
        area_interesse: form.area_interesse.trim(),
        avatar_url: avatarFinal,
        habilidades_texto: form.habilidades_texto,
        competencias_tecnicas: parseLista(tecnicasTexto),
        competencias_comportamentais: parseLista(comportamentaisTexto),
      };

      localStorage.setItem(CHAVE_PERFIL_LOCAL, JSON.stringify(atualizado));
      sincronizarEstados(atualizado);
      setModoEdicao(false);
      setFeedback({
        tipo: "sucesso",
        mensagem: "Alterações salvas com sucesso.",
      });
    } catch {
      setFeedback({
        tipo: "erro",
        mensagem: "Não foi possível salvar as alterações.",
      });
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <section className="container perfil-page">
        <p className="subtitulo">Carregando perfil...</p>
      </section>
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
    <section className="container perfil-page">
      <div className="perfil-topbar">
        <div>
          <h1 className="titulo perfil-titulo">Perfil</h1>
          <p className="subtitulo perfil-subtitulo">
            {modoEdicao
              ? "Modo de edição: atualize seus dados, habilidades ou foto e clique em Salvar Alterações."
              : "Visualização completa do perfil, interesses e habilidades."}
          </p>
        </div>

        <div className="perfil-acoes-topo">
          <button
            type="button"
            className={`perfil-btn-modo ${!modoEdicao ? "perfil-btn-modo--ativo" : ""}`}
            onClick={ativarVisualizacao}
          >
            Visualizar perfil
          </button>

          <button
            type="button"
            className={`perfil-btn-modo ${modoEdicao ? "perfil-btn-modo--ativo" : ""}`}
            onClick={ativarEdicao}
          >
            Editar perfil
          </button>
        </div>
      </div>

      {feedback && (
        <p
          role="alert"
          className={`perfil-feedback ${
            feedback.tipo === "sucesso"
              ? "perfil-feedback--sucesso"
              : "perfil-feedback--erro"
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
                  <span className="perfil-dado-label">Nome</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.nome || "Não informado"}
                  </strong>
                </div>

                <div className="perfil-dado-card">
                  <span className="perfil-dado-label">E-mail</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.email || "Não informado"}
                  </strong>
                </div>

                <div className="perfil-dado-card">
                  <span className="perfil-dado-label">Telefone</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.telefone || "Não informado"}
                  </strong>
                </div>

                <div className="perfil-dado-card">
                  <span className="perfil-dado-label">Escolaridade</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.escolaridade || "Não informado"}
                  </strong>
                </div>

                <div className="perfil-dado-card">
                  <span className="perfil-dado-label">Carreira</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.carreira || "Não informado"}
                  </strong>
                </div>

                <div className="perfil-dado-card">
                  <span className="perfil-dado-label">Área de Interesse</span>
                  <strong className="perfil-dado-valor">
                    {perfilAtual.area_interesse || "Não informado"}
                  </strong>
                </div>
              </div>

              <h2 className="perfil-habilidades-titulo">Habilidades</h2>
              <p className="perfil-habilidades-texto">
                {perfilAtual.habilidades_texto ||
                  "Nenhuma descrição de habilidades cadastrada até o momento."}
              </p>

              <div className="perfil-competencias-grid">
                <div>
                  <h3 className="perfil-competencias-titulo">
                    Competências Técnicas
                  </h3>
                  <div className="perfil-competencias-lista">
                    {perfilAtual.competencias_tecnicas.length > 0 ? (
                      perfilAtual.competencias_tecnicas.map((item) => (
                        <span key={item} className="perfil-competencia-item">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="perfil-competencia-item perfil-competencia-item--vazio">
                        Nenhuma competência técnica
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="perfil-competencias-titulo">
                    Competências Comportamentais
                  </h3>
                  <div className="perfil-competencias-lista">
                    {perfilAtual.competencias_comportamentais.length > 0 ? (
                      perfilAtual.competencias_comportamentais.map((item) => (
                        <span key={item} className="perfil-competencia-item">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="perfil-competencia-item perfil-competencia-item--vazio">
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
                  Nome
                  <input
                    type="text"
                    name="nome"
                    className="perfil-input"
                    placeholder="Seu nome completo"
                    value={form.nome}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="perfil-label">
                  E-mail
                  <input
                    type="email"
                    name="email"
                    className="perfil-input"
                    placeholder="seu.email@exemplo.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="perfil-label">
                  Telefone
                  <input
                    type="text"
                    name="telefone"
                    className="perfil-input"
                    placeholder="(11) 99999-9999"
                    value={form.telefone}
                    onChange={handleChange}
                  />
                </label>

                <label className="perfil-label">
                  Escolaridade
                  <input
                    type="text"
                    name="escolaridade"
                    className="perfil-input"
                    placeholder="Ex.: Ensino Superior Cursando"
                    value={form.escolaridade}
                    onChange={handleChange}
                  />
                </label>

                <label className="perfil-label">
                  Carreira
                  <input
                    type="text"
                    name="carreira"
                    className="perfil-input"
                    placeholder="Ex.: Desenvolvimento Web / Tecnologia"
                    value={form.carreira}
                    onChange={handleChange}
                  />
                </label>

                <label className="perfil-label">
                  Área de Interesse
                  <input
                    type="text"
                    name="area_interesse"
                    className="perfil-input"
                    placeholder="Ex.: Estágio em Front-end ou Dados"
                    value={form.area_interesse}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <h2 className="perfil-habilidades-titulo">Habilidades</h2>
              <p className="perfil-habilidades-descricao">
                Descreva em texto livre suas experiências, projetos e pontos fortes.
              </p>

              <div className="perfil-campos">
                <textarea
                  name="habilidades_texto"
                  className="perfil-textarea"
                  placeholder="Escreva aqui um resumo das suas habilidades e experiências..."
                  value={form.habilidades_texto}
                  onChange={handleChange}
                />

                <label className="perfil-label">
                  Competências Técnicas (separadas por vírgula)
                  <input
                    type="text"
                    className="perfil-input"
                    placeholder="HTML, CSS, JavaScript, React, SQL"
                    value={tecnicasTexto}
                    onChange={(e) => setTecnicasTexto(e.target.value)}
                  />
                </label>

                <label className="perfil-label">
                  Competências Comportamentais (separadas por vírgula)
                  <input
                    type="text"
                    className="perfil-input"
                    placeholder="Comunicação, Trabalho em Equipe, Organização"
                    value={comportamentaisTexto}
                    onChange={(e) => setComportamentaisTexto(e.target.value)}
                  />
                </label>
              </div>

              <div className="perfil-competencias-grid">
                <div>
                  <h3 className="perfil-competencias-titulo">
                    Competências Técnicas
                  </h3>
                  <div className="perfil-competencias-lista">
                    {dadosExibicao.competencias_tecnicas.map((item) => (
                      <span key={item} className="perfil-competencia-item">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="perfil-competencias-titulo">
                    Competências Comportamentais
                  </h3>
                  <div className="perfil-competencias-lista">
                    {dadosExibicao.competencias_comportamentais.map((item) => (
                      <span key={item} className="perfil-competencia-item">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="perfil-acoes">
                <button
                  type="submit"
                  className="perfil-btn-salvar"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar Alterações"}
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
                alt={`Foto de ${perfilAtual.nome || "usuário"}`}
                className="perfil-avatar-img"
              />
            ) : (
              <div className="perfil-avatar-placeholder">
                <span>Sem foto de perfil</span>
              </div>
            )
          ) : (
            <div className="perfil-foto-card">
              <div className="perfil-foto-frame">
                {fotoPreviewUrl ? (
                  <img
                    src={fotoPreviewUrl}
                    alt={`Prévia da foto de ${form.nome || "usuário"}`}
                    className="perfil-avatar-img"
                  />
                ) : (
                  <div className="perfil-avatar-placeholder">
                    <span>Adicione sua foto de perfil</span>
                  </div>
                )}
              </div>

              <div className="perfil-foto-acoes">
                <label htmlFor={fotoInputId} className="perfil-btn-upload">
                  {fotoPreviewUrl ? "Alterar foto" : "Adicionar foto"}
                </label>

                {fotoFile instanceof File && (
                  <button
                    type="button"
                    className="perfil-btn-descartar"
                    onClick={handleDescartarFoto}
                  >
                    Descartar nova foto
                  </button>
                )}

                <input
                  id={fotoInputId}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFotoChange}
                  className="perfil-foto-input-oculto"
                />

                <span className="perfil-foto-ajuda">
                  JPG ou PNG, até 5 MB.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Perfil;