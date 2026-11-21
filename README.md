## Sobre o Projeto

O **Emprega Brasil** tem como objetivo facilitar o acesso de candidatos a oportunidades de emprego e a boas práticas de preparação profissional por meio de uma interface web responsiva e simples de navegar.

### Funcionalidades
- **Página Inicial:** apresenta o propósito do projeto, destaques informativos e acesso rápido às principais secções da aplicação.
- **Currículo:** reúne dicas e orientações práticas para estruturar e melhorar o currículo.
- **Vagas:** consome a API para exibir plataformas de recrutamento e emprego com links diretos e *layout* responsivo para dispositivos móveis.

### Arquitetura e Tecnologias
- **Front-end:** React, Vite, `react-router-dom` e CSS responsivo com *media queries*.
- **Back-end:** Node.js e Express, com configuração de CORS e conexão segura via `mysql2/promise` (SSL/TLS).
- **Banco de Dados:** MySQL no TiDB Cloud.
- **Hospedagem e Deploy:** *front-end* publicado na Vercel e API hospedada no Render.