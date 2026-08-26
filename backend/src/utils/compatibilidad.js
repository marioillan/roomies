const DIMENSIONES_FUSIONABLES = [
  'ocupacion', 'horario', 'ambiente', 'frecuencia_visitas',
  'tolerancia_fiestas', 'limpieza_orden', 'nivel_ruido',
]

export function fusionarPerfil(perfil, preferencias) {
  if (!perfil)       return preferencias ?? null
  if (!preferencias) return perfil

  const fusionado = { ...perfil }
  for (const campo of DIMENSIONES_FUSIONABLES) {
    const valor = preferencias[campo]
    if (valor !== null && valor !== undefined) fusionado[campo] = valor
  }
  return fusionado
}

const ORDEN = {
  horario:            { MADRUGADOR: 0, INTERMEDIO: 1, NOCTURNO: 2 },
  ambiente:           { TRANQUILO: 0, EQUILIBRADO: 1, SOCIAL: 2 },
  frecuencia_visitas: { CASI_NUNCA: 0, A_VECES: 1, FRECUENTE: 2 },
  tolerancia_fiestas: { NUNCA: 0, OCASIONAL: 1, FRECUENTE: 2 },
  limpieza_orden:     { DESPREOCUPADO: 0, FLEXIBLE: 1, ORDENADO: 2 },
  nivel_ruido:        { SILENCIO_TOTAL: 0, MODERADO: 1, ALTO: 2 },
}

function matchOrdinal(valorUsuario, valorGrupo, campo) {
  const orden = ORDEN[campo]
  if (!valorUsuario || !valorGrupo || !orden) return 0.5
  const diff = Math.abs(orden[valorUsuario] - orden[valorGrupo])
  return diff === 0 ? 1.0 : diff === 1 ? 0.5 : 0.0
}

function matchOcupacion(u, g) {
  if (!u || !g) return 0.5
  if (u === g) return 1.0
  if (u === 'ESTUDIO_Y_TRABAJO' || g === 'ESTUDIO_Y_TRABAJO') return 0.5
  return 0.5
}

export function calcularCompatibilidad(usuario, pcg) {
  const mHorario   = matchOrdinal(usuario.horario,            pcg.horario,            'horario')
  const mLimpieza  = matchOrdinal(usuario.limpieza_orden,     pcg.limpieza_orden,     'limpieza_orden')
  const mAmbiente  = matchOrdinal(usuario.ambiente,           pcg.ambiente,           'ambiente')
  const mRuido     = matchOrdinal(usuario.nivel_ruido,        pcg.nivel_ruido,        'nivel_ruido')
  const mVisitas   = matchOrdinal(usuario.frecuencia_visitas, pcg.frecuencia_visitas, 'frecuencia_visitas')
  const mFiestas   = matchOrdinal(usuario.tolerancia_fiestas, pcg.tolerancia_fiestas, 'tolerancia_fiestas')
  const mOcup      = matchOcupacion(usuario.ocupacion,        pcg.ocupacion)

  const score = Math.round(
    (mHorario  * 0.20 +
     mLimpieza * 0.20 +
     mAmbiente * 0.15 +
     mRuido    * 0.15 +
     mVisitas  * 0.10 +
     mFiestas  * 0.10 +
     mOcup     * 0.10) * 100
  )

  return {
    score,
    desglose: {
      horario:        mHorario,
      limpieza_orden: mLimpieza,
      ambiente:       mAmbiente,
      nivel_ruido:    mRuido,
      frecuencia_visitas: mVisitas,
      tolerancia_fiestas: mFiestas,
      ocupacion:      mOcup,
    },
  }
}

export function calcularScore(usuario, grupo) {
  return calcularCompatibilidad(usuario, {
    horario:            grupo.pcg_horario,
    ambiente:           grupo.pcg_ambiente,
    frecuencia_visitas: grupo.pcg_frecuencia_visitas,
    tolerancia_fiestas: grupo.pcg_tolerancia_fiestas,
    ocupacion:          grupo.pcg_ocupacion,
    limpieza_orden:     grupo.pcg_limpieza_orden,
    nivel_ruido:        grupo.pcg_nivel_ruido,
  }).score
}
