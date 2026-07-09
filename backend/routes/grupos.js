import express from 'express';
import { requireAuth, requireMiembro, requireAdmin } from '../src/middleware/auth.js';
import {
  upload,
  unirseGrupo,
  crearGrupo,
  editarGrupo,
  getMisGrupos,
  getMiGrupo,
  getConvivencia,
  editarConvivencia,
  getPublicacion,
  editarPublicacion,
  eliminarPublicacion,
  actualizarVisibilidad,
  subirFotosPublicacion,
  eliminarFotoPublicacion,
  subirFotoGrupo,
  getEventos,
  crearEvento,
  editarEvento,
  eliminarEvento,
  getIntereses,
  getMisIntereses,
  editarIntereses,
  transferirAdmin,
  salirGrupo,
} from '../controllers/gruposController.js';

const router = express.Router();

router.post('/unirse',                      requireAuth,                                        unirseGrupo);
router.post('/crear',                       requireAuth,                                        crearGrupo);
router.put('/editar',                       requireAuth, requireAdmin,                          editarGrupo);
router.get('/mis-grupos',                   requireAuth,                                        getMisGrupos);
router.get('/mi-grupo',                     requireAuth,                                        getMiGrupo);
router.get('/convivencia',                  requireAuth,                                        getConvivencia);
router.put('/convivencia',                  requireAuth, requireAdmin,                          editarConvivencia);
router.get('/publicacion',                  requireAuth,                                        getPublicacion);
router.put('/publicacion',                  requireAuth, requireAdmin,                          editarPublicacion);
router.patch('/publicacion/visible',         requireAuth, requireAdmin,                          actualizarVisibilidad);
router.delete('/publicacion',               requireAuth, requireAdmin,                          eliminarPublicacion);
router.put('/publicacion/fotos',            requireAuth, requireAdmin, upload.array('fotos', 10), subirFotosPublicacion);
router.delete('/publicacion/fotos/:fotoId', requireAuth, requireAdmin,                          eliminarFotoPublicacion);
router.put('/foto',                         requireAuth, requireAdmin, upload.single('foto'),    subirFotoGrupo);
router.get('/eventos',                      requireAuth,                                        getEventos);
router.post('/eventos',                     requireAuth, requireMiembro,                        crearEvento);
router.put('/eventos/:id',                  requireAuth, requireMiembro,                        editarEvento);
router.delete('/eventos/:id',               requireAuth, requireMiembro,                        eliminarEvento);
router.get('/intereses',                                                                        getIntereses);
router.get('/mis-intereses',                requireAuth,                                        getMisIntereses);
router.put('/intereses',                    requireAuth, requireAdmin,                          editarIntereses);
router.post('/transferir-admin',            requireAuth, requireAdmin,                          transferirAdmin);
router.delete('/salir',                     requireAuth, requireMiembro,                        salirGrupo);

export default router;
