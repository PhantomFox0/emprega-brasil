// src/routes/authRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const authenticateJwt = require("../middlewares/authenticateJwt");
const { validateRegister } = require("../middlewares/validateAuth");

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Cadastra um novo usuário/perfil
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, usuario, senha]
 *             properties:
 *               nome: { type: string }
 *               email: { type: string, format: email }
 *               usuario: { type: string }
 *               senha: { type: string, minLength: 8, maxLength: 72 }
 *     responses:
 *       201: { description: Perfil criado }
 *       400: { description: Dados inválidos }
 *       409: { description: E-mail ou usuário já em uso }
 */
router.post("/register", validateRegister, authController.register);

/**
 * @openapi
 * /auth/token:
 *   post:
 *     summary: Emite access token (OAuth2 Resource Owner Password)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [grant_type, username, password]
 *             properties:
 *               grant_type: { type: string, enum: [password] }
 *               username: { type: string, description: E-mail ou usuário }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Token emitido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token: { type: string }
 *                 token_type: { type: string, example: Bearer }
 *                 expires_in: { type: integer, example: 3600 }
 *       400: { description: "invalid_request, invalid_grant ou unsupported_grant_type" }
 */
router.post("/token", authController.token);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Revoga o token atual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204: { description: Sessão revogada }
 *       401: { description: Token ausente ou inválido }
 */
router.post("/logout", authenticateJwt, authController.logout);

module.exports = router;
