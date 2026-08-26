export const CARD_SHADOW = { boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }

export const PASTEL = [
  { bg: '#fce7f3', icon: '#ec4899' },
  { bg: '#d1fae5', icon: '#10b981' },
  { bg: '#fef3c7', icon: '#f59e0b' },
  { bg: '#ede9fe', icon: '#8b5cf6' },
  { bg: '#dbeafe', icon: '#3b82f6' },
]

export const labelsUsuario = {
  horario: {
    MADRUGADOR: 'Me levanto temprano',
    INTERMEDIO:  'Horario flexible',
    NOCTURNO:    'Me acuesto tarde',
  },
  ambiente: {
    TRANQUILO:   'Prefiero ambiente tranquilo',
    EQUILIBRADO: 'Me adapto a cualquier ambiente',
    SOCIAL:      'Me gusta que haya vida en casa',
  },
  frecuencia_visitas: {
    CASI_NUNCA: 'Raramente tengo visitas',
    A_VECES:    'Tengo visitas de vez en cuando',
    FRECUENTE:  'Casa abierta para los amigos',
  },
  tolerancia_fiestas: {
    NUNCA:     'No me gustan las fiestas en casa',
    OCASIONAL: 'De vez en cuando está bien',
    FRECUENTE: 'El finde es para celebrarlo',
  },
  ocupacion: {
    ESTUDIO:           'Soy estudiante',
    TRABAJO:           'Trabajo',
    ESTUDIO_Y_TRABAJO: 'Estudio y trabajo',
  },
  limpieza_orden: {
    DESPREOCUPADO: 'No me preocupa demasiado el orden',
    FLEXIBLE:      'Soy flexible con la limpieza',
    ORDENADO:      'Me gusta tener todo ordenado',
  },
  nivel_ruido: {
    SILENCIO_TOTAL: 'Prefiero silencio en casa',
    MODERADO:       'Tolero un nivel moderado de ruido',
    ALTO:           'El ruido no me molesta',
  },
}

export const labelsGrupo = {
  horario: {
    MADRUGADOR: 'El piso madruga',
    INTERMEDIO:  'Horario flexible',
    NOCTURNO:    'El piso es nocturno',
  },
  ambiente: {
    TRANQUILO:   'Ambiente tranquilo',
    EQUILIBRADO: 'Ambiente equilibrado',
    SOCIAL:      'Nos gusta que haya vida en casa',
  },
  frecuencia_visitas: {
    CASI_NUNCA: 'Raramente tenemos visitas',
    A_VECES:    'Visitas de vez en cuando',
    FRECUENTE:  'Casa abierta para los amigos',
  },
  tolerancia_fiestas: {
    NUNCA:     'No nos gustan las fiestas en casa',
    OCASIONAL: 'De vez en cuando está bien',
    FRECUENTE: 'El finde es para celebrarlo',
  },
  ocupacion: {
    ESTUDIO:           'Somos estudiantes',
    TRABAJO:           'Trabajamos',
    ESTUDIO_Y_TRABAJO: 'Estudiamos y trabajamos',
  },
  limpieza_orden: {
    DESPREOCUPADO: 'No nos preocupa demasiado el orden',
    FLEXIBLE:      'Somos flexibles con la limpieza',
    ORDENADO:      'Nos gusta tener todo ordenado',
  },
  nivel_ruido: {
    SILENCIO_TOTAL: 'Preferimos silencio en casa',
    MODERADO:       'Toleramos un nivel moderado de ruido',
    ALTO:    'El ruido no nos molesta',
  },
}

export const TARJETAS_CONVIVENCIA_USUARIO = [
  { campo: 'horario',            sublabel: 'Horario',  color: '#f59e0b' },
  { campo: 'ambiente',           sublabel: 'Ambiente', color: '#10b981' },
  { campo: 'frecuencia_visitas', sublabel: 'Visitas',  color: '#06b6d4' },
  { campo: 'tolerancia_fiestas', sublabel: 'Fiestas',  color: '#8b5cf6' },
  { campo: 'limpieza_orden',     sublabel: 'Limpieza', color: '#14b8a6' },
  { campo: 'nivel_ruido',        sublabel: 'Ruido',    color: '#f97316' },
]

export const TARJETAS_CONVIVENCIA_GRUPO = [
  { campo: 'horario',            sublabel: 'Ritmo',    color: '#f59e0b' },
  { campo: 'ambiente',           sublabel: 'Ambiente', color: '#10b981' },
  { campo: 'frecuencia_visitas', sublabel: 'Visitas',  color: '#06b6d4' },
  { campo: 'tolerancia_fiestas', sublabel: 'Fiestas',  color: '#8b5cf6' },
  { campo: 'limpieza_orden',     sublabel: 'Limpieza', color: '#14b8a6' },
  { campo: 'nivel_ruido',        sublabel: 'Ruido',    color: '#f97316' },
]

export const CHIPS_META = {
  ocupacion:          { labels: { ESTUDIO: 'Estudiante', TRABAJO: 'Trabajador/a', ESTUDIO_Y_TRABAJO: 'Estudia y trabaja' } },
  horario:            { labels: { MADRUGADOR: 'Madrugador/a', INTERMEDIO: 'Horario intermedio', NOCTURNO: 'Nocturno/a' } },
  frecuencia_visitas: { labels: { CASI_NUNCA: 'Pocas visitas', A_VECES: 'Visitas ocasionales', FRECUENTE: 'Muchas visitas' } },
  ambiente:           { labels: { TRANQUILO: 'Ambiente tranquilo', EQUILIBRADO: 'Equilibrado', SOCIAL: 'Ambiente social' } },
  tolerancia_fiestas: { labels: { NUNCA: 'Sin fiestas', OCASIONAL: 'Fiestas ocasionales', FRECUENTE: 'Fiestas frecuentes' } },
  fumador:            { labels: { true: 'Fumador/a', false: 'No fumador/a' } },
  acepta_fumadores:   { labels: { SI: 'Acepta fumadores', NO: 'No acepta fumadores', INDIFERENTE: 'Indiferente al tabaco' } },
  tiene_mascotas:     { labels: { true: 'Tiene mascotas', false: 'Sin mascotas' } },
  acepta_mascotas:    { labels: { SI: 'Acepta mascotas', NO: 'No acepta mascotas', DEPENDE: 'Mascotas según el caso' } },
  lgbtq_friendly:     { labels: { true: 'LGBTQ+ friendly' } },
}


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