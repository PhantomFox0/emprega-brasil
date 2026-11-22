import fotoNoite from '../assets/cidade-noite.jpg';
import '../stylesheet/Auth.css';

// Moldura das telas de login e cadastro: painel com foto à esquerda, formulário à direita.
export default function AuthLayout({ painelTitulo, painelTexto, titulo, subtitulo, children, rodape }) {
  return (
    <div className="auth">
      <aside className="auth-painel" aria-hidden="true">
        <img src={fotoNoite} alt="" />
        <div className="auth-painel-texto">
          <p className="auth-painel-titulo">{painelTitulo}</p>
          <p>{painelTexto}</p>
        </div>
      </aside>

      <section className="auth-conteudo">
        <div className="auth-cartao">
          <h1>{titulo}</h1>
          {subtitulo && <p className="auth-subtitulo">{subtitulo}</p>}
          {children}
          {rodape && <p className="auth-rodape">{rodape}</p>}
        </div>
      </section>
    </div>
  );
}
