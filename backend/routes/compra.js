import express from 'express';
import { requireAuth, requireInquilino } from '../src/middleware/auth.js';
import {
  getProductos,
  anadirProducto,
  toggleComprado,
  editarProducto,
  eliminarProducto,
} from '../controllers/compraController.js';

const router = express.Router();

router.get('/',               requireAuth, requireInquilino, getProductos);
router.post('/',              requireAuth, requireInquilino, anadirProducto);
router.patch('/:id/comprado', requireAuth, requireInquilino, toggleComprado);
router.put('/:id',            requireAuth, requireInquilino, editarProducto);
router.delete('/:id',         requireAuth, requireInquilino, eliminarProducto);

export default router;
