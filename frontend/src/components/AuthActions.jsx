import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Canto direito do topo: "Entrar" para visitantes; saudação e "Sair" para quem está logado.
function AuthActions() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="auth-acoes">
        <Link to="/login" className="btn-header">
          Entrar
        </Link>
      </div>
    );
  }

  const primeiroNome = (user?.nome || '').trim().split(/\s+/)[0] || user?.usuario;

  function handleSair() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="auth-acoes">
      <span className="auth-saudacao" title={user?.nome}>
        Olá, {primeiroNome}
      </span>
      <button type="button" className="btn-header" onClick={handleSair}>
        Sair
      </button>
    </div>
  );
}

export default AuthActions;
