import jwt from 'jsonwebtoken';
import { prisma } from '../src/config/db.js';
import { calcularCompatibilidad, calcularScore, fusionarPerfil } from '../src/utils/compatibilidad.js';
import { TIPOS_VALIDOS, GENEROS_VALIDOS, ORDENES_VALIDOS } from '../validators/publicacionesValidator.js';

// GET /api/publicaciones
export const buscarPublicaciones = async (req, res, next) => {
  const {
    ciudad, page = 1, precio_min, precio_max, habitaciones_min,
    tipo_piso, amueblado, wifi, mascotas, parking, lavadora,
    aire_acondicionado, calefaccion, ascensor, permite_fumar,
    genero_preferido, ordenar, intereses,
  } = req.query;

  const interesesFiltroIds = intereses
    ? intereses.split(',').map(Number).filter(n => Number.isInteger(n) && n > 0)
    : [];

  const limit  = 12;
  const offset = (Math.max(1, parseInt(page)) - 1) * limit;

  // Auth opcional
  let perfilUsuario       = null;
  let preferenciasUsuario = null;
  let interesesUsuarioIds = [];
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [perfil, preferencias, interesData] = await Promise.all([
        prisma.perfilConvivenciaUsuario.findFirst({ where: { usuario_id: decoded.id } }),
        prisma.preferenciasCompanero.findFirst({ where: { usuario_id: decoded.id } }),
        prisma.usuarioInteres.findMany({ where: { usuario_id: decoded.id }, select: { interes_id: true } }),
      ]);
      perfilUsuario = fusionarPerfil(perfil, preferencias);
      preferenciasUsuario = preferencias;
      interesesUsuarioIds = interesData.map(i => i.interes_id);
    }
  } catch { /* sin sesión o token inválido — continuamos sin matching */ }

  // Filtros de búsqueda
  const params     = [];
  const conditions = ['p.visible = TRUE'];

  if (ciudad && ciudad.trim().length >= 2) {
    params.push(ciudad.trim());
    conditions.push(`LOWER(p.ciudad) = LOWER($${params.length})`);
  }
  if (precio_min && !isNaN(parseFloat(precio_min))) {
    params.push(parseFloat(precio_min));
    conditions.push(`p.precio >= $${params.length}`);
  }
  if (precio_max && !isNaN(parseFloat(precio_max))) {
    params.push(parseFloat(precio_max));
    conditions.push(`p.precio <= $${params.length}`);
  }
  if (habitaciones_min && !isNaN(parseInt(habitaciones_min))) {
    params.push(parseInt(habitaciones_min));
    conditions.push(`p.habitaciones_libres >= $${params.length}`);
  }
  if (tipo_piso && TIPOS_VALIDOS.includes(tipo_piso)) {
    params.push(tipo_piso);
    conditions.push(`p.tipo_piso = $${params.length}`);
  }
  if (amueblado          === 'true') conditions.push('p.amueblado = TRUE');
  if (wifi               === 'true') conditions.push('p.wifi = TRUE');
  if (mascotas           === 'true') conditions.push('p.permite_mascotas = TRUE');
  if (parking            === 'true') conditions.push('p.parking = TRUE');
  if (lavadora           === 'true') conditions.push('p.lavadora = TRUE');
  if (aire_acondicionado === 'true') conditions.push('p.aire_acondicionado = TRUE');
  if (calefaccion        === 'true') conditions.push('p.calefaccion = TRUE');
  if (ascensor           === 'true') conditions.push('p.ascensor = TRUE');
  if (permite_fumar      === 'true') conditions.push('p.permite_fumar = TRUE');
  if (genero_preferido && GENEROS_VALIDOS.includes(genero_preferido)) {
    params.push(genero_preferido);
    conditions.push(`(p.genero_preferido = $${params.length} OR p.genero_preferido = 'INDIFERENTE' OR p.genero_preferido IS NULL)`);
  }

  // Filtros duros de compatibilidad
  const tieneMatching = !!perfilUsuario;
  if (tieneMatching) {
    // Filtros por preferencias marcadas como obligatorias
    if (preferenciasUsuario) {
      const pref = preferenciasUsuario;
      const camposOrdinales = [
        ['horario',            'horario'],
        ['ambiente',           'ambiente'],
        ['frecuencia_visitas', 'frecuencia_visitas'],
        ['tolerancia_fiestas', 'tolerancia_fiestas'],
        ['ocupacion',          'ocupacion'],
        ['limpieza_orden',     'limpieza_orden'],
        ['nivel_ruido',        'nivel_ruido'],
      ];
      for (const [campoPref, campoGrupo] of camposOrdinales) {
        if (pref[campoPref] && pref[`${campoPref}_req`] === true) {
          params.push(pref[campoPref]);
          conditions.push(`(pcg.${campoGrupo} IS NULL OR pcg.${campoGrupo}::text = $${params.length})`);
        }
      }
      if (pref.acepta_fumadores && pref.acepta_fumadores_req === true) {
        if (pref.acepta_fumadores === 'NO') {
          conditions.push(`(pcg.acepta_fumadores IS NULL OR pcg.acepta_fumadores != 'SI')`);
          conditions.push(`(p.permite_fumar IS NULL OR p.permite_fumar = FALSE)`);
        }
        if (pref.acepta_fumadores === 'SI') {
          conditions.push(`(pcg.acepta_fumadores IS NULL OR pcg.acepta_fumadores = 'SI')`);
          conditions.push(`p.permite_fumar = TRUE`);
        }
      }
      if (pref.acepta_mascotas && pref.acepta_mascotas_req === true) {
        if (pref.acepta_mascotas === 'NO') conditions.push(`(pcg.acepta_mascotas IS NULL OR pcg.acepta_mascotas != 'SI')`);
        if (pref.acepta_mascotas === 'SI') {
          conditions.push(`(pcg.acepta_mascotas IS NULL OR pcg.acepta_mascotas IN ('SI', 'DEPENDE'))`);
          conditions.push(`p.permite_mascotas = TRUE`);
        }
      }
      if (pref.lgbtq_friendly !== null && pref.lgbtq_friendly !== undefined && pref.lgbtq_friendly_req === true) {
        if (pref.lgbtq_friendly === true) conditions.push(`(pcg.lgbtq_friendly IS NULL OR pcg.lgbtq_friendly = TRUE)`);
      }
    }

    // Filtros duros fijos: se aplican siempre, existan o no preferencias.
    // Excluyen grupos incompatibles con las características del propio usuario.
    const perfil = perfilUsuario;
    if (perfil.fumador        === true) conditions.push(`(pcg.acepta_fumadores IS NULL OR pcg.acepta_fumadores != 'NO')`);
    if (perfil.tiene_mascotas === true) conditions.push(`(pcg.acepta_mascotas  IS NULL OR pcg.acepta_mascotas  != 'NO')`);
    if (perfil.lgbtq_friendly === true) conditions.push(`(pcg.lgbtq_friendly   IS NULL OR pcg.lgbtq_friendly   = TRUE)`);
  }

  // Filtro por intereses seleccionados (OR: grupos que tengan al menos uno)
  if (interesesFiltroIds.length > 0) {
    const startIdx = params.length + 1;
    params.push(...interesesFiltroIds);
    const placeholders = interesesFiltroIds.map((_, i) => `$${startIdx + i}`).join(',');
    conditions.push(`EXISTS (SELECT 1 FROM grupo_intereses gi WHERE gi.grupo_id = g.id AND gi.interes_id IN (${placeholders}))`);
  }

  const where = conditions.join(' AND ');

  const tieneUsuario    = interesesUsuarioIds.length > 0;
  const interesesUsuarioSet = new Set(interesesUsuarioIds);

  const selectBase = `
    SELECT
      p.id, p.titulo, p.descripcion, p.ciudad, p.precio,
      p.habitaciones_libres, p.habitaciones_totales,
      p.tipo_piso, p.tamano_piso,
      p.amueblado, p.wifi, p.parking, p.permite_mascotas, p.permite_fumar,
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
       WHERE gii.grupo_id = g.id) AS intereses_grupo
      ${tieneMatching ? `,
      pcg.horario            AS pcg_horario,
      pcg.ambiente           AS pcg_ambiente,
      pcg.frecuencia_visitas AS pcg_frecuencia_visitas,
      pcg.tolerancia_fiestas AS pcg_tolerancia_fiestas,
      pcg.ocupacion          AS pcg_ocupacion,
      pcg.limpieza_orden     AS pcg_limpieza_orden,
      pcg.nivel_ruido        AS pcg_nivel_ruido` : ''}
    FROM publicaciones p
    JOIN grupos g ON g.id = p.grupo_id
    ${tieneMatching ? 'LEFT JOIN perfiles_convivencia_grupo pcg ON pcg.grupo_id = g.id' : ''}
    WHERE ${where}`;

  const calcComunes = (pub) => {
    if (!tieneUsuario) return [];
    const items = pub.intereses_grupo ?? [];
    return items
      .filter(item => interesesUsuarioSet.has(Number(item.id)))
      .map(item => item.nombre);
  };

  try {
    if (tieneMatching) {
      const rows = await prisma.$queryRawUnsafe(selectBase, ...params);

      const conScore = rows.map(pub => {
        const tienePerfilGrupo = pub.pcg_horario !== null || pub.pcg_ambiente !== null
          || pub.pcg_frecuencia_visitas !== null || pub.pcg_tolerancia_fiestas !== null
          || pub.pcg_ocupacion !== null || pub.pcg_limpieza_orden !== null
          || pub.pcg_nivel_ruido !== null;

        const score = tienePerfilGrupo ? calcularScore(perfilUsuario, pub) : null;
        const { intereses_grupo, pcg_horario, pcg_ambiente, pcg_frecuencia_visitas, pcg_tolerancia_fiestas, pcg_ocupacion, pcg_limpieza_orden, pcg_nivel_ruido, ...resto } = pub;
        return { ...resto, compatibilidad: score, intereses_comunes: calcComunes(pub) };
      });

      if (ordenar === 'precio_asc')  conScore.sort((a, b) => a.precio - b.precio);
      else if (ordenar === 'precio_desc') conScore.sort((a, b) => b.precio - a.precio);
      // Con null en compatibilidad, una resta directa daría NaN y dejaría el
      // orden indefinido; los grupos sin perfil quedan al final.
      else conScore.sort((a, b) => (b.compatibilidad ?? -1) - (a.compatibilidad ?? -1));

      const total     = conScore.length;
      const paginadas = conScore.slice(offset, offset + limit);

      return res.json({
        publicaciones: paginadas,
        total,
        pagina:  parseInt(page),
        paginas: Math.ceil(total / limit) || 1,
      });
    }

    // Sin matching — paginación SQL estándar
    const countParams = [...params];
    params.push(limit, offset);

    const ordenSQL = ORDENES_VALIDOS.includes(ordenar)
      ? (ordenar === 'precio_asc' ? 'p.precio ASC' : 'p.precio DESC')
      : 'p.fecha_publicacion DESC';

    const rows = await prisma.$queryRawUnsafe(
      `${selectBase} ORDER BY ${ordenSQL} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      ...params
    );

    const countRows = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) FROM publicaciones p JOIN grupos g ON g.id = p.grupo_id WHERE ${where}`,
      ...countParams
    );

    const total = Number(countRows[0].count);

    res.json({
      publicaciones: rows.map(pub => {
        const { intereses_grupo, ...resto } = pub;
        return { ...resto, compatibilidad: null, intereses_comunes: calcComunes(pub) };
      }),
      total,
      pagina:  parseInt(page),
      paginas: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/publicaciones/:id
export const getPublicacion = async (req, res, next) => {
  try {
    const pubs = await prisma.$queryRaw`
      SELECT p.*,
             g.nombre           AS nombre_grupo,
             g.foto_perfil      AS foto_grupo,
             g.id               AS grupo_id,
             g.descripcion      AS descripcion_grupo,
             g.buscar_companero AS buscar_companero_grupo
      FROM publicaciones p
      JOIN grupos g ON g.id = p.grupo_id
      WHERE p.id = ${req.params.id} AND p.visible = TRUE
    `;
    if (!pubs.length) return res.status(404).json({ message: 'Anuncio no encontrado' });
    const pub = pubs[0];

    // Auth opcional para matching
    let perfilUsuario = null;
    try {
      const token = req.cookies?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [perfil, preferencias] = await Promise.all([
          prisma.perfilConvivenciaUsuario.findFirst({ where: { usuario_id: decoded.id } }),
          prisma.preferenciasCompanero.findFirst({ where: { usuario_id: decoded.id } }),
        ]);
        perfilUsuario = fusionarPerfil(perfil, preferencias);
      }
    } catch { /* sin sesión — continuamos sin matching */ }

    const [fotos, miembrosData, guardados, mensajes, pcg, interesesData] = await Promise.all([
      prisma.fotoPublicacion.findMany({
        where: { publicacion_id: req.params.id },
        select: { id: true, url: true, orden: true },
        orderBy: { orden: 'asc' },
      }),
      prisma.miembroGrupo.findMany({
        where: { grupo_id: pub.grupo_id, activo: true },
        select: {
          rol: true, fecha_union: true,
          usuario: { select: { id: true, nombre: true, fotos: { where: { orden: 0 }, select: { url: true }, take: 1 } } },
        },
        orderBy: [{ rol: 'asc' }, { fecha_union: 'asc' }],
      }),
      prisma.favorito.count({ where: { publicacion_id: req.params.id } }),
      prisma.solicitudContacto.count({ where: { grupo_id: pub.grupo_id } }),
      prisma.perfilConvivenciaGrupo.findFirst({ where: { grupo_id: pub.grupo_id } }),
      prisma.grupoInteres.findMany({
        where: { grupo_id: pub.grupo_id },
        select: { interes: { select: { id: true, nombre: true, categoria: true } } },
        orderBy: [{ interes: { categoria: 'asc' } }, { interes: { nombre: 'asc' } }],
      }),
    ]);

    const miembros = miembrosData.map(mg => ({
      id: mg.usuario.id, nombre: mg.usuario.nombre, foto_perfil: mg.usuario.fotos[0]?.url ?? null,
      rol_en_grupo: mg.rol, fecha_union: mg.fecha_union,
    }));

    const compatibilidad = (perfilUsuario && pcg)
      ? calcularCompatibilidad(perfilUsuario, pcg)
      : null;

    res.json({
      publicacion:  pub,
      fotos,
      miembros,
      stats:        { guardados, mensajes },
      compatibilidad,
      convivencia:  pcg ?? null,
      intereses:    interesesData.map(gi => gi.interes),
    });
  } catch (err) {
    next(err);
  }
};
