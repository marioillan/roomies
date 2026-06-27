import { randomUUID } from 'crypto';
import { prisma } from '../src/config/db.js';

// ── GET /api/favoritos/publicaciones ─────────────────────────
export const getPublicacionesFavoritas = async (req, res) => {
  const publicaciones = await prisma.$queryRaw`
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
      fav.fecha_guardado
    FROM favoritos fav
    JOIN publicaciones p ON p.id = fav.publicacion_id
    JOIN grupos g ON g.id = p.grupo_id
    WHERE fav.usuario_id = ${req.userId}
    ORDER BY fav.fecha_guardado DESC
  `;
  res.json({ publicaciones });
};

// ── GET /api/favoritos ────────────────────────────────────────
export const getFavoritos = async (req, res) => {
  const favoritos = await prisma.favorito.findMany({
    where: { usuario_id: req.userId },
    select: { publicacion_id: true },
  });
  res.json({ favoritos: favoritos.map(f => f.publicacion_id) });
};

// ── POST /api/favoritos/:publicacionId — toggle ───────────────
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
