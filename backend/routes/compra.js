import express from 'express';
import { requireAuth, requireMiembro } from '../src/middleware/auth.js';
import {
  getProductos,
  añadirProducto,
  toggleComprado,
  editarProducto,
  eliminarProducto,
} from '../controllers/compraController.js';

const router = express.Router();

router.get('/',               requireAuth, requireMiembro, getProductos);
router.post('/',              requireAuth, requireMiembro, añadirProducto);
router.patch('/:id/comprado', requireAuth, requireMiembro, toggleComprado);
router.put('/:id',            requireAuth, requireMiembro, editarProducto);
router.delete('/:id',         requireAuth, requireMiembro, eliminarProducto);

export default router;
