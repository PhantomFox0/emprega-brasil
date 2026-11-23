const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');

// Diretório "fotos" na raiz do backend (backend/ms-profile/fotos)
const FOTOS_DIR = path.resolve(__dirname, '..', '..', 'fotos');

try { fs.mkdirSync(FOTOS_DIR, { recursive: true }); } catch (_) { /* FS somente leitura (ex.: Vercel) */ }

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    fs.mkdirSync(FOTOS_DIR, { recursive: true });
    cb(null, FOTOS_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const baseName = path
      .basename(file.originalname || 'foto', ext)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${baseName || 'perfil'}-${uniqueSuffix}${ext}`);
  },
});

const multerUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      const err = new Error(
        'Formato de imagem inválido. Envie apenas JPG, JPEG, PNG, WEBP ou GIF.'
      );
      err.statusCode = 400;
      return cb(err);
    }
    return cb(null, true);
  },
});

/**
 * Middleware "uploadFoto":
 * Processa o campo "foto" (ou "avatar") em multipart/form-data,
 * grava o arquivo no diretório fotos/ e monta a URL de acesso em req.fotoUrl.
 */
function uploadFoto(req, res, next) {
  const singleUpload = multerUpload.single('foto');

  singleUpload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const sizeErr = new Error('A imagem deve ter no máximo 5 MB.');
        sizeErr.statusCode = 400;
        return next(sizeErr);
      }
      return next(err);
    }

    if (req.file) {
      const relativePath = `/fotos/${req.file.filename}`;
      req.fotoFile = req.file;
      req.fotoRelativePath = relativePath;
      req.fotoUrl = `${env.baseUrl}${relativePath}`;
    }

    return next();
  });
}

function removerArquivoFotoPorUrl(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== 'string') return;

  const marker = '/fotos/';
  const idx = avatarUrl.indexOf(marker);
  if (idx === -1) return;

  const fileName = path.basename(avatarUrl.slice(idx + marker.length));
  if (!fileName) return;

  const fullPath = path.join(FOTOS_DIR, fileName);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, () => {});
  }
}

module.exports = {
  FOTOS_DIR,
  uploadFoto,
  removerArquivoFotoPorUrl,
};