import { randomUUID } from 'crypto';
import multer from 'multer';
import { prisma } from '../src/config/db.js';
import cloudinary from '../src/config/cloudinary.js';
import {
  editarPerfilSchema,
  preferenciasSchema,
  interesesSchema,
} from '../validators/perfilValidator.js';
import {ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS} from './authController.js';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  },
});

// ── PUT /api/perfil/editar ─────────────────────────────────────
export const editarPerfil = async (req, res, next) => {
  const userId = req.userId;
  const parsed = editarPerfilSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const {
    nombre, genero, fecha_nacimiento, pais, ocupacion, horario, frecuencia_visitas,
    ambiente, tolerancia_fiestas, fumador, acepta_fumadores,
    tiene_mascotas, acepta_mascotas, lgbtq_friendly, limpieza_orden, nivel_ruido, sobre_mi,
  } = parsed.data;

  // Campos que solo se actualizan si el nuevo valor no es null (equivalente a COALESCE en SQL)
  const camposOpcionales = {};
  if (ocupacion != null)          camposOpcionales.ocupacion = ocupacion;
  if (horario != null)            camposOpcionales.horario = horario;
  if (frecuencia_visitas != null) camposOpcionales.frecuencia_visitas = frecuencia_visitas;
  if (ambiente != null)           camposOpcionales.ambiente = ambiente;
  if (tolerancia_fiestas != null) camposOpcionales.tolerancia_fiestas = tolerancia_fiestas;
  if (fumador != null)            camposOpcionales.fumador = fumador;
  if (tiene_mascotas != null)     camposOpcionales.tiene_mascotas = tiene_mascotas;
  if (lgbtq_friendly != null)     camposOpcionales.lgbtq_friendly = lgbtq_friendly;
  if (limpieza_orden != null)     camposOpcionales.limpieza_orden = limpieza_orden;
  if (nivel_ruido != null)        camposOpcionales.nivel_ruido = nivel_ruido;
  if (genero != null)           camposOpcionales.genero = genero;
  if (pais != null)             camposOpcionales.pais = pais;
  if (fecha_nacimiento != null) camposOpcionales.fecha_nacimiento = new Date(fecha_nacimiento);

  try {
    const [usuarioActualizado, perfilActualizado] = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.update({
        where: { id: userId },
        data: { nombre, updated_at: new Date() },
        select: { id: true, nombre: true, email: true, fecha_registro: true },
      });

      const perfil = await tx.perfilConvivenciaUsuario.upsert({
        where: { usuario_id: userId },
        create: {
          id: randomUUID(),
          usuario_id: userId,
          genero,
          fecha_nacimiento: new Date(fecha_nacimiento),
          pais,
          ocupacion,
          horario,
          frecuencia_visitas,
          ambiente,
          tolerancia_fiestas,
          fumador,
          tiene_mascotas,
          lgbtq_friendly,
          limpieza_orden,
          nivel_ruido,
          sobre_mi,
        },
        update: {
          sobre_mi,
          updated_at: new Date(),
          ...camposOpcionales,
        },
      });

      return [usuario, perfil];
    });

    res.json({ user: usuarioActualizado, perfil: perfilActualizado });
  } catch (err) {
    next(err);
  }
};

const MAX_FOTOS_USUARIO = 4

// ── GET /api/perfil/fotos ─────────────────────────────────────
export const getFotos = async (req, res, next) => {
  try {
    const fotos = await prisma.fotoUsuario.findMany({
      where: { usuario_id: req.userId },
      select: { id: true, url: true, orden: true },
      orderBy: { orden: 'asc' },
    });
    res.json({ fotos });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/perfil/fotos ─────────────────────────────────────
export const subirFotos = async (req, res, next) => {
  if (!req.files?.length) return res.status(400).json({ message: 'No se han enviado fotos' });

  try {
    const existentes = await prisma.fotoUsuario.count({ where: { usuario_id: req.userId } });
    if (existentes + req.files.length > MAX_FOTOS_USUARIO) {
      return res.status(400).json({ message: `Puedes tener como máximo ${MAX_FOTOS_USUARIO} fotos` });
    }

    const urls = await Promise.all(req.files.map(file =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'roomies/fotos-usuario', transformation: [{ width: 900, height: 1200, crop: 'fill', gravity: 'auto', quality: 'auto' }] },
          (err, result) => err ? reject(err) : resolve(result.secure_url)
        );
        stream.end(file.buffer);
      })
    ));

    await prisma.fotoUsuario.createMany({
      data: urls.map((url, i) => ({
        id: randomUUID(), usuario_id: req.userId, url, orden: existentes + i,
      })),
    });

    const fotos = await prisma.fotoUsuario.findMany({
      where: { usuario_id: req.userId },
      select: { id: true, url: true, orden: true },
      orderBy: { orden: 'asc' },
    });
    res.json({ fotos });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/perfil/fotos/:fotoId ──────────────────────────
export const eliminarFoto = async (req, res, next) => {
  try {
    const foto = await prisma.fotoUsuario.findFirst({
      where: { id: req.params.fotoId, usuario_id: req.userId },
      select: { id: true, orden: true },
    });
    if (!foto) return res.status(404).json({ message: 'Foto no encontrada' });

    // Se recompactan los órdenes para no dejar huecos: al borrar una foto
    // las siguientes ascienden, de modo que la de orden 0 siempre existe
    // y es la principal.
    await prisma.$transaction([
      prisma.fotoUsuario.delete({ where: { id: foto.id } }),
      prisma.fotoUsuario.updateMany({
        where: { usuario_id: req.userId, orden: { gt: foto.orden } },
        data: { orden: { decrement: 1 } },
      }),
    ]);

    const fotos = await prisma.fotoUsuario.findMany({
      where: { usuario_id: req.userId },
      select: { id: true, url: true, orden: true },
      orderBy: { orden: 'asc' },
    });
    res.json({ fotos });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/perfil/convivencia ────────────────────────────────
export const getConvivencia = async (req, res, next) => {
  try {
    const perfil = await prisma.perfilConvivenciaUsuario.findFirst({
      where: { usuario_id: req.userId },
    });
    res.json({ perfil: perfil ?? null });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/perfil/publico/:userId ───────────────────────────
export const getPerfilPublico = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const [usuarioData, interesesData] = await Promise.all([
      prisma.usuario.findFirst({
        where: { id: userId },
        select: {
          id: true,
          nombre: true,
          fotos: { select: { url: true }, orderBy: { orden: 'asc' } },
          fecha_registro: true,
          perfil_convivencia: {
            select: {
              id: true,
              genero: true,
              fecha_nacimiento: true,
              pais: true,
              sobre_mi: true,
              ocupacion: true,
              horario: true,
              frecuencia_visitas: true,
              ambiente: true,
              tolerancia_fiestas: true,
              fumador: true,
              tiene_mascotas: true,
              lgbtq_friendly: true,
              limpieza_orden: true,
              nivel_ruido: true,
            },
          },
        },
      }),
      prisma.usuarioInteres.findMany({
        where: { usuario_id: userId },
        select: { interes: { select: { id: true, nombre: true, categoria: true } } },
        orderBy: [{ interes: { categoria: 'asc' } }, { interes: { nombre: 'asc' } }],
      }),
    ]);

    if (!usuarioData) return res.status(404).json({ message: 'Usuario no encontrado' });

    const pcu = usuarioData.perfil_convivencia;
    const usuario = {
      id: usuarioData.id,
      nombre: usuarioData.nombre,
      fotos: usuarioData.fotos.map(f => f.url),
      fecha_registro: usuarioData.fecha_registro,
      genero: pcu?.genero ?? null,
      fecha_nacimiento: pcu?.fecha_nacimiento ?? null,
      pais: pcu?.pais ?? null,
      sobre_mi: pcu?.sobre_mi ?? null,
    };
    const convivencia = pcu ? {
      ocupacion: pcu.ocupacion,
      horario: pcu.horario,
      frecuencia_visitas: pcu.frecuencia_visitas,
      ambiente: pcu.ambiente,
      tolerancia_fiestas: pcu.tolerancia_fiestas,
      fumador: pcu.fumador,
      tiene_mascotas: pcu.tiene_mascotas,
      lgbtq_friendly: pcu.lgbtq_friendly,
      limpieza_orden: pcu.limpieza_orden,
      nivel_ruido: pcu.nivel_ruido,
    } : null;

    res.json({ usuario, convivencia, intereses: interesesData.map(ui => ui.interes) });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/perfil/preferencias ─────────────────────────────
export const getPreferencias = async (req, res, next) => {
  try {
    const preferencias = await prisma.preferenciasCompanero.findFirst({
      where: { usuario_id: req.userId },
    });
    res.json({ preferencias: preferencias ?? null });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/perfil/preferencias ─────────────────────────────
export const editarPreferencias = async (req, res, next) => {
  const parsed = preferenciasSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

  const d = parsed.data;
  const campos = {
    ocupacion:               d.ocupacion               ?? null,
    ocupacion_req:           d.ocupacion_req           ?? false,
    horario:                 d.horario                 ?? null,
    horario_req:             d.horario_req             ?? false,
    frecuencia_visitas:      d.frecuencia_visitas      ?? null,
    frecuencia_visitas_req:  d.frecuencia_visitas_req  ?? false,
    ambiente:                d.ambiente                ?? null,
    ambiente_req:            d.ambiente_req            ?? false,
    tolerancia_fiestas:      d.tolerancia_fiestas      ?? null,
    tolerancia_fiestas_req:  d.tolerancia_fiestas_req  ?? false,
    acepta_fumadores:        d.acepta_fumadores        ?? null,
    acepta_fumadores_req:    d.acepta_fumadores_req    ?? false,
    acepta_mascotas:         d.acepta_mascotas         ?? null,
    acepta_mascotas_req:     d.acepta_mascotas_req     ?? false,
    lgbtq_friendly:          d.lgbtq_friendly          ?? null,
    lgbtq_friendly_req:      d.lgbtq_friendly_req      ?? false,
    limpieza_orden:          d.limpieza_orden          ?? null,
    limpieza_orden_req:      d.limpieza_orden_req      ?? false,
    nivel_ruido:             d.nivel_ruido             ?? null,
    nivel_ruido_req:         d.nivel_ruido_req         ?? false,
  };

  try {
    const preferencias = await prisma.preferenciasCompanero.upsert({
      where:  { usuario_id: req.userId },
      create: { id: randomUUID(), usuario_id: req.userId, ...campos },
      update: { ...campos, updated_at: new Date() },
    });
    res.json({ preferencias });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/perfil/intereses ─────────────────────────────────
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

// ── GET /api/perfil/mis-intereses ─────────────────────────────
export const getMisIntereses = async (req, res, next) => {
  try {
    const data = await prisma.usuarioInteres.findMany({
      where: { usuario_id: req.userId },
      select: { interes: { select: { id: true, nombre: true, categoria: true } } },
      orderBy: [{ interes: { categoria: 'asc' } }, { interes: { nombre: 'asc' } }],
    });
    res.json({ intereses: data.map(ui => ui.interes) });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/perfil/intereses ─────────────────────────────────
export const editarIntereses = async (req, res, next) => {
  const parsed = interesesSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

  const { intereses } = parsed.data;
  try {
    await prisma.$transaction([
      prisma.usuarioInteres.deleteMany({ where: { usuario_id: req.userId } }),
      ...(intereses.length > 0
        ? [prisma.usuarioInteres.createMany({
            data: intereses.map(interes_id => ({ usuario_id: req.userId, interes_id })),
          })]
        : []),
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/perfil/cuenta ─────────────────────────────────
export const eliminarCuenta = async (req, res, next) => {
  try {
    const membresia = await prisma.miembroGrupo.findFirst({
      where: { usuario_id: req.userId, activo: true, rol: 'ADMIN' },
      select: { grupo_id: true },
    });
    if (membresia) {
      return res.status(409).json({
        message: 'Eres administrador de un grupo. Transfiere la administración o abandona el grupo antes de eliminar tu cuenta.',
        esAdmin: true,
      });
    }

    const grupos = await prisma.miembroGrupo.findMany({
      where: { usuario_id: req.userId, activo: true },
      select: { grupo_id: true },
    });

    for (const { grupo_id } of grupos) {
      const otros = await prisma.miembroGrupo.count({
        where: { grupo_id, activo: true, usuario_id: { not: req.userId } },
      });
      if (otros === 0) await prisma.grupo.delete({ where: { id: grupo_id } });
    }

    await prisma.usuario.delete({ where: { id: req.userId } });

    res.clearCookie('token', ACCESS_COOKIE_OPTIONS);
    res.clearCookie('refresh_token', REFRESH_COOKIE_OPTIONS);
    res.json({ message: 'Cuenta eliminada' });
  } catch (err) {
    next(err);
  }
};