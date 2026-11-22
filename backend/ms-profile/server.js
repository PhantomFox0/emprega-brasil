const app = require("./src/app");
const env = require("./src/config/env");
const { testConnection } = require("./src/config/database");
(async () => {
  try {
    await testConnection();
    console.log("Conexão com o MySQL estabelecida com sucesso.");
    app.listen(env.port, () => console.log("Servidor rodando em http://localhost:" + env.port));
  } catch (err) {
    console.error("Falha ao iniciar o servidor:", err.message);
    process.exit(1);
  }
})();
