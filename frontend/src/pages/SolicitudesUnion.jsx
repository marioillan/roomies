import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { apiFetch } from '../lib/apiFetch'
import {
  UserPlus, UserCheck, UserX, AlertCircle,
  CheckCircle, MinusCircle, XCircle,
} from 'lucide-react'

// ── Compatibilidad (mismo patrón que AnuncioPublico.jsx) ───────────────

function MiniDonut({ score }) {
  const r    = 28
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 100)
  return (
    <div className='relative w-20 h-20 shrink-0'>
      <svg className='w-full h-full -rotate-90' viewBox='0 0 72 72'>
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

const TAGLINE = (s) =>
  s >= 85 ? 'Muy buena afinidad con el grupo' :
  s >= 70 ? 'Buena afinidad con el grupo'     :
  s >= 50 ? 'Afinidad moderada con el grupo'  :
            'Baja afinidad con el grupo'

const DIMENSIONES = [
  { key: 'horario',            label: 'Horario'   },
  { key: 'ambiente',           label: 'Ambiente'  },
  { key: 'frecuencia_visitas', label: 'Visitas'   },
  { key: 'tolerancia_fiestas', label: 'Fiestas'   },
  { key: 'ocupacion',          label: 'Ocupación' },
  { key: 'limpieza_orden',     label: 'Limpieza'  },
  { key: 'nivel_ruido',        label: 'Ruido'     },
]

function SeccionCompatibilidad({ icono: Icono, titulo, color, items }) {
  if (!items.length) return null
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center gap-1.5'>
        <Icono size={13} style={{ color }} />
        <span className='font-mono text-[0.6rem] font-bold uppercase tracking-widest' style={{ color }}>{titulo}</span>
      </div>
      <div className='flex flex-wrap gap-1.5'>
        {items.map(d => (
          <span key={d.key} className='text-[0.75rem] font-medium px-2.5 py-1 rounded-full border' style={{ color, borderColor: color + '40', background: color + '10' }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function DesgloseCompatibilidad({ desglose }) {
  const coinciden = DIMENSIONES.filter(d => desglose[d.key] === 1.0)
  const parecido  = DIMENSIONES.filter(d => desglose[d.key] === 0.5)
  const diferente = DIMENSIONES.filter(d => desglose[d.key] === 0.0)

  return (
    <div className='flex flex-col gap-3'>
      <SeccionCompatibilidad icono={CheckCircle} titulo='Coincidís en' color='#059669' items={coinciden} />
      <SeccionCompatibilidad icono={MinusCircle} titulo='Parecido en'  color='#ea580c' items={parecido}  />
      <SeccionCompatibilidad icono={XCircle}     titulo='Diferente en' color='#dc2626' items={diferente} />
    </div>
  )
}

// ── Avatar ───────────────────────────────────────────────────────────

function AvatarUsuario({ foto, nombre }) {
  if (foto) return <img src={foto} alt={nombre} className='w-14 h-14 rounded-full object-cover shrink-0' />
  return (
    <div className='w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0'>
      <span className='text-lg font-bold text-emerald-700'>{nombre?.[0]?.toUpperCase() ?? '?'}</span>
    </div>
  )
}

// ── Card solicitud ───────────────────────────────────────────────────

function CardSolicitud({ solicitud, procesando, onAceptar, onRechazar }) {
  const { usuario, compatibilidad, desglose } = solicitud
  const enCurso = procesando != null

  return (
    <div className='bg-white border border-slate-100 rounded-[1.25rem] p-6 flex flex-col gap-5'>
      <div className='flex items-center gap-4'>
        <AvatarUsuario foto={usuario.foto_perfil} nombre={usuario.nombre} />
        <div className='min-w-0'>
          <p className='font-display text-lg font-semibold text-slate-900 truncate'>{usuario.nombre}</p>
          <p className='text-xs text-slate-400'>Quiere unirse al grupo</p>
        </div>
      </div>

      {compatibilidad != null ? (
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-[0.875rem] p-4'>
            <MiniDonut score={compatibilidad} />
            <div className='min-w-0'>
              <p className='font-display text-[1.0625rem] font-semibold text-slate-900 leading-tight'>
                {compatibilidad}% de compatibilidad
              </p>
              <p className='text-xs text-emerald-700 mt-0.5'>{TAGLINE(compatibilidad)}</p>
            </div>
          </div>
          {desglose && <DesgloseCompatibilidad desglose={desglose} />}
        </div>
      ) : (
        <div className='bg-slate-50 border border-slate-100 rounded-[0.875rem] p-4'>
          <p className='text-xs text-slate-500 leading-relaxed'>
            No se puede calcular la compatibilidad: falta el perfil de convivencia del usuario o del grupo.
          </p>
        </div>
      )}

      <div className='flex items-center gap-2 pt-1 border-t border-slate-100 mt-1'>
        <button
          onClick={() => onAceptar(solicitud.id)}
          disabled={enCurso}
          className='cursor-pointer! flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition'
        >
          {procesando === 'aceptar'
            ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
            : <UserCheck size={15} />}
          Aceptar
        </button>
        <button
          onClick={() => onRechazar(solicitud.id)}
          disabled={enCurso}
          className='cursor-pointer! flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-50 text-red-600 text-sm font-semibold transition'
        >
          {procesando === 'rechazar'
            ? <div className='w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin' />
            : <UserX size={15} />}
          Rechazar
        </button>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────

function SolicitudesUnion() {
  const { miembros, user } = useOutletContext()
  const [solicitudes, setSolicitudes] = useState(null)
  const [error,       setError]       = useState('')
  const [procesando,  setProcesando]  = useState({}) // { [solicitudId]: 'aceptar' | 'rechazar' }

  const esAdmin = miembros.find(m => m.id === user?.id)?.rol_en_grupo === 'ADMIN'

  useEffect(() => {
    apiFetch('/api/grupos/solicitudes-union')
      .then(r => r.json())
      .then(d => setSolicitudes(d.solicitudes ?? []))
      .catch(() => { setSolicitudes([]); setError('No se pudieron cargar las solicitudes') })
  }, [])

  const resolver = async (id, accion) => {
    setProcesando(prev => ({ ...prev, [id]: accion }))
    try {
      const r = await apiFetch(`/api/grupos/solicitudes-union/${id}/${accion}`, { method: 'PUT' })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        setError(data.message ?? 'No se pudo procesar la solicitud')
        return
      }
      setSolicitudes(prev => (prev ?? []).filter(s => s.id !== id))
    } catch {
      setError('Error de conexión con el servidor')
    } finally {
      setProcesando(prev => {
        const { [id]: _quitado, ...resto } = prev
        return resto
      })
    }
  }

  const handleAceptar  = (id) => resolver(id, 'aceptar')
  const handleRechazar = (id) => resolver(id, 'rechazar')

  return (
    <div className='flex flex-col gap-6'>

      {/* Cabecera */}
      <div>
        <h1 className='font-display text-3xl sm:text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>Solicitudes de acceso</h1>
      </div>

      {error && (
        <div className='flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
          <AlertCircle size={15} className='shrink-0' /> {error}
        </div>
      )}

      {!esAdmin ? (
        <p className='text-sm text-slate-400'>Solo el administrador del grupo puede ver las solicitudes de acceso.</p>
      ) : solicitudes === null ? (
        <div className='flex items-center justify-center min-h-[40vh]'>
          <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
        </div>
      ) : solicitudes.length === 0 ? (
        <div className='flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center'>
          <div className='w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center'>
            <UserPlus size={28} className='text-amber-500' />
          </div>
          <div>
            <h2 className='font-display text-2xl font-bold text-slate-900'>No hay solicitudes pendientes</h2>
            <p className='text-slate-500 text-sm mt-2 max-w-xs mx-auto'>
              Cuando alguien intente unirse con el código de acceso del grupo, aparecerá aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          {solicitudes.map(s => (
            <CardSolicitud
              key={s.id}
              solicitud={s}
              procesando={procesando[s.id] ?? null}
              onAceptar={handleAceptar}
              onRechazar={handleRechazar}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SolicitudesUnion
