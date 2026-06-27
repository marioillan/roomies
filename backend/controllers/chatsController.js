import { randomUUID } from 'crypto';
import { prisma } from '../src/config/db.js';
import { calcularCompatibilidad } from '../src/utils/compatibilidad.js';
import {
  sendMail,
  emailSolicitudEnviadaUsuario,
  emailSolicitudRecibidaAdmin,
  emailSolicitudAceptada,
  emailSolicitudRechazada,
} from '../src/config/email.js';
import { ACCIONES_SOLICITUD_VALIDAS } from '../validators/chatsValidator.js';

const APP_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

// ── POST /api/chats/solicitar/:publicacionId ──────────────────
export const solicitarContacto = async (req, res) => {
  const { publicacionId } = req.params;

  const pub = await prisma.publicacion.findFirst({
    where: { id: publicacionId, visible: true },
    select: { grupo_id: true },
  });
  if (!pub) return res.status(404).json({ message: 'Publicación no encontrada' });

  const grupoId = pub.grupo_id;

  const esMiembro = await prisma.miembroGrupo.findFirst({
    where: { usuario_id: req.userId, grupo_id: grupoId, activo: true },
    select: { id: true },
  });
  if (esMiembro) return res.status(400).json({ message: 'Ya eres miembro de este grupo' });

  const solicitudExistente = await prisma.solicitudContacto.findFirst({
    where: { usuario_id: req.userId, grupo_id: grupoId },
    select: { id: true, estado: true },
  });

  if (solicitudExistente && solicitudExistente.estado !== 'RECHAZADA') {
    return res.status(400).json({
      message: solicitudExistente.estado === 'PENDIENTE'
        ? 'Ya tienes una solicitud pendiente para este grupo'
        : 'Ya tienes acceso a este grupo',
      yaEnviada: true,
      estado: solicitudExistente.estado,
    });
  }

  // Si estaba rechazada, resetear a PENDIENTE; si no existe, crear
  let solicitudId;
  if (solicitudExistente?.estado === 'RECHAZADA') {
    await prisma.solicitudContacto.update({
      where: { id: solicitudExistente.id },
      data: { estado: 'PENDIENTE', fecha_envio: new Date() },
    });
    solicitudId = solicitudExistente.id;
  } else {
    const nueva = await prisma.solicitudContacto.create({
      data: { id: randomUUID(), usuario_id: req.userId, grupo_id: grupoId },
      select: { id: true },
    });
    solicitudId = nueva.id;
  }

  // Emails al usuario y al admin (fire & forget)
  Promise.all([
    prisma.usuario.findFirst({ where: { id: req.userId }, select: { nombre: true, email: true } }),
    prisma.miembroGrupo.findFirst({
      where: { grupo_id: grupoId, rol: 'ADMIN', activo: true, es_casero: false },
      select: {
        usuario: { select: { nombre: true, email: true } },
        grupo:   { select: { nombre: true } },
      },
    }),
  ]).then(([usuario, adminMembresia]) => {
    if (!usuario || !adminMembresia) return;
    const { nombre: nombre_usuario, email: email_usuario } = usuario;
    const nombre_grupo = adminMembresia.grupo.nombre;
    const nombre_admin = adminMembresia.usuario.nombre;
    const email_admin  = adminMembresia.usuario.email;
    const params = { nombreGrupo: nombre_grupo, appUrl: APP_URL };
    sendMail({ to: email_usuario, ...emailSolicitudEnviadaUsuario({ nombreUsuario: nombre_usuario, ...params }) });
    sendMail({ to: email_admin,   ...emailSolicitudRecibidaAdmin({ nombreAdmin: nombre_admin, nombreSolicitante: nombre_usuario, ...params }) });
  }).catch(() => {});

  res.json({ solicitudId });
};

// ── GET /api/chats/solicitudes ────────────────────────────────
export const getSolicitudes = async (req, res) => {
  const [solicitudesData, pcg] = await Promise.all([
    prisma.solicitudContacto.findMany({
      where: { grupo_id: req.grupoId },
      select: {
        id: true, estado: true, fecha_envio: true,
        usuario: {
          select: {
            id: true, nombre: true, foto_perfil: true, email: true,
            perfil_convivencia: {
              select: { horario: true, ambiente: true, frecuencia_visitas: true, tolerancia_fiestas: true, ocupacion: true },
            },
          },
        },
        chat: { select: { id: true } },
      },
      orderBy: { fecha_envio: 'desc' },
    }),
    prisma.perfilConvivenciaGrupo.findFirst({ where: { grupo_id: req.grupoId } }),
  ]);

  const solicitudes = solicitudesData.map(sc => {
    const pcu = sc.usuario.perfil_convivencia;
    return {
      id: sc.id, estado: sc.estado, fecha_envio: sc.fecha_envio,
      usuario_id:     sc.usuario.id,
      nombre:         sc.usuario.nombre,
      foto_perfil:    sc.usuario.foto_perfil,
      email:          sc.usuario.email,
      chat_id:        sc.chat?.id ?? null,
      compatibilidad: (pcg && pcu) ? calcularCompatibilidad(pcu, pcg).score : null,
    };
  });

  res.json({ solicitudes });
};

// ── PUT /api/chats/solicitudes/:solicitudId ───────────────────
export const gestionarSolicitud = async (req, res) => {
  const { accion } = req.body;
  if (!ACCIONES_SOLICITUD_VALIDAS.includes(accion)) {
    return res.status(400).json({ message: 'Acción inválida' });
  }

  const sol = await prisma.solicitudContacto.findFirst({
    where: { id: req.params.solicitudId },
    select: {
      grupo_id: true, estado: true, usuario_id: true,
      usuario: { select: { nombre: true, email: true } },
      grupo:   { select: { nombre: true } },
    },
  });
  if (!sol) return res.status(404).json({ message: 'Solicitud no encontrada' });
  if (sol.estado !== 'PENDIENTE') return res.status(400).json({ message: 'La solicitud ya fue procesada' });

  const adminMembresia = await prisma.miembroGrupo.findFirst({
    where: { usuario_id: req.userId, grupo_id: sol.grupo_id, activo: true },
    select: { rol: true },
  });
  if (!adminMembresia || adminMembresia.rol !== 'ADMIN') {
    return res.status(403).json({ message: 'Sin permiso' });
  }

  await prisma.solicitudContacto.update({
    where: { id: req.params.solicitudId },
    data: { estado: accion },
  });

  let chatId = null;
  if (accion === 'ACEPTADA') {
    const chat = await prisma.chat.create({
      data: { id: randomUUID(), solicitud_id: req.params.solicitudId },
      select: { id: true },
    });
    chatId = chat.id;
  }

  const emailData = accion === 'ACEPTADA'
    ? emailSolicitudAceptada({ nombreUsuario: sol.usuario.nombre, nombreGrupo: sol.grupo.nombre, appUrl: APP_URL })
    : emailSolicitudRechazada({ nombreUsuario: sol.usuario.nombre, nombreGrupo: sol.grupo.nombre });
  sendMail({ to: sol.usuario.email, ...emailData });

  res.json({ ok: true, chatId });
};

// ── GET /api/chats/mis-solicitudes ───────────────────────────
export const getMisSolicitudes = async (req, res) => {
  const data = await prisma.solicitudContacto.findMany({
    where: { usuario_id: req.userId },
    select: {
      id: true, grupo_id: true, estado: true, fecha_envio: true,
      grupo: { select: { nombre: true, foto_perfil: true } },
    },
    orderBy: { fecha_envio: 'desc' },
  });

  const solicitudes = data.map(sc => ({
    id: sc.id, grupo_id: sc.grupo_id, estado: sc.estado, fecha_envio: sc.fecha_envio,
    nombre_grupo: sc.grupo.nombre,
    foto_grupo:   sc.grupo.foto_perfil,
  }));

  res.json({ solicitudes });
};

// ── GET /api/chats/como-solicitante ──────────────────────────
export const getChatsComoSolicitante = async (req, res) => {
  const chats = await prisma.$queryRaw`
    SELECT
      c.id, c.estado, c.created_at,
      sc.grupo_id,
      g.nombre      AS nombre_grupo,
      g.foto_perfil AS foto_grupo,
      (SELECT m.contenido  FROM mensajes m WHERE m.chat_id = c.id ORDER BY m.enviado_en DESC LIMIT 1) AS ultimo_mensaje,
      (SELECT m.enviado_en FROM mensajes m WHERE m.chat_id = c.id ORDER BY m.enviado_en DESC LIMIT 1) AS ultimo_mensaje_en
    FROM chats c
    JOIN solicitudes_contacto sc ON sc.id = c.solicitud_id
    JOIN grupos g ON g.id = sc.grupo_id
    WHERE sc.usuario_id = ${req.userId}
    ORDER BY ultimo_mensaje_en DESC NULLS LAST, c.created_at DESC
  `;
  res.json({ chats });
};

// ── GET /api/chats/como-admin ─────────────────────────────────
export const getChatsComoAdmin = async (req, res) => {
  const membresia = await prisma.miembroGrupo.findFirst({
    where: { usuario_id: req.userId, activo: true },
    select: { grupo_id: true, rol: true },
  });
  if (!membresia || membresia.rol !== 'ADMIN') return res.json({ chats: [] });

  const chats = await prisma.$queryRaw`
    SELECT
      c.id, c.estado, c.created_at,
      sc.usuario_id  AS solicitante_id,
      sc.grupo_id,
      g.nombre       AS nombre_grupo,
      g.foto_perfil  AS foto_grupo,
      u.nombre       AS nombre_solicitante,
      u.foto_perfil  AS foto_solicitante,
      (SELECT m2.contenido  FROM mensajes m2 WHERE m2.chat_id = c.id ORDER BY m2.enviado_en DESC LIMIT 1) AS ultimo_mensaje,
      (SELECT m2.enviado_en FROM mensajes m2 WHERE m2.chat_id = c.id ORDER BY m2.enviado_en DESC LIMIT 1) AS ultimo_mensaje_en
    FROM chats c
    JOIN solicitudes_contacto sc ON sc.id = c.solicitud_id
    JOIN grupos g ON g.id = sc.grupo_id
    JOIN usuarios u ON u.id = sc.usuario_id
    WHERE sc.grupo_id = ${membresia.grupo_id}
    ORDER BY ultimo_mensaje_en DESC NULLS LAST, c.created_at DESC
  `;
  res.json({ chats });
};

// ── GET /api/chats/:chatId/mensajes ──────────────────────────
export const getMensajes = async (req, res) => {
  const acceso = await prisma.chat.findFirst({
    where: {
      id: req.params.chatId,
      solicitud: {
        OR: [
          { usuario_id: req.userId },
          { grupo: { miembros: { some: { usuario_id: req.userId, activo: true } } } },
        ],
      },
    },
    select: { id: true },
  });
  if (!acceso) return res.status(403).json({ message: 'Sin acceso' });

  // Traer los últimos 50 en DESC y revertir para orden ASC
  const mensajesDesc = await prisma.mensaje.findMany({
    where: { chat_id: req.params.chatId },
    select: {
      id: true, contenido: true, enviado_en: true,
      remitente: { select: { id: true, nombre: true, foto_perfil: true } },
    },
    orderBy: { enviado_en: 'desc' },
    take: 50,
  });

  const mensajes = mensajesDesc.reverse().map(m => ({
    id: m.id, contenido: m.contenido, enviado_en: m.enviado_en,
    remitente_id:     m.remitente.id,
    remitente_nombre: m.remitente.nombre,
    remitente_foto:   m.remitente.foto_perfil,
  }));

  res.json({ mensajes });
};

// ── DELETE /api/chats/:chatId ─────────────────────────────────
export const cerrarChat = async (req, res) => {
  const acceso = await prisma.chat.findFirst({
    where: {
      id: req.params.chatId,
      solicitud: {
        OR: [
          { usuario_id: req.userId },
          { grupo: { miembros: { some: { usuario_id: req.userId, activo: true, rol: 'ADMIN' } } } },
        ],
      },
    },
    select: { solicitud_id: true },
  });
  if (!acceso) return res.status(403).json({ message: 'Sin acceso' });

  // CASCADE: eliminar solicitud borra también el chat y los mensajes
  await prisma.solicitudContacto.delete({ where: { id: acceso.solicitud_id } });
  res.json({ ok: true });
};

// ── POST /api/chats/:chatId/mensajes ─────────────────────────
export const enviarMensaje = async (req, res) => {
  const { contenido } = req.body;
  if (!contenido?.trim()) return res.status(400).json({ message: 'Mensaje vacío' });

  const acceso = await prisma.chat.findFirst({
    where: {
      id: req.params.chatId,
      solicitud: {
        OR: [
          { usuario_id: req.userId },
          { grupo: { miembros: { some: { usuario_id: req.userId, activo: true } } } },
        ],
      },
    },
    select: { estado: true },
  });
  if (!acceso) return res.status(403).json({ message: 'Sin acceso' });
  if (acceso.estado !== 'ACTIVO') return res.status(400).json({ message: 'Chat cerrado' });

  const remitente = await prisma.usuario.findFirst({
    where: { id: req.userId },
    select: { nombre: true, foto_perfil: true },
  });

  const mensajeCreado = await prisma.mensaje.create({
    data: { id: randomUUID(), chat_id: req.params.chatId, remitente_id: req.userId, contenido: contenido.trim() },
    select: { id: true, contenido: true, enviado_en: true },
  });

  const mensaje = {
    ...mensajeCreado,
    remitente_id:     req.userId,
    remitente_nombre: remitente?.nombre,
    remitente_foto:   remitente?.foto_perfil,
  };

  req.app.get('io')?.to(`chat:${req.params.chatId}`).emit('nuevo_mensaje', mensaje);
  res.json({ mensaje });
};
