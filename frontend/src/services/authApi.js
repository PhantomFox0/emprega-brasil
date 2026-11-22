import api from './api';

export const authApi = {
  // OAuth2 Resource Owner Password Credentials: o endpoint exige application/x-www-form-urlencoded
  // (URLSearchParams faz o axios enviar nesse formato).
  login: async ({ username, password }) => {
    const body = new URLSearchParams({ grant_type: 'password', username, password });
    const response = await api.post('/auth/token', body);
    return response.data; // { access_token, token_type, expires_in, perfil }
  },

  register: async ({ nome, email, usuario, senha }) => {
    const response = await api.post('/auth/register', { nome, email, usuario, senha });
    return response.data;
  },

  // O token é enviado explicitamente porque a sessão local já foi limpa quando o logout é chamado.
  logout: async (token) => {
    await api.post('/auth/logout', null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
