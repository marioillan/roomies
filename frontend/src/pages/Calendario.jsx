import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, X, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import ModalEvento from '../components/ModalEvento.jsx'

// ── Helpers ───────────────────────────────────────────────────────────

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MESES_CORTO = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
const DIAS_SEMANA = ['L','M','X','J','V','S','D']

const COLORES_EVENTO = ['#10b981','#3b82f6','#ec4899','#8b5cf6','#f97316','#06b6d4','#f59e0b']

function colorEvento(idx) {
  return COLORES_EVENTO[idx % COLORES_EVENTO.length]
}

const DIA_LIMPIEZA_JS = { LUNES: 1, MARTES: 2, MIERCOLES: 3, JUEVES: 4, VIERNES: 5, SABADO: 6, DOMINGO: 0 }

function getDiaLimpiezaIdx(diaLimpieza) {
  return diaLimpieza ? (DIA_LIMPIEZA_JS[diaLimpieza] ?? null) : null
}

function getCalGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const firstOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function formatHora(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function formatFechaLarga(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ── Modal confirmar eliminación ───────────────────────────────────────

function ModalConfirmarEliminar({ evento, eliminando, onConfirmar, onCancelar }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm' onClick={onCancelar}>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-sm' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <h3 className='font-display text-base font-bold text-slate-900'>Eliminar evento</h3>
          <button onClick={onCancelar} className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition'>
            <X size={16} />
          </button>
        </div>
        <div className='px-6 py-5 flex flex-col gap-4'>
          <div className='bg-slate-50 border border-slate-100 rounded-xl px-4 py-3'>
            <p className='text-sm font-semibold text-slate-900'>{evento.titulo}</p>
            <p className='text-xs text-slate-400 mt-0.5'>{formatFechaLarga(evento.fecha_inicio)} · {formatHora(evento.fecha_inicio)}</p>
          </div>
          <p className='text-sm text-slate-500 leading-relaxed'>
            ¿Seguro que quieres eliminar este evento? Esta acción no se puede deshacer.
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

// ── Componente principal ──────────────────────────────────────────────

function Calendario() {
  const { grupo, user } = useOutletContext()

  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [year, setYear] = useState(hoy.getFullYear())
  const [eventos, setEventos] = useState(null)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [diaInicial, setDiaInicial] = useState(null)
  const [eventoEditando, setEventoEditando] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [eventoAEliminar, setEventoAEliminar] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarEventos()
  }, [])

  async function cargarEventos() {
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/grupos/eventos`, { credentials: 'include' })
      const data = await r.json()
      if (r.ok) setEventos(data.eventos ?? [])
    } catch { /* no crítico */ }
  }

  function navMes(delta) {
    let m = mes + delta
    let y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMes(m); setYear(y)
  }

  function irHoy() {
    setMes(hoy.getMonth())
    setYear(hoy.getFullYear())
  }

  async function confirmarEliminarEvento() {
    if (!eventoAEliminar) return
    setEliminando(eventoAEliminar.id)
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/grupos/eventos/${eventoAEliminar.id}`, {
        method: 'DELETE', credentials: 'include',
      })
      if (r.ok) {
        setEventos(prev => prev.filter(e => e.id !== eventoAEliminar.id))
        setEventoAEliminar(null)
      } else { const d = await r.json(); setError(d.message) }
    } catch { setError('Error de conexión') }
    finally { setEliminando(null) }
  }

  function onGuardado(ev, esEdicion) {
    if (esEdicion) setEventos(prev => prev.map(e => e.id === ev.id ? ev : e))
    else setEventos(prev => [ev, ...prev])
  }

  const cells = getCalGrid(year, mes)

  const diaLimpiezaIdx = getDiaLimpiezaIdx(grupo?.dia_limpieza)

  // Agrupar eventos por día del mes actual
  const eventosPorDia = {}
  if (eventos) {
    eventos.forEach((ev, idx) => {
      const d = new Date(ev.fecha_inicio)
      if (d.getFullYear() === year && d.getMonth() === mes) {
        const dia = d.getDate()
        eventosPorDia[dia] = eventosPorDia[dia] ?? []
        eventosPorDia[dia].push({ ...ev, _colorIdx: idx })
      }
    })
  }

  // Eventos de hoy
  const eventosHoy = (eventos ?? []).filter(ev => {
    const d = new Date(ev.fecha_inicio)
    return d.getDate() === hoy.getDate() && d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear()
  })

  const esHoyLimpieza = diaLimpiezaIdx !== null && hoy.getDay() === diaLimpiezaIdx

  // Próximos eventos (a partir de mañana, max 6)
  const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1)
  const proximos = (eventos ?? [])
    .filter(ev => new Date(ev.fecha_inicio) >= inicioDia)
    .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
    .slice(0, 6)

  const esHoyMesActual = mes === hoy.getMonth() && year === hoy.getFullYear()

  return (
    <div className='flex flex-col gap-6 pb-12'>

      {/* Header */}
      <div className='flex items-end justify-between gap-4'>
        <div>
          <h1 className='font-display text-5xl font-bold text-slate-900'>
            {MESES[mes]} {year}
          </h1>
        </div>
        <div className='flex items-center gap-2'>
          <button onClick={() => navMes(-1)} className='cursor-pointer! w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition border border-slate-200'>
            <ChevronLeft size={16} />
          </button>
          <button onClick={irHoy} className='cursor-pointer! font-semibold text-sm px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200'>
            Hoy
          </button>
          <button onClick={() => navMes(1)} className='cursor-pointer! w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition border border-slate-200'>
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => { setDiaInicial(''); setModalNuevo(true) }}
            className='cursor-pointer! ml-2 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition'
          >
            <Plus size={14} /> Nuevo evento
          </button>
        </div>
      </div>

      {error && (
        <div className='flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3'>
          <AlertCircle size={13} className='text-red-500 shrink-0' />
          <p className='text-sm text-red-700'>{error}</p>
          <button onClick={() => setError(null)} className='cursor-pointer! ml-auto text-red-400 hover:text-red-600'><X size={13} /></button>
        </div>
      )}

      {/* Layout calendario + sidebar */}
      <div className='grid gap-5' style={{ gridTemplateColumns: '1fr 18rem', alignItems: 'start' }}>

        {/* Calendario mensual */}
        <div className='bg-white border border-slate-100 rounded-3xl p-6' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}>

          {/* Días de la semana */}
          <div className='grid grid-cols-7 gap-1.5 mb-1.5'>
            {DIAS_SEMANA.map(d => (
              <div key={d} className='text-center font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-slate-400 py-1'>
                {d}
              </div>
            ))}
          </div>

          {/* Celdas */}
          <div className='grid grid-cols-7 gap-1.5'>
            {cells.map((dia, i) => {
              if (dia === null) return <div key={i} />
              const esHoy = esHoyMesActual && dia === hoy.getDate()
              const esLimpieza = diaLimpiezaIdx !== null && new Date(year, mes, dia).getDay() === diaLimpiezaIdx
              const evsDia = eventosPorDia[dia] ?? []
              const visibles = evsDia.slice(0, 2)
              const extra = evsDia.length - 2
              return (
                <div
                  key={i}
                  className={`relative flex flex-col gap-0.5 rounded-xl border p-1.5 overflow-hidden min-h-[3.5rem]
                    ${esHoy ? 'bg-slate-900 border-slate-900' : esLimpieza ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}
                  style={{ aspectRatio: '1.1' }}
                >
                  <div className='flex items-center justify-between leading-none'>
                    <span className={`font-medium text-[0.8125rem] ${esHoy ? 'text-white' : 'text-slate-900'}`}>
                      {dia}
                    </span>
                    {esLimpieza && esHoy && (
                      <span className='w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0' />
                    )}
                  </div>
                  {visibles.map((ev) => (
                    <span
                      key={ev.id}
                      className='block text-white font-medium text-[0.5625rem] px-1 py-px rounded overflow-hidden text-ellipsis whitespace-nowrap leading-tight'
                      style={{ backgroundColor: colorEvento(ev._colorIdx) }}
                    >
                      {ev.titulo}
                    </span>
                  ))}
                  {extra > 0 && (
                    <span className='font-mono text-[0.5rem] text-slate-400'>+{extra}</span>
                  )}
                  {esLimpieza && !esHoy && (
                    <span className='mt-auto font-mono text-[0.45rem] font-bold uppercase tracking-wide text-amber-500 leading-none'>
                      limpieza
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Leyenda */}
          {(eventos?.some(ev => { const d = new Date(ev.fecha_inicio); return d.getFullYear() === year && d.getMonth() === mes }) || diaLimpiezaIdx !== null) && (
            <div className='flex flex-wrap gap-3 mt-5 pt-4 border-t border-slate-100'>
              {diaLimpiezaIdx !== null && (
                <div className='flex items-center gap-1.5'>
                  <div className='w-2.5 h-2.5 rounded-sm shrink-0 bg-amber-200 border border-amber-300' />
                  <span className='text-xs text-amber-600 font-medium'>Día de limpieza</span>
                </div>
              )}
              {eventos?.filter(ev => {
                const d = new Date(ev.fecha_inicio)
                return d.getFullYear() === year && d.getMonth() === mes
              }).slice(0, 5).map((ev, i) => (
                <div key={ev.id} className='flex items-center gap-1.5'>
                  <div className='w-2.5 h-2.5 rounded-sm shrink-0' style={{ backgroundColor: colorEvento(i) }} />
                  <span className='text-xs text-slate-500 truncate max-w-[8rem]'>{ev.titulo}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className='flex flex-col gap-4'>

          {/* Card hoy */}
          <div className='bg-white border border-slate-100 rounded-3xl p-5' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}>
            <p className='font-mono text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1'>Hoy</p>
            <h3 className='font-display text-lg font-bold text-slate-900 mb-3 capitalize'>
              {hoy.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            {!esHoyLimpieza && eventosHoy.length === 0 ? (
              <p className='text-sm text-slate-400 italic'>Sin eventos hoy</p>
            ) : (
              <div className='flex flex-col gap-2'>
                {esHoyLimpieza && (
                  <div className='flex items-start gap-2.5 bg-amber-50 rounded-xl px-3 py-2.5'>
                    <div className='w-0.5 self-stretch rounded-full shrink-0 mt-0.5 bg-amber-400' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-amber-700'>Día de limpieza</p>
                      <p className='font-mono text-[0.6875rem] text-amber-500 mt-0.5'>Último día</p>
                    </div>
                  </div>
                )}
                {eventosHoy.map((ev, i) => (
                  <div key={ev.id} className='flex items-start gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5'>
                    <div className='w-0.5 self-stretch rounded-full shrink-0 mt-0.5' style={{ backgroundColor: colorEvento(i) }} />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-slate-900 truncate'>{ev.titulo}</p>
                      <p className='font-mono text-[0.6875rem] text-slate-400 mt-0.5'>
                        {formatHora(ev.fecha_inicio)}{ev.creador_nombre ? ` · ${ev.creador_nombre}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card próximos */}
          <div className='bg-white border border-slate-100 rounded-3xl p-5' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}>
            <div className='flex items-center justify-between mb-3'>
              <p className='font-mono text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-slate-400'>Próximos</p>
              {proximos.length > 0 && (
                <span className='font-mono text-[0.7rem] text-slate-400'>{proximos.length}</span>
              )}
            </div>
            {eventos === null ? (
              <div className='flex justify-center py-4'>
                <div className='w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin' />
              </div>
            ) : proximos.length === 0 ? (
              <p className='text-sm text-slate-400 italic'>Sin eventos próximos</p>
            ) : (
              <div className='flex flex-col gap-2.5'>
                {proximos.map((ev, i) => {
                  const fecha = new Date(ev.fecha_inicio)
                  const puedeEditar = ev.creado_por_id === user?.id
                  return (
                    <div key={ev.id} className='flex items-start gap-2.5 group'>
                      <div className='w-10 shrink-0 text-center bg-slate-50 border border-slate-100 rounded-xl py-1.5'>
                        <p className='font-mono text-[0.5625rem] font-semibold uppercase text-slate-400 leading-none'>
                          {MESES_CORTO[fecha.getMonth()]}
                        </p>
                        <p className='font-display text-base font-bold text-slate-900 leading-tight'>{fecha.getDate()}</p>
                      </div>
                      <div className='w-0.5 self-stretch rounded-full shrink-0' style={{ backgroundColor: colorEvento(i) }} />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-slate-900 truncate'>{ev.titulo}</p>
                        <p className='font-mono text-[0.6875rem] text-slate-400 mt-0.5'>
                          {formatHora(ev.fecha_inicio)}{ev.creado_por_nombre ? ` · ${ev.creado_por_nombre}` : ''}
                        </p>
                      </div>
                      {puedeEditar && (
                        <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0'>
                          <button
                            onClick={() => setEventoEditando(ev)}
                            className='cursor-pointer! w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition'
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setEventoAEliminar(ev)}
                            disabled={eliminando === ev.id}
                            className='cursor-pointer! w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition'
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {(modalNuevo) && (
        <ModalEvento
          diaInicial={diaInicial}
          onClose={() => { setModalNuevo(false); setDiaInicial(null) }}
          onGuardado={onGuardado}
        />
      )}
      {eventoEditando && (
        <ModalEvento
          evento={eventoEditando}
          onClose={() => setEventoEditando(null)}
          onGuardado={onGuardado}
        />
      )}
      {eventoAEliminar && (
        <ModalConfirmarEliminar
          evento={eventoAEliminar}
          eliminando={!!eliminando}
          onConfirmar={confirmarEliminarEvento}
          onCancelar={() => setEventoAEliminar(null)}
        />
      )}
    </div>
  )
}

export default Calendario
