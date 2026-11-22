import axios from 'axios';
import { clearSession, getToken } from './authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Quem cuida do estado de autenticação (AuthProvider) se registra aqui para ser avisado
// quando o backend recusar o token (expirado, revogado ou inválido).
let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const headers = error.config?.headers;
    const enviouToken = Boolean(headers?.get ? headers.get('Authorization') : headers?.Authorization);

    // 401 em rota protegida com token enviado = sessão inválida. Rotas /auth/* ficam de fora.
    if (error.response?.status === 401 && enviouToken && !url.startsWith('/auth/')) {
      clearSession();
      if (unauthorizedHandler) unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export default api;
