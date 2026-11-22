import '../stylesheet/Vagas.css';

const PLATAFORMAS = [
  {
    id: 'linkedin',
    nome: 'LinkedIn',
    descricao: 'Principal rede social profissional do mundo.',
    botao: 'Acessar LinkedIn',
    url: 'https://www.linkedin.com/jobs',
  },
  {
    id: 'gupy',
    nome: 'Gupy',
    descricao: 'Plataforma líder em recrutamento e seleção no Brasil',
    botao: 'Acessar Gupy',
    url: 'https://portal.gupy.io',
  },
  {
    id: 'catho',
    nome: 'Catho',
    descricao: 'Site tradicional de vagas e busca de empregos',
    botao: 'Acessar Catho',
    url: 'https://www.catho.com.br',
  },
  {
    id: 'infojobs',
    nome: 'InfoJobs',
    descricao: 'Plataforma de vagas de emprego e recrutamento no Brasil',
    botao: 'Acessar InfoJobs',
    url: 'https://www.infojobs.com.br',
  },
  {
    id: 'vagas',
    nome: 'Vagas',
    descricao: 'Um dos maiores e tradicionais portais de vagas de emprego do Brasil',
    botao: 'Acessar Vagas',
    url: 'https://www.vagas.com.br',
  },
  {
    id: 'indeed',
    nome: 'Indeed',
    descricao: 'Motor de busca global de empregos e vagas abertas',
    botao: 'Acessar Indeed',
    url: 'https://br.indeed.com',
  },
];

export default function Vagas() {
  return (
    <section className="vagas-container">
      <h1 className="vagas-titulo">Vagas</h1>

      <div className="vagas-layout">
        <aside className="vagas-info-coluna">
          <p className="vagas-texto-destaque">
            <strong>Plataformas</strong> voltadas para o encontro de
            oportunidades de trabalho.
          </p>

          <p className="vagas-texto-apoio">
            O acesso às plataformas sociais voltadas para o mercado profissional
            permite um aumento considerável nas chances de se conseguir uma vaga
            voltada para sua área de interesse.
          </p>
        </aside>

        <div className="vagas-lista-coluna">
          {PLATAFORMAS.map((plataforma) => (
            <article key={plataforma.id} className="vagas-card">
              <h2 className="vagas-card-titulo">{plataforma.nome}</h2>
              <p className="vagas-card-descricao">{plataforma.descricao}</p>

              <div className="vagas-card-acoes">
                <a
                  href={plataforma.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vagas-card-botao"
                >
                  {plataforma.botao}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}