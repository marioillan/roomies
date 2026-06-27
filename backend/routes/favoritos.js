import express from 'express';
import { requireAuth } from '../src/middleware/auth.js';
import {
  getPublicacionesFavoritas,
  getFavoritos,
  toggleFavorito,
} from '../controllers/favoritosController.js';

const router = express.Router();

router.get('/publicaciones', requireAuth, getPublicacionesFavoritas);
router.get('/',              requireAuth, getFavoritos);
router.post('/:publicacionId', requireAuth, toggleFavorito);

export default router;
