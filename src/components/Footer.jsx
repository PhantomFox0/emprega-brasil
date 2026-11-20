import Logo from './Logo'

// Rodapé que aparece em todas as páginas.
function Footer({ mudarPagina }) {
  return (
    <footer className="footer">
      <div className="footer-topo">
        <Logo />
        <div className="footer-links">
          <button onClick={() => mudarPagina('inicio')}>Página inicial</button>
          <button onClick={() => mudarPagina('curriculo')}>Currículo</button>
          <button onClick={() => mudarPagina('vagas')}>Vagas</button>
          <button onClick={() => mudarPagina('perfil')}>Perfil</button>
        </div>
      </div>
      <p className="footer-copy">
        © 2026 EmpregaBrasil. Todos os direitos reservados. Feito com Figma em São Paulo, Brasil.
      </p>
    </footer>
  )
}

export default Footer
