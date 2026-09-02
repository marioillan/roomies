import { randomUUID } from 'crypto';
import { prisma } from '../src/config/db.js';
import { calcularCompatibilidad } from '../src/utils/compatibilidad.js';

// ─── GET /api/favoritos/publicaciones ───
export const getPublicacionesFavoritas = async (req, res, next) => {
  try {
    const [perfilData, prefData, interesData] = await Promise.all([
      prisma.perfilConvivenciaUsuario.findFirst({ where: { usuario_id: req.userId } }),
      prisma.preferenciasCompanero.findFirst({ where: { usuario_id: req.userId } }),
      prisma.usuarioInteres.findMany({ where: { usuario_id: req.userId }, select: { interes_id: true } }),
    ]);

    const perfilUsuario      = prefData ?? perfilData;
    const interesesUsuarioSet = new Set(interesData.map(i => i.interes_id));

    const rows = await prisma.$queryRaw`
      SELECT
        p.id, p.titulo, p.descripcion, p.ciudad, p.precio,
        p.habitaciones_libres, p.tipo_piso, p.tamano_piso,
        p.wifi, p.amueblado, p.parking, p.permite_mascotas,
        p.telefono_contacto, p.modo_contacto,
        p.fecha_publicacion,
        g.nombre      AS nombre_grupo,
        g.id          AS grupo_id,
        g.foto_perfil AS foto_grupo,
        (SELECT json_agg(f.url ORDER BY f.orden ASC)
         FROM fotos_publicacion f
         WHERE f.publicacion_id = p.id) AS fotos,
        (SELECT json_agg(json_build_object('id', gii.interes_id, 'nombre', ii.nombre))
         FROM grupo_intereses gii
         JOIN intereses ii ON ii.id = gii.interes_id
         WHERE gii.grupo_id = g.id) AS intereses_grupo,
        pcg.horario, pcg.ambiente, pcg.frecuencia_visitas,
        pcg.tolerancia_fiestas, pcg.ocupacion,
        fav.fecha_guardado
      FROM favoritos fav
      JOIN publicaciones p ON p.id = fav.publicacion_id
      JOIN grupos g ON g.id = p.grupo_id
      LEFT JOIN perfiles_convivencia_grupo pcg ON pcg.grupo_id = g.id
      WHERE fav.usuario_id = ${req.userId}
      ORDER BY fav.fecha_guardado DESC
    `;

    const publicaciones = rows.map(pub => {
      const { intereses_grupo, horario, ambiente, frecuencia_visitas, tolerancia_fiestas, ocupacion, ...resto } = pub;

      const pcg = { horario, ambiente, frecuencia_visitas, tolerancia_fiestas, ocupacion };
      const tienePcg = Object.values(pcg).some(v => v != null);
      const compatibilidad = (perfilUsuario && tienePcg)
        ? calcularCompatibilidad(perfilUsuario, pcg).score
        : null;

      const intereses_comunes = interesesUsuarioSet.size > 0
        ? (intereses_grupo ?? []).filter(i => interesesUsuarioSet.has(Number(i.id))).map(i => i.nombre)
        : [];

      return { ...resto, compatibilidad, intereses_comunes };
    });

    res.json({ publicaciones });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/favoritos ───
export const getFavoritos = async (req, res) => {
  const favoritos = await prisma.favorito.findMany({
    where: { usuario_id: req.userId },
    select: { publicacion_id: true },
  });
  res.json({ favoritos: favoritos.map(f => f.publicacion_id) });
};

// ─── POST /api/favoritos/:publicacionId — toggle ───
export const toggleFavorito = async (req, res) => {
  const { publicacionId } = req.params;

  const existente = await prisma.favorito.findFirst({
    where: { usuario_id: req.userId, publicacion_id: publicacionId },
    select: { id: true },
  });

  if (existente) {
    await prisma.favorito.delete({ where: { id: existente.id } });
    return res.json({ guardado: false });
  }

  await prisma.favorito.create({
    data: { id: randomUUID(), usuario_id: req.userId, publicacion_id: publicacionId },
  });
  res.json({ guardado: true });
};
