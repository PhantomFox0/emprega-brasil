import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Só deixa passar quem está logado. Visitantes vão para /login e voltam para cá depois de entrar;
// quem acabou de sair (logout voluntário) volta para a página inicial.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, justLoggedOut } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    if (justLoggedOut) return <Navigate to="/" replace />;
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
