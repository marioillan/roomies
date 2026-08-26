import express from 'express';
import { requireAuth, requireMiembro, requireInquilino, requireAdmin } from '../src/middleware/auth.js';
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
  eliminarMiembro,
  getSolicitudesUnion,
  aceptarSolicitudUnion,
  rechazarSolicitudUnion,
} from '../controllers/gruposController.js';

const router = express.Router();

router.post('/unirse',                      requireAuth,                                        unirseGrupo);
router.post('/crear',                       requireAuth,                                        crearGrupo);
router.put('/editar',                       requireAuth, requireAdmin,                          editarGrupo);
router.get('/mis-grupos',                   requireAuth,                                        getMisGrupos);
router.get('/mi-grupo',                     requireAuth,                                        getMiGrupo);
router.get('/convivencia',                  requireAuth, requireMiembro,                        getConvivencia);
router.put('/convivencia',                  requireAuth, requireAdmin,                          editarConvivencia);
router.get('/publicacion',                  requireAuth, requireMiembro,                        getPublicacion);
router.put('/publicacion',                  requireAuth, requireAdmin,                          editarPublicacion);
router.patch('/publicacion/visible',         requireAuth, requireAdmin,                          actualizarVisibilidad);
router.delete('/publicacion',               requireAuth, requireAdmin,                          eliminarPublicacion);
router.put('/publicacion/fotos',            requireAuth, requireAdmin, upload.array('fotos', 10), subirFotosPublicacion);
router.delete('/publicacion/fotos/:fotoId', requireAuth, requireAdmin,                          eliminarFotoPublicacion);
router.put('/foto',                         requireAuth, requireAdmin, upload.single('foto'),    subirFotoGrupo);
router.get('/eventos',                      requireAuth, requireMiembro,                       getEventos);
router.post('/eventos',                     requireAuth, requireInquilino,                        crearEvento);
router.put('/eventos/:id',                  requireAuth, requireInquilino,                        editarEvento);
router.delete('/eventos/:id',               requireAuth, requireInquilino,                        eliminarEvento);
router.get('/intereses',                                                                        getIntereses);
router.get('/mis-intereses',                requireAuth, requireMiembro,                      getMisIntereses);
router.put('/intereses',                    requireAuth, requireAdmin,                          editarIntereses);
router.post('/transferir-admin',            requireAuth, requireAdmin,                          transferirAdmin);
router.delete('/salir',                     requireAuth, requireMiembro,                        salirGrupo);
router.delete('/miembros/:usuarioId',       requireAuth, requireAdmin,                          eliminarMiembro);
router.get('/solicitudes-union',            requireAuth, requireAdmin,                          getSolicitudesUnion);
router.put('/solicitudes-union/:solicitudId/aceptar',  requireAuth, requireAdmin,               aceptarSolicitudUnion);
router.put('/solicitudes-union/:solicitudId/rechazar', requireAuth, requireAdmin,               rechazarSolicitudUnion);

export default router;
