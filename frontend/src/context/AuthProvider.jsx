import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { authApi } from '../services/authApi';
import { setUnauthorizedHandler } from '../services/api';
import {
  AUTH_STORAGE_KEY,
  clearSession,
  readSession,
  saveSession,
} from '../services/authStorage';

const MAX_TIMEOUT_MS = 2_147_000_000; // limite do setTimeout (~24,8 dias)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [sessionExpired, setSessionExpired] = useState(false);
  // true depois de um logout voluntário: a rota protegida então volta para a home em vez de abrir o login
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  const encerrarPorExpiracao = useCallback(() => {
    clearSession();
    setSession(null);
    setSessionExpired(true);
  }, []);

  // O backend recusou o token (expirado, revogado...): encerra a sessão local.
  useEffect(() => {
    setUnauthorizedHandler(encerrarPorExpiracao);
    return () => setUnauthorizedHandler(null);
  }, [encerrarPorExpiracao]);

  // Encerra a sessão no momento em que o token expira, sem esperar a próxima requisição.
  useEffect(() => {
    if (!session) return undefined;
    const restante = session.expiresAt - Date.now();
    if (restante > MAX_TIMEOUT_MS) return undefined;

    const id = setTimeout(encerrarPorExpiracao, Math.max(0, restante));
    return () => clearTimeout(id);
  }, [session, encerrarPorExpiracao]);

  // Mantém várias abas sincronizadas (login ou logout em uma aba reflete nas outras).
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === AUTH_STORAGE_KEY || event.key === null) {
        setSession(readSession());
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = useCallback(async ({ username, password }) => {
    const data = await authApi.login({ username, password });
    const nova = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      perfil: data.perfil,
    };
    saveSession(nova);
    setSession(nova);
    setSessionExpired(false);
    setJustLoggedOut(false);
    return nova.perfil;
  }, []);

  const register = useCallback((dados) => authApi.register(dados), []);

  const logout = useCallback(() => {
    const token = session?.token;
    clearSession();
    setSession(null);
    setSessionExpired(false);
    setJustLoggedOut(true);
    // Revoga o token no servidor sem bloquear a interface; se falhar, o token expira sozinho.
    if (token) authApi.logout(token).catch(() => {});
  }, [session]);

  // Atualiza os dados exibidos no topo (ex.: nome) depois de editar o perfil.
  const updateUser = useCallback((parcial) => {
    const atual = readSession();
    if (!atual) return;
    const proxima = { ...atual, perfil: { ...atual.perfil, ...parcial } };
    saveSession(proxima);
    setSession(proxima);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.perfil ?? null,
      isAuthenticated: Boolean(session),
      sessionExpired,
      justLoggedOut,
      login,
      register,
      logout,
      updateUser,
    }),
    [session, sessionExpired, justLoggedOut, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
