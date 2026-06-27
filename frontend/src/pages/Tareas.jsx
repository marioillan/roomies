import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  UtensilsCrossed, Droplets, Sofa, DoorOpen, Sparkles,
  Check, Plus, X, Trash2, AlertCircle, RefreshCw, Calendar,
} from 'lucide-react'

// ── Configuración de zonas ────────────────────────────────────────────

const ZONA_CONFIG = {
  'Cocina':  { color: '#f59e0b', bg: '#fef3c7', Icon: UtensilsCrossed },
  'Baño':    { color: '#06b6d4', bg: '#cffafe', Icon: Droplets },
  'Salón':   { color: '#3b82f6', bg: '#dbeafe', Icon: Sofa },
  'Pasillo': { color: '#8b5cf6', bg: '#ede9fe', Icon: DoorOpen },
}
const ZONA_DEFAULT = { color: '#6b7280', bg: '#f1f5f9', Icon: Sparkles }

function getZonaCfg(nombre) {
  return ZONA_CONFIG[nombre] ?? ZONA_DEFAULT
}

// ── Helpers ───────────────────────────────────────────────────────────

const DIA_LABEL = { LUNES: 'lun', MARTES: 'mar', MIERCOLES: 'mié', JUEVES: 'jue', VIERNES: 'vie', SABADO: 'sáb', DOMINGO: 'dom' }
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function getSemanaLabel(lunesStr) {
  const lunes = new Date(lunesStr + 'T00:00:00')
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  const fmtDia = d => `${d.getDate()} ${MESES[d.getMonth()]}`
  return `${fmtDia(lunes)} – ${fmtDia(domingo)}`
}

function getLimiteDia(diaLimpieza, lunesStr) {
  if (!diaLimpieza || !lunesStr) return null
  const DIA_OFFSET = { LUNES: 0, MARTES: 1, MIERCOLES: 2, JUEVES: 3, VIERNES: 4, SABADO: 5, DOMINGO: 6 }
  const lunes = new Date(lunesStr + 'T00:00:00')
  const limite = new Date(lunes)
  limite.setDate(lunes.getDate() + (DIA_OFFSET[diaLimpieza] ?? 6))
  return `${DIA_LABEL[diaLimpieza]?.toUpperCase()} ${limite.getDate()}`
}

function ProximaSemanaZona({ miembros, zonas, miembroIdx, semanaRotacion }) {
  if (!zonas.length) return <span className='text-slate-300'>—</span>
  const nZonas = zonas.length
  const nextIdx = (miembroIdx + semanaRotacion + 1) % nZonas
  const nextZona = zonas[nextIdx]
  const cfg = getZonaCfg(nextZona.nombre)
  return (
    <span className='inline-flex items-center gap-1.5 text-slate-400 text-sm'>
      <span className='text-slate-300'>→</span>
      <span className='w-2 h-2 rounded-full shrink-0' style={{ backgroundColor: cfg.color }} />
      <span>{nextZona.nombre}</span>
    </span>
  )
}

// ── AvatarMiembro ─────────────────────────────────────────────────────

function AvatarMiembro({ foto, nombre, size = 'sm' }) {
  const cls = size === 'lg'
    ? 'w-12 h-12 rounded-full text-base font-bold shrink-0'
    : 'w-7 h-7 rounded-full text-xs font-bold shrink-0'
  if (foto) return <img src={foto} alt={nombre} className={`${cls} object-cover`} />
  return (
    <div className={`${cls} bg-emerald-100 flex items-center justify-center text-emerald-700`}>
      {nombre?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

// ── Modal confirmar eliminación ───────────────────────────────────────

function ModalConfirmarEliminar({ zona, eliminando, onConfirmar, onCancelar }) {
  const cfg = getZonaCfg(zona.nombre)
  const { Icon } = cfg
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm' onClick={onCancelar}>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-sm' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <h3 className='font-display text-base font-bold text-slate-900'>Eliminar zona</h3>
          <button onClick={onCancelar} className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition'>
            <X size={16} />
          </button>
        </div>
        <div className='px-6 py-5 flex flex-col gap-4'>
          <div className='flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3'>
            <div className='w-8 h-8 rounded-lg flex items-center justify-center shrink-0' style={{ backgroundColor: cfg.color + '1a' }}>
              <Icon size={16} style={{ color: cfg.color }} />
            </div>
            <span className='text-sm font-semibold text-slate-900'>{zona.nombre}</span>
          </div>
          <p className='text-sm text-slate-500 leading-relaxed'>
            ¿Seguro que quieres eliminar esta zona de la rotación? Los miembros asignados a ella esta semana perderán su turno.
          </p>
          <div className='flex gap-2 justify-end'>
            <button type='button' onClick={onCancelar} className='cursor-pointer! px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition'>
              Cancelar
            </button>
            <button
              type='button'
              onClick={onConfirmar}
              disabled={eliminando}
              className='cursor-pointer! inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50'
            >
              {eliminando
                ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                : <Trash2 size={14} />}
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal añadir zona ─────────────────────────────────────────────────

function ModalAñadirZona({ onClose, onAñadida }) {
  const [nombre, setNombre] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const enviar = async (e) => {
    e.preventDefault()
    const nom = nombre.trim()
    if (!nom) { setError('El nombre es obligatorio'); return }
    setEnviando(true); setError(null)
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/tareas/zonas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ nombre: nom }),
      })
      const data = await r.json()
      if (!r.ok) { setError(data.message ?? 'Error al añadir la zona'); return }
      onAñadida(data.zona)
      onClose()
    } catch { setError('Error de conexión') }
    finally { setEnviando(false) }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm' onClick={onClose}>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-sm' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <h3 className='font-display text-base font-bold text-slate-900'>Nueva zona</h3>
          <button onClick={onClose} className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition'>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={enviar} className='p-6 flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Nombre *</label>
            <input
              autoFocus
              value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder='Ej: Terraza, Habitación…'
              className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition'
            />
          </div>
          {error && (
            <div className='flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5'>
              <AlertCircle size={13} className='text-red-500 shrink-0' />
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          )}
          <div className='flex gap-2 justify-end'>
            <button type='button' onClick={onClose} className='cursor-pointer! px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition'>Cancelar</button>
            <button type='submit' disabled={enviando} className='cursor-pointer! px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50'>
              {enviando ? 'Añadiendo…' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Vista sin configurar ──────────────────────────────────────────────

function VistaNoConfigurada({ esAdmin, onIniciar, iniciando, errorInit }) {
  return (
    <div className='flex flex-col items-center justify-center py-24 gap-6 text-center'>
      <div className='w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center'>
        <RefreshCw size={28} className='text-emerald-500' />
      </div>
      <div>
        <h2 className='font-display text-2xl font-bold text-slate-900'>Rotación de limpieza</h2>
        <p className='text-slate-500 text-sm mt-2 max-w-xs mx-auto'>
          {esAdmin
            ? 'Inicializa las zonas predefinidas (Cocina, Baño, Salón, Pasillo) para empezar la rotación semanal.'
            : 'El administrador del grupo aún no ha configurado las zonas de limpieza.'}
        </p>
      </div>
      {esAdmin && (
        <>
          <button
            onClick={onIniciar} disabled={iniciando}
            className='cursor-pointer! inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50'
          >
            {iniciando
              ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              : <Plus size={16} />}
            Inicializar zonas
          </button>
          {errorInit && <p className='text-sm text-red-600'>{errorInit}</p>}
        </>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────

function Tareas() {
  const { grupo, miembros: miembrosGrupo, user } = useOutletContext()

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [modalZona, setModalZona] = useState(false)
  const [iniciando, setIniciando] = useState(false)
  const [errorInit, setErrorInit] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [zonaAEliminar, setZonaAEliminar] = useState(null)

  const esAdmin = miembrosGrupo?.find(m => m.id === user?.id)?.rol_en_grupo === 'ADMIN'

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/tareas`, { credentials: 'include' })
      const data = await r.json()
      if (!r.ok) { setError(data.message); return }
      setDatos(data)
    } catch { setError('Error de conexión') }
    finally { setCargando(false) }
  }

  async function iniciar() {
    setIniciando(true); setErrorInit(null)
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/tareas/iniciar`, {
        method: 'POST', credentials: 'include',
      })
      const data = await r.json()
      if (!r.ok) { setErrorInit(data.message); return }
      await cargar()
    } catch { setErrorInit('Error de conexión') }
    finally { setIniciando(false) }
  }

  async function toggleEstado(asignacionId) {
    if (toggling) return
    setToggling(asignacionId)
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/tareas/turnos/${asignacionId}/estado`, {
        method: 'PATCH', credentials: 'include',
      })
      const data = await r.json()
      if (!r.ok) { setError(data.message); return }
      setDatos(prev => ({
        ...prev,
        asignaciones: prev.asignaciones.map(a =>
          a.id === asignacionId ? { ...a, ...data.asignacion } : a
        ),
      }))
    } catch { setError('Error de conexión') }
    finally { setToggling(null) }
  }

  async function confirmarEliminarZona() {
    if (!zonaAEliminar) return
    setEliminando(zonaAEliminar.id)
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/tareas/zonas/${zonaAEliminar.id}`, {
        method: 'DELETE', credentials: 'include',
      })
      const data = await r.json()
      if (!r.ok) { setError(data.message); return }
      setDatos(prev => ({ ...prev, zonas: prev.zonas.filter(z => z.id !== zonaAEliminar.id) }))
      setZonaAEliminar(null)
    } catch { setError('Error de conexión') }
    finally { setEliminando(null) }
  }

  if (cargando) {
    return (
      <div className='flex justify-center py-24'>
        <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 max-w-md'>
        <AlertCircle size={14} className='text-red-500 shrink-0' />
        <p className='text-sm text-red-700'>{error}</p>
      </div>
    )
  }

  if (!datos?.configurado) {
    return <VistaNoConfigurada esAdmin={esAdmin} onIniciar={iniciar} iniciando={iniciando} errorInit={errorInit} />
  }

  const { zonas, miembros, asignaciones, semana_rotacion: semanaRotacion, lunes_actual: lunesActual } = datos

  const miAsignacion = asignaciones.find(a => a.usuario_id === user?.id)
  const limiteLabel = getLimiteDia(grupo?.dia_limpieza, lunesActual)

  const hechas = asignaciones.filter(a => a.estado === 'COMPLETADA').length
  const total = asignaciones.length
  const pct = total > 0 ? Math.round(hechas / total * 100) : 0

  return (
    <div className='flex flex-col gap-6 pb-12'>

      {/* Header */}
      <div className='flex items-end justify-between gap-4'>
        <div>
          <h1 className='font-display text-5xl font-bold text-slate-900'>Tareas</h1>
        </div>
      </div>

      {/* Hero grid */}
      <div className='grid gap-4' style={{ gridTemplateColumns: '1.6fr 1fr' }}>

        {/* Card "Esta semana te toca" */}
        <div className='bg-slate-900 text-white rounded-3xl p-7 flex flex-col gap-5'>
          <div className='flex items-center justify-between'>
            <p className='font-mono text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-slate-400'>
              Esta semana te toca
            </p>
            {miAsignacion && (
              <span className={`inline-flex items-center gap-1.5 font-mono text-[0.625rem] font-semibold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full
                ${miAsignacion.estado === 'COMPLETADA'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'}`}>
                <span className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: miAsignacion.estado === 'COMPLETADA' ? '#6ee7b7' : '#fcd34d' }} />
                {miAsignacion.estado === 'COMPLETADA' ? 'Hecha' : 'Pendiente'}
              </span>
            )}
          </div>

          {miAsignacion ? (() => {
            const cfg = getZonaCfg(miAsignacion.zona_nombre)
            const { Icon } = cfg
            return (
              <>
                <div className='flex items-center gap-4'>
                  <div className='w-14 h-14 rounded-2xl flex items-center justify-center shrink-0' style={{ backgroundColor: cfg.color + '26' }}>
                    <Icon size={26} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <p className='font-display text-[2.25rem] font-bold text-white leading-none'>{miAsignacion.zona_nombre}</p>
                    <p className='text-slate-400 text-sm mt-1'>Tu zona asignada esta semana</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => toggleEstado(miAsignacion.id)}
                    disabled={toggling === miAsignacion.id}
                    className={`cursor-pointer! inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl transition disabled:opacity-50
                      ${miAsignacion.estado === 'COMPLETADA'
                        ? 'bg-white/15 hover:bg-white/25 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}
                  >
                    {toggling === miAsignacion.id
                      ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                      : <Check size={14} />}
                    {miAsignacion.estado === 'COMPLETADA' ? 'Hecha · deshacer' : 'Marcar como hecha'}
                  </button>
                  {limiteLabel && (
                    <p className='font-mono text-[0.75rem] font-semibold' style={{ color: '#fcd34d' }}>
                      LÍMITE · {limiteLabel}
                    </p>
                  )}
                </div>
              </>
            )
          })() : (
            <p className='text-slate-400 text-sm flex-1 flex items-center'>No tienes zona asignada esta semana.</p>
          )}
        </div>

        {/* Card "Cómo funciona" */}
        <div className='bg-white border border-slate-100 rounded-3xl p-7 flex flex-col gap-5' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}>
          <p className='font-mono text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-slate-500'>
            Cómo funciona la rotación
          </p>
          <div className='flex flex-col gap-4'>
            <div className='flex items-start gap-3'>
              <div className='w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5'>
                <RefreshCw size={14} className='text-emerald-600' />
              </div>
              <div>
                <p className='text-sm font-semibold text-slate-900'>Cambia cada semana</p>
                <p className='text-xs text-slate-400 mt-0.5'>Cada miembro rota a la siguiente zona</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5'>
                <Calendar size={14} className='text-amber-600' />
              </div>
              <div>
                <p className='text-sm font-semibold text-slate-900'>
                  Día de limpieza{grupo?.dia_limpieza ? ` · ${grupo.dia_limpieza.toLowerCase()}` : ''}
                </p>
                <p className='text-xs text-slate-400 mt-0.5'>Los turnos nuevos empiezan el lunes</p>
              </div>
            </div>
          </div>
          <div className='border-t border-slate-100 pt-4 mt-auto'>
            <div className='flex items-center justify-between'>
              <p className='text-xs text-slate-500'>Progreso esta semana</p>
              <p className='font-mono text-xs font-semibold text-emerald-600'>{hechas}/{total} hechas</p>
            </div>
            <div className='mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden'>
              <div className='h-full rounded-full bg-emerald-500 transition-all' style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla quién limpia qué */}
      <div className='bg-white border border-slate-100 rounded-3xl overflow-hidden' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <div>
            <p className='font-mono text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-slate-400'>Turnos · semana actual</p>
            <h2 className='font-display text-lg font-bold text-slate-900 mt-0.5'>Quién limpia qué</h2>
          </div>
          <div className='flex items-center gap-3'>
            <p className='text-xs text-slate-400 font-medium'>{hechas}/{total} hechas</p>
            <div className='w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden'>
              <div className='h-full rounded-full bg-emerald-500 transition-all' style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <table className='w-full'>
          <thead>
            <tr className='border-b border-slate-100'>
              <th className='font-mono text-[0.6rem] font-semibold tracking-[0.12em] uppercase text-slate-400 px-6 py-3 text-left'>Miembro</th>
              <th className='font-mono text-[0.6rem] font-semibold tracking-[0.12em] uppercase text-slate-400 px-4 py-3 text-left'>Zona esta semana</th>
              <th className='font-mono text-[0.6rem] font-semibold tracking-[0.12em] uppercase text-slate-400 px-4 py-3 text-left'>Estado</th>
              <th className='font-mono text-[0.6rem] font-semibold tracking-[0.12em] uppercase text-slate-400 px-4 py-3 text-left'>La próxima semana</th>
            </tr>
          </thead>
          <tbody>
            {miembros.map((miembro, idx) => {
              const asign = asignaciones.find(a => a.usuario_id === miembro.id)
              const esYo = miembro.id === user?.id
              const cfg = asign ? getZonaCfg(asign.zona_nombre) : ZONA_DEFAULT
              const { Icon } = cfg
              return (
                <tr
                  key={miembro.id}
                  className={`border-b border-dashed border-slate-100 transition ${esYo ? 'bg-pink-50 hover:bg-pink-100/60' : 'hover:bg-slate-50'}`}
                >
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2.5'>
                      <AvatarMiembro foto={miembro.foto_perfil} nombre={miembro.nombre} />
                      <span className='text-sm font-semibold text-slate-900'>{miembro.nombre}</span>
                      {esYo && (
                        <span className='font-mono text-[0.625rem] font-bold text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded'>TÚ</span>
                      )}
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    {asign ? (
                      <div className='inline-flex items-center gap-2'>
                        <div className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0' style={{ backgroundColor: cfg.color + '1a' }}>
                          <Icon size={14} style={{ color: cfg.color }} />
                        </div>
                        <span className='text-sm font-semibold text-slate-900'>{asign.zona_nombre}</span>
                      </div>
                    ) : (
                      <span className='text-slate-300 text-sm'>—</span>
                    )}
                  </td>
                  <td className='px-4 py-4'>
                    {asign ? (
                      <span className={`inline-flex items-center gap-1.5 font-mono text-[0.625rem] font-semibold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full
                        ${asign.estado === 'COMPLETADA' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${asign.estado === 'COMPLETADA' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {asign.estado === 'COMPLETADA' ? 'Hecha' : 'Pendiente'}
                      </span>
                    ) : (
                      <span className='text-slate-300 text-sm'>—</span>
                    )}
                  </td>
                  <td className='px-4 py-4'>
                    <ProximaSemanaZona miembros={miembros} zonas={zonas} miembroIdx={idx} semanaRotacion={semanaRotacion} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Zonas en rotación */}
      <div className='bg-white border border-slate-100 rounded-3xl p-6' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <p className='font-mono text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-slate-400'>Zonas del piso · {zonas.length}</p>
            <h2 className='font-display text-lg font-bold text-slate-900 mt-0.5'>Espacios en rotación</h2>
          </div>
          {esAdmin && (
            <button
              onClick={() => setModalZona(true)}
              className='cursor-pointer! inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition'
            >
              <Plus size={14} /> Añadir zona
            </button>
          )}
        </div>
        <div className='flex flex-wrap gap-2.5'>
          {zonas.map(zona => {
            const cfg = getZonaCfg(zona.nombre)
            const { Icon } = cfg
            const esPredefinida = ['Cocina', 'Baño', 'Salón', 'Pasillo'].includes(zona.nombre)
            return (
              <div
                key={zona.id}
                className='inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 group'
              >
                <div className='w-6 h-6 rounded-md flex items-center justify-center shrink-0' style={{ backgroundColor: cfg.color + '1a' }}>
                  <Icon size={13} style={{ color: cfg.color }} />
                </div>
                <span className='text-sm font-medium text-slate-700'>{zona.nombre}</span>
                {esAdmin && !esPredefinida && (
                  <button
                    onClick={() => setZonaAEliminar(zona)}
                    disabled={eliminando === zona.id}
                    className='cursor-pointer! ml-1 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 disabled:opacity-30'
                  >
                    {eliminando === zona.id
                      ? <div className='w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin' />
                      : <Trash2 size={12} />}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {modalZona && (
        <ModalAñadirZona
          onClose={() => setModalZona(false)}
          onAñadida={zona => {
            setDatos(prev => ({ ...prev, zonas: [...prev.zonas, zona] }))
            setModalZona(false)
          }}
        />
      )}

      {zonaAEliminar && (
        <ModalConfirmarEliminar
          zona={zonaAEliminar}
          eliminando={!!eliminando}
          onConfirmar={confirmarEliminarZona}
          onCancelar={() => setZonaAEliminar(null)}
        />
      )}
    </div>
  )
}

export default Tareas
