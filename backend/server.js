import express from "express";
import cors from "cors";
import "dotenv/config";
import pool from "./db.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// Verificação de saúde e conexão com o MySQL
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "emprega_brasil" });
  } catch (error) {
    console.error("Erro no /api/health:", error);
    res.status(500).json({ ok: false, erro: "Falha ao conectar ao MySQL" });
  }
});

// ================= USUÁRIOS =================
app.get("/api/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, user_nome, user_email, user_telefone,
              user_escolaridade, user_carreira, user_area_inter
       FROM usuarios
       ORDER BY user_id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ erro: "Erro ao buscar usuários" });
  }
});

app.post("/api/usuarios", async (req, res) => {
  const {
    user_nome,
    user_email,
    user_telefone,
    user_escolaridade,
    user_carreira,
    user_area_inter,
  } = req.body;

  if (!user_nome || !user_email || !user_telefone) {
    return res.status(400).json({
      erro: "Campos obrigatórios: user_nome, user_email e user_telefone.",
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO usuarios
        (user_nome, user_email, user_telefone, user_escolaridade, user_carreira, user_area_inter)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_nome.trim(),
        user_email.trim(),
        user_telefone.trim(),
        user_escolaridade || null,
        user_carreira?.trim() || null,
        user_area_inter?.trim() || null,
      ]
    );

    res.status(201).json({
      user_id: result.insertId,
      user_nome: user_nome.trim(),
      user_email: user_email.trim(),
      user_telefone: user_telefone.trim(),
      user_escolaridade: user_escolaridade || null,
      user_carreira: user_carreira?.trim() || null,
      user_area_inter: user_area_inter?.trim() || null,
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
});

// ================= DICAS =================
app.get("/api/dicas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT dica_id, dica_nome, dica_desc FROM dicas ORDER BY dica_id ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar dicas:", error);
    res.status(500).json({ erro: "Erro ao buscar dicas" });
  }
});

app.post("/api/dicas", async (req, res) => {
  const { dica_nome, dica_desc } = req.body;

  if (!dica_nome) {
    return res.status(400).json({ erro: "O campo dica_nome é obrigatório." });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO dicas (dica_nome, dica_desc) VALUES (?, ?)",
      [dica_nome.trim(), dica_desc?.trim() || null]
    );

    res.status(201).json({
      dica_id: result.insertId,
      dica_nome: dica_nome.trim(),
      dica_desc: dica_desc?.trim() || null,
    });
  } catch (error) {
    console.error("Erro ao criar dica:", error);
    res.status(500).json({ erro: "Erro ao criar dica" });
  }
});

// ================= PLATAFORMAS =================
// Usa crase/backticks em `plat_endereço` por causa do caractere acentuado
app.get("/api/plataformas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT plat_id, plat_nome, `plat_endereço`, plat_desc FROM plataformas ORDER BY plat_id ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar plataformas:", error);
    res.status(500).json({ erro: "Erro ao buscar plataformas" });
  }
});

app.post("/api/plataformas", async (req, res) => {
  const { plat_nome, plat_desc } = req.body;
  const platEndereco = req.body["plat_endereço"] ?? req.body.plat_endereco;

  if (!plat_nome || !platEndereco) {
    return res.status(400).json({
      erro: "Campos obrigatórios: plat_nome e plat_endereço.",
    });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO plataformas (plat_nome, `plat_endereço`, plat_desc) VALUES (?, ?, ?)",
      [plat_nome.trim(), String(platEndereco).trim(), plat_desc?.trim() || null]
    );

    res.status(201).json({
      plat_id: result.insertId,
      plat_nome: plat_nome.trim(),
      "plat_endereço": String(platEndereco).trim(),
      plat_desc: plat_desc?.trim() || null,
    });
  } catch (error) {
    console.error("Erro ao cadastrar plataforma:", error);
    res.status(500).json({ erro: "Erro ao cadastrar plataforma" });
  }
});

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});