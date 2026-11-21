import { Link } from "react-router-dom"
import Logo from './Logo'


function NavBar() {

  return (
    <nav>
        <Link to="/">
          Principal
        </Link>
        <Link to="/perfil">
          Perfil
        </Link>
        <Link to="/curriculos">
          Curriculos
        </Link>
        <Link to="/vagas">
          Vagas
        </Link>
    </nav>
  )
}

export default NavBar
