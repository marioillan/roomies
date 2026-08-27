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
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días en ms

const generarAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // 15 min
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: REFRESH_TOKEN_TTL_MS,
};

const setAuthCookies = async (res, userId) => {
  const nuevoRefreshToken = randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await prisma.refreshToken.create({
    data: {
      id: randomUUID(),
      token: nuevoRefreshToken,
      usuario_id: userId,
      expires_at: expiresAt,
    },
  });

  res.cookie('token', generarAccessToken(userId), ACCESS_COOKIE_OPTIONS);
  res.cookie('refresh_token', nuevoRefreshToken, REFRESH_COOKIE_OPTIONS);
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
        fecha_registro: true,
      },
    });

    await setAuthCookies(res, id);
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

    await setAuthCookies(res, usuario.id);
    res.status(200).json({
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        fecha_registro: usuario.fecha_registro,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/refresh ────────────────────────────────────
export const refreshToken = async (req, res, next) => {
  const tokenRecibido = req.cookies?.refresh_token;
  if (!tokenRecibido) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const registro = await prisma.refreshToken.findUnique({
      where: { token: tokenRecibido },
    });

    if (!registro || registro.expires_at < new Date()) {
      // Token no existe o expirado: limpiar cookies
      res.clearCookie('token', ACCESS_COOKIE_OPTIONS);
      res.clearCookie('refresh_token', REFRESH_COOKIE_OPTIONS);
      return res.status(401).json({ message: 'Sesión expirada' });
    }

    // Rotación: borrar el token actual y emitir uno nuevo
    const nuevoRefreshToken = randomUUID();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: registro.id } }),
      prisma.refreshToken.create({
        data: {
          id: randomUUID(),
          token: nuevoRefreshToken,
          usuario_id: registro.usuario_id,
          expires_at: expiresAt,
        },
      }),
    ]);

    res.cookie('token', generarAccessToken(registro.usuario_id), ACCESS_COOKIE_OPTIONS);
    res.cookie('refresh_token', nuevoRefreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ ok: true });
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

    await setAuthCookies(res, userId);
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
      SELECT u.id, u.nombre, u.email, u.fecha_registro, u.google_calendar_token,
            (SELECT COALESCE(json_agg(fu.url ORDER BY fu.orden ASC), '[]'::json)
             FROM fotos_usuario fu WHERE fu.usuario_id = u.id) AS fotos,
            BOOL_OR(mg.rol = 'CASERO') AS es_casero,
             (BOOL_OR(mg.rol = 'CASERO') OR BOOL_OR(
               p.sobre_mi IS NOT NULL AND p.genero IS NOT NULL AND p.pais IS NOT NULL AND p.fecha_nacimiento IS NOT NULL
               AND p.ocupacion IS NOT NULL AND p.horario IS NOT NULL AND p.frecuencia_visitas IS NOT NULL
               AND p.ambiente IS NOT NULL AND p.tolerancia_fiestas IS NOT NULL AND p.limpieza_orden IS NOT NULL
               AND p.nivel_ruido IS NOT NULL
             )) AS perfil_completo
      FROM usuarios u
      LEFT JOIN miembros_grupo mg ON mg.usuario_id = u.id AND mg.activo = TRUE
      LEFT JOIN perfiles_convivencia_usuario p ON p.usuario_id = u.id
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
        fotos: u.fotos ?? [],
        foto_perfil: u.fotos?.[0] ?? null,
        fecha_registro: u.fecha_registro,
        tiene_calendar: !!u.google_calendar_token,
        es_casero: !!u.es_casero,
        perfil_completo: !!u.perfil_completo,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────
export const logout = async (req, res, next) => {
  const tokenRecibido = req.cookies?.refresh_token;

  try {
    if (tokenRecibido) {
      await prisma.refreshToken.deleteMany({ where: { token: tokenRecibido } });
    }
    res.clearCookie('token', ACCESS_COOKIE_OPTIONS);
    res.clearCookie('refresh_token', REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ message: 'Sesión cerrada' });
  } catch (err) {
    next(err);
  }
};
