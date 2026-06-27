import express from 'express';
import {
  buscarPublicaciones,
  getPublicacion,
} from '../controllers/publicacionesController.js';

const router = express.Router();

router.get('/',    buscarPublicaciones);
router.get('/:id', getPublicacion);

export default router;
