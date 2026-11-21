import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Vagas() {
  const [plataformas, setPlataformas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarPlataformas() {
      try {
        setCarregando(true);
        setErro(null);

        const resposta = await fetch(`${API_URL}/api/plataformas`, {
          signal: controller.signal,
        });

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar as plataformas.");
        }

        const dados = await resposta.json();
        setPlataformas(dados);
      } catch (err) {
        if (err.name !== "AbortError") {
          setErro(err.message);
        }
      } finally {
        setCarregando(false);
      }
    }

    carregarPlataformas();

    return () => controller.abort();
  }, []);

  return (
    <section className="container vagas-page">
      <h1 className="titulo vagas-titulo">Vagas</h1>

      <div className="vagas-layout">
        <aside className="vagas-sidebar">
          <p className="vagas-destaque">
            <strong>Plataformas</strong> voltadas para o encontro de oportunidades de trabalho.
          </p>
          <p className="vagas-texto">
            O acesso às plataformas sociais voltadas para o mercado profissional permite um aumento considerável nas chances de se conseguir uma vaga voltada para sua área de interesse.
          </p>
        </aside>

        <div className="vagas-lista">
          {carregando && <p>Carregando plataformas...</p>}

          {!carregando && erro && <p>Erro: {erro}</p>}

          {!carregando && !erro && plataformas.length === 0 && (
            <p>Nenhuma plataforma cadastrada no momento.</p>
          )}

          {!carregando &&
            !erro &&
            plataformas.map((plat) => {
              const url = plat["plat_endereço"] || plat.plat_endereco || "#";

              return (
                <article key={plat.plat_id} className="vaga-card">
                  <h2 className="vaga-card-titulo">{plat.plat_nome}</h2>
                  {plat.plat_desc && (
                    <p className="vaga-card-desc">{plat.plat_desc}</p>
                  )}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vaga-card-botao"
                  >
                    Acessar {plat.plat_nome}
                  </a>
                </article>
              );
            })}
        </div>
      </div>
    </section>
  );
}

export default Vagas;