import fotoCidade from '../assets/cidade.jpg'
import fotoCidadeNoite from '../assets/cidade-noite.jpg'
import fotoNotebook from '../assets/mulher-notebook.jpg'
import fotoEscritorio from '../assets/escritorio.jpg'
import fotoEntrevista from '../assets/entrevista.jpg'



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

function Home({ mudarPagina }) {
  return (
    <>
      <section className="container">
        <h1 className="titulo">Encontre vagas</h1>
        <p className="subtitulo">
          Construa seu perfil de preferência para vagas de emprego.
          <br />
          Adapte seu currículo para conseguir sua oportunidade de trabalho.
        </p>
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

          <button className="secoes-link" onClick={() => mudarPagina('curriculo')}>Currículo</button>
          <p>Orientações na construção de um currículo para sua aplicação em vagas.</p>
        </div>
        <img className="secoes-foto" src={fotoCidadeNoite} alt="São Paulo à noite" />
      </section>
    </>
  )
}

export default Home
