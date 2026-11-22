require('dotenv').config();

const rawOrigins =
  process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3001';

const port = Number(process.env.PORT) || 3000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não definido. Configure a variável no .env (e no docker-compose).');
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  baseUrl: process.env.BASE_URL || `http://localhost:${port}`,
  corsOrigins: rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'meu_usuario',
    password: process.env.DB_PASSWORD || 'SenhaForte@123',
    database: process.env.DB_NAME || 'perfil_db',
  },
};

module.exports = env;