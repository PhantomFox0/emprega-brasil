#!/usr/bin/env bash
# Deploy completo (backend + frontend) na Vercel.
#
# Uso:
#   vercel login            # uma vez (ou exporte VERCEL_TOKEN)
#   ./deploy_vercel.sh
#
# Variáveis opcionais:
#   API_PROJECT=emprega-brasil-api   WEB_PROJECT=emprega-brasil-web
#   VERCEL_SCOPE=<time>              (equipe da Vercel, se usar uma)
#   API_URL=... WEB_URL=...          (força as URLs públicas, se o domínio for custom)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACK="$ROOT/backend/ms-profile"
FRONT="$ROOT/frontend"
API_PROJECT="${API_PROJECT:-emprega-brasil-api}"
WEB_PROJECT="${WEB_PROJECT:-emprega-brasil-web}"

VC=(vercel)
[ -n "${VERCEL_TOKEN:-}" ] && VC+=(--token "$VERCEL_TOKEN")
[ -n "${VERCEL_SCOPE:-}" ] && VC+=(--scope "$VERCEL_SCOPE")

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
die() { printf '\033[1;31mErro: %s\033[0m\n' "$*" >&2; exit 1; }

command -v vercel >/dev/null || die "vercel CLI não encontrada (npm i -g vercel)."
"${VC[@]}" whoami >/dev/null 2>&1 || die "não autenticado. Rode 'vercel login' ou exporte VERCEL_TOKEN."
[ -f "$BACK/.env" ] || die "$BACK/.env não encontrado."

# Lê uma chave do .env sem executar o arquivo (aceita valores com símbolos)
envval() {
  grep -E "^$1=" "$BACK/.env" | tail -n1 | cut -d= -f2- | sed -E 's/^[[:space:]]+|[[:space:]]+$//g; s/^"(.*)"$/\1/; s/^'"'"'(.*)'"'"'$/\1/'
}

# Define variável de produção lendo o valor por stdin (não aparece no ps)
setenv() { # dir nome valor
  ( cd "$1" && printf '%s' "$3" | "${VC[@]}" env add "$2" --environment production --force --yes >/dev/null )
}

# Último URL https impresso pelo deploy (a CLI imprime a URL em stdout)
deploy() { # dir [args...]
  local dir="$1"; shift
  ( cd "$dir" && "${VC[@]}" deploy --prod --yes "$@" 2>deploy.err.log | grep -oE 'https://[A-Za-z0-9.-]+\.vercel\.app' | tail -n1 ) || { cat "$dir/deploy.err.log" >&2; rm -f "$dir/deploy.err.log"; die "deploy falhou em $dir"; }
}

# Alias de produção real do deployment (o nome pode ganhar sufixo: -murex, -five...)
alias_of() { # dir deployment-url
  ( cd "$1" && "${VC[@]}" inspect "$2" 2>&1 | grep -oE '╶ https://[A-Za-z0-9.-]+\.vercel\.app' | head -n1 | sed 's/^╶ //' )
}

wait_health() { # url
  for _ in $(seq 1 15); do
    if curl -fsS -m 10 "$1/api/health" >/dev/null 2>&1; then return 0; fi
    sleep 4
  done
  return 1
}

DB_PASSWORD="$(envval DB_PASSWORD)"
JWT_SECRET="$(envval JWT_SECRET)"
[ -n "$DB_PASSWORD" ] && [ -n "$JWT_SECRET" ] || die "DB_PASSWORD/JWT_SECRET ausentes no .env."


# ---------------------------------------------------------------- backend
log "Backend: vinculando projeto $API_PROJECT"
( cd "$BACK" && "${VC[@]}" link --yes --project "$API_PROJECT" >/dev/null )

log "Backend: configurando variáveis de ambiente"
setenv "$BACK" NODE_ENV production
setenv "$BACK" DB_HOST "$(envval DB_HOST)"
setenv "$BACK" DB_PORT "$(envval DB_PORT)"
setenv "$BACK" DB_USER "$(envval DB_USER)"
setenv "$BACK" DB_PASSWORD "$DB_PASSWORD"
setenv "$BACK" DB_NAME "$(envval DB_NAME)"
setenv "$BACK" DB_SSL true
setenv "$BACK" DB_SSL_CA certs/global-bundle.pem
setenv "$BACK" JWT_SECRET "$JWT_SECRET"
setenv "$BACK" JWT_EXPIRES_IN "$(envval JWT_EXPIRES_IN)"
setenv "$BACK" BASE_URL "http://localhost:3000"   # ajustado após conhecer o alias
setenv "$BACK" CORS_ORIGINS "http://localhost:5173"

log "Backend: deploy de produção"
API_DEPLOY="$(deploy "$BACK")"
echo "Deployment: $API_DEPLOY"

API_URL="$(alias_of "$BACK" "$API_DEPLOY")"; API_URL="${API_URL:-$API_DEPLOY}"
log "Backend: alias $API_URL — aguardando /api/health"
wait_health "$API_URL" || die "API não respondeu em /api/health (veja: vercel logs $API_DEPLOY). Se a proteção de deploy (SSO) estiver ativa, desative em Settings > Deployment Protection."

# ---------------------------------------------------------------- frontend
log "Frontend: vinculando projeto $WEB_PROJECT"
( cd "$FRONT" && "${VC[@]}" link --yes --project "$WEB_PROJECT" >/dev/null )

# A API é servida pelo mesmo domínio do frontend (rewrite /api e /fotos -> backend):
# o navegador não faz requisição entre origens, então funciona em qualquer URL de deployment.
log "Frontend: vercel.json com rewrite para $API_URL e VITE_API_URL=/api"
cat > "$FRONT/vercel.json" <<JSON
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "$API_URL/api/:path*" },
    { "source": "/fotos/:path*", "destination": "$API_URL/fotos/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
JSON
setenv "$FRONT" VITE_API_URL "/api"

log "Frontend: deploy de produção"
WEB_DEPLOY="$(deploy "$FRONT" --build-env "VITE_API_URL=/api")"
echo "Deployment: $WEB_DEPLOY"

WEB_URL="$(alias_of "$FRONT" "$WEB_DEPLOY")"; WEB_URL="${WEB_URL:-$WEB_DEPLOY}"
echo "Alias do frontend: $WEB_URL"

# ---------------------------------------------------------------- BASE_URL / CORS
# Com o rewrite o front fala com a API pelo próprio domínio (sem CORS); a lista abaixo cobre
# o acesso direto ao alias e o desenvolvimento local. Sem wildcard.
log "Backend: BASE_URL e CORS_ORIGINS exatos + redeploy"
setenv "$BACK" BASE_URL "$API_URL"
setenv "$BACK" CORS_ORIGINS "$WEB_URL,http://localhost:5173"
deploy "$BACK" >/dev/null
wait_health "$API_URL" || die "API não respondeu após atualizar BASE_URL/CORS."

# ---------------------------------------------------------------- teste de fumaça
log "Teste de fumaça"
U="smoke$RANDOM$RANDOM"
curl -fsS -m 20 -X POST "$WEB_URL/api/auth/register" -H 'Content-Type: application/json' \
  -d "{\"nome\":\"Smoke\",\"email\":\"$U@example.com\",\"usuario\":\"$U\",\"senha\":\"Smoke12345\"}" >/dev/null \
  && echo "register OK" || echo "register FALHOU"
curl -fsS -m 20 -X POST "$WEB_URL/api/auth/token" --data-urlencode "grant_type=password" \
  --data-urlencode "username=$U" --data-urlencode "password=Smoke12345" | grep -q access_token \
  && echo "login OK" || echo "login FALHOU"
curl -fsS -m 20 -o /dev/null -w "frontend HTTP %{http_code}\n" "$WEB_URL" || echo "frontend FALHOU"
echo "(usuário de teste criado no banco: $U)"

log "Pronto"
echo "Frontend: $WEB_URL"
echo "API:      $API_URL/api   (docs: $API_URL/api/docs)"
