import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Visitante vê "Cadastro"; usuário logado vê "Perfil" no lugar.
function NavBar({ className }) {
  const { isAuthenticated } = useAuth();

  return (
    <nav className={className} aria-label="Navegação principal">
      <NavLink to="/">Página Inicial</NavLink>
      {isAuthenticated ? (
        <NavLink to="/perfil">Perfil</NavLink>
      ) : (
        <NavLink to="/cadastro">Cadastro</NavLink>
      )}
      <NavLink to="/curriculo">Currículo</NavLink>
      <NavLink to="/vagas">Encontre Vagas</NavLink>
    </nav>
  );
}

export default NavBar;
