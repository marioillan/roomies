const ORDEN = {
  horario:            { MADRUGADOR: 0, INTERMEDIO: 1, NOCTURNO: 2 },
  ambiente:           { TRANQUILO: 0, EQUILIBRADO: 1, SOCIAL: 2 },
  frecuencia_visitas: { CASI_NUNCA: 0, A_VECES: 1, FRECUENTE: 2 },
  tolerancia_fiestas: { NUNCA: 0, OCASIONAL: 1, FRECUENTE: 2 },
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
  const mHorario  = matchOrdinal(usuario.horario,            pcg.horario,            'horario')
  const mAmbiente = matchOrdinal(usuario.ambiente,           pcg.ambiente,           'ambiente')
  const mVisitas  = matchOrdinal(usuario.frecuencia_visitas, pcg.frecuencia_visitas, 'frecuencia_visitas')
  const mFiestas  = matchOrdinal(usuario.tolerancia_fiestas, pcg.tolerancia_fiestas, 'tolerancia_fiestas')
  const mOcup     = matchOcupacion(usuario.ocupacion,        pcg.ocupacion)

  const score = Math.round(
    (mHorario  * 0.25 +
     mAmbiente * 0.25 +
     mVisitas  * 0.20 +
     mFiestas  * 0.20 +
     mOcup     * 0.10) * 100
  )

  return {
    score,
    desglose: {
      horario:   mHorario,
      ambiente:  mAmbiente,
      visitas:   mVisitas,
      fiestas:   mFiestas,
      ocupacion: mOcup,
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
  }).score
}
