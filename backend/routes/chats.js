import express from 'express';
import { requireAuth, requireAdmin } from '../src/middleware/auth.js';
import {
  solicitarContacto,
  getSolicitudes,
  gestionarSolicitud,
  getMisSolicitudes,
  getChatsComoSolicitante,
  getChatsComoAdmin,
  getMensajes,
  cerrarChat,
  enviarMensaje,
} from '../controllers/chatsController.js';

const router = express.Router();

router.post('/solicitar/:publicacionId',      requireAuth, solicitarContacto);
router.get('/solicitudes',                    requireAuth, requireAdmin, getSolicitudes);
router.put('/solicitudes/:solicitudId',       requireAuth, gestionarSolicitud);
router.get('/mis-solicitudes',                requireAuth, getMisSolicitudes);
router.get('/como-solicitante',               requireAuth, getChatsComoSolicitante);
router.get('/como-admin',                     requireAuth, getChatsComoAdmin);
router.get('/:chatId/mensajes',               requireAuth, getMensajes);
router.delete('/:chatId',                     requireAuth, cerrarChat);
router.post('/:chatId/mensajes',              requireAuth, enviarMensaje);

export default router;
