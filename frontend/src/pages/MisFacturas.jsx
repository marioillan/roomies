import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { apiFetch } from '../lib/apiFetch'
import {
  Home, Zap, Droplet, Wifi, Receipt,
  FileText, Check, MoreHorizontal, TrendingUp, TrendingDown,
} from 'lucide-react'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'

const TIPO_CONFIG = {
  ALQUILER: { label: 'Alquiler', Icon: Home,    iconBg: 'bg-emerald-50', iconText: 'text-emerald-500' },
  LUZ:      { label: 'Luz',      Icon: Zap,     iconBg: 'bg-amber-50',   iconText: 'text-amber-500'   },
  AGUA:     { label: 'Agua',     Icon: Droplet,  iconBg: 'bg-blue-50',    iconText: 'text-blue-500'    },
  INTERNET: { label: 'Internet', Icon: Wifi,     iconBg: 'bg-violet-50',  iconText: 'text-violet-500'  },
  OTRO:     { label: 'Otro',     Icon: Receipt,  iconBg: 'bg-slate-100',  iconText: 'text-slate-500'   },
}

function formatEuros(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n ?? 0)
}

function formatFecha(str) {
  if (!str) return '—'
  const d = new Date(str.includes('T') ? str : str + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')
}

const MESES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function formatMesCorto(mesStr) {
  const [anio, mes] = mesStr.split('-')
  return `${MESES_CORTO[parseInt(mes, 10) - 1]} ${anio.slice(2)}`
}

const chartConfig = {
  pagado: { label: 'Pagado', color: '#10b981' },
}

function HistorialGastos({ grupoId }) {
  const [historial, setHistorial] = useState(null)

  useEffect(() => {
    if (!grupoId) return
    apiFetch(`/api/facturas/historial?grupo_id=${grupoId}`)
      .then(r => r.json())
      .then(d => setHistorial(d.historial ?? []))
      .catch(() => setHistorial([]))
  }, [grupoId])

  if (historial === null) {
    return (
      <div className='bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-center' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)', minHeight: '220px' }}>
        <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (historial.length === 0) {
    return (
      <div className='bg-white border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-center' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)', minHeight: '220px' }}>
        <div className='w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center'>
          <Receipt size={18} className='text-slate-400' />
        </div>
        <p className='text-sm font-semibold text-slate-500'>Sin datos para histórico todavía</p>
      </div>
    )
  }

  const datos = historial.map(h => ({
    mes: formatMesCorto(h.mes),
    pagado: h.pagado,
  }))

  const ultimoMes  = datos[datos.length - 1]
  const penulMes   = datos.length >= 2 ? datos[datos.length - 2] : null
  const diferencia = penulMes ? ultimoMes.pagado - penulMes.pagado : null
  const sube       = diferencia !== null && diferencia > 0

  return (
    <div className='bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-5' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}>
      {/* Cabecera */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h3 className='font-display text-base font-bold text-slate-900'>Histórico de gastos</h3>
          <p className='text-xs text-slate-400 mt-0.5'>Evolución mensual de tus facturas</p>
        </div>
        {diferencia !== null && Math.abs(diferencia) > 0.01 && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${sube ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
            {sube ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {sube ? '+' : ''}{formatEuros(diferencia)} vs mes anterior
          </div>
        )}
      </div>

      {/* Gráfico */}
      <ChartContainer config={chartConfig} className='h-48'>
        <AreaChart data={datos} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id='gradPagado' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%'  stopColor='#10b981' stopOpacity={0.18} />
              <stop offset='95%' stopColor='#10b981' stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke='#f1f5f9' />
          <XAxis
            dataKey='mes'
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
            tickFormatter={v => `${v}€`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                config={chartConfig}
                formatter={(value) => formatEuros(value)}
                labelFormatter={(label) => label}
              />
            }
          />
          <Area
            type='monotone'
            dataKey='pagado'
            stroke='#10b981'
            strokeWidth={2}
            fill='url(#gradPagado)'
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: '#10b981' }}
          />
        </AreaChart>
      </ChartContainer>

      {/* Leyenda manual */}
      <div className='flex items-center gap-5 text-xs'>
        <div className='flex items-center gap-1.5'>
          <span className='w-3 h-0.5 rounded-full bg-emerald-500 inline-block' />
          <span className='text-slate-500'>Pagado</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='w-3 h-0.5 rounded-full bg-amber-400 inline-block' />
          <span className='text-slate-500'>Pendiente</span>
        </div>
        <span className='ml-auto font-mono text-[0.7rem] font-semibold text-slate-400'>
          Últimos {datos.length} meses
        </span>
      </div>
    </div>
  )
}

function EstadoBadge({ pagado, size = 'md' }) {
  const text = size === 'sm' ? 'text-[0.625rem]' : 'text-[0.6875rem]'
  if (pagado) {
    return (
      <span className={`inline-flex items-center gap-1 ${text} font-bold uppercase tracking-[0.08em] text-emerald-600`}>
        <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0' /> Pagada
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1 bg-amber-50 ${text} font-bold uppercase tracking-[0.08em] text-amber-600 px-2.5 py-1 rounded`}>
      <span className='w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0' /> Pendiente
    </span>
  )
}

function DocumentoMenu({ factura, className }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef()

  useEffect(() => {
    if (!menuAbierto) return
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuAbierto])

  if (!factura.url_documento) return null

  return (
    <div ref={menuRef} className={`relative flex justify-end ${className ?? ''}`}>
      <button
        onClick={() => setMenuAbierto(v => !v)}
        aria-label='Ver documento'
        className='cursor-pointer! w-11 h-11 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition'
      >
        <MoreHorizontal size={15} />
      </button>
      {menuAbierto && (
        <div className='absolute right-0 top-10 sm:top-8 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5 min-w-[150px]'>
          <a
            href={factura.url_documento} target='_blank' rel='noreferrer'
            onClick={() => setMenuAbierto(false)}
            className='w-full flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition'
          >
            <FileText size={14} className='text-slate-400' /> Ver documento
          </a>
        </div>
      )}
    </div>
  )
}

// ── Fila de tabla (sm+) ─────────────────────────────────────────────────

function FacturaRow({ factura, userId }) {
  const pago      = factura.pagos.find(p => p.usuario_id === userId)
  const pagado    = pago?.pagado ?? false
  const cfg       = TIPO_CONFIG[factura.tipo] ?? TIPO_CONFIG.OTRO
  const { Icon }  = cfg

  return (
    <tr className='border-b border-slate-50 hover:bg-slate-50/60 transition-colors'>
      {/* Tipo icon */}
      <td className='py-4 pl-6 pr-3 w-12'>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
          <Icon size={15} className={cfg.iconText} />
        </div>
      </td>

      {/* Concepto */}
      <td className='py-4 pr-4'>
        <p className='text-[0.9375rem] font-semibold text-slate-800'>
          {cfg.label}{factura.descripcion ? ` · ${factura.descripcion}` : ''}
        </p>
        {pagado && pago?.fecha_pago && (
          <p className='text-xs text-slate-400 mt-0.5'>Pagado el {formatFecha(pago.fecha_pago)}</p>
        )}
      </td>

      {/* Emisión */}
      <td className='py-4 pr-4 text-[0.8125rem] text-slate-400 whitespace-nowrap font-mono'>
        {formatFecha(factura.fecha_emision)}
      </td>

      {/* Vencimiento */}
      <td className='py-4 pr-6 text-[0.8125rem] text-slate-400 whitespace-nowrap font-mono'>
        {formatFecha(factura.fecha_vencimiento)}
      </td>

      {/* Importe */}
      <td className='py-4 pr-6 text-right whitespace-nowrap'>
        <span className={`font-display text-[1rem] font-bold ${pagado ? 'text-emerald-600' : 'text-slate-900'}`}>
          {formatEuros(pago?.importe_asignado ?? 0)}
        </span>
      </td>

      {/* Estado */}
      <td className='py-4 pr-4 whitespace-nowrap'>
        <EstadoBadge pagado={pagado} />
      </td>

      {/* Documento */}
      <td className='py-4 pr-6'>
        <DocumentoMenu factura={factura} />
      </td>
    </tr>
  )
}

// ── Tarjeta (solo mobile) ───────────────────────────────────────────────

function FacturaCardMobile({ factura, userId }) {
  const pago      = factura.pagos.find(p => p.usuario_id === userId)
  const pagado    = pago?.pagado ?? false
  const cfg       = TIPO_CONFIG[factura.tipo] ?? TIPO_CONFIG.OTRO
  const { Icon }  = cfg

  return (
    <div className='px-4 py-4 border-b border-slate-50 last:border-0 flex items-start gap-3'>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
        <Icon size={16} className={cfg.iconText} />
      </div>

      <div className='flex-1 min-w-0'>
        <p className='text-[0.9375rem] font-semibold text-slate-800 truncate'>
          {cfg.label}{factura.descripcion ? ` · ${factura.descripcion}` : ''}
        </p>
        <p className='font-mono text-[0.6875rem] text-slate-400 mt-0.5 truncate'>
          {pagado && pago?.fecha_pago
            ? `Pagado el ${formatFecha(pago.fecha_pago)}`
            : `${formatFecha(factura.fecha_emision)} · vence ${formatFecha(factura.fecha_vencimiento)}`}
        </p>
        <div className='flex items-center justify-between gap-2 mt-2'>
          <EstadoBadge pagado={pagado} size='sm' />
          <span className={`font-display text-base font-bold ${pagado ? 'text-emerald-600' : 'text-slate-900'}`}>
            {formatEuros(pago?.importe_asignado ?? 0)}
          </span>
        </div>
      </div>

      <DocumentoMenu factura={factura} className='-mt-1.5 -mr-2' />
    </div>
  )
}

export default function MisFacturas() {
  const { grupo, miembros, user } = useOutletContext()
  const [facturas,  setFacturas]  = useState(null)
  const [filtro,    setFiltro]    = useState('todas')

  useEffect(() => {
    if (!grupo?.id) return
    apiFetch(`/api/facturas?grupo_id=${grupo.id}`)
      .then(r => r.json())
      .then(data => setFacturas(data.facturas ?? []))
      .catch(() => setFacturas([]))
  }, [grupo?.id])

  const userId = user?.id

  const misPagos = (facturas ?? []).map(f => ({
    ...f,
    pagos: f.pagos.filter(p => p.usuario_id === userId),
  })).filter(f => f.pagos.length > 0)

  const facturasFiltradas = misPagos.filter(f => {
    const pagado = f.pagos[0]?.pagado
    if (filtro === 'pendientes') return !pagado
    if (filtro === 'pagadas')    return  pagado
    return true
  })

  const deuda = misPagos
    .filter(f => !f.pagos[0]?.pagado)
    .reduce((s, f) => s + Number(f.pagos[0]?.importe_asignado ?? 0), 0)

  if (facturas === null) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Encabezado */}
      <div className='flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between'>
        <h1 className='font-display text-3xl sm:text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>Mis facturas</h1>
        {deuda > 0 && (
          <div className='bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 text-right self-start sm:self-auto'>
            <p className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-amber-500'>Deuda pendiente</p>
            <p className='font-display text-[1.5rem] font-bold text-amber-700 leading-none mt-0.5'>{formatEuros(deuda)}</p>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className='bg-white border border-slate-100 rounded-3xl' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}>
        <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between px-4 sm:px-6 py-4 border-b border-slate-100'>
          <h3 className='font-display text-base font-bold text-slate-900'>Historial</h3>
          <div className='flex gap-1'>
            {[['todas','Todas'],['pendientes','Pendientes'],['pagadas','Pagadas']].map(([val, lbl]) => (
              <button key={val} onClick={() => setFiltro(val)}
                className={`cursor-pointer! text-xs font-semibold px-3.5 py-1.5 rounded-full transition
                  ${filtro === val ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {facturasFiltradas.length === 0 ? (

          <div className='px-6 py-12 flex flex-col items-center gap-3 text-center'>
            <div className='w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center'>
              {filtro === 'pagadas' ? <Check size={18} className='text-emerald-400' /> : <FileText size={18} className='text-slate-400' />}
            </div>
            <p className='text-sm font-semibold text-slate-600'>
              {filtro === 'todas' ? 'Sin facturas todavía' : `Sin facturas ${filtro}`}
            </p>
          </div>
        ) : (
          <>
            {/* Tabla — sm y superior */}
            <div className='hidden sm:block overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-slate-50'>
                    <th className='w-12 pl-6' />
                    <th className='text-left py-2.5'>
                      <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400'>Concepto</span>
                    </th>
                    <th className='text-left py-2.5 w-28'>
                      <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400'>Emisión</span>
                    </th>
                    <th className='text-left py-2.5 w-28 pr-6'>
                      <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400'>Vence</span>
                    </th>
                    <th className='text-right py-2.5 w-24 pr-6'>
                      <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400'>Importe</span>
                    </th>
                    <th className='text-left py-2.5 w-28'>
                      <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400'>Estado</span>
                    </th>
                    <th className='w-10' />
                  </tr>
                </thead>
                <tbody>
                  {facturasFiltradas.map(f => (
                    <FacturaRow key={f.id} factura={f} userId={userId} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — mobile */}
            <div className='sm:hidden flex flex-col'>
              {facturasFiltradas.map(f => (
                <FacturaCardMobile key={f.id} factura={f} userId={userId} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Historial de gastos */}
      <HistorialGastos grupoId={grupo?.id} />
    </div>
  )
}
