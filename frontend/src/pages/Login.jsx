import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Campo from '../components/Campo';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../services/apiError';

export default function Login() {
  const { login, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const from = location.state?.from;
  const destino = from ? `${from.pathname}${from.search || ''}` : '/perfil';
  const aviso = location.state?.aviso;

  async function handleSubmit(event) {
    event.preventDefault();
    if (carregando) return;

    setErro('');
    if (!username.trim() || !password) {
      setErro('Informe seu e-mail ou usuário e a senha.');
      return;
    }

    setCarregando(true);
    try {
      await login({ username: username.trim(), password });
      navigate(destino, { replace: true });
    } catch (error) {
      setErro(getErrorMessage(error, 'Não foi possível entrar. Tente novamente.'));
      setCarregando(false);
    }
  }

  return (
    <AuthLayout
      painelTitulo="Bom ver você de volta."
      painelTexto="Entre para editar seu perfil e seguir procurando vagas."
      titulo="Entrar"
      subtitulo="Use seu e-mail ou nome de usuário."
      rodape={
        <>
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {sessionExpired && !erro && (
          <p className="auth-aviso" role="status">
            Sua sessão expirou. Entre novamente para continuar.
          </p>
        )}
        {aviso && !erro && (
          <p className="auth-aviso" role="status">
            {aviso}
          </p>
        )}
        {erro && (
          <p className="auth-erro" role="alert">
            {erro}
          </p>
        )}

        <Campo
          label="E-mail ou usuário"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Campo
          label="Senha"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="btn btn--primario auth-enviar" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
