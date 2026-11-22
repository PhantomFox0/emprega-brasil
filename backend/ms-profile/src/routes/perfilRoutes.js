// src/routes/perfilRoutes.js
const express = require("express");
const perfilController = require("../controllers/perfilController");
const authenticateJwt = require("../middlewares/authenticateJwt");

const router = express.Router();

router.use(authenticateJwt);

router.get("/me", perfilController.getMeuPerfil);
router.put("/me", perfilController.updateMeuPerfil);
router.patch("/me", perfilController.updateMeuPerfil);
router.get("/me/:id", perfilController.getPerfilById);

module.exports = router;