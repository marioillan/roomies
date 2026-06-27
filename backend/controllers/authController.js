import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../src/config/db.js';
import { registroSchema, loginSchema } from '../validators/authValidator.js';

// ── Google OAuth clients ──────────────────────────────────────
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const CALENDAR_REDIRECT_URI =
  process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:3000/api/auth/google/calendar/callback';

const calendarClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  CALENDAR_REDIRECT_URI
);

// ── Helpers de token ──────────────────────────────────────────
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setTokenCookie = (res, userId) => {
  res.cookie('token', generateToken(userId), COOKIE_OPTIONS);
};

// ── POST /api/auth/registro ───────────────────────────────────
export const registro = async (req, res, next) => {
  const parsed = registroSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }
  const { nombre, email, password } = parsed.data;

  try {
    const existente = await prisma.usuario.findFirst({
      where: { email },
      select: { id: true },
    });
    if (existente) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = randomUUID();

    const nuevoUsuario = await prisma.usuario.create({
      data: { id, nombre, email, password: passwordHash },
      select: {
        id: true,
        nombre: true,
        email: true,
        foto_perfil: true,
        fecha_registro: true,
      },
    });

    setTokenCookie(res, id);
    res.status(201).json({ user: nuevoUsuario });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
export const login = async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }
  const { email, password } = parsed.data;

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { email },
      select: {
        id: true,
        nombre: true,
        email: true,
        password: true,
        foto_perfil: true,
        fecha_registro: true,
      },
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    if (!usuario.password) {
      return res.status(400).json({ message: 'Esta cuenta usa Google para iniciar sesión' });
    }

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    setTokenCookie(res, usuario.id);
    res.status(200).json({
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        foto_perfil: usuario.foto_perfil,
        fecha_registro: usuario.fecha_registro,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/google ──────────────────────────────────────
export const googleAuth = (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
  });
  res.redirect(url);
};

// ── GET /api/auth/google/callback ─────────────────────────────
export const googleCallback = async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error || !code) {
    return res.redirect(`${frontendUrl}?auth_error=google_denied`);
  }

  try {
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name: nombre } = payload;

    const usuarioExistente = await prisma.usuario.findFirst({
      where: { OR: [{ google_id: googleId }, { email }] },
      select: { id: true, google_id: true },
    });

    let userId;
    let esNuevo = false;

    if (!usuarioExistente) {
      userId = randomUUID();
      await prisma.usuario.create({
        data: { id: userId, nombre, email, google_id: googleId },
      });
      esNuevo = true;
    } else {
      userId = usuarioExistente.id;
      if (!usuarioExistente.google_id) {
        await prisma.usuario.update({
          where: { id: userId },
          data: { google_id: googleId, updated_at: new Date() },
        });
      }
    }

    setTokenCookie(res, userId);
    res.redirect(`${frontendUrl}?auth=${esNuevo ? 'google_new' : 'success'}`);
  } catch (err) {
    console.error('Error en /google/callback:', err);
    res.redirect(`${frontendUrl}?auth_error=server`);
  }
};

// ── GET /api/auth/google/calendar ────────────────────────────
export const googleCalendar = (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'No autenticado' });

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }

  const url = calendarClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: userId,
  });
  res.redirect(url);
};

// ── GET /api/auth/google/calendar/callback ────────────────────
export const googleCalendarCallback = async (req, res) => {
  const { code, error, state: userId } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error || !code) {
    return res.redirect(`${frontendUrl}/grupo?calendar_error=denied`);
  }

  if (!userId) {
    return res.redirect(`${frontendUrl}/grupo?calendar_error=no_session`);
  }

  try {
    const { tokens } = await calendarClient.getToken(code);
    await prisma.usuario.update({
      where: { id: userId },
      data: { google_calendar_token: JSON.stringify(tokens), updated_at: new Date() },
    });
    res.redirect(`${frontendUrl}/grupo?calendar=connected`);
  } catch (err) {
    console.error('Error en /google/calendar/callback:', err);
    res.redirect(`${frontendUrl}/grupo?calendar_error=server`);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
export const me = async (req, res, next) => {
  try {
    // BOOL_OR requiere SQL raw porque Prisma no soporta agregaciones booleanas directas
    const rows = await prisma.$queryRaw`
      SELECT u.id, u.nombre, u.email, u.foto_perfil, u.fecha_registro, u.google_calendar_token,
             BOOL_OR(mg.es_casero) AS es_casero
      FROM usuarios u
      LEFT JOIN miembros_grupo mg ON mg.usuario_id = u.id AND mg.activo = TRUE
      WHERE u.id = ${req.userId}
      GROUP BY u.id
    `;

    if (rows.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });
    const u = rows[0];
    res.json({
      user: {
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        foto_perfil: u.foto_perfil,
        fecha_registro: u.fecha_registro,
        tiene_calendar: !!u.google_calendar_token,
        es_casero: !!u.es_casero,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────
export const logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.status(200).json({ message: 'Sesión cerrada' });
};
