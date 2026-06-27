import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Crown, Plus, AlertTriangle, Check, CalendarDays } from 'lucide-react'
import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import ModalEvento from '../components/ModalEvento.jsx'
import { CARD_SHADOW } from '../lib/convivencia.js'

const MESES_CORTO = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']

const DIA_JS = {
  LUNES: 1, MARTES: 2, MIERCOLES: 3,
  JUEVES: 4, VIERNES: 5, SABADO: 6, DOMINGO: 0,
}

function getSaludo() {
  const h = new Date().getHours()
  if (h >= 6 && h < 12)  return 'Buenos días'
  if (h >= 12 && h < 21) return 'Buenas tardes'
  return 'Buenas noches'
}

// ── TareasCard ────────────────────────────────────────────────────

function TareasCard({ grupo, navigate, datosTareas }) {
  const asignaciones = datosTareas?.asignaciones ?? []
  const tareasTotal  = asignaciones.length
  const tareasHechas = asignaciones.filter(a => a.estado === 'COMPLETADA' || a.estado === 'VALIDADA').length
  const pct = tareasTotal > 0 ? Math.round(tareasHechas / tareasTotal * 100) : 0

  const hoy = new Date()
  const diaLimpiezaJS = grupo?.dia_limpieza ? DIA_JS[grupo.dia_limpieza] : null
  let diasHastaLimpieza = null
  if (diaLimpiezaJS !== null) {
    const cursor = new Date(hoy)
    for (let i = 0; i <= 7; i++) {
      if (cursor.getDay() === diaLimpiezaJS) { diasHastaLimpieza = i; break }
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  const mensajeLimpieza =
    diasHastaLimpieza === 0 ? '¡Toca limpiar hoy!' :
    diasHastaLimpieza === 1 ? 'Mañana toca limpiar' :
    diasHastaLimpieza !== null ? 'Vais bien encaminados' :
    'Sin día configurado'

  const r = 36
  const circ = 2 * Math.PI * r
  const dash = circ * (pct / 100)

  return (
    <div className='bg-slate-900 rounded-3xl p-7 text-white relative overflow-hidden flex flex-col justify-between gap-4 h-full'>
      <div className='absolute -right-6 -top-6 w-36 h-36 rounded-full bg-white/5 pointer-events-none' />

      {/* Cabecera: texto + flecha */}
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='font-mono text-[0.8rem] font-semibold tracking-[0.18em] uppercase text-slate-400'>
            Limpieza de la semana
          </p>
          <h3 className='font-display text-2xl font-bold text-white mt-1'>{mensajeLimpieza}</h3>
        </div>
        <button
          onClick={() => navigate('/grupo/tareas')}
          className='cursor-pointer! w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition'
        >
          <span className='text-white text-base'>→</span>
        </button>
      </div>

      {/* Pie: contador + donut */}
      <div className='flex items-end justify-between gap-3'>
        <div>
          <div className='flex items-baseline gap-1'>
            <span className='font-mono text-[3.5rem] font-bold text-white tabular-nums leading-none'>
              {datosTareas === null ? '–' : tareasHechas}
            </span>
            <span className='font-mono text-2xl text-slate-500'>
              /{datosTareas === null ? '–' : tareasTotal}
            </span>
          </div>
          <p className='text-slate-400 text-base mt-1'>
            {datosTareas === null
              ? 'Cargando...'
              : tareasTotal === 0
                ? 'Sin tareas configuradas'
                : 'tareas hechas esta semana'}
          </p>
        </div>

        <div className='relative w-44 h-44 shrink-0'>
          <svg className='w-full h-full -rotate-90' viewBox='0 0 100 100'>
            <circle cx='50' cy='50' r={r} fill='none' stroke='#1e293b' strokeWidth='10' />
            <circle cx='50' cy='50' r={r} fill='none' stroke='#10b981' strokeWidth='10'
              strokeDasharray={`${dash} ${circ}`} strokeLinecap='round' />
          </svg>
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='font-mono text-sm font-bold text-white'>{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── AgendaCard ────────────────────────────────────────────────────

const EVENT_COLORS = ['#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316']

function AgendaCard({ eventos, user, esAdmin, onNuevo, onEditar = null, onEliminar, navigate }) {
  const hoyReal   = new Date()
  const inicioDia = new Date(hoyReal.getFullYear(), hoyReal.getMonth(), hoyReal.getDate())
  const proximos  = eventos
    ? eventos.filter(e => new Date(e.fecha_inicio) >= inicioDia)
    : []

  return (
    <div className='bg-white rounded-3xl border border-slate-100 p-7 flex flex-col h-full' style={CARD_SHADOW}>
      <div className='flex items-center justify-between mb-1'>
        <p className='font-mono text-[0.8rem] font-semibold tracking-[0.18em] uppercase text-slate-600'>Agenda</p>
        <button
          onClick={() => navigate('/grupo/calendario')}
          className='cursor-pointer! font-mono text-[0.7rem] font-semibold uppercase tracking-[0.10em] text-emerald-600 hover:text-emerald-700 transition'
        >
          Calendario →
        </button>
      </div>
      <h3 className='font-display text-2xl font-bold text-slate-900 mb-5'>Próximos eventos</h3>

      {eventos === null ? (
        <div className='flex justify-center py-6'>
          <div className='w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin' />
        </div>
      ) : proximos.length === 0 ? (
        <p className='text-sm text-slate-400 italic flex-1'>Sin eventos próximos</p>
      ) : (
        <div className='no-scrollbar flex flex-col gap-2 overflow-y-auto' style={{ maxHeight: '296px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {proximos.map((ev, i) => {
            const fecha = new Date(ev.fecha_inicio)
            const mes   = MESES_CORTO[fecha.getMonth()]
            const dia   = fecha.getDate()
            const hora  = fecha.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
            return (
              <div key={ev.id} className='flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3'>
                <div className='w-12 shrink-0 text-center bg-white rounded-xl py-1.5'>
                  <p className='font-mono text-[10px] text-slate-400 uppercase leading-none'>{mes}</p>
                  <p className='font-mono text-xl font-bold text-slate-900 leading-tight'>{dia}</p>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-slate-800 truncate'>{ev.titulo}</p>
                  <p className='text-xs text-slate-400 font-mono uppercase'>
                    {hora}{ev.creado_por_nombre ? ` · ${ev.creado_por_nombre}` : ''}
                  </p>
                </div>
                <div className='w-2.5 h-2.5 rounded-full shrink-0' style={{ backgroundColor: EVENT_COLORS[i % EVENT_COLORS.length] }} />
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={onNuevo}
        className='cursor-pointer! mt-5 w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-200 rounded-2xl text-sm text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition'
      >
        <Plus size={14} /> Nuevo evento
      </button>

      {!user?.tiene_calendar && (
        <a
          href={`${import.meta.env.VITE_API_URL}/api/auth/google/calendar`}
          className='mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition group'
        >
          <CalendarDays size={15} className='text-blue-500 shrink-0' />
          <div className='flex-1 min-w-0'>
            <p className='text-xs font-semibold text-blue-700 leading-tight'>Conectar Google Calendar</p>
            <p className='text-[11px] text-blue-400 leading-tight mt-0.5'>Sincroniza los eventos del grupo</p>
          </div>
          <span className='text-[11px] font-semibold text-blue-500 group-hover:text-blue-700 transition shrink-0'>Conectar →</span>
        </a>
      )}
    </div>
  )
}

// ── FacturaCard ───────────────────────────────────────────────────

const TIPO_LABEL_FC = { AGUA: 'Agua', LUZ: 'Luz', INTERNET: 'Internet', ALQUILER: 'Alquiler', OTRO: 'Otro' }

function diasHastaVenc(fechaStr) {
  if (!fechaStr) return null
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  const d = new Date(fechaStr.includes('T') ? fechaStr : fechaStr + 'T00:00:00')
  d.setHours(0, 0, 0, 0)
  return Math.round((d - hoy) / 86400000)
}

function FacturaCard({ factura, todasPagadas, cargando, navigate }) {
  if (cargando) {
    return (
      <div className='bg-emerald-50 rounded-3xl p-6 flex items-center justify-center border border-emerald-100 h-full'>
        <div className='w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (todasPagadas) {
    return (
      <div className='bg-emerald-50 rounded-3xl p-6 flex flex-col gap-3 border border-emerald-100 h-full'>
        <p className='font-mono text-[0.8rem] font-semibold tracking-[0.18em] uppercase text-emerald-700'>Mis pagos</p>
        <div className='flex-1 flex flex-col items-center justify-center gap-2 text-center'>
          <div className='w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center'>
            <Check size={22} className='text-emerald-600' />
          </div>
          <p className='font-display text-xl font-bold text-emerald-800'>¡Todo al día!</p>
          <p className='text-sm text-emerald-600'>Todas las facturas están pagadas</p>
        </div>
        <button onClick={() => navigate('/grupo/facturas')}
          className='cursor-pointer! font-mono text-[0.7rem] font-semibold uppercase tracking-[0.10em] text-emerald-700 hover:text-emerald-800 transition text-left'>
          Ver historial →
        </button>
      </div>
    )
  }

  if (!factura) {
    return (
      <div className='bg-slate-50 rounded-3xl p-6 flex flex-col gap-3 border border-slate-100 h-full'>
        <p className='font-mono text-[0.8rem] font-semibold tracking-[0.18em] uppercase text-slate-400'>Mis pagos</p>
        <p className='text-sm text-slate-400 italic flex-1 flex items-center'>Sin facturas asignadas</p>
      </div>
    )
  }

  const dias       = diasHastaVenc(factura.fecha_vencimiento)
  const urgente    = dias !== null && dias <= 3
  const diasLabel  = dias === null ? '—' : dias < 0 ? 'Vencida' : dias === 0 ? 'Vence hoy' : dias === 1 ? 'Vence mañana' : `En ${dias} días`
  const colorBg    = urgente ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
  const colorTitle = urgente ? 'text-amber-700' : 'text-emerald-700'
  const colorMonto = urgente ? 'text-amber-600' : 'text-emerald-600'
  const colorBtn   = urgente ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
  const colorDias  = urgente ? 'text-amber-600' : 'text-slate-500'

  return (
    <div className={`rounded-3xl p-6 flex flex-col gap-3 border h-full ${colorBg}`}>
      <p className={`font-mono text-[0.7rem] font-semibold tracking-[0.18em] uppercase ${colorTitle}`}>
        Próximo pago al casero
      </p>
      <p className='text-base font-semibold text-slate-700 truncate'>
        {TIPO_LABEL_FC[factura.tipo] ?? factura.tipo}{factura.descripcion ? ` · ${factura.descripcion}` : ''}
      </p>
      <p className={`font-display text-5xl font-bold ${colorMonto}`}>
        {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(factura.pago?.importe_asignado ?? 0)}{' '}
        <span className='text-3xl'>€</span>
      </p>
      <div className='flex items-center justify-between gap-2 mt-auto'>
        <p className={`font-mono text-[13px] font-bold uppercase tracking-widest ${colorDias}`}>{diasLabel}</p>
        <button onClick={() => navigate('/grupo/facturas')}
          className={`cursor-pointer! text-white text-xs font-semibold px-4 py-2 rounded-xl transition whitespace-nowrap ${colorBtn}`}>
          Ver facturas →
        </button>
      </div>
    </div>
  )
}

// ── AvisoCard ─────────────────────────────────────────────────────

function AvisoCard({ evento }) {
  const iconoAviso = (
    <div className='w-9 h-9 rounded-xl bg-orange-400 flex items-center justify-center shrink-0'>
      <AlertTriangle size={16} className='text-white' />
    </div>
  )

  if (!evento) {
    return (
      <div className='bg-orange-50 rounded-3xl p-6 flex flex-col gap-3 border border-orange-100 h-full'>
        <div className='flex items-center gap-2'>
          {iconoAviso}
          <p className='font-mono text-[0.8rem] font-semibold tracking-[0.18em] uppercase text-orange-600'>Avisos</p>
        </div>
        <p className='text-sm text-orange-300 italic'>Sin eventos próximos</p>
      </div>
    )
  }

  const fecha = new Date(evento.fecha_inicio)
  const mes   = MESES_CORTO[fecha.getMonth()]
  const dia   = fecha.getDate()
  const hora  = fecha.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className='bg-orange-50 rounded-3xl p-6 flex flex-col gap-3 border border-orange-100 h-full'>
      <div className='flex items-center gap-2'>
        {iconoAviso}
        <p className='font-mono text-[0.8rem] font-semibold tracking-[0.18em] uppercase text-orange-600'>Avisos</p>
      </div>
      <h4 className='font-display text-2xl font-bold text-slate-900 leading-tight flex-1'>{evento.titulo}</h4>
      {evento.descripcion && (
        <p className='text-sm text-slate-500 line-clamp-2'>{evento.descripcion}</p>
      )}
      <div className='mt-auto pt-1'>
        <p className='font-mono text-sm font-semibold text-orange-700'>{dia} {mes} · {hora}</p>
        <p className='text-sm text-orange-600 mt-0.5'>
          Asignado por {evento.creado_por_nombre ?? 'desconocido'}
        </p>
      </div>
    </div>
  )
}

// ── ListaCompraCard ───────────────────────────────────────────────

const CATS_COMPRA = [
  { value: 'comida',   label: 'Comida',   color: '#f59e0b' },
  { value: 'hogar',    label: 'Hogar',    color: '#3b82f6' },
  { value: 'limpieza', label: 'Limpieza', color: '#10b981' },
  { value: 'otros',    label: 'Otros',    color: '#8b5cf6' },
]

function ListaCompraCard({ productos, navigate }) {
  const pendientes = productos ? productos.filter(p => !p.comprado) : null
  const total      = pendientes?.length ?? 0

  const porCategoria = CATS_COMPRA.map(cat => ({
    ...cat,
    count: pendientes?.filter(p => (p.categoria ?? 'otros') === cat.value).length ?? 0,
  }))

  const catsConItems = porCategoria.filter(c => c.count > 0).length

  return (
    <div className='bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-3' style={CARD_SHADOW}>
      <div className='flex items-center justify-between'>
        <p className='font-mono text-[0.8rem] font-semibold tracking-[0.18em] uppercase text-slate-600'>
          Lista de la compra
        </p>
        <button
          onClick={() => navigate('/grupo/compra')}
          className='cursor-pointer! font-mono text-[0.7rem] font-semibold uppercase tracking-[0.10em] text-emerald-600 hover:text-emerald-700 transition'
        >
          VER →
        </button>
      </div>

      {pendientes === null ? (
        <div className='flex justify-center py-2'>
          <div className='w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin' />
        </div>
      ) : (
        <>
          <p className='font-display text-2xl font-bold text-slate-900'>
            {total === 0
              ? 'Todo listo'
              : `${total} artículo${total !== 1 ? 's' : ''} · ${catsConItems} categoría${catsConItems !== 1 ? 's' : ''}`}
          </p>
          <div className='flex flex-col gap-2.5'>
            {porCategoria.map(cat => (
              <div key={cat.value} className='flex items-center gap-2.5'>
                <span className='w-2 h-2 rounded-full shrink-0' style={{ backgroundColor: cat.color }} />
                <span className='text-xs text-slate-500 w-16 shrink-0'>{cat.label}</span>
                <div className='flex-1 h-2 bg-slate-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full rounded-full transition-all'
                    style={{ width: total > 0 ? `${(cat.count / total) * 100}%` : '0%', backgroundColor: cat.color }}
                  />
                </div>
                <span className='text-xs font-mono text-slate-400 tabular-nums w-4 text-right'>{cat.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── HistoricoCard ─────────────────────────────────────────────────

const MESES_CORTO_HIST = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const chartConfigHistorico = {
  total: { label: 'Total', color: '#10b981' },
}

function HistoricoCard({ grupoId, navigate }) {
  const [historial, setHistorial] = useState(null)

  useEffect(() => {
    if (!grupoId) return
    fetch(`${import.meta.env.VITE_API_URL}/api/facturas/historial?grupo_id=${grupoId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setHistorial(d.historial ?? []))
      .catch(() => setHistorial([]))
  }, [grupoId])

  const datos = (historial ?? []).slice(-6).map(h => {
    const [, mes] = h.mes.split('-')
    return {
      mes: MESES_CORTO_HIST[parseInt(mes, 10) - 1],
      total: h.pagado + h.pendiente,
    }
  })

  const ultimo    = datos[datos.length - 1]
  const penultimo = datos.length >= 2 ? datos[datos.length - 2] : null
  const diff      = penultimo && ultimo ? ultimo.total - penultimo.total : null
  const igual     = diff !== null && Math.abs(diff) < 0.01

  return (
    <div className='bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-3' style={CARD_SHADOW}>
      <div className='flex items-center justify-between'>
        <p className='font-mono text-[0.8rem] font-semibold tracking-[0.18em] uppercase text-slate-600'>
          Histórico gastos
        </p>
        {diff !== null && (
          <span className={`font-mono text-[0.65rem] font-semibold uppercase tracking-wide ${igual ? 'text-slate-400' : diff > 0 ? 'text-red-400' : 'text-emerald-500'}`}>
            {igual ? '= Estable' : diff > 0 ? `↑ +${diff.toFixed(0)}€` : `↓ ${diff.toFixed(0)}€`}
          </span>
        )}
      </div>

      {historial === null ? (
        <div className='flex items-center justify-center h-16'>
          <div className='w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin' />
        </div>
      ) : datos.length === 0 ? (
        <p className='text-xs text-slate-400 italic'>Sin datos todavía</p>
      ) : (
        <>
          {ultimo && (
            <p className='font-display text-xl font-bold text-slate-900'>
              {ultimo.total.toFixed(0)} <span className='text-base font-semibold text-slate-400'>€ / mes</span>
            </p>
          )}
          <ChartContainer config={chartConfigHistorico} className='h-14'>
            <BarChart data={datos} barSize={14} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke='#f1f5f9' />
              <XAxis
                dataKey='mes'
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9, fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
                tickMargin={4}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    config={chartConfigHistorico}
                    formatter={v => `${v.toFixed(2)} €`}
                  />
                }
              />
              <Bar dataKey='total' fill='#10b981' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </>
      )}

      <button
        onClick={() => navigate('/grupo/facturas')}
        className='cursor-pointer! font-mono text-[0.7rem] font-semibold uppercase tracking-[0.10em] text-emerald-600 hover:text-emerald-700 transition text-left'
      >
        Ver historial completo →
      </button>
    </div>
  )
}

// ── GrupoDashboard ────────────────────────────────────────────────

function GrupoDashboard() {
  const { grupo, miembros, user } = useOutletContext()
  const navigate = useNavigate()

  const [productosCompra, setProductosCompra] = useState(null)
  const [eventos,         setEventos]         = useState(null)
  const [facturas,        setFacturas]        = useState(null)
  const [datosTareas,     setDatosTareas]     = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const esAdmin = miembros.find(m => m.id === user?.id)?.rol_en_grupo === 'ADMIN'

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/compra`, { credentials: 'include' })
      .then(r => r.json()).then(d => setProductosCompra(d.productos ?? [])).catch(() => setProductosCompra([]))

    fetch(`${import.meta.env.VITE_API_URL}/api/grupos/eventos`, { credentials: 'include' })
      .then(r => r.json()).then(d => setEventos(d.eventos ?? [])).catch(() => setEventos([]))

    fetch(`${import.meta.env.VITE_API_URL}/api/tareas`, { credentials: 'include' })
      .then(r => r.json()).then(d => setDatosTareas(d)).catch(() => setDatosTareas({ configurado: false, asignaciones: [] }))
  }, [])

  useEffect(() => {
    if (!grupo?.id) return
    fetch(`${import.meta.env.VITE_API_URL}/api/facturas?grupo_id=${grupo.id}`, { credentials: 'include' })
      .then(r => r.json()).then(d => setFacturas(d.facturas ?? [])).catch(() => setFacturas([]))
  }, [grupo?.id])

  const userId = user?.id
  const misPagos = (facturas ?? []).map(f => ({
    ...f,
    pago: f.pagos?.find(p => p.usuario_id === userId),
  })).filter(f => f.pago)

  const facturaPendiente = [...misPagos]
    .filter(f => !f.pago.pagado)
    .sort((a, b) => new Date(a.fecha_emision) - new Date(b.fecha_emision))[0] ?? null
  const todasPagadas = facturas !== null && facturaPendiente === null

  const agregarEvento    = ev => setEventos(prev => [...(prev ?? []), ev].sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)))
  const actualizarEvento = ev => setEventos(prev => (prev ?? []).map(e => e.id === ev.id ? { ...e, ...ev } : e).sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)))
  const eliminarEvento   = async id => {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/api/grupos/eventos/${id}`, { method: 'DELETE', credentials: 'include' })
    if (r.ok) setEventos(prev => (prev ?? []).filter(e => e.id !== id))
  }

  const hoyReal       = new Date()
  const inicioDia     = new Date(hoyReal.getFullYear(), hoyReal.getMonth(), hoyReal.getDate())
  const proximoEvento = eventos
    ? [...eventos]
        .filter(e => new Date(e.fecha_inicio) >= inicioDia)
        .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))[0] ?? null
    : null

  return (
    <div className='flex flex-col'>

      {/* Header */}
      <div className='flex items-start justify-between gap-4 mb-5 shrink-0'>
        <div>
          <p className='font-mono text-[0.7rem] font-semibold tracking-[0.18em] text-slate-400 uppercase'>
            {grupo?.nombre ?? ''}
            {grupo?.ciudad ? ` · ${grupo.ciudad}` : ''}
          </p>
          <h1 className='font-display text-3xl sm:text-[3.1rem] font-medium text-slate-900 leading-none -tracking-[0.02em] mt-0.5'>
            {getSaludo()}, {user?.nombre?.split(' ')[0]}
          </h1>
        </div>
        {esAdmin && (
          <span className='inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full shrink-0'>
            <Crown size={11} /> Administrador
          </span>
        )}
      </div>

      {/* Bento — 1 col mobile / 2 col tablet / 4 col desktop */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5'>

        {/* Fila 1 */}
        <div className='sm:col-span-2'>
          <TareasCard grupo={grupo} navigate={navigate} datosTareas={datosTareas} />
        </div>
        <FacturaCard
          factura={facturaPendiente}
          todasPagadas={todasPagadas}
          cargando={facturas === null}
          navigate={navigate}
        />
        <AvisoCard evento={proximoEvento} />

        {/* Fila 2 */}
        <div className='sm:col-span-2'>
          <AgendaCard
            eventos={eventos}
            user={user}
            esAdmin={esAdmin}
            navigate={navigate}
            onNuevo={() => setModalOpen(true)}
            onEliminar={eliminarEvento}
          />
        </div>
        <div className='sm:col-span-2 flex flex-col gap-4'>
          <ListaCompraCard productos={productosCompra} navigate={navigate} />
          <HistoricoCard grupoId={grupo?.id} navigate={navigate} />
        </div>

      </div>

      {modalOpen && (
        <ModalEvento
          onClose={() => setModalOpen(false)}
          onGuardado={(ev) => agregarEvento(ev)}
        />
      )}

    </div>
  )
}

export default GrupoDashboard
