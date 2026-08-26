import { randomUUID } from 'crypto';
import { prisma } from '../src/config/db.js';
import { zonaSchema } from '../validators/tareasValidator.js';

const ZONAS_PREDEFINIDAS = ['Cocina', 'Baño', 'Salón', 'Pasillo'];

function getLunesActual() {
  const hoy = new Date();
  const dia  = hoy.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diff);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

// ── GET /api/tareas ───────────────────────────────────────────
export const getTareas = async (req, res, next) => {
  try {
    const grupo_id = req.grupoId;
    const grupo = await prisma.grupo.findFirst({
      where: { id: grupo_id },
      select: { id: true, nombre: true, dia_limpieza: true, semana_rotacion: true, rotacion_semana_actual: true },
    });
    if (!grupo) return res.status(404).json({ message: 'Grupo no encontrado' });

    const [zonas, miembrosData] = await Promise.all([
      prisma.tarea.findMany({
        where: { grupo_id, es_recurrente: true },
        select: { id: true, nombre: true },
        orderBy: { created_at: 'asc' },
      }),
      prisma.miembroGrupo.findMany({
        where: { grupo_id, activo: true, rol: { not: 'CASERO' } },
        select: {
          rol: true,
          usuario: { select: { id: true, nombre: true, foto_perfil: true } },
        },
        orderBy: { fecha_union: 'asc' },
      }),
    ]);

    const miembros = miembrosData.map(mg => ({
      id: mg.usuario.id, nombre: mg.usuario.nombre, foto_perfil: mg.usuario.foto_perfil, rol: mg.rol,
    }));

    if (!zonas.length || !miembros.length) {
      return res.json({ zonas, miembros, asignaciones: [], semana_rotacion: grupo.semana_rotacion, configurado: false });
    }

    const lunesActual = getLunesActual();
    const lunesStr    = lunesActual.toISOString().split('T')[0];
    const lunesDate   = new Date(lunesStr);

    let semanaRotacion = Number(grupo.semana_rotacion);
    const ultimaStr = grupo.rotacion_semana_actual
      ? new Date(grupo.rotacion_semana_actual).toISOString().split('T')[0]
      : null;

    if (ultimaStr && ultimaStr < lunesStr) {
      const semanasPasadas = Math.round((lunesActual - new Date(ultimaStr + 'T00:00:00')) / (7 * 86400000));
      semanaRotacion = (semanaRotacion + semanasPasadas) % Math.max(zonas.length, miembros.length);
      await prisma.grupo.update({
        where: { id: grupo_id },
        data: { semana_rotacion: semanaRotacion, rotacion_semana_actual: lunesDate },
      });
    } else if (!ultimaStr) {
      await prisma.grupo.update({
        where: { id: grupo_id },
        data: { rotacion_semana_actual: lunesDate },
      });
    }

    const asignExist = await prisma.asignacionTarea.findFirst({
      where: { tarea_id: { in: zonas.map(z => z.id) }, semana: lunesDate },
      select: { id: true },
    });

    if (!asignExist) {
      const nZonas = zonas.length;
      await prisma.asignacionTarea.createMany({
        data: miembros.map((m, i) => {
          const zona = zonas[(i + semanaRotacion) % nZonas];
          return { id: randomUUID(), tarea_id: zona.id, usuario_id: m.id, semana: lunesDate, estado: 'PENDIENTE' };
        }),
        skipDuplicates: true,
      });
    }

    const asignacionesData = await prisma.asignacionTarea.findMany({
      where: { tarea_id: { in: zonas.map(z => z.id) }, semana: lunesDate },
      select: {
        id: true, tarea_id: true, usuario_id: true, estado: true, fecha_completada: true,
        tarea: { select: { nombre: true } },
      },
      orderBy: { usuario_id: 'asc' },
    });

    const asignaciones = asignacionesData.map(a => ({
      id: a.id, tarea_id: a.tarea_id, usuario_id: a.usuario_id,
      estado: a.estado, fecha_completada: a.fecha_completada,
      zona_nombre: a.tarea.nombre,
    }));

    res.json({ zonas, miembros, asignaciones, semana_rotacion: semanaRotacion, configurado: true, lunes_actual: lunesStr });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/tareas/iniciar ──────────────────────────────────
export const iniciarTareas = async (req, res, next) => {
  try {
    const grupo_id = req.grupoId;

    const existing = await prisma.tarea.findFirst({
      where: { grupo_id, es_recurrente: true },
      select: { id: true },
    });
    if (existing) return res.status(400).json({ message: 'Las zonas ya están configuradas' });

    const lunesDate = new Date(getLunesActual().toISOString().split('T')[0]);

    await prisma.$transaction([
      prisma.tarea.createMany({
        data: ZONAS_PREDEFINIDAS.map(nombre => ({ id: randomUUID(), grupo_id, nombre, es_recurrente: true })),
      }),
      prisma.grupo.update({
        where: { id: grupo_id },
        data: { semana_rotacion: 0, rotacion_semana_actual: lunesDate },
      }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/tareas/zonas ────────────────────────────────────
export const añadirZona = async (req, res, next) => {
  const parsed = zonaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

  try {
    const zona = await prisma.tarea.create({
      data: { id: randomUUID(), grupo_id: req.grupoId, nombre: parsed.data.nombre, es_recurrente: true },
      select: { id: true, nombre: true },
    });
    res.status(201).json({ zona });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/tareas/zonas/:id ──────────────────────────────
export const eliminarZona = async (req, res, next) => {
  try {
    const deleted = await prisma.tarea.deleteMany({
      where: { id: req.params.id, grupo_id: req.grupoId, es_recurrente: true },
    });
    if (deleted.count === 0) return res.status(404).json({ message: 'Zona no encontrada' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/tareas/turnos/:id/estado ───────────────────────
export const toggleEstadoTurno = async (req, res, next) => {
  try {
    const existente = await prisma.asignacionTarea.findFirst({
      where: { id: req.params.id, usuario_id: req.userId },
      select: { estado: true },
    });
    if (!existente) return res.status(404).json({ message: 'Asignación no encontrada o no te pertenece' });

    const nuevoEstado = existente.estado === 'PENDIENTE' ? 'COMPLETADA' : 'PENDIENTE';

    const asignacion = await prisma.asignacionTarea.update({
      where: { id: req.params.id },
      data: {
        estado:           nuevoEstado,
        fecha_completada: nuevoEstado === 'COMPLETADA' ? new Date() : null,
      },
      select: { id: true, estado: true, fecha_completada: true },
    });

    res.json({ asignacion });
  } catch (err) {
    next(err);
  }
};
