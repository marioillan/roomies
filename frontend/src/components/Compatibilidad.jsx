import { CheckCircle, MinusCircle, XCircle } from 'lucide-react'

/**
 * Piezas visuales de compatibilidad y de intereses en común.
 *
 * Estaban duplicadas: el donut y el desglose vivían copiados en
 * `AnuncioPublico.jsx` y en `SolicitudesUnion.jsx`, y los chips de intereses en
 * `BuscarPage.jsx` y `Favoritos.jsx`. Al centralizarlas, las cuatro pantallas
 * que muestran el resultado del algoritmo de matching se ven exactamente igual.
 */

// ─── Donut del porcentaje ───

export function DonutCompatibilidad({ score }) {
  const r    = 28
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 100)
  return (
    <div className='relative w-20 h-20 shrink-0'>
      <svg className='w-full h-full -rotate-90' viewBox='0 0 72 72' aria-hidden='true' focusable='false'>
        <circle cx='36' cy='36' r={r} fill='none' stroke='#d1fae5' strokeWidth='6' />
        <circle cx='36' cy='36' r={r} fill='none' stroke='#059669' strokeWidth='6'
          strokeDasharray={`${dash} ${circ}`} strokeLinecap='round' />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='font-display text-[1.125rem] font-bold text-emerald-700'>{score}%</span>
      </div>
    </div>
  )
}

// `sujeto` permite adaptar la frase al contexto: "con este grupo" cuando se
// mira un anuncio concreto, "con el grupo" cuando la lee el administrador.
// Sin `export`: este fichero solo debe exportar componentes para que funcione
// el Fast Refresh de Vite.
const taglineCompatibilidad = (score, sujeto = 'el grupo') =>
  score >= 85 ? `Muy buena afinidad con ${sujeto}` :
  score >= 70 ? `Buena afinidad con ${sujeto}`     :
  score >= 50 ? `Afinidad moderada con ${sujeto}`  :
                `Baja afinidad con ${sujeto}`

// ─── Desglose por dimensiones ───

const DIMENSIONES = [
  { key: 'horario',            label: 'Horario'   },
  { key: 'ambiente',           label: 'Ambiente'  },
  { key: 'frecuencia_visitas', label: 'Visitas'   },
  { key: 'tolerancia_fiestas', label: 'Fiestas'   },
  { key: 'ocupacion',          label: 'Ocupación' },
  { key: 'limpieza_orden',     label: 'Limpieza'  },
  { key: 'nivel_ruido',        label: 'Ruido'     },
]

function SeccionDesglose({ icono: Icono, titulo, color, items }) {
  if (!items.length) return null
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center gap-1.5'>
        <Icono aria-hidden='true' size={13} style={{ color }} />
        <span className='font-mono text-[0.6rem] font-bold uppercase tracking-widest' style={{ color }}>{titulo}</span>
      </div>
      <div className='flex flex-wrap gap-1.5'>
        {items.map(d => (
          <span
            key={d.key}
            className='text-[0.75rem] font-medium px-2.5 py-1 rounded-full border'
            style={{ color, borderColor: color + '40', background: color + '10' }}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function DesgloseCompatibilidad({ desglose }) {
  const coinciden = DIMENSIONES.filter(d => desglose[d.key] === 1.0)
  const parecido  = DIMENSIONES.filter(d => desglose[d.key] === 0.5)
  const diferente = DIMENSIONES.filter(d => desglose[d.key] === 0.0)

  return (
    <div className='flex flex-col gap-3'>
      <SeccionDesglose icono={CheckCircle} titulo='Coincidís en' color='#059669' items={coinciden} />
      <SeccionDesglose icono={MinusCircle} titulo='Parecido en'  color='#c2410c' items={parecido}  />
      <SeccionDesglose icono={XCircle}     titulo='Diferente en' color='#dc2626' items={diferente} />
    </div>
  )
}

// ─── Tarjeta completa: donut + frase + desglose opcional ───

export function TarjetaCompatibilidad({ score, desglose, sujeto, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className='flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-[0.875rem] p-4'>
        <DonutCompatibilidad score={score} />
        <div className='min-w-0'>
          <p className='font-display text-[1.0625rem] font-semibold text-slate-900 leading-tight'>
            {score}% de compatibilidad
          </p>
          <p className='text-xs text-emerald-700 mt-0.5'>{taglineCompatibilidad(score, sujeto)}</p>
        </div>
      </div>
      {desglose && <DesgloseCompatibilidad desglose={desglose} />}
    </div>
  )
}

// ─── Intereses en común ───

export function InteresesComunes({ intereses, className = '' }) {
  if (!intereses?.length) return null
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      <span className='font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-600 shrink-0'>
        En común:
      </span>
      {intereses.map(nombre => (
        <span
          key={nombre}
          className='inline-flex items-center gap-1 bg-emerald-200 text-emerald-900 text-[0.6875rem] font-medium px-2 py-0.5 rounded-full'
        >
          <span aria-hidden='true' className='w-1 h-1 rounded-full bg-emerald-400 shrink-0' />
          {nombre}
        </span>
      ))}
    </div>
  )
}
