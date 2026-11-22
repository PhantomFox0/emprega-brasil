import { NavLink } from "react-router-dom";

function NavBar({ className }) {
  return (
    <nav className={className}>
      <NavLink to="/">Página Inicial</NavLink>
      <NavLink to="/cadastro">Cadastro</NavLink>
      <NavLink to="/perfil">Perfil</NavLink>
      <NavLink to="/curriculo">Currículo</NavLink>
      <NavLink to="/vagas"> Encontre Vagas</NavLink>
    </nav>
  );
}

export default NavBar;
