import express from 'express';
import { requireAuth, requireMiembro, requireCasero } from '../src/middleware/auth.js';
import {
  upload,
  getHistorial,
  getFacturas,
  crearFactura,
  editarFactura,
  togglePagada,
  eliminarFactura,
  togglePagoUsuario,
} from '../controllers/facturasController.js';

const router = express.Router();

router.get('/historial',              requireAuth, requireMiembro,                            getHistorial);
router.get('/',                       requireAuth, requireMiembro,                            getFacturas);
router.post('/',                      requireAuth, requireCasero, upload.single('documento'), crearFactura);
router.put('/:id',                    requireAuth, requireCasero, upload.single('documento'), editarFactura);
router.patch('/:id/pagada',           requireAuth, requireCasero,                            togglePagada);
router.delete('/:id',                 requireAuth, requireCasero,                            eliminarFactura);
router.patch('/:id/pagos/:usuarioId', requireAuth, requireCasero,                            togglePagoUsuario);

export default router;
