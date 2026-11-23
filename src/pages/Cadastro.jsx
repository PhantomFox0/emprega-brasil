import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../stylesheet/Cadastro.css";

const API_URL = (import.meta.env.VITE_API_URL || "https://emprega-brasil.onrender.com").replace(/\/+$/, "");
const CHAVE_USUARIO_ID = "emprega_brasil_usuario_id";

const ESTADO_INICIAL = {
  nome: "",
  email: "",
  usuario: "",
  senha: "",
  confirmarSenha: "",
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_USUARIO = /^[a-zA-Z0-9._-]{3,30}$/;

function validar(form) {
  const erros = {};

  if (form.nome.trim().length < 2) {
    erros.nome = "Informe seu nome completo.";
  }
  if (!REGEX_EMAIL.test(form.email.trim())) {
    erros.email = "Informe um e-mail válido, como nome@exemplo.com.";
  }
  if (!REGEX_USUARIO.test(form.usuario.trim())) {
    erros.usuario =
      "Use de 3 a 30 caracteres: letras, números, ponto, hífen ou sublinhado.";
  }
  if (form.senha.length < 8 || form.senha.length > 72) {
    erros.senha = "A senha precisa ter de 8 a 72 caracteres.";
  }
  if (form.confirmarSenha !== form.senha) {
    erros.confirmarSenha = "As senhas não são iguais.";
  }

  return erros;
}

function Cadastro() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const idBase = useId();

  const [form, setForm] = useState(ESTADO_INICIAL);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [erros]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
    if (erros[name]) {
      setErros((anteriores) => ({ ...anteriores, [name]: undefined }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (carregando) return;

    setErroGeral("");
    const encontrados = validar(form);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/api/usuarios/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          usuario: form.usuario.trim(),
          senha: form.senha,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        const mensagem = dados.error || "Não foi possível criar a conta.";
        if (resposta.status === 409 && /e-?mail/i.test(mensagem)) {
          setErros({ email: mensagem });
        } else if (resposta.status === 409) {
          setErros({ usuario: mensagem });
        } else {
          setErroGeral(mensagem);
        }
        setCarregando(false);
        return;
      }

      localStorage.setItem(CHAVE_USUARIO_ID, String(dados.id));

      navigate("/perfil", {
        replace: true,
        state: { primeiroAcesso: true, usuarioId: dados.id },
      });
    } catch {
      setErroGeral("Erro de conexão com o servidor. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <section className="container cadastro-page">
      <div className="cadastro-layout">
        <aside className="cadastro-painel">
          <span className="cadastro-badge">Emprega Brasil</span>
          <h2 className="cadastro-painel-titulo">Comece pelo perfil.</h2>
          <p className="cadastro-painel-texto">
            Crie sua conta, organize suas habilidades e encontre vagas nas
            principais plataformas do país.
          </p>
        </aside>

        <div className="cadastro-card">
          <h1 className="titulo cadastro-titulo">Criar conta</h1>
          <p className="subtitulo cadastro-subtitulo">
            Leva um minuto. Os dados profissionais você completa depois.
          </p>

          <form
            className="cadastro-form"
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
          >
            {erroGeral && (
              <p className="cadastro-erro-geral" role="alert">
                {erroGeral}
              </p>
            )}

            <div className="cadastro-campo cadastro-campo--full">
              <label htmlFor={`${idBase}-nome`}>Nome completo</label>
              <input
                id={`${idBase}-nome`}
                type="text"
                name="nome"
                autoComplete="name"
                autoFocus
                placeholder="Ex.: Maria Oliveira"
                value={form.nome}
                onChange={handleChange}
                aria-invalid={Boolean(erros.nome)}
                aria-describedby={erros.nome ? `${idBase}-nome-erro` : undefined}
              />
              {erros.nome && (
                <span id={`${idBase}-nome-erro`} className="cadastro-campo-erro">
                  {erros.nome}
                </span>
              )}
            </div>

            <div className="cadastro-campo">
              <label htmlFor={`${idBase}-email`}>E-mail</label>
              <input
                id={`${idBase}-email`}
                type="email"
                name="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="nome@exemplo.com"
                value={form.email}
                onChange={handleChange}
                aria-invalid={Boolean(erros.email)}
                aria-describedby={
                  erros.email ? `${idBase}-email-erro` : undefined
                }
              />
              {erros.email && (
                <span id={`${idBase}-email-erro`} className="cadastro-campo-erro">
                  {erros.email}
                </span>
              )}
            </div>

            <div className="cadastro-campo">
              <label htmlFor={`${idBase}-usuario`}>Nome de usuário</label>
              <input
                id={`${idBase}-usuario`}
                type="text"
                name="usuario"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="maria.oliveira"
                value={form.usuario}
                onChange={handleChange}
                aria-invalid={Boolean(erros.usuario)}
                aria-describedby={`${idBase}-usuario-ajuda`}
              />
              {erros.usuario ? (
                <span
                  id={`${idBase}-usuario-ajuda`}
                  className="cadastro-campo-erro"
                >
                  {erros.usuario}
                </span>
              ) : (
                <span
                  id={`${idBase}-usuario-ajuda`}
                  className="cadastro-campo-ajuda"
                >
                  Você poderá entrar com ele ou com o e-mail.
                </span>
              )}
            </div>

            <div className="cadastro-campo">
              <label htmlFor={`${idBase}-senha`}>Senha</label>
              <input
                id={`${idBase}-senha`}
                type="password"
                name="senha"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
                aria-invalid={Boolean(erros.senha)}
                aria-describedby={`${idBase}-senha-ajuda`}
              />
              {erros.senha ? (
                <span
                  id={`${idBase}-senha-ajuda`}
                  className="cadastro-campo-erro"
                >
                  {erros.senha}
                </span>
              ) : (
                <span
                  id={`${idBase}-senha-ajuda`}
                  className="cadastro-campo-ajuda"
                >
                  De 8 a 72 caracteres.
                </span>
              )}
            </div>

            <div className="cadastro-campo">
              <label htmlFor={`${idBase}-confirmar`}>Confirmar senha</label>
              <input
                id={`${idBase}-confirmar`}
                type="password"
                name="confirmarSenha"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.confirmarSenha}
                onChange={handleChange}
                aria-invalid={Boolean(erros.confirmarSenha)}
                aria-describedby={
                  erros.confirmarSenha ? `${idBase}-confirmar-erro` : undefined
                }
              />
              {erros.confirmarSenha && (
                <span
                  id={`${idBase}-confirmar-erro`}
                  className="cadastro-campo-erro"
                >
                  {erros.confirmarSenha}
                </span>
              )}
            </div>

            <div className="cadastro-campo cadastro-campo--full">
              <button
                type="submit"
                className="cadastro-btn-enviar"
                disabled={carregando}
              >
                {carregando ? "Criando conta..." : "Criar conta"}
              </button>
            </div>
          </form>

          <p className="cadastro-rodape">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Cadastro;