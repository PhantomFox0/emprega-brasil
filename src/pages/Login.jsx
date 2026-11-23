import { useId, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../stylesheet/Login.css"

const API_URL = (
  import.meta.env.VITE_API_URL || "https://emprega-brasil.onrender.com"
).replace(/\/+$/, "");
const CHAVE_USUARIO_ID = "emprega_brasil_usuario_id";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const idBase = useId();

  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const from = location.state?.from;
  const destino = from ? `${from.pathname}${from.search || ""}` : "/perfil";
  const aviso = location.state?.aviso;

  async function handleSubmit(event) {
    event.preventDefault();
    if (carregando) return;

    setErro("");
    if (!identificador.trim() || !senha) {
      setErro("Informe seu e-mail ou usuário e a senha.");
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificador: identificador.trim(),
          senha,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setErro(dados.error || "Não foi possível entrar. Tente novamente.");
        setCarregando(false);
        return;
      }

      localStorage.setItem(CHAVE_USUARIO_ID, String(dados.id));
      navigate(destino, {
        replace: true,
        state: { usuarioId: dados.id },
      });
    } catch {
      setErro("Erro de conexão com o servidor. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <section className="container login-page">
      <div className="cadastro-layout">
        <aside className="cadastro-painel">
          <span className="cadastro-badge">Emprega Brasil</span>
          <h2 className="cadastro-painel-titulo">Bom ver você de volta.</h2>
          <p className="cadastro-painel-texto">
            Entre para editar seu perfil, atualizar habilidades e continuar
            procurando vagas.
          </p>
        </aside>

        <div className="cadastro-card">
          <h1 className="titulo cadastro-titulo">Entrar</h1>
          <p className="subtitulo cadastro-subtitulo">
            Use seu e-mail ou nome de usuário e sua senha.
          </p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {aviso && !erro && (
              <p className="login-aviso" role="status">
                {aviso}
              </p>
            )}

            {erro && (
              <p className="cadastro-erro-geral" role="alert">
                {erro}
              </p>
            )}

            <div className="cadastro-campo">
              <label htmlFor={`${idBase}-identificador`}>
                E-mail ou nome de usuário
              </label>
              <input
                id={`${idBase}-identificador`}
                type="text"
                name="identificador"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                placeholder="nome@exemplo.com ou seu.usuario"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
              />
            </div>

            <div className="cadastro-campo">
              <label htmlFor={`${idBase}-senha`}>Senha</label>
              <div className="login-senha-controle">
                <input
                  id={`${idBase}-senha`}
                  type={senhaVisivel ? "text" : "password"}
                  name="senha"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  className="login-senha-toggle"
                  onClick={() => setSenhaVisivel((visivel) => !visivel)}
                  aria-pressed={senhaVisivel}
                  aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                >
                  {senhaVisivel ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="cadastro-btn-enviar"
              disabled={carregando}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="cadastro-rodape">
            Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;