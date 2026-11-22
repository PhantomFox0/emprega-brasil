// Converte erros do axios em mensagens para o usuário.
// O backend responde { error } nas rotas comuns e { error, error_description } no endpoint OAuth2.
export function getErrorMessage(error, fallback = 'Algo deu errado. Tente novamente.') {
  if (!error?.response) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
  }

  const data = error.response.data;
  if (data?.error_description) return data.error_description;
  if (typeof data?.error === 'string') return data.error;
  return fallback;
}
