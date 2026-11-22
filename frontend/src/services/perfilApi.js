import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

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

export const perfilApi = {
  listar: async () => {
    const response = await api.get('/perfis');
    return response.data.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/perfis/${id}`);
    return response.data.data;
  },

  criar: async (payload) => {
    const body = payload.foto instanceof File ? buildPerfilFormData(payload) : payload;
    const response = await api.post('/perfis', body);
    return response.data;
  },

  atualizar: async (id, payload) => {
    const body = payload.foto instanceof File ? buildPerfilFormData(payload) : payload;
    const response = await api.put(`/perfis/${id}`, body);
    return response.data;
  },

  remover: async (id) => {
    const response = await api.delete(`/perfis/${id}`);
    return response.data;
  },
};

export default api;