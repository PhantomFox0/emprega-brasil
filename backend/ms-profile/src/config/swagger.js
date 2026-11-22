const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Perfil API — Node.js, Express e MySQL',
      version: '1.0.0',
      description:
        'Documentação interativa da API RESTful para CRUD de Perfil, Escolaridade, Carreira, Área de Interesse e Habilidades (competências técnicas e comportamentais).',
    },
    servers: [
      {
        url: `http://localhost:${env.port}/api`,
        description: 'Servidor local / Docker',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Verificação de estado da API',
      },
      {
        name: 'Perfis',
        description: 'Operações CRUD de perfil e habilidades',
      },
    ],
    components: {
      schemas: {
        Perfil: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Ana Clara Silva' },
            email: { type: 'string', format: 'email', example: 'ana.silva@exemplo.com' },
            telefone: { type: 'string', nullable: true, example: '(11) 99999-0000' },
            escolaridade: { type: 'string', nullable: true, example: 'Superior Completo' },
            carreira: { type: 'string', nullable: true, example: 'Analista de Dados' },
            area_interesse: {
              type: 'string',
              nullable: true,
              example: 'Inteligência de Negócios e Backend',
            },
            avatar_url: {
              type: 'string',
              nullable: true,
              example: 'https://exemplo.com/avatar.png',
            },
            habilidades_texto: {
              type: 'string',
              nullable: true,
              example: 'Experiência prática em análise exploratória e dashboards.',
            },
            competencias_tecnicas: {
              type: 'array',
              items: { type: 'string' },
              example: ['Excel', 'Java', 'Python', 'Análise de Dados'],
            },
            competencias_comportamentais: {
              type: 'array',
              items: { type: 'string' },
              example: ['Trabalho em Equipe', 'Proatividade', 'Pensamento Crítico'],
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        PerfilCreateInput: {
          type: 'object',
          required: ['nome', 'email'],
          properties: {
            nome: { type: 'string', example: 'Lucas Mendes' },
            email: { type: 'string', format: 'email', example: 'lucas.mendes@exemplo.com' },
            telefone: { type: 'string', example: '(11) 98888-7777' },
            escolaridade: { type: 'string', example: 'Ensino Superior Incompleto' },
            carreira: { type: 'string', example: 'Desenvolvedor Backend' },
            area_interesse: { type: 'string', example: 'Engenharia de Software e Cloud' },
            avatar_url: { type: 'string', example: 'https://exemplo.com/minha-foto.png' },
            habilidades_texto: {
              type: 'string',
              example: 'Foco em APIs REST, modelagem relacional e automação.',
            },
            competencias_tecnicas: {
              type: 'array',
              items: { type: 'string' },
              example: ['Excel', 'Java', 'Python', 'Análise de Dados'],
            },
            competencias_comportamentais: {
              type: 'array',
              items: { type: 'string' },
              example: ['Trabalho em Equipe', 'Proatividade', 'Pensamento Crítico'],
            },
          },
        },
        PerfilUpdateInput: {
          type: 'object',
          properties: {
            nome: { type: 'string', example: 'Lucas Mendes Atualizado' },
            email: { type: 'string', format: 'email', example: 'lucas.mendes@exemplo.com' },
            telefone: { type: 'string', example: '(11) 97777-6666' },
            escolaridade: { type: 'string', example: 'Superior Completo' },
            carreira: { type: 'string', example: 'Engenheiro de Software' },
            area_interesse: { type: 'string', example: 'Arquitetura Distribuída' },
            avatar_url: { type: 'string', example: 'https://exemplo.com/novo-avatar.png' },
            habilidades_texto: {
              type: 'string',
              example: 'Atualização do resumo de habilidades.',
            },
            competencias_tecnicas: {
              type: 'array',
              items: { type: 'string' },
              example: ['Python', 'Análise de Dados'],
            },
            competencias_comportamentais: {
              type: 'array',
              items: { type: 'string' },
              example: ['Trabalho em Equipe', 'Pensamento Crítico'],
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Perfil não encontrado.' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;