export const CARD_SHADOW = { boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }

export const PASTEL = [
  { bg: '#fce7f3', icon: '#ec4899' },
  { bg: '#d1fae5', icon: '#10b981' },
  { bg: '#fef3c7', icon: '#f59e0b' },
  { bg: '#ede9fe', icon: '#8b5cf6' },
  { bg: '#dbeafe', icon: '#3b82f6' },
]

export const DONUTS_CONFIG_USUARIO = [
  { campo: 'frecuencia_salidas', sublabel: 'Sociable',    color: '#ec4899', labels: { NUNCA: 'Reservada',  OCASIONAL: 'Equilibrada', FRECUENTE: 'Sociable'  } },
  { campo: 'tolerancia_fiestas', sublabel: 'Fiestera',    color: '#8b5cf6', labels: { NUNCA: 'Tranquila',  OCASIONAL: 'A veces',     FRECUENTE: 'Fiestera'  } },
  { campo: 'frecuencia_visitas', sublabel: 'Visitas',     color: '#06b6d4', labels: { CASI_NUNCA: 'Solo yo', A_VECES: 'A veces',     FRECUENTE: 'Open house'} },
  { campo: 'ambiente',           sublabel: 'Orden',       color: '#10b981', labels: { TRANQUILO: 'Caótica', EQUILIBRADO: 'Ordenada', SOCIAL: 'Impecable'    } },
  { campo: 'horario',            sublabel: 'Madrugadora', color: '#f59e0b', labels: { MADRUGADOR: 'Alondra', INTERMEDIO: 'Flexible',  NOCTURNO: 'Búho'       } },
  { campo: 'ocupacion',          sublabel: 'Cocina',      color: '#3b82f6', labels: { ESTUDIO: 'Delivery',  TRABAJO: 'A veces',      ESTUDIO_Y_TRABAJO: 'Chef'} },
  { campo: 'tiene_mascotas',     sublabel: 'Mascotas',    color: '#f97316', labels: { true: 'Amo animales', false: 'Mejor no'        } },
  { campo: 'fumador',            sublabel: 'Fuma',        color: '#64748b', labels: { true: 'A diario',     false: 'Nunca'           } },
]

export const DONUTS_CONFIG_GRUPO = [
  { campo: 'horario',            sublabel: 'Ritmo del piso',   color: '#f59e0b', labels: { MADRUGADOR: 'Tempraneros', INTERMEDIO: 'Flexible',    NOCTURNO: 'Nocturnos'     } },
  { campo: 'ambiente',           sublabel: 'Ambiente',         color: '#10b981', labels: { TRANQUILO: 'Tranquilo',   EQUILIBRADO: 'Equilibrado', SOCIAL: 'Animado'         } },
  { campo: 'frecuencia_visitas', sublabel: 'Visitas',          color: '#06b6d4', labels: { CASI_NUNCA: 'Pocas',      A_VECES: 'A veces',         FRECUENTE: 'Open house'   } },
  { campo: 'tolerancia_fiestas', sublabel: 'Fiestas en casa',  color: '#8b5cf6', labels: { NUNCA: 'Sin fiestas',    OCASIONAL: 'A veces',       FRECUENTE: 'Fiesteros'    } },
  { campo: 'frecuencia_salidas', sublabel: 'Salidas',          color: '#ec4899', labels: { NUNCA: 'En casa',        OCASIONAL: 'A veces',       FRECUENTE: 'Muy activos'  } },
  { campo: 'ocupacion',          sublabel: 'Ocupación',        color: '#3b82f6', labels: { ESTUDIO: 'Estudiantes',  TRABAJO: 'Trabajadores',    ESTUDIO_Y_TRABAJO: 'Ambas'} },
  { campo: 'acepta_fumadores',   sublabel: 'Fumar en casa',    color: '#64748b', labels: { SI: 'Se permite',        NO: 'No se fuma',           INDIFERENTE: 'Indiferente'} },
  { campo: 'acepta_mascotas',    sublabel: 'Mascotas',         color: '#f97316', labels: { SI: 'Bienvenidas',       NO: 'Sin mascotas',         DEPENDE: 'Depende'        } },
]

export const CHIPS_META = {
  ocupacion:          { labels: { ESTUDIO: 'Estudiante', TRABAJO: 'Trabajador/a', ESTUDIO_Y_TRABAJO: 'Estudia y trabaja' } },
  horario:            { labels: { MADRUGADOR: 'Madrugador/a', INTERMEDIO: 'Horario intermedio', NOCTURNO: 'Nocturno/a' } },
  frecuencia_visitas: { labels: { CASI_NUNCA: 'Pocas visitas', A_VECES: 'Visitas ocasionales', FRECUENTE: 'Muchas visitas' } },
  ambiente:           { labels: { TRANQUILO: 'Ambiente tranquilo', EQUILIBRADO: 'Equilibrado', SOCIAL: 'Ambiente social' } },
  tolerancia_fiestas: { labels: { NUNCA: 'Sin fiestas', OCASIONAL: 'Fiestas ocasionales', FRECUENTE: 'Fiestas frecuentes' } },
  frecuencia_salidas: { labels: { NUNCA: 'No sale de noche', OCASIONAL: 'Sale ocasionalmente', FRECUENTE: 'Sale frecuentemente' } },
  fumador:            { labels: { true: 'Fumador/a', false: 'No fumador/a' } },
  acepta_fumadores:   { labels: { SI: 'Acepta fumadores', NO: 'No acepta fumadores', INDIFERENTE: 'Indiferente al tabaco' } },
  tiene_mascotas:     { labels: { true: 'Tiene mascotas', false: 'Sin mascotas' } },
  acepta_mascotas:    { labels: { SI: 'Acepta mascotas', NO: 'No acepta mascotas', DEPENDE: 'Mascotas según el caso' } },
  lgbtq_friendly:     { labels: { true: 'LGBTQ+ friendly' } },
}

const CAMPOS_CONVIVENCIA = [
  'ocupacion', 'horario', 'frecuencia_visitas', 'ambiente',
  'tolerancia_fiestas', 'frecuencia_salidas', 'fumador',
  'acepta_fumadores', 'tiene_mascotas', 'acepta_mascotas', 'lgbtq_friendly',
]

export function calcEdad(fecha) {
  if (!fecha) return null
  const nac = new Date(fecha)
  const hoy = new Date()
  let a = hoy.getFullYear() - nac.getFullYear()
  if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) a--
  return a
}

export function calcChips(convivencia) {
  if (!convivencia) return []
  const chips = []
  for (const [campo, meta] of Object.entries(CHIPS_META)) {
    const val = convivencia[campo]
    if (val === null || val === undefined) continue
    const label = meta.labels[String(val)]
    if (label) chips.push(label)
  }
  return chips
}

export function calcPct(convivencia) {
  if (!convivencia) return 0
  return Math.round(
    CAMPOS_CONVIVENCIA.filter(c => {
      const v = convivencia[c]
      return v !== null && v !== undefined
    }).length / CAMPOS_CONVIVENCIA.length * 100
  )
}
