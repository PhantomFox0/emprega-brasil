import Logo from './Logo'
import NavBar from './NavBar'

// Cabeçalho com o menu. 
//Recebe a função "mudarPagina" do App.

function Header({ mudarPagina }) {
  return (
    <header className="header">
      <Logo />
      {/* Links do header para as páginas */}
      <nav className="menu">
        <button onClick={() => mudarPagina('inicio')}>Página Inicial</button>
        <button onClick={() => mudarPagina('curriculo')}>Currículo</button>
        <button onClick={() => mudarPagina('vagas')}>Vagas</button>
        <button onClick={() => mudarPagina('perfil')}>Perfil</button>
      </nav>
    </header>
  )
}

export default Header
