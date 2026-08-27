import express from 'express';
import { requireAuth } from '../src/middleware/auth.js';
import {
  upload,
  editarPerfil,
  getFotos,
  subirFotos,
  eliminarFoto,
  getConvivencia,
  getPerfilPublico,
  getPreferencias,
  editarPreferencias,
  getIntereses,
  getMisIntereses,
  editarIntereses,
} from '../controllers/perfilController.js';

const router = express.Router();

router.put('/editar',          requireAuth,                              editarPerfil);
router.get('/fotos',           requireAuth,                              getFotos);
router.put('/fotos',           requireAuth, upload.array('fotos', 4),    subirFotos);
router.delete('/fotos/:fotoId', requireAuth,                             eliminarFoto);
router.get('/convivencia',     requireAuth,                              getConvivencia);
router.get('/publico/:userId',                                           getPerfilPublico);
router.get('/preferencias',    requireAuth,                              getPreferencias);
router.put('/preferencias',    requireAuth,                              editarPreferencias);
router.get('/intereses',                                                 getIntereses);
router.get('/mis-intereses',   requireAuth,                              getMisIntereses);
router.put('/intereses',       requireAuth,                              editarIntereses);

export default router;