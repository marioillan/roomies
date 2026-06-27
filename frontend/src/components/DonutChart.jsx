const FILL_MAP = {
  // frecuencia
  NUNCA: 15, OCASIONAL: 58, FRECUENTE: 100,
  // visitas
  CASI_NUNCA: 20, A_VECES: 60,
  // ambiente
  TRANQUILO: 30, EQUILIBRADO: 65, SOCIAL: 100,
  // horario
  MADRUGADOR: 100, INTERMEDIO: 62, NOCTURNO: 25,
  // ocupacion (categórica, sin orden)
  ESTUDIO: 100, TRABAJO: 100, ESTUDIO_Y_TRABAJO: 100,
  // aceptación
  SI: 100, NO: 0, INDIFERENTE: 55, DEPENDE: 55,
  // booleanos
  true: 100, false: 0,
}

function DonutChart({ sublabel, color, labels, valor }) {
  const estaRelleno = valor !== null && valor !== undefined
  const vStr  = String(valor)
  const label = estaRelleno ? (labels[vStr] ?? vStr) : null
  const fill  = estaRelleno ? (FILL_MAP[vStr] ?? 70) : 0

  const r            = 36
  const circumference = 2 * Math.PI * r
  const strokeDash    = circumference * (fill / 100)

  return (
    <div className='flex flex-col items-center gap-3 max-w-[200px] mx-auto w-full'>
      <div className='relative w-full cursor-pointer transition-transform duration-150 hover:scale-[1.03]' style={{ aspectRatio: '1' }}>
        <svg className='w-full h-full -rotate-90' viewBox='0 0 100 100'>
          <circle cx='50' cy='50' r={r} fill='none' stroke='#f1f5f9' strokeWidth='10' />
          {estaRelleno && fill > 0 && (
            <circle
              cx='50' cy='50' r={r}
              fill='none'
              stroke={color}
              strokeWidth='10'
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeLinecap='round'
            />
          )}
        </svg>
        <div className='absolute inset-0 flex items-center justify-center px-[6px]'>
          <span
            className='text-[0.8125rem] font-semibold text-center leading-[1.15]'
            style={{ color: estaRelleno && fill > 0 ? '#0f172a' : '#94a3b8' }}
          >
            {label ?? '—'}
          </span>
        </div>
      </div>
      <span className='text-[0.8125rem] font-medium text-slate-400 text-center leading-tight'>{sublabel}</span>
    </div>
  )
}

export default DonutChart
