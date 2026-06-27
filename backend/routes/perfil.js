import express from 'express';
import { requireAuth } from '../src/middleware/auth.js';
import {
  upload,
  editarPerfil,
  subirFoto,
  getConvivencia,
  editarConvivencia,
  getPerfilPublico,
  getPreferencias,
  editarPreferencias,
  getIntereses,
  getMisIntereses,
  editarIntereses,
} from '../controllers/perfilController.js';

const router = express.Router();

router.put('/editar',            requireAuth,                     editarPerfil);
router.put('/foto',              requireAuth, upload.single('foto'), subirFoto);
router.get('/convivencia',       requireAuth,                     getConvivencia);
router.put('/convivencia',       requireAuth,                     editarConvivencia);
router.get('/publico/:userId',                                    getPerfilPublico);
router.get('/preferencias',      requireAuth,                     getPreferencias);
router.put('/preferencias',      requireAuth,                     editarPreferencias);
router.get('/intereses',                                          getIntereses);
router.get('/mis-intereses',     requireAuth,                     getMisIntereses);
router.put('/intereses',         requireAuth,                     editarIntereses);

export default router;
