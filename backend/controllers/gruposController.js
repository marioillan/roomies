import { randomUUID } from 'crypto';
import multer from 'multer';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../src/config/db.js';
import cloudinary from '../src/config/cloudinary.js';
import { sendMail, emailPublicacionConfirmada } from '../src/config/email.js';
import {
  crearGrupoSchema,
  editarGrupoSchema,
  grupoConvivenciaSchema,
  publicacionSchema,
  eventoSchema,
  interesesSchema,
  transferirAdminSchema,
} from '../validators/gruposValidator.js';

const APP_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  },
});

// ── Helpers internos ──────────────────────────────────────────

function generarCodigo() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function generarDosCodigosUnicos() {
  for (let i = 0; i < 10; i++) {
    const c1 = generarCodigo();
    const c2 = generarCodigo();
    if (c1 === c2) continue;
    const existente = await prisma.grupo.findFirst({
      where: { OR: [{ codigo_acceso: { in: [c1, c2] } }, { codigo_casero: { in: [c1, c2] } }] },
      select: { id: true },
    });
    if (!existente) return [c1, c2];
  }
  return null;
}

async function getMembership(userId) {
  return prisma.miembroGrupo.findFirst({
    where: { usuario_id: userId, activo: true },
    select: { grupo_id: true, rol: true },
  });
}

async function crearEventoEnCalendar(tokenStr, eventoData, usuarioId) {
  const tokens = JSON.parse(tokenStr);
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:3000/api/auth/google/calendar/callback'
  );
  client.setCredentials(tokens);
  const { token: accessToken } = await client.getAccessToken();

  if (client.credentials.access_token !== tokens.access_token) {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { google_calendar_token: JSON.stringify(client.credentials) },
    });
  }

  const gcalEvent = {
    summary: eventoData.titulo,
    ...(eventoData.descripcion && { description: eventoData.descripcion }),
    start: eventoData.fecha_fin
      ? { dateTime: eventoData.fecha_inicio }
      : { date: eventoData.fecha_inicio.split('T')[0] },
    end: eventoData.fecha_fin
      ? { dateTime: eventoData.fecha_fin }
      : { date: eventoData.fecha_inicio.split('T')[0] },
  };

  const gcalRes = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(gcalEvent),
    }
  );
  if (!gcalRes.ok) throw new Error(`Google Calendar respondió ${gcalRes.status}`);
  const gcalData = await gcalRes.json();
  return gcalData.id;
}

// ── POST /api/grupos/unirse ───────────────────────────────────
export const unirseGrupo = async (req, res, next) => {
  const { codigo_acceso } = req.body;
  if (!codigo_acceso || typeof codigo_acceso !== 'string') {
    return res.status(400).json({ message: 'Código inválido' });
  }
  const codigo = codigo_acceso.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(codigo)) {
    return res.status(400).json({ message: 'El código debe tener 6 caracteres alfanuméricos' });
  }

  try {
    const grupo = await prisma.grupo.findFirst({
      where: { OR: [{ codigo_acceso: codigo }, { codigo_casero: codigo }] },
      select: { id: true, nombre: true, codigo_acceso: true, codigo_casero: true, foto_perfil: true, dia_limpieza: true, created_at: true },
    });
    if (!grupo) return res.status(404).json({ message: 'Código de acceso incorrecto' });

    const esCasero = grupo.codigo_casero === codigo;

    if (esCasero) {
      const yaEsCaseroAqui = await prisma.miembroGrupo.findFirst({
        where: { usuario_id: req.userId, grupo_id: grupo.id, activo: true },
        select: { id: true },
      });
      if (yaEsCaseroAqui) return res.status(400).json({ message: 'Ya eres casero de este grupo' });
    } else {
      const yaPertenece = await getMembership(req.userId);
      if (yaPertenece) return res.status(400).json({ message: 'Ya perteneces a un grupo. Debes salir primero.' });
    }

    await prisma.miembroGrupo.create({
      data: { id: randomUUID(), usuario_id: req.userId, grupo_id: grupo.id, rol: 'MEMBER', es_casero: esCasero },
    });

    const { codigo_casero: _cc, ...grupoPublico } = grupo;
    res.json({ grupo: grupoPublico, esCasero });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/grupos/crear ────────────────────────────────────
export const crearGrupo = async (req, res, next) => {
  const parsed = crearGrupoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
  const { nombre, dia_limpieza } = parsed.data;
  const userId = req.userId;

  try {
    const yaPertenece = await getMembership(userId);
    if (yaPertenece) return res.status(400).json({ message: 'Ya perteneces a un grupo. Debes salir primero.' });

    const codigos = await generarDosCodigosUnicos();
    if (!codigos) return res.status(500).json({ message: 'No se pudo generar un código único' });
    const [codigoAcceso, codigoCasero] = codigos;
    const grupoId = randomUUID();

    const [grupo] = await prisma.$transaction(async (tx) => {
      const g = await tx.grupo.create({
        data: { id: grupoId, nombre, codigo_acceso: codigoAcceso, codigo_casero: codigoCasero, dia_limpieza: dia_limpieza ?? null, descripcion: '' },
        select: { id: true, nombre: true, codigo_acceso: true, codigo_casero: true, dia_limpieza: true, created_at: true },
      });
      await tx.miembroGrupo.create({
        data: { id: randomUUID(), usuario_id: userId, grupo_id: grupoId, rol: 'ADMIN' },
      });
      return [g];
    });

    res.status(201).json({ grupo });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/grupos/editar ────────────────────────────────────
export const editarGrupo = async (req, res, next) => {
  const parsed = editarGrupoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
  const { nombre, dia_limpieza, descripcion, ciudad, buscar_companero } = parsed.data;
  const grupoId = req.grupoId;

  const updateData = { nombre, dia_limpieza: dia_limpieza ?? null, descripcion: descripcion ?? null, ciudad: ciudad ?? null, updated_at: new Date() };
  if (buscar_companero != null) updateData.buscar_companero = buscar_companero;

  try {
    const grupo = await prisma.grupo.update({
      where: { id: grupoId },
      data: updateData,
      select: { id: true, nombre: true, codigo_acceso: true, foto_perfil: true, dia_limpieza: true, descripcion: true, ciudad: true, buscar_companero: true, created_at: true },
    });
    res.json({ grupo });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/grupos/mis-grupos ────────────────────────────────
export const getMisGrupos = async (req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT g.id, g.nombre, g.ciudad, g.foto_perfil, mg.rol, mg.es_casero,
             p.direccion, p.piso_puerta,
             COUNT(mg2.usuario_id) FILTER (WHERE mg2.es_casero = FALSE AND mg2.activo = TRUE) AS num_inquilinos
      FROM miembros_grupo mg
      JOIN grupos g ON g.id = mg.grupo_id
      LEFT JOIN publicaciones p ON p.grupo_id = g.id
      LEFT JOIN miembros_grupo mg2 ON mg2.grupo_id = g.id
      WHERE mg.usuario_id = ${req.userId} AND mg.activo = TRUE
      GROUP BY g.id, g.nombre, g.ciudad, g.foto_perfil, mg.rol, mg.es_casero, mg.fecha_union, p.direccion, p.piso_puerta
      ORDER BY mg.fecha_union ASC
    `;
    res.json({ grupos: rows.map(r => ({ ...r, num_inquilinos: Number(r.num_inquilinos) })) });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/grupos/mi-grupo ──────────────────────────────────
export const getMiGrupo = async (req, res, next) => {
  try {
    let grupoId = null;

    if (req.query.grupo_id) {
      const membresia = await prisma.miembroGrupo.findFirst({
        where: { usuario_id: req.userId, grupo_id: req.query.grupo_id, activo: true },
        select: { grupo_id: true },
      });
      if (!membresia) return res.status(403).json({ message: 'No perteneces a ese grupo' });
      grupoId = req.query.grupo_id;
    } else {
      const m = await getMembership(req.userId);
      if (!m) return res.json({ grupo: null, miembros: [] });
      grupoId = m.grupo_id;
    }

    const [grupo, miembrosData] = await Promise.all([
      prisma.grupo.findFirst({
        where: { id: grupoId },
        select: { id: true, nombre: true, codigo_acceso: true, codigo_casero: true, foto_perfil: true, dia_limpieza: true, descripcion: true, ciudad: true, buscar_companero: true, created_at: true },
      }),
      prisma.miembroGrupo.findMany({
        where: { grupo_id: grupoId, activo: true },
        select: {
          rol: true, es_casero: true, fecha_union: true,
          usuario: {
            select: {
              id: true, nombre: true, foto_perfil: true,
              perfil_convivencia: { select: { fecha_nacimiento: true } },
            },
          },
        },
        orderBy: { rol: 'asc' },
      }),
    ]);

    const miembros = miembrosData.map(mg => ({
      id: mg.usuario.id,
      username: mg.usuario.nombre,
      foto_perfil: mg.usuario.foto_perfil,
      rol_en_grupo: mg.rol,
      es_casero: mg.es_casero,
      fecha_union: mg.fecha_union,
      fecha_nacimiento: mg.usuario.perfil_convivencia?.fecha_nacimiento ?? null,
    }));

    res.json({ grupo: grupo ?? null, miembros });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/grupos/convivencia ───────────────────────────────
export const getConvivencia = async (req, res, next) => {
  try {
    const m = await getMembership(req.userId);
    if (!m) return res.json({ perfil: null });
    const perfil = await prisma.perfilConvivenciaGrupo.findFirst({ where: { grupo_id: m.grupo_id } });
    res.json({ perfil: perfil ?? null });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/grupos/convivencia ───────────────────────────────
export const editarConvivencia = async (req, res, next) => {
  const grupoId = req.grupoId;
  const parsed = grupoConvivenciaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
  const { horario, ambiente, frecuencia_visitas, tolerancia_fiestas, frecuencia_salidas,
          ocupacion, acepta_fumadores, acepta_mascotas, lgbtq_friendly,
          limpieza_orden, nivel_ruido } = parsed.data;

  const campos = {
    horario: horario ?? null, ambiente: ambiente ?? null,
    frecuencia_visitas: frecuencia_visitas ?? null, tolerancia_fiestas: tolerancia_fiestas ?? null,
    frecuencia_salidas: frecuencia_salidas ?? null, ocupacion: ocupacion ?? null,
    acepta_fumadores: acepta_fumadores ?? null, acepta_mascotas: acepta_mascotas ?? null,
    lgbtq_friendly: lgbtq_friendly ?? null,
    limpieza_orden: limpieza_orden ?? null, nivel_ruido: nivel_ruido ?? null,
  };

  try {
    const perfil = await prisma.perfilConvivenciaGrupo.upsert({
      where: { grupo_id: grupoId },
      create: { id: randomUUID(), grupo_id: grupoId, ...campos },
      update: { ...campos, updated_at: new Date() },
    });
    res.json({ perfil });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/grupos/publicacion ───────────────────────────────
export const getPublicacion = async (req, res, next) => {
  try {
    const m = await getMembership(req.userId);
    if (!m) return res.json({ publicacion: null, fotos: [] });

    const pub = await prisma.publicacion.findFirst({ where: { grupo_id: m.grupo_id } });
    let fotos = [];
    if (pub) {
      fotos = await prisma.fotoPublicacion.findMany({
        where: { publicacion_id: pub.id },
        select: { id: true, url: true, orden: true },
        orderBy: { orden: 'asc' },
      });
    }

    res.json({ publicacion: pub, fotos });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/grupos/publicacion ───────────────────────────────
export const editarPublicacion = async (req, res, next) => {
  const grupoId = req.grupoId;
  const parsed = publicacionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
  const d = parsed.data;

  const campos = {
    titulo: d.titulo, descripcion: d.descripcion, ciudad: d.ciudad,
    direccion: d.direccion ?? null, piso_puerta: d.piso_puerta ?? null,
    precio: d.precio, habitaciones_libres: d.habitaciones_libres,
    tipo_piso: d.tipo_piso ?? null, habitaciones_totales: d.habitaciones_totales ?? null,
    tamano_piso: d.tamano_piso ?? null, planta: d.planta ?? null, ascensor: d.ascensor,
    wifi: d.wifi, lavadora: d.lavadora, lavavajillas: d.lavavajillas,
    aire_acondicionado: d.aire_acondicionado, calefaccion: d.calefaccion,
    parking: d.parking, terraza: d.terraza, amueblado: d.amueblado,
    permite_fumar: d.permite_fumar, permite_mascotas: d.permite_mascotas,
    visitas: d.visitas ?? null, horario_silencio: d.horario_silencio ?? null,
    genero_preferido: d.genero_preferido ?? null, normas_adicionales: d.normas_adicionales ?? null,
    modo_contacto: d.modo_contacto, telefono_contacto: d.telefono_contacto ?? null,
    visible: d.visible, latitud: d.latitud ?? null, longitud: d.longitud ?? null,
  };

  try {
    const pub = await prisma.publicacion.upsert({
      where: { grupo_id: grupoId },
      create: { id: randomUUID(), grupo_id: grupoId, ...campos },
      update: { ...campos, updated_at: new Date() },
    });
    res.json({ publicacion: pub });

    // Email de confirmación al admin (fire & forget)
    Promise.all([
      prisma.usuario.findFirst({ where: { id: req.userId }, select: { nombre: true, email: true } }),
      prisma.grupo.findFirst({ where: { id: grupoId }, select: { nombre: true } }),
    ]).then(([admin, grp]) => {
      if (!admin?.email || !grp) return;
      sendMail({
        to: admin.email,
        ...emailPublicacionConfirmada({
          nombreAdmin: admin.nombre,
          nombreGrupo: grp.nombre,
          tituloAnuncio: pub.titulo,
          appUrl: APP_URL,
        }),
      });
    }).catch(() => {});
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/grupos/publicacion/visible ────────────────────
export const actualizarVisibilidad = async (req, res, next) => {
  try {
    const { visible } = req.body;
    if (typeof visible !== 'boolean') return res.status(400).json({ message: 'El campo visible debe ser un booleano' });

    const pub = await prisma.publicacion.findFirst({ where: { grupo_id: req.grupoId } });
    if (!pub) return res.status(404).json({ message: 'No existe ningún anuncio para este grupo' });

    const actualizada = await prisma.publicacion.update({
      where: { id: pub.id },
      data: { visible },
    });
    res.json({ publicacion: actualizada });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/grupos/publicacion ───────────────────────────
export const eliminarPublicacion = async (req, res, next) => {
  try {
    const pub = await prisma.publicacion.findFirst({ where: { grupo_id: req.grupoId } });
    if (!pub) return res.status(404).json({ message: 'No existe ningún anuncio para este grupo' });

    await prisma.publicacion.delete({ where: { id: pub.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/grupos/publicacion/fotos ─────────────────────────
export const subirFotosPublicacion = async (req, res, next) => {
  const grupoId = req.grupoId;
  if (!req.files?.length) return res.status(400).json({ message: 'No se han enviado fotos' });

  try {
    const pub = await prisma.publicacion.findFirst({
      where: { grupo_id: grupoId },
      select: { id: true },
    });
    if (!pub) return res.status(404).json({ message: 'No existe la publicación' });

    const maxFoto = await prisma.fotoPublicacion.findFirst({
      where: { publicacion_id: pub.id },
      orderBy: { orden: 'desc' },
      select: { orden: true },
    });
    let orden = (maxFoto?.orden ?? -1) + 1;

    const urls = await Promise.all(req.files.map(file =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'roomies/publicaciones', transformation: [{ width: 1200, height: 800, crop: 'fill' }] },
          (err, result) => err ? reject(err) : resolve(result.secure_url)
        );
        stream.end(file.buffer);
      })
    ));

    const fotos = await Promise.all(urls.map((url, i) =>
      prisma.fotoPublicacion.create({
        data: { id: randomUUID(), publicacion_id: pub.id, url, orden: orden + i },
        select: { id: true, url: true, orden: true },
      })
    ));

    res.json({ fotos });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/grupos/publicacion/fotos/:fotoId ──────────────
export const eliminarFotoPublicacion = async (req, res, next) => {
  const grupoId = req.grupoId;
  try {
    const pub = await prisma.publicacion.findFirst({
      where: { grupo_id: grupoId },
      select: { id: true },
    });
    if (!pub) return res.status(404).json({ message: 'Foto no encontrada' });

    const deleted = await prisma.fotoPublicacion.deleteMany({
      where: { id: req.params.fotoId, publicacion_id: pub.id },
    });
    if (deleted.count === 0) return res.status(404).json({ message: 'Foto no encontrada' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/grupos/foto ──────────────────────────────────────
export const subirFotoGrupo = async (req, res, next) => {
  const grupoId = req.grupoId;
  try {
    if (!req.file) return res.status(400).json({ message: 'No se ha enviado ninguna imagen' });

    const url = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'roomies/grupos', transformation: [{ width: 300, height: 300, crop: 'fill' }] },
        (err, result) => err ? reject(err) : resolve(result.secure_url)
      );
      stream.end(req.file.buffer);
    });

    const grupo = await prisma.grupo.update({
      where: { id: grupoId },
      data: { foto_perfil: url },
      select: { id: true, nombre: true, codigo_acceso: true, foto_perfil: true, dia_limpieza: true, created_at: true },
    });
    res.json({ grupo });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/grupos/eventos ───────────────────────────────────
export const getEventos = async (req, res, next) => {
  try {
    const m = await getMembership(req.userId);
    if (!m) return res.json({ eventos: [] });

    const data = await prisma.evento.findMany({
      where: { grupo_id: m.grupo_id },
      select: {
        id: true, titulo: true, descripcion: true, fecha_inicio: true, fecha_fin: true,
        google_calendar_event_id: true, created_at: true, creado_por_id: true,
        creado_por: { select: { nombre: true } },
      },
      orderBy: { fecha_inicio: 'asc' },
    });

    const eventos = data.map(({ creado_por, ...e }) => ({
      ...e,
      creado_por_nombre: creado_por.nombre,
    }));

    res.json({ eventos });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/grupos/eventos ──────────────────────────────────
export const crearEvento = async (req, res, next) => {
  const parsed = eventoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
  const d = parsed.data;

  try {
    const eventoId = randomUUID();
    const evento = await prisma.evento.create({
      data: {
        id: eventoId,
        grupo_id: req.grupoId,
        creado_por_id: req.userId,
        titulo: d.titulo,
        descripcion: d.descripcion ?? null,
        fecha_inicio: new Date(d.fecha_inicio),
        fecha_fin: d.fecha_fin ? new Date(d.fecha_fin) : null,
      },
      select: { id: true, titulo: true, descripcion: true, fecha_inicio: true, fecha_fin: true, created_at: true },
    });

    // Sincronizar con todos los miembros del grupo que tengan Google Calendar conectado
    let googleEventId = null;
    try {
      const miembros = await prisma.miembroGrupo.findMany({
        where: { grupo_id: req.grupoId, activo: true, usuario: { google_calendar_token: { not: null } } },
        select: { usuario_id: true, usuario: { select: { google_calendar_token: true } } },
      });

      await Promise.allSettled(
        miembros.map(async (miembro) => {
          try {
            const eventId = await crearEventoEnCalendar(miembro.usuario.google_calendar_token, d, miembro.usuario_id);
            if (miembro.usuario_id === req.userId) googleEventId = eventId;
          } catch (calErr) {
            console.error(`Error al sincronizar Calendar para usuario ${miembro.usuario_id}:`, calErr);
          }
        })
      );

      if (googleEventId) {
        await prisma.evento.update({
          where: { id: eventoId },
          data: { google_calendar_event_id: googleEventId },
        });
      }
    } catch (calErr) {
      console.error('Error al sincronizar con Google Calendar:', calErr);
    }

    res.status(201).json({ evento: { ...evento, google_calendar_event_id: googleEventId } });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/grupos/eventos/:id ───────────────────────────────
export const editarEvento = async (req, res, next) => {
  const eventoExistente = await prisma.evento.findFirst({
    where: { id: req.params.id, grupo_id: req.grupoId },
    select: { creado_por_id: true },
  });
  if (!eventoExistente) return res.status(404).json({ message: 'Evento no encontrado' });
  if (eventoExistente.creado_por_id !== req.userId && req.miembro.rol !== 'ADMIN') {
    return res.status(403).json({ message: 'Sin permiso para editar este evento' });
  }

  const parsed = eventoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
  const d = parsed.data;

  try {
    const evento = await prisma.evento.update({
      where: { id: req.params.id },
      data: {
        titulo: d.titulo,
        descripcion: d.descripcion ?? null,
        fecha_inicio: new Date(d.fecha_inicio),
        fecha_fin: d.fecha_fin ? new Date(d.fecha_fin) : null,
        updated_at: new Date(),
      },
      select: { id: true, titulo: true, descripcion: true, fecha_inicio: true, fecha_fin: true, created_at: true, creado_por_id: true },
    });
    res.json({ evento });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/grupos/eventos/:id ────────────────────────────
export const eliminarEvento = async (req, res, next) => {
  const eventoExistente = await prisma.evento.findFirst({
    where: { id: req.params.id, grupo_id: req.grupoId },
    select: { creado_por_id: true },
  });
  if (!eventoExistente) return res.status(404).json({ message: 'Evento no encontrado' });
  if (eventoExistente.creado_por_id !== req.userId && req.miembro.rol !== 'ADMIN') {
    return res.status(403).json({ message: 'Sin permiso para eliminar este evento' });
  }

  try {
    await prisma.evento.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/grupos/intereses ─────────────────────────────────
export const getIntereses = async (req, res, next) => {
  try {
    const todos = await prisma.interes.findMany({
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });
    const categorias = {};
    for (const interes of todos) {
      if (!categorias[interes.categoria]) categorias[interes.categoria] = [];
      categorias[interes.categoria].push({ id: interes.id, nombre: interes.nombre });
    }
    res.json({ categorias });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/grupos/mis-intereses ─────────────────────────────
export const getMisIntereses = async (req, res, next) => {
  try {
    const m = await getMembership(req.userId);
    if (!m) return res.json({ intereses: [] });

    const data = await prisma.grupoInteres.findMany({
      where: { grupo_id: m.grupo_id },
      select: { interes: { select: { id: true, nombre: true, categoria: true } } },
      orderBy: [{ interes: { categoria: 'asc' } }, { interes: { nombre: 'asc' } }],
    });
    res.json({ intereses: data.map(gi => gi.interes) });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/grupos/intereses ─────────────────────────────────
export const editarIntereses = async (req, res, next) => {
  const grupoId = req.grupoId;
  const parsed = interesesSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

  const { intereses } = parsed.data;
  try {
    await prisma.$transaction([
      prisma.grupoInteres.deleteMany({ where: { grupo_id: grupoId } }),
      ...(intereses.length > 0
        ? [prisma.grupoInteres.createMany({
            data: intereses.map(interes_id => ({ grupo_id: grupoId, interes_id })),
          })]
        : []),
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/grupos/transferir-admin ────────────────────────
export const transferirAdmin = async (req, res, next) => {
  const grupoId = req.grupoId;
  const parsed = transferirAdminSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'ID de usuario inválido' });
  const { nuevo_admin_id } = parsed.data;

  if (nuevo_admin_id === req.userId) {
    return res.status(400).json({ message: 'Ya eres el administrador' });
  }

  try {
    const miembro = await prisma.miembroGrupo.findFirst({
      where: { usuario_id: nuevo_admin_id, grupo_id: grupoId, activo: true, es_casero: false },
      select: { id: true },
    });
    if (!miembro) return res.status(404).json({ message: 'El usuario no es miembro activo del grupo' });

    await prisma.$transaction([
      prisma.miembroGrupo.updateMany({
        where: { usuario_id: req.userId, grupo_id: grupoId },
        data: { rol: 'MEMBER' },
      }),
      prisma.miembroGrupo.updateMany({
        where: { usuario_id: nuevo_admin_id, grupo_id: grupoId },
        data: { rol: 'ADMIN' },
      }),
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/grupos/salir ──────────────────────────────────
export const salirGrupo = async (req, res, next) => {
  try {
    const grupoId = req.grupoId;
    const rol = req.miembro.rol;

    if (rol === 'ADMIN') {
      const otrosMiembros = await prisma.miembroGrupo.findFirst({
        where: { grupo_id: grupoId, usuario_id: { not: req.userId }, activo: true, es_casero: false },
        select: { id: true },
      });
      if (otrosMiembros) {
        return res.status(400).json({ message: 'Debes transferir el rol de administrador antes de salir' });
      }
    }

    await prisma.miembroGrupo.updateMany({
      where: { usuario_id: req.userId, grupo_id: grupoId },
      data: { activo: false },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
