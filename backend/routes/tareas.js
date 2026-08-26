import express from 'express';
import { requireAuth, requireInquilino, requireAdmin } from '../src/middleware/auth.js';
import {
  getTareas,
  iniciarTareas,
  añadirZona,
  eliminarZona,
  toggleEstadoTurno,
} from '../controllers/tareasController.js';

const router = express.Router();

router.get('/',                    requireAuth, requireInquilino, getTareas);
router.post('/iniciar',            requireAuth, requireAdmin,   iniciarTareas);
router.post('/zonas',              requireAuth, requireAdmin,   añadirZona);
router.delete('/zonas/:id',        requireAuth, requireAdmin,   eliminarZona);
router.patch('/turnos/:id/estado', requireAuth, requireInquilino, toggleEstadoTurno);

export default router;
