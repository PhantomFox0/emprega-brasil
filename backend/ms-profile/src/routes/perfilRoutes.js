const { Router } = require('express');
const perfilController = require('../controllers/perfilController');
const { uploadFoto } = require('../middlewares/uploadFoto');
const {
  validateIdParam,
  validateCreatePerfil,
  validateUpdatePerfil,
} = require('../middlewares/validatePerfil');

const router = Router();

router.get('/', perfilController.index);
router.get('/:id', validateIdParam, perfilController.show);
router.post('/', uploadFoto, validateCreatePerfil, perfilController.store);
router.put('/:id', validateIdParam, uploadFoto, validateUpdatePerfil, perfilController.update);
router.patch('/:id', validateIdParam, uploadFoto, validateUpdatePerfil, perfilController.update);
router.post('/:id/foto', validateIdParam, uploadFoto, perfilController.update);
router.delete('/:id', validateIdParam, perfilController.destroy);

module.exports = router;