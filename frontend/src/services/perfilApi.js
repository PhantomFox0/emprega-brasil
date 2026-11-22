import api from './api';

function buildPerfilFormData(payload) {
  const formData = new FormData();

  const camposSimples = [
    'nome',
    'email',
    'telefone',
    'escolaridade',
    'carreira',
    'area_interesse',
    'habilidades_texto',
  ];

  for (const campo of camposSimples) {
    if (payload[campo] !== undefined && payload[campo] !== null) {
      formData.append(campo, payload[campo]);
    }
  }

  if (Array.isArray(payload.competencias_tecnicas)) {
    formData.append(
      'competencias_tecnicas',
      JSON.stringify(payload.competencias_tecnicas)
    );
  }

  if (Array.isArray(payload.competencias_comportamentais)) {
    formData.append(
      'competencias_comportamentais',
      JSON.stringify(payload.competencias_comportamentais)
    );
  }

  if (payload.foto instanceof File) {
    formData.append('foto', payload.foto);
  }

  return formData;
}

// O perfil sempre é o do usuário autenticado (token Bearer): o backend não expõe mais /perfis/:id.
export const perfilApi = {
  buscarMeuPerfil: async () => {
    const response = await api.get('/perfis/me');
    return response.data;
  },

  atualizarMeuPerfil: async (payload) => {
    const body = payload.foto instanceof File ? buildPerfilFormData(payload) : payload;
    const response = await api.put('/perfis/me', body);
    return response.data;
  },
};

export default api;
