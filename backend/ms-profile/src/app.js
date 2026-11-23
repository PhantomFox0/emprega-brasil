const path = require('path');
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

const allowAllOrigins = env.corsOrigins.includes('*');


const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowAllOrigins || env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    const err = new Error(`Origem não permitida pelo CORS: ${origin}`);
    err.statusCode = 403;
    return callback(err);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve as imagens salvas no diretório fotos/ do backend
app.use('/fotos', express.static(path.resolve(__dirname, '..', 'fotos')));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;