import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Telas de login e cadastro não fazem sentido para quem já está logado.
export default function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const from = location.state?.from;
    const destino = from ? `${from.pathname}${from.search || ''}` : '/perfil';
    return <Navigate to={destino} replace />;
  }
  return children;
}
