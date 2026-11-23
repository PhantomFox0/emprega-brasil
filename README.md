# Emprega Brasil

Plataforma web que ajuda candidatos a se prepararem para o mercado de trabalho: o usuário cria uma conta, monta o próprio perfil profissional, consulta dicas de currículo e acessa as principais plataformas de vagas do país.

> Projeto acadêmico — curso de **Análise e Desenvolvimento de Sistemas (ADS) · FATEC**
> Integrantes: _preencher_ · Disciplina: _preencher_ · Professor(a): _preencher_

**Em produção:** https://emprega-brasil-web-five.vercel.app
**Documentação interativa da API (Swagger):** https://emprega-brasil-api-murex.vercel.app/api/docs

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Funcionalidades](#2-funcionalidades)
3. [Arquitetura: três aplicações independentes e back-end em detalhe](#3-arquitetura)
4. [Tecnologias](#4-tecnologias)
5. [Estrutura do repositório](#5-estrutura-do-repositório)
6. [Modelo de dados](#6-modelo-de-dados)
7. [Autenticação e segurança (OAuth 2.0, JWT, sessões)](#7-autenticação-e-segurança)
8. [Integração front-end ↔ back-end](#8-integração-front-end--back-end)
9. [REST, HTTP e OpenAPI: os conceitos por trás da API](#9-rest-http-e-openapi--os-conceitos-por-trás-da-api)
10. [API REST (endpoints)](#10-api-rest)
11. [Decisões de projeto](#11-decisões-de-projeto)
12. [Como executar](#12-como-executar)
13. [Deploy](#13-deploy)
14. [Limitações conhecidas e próximos passos](#14-limitações-conhecidas-e-próximos-passos)
15. [Perguntas frequentes (FAQ)](#15-perguntas-frequentes-faq)

---

## 1. Visão geral

| | |
|---|---|
| **Problema** | Candidatos, especialmente os iniciantes, não sabem por onde começar: como montar um currículo, onde procurar vagas e como organizar suas competências. |
| **Solução** | Uma aplicação web responsiva e simples, com conta pessoal, perfil profissional editável e conteúdo de apoio. |
| **Público** | Pessoas em busca da primeira oportunidade ou de recolocação. |

O sistema segue o modelo **cliente–servidor** com uma **SPA** (Single Page Application) no front-end, uma **API REST** no back-end e um **banco relacional** gerenciado na nuvem.

## 2. Funcionalidades

| Página | Rota | Acesso | O que faz |
|---|---|---|---|
| Página inicial | `/` | Público | Apresenta o propósito do projeto e atalhos para as seções. |
| Cadastro | `/cadastro` | Visitante | Cria a conta (nome, e-mail, usuário, senha) e já inicia a sessão. |
| Login | `/login` | Visitante | Autentica por e-mail ou usuário e senha. |
| Perfil | `/perfil` | Logado | Visualiza e edita dados pessoais, escolaridade, carreira, área de interesse, habilidades, competências técnicas e comportamentais (a foto está em desenvolvimento). |
| Currículo | `/curriculo` | Público | Dicas práticas para estruturar um bom currículo. |
| Vagas | `/vagas` | Público | Lista de plataformas de emprego (LinkedIn, Gupy, Catho, etc.) com links diretos. |

Regras de navegação: visitantes logados não veem Login/Cadastro (`GuestRoute`) e usuários não logados são redirecionados ao tentar abrir o Perfil (`ProtectedRoute`).

## 3. Arquitetura

### 3.1 Três aplicações independentes

O sistema **não é um programa único**: são **aplicações separadas**, com código, dependências, build e publicação próprios. Elas só se conhecem por meio de **HTTP**.

| Aplicação | Pasta | Projeto na Vercel | Tecnologia | Responsabilidade | Onde roda |
|---|---|---|---|---|---|
| **WebApp** (front-end) | `frontend/` | `emprega-brasil-web` | React 19 + Vite + **axios** | Telas e experiência do usuário | No **navegador** do usuário (os arquivos estáticos vêm da CDN da Vercel) |
| **ms-profile** (back-end / API REST) | `backend/ms-profile/` | `emprega-brasil-api` | Node.js 22 + Express | Cadastro, login (OAuth 2.0 + JWT) e perfil | Função serverless na Vercel (ou contêiner Docker / Kubernetes) |
| **Banco de dados** | — | AWS RDS `perfil_db` | MySQL 8 | Guarda perfis e sessões | Serviço gerenciado da AWS |

> **ms-profile** significa *microservice profile*: um serviço pequeno, com uma responsabilidade (identidade e perfil), que expõe uma API REST. Hoje é o único serviço; a divisão em aplicações separadas permite acrescentar outros (por exemplo, vagas) sem mexer neste.

```mermaid
flowchart LR
    NAV["Navegador do usuário"]

    subgraph WEB["App 1 · WebApp · projeto emprega-brasil-web · pasta frontend/"]
      direction TB
      UI["React<br/>pages · components · rotas"]
      CTX["AuthProvider (estado de login)"]
      AX["axios · services/api.js<br/>interceptors: Bearer + 401"]
      UI --> CTX
      CTX --> AX
    end

    subgraph API["App 2 · ms-profile · projeto emprega-brasil-api · pasta backend/ms-profile/"]
      direction TB
      RT["routes"]
      MW["middlewares<br/>JWT · validação · erros"]
      CT["controllers"]
      SV["services<br/>bcrypt · JWT"]
      RP["repositories (SQL)"]
      RT --> MW --> CT --> SV --> RP
    end

    DB[("App 3 · AWS RDS<br/>MySQL perfil_db<br/>perfis · Sessions")]

    NAV -->|"1. HTTPS GET /<br/>baixa HTML, JS e CSS"| WEB
    AX ==>|"2. HTTP REST com JSON<br/>POST /api/auth/token<br/>GET /api/perfis/me<br/>Authorization: Bearer"| RT
    RP -->|"3. protocolo MySQL sobre TLS<br/>(driver mysql2)"| DB
```

**Como ler o diagrama**

1. O navegador baixa o **WebApp** (arquivos estáticos). A partir daí, o próprio JavaScript do WebApp roda no navegador.
2. Quando precisa de dados, o **axios** faz uma chamada **HTTP REST** (JSON) ao **ms-profile**. Em produção, a Vercel recebe `/api/*` no domínio do site e repassa para a API (*rewrite*), então o navegador enxerga um único endereço.
3. Só o **ms-profile** conversa com o **banco**. O WebApp nunca recebe credenciais do banco, e o banco não é acessível pelo navegador.

**Por que separar em aplicações?**

| Vantagem | Exemplo no projeto |
|---|---|
| Evolução e deploy independentes | Trocar o visual do site não exige publicar a API; mudar a API não recompila o site. |
| Tecnologias e escala diferentes | O front é arquivo estático (CDN); a API roda sob demanda. |
| Segurança por isolamento | Segredos (senha do banco, `JWT_SECRET`) existem só no back-end. |
| Reuso | A mesma API poderia atender um app mobile. |
| Contrato claro | A fronteira é a API REST, documentada com **OpenAPI** (seção 9). |

O custo é a complexidade extra: chamadas de rede, CORS (resolvido com o *rewrite*), versionamento do contrato e dois deploys.

### 3.2 O que acontece ao abrir a página de Perfil

```mermaid
sequenceDiagram
    autonumber
    participant N as Navegador
    participant W as WebApp (emprega-brasil-web)
    participant A as ms-profile (emprega-brasil-api)
    participant D as MySQL (AWS RDS)

    N->>W: GET /perfil (HTTPS)
    W-->>N: index.html + bundle JS (SPA)
    Note over N: React inicia no navegador e lê o token do localStorage
    N->>A: GET /api/perfis/me · Authorization: Bearer token (via axios)
    A->>D: valida a sessão do token (Sessions)
    A->>D: SELECT do perfil do usuário
    D-->>A: linha do perfil
    A-->>N: 200 OK · JSON do perfil
    Note over N: React monta a tela com o JSON recebido
```

Repare que o **servidor do WebApp não participa dos dados**: ele só entrega os arquivos. Quem fornece e protege a informação é a API.

### Back-end em camadas

```
Requisição → routes → middlewares (JWT, validação, upload)
          → controllers → services → repositories → MySQL
```

| Camada | Responsabilidade |
|---|---|
| `routes` | Define URLs e a ordem dos middlewares; contém a documentação OpenAPI. |
| `middlewares` | Autenticação JWT, validação de entrada, upload de imagem, tratamento de erros. |
| `controllers` | Traduz HTTP em chamadas de serviço e devolve o status correto. |
| `services` | Regras de negócio (hash de senha, emissão de token, conflito de e-mail). |
| `repositories` | Único lugar com SQL; usa consultas parametrizadas. |
| `config` | Variáveis de ambiente, pool do banco e Swagger. |

### Back-end em detalhe

**Inicialização.** Em execução tradicional (`server.js`, usado no Docker e no Kubernetes) a API testa a conexão com o banco *antes* de abrir a porta; se o MySQL não responder, o processo encerra com erro (*fail fast*). Na Vercel, `api/index.js` apenas exporta o app Express, e cada instância serverless cria o pool de conexões sob demanda.

**Ordem de execução do app (`src/app.js`).** A ordem dos middlewares importa:

| # | Etapa | O que faz |
|---|---|---|
| 1 | `cors` | Confere a origem da requisição contra a lista `CORS_ORIGINS` (lista exata, sem `*`). |
| 2 | `express.json` / `urlencoded` | Lê o corpo JSON ou `x-www-form-urlencoded` (o login usa esse formato). |
| 3 | `/fotos` | Serve arquivos estáticos da pasta de fotos. |
| 4 | `/api` → `routes` | `/health`, `/docs` (Swagger), `/auth/*` e `/perfis/*`. |
| 5 | `notFoundHandler` | Qualquer rota inexistente responde 404 em JSON. |
| 6 | `errorHandler` | Ponto único de erros: converte `err.statusCode` em resposta; em produção, erros 500 não vazam detalhes. |

**Contrato de erros.** Os serviços lançam `Error` com `statusCode` (400, 401, 403, 404, 409). O `errorHandler` devolve `{ "error": "mensagem" }`. O endpoint de token usa o formato do OAuth 2.0: `{ "error": "invalid_grant", "error_description": "..." }`.

**Acesso a dados.** O `pool` do `mysql2` (até 10 conexões) usa `pool.execute`, que envia *prepared statements*: os valores nunca são concatenados ao SQL. As consultas de leitura de perfil listam as colunas explicitamente (`SAFE_PERFIL_COLUMNS`), então o hash da senha nunca sai do banco em respostas de perfil. A atualização só aceita uma lista fixa de campos (*allowlist*).

**Quem faz o quê nas rotas de autenticação:**

| Rota | Cadeia | Resultado |
|---|---|---|
| `POST /auth/register` | `validateRegister` → `authController.register` → `authService.register` → `perfilRepository` | Valida campos, checa duplicidade (409), gera o hash da senha e grava. |
| `POST /auth/token` | `authController.token` → `authService.login` → `perfilRepository` + `sessionRepository` | Confere credenciais, emite JWT e registra a sessão. |
| `POST /auth/logout` | `authenticateJwt` → `authController.logout` → `sessionRepository` | Revoga a sessão do token usado. |
| `GET/PUT/PATCH /perfis/me` | `authenticateJwt` (aplicado a todo o grupo) → `perfilController` | Opera sempre sobre o `id` que vem do token. |

### Front-end

- **Páginas** (`pages/`) compõem **componentes** reutilizáveis (`components/`).
- **Contexto de autenticação** (`context/AuthProvider`) guarda o usuário e expõe `login`, `register`, `logout` por meio do hook `useAuth`.
- **Serviços** (`services/`) isolam as chamadas HTTP (`axios`) e a persistência do token.
- Um **interceptor** do axios anexa o token e, ao receber 401 com token enviado, encerra a sessão automaticamente.

## 4. Tecnologias

| Área | Tecnologia | Uso |
|---|---|---|
| Front-end | React 19, Vite, React Router, Axios | SPA, rotas, chamadas à API |
| Back-end | Node.js 22, Express 4 | API REST |
| Banco | MySQL 8 no **AWS RDS** | Persistência |
| Segurança | bcryptjs, jsonwebtoken, cors, TLS | Senhas, sessão, origem, transporte |
| Upload | multer | Middleware de foto de perfil (JPG/PNG, até 5 MB) — implementado, ainda não ligado à rota |
| Documentação | swagger-jsdoc, swagger-ui-express | OpenAPI em `/api/docs` |
| Contêineres | Docker, Docker Compose, nginx | Execução local e imagens |
| Orquestração | Kubernetes (manifests em `k8s/`) | Deploy alternativo em cluster |
| Hospedagem | Vercel (front e API) | Deploy de produção |

## 5. Estrutura do repositório

```
.
├── backend/ms-profile/        # API (microsserviço de perfil)
│   ├── api/index.js           # entrada serverless da Vercel
│   ├── server.js              # entrada para execução tradicional (Docker/local)
│   ├── src/                   # routes, controllers, services, repositories, middlewares, config
│   ├── certs/                 # bundle de CA da AWS (validação TLS do RDS)
│   ├── docker/mysql/init.sql  # criação do schema
│   └── vercel.json
├── frontend/                  # SPA React
│   ├── src/                   # pages, components, context, services, routes, stylesheet
│   ├── Dockerfile · nginx.conf
│   └── vercel.json            # rewrites /api e SPA fallback
├── k8s/                       # manifests Kubernetes
├── docker-compose.yml         # sobe front + API (+ MySQL local opcional)
└── deploy_vercel.sh           # deploy automatizado na Vercel
```

## 6. Modelo de dados

```mermaid
erDiagram
    PERFIS ||--o{ SESSIONS : possui
    PERFIS {
        int id PK
        varchar nome
        varchar email UK
        varchar usuario UK
        varchar senha "hash bcrypt"
        varchar telefone
        varchar escolaridade
        varchar carreira
        varchar area_interesse
        varchar avatar_url
        text habilidades_texto
        json competencias_tecnicas
        json competencias_comportamentais
        timestamp created_at
        timestamp updated_at
    }
    SESSIONS {
        bigint id PK
        int perfil_id FK
        varchar jti UK "id único do JWT"
        char token_hash "SHA-256 do token"
        varchar user_agent
        varchar ip_address
        tinyint revoked
        datetime expires_at
    }
```

- `perfis` guarda a conta e o perfil profissional. As competências são colunas **JSON**, o que evita criar tabelas auxiliares para listas simples.
- `Sessions` permite **revogar** tokens (logout). Ela se relaciona com `perfis` por chave estrangeira com `ON DELETE CASCADE`.
- Todo o schema está em `backend/ms-profile/docker/mysql/init.sql`.

## 7. Autenticação e segurança

### 7.1 Conceitos usados

| Conceito | Papel neste projeto |
|---|---|
| **OAuth 2.0 — *Resource Owner Password Credentials*** (RFC 6749 §4.3) | Define o *contrato* do login: o cliente envia `grant_type=password`, `username` e `password` e recebe um *access token*. É a variante mais simples do OAuth e adequada quando o próprio site é o cliente de confiança da API. |
| **Bearer token** (RFC 6750) | O token é enviado em `Authorization: Bearer <token>`. Quem possui o token acessa a API, por isso ele precisa trafegar só por HTTPS. |
| **JWT** (JSON Web Token) | Formato do token: `cabeçalho.payload.assinatura`, assinado com HMAC-SHA256 (HS256) usando o `JWT_SECRET`. Qualquer alteração no conteúdo invalida a assinatura. |
| **Sessão no banco** (tabela `Sessions`) | Complementa o JWT: registra cada token emitido e permite **revogá-lo** (logout) antes de expirar. |

> **Nota:** o projeto implementa o *contrato* do endpoint de token do OAuth 2.0 (grant `password`), mas não é um servidor OAuth completo: não há `client_id`, escopos, *refresh token* nem fluxo de autorização por redirecionamento (Authorization Code). O padrão foi escolhido para manter o foco em JWT e segurança de sessão.

**Conteúdo do JWT (payload):**

```json
{ "sub": 14, "jti": "5c1f…-uuid", "usuario": "maria", "iat": 1763866000, "exp": 1763869600 }
```

`sub` é o id do perfil; `jti` é um identificador único por token (usado para revogação); `exp` é o vencimento (padrão: 1 hora, configurável em `JWT_EXPIRES_IN`). A senha e o e-mail **nunca** vão no token.

### 7.2 Fluxo de cadastro e login

```mermaid
sequenceDiagram
    autonumber
    participant B as Navegador (React)
    participant A as API (Express)
    participant D as MySQL (RDS)

    B->>A: POST /api/auth/register {nome, email, usuario, senha}
    A->>A: validateRegister (campos, senha 8–72)
    A->>D: existe e-mail/usuário? (consulta parametrizada)
    D-->>A: não
    A->>A: bcrypt.hash(senha, custo 12)
    A->>D: INSERT perfis (senha = hash)
    A-->>B: 201 perfil (sem senha)

    B->>A: POST /api/auth/token<br/>grant_type=password&username&password
    A->>D: busca perfil por e-mail OU usuário
    A->>A: bcrypt.compare(senha, hash)
    A->>A: gera jti (UUID) e assina JWT HS256
    A->>D: INSERT Sessions (jti, SHA-256 do token, user-agent, ip, expires_at)
    A-->>B: 200 {access_token, token_type: Bearer, expires_in, perfil}<br/>Cache-Control: no-store
    B->>B: guarda token + validade em localStorage
```

Detalhes do endpoint `POST /auth/token`:

- Sem `grant_type` → `400 invalid_request`; `grant_type` diferente de `password` → `400 unsupported_grant_type`.
- Usuário inexistente **ou** senha errada → a **mesma** resposta `400 invalid_grant` ("Usuário ou senha inválidos."), para não revelar quais e-mails existem.
- A resposta leva `Cache-Control: no-store`, para que o token não fique em cache de proxies.
- O login aceita **e-mail ou usuário**, sem diferenciar maiúsculas de minúsculas.

### 7.3 Acesso a uma rota protegida

```mermaid
sequenceDiagram
    autonumber
    participant B as Navegador
    participant M as authenticateJwt
    participant D as MySQL
    participant C as Controller

    B->>M: GET /api/perfis/me<br/>Authorization: Bearer <JWT>
    M->>M: formato "Bearer <token>"?
    M->>M: jwt.verify(token, secret, algoritmo HS256)<br/>(assinatura + exp)
    M->>D: sessão do jti: revoked=0 e expires_at > agora?
    D-->>M: sessão
    M->>M: sessão.perfil_id == sub<br/>e sessão.token_hash == SHA-256(token)?
    M->>C: req.user = {id, jti, usuario}
    C->>D: SELECT do perfil de req.user.id
    C-->>B: 200 perfil
```

Qualquer falha nas verificações (formato, assinatura/validade, sessão ou correspondência do token) responde **401** com o cabeçalho `WWW-Authenticate: Bearer error="invalid_token"` e uma mensagem (token ausente, expirado, inválido ou sessão revogada).

Por que validar também no banco? Um JWT sozinho é *stateless*: enquanto não vencer, continua válido mesmo depois do logout. A consulta à tabela `Sessions` devolve esse controle ao servidor, ao custo de uma consulta indexada por requisição.

### 7.4 Logout

`POST /api/auth/logout` (protegido) executa `UPDATE Sessions SET revoked = 1 WHERE jti = ? AND perfil_id = ?` e responde **204**. A partir daí, usar o mesmo token resulta em 401 ("Sessão inválida, expirada ou revogada"), mesmo que a assinatura e o `exp` ainda estejam válidos.

### 7.5 Camadas de proteção

| Ameaça | Defesa implementada |
|---|---|
| Vazamento do banco | Senhas só existem como hash **bcrypt** (custo 12, com *salt* embutido). O token não é guardado: só o seu hash SHA-256. |
| Adivinhar senhas | bcrypt é deliberadamente lento; senhas de 8 a 72 caracteres (72 bytes é o limite do bcrypt). |
| Enumeração de usuários no login | Mensagem única para "usuário inexistente" e "senha errada". |
| Falsificar ou alterar o token | Assinatura HS256 com segredo do servidor; a verificação **fixa o algoritmo** (`algorithms: ["HS256"]`), evitando ataques de troca de algoritmo (`alg: none`). |
| Reutilizar token após logout | Verificação da sessão no banco (`revoked`, `expires_at`, `token_hash`). |
| Acessar dados de outro usuário (IDOR) | O id vem **do token**, nunca da URL. `GET /perfis/me/:id` retorna 403 se o `id` não for o do usuário logado. |
| Atualizar campos indevidos (*mass assignment*) | `id` e `senha` são removidos do corpo; só campos de uma *allowlist* entram no `UPDATE`. |
| SQL Injection | Somente `pool.execute` com parâmetros. |
| Interceptação na rede | HTTPS na Vercel; conexão com o RDS por TLS validando a CA da AWS (`rejectUnauthorized: true`). |
| Origens não autorizadas | CORS com lista exata de origens. Em produção o navegador nem chega a usar CORS, pois a API é servida pelo domínio do próprio site (seção 8). |
| Vazamento de detalhes em erros | Em produção, erros 500 retornam mensagem genérica; o detalhe vai só para o log do servidor. |
| Segredos no repositório | `.env` no `.gitignore`; variáveis configuradas na plataforma (Vercel/Secret do Kubernetes). |
| CSRF | O token vai em cabeçalho `Authorization` escrito pelo JavaScript, e não em cookie; o navegador não o anexa sozinho a requisições de outros sites. |

### 7.6 Limitações de segurança (honestidade técnica)

| Ponto | Risco | Melhoria |
|---|---|---|
| **Token no `localStorage`** | Um ataque XSS poderia ler o token. | Cookie `HttpOnly; Secure; SameSite` e/ou *refresh token* com rotação. |
| **Sem *rate limit*** | Tentativas de login ilimitadas. | `express-rate-limit` e bloqueio progressivo nas rotas `/auth/*`. |
| **Sem *refresh token*** | Ao fim de 1 hora é preciso entrar de novo. | Refresh token de vida longa, revogável. |
| **Sem validação na atualização do perfil** | O middleware `validatePerfil` existe, mas não está ligado às rotas `PUT/PATCH /perfis/me`; só há a *allowlist* de campos. | Ligar a validação (tipos, tamanhos, formato de e-mail). |
| **Cabeçalhos de segurança** | Não usa `helmet`. | Adicionar `helmet` (CSP, `X-Content-Type-Options`, etc.). |
| **Sessões expiradas ficam na tabela** | Crescimento da tabela `Sessions`. | Rotina periódica que apaga registros vencidos. |
| **IP da sessão** | Atrás do proxy da Vercel, `req.ip` provavelmente registra o IP do proxy. | Configurar `trust proxy` e ler `X-Forwarded-For`. |
| **Banco aberto à internet** | O Security Group do RDS aceita `0.0.0.0/0` por causa da Vercel (protegido por senha e TLS). | RDS Proxy/VPC ou IP fixo (seção 14). |

## 8. Integração front-end ↔ back-end

```mermaid
flowchart TB
    subgraph Navegador
      P[Páginas<br/>Login · Cadastro · Perfil] --> H[useAuth / AuthProvider]
      H --> S[authApi · perfilApi]
      S --> X[axios 'api'<br/>interceptors]
      H <--> L[(localStorage<br/>emprega.auth)]
      X --> L
    end
    X -->|"/api/... + Bearer token"| R[Vercel: rewrite /api]
    R --> API[API Express]
```

**Camadas do front-end para falar com a API**

| Arquivo | Função |
|---|---|
| `services/api.js` | Instância única do `axios` (`baseURL = VITE_API_URL`, que em produção é `/api`) com dois *interceptors*. |
| `services/authApi.js` | `login` (envia `grant_type=password` como `x-www-form-urlencoded`), `register` e `logout`. |
| `services/perfilApi.js` | `buscarMeuPerfil` (`GET /perfis/me`) e `atualizarMeuPerfil` (`PUT /perfis/me`). |
| `services/authStorage.js` | Lê, grava e apaga a sessão (`token`, `expiresAt`, `perfil`) no `localStorage`; descarta sessão já vencida ao ler. |
| `context/AuthProvider.jsx` | Estado global de autenticação; expõe `user`, `isAuthenticated`, `login`, `register`, `logout`, `updateUser` pelo hook `useAuth`. |
| `routes/ProtectedRoute` e `GuestRoute` | Controle de acesso às páginas (veja abaixo). |
| `services/apiError.js` | Converte erros da API em mensagens amigáveis para os formulários. |

**Interceptors do axios**

1. **Requisição:** se existe token salvo e a chamada não trouxe `Authorization`, adiciona `Authorization: Bearer <token>`. As páginas nunca manipulam o token diretamente.
2. **Resposta:** se a API devolve **401** em uma rota protegida (token enviado e URL fora de `/auth/*`), o front apaga a sessão local e avisa o `AuthProvider`, que mostra "Sua sessão expirou. Entre novamente".

**Ciclo de vida da sessão no navegador**

| Momento | O que acontece |
|---|---|
| **Cadastro** | `register` → em seguida `login` automático → vai para `/perfil` já no modo de edição (`primeiroAcesso`). Se o login automático falhar, vai para `/login` com aviso. Erros 409 aparecem no campo certo (e-mail ou usuário). |
| **Login** | `login` guarda `{ token, expiresAt = agora + expires_in, perfil }` e redireciona para a página que o usuário tentava abrir (ou `/perfil`). |
| **Recarregar a página** | O `AuthProvider` reidrata o estado a partir do `localStorage` (a sessão continua). |
| **Expiração** | Um `setTimeout` encerra a sessão no horário exato do vencimento, sem esperar uma requisição falhar. |
| **Várias abas** | O evento `storage` sincroniza: logout ou login em uma aba reflete nas outras. |
| **Logout** | Limpa a sessão local imediatamente e chama `POST /auth/logout` sem bloquear a tela; se a chamada falhar, o token expira sozinho. O usuário volta para a página inicial. |

**Controle de acesso das páginas**

- `ProtectedRoute` (Perfil): sem sessão, redireciona para `/login` guardando a origem para voltar depois; depois de um logout voluntário, vai para `/`.
- `GuestRoute` (Login e Cadastro): quem já está logado é enviado para `/perfil`.
- Importante: isso é **conveniência de interface**. A segurança real está na API, que valida o token em toda chamada protegida, mesmo que alguém burle o front.

**Como o front alcança a API em cada ambiente**

| Ambiente | `VITE_API_URL` | Caminho da requisição |
|---|---|---|
| Desenvolvimento | `http://localhost:3000/api` | Navegador → API (usa CORS, origem `localhost:5173` liberada). |
| Docker Compose | `http://localhost:3000/api` (embutido no build) | Navegador → API. |
| Vercel (produção) | `/api` | Navegador → mesmo domínio do site → *rewrite* da Vercel → função da API. Sem CORS. |

## 9. REST, HTTP e OpenAPI — os conceitos por trás da API

### 9.1 O que é uma API REST

**API** (*Application Programming Interface*) é o conjunto de operações que um programa oferece a outros programas. **REST** (*Representational State Transfer*, "transferência de estado representacional", Roy Fielding, 2000) é um **estilo de arquitetura** para construir essas APIs sobre o **HTTP**. REST não é um protocolo nem uma biblioteca: é um conjunto de regras de projeto.

Leitura do nome, aplicada ao projeto:

| Termo | Significado | Exemplo aqui |
|---|---|---|
| **Recurso** | Qualquer "coisa" do sistema que tem um endereço. | O perfil do usuário logado: `/api/perfis/me`. |
| **Representação** | Uma "fotografia" do estado do recurso em um formato (JSON). O cliente nunca recebe o recurso em si (a linha do banco), só a sua representação. | `{ "nome": "Maria", "carreira": "Analista", ... }` |
| **Transferência** | A representação **viaja** entre cliente e servidor por HTTP. | `GET` traz o estado atual; `PATCH`/`PUT` envia o estado desejado. |
| **Estado** | Os dados do recurso em um momento. | O perfil antes e depois da edição. |

Ou seja: o WebApp não "executa código dentro do servidor" nem lê o banco. Ele **pede** o estado do perfil, o usuário **edita** a cópia na tela, e o WebApp **devolve** o novo estado; o servidor valida e atualiza o banco.

```
GET   /api/perfis/me   →  200 + JSON do perfil          (transfere o estado atual para o cliente)
PATCH /api/perfis/me   ←  JSON com os campos alterados   (transfere o novo estado para o servidor)
                       →  200 + JSON do perfil atualizado
```

### 9.2 As restrições do REST e como o projeto as aplica

| Restrição | Ideia | No projeto |
|---|---|---|
| **Cliente–servidor** | Interface (cliente) e dados (servidor) separados. | WebApp e ms-profile são aplicações distintas (seção 3). |
| **Sem estado (*stateless*)** | Cada requisição carrega tudo que o servidor precisa para entendê-la; o servidor não guarda "memória da conversa". | O token vem em **toda** chamada (`Authorization: Bearer`). A API não mantém sessão em memória, então qualquer instância serverless atende qualquer requisição. *Nuance:* a tabela `Sessions` guarda o estado de **autenticação** (para permitir logout), e não o estado da conversa. |
| **Cacheável** | Respostas dizem se podem ser guardadas em cache. | A resposta do token usa `Cache-Control: no-store`; os arquivos estáticos do site são cacheados pela CDN. |
| **Interface uniforme** | Mesmo jeito de operar qualquer recurso: URLs que identificam recursos, verbos HTTP com significado fixo, representações padronizadas (JSON), códigos de status. | `GET/PUT/PATCH`, JSON e status 200/201/204/400/401/403/404/409. |
| **Sistema em camadas** | O cliente não sabe quantos intermediários existem. | CDN e *rewrite* da Vercel ficam entre o navegador e a API sem que o front perceba. |
| **Código sob demanda** *(opcional)* | O servidor pode enviar código executável. | O WebApp (JavaScript) é baixado e executado no navegador. |

**Nível de maturidade (modelo de Richardson):** o projeto está no **nível 2**: usa recursos (URLs), verbos HTTP e códigos de status corretos. Não implementa *HATEOAS* (nível 3, respostas com links para as próximas ações), o que é comum em APIs do mundo real.

### 9.3 HTTP na prática

**Verbos usados**

| Verbo | Intenção | É *seguro*? | É *idempotente*? | Uso no projeto |
|---|---|---|---|---|
| `GET` | Ler | Sim (não altera nada) | Sim | Buscar perfil, `/health` |
| `POST` | Criar ou executar uma ação | Não | **Não** (repetir pode criar outra conta) | Cadastro, token, logout |
| `PUT` | Substituir/atualizar o recurso | Não | Sim | Atualizar perfil |
| `PATCH` | Atualizar parcialmente | Não | Em geral sim | Atualizar perfil |
| `DELETE` | Remover | Não | Sim | (não exposto hoje) |

*Idempotente* = repetir a mesma chamada dá o mesmo resultado final (por exemplo, enviar o mesmo `PUT` duas vezes). Isso importa quando a rede falha e o cliente tenta de novo. No projeto, `PUT` e `PATCH` apontam para o mesmo tratamento (atualização dos campos enviados).

**Anatomia de uma requisição e resposta** (atualizar o perfil):

```http
PATCH /api/perfis/me HTTP/1.1
Host: emprega-brasil-web-five.vercel.app
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...        ← identifica quem pede (JWT)
Content-Type: application/json                        ← formato do corpo

{ "carreira": "Analista de Dados", "telefone": "(11) 99999-0000" }
```

```http
HTTP/1.1 200 OK                                       ← código de status
Content-Type: application/json; charset=utf-8         ← formato da resposta

{ "id": 8, "nome": "Maria", "carreira": "Analista de Dados", ... }
```

Partes de uma requisição: **método** (o quê), **URL** (em qual recurso), **cabeçalhos** (metadados como autenticação e formato) e **corpo** (os dados). A resposta traz **status**, **cabeçalhos** e **corpo**.

**Códigos de status usados**

| Faixa | Código | Quando aparece |
|---|---|---|
| 2xx sucesso | `200 OK` · `201 Created` · `204 No Content` | Leitura/atualização · cadastro · logout |
| 4xx erro do cliente | `400` dados inválidos ou `invalid_grant` · `401` sem token válido · `403` sem permissão · `404` rota ou recurso inexistente · `409` e-mail/usuário já existe | |
| 5xx erro do servidor | `500` | Falha inesperada (mensagem genérica em produção) |

**HTTPS** é o HTTP dentro de uma conexão criptografada (TLS). Sem ele, o token poderia ser lido por quem estivesse na rede, por isso é obrigatório em produção.

### 9.4 Onde o projeto é "REST puro" e onde é pragmático

| Ponto | Observação |
|---|---|
| `/perfis/me` | É um recurso *singleton*: "o perfil de quem está autenticado". Evita expor ids na URL. |
| `/auth/token`, `/auth/logout`, `/auth/register` | São mais **ações** do que recursos. Seguem convenções de OAuth 2.0 e são aceitas na prática ("REST pragmático"). |
| Formato do corpo | JSON, **exceto** o endpoint de token, que usa `application/x-www-form-urlencoded` porque o padrão OAuth 2.0 exige. |
| Versionamento | Não há `/v1`. Para evoluir sem quebrar clientes, o caminho seria `/api/v1/...`. |

### 9.5 OpenAPI / Swagger — o contrato da API

> Atenção ao nome: é **OpenAPI** (especificação de documentação de APIs), e **não** a empresa OpenAI. **Swagger** é o conjunto de ferramentas que lê essa especificação.

| Item | No projeto |
|---|---|
| **OpenAPI** | Especificação padrão (JSON/YAML) que descreve endpoints, parâmetros, corpos, respostas e autenticação. |
| **Como é gerada** | Os comentários `@openapi` escritos junto às rotas são lidos pelo `swagger-jsdoc` e viram a especificação. |
| **Swagger UI** | Página interativa em `/api/docs` (`swagger-ui-express`), onde é possível **testar** os endpoints no navegador. |
| **Especificação bruta** | `/api/docs.json`. |
| **Por que importa** | É o **contrato** entre as duas aplicações: o time do front sabe o que chamar sem ler o código do back-end; também permite gerar clientes e testes automaticamente. |

Para explorar a API: abra `/api/docs`, use *Authorize* com o `access_token` do login e execute `GET /perfis/me` ao vivo.

## 10. API REST

Base: `/api` · Documentação completa e testável em `/api/docs`.

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/health` | Não | Verifica se a API está no ar. |
| POST | `/auth/register` | Não | Cria conta. Retorna 409 se e-mail ou usuário já existirem. |
| POST | `/auth/token` | Não | Login. Retorna `access_token`, `expires_in` e dados básicos do perfil. |
| POST | `/auth/logout` | Sim | Revoga a sessão atual (204). |
| GET | `/perfis/me` | Sim | Retorna o perfil do usuário logado. |
| PUT/PATCH | `/perfis/me` | Sim | Atualiza o perfil (corpo JSON). O envio de foto ainda não está ligado à rota (ver seção 14). |
| GET | `/perfis/me/:id` | Sim | Retorna o perfil apenas se o `id` for o do próprio usuário. |

Códigos usados: `200/201/204` sucesso · `400` dados inválidos · `401` não autenticado · `403` sem permissão · `404` não encontrado · `409` conflito.

## 11. Decisões de projeto

| Decisão | Alternativas | Por quê |
|---|---|---|
| **SPA em React + API separada** | Páginas renderizadas no servidor | Separa responsabilidades, permite evoluir front e back de forma independente e reaproveitar a API em outros clientes. |
| **Arquitetura em camadas no back-end** | Tudo nos controllers | Facilita testar, manter e explicar; o SQL fica isolado nos repositórios. |
| **JWT + tabela de sessões** | JWT puro (sem estado) ou sessão em cookie | O JWT dispensa consulta ao banco para identificar o usuário, mas sozinho não pode ser cancelado. A tabela de sessões adiciona **logout real** com custo baixo. |
| **Guardar hash do token, não o token** | Guardar o JWT completo | Se o banco vazar, os tokens não podem ser reaproveitados. |
| **bcrypt com custo 12** | SHA-256 simples, MD5 | Hash lento e com *salt* embutido resiste a ataques de força bruta. |
| **MySQL (relacional)** | MongoDB | Os dados são estruturados e com relacionamentos claros (perfil ↔ sessões); o conteúdo variável cabe em colunas JSON. |
| **AWS RDS** | MySQL em contêiner, TiDB/PlanetScale | Banco gerenciado, com backup e alta disponibilidade, e contato com a nuvem de mercado. O projeto começou em outro provedor e migrou para o RDS. |
| **TLS com CA da AWS** | `rejectUnauthorized: false` | Evita ataque *man-in-the-middle*: o cliente confirma que está falando com o RDS de verdade. |
| **API como função serverless (Vercel)** | Servidor sempre ligado (Render, EC2) | Sem servidor para manter, deploy em um comando e plano gratuito suficiente para o projeto. O `server.js` continua existindo para Docker/Kubernetes. |
| **Rewrite `/api` → back-end no mesmo domínio** | CORS entre `*.vercel.app` | Cada deploy do front gera uma URL nova; liberar todas exigiria `*` no CORS (inseguro). Com o rewrite o navegador fala só com um domínio, sem CORS e sem URL fixa da API no código do front. |
| **CORS com lista exata, sem `*`** | `origin: '*'` | Só as origens conhecidas podem chamar a API a partir de um navegador. |
| **Docker + Compose** | Instalar tudo na máquina | Ambiente reproduzível: `docker compose up` sobe o sistema inteiro. |
| **Kubernetes (manifests em `k8s/`)** | Somente Vercel | Mostra um caminho de implantação em cluster próprio (Deployments, Service, Ingress com TLS, PVC para as fotos). Os manifests foram validados com `kubectl kustomize`, mas ainda não foram aplicados em um cluster. |
| **Swagger/OpenAPI** | Documento estático | A documentação nasce dos comentários nas rotas e é testável no navegador. |
| **Script `deploy_vercel.sh`** | Cliques no painel | Deploy repetível: cria projetos, configura variáveis, publica e roda um teste de fumaça. |

## 12. Como executar

### Pré-requisitos
Node.js 22+, Docker (opcional) e acesso a um MySQL (o do RDS ou um local).

### Opção A — Docker Compose (recomendada)

```bash
cp backend/ms-profile/.env.example backend/ms-profile/.env   # preencha DB_*, JWT_SECRET
docker compose up --build
```

- Front: http://localhost:8080
- API: http://localhost:3000/api/health · Swagger: http://localhost:3000/api/docs

Para usar um MySQL local em vez do RDS: ajuste no `.env` `DB_HOST=mysql` e `DB_SSL=false`, e rode `docker compose --profile local up --build`.

### Opção B — Sem Docker

```bash
# API
cd backend/ms-profile && npm install && npm run dev      # http://localhost:3000

# Front (outro terminal)
cd frontend && npm install && npm run dev                # http://localhost:5173
```

### Variáveis de ambiente do back-end

| Variável | Descrição |
|---|---|
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | Conexão com o MySQL |
| `DB_SSL` / `DB_SSL_CA` | TLS ligado por padrão; caminho do certificado da AWS |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Segredo e validade do token (padrão 1 h) |
| `CORS_ORIGINS` | Origens permitidas, separadas por vírgula |
| `BASE_URL` | URL pública da API (usada para montar o endereço das fotos) |

### Criar o banco
Execute `backend/ms-profile/docker/mysql/init.sql` no MySQL (ele cria o `perfil_db` e as tabelas).

## 13. Deploy

**Vercel (produção atual):**

```bash
vercel login
./deploy_vercel.sh
```

O script cria os dois projetos (API e front), define as variáveis de ambiente, publica, configura o rewrite e executa um teste de fumaça (cadastro, login e acesso ao front).

**Kubernetes:** veja [`k8s/README.md`](k8s/README.md) (namespace, ConfigMap, Secret, PVC, Deployments, Ingress).

## 14. Limitações conhecidas e próximos passos

| Item | Situação | Próximo passo |
|---|---|---|
| **Foto de perfil** | O middleware `uploadFoto` existe, mas não está ligado às rotas `PUT/PATCH /perfis/me`; enviar foto (multipart) não grava os dados. A edição dos demais campos funciona (JSON). Além disso, o disco da Vercel é temporário. | Ligar o middleware à rota e gravar `avatar_url`; em produção, usar armazenamento de objetos (Amazon S3 ou Vercel Blob). |
| **Acesso ao RDS** | A Vercel não tem IP fixo, então o Security Group fica aberto à internet (protegido por senha e TLS). | RDS Proxy + VPC, ou IP estático/Secure Compute da Vercel, ou hospedar a API na própria AWS. |
| **Conexões por função** | Cada instância serverless abre seu próprio pool no banco. | Reduzir o `connectionLimit` e usar o RDS Proxy. |
| **Testes automatizados** | Foram feitos testes manuais e um teste ponta a ponta com navegador; não há suíte versionada. | Testes unitários (Jest) e E2E (Playwright) no CI. |
| **Proteção contra força bruta** | Não há limite de tentativas de login. | `express-rate-limit` nas rotas de autenticação. |
| **Recuperação de senha / e-mail** | Não implementado. | Fluxo de redefinição por e-mail. |
| **Página de vagas** | Lista estática de plataformas. | Integrar uma API de vagas e favoritar/candidatar-se. |

## 15. Perguntas frequentes (FAQ)

**Arquitetura e REST**

| Pergunta provável | Resposta curta |
|---|---|
| *O que é REST?* | Um estilo de arquitetura para APIs sobre HTTP: o cliente pede ou envia **representações** (JSON) de **recursos** (como o perfil) usando verbos HTTP, e o servidor não guarda estado da conversa. "Transferência de estado" = o estado do recurso viaja entre cliente e servidor. |
| *Qual a diferença entre REST e uma API comum?* | REST impõe regras: recursos com URL, verbos com significado fixo, status HTTP corretos, sem estado e interface uniforme. Uma "API comum" pode usar HTTP de qualquer jeito (por exemplo, tudo em `POST /fazerCoisa`). |
| *O que significa stateless?* | O servidor não lembra das requisições anteriores; cada chamada traz o token com tudo que ele precisa. Por isso qualquer instância da API pode atender qualquer requisição, o que combina com serverless. |
| *Então a API é 100% stateless?* | Quanto ao protocolo, sim. Guardamos só o estado de **autenticação** (tabela `Sessions`) para poder revogar o token no logout. É uma escolha consciente. |
| *PUT ou PATCH?* | `PUT` substitui o recurso; `PATCH` altera parcialmente. Aqui ambos chamam a mesma atualização parcial, uma simplificação a documentar. |
| *REST é a mesma coisa que HTTP?* | Não. HTTP é o protocolo de comunicação; REST é um estilo de usá-lo bem. |
| *REST x GraphQL x SOAP?* | SOAP: XML e contratos rígidos (comum em sistemas corporativos antigos). GraphQL: o cliente escolhe os campos em uma única rota. REST: vários endpoints simples e cacheáveis; para um CRUD de perfil, é o mais simples e direto. |
| *Por que front e back separados?* | Deploy e evolução independentes, segredos só no back-end e possibilidade de reutilizar a API (por exemplo, em um app mobile). O custo é mais configuração (CORS, dois deploys). |
| *Como os dois se comunicam?* | Por HTTP: o **axios** do WebApp chama a API do **ms-profile** trocando JSON. O contrato está em `/api/docs` (OpenAPI). |
| *O que é OpenAPI/Swagger? É OpenAI?* | Não é OpenAI. OpenAPI é a especificação que descreve a API; Swagger UI é a página para testá-la. |
| *O ms-profile é um microsserviço de verdade?* | É um serviço independente, com responsabilidade única (perfil e identidade) e banco próprio. Hoje é o único, então é um bom ponto de partida para evoluir a outros serviços. |

**Autenticação e segurança**

| Pergunta provável | Resposta curta |
|---|---|
| *Como funciona o login?* | O front envia usuário e senha para `POST /auth/token` (padrão OAuth 2.0 *password grant*). A API compara com o hash bcrypt, gera um JWT, registra a sessão e devolve o token. O front o envia em toda chamada protegida. |
| *O que é JWT?* | Um token assinado com três partes (cabeçalho, conteúdo e assinatura). A assinatura impede alterações. O conteúdo é apenas **codificado**, não criptografado, então nunca vai senha nele. |
| *Isso é OAuth mesmo?* | Implementa o contrato do endpoint de token do OAuth 2.0 (grant `password`), mas não é um servidor OAuth completo (sem `client_id`, escopos ou refresh token). |
| *Como o logout funciona se o JWT não pode ser cancelado?* | Cada token tem um `jti` registrado em `Sessions`. O logout marca a sessão como revogada, e a API consulta isso a cada chamada. |
| *Por que bcrypt e não SHA-256?* | SHA-256 é rápido demais, o que ajuda quem tenta adivinhar senhas. O bcrypt é lento de propósito e já inclui *salt*. |
| *O que impede ver o perfil de outra pessoa?* | O id vem do **token**, nunca da URL. Pedir `/perfis/me/<outro id>` retorna 403. |
| *E se roubarem o token?* | Vale por 1 hora, só trafega por HTTPS e pode ser revogado. O risco real é XSS, porque o token fica no `localStorage`. A melhoria seria cookie `HttpOnly` e refresh token. |
| *Por que login errado devolve 400 e não 401?* | O RFC do OAuth 2.0 define `400 invalid_grant` para credenciais inválidas no endpoint de token. O `401` é para rotas protegidas sem token válido. |
| *Como evitam SQL Injection?* | Toda consulta usa parâmetros (`pool.execute`), então os valores nunca viram parte do SQL. |
| *O que é CORS e por que não liberar todas as origens (curinga)?* | É a regra do navegador que bloqueia chamadas entre origens diferentes, a menos que o servidor autorize. Liberar tudo permitiria que qualquer site chame a API. Em produção evitamos o problema: a API é servida pelo mesmo domínio do site (*rewrite*). |
| *O sistema é seguro?* | Cobre o essencial (hash, JWT assinado, revogação, TLS, autorização). Faltam *rate limit*, `helmet`, validação ao atualizar perfil e cookie `HttpOnly`; estão listados nas seções 7.6 e 14. |

**Infraestrutura e escolhas**

| Pergunta provável | Resposta curta |
|---|---|
| *Por que Vercel e serverless?* | Deploy simples, sem servidor para manter e plano gratuito. Limitações: disco temporário (fotos) e conexões ao banco por instância. |
| *Por que MySQL e não MongoDB?* | Dados estruturados e com relacionamento (perfil e sessões); as listas variáveis ficam em colunas JSON. |
| *Por que AWS RDS?* | Banco gerenciado (backup, atualização) e experiência com a nuvem usada no mercado. A conexão usa TLS validando a CA da AWS. |
| *Docker e Kubernetes foram usados em produção?* | Docker Compose roda o sistema local. Os manifests do Kubernetes estão prontos e foram validados, mas **não foram aplicados em um cluster**. A produção está na Vercel. |
| *Como testaram?* | Testes manuais, testes de API com `curl` e um teste ponta a ponta com navegador automatizado (Playwright). Não há suíte versionada; está na lista de melhorias. |
| *O que melhorariam primeiro?* | Upload de foto em armazenamento de objetos (S3), *rate limit* e `helmet`, cookie `HttpOnly` com refresh token, testes automatizados e RDS Proxy. |

### Glossário rápido

| Termo | Em uma linha |
|---|---|
| **HTTP / HTTPS** | Protocolo de comunicação da web / versão criptografada com TLS. |
| **Endpoint** | URL + verbo que executa uma operação (ex.: `POST /api/auth/token`). |
| **JSON** | Formato de texto para trocar dados (`{"nome": "Maria"}`). |
| **SPA** | *Single Page Application*: o JavaScript monta as telas no navegador, sem recarregar a página. |
| **CRUD** | Create, Read, Update, Delete: as quatro operações básicas sobre dados. |
| **Token** | Credencial que prova quem é o usuário em cada requisição. |
| **Hash** | Resumo irreversível de um dado (usado para senhas). |
| **Serverless** | Código que roda sob demanda, sem servidor fixo a gerenciar. |
| **CORS** | Regra do navegador para chamadas entre domínios diferentes. |
| **Rewrite** | A plataforma repassa uma URL para outro destino sem o navegador perceber. |