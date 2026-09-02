import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'No autenticado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// ─── Helper compartido ───

async function getMiembroActivo(req) {
  const grupoId = req.query.grupo_id || req.body?.grupo_id || null;
  const where = grupoId
    ? { usuario_id: req.userId, grupo_id: grupoId, activo: true }
    : { usuario_id: req.userId, activo: true };
  return prisma.miembroGrupo.findFirst({
    where,
    select: { grupo_id: true, rol: true},
  });
}

// ─── Middlewares de autorización ───

export const requireMiembro = async (req, res, next) => {
  try {
    const miembro = await getMiembroActivo(req);
    if (!miembro) return res.status(403).json({ message: 'No perteneces a ningún grupo' });
    req.grupoId = miembro.grupo_id;
    req.miembro = miembro;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireInquilino = async (req, res, next) => {
  try {
    const miembro = await getMiembroActivo(req);
    if (!miembro) return res.status(403).json({ message: 'No perteneces a ningún grupo' });
    if (miembro.rol === 'CASERO') return res.status(403).json({ message: 'El casero no tiene acceso a este módulo' });
    req.grupoId = miembro.grupo_id;
    req.miembro = miembro;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const miembro = await getMiembroActivo(req);
    if (!miembro) return res.status(403).json({ message: 'No perteneces a ningún grupo' });
    if (miembro.rol !== 'ADMIN') return res.status(403).json({ message: 'Solo el administrador puede realizar esta acción' });
    req.grupoId = miembro.grupo_id;
    req.miembro = miembro;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireCasero = async (req, res, next) => {
  try {
    const miembro = await getMiembroActivo(req);
    if (!miembro) return res.status(403).json({ message: 'No perteneces a ningún grupo' });
    if (miembro.rol !== 'CASERO') return res.status(403).json({ message: 'Solo el casero puede realizar esta acción' });
    req.grupoId = miembro.grupo_id;
    req.miembro = miembro;
    next();
  } catch (err) {
    next(err);
  }
};

