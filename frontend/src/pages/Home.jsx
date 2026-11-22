import { Link } from 'react-router-dom';
import fotoCidade from '../assets/cidade.jpg';
import fotoCidadeNoite from '../assets/cidade-noite.jpg';
import fotoNotebook from '../assets/mulher-notebook.jpg';
import fotoEscritorio from '../assets/escritorio.jpg';
import fotoEntrevista from '../assets/entrevista.jpg';
import { useAuth } from '../hooks/useAuth';
import '../stylesheet/Home.css';


// Lista dos cards da parte Sobre o projeto
const sobre = [
  {
    foto: fotoNotebook,
    texto: 'Auxílio para encontrar vagas que sejam voltadas para suas competências e habilidades.',
  },
  {
    foto: fotoEscritorio,
    texto: 'Formas de construir um currículo de maneiras ideais para as vagas aplicadas.',
  },
  {
    foto: fotoEntrevista,
    texto: 'Formas de se portar em entrevistas para conseguir a oportunidade desejada.',
  },
]

// Seções do site. "quem" define para quem o link aparece: visitante, logado ou todos.
const secoes = [
  {
    to: '/cadastro',
    titulo: 'Cadastro',
    texto: 'Crie sua conta para encontrar vagas de acordo com suas preferências.',
    quem: 'visitante',
  },
  {
    to: '/login',
    titulo: 'Entrar',
    texto: 'Já tem conta? Acesse seu perfil e continue de onde parou.',
    quem: 'visitante',
  },
  {
    to: '/perfil',
    titulo: 'Perfil',
    texto: 'Edite suas informações pessoais e profissionais.',
    quem: 'logado',
  },
  {
    to: '/curriculo',
    titulo: 'Currículo',
    texto: 'Orientações na construção de um currículo para sua aplicação em vagas.',
    quem: 'todos',
  },
  {
    to: '/vagas',
    titulo: 'Vagas',
    texto: 'Encontre oportunidades voltadas para suas capacidades e competências.',
    quem: 'todos',
  },
]


function Home() {
  const { isAuthenticated, user } = useAuth();
  const primeiroNome = (user?.nome || '').trim().split(/\s+/)[0] || user?.usuario;

  const secoesVisiveis = secoes.filter(
    (secao) =>
      secao.quem === 'todos' ||
      (secao.quem === 'logado' && isAuthenticated) ||
      (secao.quem === 'visitante' && !isAuthenticated)
  );

  return (
    <>
      <section className="container hero">
        <h1 className="titulo">Encontre vagas</h1>
        <p className="subtitulo">
          {isAuthenticated
            ? `Olá, ${primeiroNome}. Mantenha seu perfil em dia e siga procurando oportunidades.`
            : 'Construa seu perfil de preferência para vagas de emprego.'}
          <br />
          Adapte seu currículo para conseguir sua oportunidade de trabalho.
        </p>

        <div className="hero-acoes">
          {isAuthenticated ? (
            <>
              <Link className="btn btn--primario" to="/perfil">
                Ver meu perfil
              </Link>
              <Link className="btn btn--contorno" to="/vagas">
                Encontrar vagas
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn--primario" to="/cadastro">
                Criar conta
              </Link>
              <Link className="btn btn--contorno" to="/login">
                Entrar
              </Link>
            </>
          )}
        </div>

        <img className="foto-grande" src={fotoCidade} alt="Vista aérea de São Paulo" />
      </section>

      {/* Parte em que foi usada a função map */}
      <section className="container">
        <h2 className="titulo-secao">Sobre o projeto</h2>
        <div className="sobre-lista">
          {sobre.map((item) => (
            <div className="sobre-card" key={item.texto}>
              <img src={item.foto} alt="" />
              <p>{item.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="secoes">
        <div className="secoes-textos">
          <h2>Seções</h2>

          {secoesVisiveis.map((secao) => (
            <div className="secoes-item" key={secao.to}>
              <Link className="secoes-link" to={secao.to}>
                {secao.titulo}
              </Link>
              <p>{secao.texto}</p>
            </div>
          ))}
        </div>
        <img className="secoes-foto" src={fotoCidadeNoite} alt="São Paulo à noite" />
      </section>
    </>
  )
}

export default Home;
