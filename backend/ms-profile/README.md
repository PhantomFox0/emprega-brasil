# Perfil API — Node.js, Express e MySQL

CRUD de **Perfil** e **Habilidades** com arquitetura em camadas, Docker na raiz e pronto para rodar no VS Code.

## Como rodar com Docker
1. `cp .env.example .env`
2. `docker compose up -d --build`
3. Acesse `http://localhost:3000/api/health`

## Endpoints
- `GET /api/health`
- `GET /api/perfis`
- `GET /api/perfis/:id`
- `POST /api/perfis`
- `PUT / PATCH /api/perfis/:id`
- `DELETE /api/perfis/:id`
