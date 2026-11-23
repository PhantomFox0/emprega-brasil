import express from "express";
import cors from "cors";
import "dotenv/config";
import pool from "./db.js";
import crypto from "node:crypto";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origem não permitida pelo CORS"));
    },
  })
);

app.use(express.json({ limit: "8mb" }));

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
// Usa crase/backticks em `plat_endereco` por causa do caractere acentuado
app.get("/api/plataformas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT plat_id, plat_nome, `plat_endereco`, plat_desc FROM plataformas ORDER BY plat_id ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar plataformas:", error);
    res.status(500).json({ erro: "Erro ao buscar plataformas" });
  }
});

app.post("/api/plataformas", async (req, res) => {
  const { plat_nome, plat_desc } = req.body;
  const platEndereco = req.body["plat_endereco"] ?? req.body.plat_endereco;

  if (!plat_nome || !platEndereco) {
    return res.status(400).json({
      erro: "Campos obrigatórios: plat_nome e plat_endereco.",
    });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO plataformas (plat_nome, `plat_endereco`, plat_desc) VALUES (?, ?, ?)",
      [plat_nome.trim(), String(platEndereco).trim(), plat_desc?.trim() || null]
    );

    res.status(201).json({
      plat_id: result.insertId,
      plat_nome: plat_nome.trim(),
      "plat_endereco": String(platEndereco).trim(),
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

// ================= CADASTRO =================
function gerarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function parseJsonArray(valor) {
  if (Array.isArray(valor)) return valor;
  if (!valor) return [];
  try {
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatarUsuarioResposta(row) {
  return {
    id: row.user_id,
    nome: row.user_nome || "",
    email: row.user_email || "",
    usuario: row.user_usuario || "",
    telefone: row.user_telefone || "",
    escolaridade: row.user_escolaridade || "",
    carreira: row.user_carreira || "",
    area_interesse: row.user_area_inter || "",
    avatar_url: row.user_avatar_url || "",
    habilidades_texto: row.user_habilidades_texto || "",
    competencias_tecnicas: parseJsonArray(row.user_competencias_tecnicas),
    competencias_comportamentais: parseJsonArray(row.user_competencias_comportamentais),
  };
}

// 1. Cadastrar novo usuário
app.post("/api/usuarios/cadastro", async (req, res) => {
  try {
    const { nome, email, usuario, senha } = req.body || {};

    if (!nome || nome.trim().length < 2) {
      return res.status(400).json({ error: "Informe seu nome completo." });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "Informe um e-mail válido." });
    }
    if (!usuario || !/^[a-zA-Z0-9._-]{3,30}$/.test(usuario.trim())) {
      return res.status(400).json({ error: "Nome de usuário inválido." });
    }
    if (!senha || senha.length < 8 || senha.length > 72) {
      return res.status(400).json({ error: "A senha deve ter de 8 a 72 caracteres." });
    }

    const senhaHash = gerarHashSenha(senha);

    const [result] = await pool.query(
      `INSERT INTO usuarios
        (user_nome, user_email, user_usuario, user_senha_hash, user_competencias_tecnicas, user_competencias_comportamentais)
       VALUES (?, ?, ?, ?, '[]', '[]')`,
      [nome.trim(), email.trim().toLowerCase(), usuario.trim(), senhaHash]
    );

    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE user_id = ?",
      [result.insertId]
    );

    return res.status(201).json(formatarUsuarioResposta(rows[0]));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      if (error.message.includes("user_email")) {
        return res.status(409).json({ error: "Este e-mail já está cadastrado." });
      }
      if (error.message.includes("user_usuario")) {
        return res.status(409).json({ error: "Este nome de usuário já está em uso." });
      }
      return res.status(409).json({ error: "E-mail ou usuário já cadastrado." });
    }

    console.error("Erro ao cadastrar usuário:", error);
    return res.status(500).json({ error: "Erro interno ao criar conta." });
  }
});

// 2. Buscar dados do perfil pelo ID do usuário
app.get("/api/usuarios/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID de usuário inválido." });
    }

    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE user_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.json(formatarUsuarioResposta(rows[0]));
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ error: "Erro interno ao carregar perfil." });
  }
});

// 3. Atualizar dados do perfil no banco
app.put("/api/usuarios/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID de usuário inválido." });
    }

    const {
      nome,
      email,
      telefone = "",
      escolaridade = "",
      carreira = "",
      area_interesse = "",
      avatar_url = "",
      habilidades_texto = "",
      competencias_tecnicas = [],
      competencias_comportamentais = [],
    } = req.body || {};

    if (!nome || nome.trim().length < 2) {
      return res.status(400).json({ error: "O nome é obrigatório." });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "Informe um e-mail válido." });
    }

    await pool.query(
      `UPDATE usuarios SET
        user_nome = ?,
        user_email = ?,
        user_telefone = ?,
        user_escolaridade = ?,
        user_carreira = ?,
        user_area_inter = ?,
        user_avatar_url = ?,
        user_habilidades_texto = ?,
        user_competencias_tecnicas = ?,
        user_competencias_comportamentais = ?
      WHERE user_id = ?`,
      [
        nome.trim(),
        email.trim().toLowerCase(),
        telefone.trim(),
        escolaridade.trim(),
        carreira.trim(),
        area_interesse.trim(),
        avatar_url,
        habilidades_texto,
        JSON.stringify(Array.isArray(competencias_tecnicas) ? competencias_tecnicas : []),
        JSON.stringify(Array.isArray(competencias_comportamentais) ? competencias_comportamentais : []),
        id,
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE user_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.json(formatarUsuarioResposta(rows[0]));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Este e-mail já está em uso por outra conta." });
    }
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ error: "Erro interno ao salvar perfil." });
  }
});