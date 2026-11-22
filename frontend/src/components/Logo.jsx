import { Link } from "react-router-dom";


// Logo "Emprega Brasil" com a bandeira do lado.
function Logo() {
  return (
    <Link to="/" className="logo">
      <span>Emprega</span>
      <span>
        Brasil <img src="/bandeira.svg" alt="Bandeira do Brasil" />
      </span>
    </Link>
  )
}

export default Logo
