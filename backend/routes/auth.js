import express from 'express';
import { requireAuth } from '../src/middleware/auth.js';
import {
  registro,
  login,
  refreshToken,
  googleAuth,
  googleCallback,
  googleCalendar,
  googleCalendarCallback,
  me,
  logout,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/registro',                  registro);
router.post('/login',                     login);
router.post('/refresh',                   refreshToken);
router.get('/google',                     googleAuth);
router.get('/google/callback',            googleCallback);
router.get('/google/calendar',            googleCalendar);
router.get('/google/calendar/callback',   googleCalendarCallback);
router.get('/me',          requireAuth,   me);
router.post('/logout',                    logout);

export default router;
