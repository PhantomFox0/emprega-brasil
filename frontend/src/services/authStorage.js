// Guarda a sessão (token + validade + dados básicos do usuário) no navegador.
// Limitação conhecida: localStorage é legível por qualquer script da página (risco em caso de XSS).
// O backend atual não emite refresh token nem cookie HttpOnly, então esta é a opção mais simples.
export const AUTH_STORAGE_KEY = 'emprega.auth';

export function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session?.token || !session?.expiresAt || session.expiresAt <= Date.now()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // armazenamento indisponível (modo privado, cota cheia): a sessão vale só até recarregar a página
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // nada a fazer
  }
}

export function getToken() {
  return readSession()?.token ?? null;
}
