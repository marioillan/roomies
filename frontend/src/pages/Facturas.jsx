import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../lib/apiFetch'
import {
  Plus, X, Trash2, FileText, Check, AlertCircle, Paperclip,
  LogOut, Home, Zap, Droplet, Wifi, Receipt, MoreHorizontal,
  ArrowLeft, Users, Pencil,
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────

const TIPO_CONFIG = {
  ALQUILER: { label: 'Alquiler', Icon: Home,    iconBg: 'bg-emerald-50', iconText: 'text-emerald-500', chipBg: 'bg-emerald-50', chipText: 'text-emerald-700', dot: 'bg-emerald-500' },
  LUZ:      { label: 'Luz',      Icon: Zap,     iconBg: 'bg-amber-50',   iconText: 'text-amber-500',   chipBg: 'bg-amber-50',   chipText: 'text-amber-700',   dot: 'bg-amber-500'   },
  AGUA:     { label: 'Agua',     Icon: Droplet,  iconBg: 'bg-blue-50',    iconText: 'text-blue-500',    chipBg: 'bg-blue-50',    chipText: 'text-blue-700',    dot: 'bg-blue-500'    },
  INTERNET: { label: 'Internet', Icon: Wifi,     iconBg: 'bg-violet-50',  iconText: 'text-violet-500',  chipBg: 'bg-violet-50',  chipText: 'text-violet-700',  dot: 'bg-violet-500'  },
  OTRO:     { label: 'Otro',     Icon: Receipt,  iconBg: 'bg-slate-100',  iconText: 'text-slate-500',   chipBg: 'bg-slate-100',  chipText: 'text-slate-600',   dot: 'bg-slate-400'   },
}

const TIPOS = Object.keys(TIPO_CONFIG)

function formatEuros(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n ?? 0)
}

function formatEurosDec(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n ?? 0)
}

function formatFechaCorta(str) {
  if (!str) return '—'
  const d = new Date(str.includes('T') ? str : str + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')
}

function getEstado(factura) {
  if (!factura.pagos.length) return 'pendiente'
  return factura.pagos.every(p => p.pagado) ? 'pagada' : 'pendiente'
}

function formatDireccion(g) {
  if (!g) return null
  const base = g.direccion ?? g.nombre
  return g.piso_puerta ? `${base} · ${g.piso_puerta}` : base
}

function esEsteMes(fechaStr) {
  if (!fechaStr) return false
  const d = new Date(fechaStr.includes('T') ? fechaStr : fechaStr + 'T00:00:00')
  const hoy = new Date()
  return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear()
}

// ── AvatarUsuario ─────────────────────────────────────────────────────

function AvatarUsuario({ foto, nombre }) {
  if (foto) return <img src={foto} alt={nombre} className='w-7 h-7 rounded-full object-cover shrink-0' />
  return (
    <div className='w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0'>
      {nombre?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

// ── División equitativa / personalizada ────────────────────────────────

function calcularDiferenciaDivision(personas, importes, importeTotal) {
  const suma = personas.reduce((s, p) => s + (Number(importes[p.id]) || 0), 0)
  return Math.round((Number(importeTotal || 0) - suma) * 100) / 100
}

function SelectorDivision({ tipoDivision, onChange }) {
  return (
    <div className='flex flex-col gap-2'>
      <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>División *</label>
      <div className='flex gap-2'>
        {[['EQUITATIVA', 'Equitativo'], ['PERSONALIZADA', 'Personalizado']].map(([value, label]) => {
          const sel = tipoDivision === value
          return (
            <button key={value} type='button' onClick={() => onChange(value)}
              className={`cursor-pointer! inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold px-3 py-1.5 rounded-full border transition
                ${sel ? 'bg-emerald-50 text-emerald-700 border-transparent' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
              {sel && <Check size={11} />}{label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DivisionPersonalizada({ personas, importes, onCambiarImporte, importeTotal }) {
  const suma = personas.reduce((s, p) => s + (Number(importes[p.id]) || 0), 0)
  const diferencia = calcularDiferenciaDivision(personas, importes, importeTotal)

  return (
    <div className='flex flex-col gap-2.5 bg-slate-50 rounded-xl p-3'>
      {personas.map(p => (
        <div key={p.id} className='flex items-center gap-3'>
          <AvatarUsuario foto={p.foto} nombre={p.nombre} />
          <p className='flex-1 text-sm font-medium text-slate-700 truncate'>{p.nombre}</p>
          <input
            type='number' step='0.01' min='0' value={importes[p.id] ?? ''}
            onChange={e => onCambiarImporte(p.id, e.target.value)}
            placeholder='0.00'
            className='w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-right text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition'
          />
        </div>
      ))}
      <div className='flex items-center justify-between pt-2 mt-1 border-t border-slate-200'>
        <span className='text-xs font-semibold text-slate-500'>Suma: {formatEurosDec(suma)}</span>
        {diferencia !== 0 && (
          <span className='text-xs font-semibold text-red-600'>
            {diferencia > 0 ? `Faltan ${formatEurosDec(diferencia)}` : `Sobran ${formatEurosDec(Math.abs(diferencia))}`}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Modal nueva factura ───────────────────────────────────────────────

function ModalNuevaFactura({ onClose, onCreada, grupoId, miembros }) {
  const [form, setForm] = useState({
    tipo: '',
    importe_total: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    descripcion: '',
  })
  const [archivo, setArchivo] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [tipoDivision, setTipoDivision] = useState('EQUITATIVA')
  const [importes, setImportes] = useState({})
  const fileRef = useRef()

  const inquilinos = miembros.filter(m => !m.es_casero)
    .map(m => ({ id: m.id, nombre: m.username, foto: m.foto_perfil }))
  const diferencia = calcularDiferenciaDivision(inquilinos, importes, form.importe_total)

  const cambiar = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  const cambiarImporte = (usuarioId, valor) => setImportes(prev => ({ ...prev, [usuarioId]: valor }))

  const enviar = async (e) => {
    e.preventDefault()
    if (!form.tipo)                                                  { setError('Selecciona el tipo de factura'); return }
    if (!form.importe_total || Number(form.importe_total) <= 0)      { setError('El importe debe ser un número positivo'); return }
    if (!form.fecha_emision)                                         { setError('La fecha de emisión es obligatoria'); return }
    if (!form.fecha_vencimiento)                                     { setError('La fecha de vencimiento es obligatoria'); return }
    if (tipoDivision === 'PERSONALIZADA') {
      if (inquilinos.some(p => !(Number(importes[p.id]) > 0)))       { setError('Indica el importe de cada inquilino'); return }
      if (diferencia !== 0)                                          { setError('La suma de los importes no coincide con el importe total'); return }
    }

    setEnviando(true); setError(null)
    try {
      const fd = new FormData()
      fd.append('tipo',              form.tipo)
      fd.append('importe_total',     form.importe_total)
      fd.append('fecha_emision',     form.fecha_emision)
      fd.append('fecha_vencimiento', form.fecha_vencimiento)
      fd.append('tipo_division',     tipoDivision)
      if (tipoDivision === 'PERSONALIZADA') {
        fd.append('importes_personalizados', JSON.stringify(
          inquilinos.map(p => ({ usuario_id: p.id, importe: Number(importes[p.id]) }))
        ))
      }
      if (form.descripcion.trim()) fd.append('descripcion', form.descripcion.trim())
      if (archivo) fd.append('documento', archivo)
      if (grupoId) fd.append('grupo_id', grupoId)

      const r = await apiFetch('/api/facturas', { method: 'POST', body: fd })
      const data = await r.json()
      if (!r.ok) { setError(data.message ?? 'Error al crear la factura'); return }
      onCreada(data.factura)
      onClose()
    } catch {
      setError('Error de conexión')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm' onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col transition-[max-width] duration-300 ${tipoDivision === 'PERSONALIZADA' ? 'max-w-3xl' : 'max-w-md'}`} onClick={e => e.stopPropagation()}>

        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0'>
          <h3 className='font-display text-base font-bold text-slate-900'>Nueva factura</h3>
          <button onClick={onClose} className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition'>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={enviar} className='p-6 flex flex-col gap-4 overflow-y-auto'>

          <div className={tipoDivision === 'PERSONALIZADA' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'flex flex-col gap-4'}>
            <div className='flex flex-col gap-4'>
              {/* Tipo */}
              <div className='flex flex-col gap-2'>
                <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Tipo *</label>
                <div className='flex flex-wrap gap-2'>
                  {TIPOS.map(value => {
                    const cfg = TIPO_CONFIG[value]
                    const sel = form.tipo === value
                    return (
                      <button
                        key={value} type='button'
                        onClick={() => setForm(prev => ({ ...prev, tipo: sel ? '' : value }))}
                        className={`cursor-pointer! inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold px-3 py-1.5 rounded-full border transition
                          ${sel ? `${cfg.chipBg} ${cfg.chipText} border-transparent` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                      >
                        {sel && <Check size={11} />}
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Importe */}
              <div className='flex flex-col gap-1.5'>
                <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Importe total (€) *</label>
                <input name='importe_total' type='number' step='0.01' min='0.01' value={form.importe_total} onChange={cambiar} placeholder='0.00'
                  className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition' />
              </div>

              {/* División */}
              <SelectorDivision tipoDivision={tipoDivision} onChange={setTipoDivision} />

              {/* Fechas */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1.5'>
                  <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Emisión *</label>
                  <input type='date' name='fecha_emision' value={form.fecha_emision} onChange={cambiar}
                    className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition' />
                </div>
                <div className='flex flex-col gap-1.5'>
                  <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Vencimiento *</label>
                  <input type='date' name='fecha_vencimiento' value={form.fecha_vencimiento} onChange={cambiar}
                    className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition' />
                </div>
              </div>

              {/* Descripción */}
              <div className='flex flex-col gap-1.5'>
                <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Descripción</label>
                <textarea name='descripcion' value={form.descripcion} onChange={cambiar} rows={2} placeholder='Ej: Factura de abril, incluye IVA…'
                  className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition resize-none' />
              </div>

              {/* Adjunto */}
              <div className='flex flex-col gap-1.5'>
                <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Documento (PDF/imagen)</label>
                <input ref={fileRef} type='file' accept='.pdf,image/*' className='hidden' onChange={e => setArchivo(e.target.files[0] ?? null)} />
                <button type='button' onClick={() => fileRef.current?.click()}
                  className='cursor-pointer! flex items-center gap-2 border border-dashed border-slate-300 hover:border-emerald-400 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:text-emerald-600 transition'>
                  <Paperclip size={14} />
                  {archivo
                    ? <span className='truncate text-slate-800 font-medium'>{archivo.name}</span>
                    : <span>Seleccionar archivo…</span>
                  }
                </button>
              </div>
            </div>

            {tipoDivision === 'PERSONALIZADA' && (
              <div className='flex flex-col gap-1.5'>
                <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Importe por inquilino</label>
                {inquilinos.length
                  ? <DivisionPersonalizada personas={inquilinos} importes={importes} onCambiarImporte={cambiarImporte} importeTotal={form.importe_total} />
                  : <p className='text-sm text-slate-400'>No hay inquilinos en el grupo</p>
                }
              </div>
            )}
          </div>

          {error && (
            <div className='flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5'>
              <AlertCircle size={14} className='text-red-500 mt-0.5 shrink-0' />
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          )}

          <div className='flex justify-end gap-2 pt-1'>
            <button type='button' onClick={onClose} className='cursor-pointer! px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition'>
              Cancelar
            </button>
            <button type='submit' disabled={enviando || (tipoDivision === 'PERSONALIZADA' && diferencia !== 0)}
              className='cursor-pointer! px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50'>
              {enviando ? 'Subiendo…' : 'Crear factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── ModalEditarFactura ────────────────────────────────────────────────

function ModalEditarFactura({ onClose, onActualizada, grupoId, factura }) {
  const [form, setForm] = useState({
    tipo:              factura.tipo ?? '',
    importe_total:     factura.importe_total ?? '',
    fecha_emision:     factura.fecha_emision?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    fecha_vencimiento: factura.fecha_vencimiento?.split('T')[0] ?? '',
    descripcion:       factura.descripcion ?? '',
  })
  const [archivo,   setArchivo]   = useState(null)
  const [enviando,  setEnviando]  = useState(false)
  const [error,     setError]     = useState(null)
  const [tipoDivision, setTipoDivision] = useState(factura.tipo_division ?? 'EQUITATIVA')
  const [importes, setImportes] = useState(() => {
    const obj = {}
    factura.pagos.forEach(p => { obj[p.usuario_id] = String(p.importe_asignado) })
    return obj
  })
  const fileRef = useRef()

  const inquilinos = factura.pagos.map(p => ({ id: p.usuario_id, nombre: p.nombre_usuario, foto: p.foto_usuario }))
  const diferencia = calcularDiferenciaDivision(inquilinos, importes, form.importe_total)

  const cambiar = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  const cambiarImporte = (usuarioId, valor) => setImportes(prev => ({ ...prev, [usuarioId]: valor }))

  const enviar = async (e) => {
    e.preventDefault()
    if (!form.tipo)                                             { setError('Selecciona el tipo de factura'); return }
    if (!form.importe_total || Number(form.importe_total) <= 0){ setError('El importe debe ser un número positivo'); return }
    if (!form.fecha_emision)                                   { setError('La fecha de emisión es obligatoria'); return }
    if (!form.fecha_vencimiento)                               { setError('La fecha de vencimiento es obligatoria'); return }
    if (tipoDivision === 'PERSONALIZADA') {
      if (inquilinos.some(p => !(Number(importes[p.id]) > 0)))  { setError('Indica el importe de cada inquilino'); return }
      if (diferencia !== 0)                                     { setError('La suma de los importes no coincide con el importe total'); return }
    }

    setEnviando(true); setError(null)
    try {
      const fd = new FormData()
      fd.append('tipo',              form.tipo)
      fd.append('importe_total',     form.importe_total)
      fd.append('fecha_emision',     form.fecha_emision)
      fd.append('fecha_vencimiento', form.fecha_vencimiento)
      fd.append('tipo_division',     tipoDivision)
      if (tipoDivision === 'PERSONALIZADA') {
        fd.append('importes_personalizados', JSON.stringify(
          inquilinos.map(p => ({ usuario_id: p.id, importe: Number(importes[p.id]) }))
        ))
      }
      if (form.descripcion.trim()) fd.append('descripcion', form.descripcion.trim())
      if (archivo) fd.append('documento', archivo)
      if (grupoId) fd.append('grupo_id', grupoId)

      const r = await apiFetch(`/api/facturas/${factura.id}`, { method: 'PUT', body: fd })
      const data = await r.json()
      if (!r.ok) { setError(data.message ?? 'Error al guardar los cambios'); return }
      onActualizada(data.factura)
      onClose()
    } catch {
      setError('Error de conexión')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm' onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col transition-[max-width] duration-300 ${tipoDivision === 'PERSONALIZADA' ? 'max-w-3xl' : 'max-w-md'}`} onClick={e => e.stopPropagation()}>

        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0'>
          <h3 className='font-display text-base font-bold text-slate-900'>Editar factura</h3>
          <button onClick={onClose} className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition'>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={enviar} className='p-6 flex flex-col gap-4 overflow-y-auto'>
          <div className={tipoDivision === 'PERSONALIZADA' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'flex flex-col gap-4'}>
            <div className='flex flex-col gap-4'>
              {/* Tipo */}
              <div className='flex flex-col gap-2'>
                <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Tipo *</label>
                <div className='flex flex-wrap gap-2'>
                  {TIPOS.map(value => {
                    const cfg = TIPO_CONFIG[value]
                    const sel = form.tipo === value
                    return (
                      <button key={value} type='button'
                        onClick={() => setForm(prev => ({ ...prev, tipo: sel ? '' : value }))}
                        className={`cursor-pointer! inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold px-3 py-1.5 rounded-full border transition
                          ${sel ? `${cfg.chipBg} ${cfg.chipText} border-transparent` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                      >
                        {sel && <Check size={11} />}{cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Importe */}
              <div className='flex flex-col gap-1.5'>
                <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Importe total (€) *</label>
                <input name='importe_total' type='number' step='0.01' min='0.01' value={form.importe_total} onChange={cambiar} placeholder='0.00'
                  className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition' />
              </div>

              {/* División */}
              <SelectorDivision tipoDivision={tipoDivision} onChange={setTipoDivision} />

              {/* Fechas */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1.5'>
                  <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Emisión *</label>
                  <input type='date' name='fecha_emision' value={form.fecha_emision} onChange={cambiar}
                    className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition' />
                </div>
                <div className='flex flex-col gap-1.5'>
                  <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Vencimiento *</label>
                  <input type='date' name='fecha_vencimiento' value={form.fecha_vencimiento} onChange={cambiar}
                    className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition' />
                </div>
              </div>

              {/* Descripción */}
              <div className='flex flex-col gap-1.5'>
                <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Descripción</label>
                <textarea name='descripcion' value={form.descripcion} onChange={cambiar} rows={2} placeholder='Ej: Factura de abril…'
                  className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition resize-none' />
              </div>

              {/* Adjunto */}
              <div className='flex flex-col gap-1.5'>
                <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                  Documento {factura.url_documento ? '(reemplazar)' : '(PDF/imagen)'}
                </label>
                <input ref={fileRef} type='file' accept='.pdf,image/*' className='hidden' onChange={e => setArchivo(e.target.files[0] ?? null)} />
                <button type='button' onClick={() => fileRef.current?.click()}
                  className='cursor-pointer! flex items-center gap-2 border border-dashed border-slate-300 hover:border-emerald-400 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:text-emerald-600 transition'>
                  <Paperclip size={14} />
                  {archivo
                    ? <span className='truncate text-slate-800 font-medium'>{archivo.name}</span>
                    : <span>{factura.url_documento ? 'Seleccionar nuevo archivo…' : 'Seleccionar archivo…'}</span>
                  }
                </button>
              </div>
            </div>

            {tipoDivision === 'PERSONALIZADA' && (
              <div className='flex flex-col gap-1.5'>
                <label className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Importe por inquilino</label>
                <DivisionPersonalizada personas={inquilinos} importes={importes} onCambiarImporte={cambiarImporte} importeTotal={form.importe_total} />
              </div>
            )}
          </div>

          {error && (
            <div className='flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5'>
              <AlertCircle size={14} className='text-red-500 mt-0.5 shrink-0' />
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          )}

          <div className='flex justify-end gap-2 pt-1'>
            <button type='button' onClick={onClose} className='cursor-pointer! px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition'>
              Cancelar
            </button>
            <button type='submit' disabled={enviando || (tipoDivision === 'PERSONALIZADA' && diferencia !== 0)}
              className='cursor-pointer! px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50'>
              {enviando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Datos derivados comunes a fila y tarjeta ───────────────────────────

function useFacturaDatos(factura, esCasero, userId) {
  const estado = getEstado(factura)
  const cfg    = TIPO_CONFIG[factura.tipo] ?? TIPO_CONFIG.OTRO

  const miPago = !esCasero ? factura.pagos.find(p => p.usuario_id === userId) : null

  let subtitulo = null
  if (esCasero && estado === 'pagada') {
    const fechas = factura.pagos.map(p => p.fecha_pago).filter(Boolean).sort()
    const ultima = fechas[fechas.length - 1]
    subtitulo = ultima ? `Cobrado · ${formatFechaCorta(ultima)}` : 'Cobrado'
  } else if (!esCasero && miPago?.pagado && miPago.fecha_pago) {
    subtitulo = `Pagado el ${formatFechaCorta(miPago.fecha_pago)}`
  }

  const montoDisplay = esCasero ? factura.importe_total : (miPago?.importe_asignado ?? factura.importe_total)
  const estadoPersonal = esCasero ? estado : (miPago?.pagado ? 'pagada' : 'pendiente')

  return { cfg, subtitulo, montoDisplay, estadoPersonal }
}

// ── Badge de estado ─────────────────────────────────────────────────────

function EstadoBadge({ estado, size = 'md' }) {
  const text = size === 'sm' ? 'text-[0.625rem]' : 'text-[0.6875rem]'
  if (estado === 'pagada') {
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

// ── Menú de acciones de una factura (casero) ───────────────────────────

function MenuFactura({ factura, expandido, onToggleExpandido, onEditar, onMarcarPagada, onEliminar, onCerrar }) {
  return (
    <>
      <button
        onClick={() => { onToggleExpandido(); onCerrar() }}
        className='cursor-pointer! w-full flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition'
      >
        <Users size={14} className='text-slate-400' />
        {expandido ? 'Ocultar pagos' : 'Ver pagos'}
      </button>
      <button
        onClick={() => { onEditar(factura); onCerrar() }}
        className='cursor-pointer! w-full flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition'
      >
        <Pencil size={14} className='text-slate-400' /> Editar
      </button>
      {factura.url_documento && (
        <a
          href={factura.url_documento} target='_blank' rel='noreferrer'
          onClick={onCerrar}
          className='w-full flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition'
        >
          <FileText size={14} className='text-slate-400' /> Ver documento
        </a>
      )}
      <div className='border-t border-slate-100 my-1' />
      <button
        onClick={() => { onMarcarPagada(factura.id); onCerrar() }}
        className='cursor-pointer! w-full flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition'
      >
        <Check size={14} className='text-slate-400' />
        {factura.pagos.every(p => p.pagado) ? 'Desmarcar todos' : 'Marcar como pagada'}
      </button>
      {!factura.pagos.some(p => p.pagado) && (
        <>
          <div className='border-t border-slate-100 my-1' />
          <button
            onClick={() => { onEliminar(factura.id); onCerrar() }}
            className='cursor-pointer! w-full flex items-center gap-2 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition'
          >
            <Trash2 size={14} /> Eliminar
          </button>
        </>
      )}
    </>
  )
}

// ── Desglose de pagos por inquilino (expandible) ───────────────────────

function PagosPorInquilino({ factura, onTogglePago }) {
  const [toggling, setToggling] = useState(null)

  const handleToggle = async (usuarioId) => {
    if (toggling) return
    setToggling(usuarioId)
    await onTogglePago(factura.id, usuarioId)
    setToggling(null)
  }

  return (
    <div>
      <p className='font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3'>
        Pagos por inquilino {factura.tipo_division === 'PERSONALIZADA' ? '(división personalizada)' : `— ${formatEuros(factura.importe_total / (factura.pagos.length || 1))} cada uno`}
      </p>
      <div className='flex flex-col gap-2.5 max-w-sm'>
        {factura.pagos.map(pago => (
          <div key={pago.id} className='flex items-center gap-3'>
            <AvatarUsuario foto={pago.foto_usuario} nombre={pago.nombre_usuario} />
            <p className='flex-1 text-sm font-medium text-slate-700 truncate'>{pago.nombre_usuario ?? 'Inquilino'}</p>
            <span className='text-sm font-semibold text-slate-500 whitespace-nowrap'>{formatEurosDec(pago.importe_asignado)}</span>
            <button
              onClick={() => handleToggle(pago.usuario_id)}
              disabled={toggling === pago.usuario_id}
              className={`cursor-pointer! inline-flex items-center gap-1.5 text-[0.75rem] font-semibold px-3 py-1.5 rounded-full transition
                ${pago.pagado ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}
                ${toggling === pago.usuario_id ? 'opacity-50' : ''}`}
            >
              {pago.pagado ? <><Check size={11} /> Pagado</> : 'Pendiente'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── FacturaRow (tabla, sm+) ─────────────────────────────────────────────

function FacturaRow({ factura, esCasero, userId, onTogglePago, onEliminar, onEditar, onMarcarPagada }) {
  const [expandido,  setExpandido]  = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef()

  const { cfg, subtitulo, montoDisplay, estadoPersonal } = useFacturaDatos(factura, esCasero, userId)
  const { Icon } = cfg

  useEffect(() => {
    if (!menuAbierto) return
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuAbierto])

  return (
    <>
      <tr className='border-b border-slate-50 hover:bg-slate-50/60 transition-colors group'>
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
          {subtitulo && <p className='text-xs text-slate-400 mt-0.5'>{subtitulo}</p>}
        </td>

        {/* Subida */}
        <td className='py-4 pr-4 font-mono text-[0.8125rem] text-slate-400 whitespace-nowrap'>
          {formatFechaCorta(factura.fecha_emision)}
        </td>

        {/* Vence */}
        <td className='py-4 pr-4 font-mono text-[0.8125rem] text-slate-400 whitespace-nowrap'>
          {formatFechaCorta(factura.fecha_vencimiento)}
        </td>

        {/* Monto */}
        <td className='py-4 pr-6 text-right whitespace-nowrap'>
          <span className={`font-display text-[1rem] font-bold ${estadoPersonal === 'pagada' ? 'text-emerald-600' : 'text-slate-900'}`}>
            {formatEuros(montoDisplay)}
          </span>
        </td>

        {/* Estado */}
        <td className='py-4 pr-4 whitespace-nowrap'>
          <EstadoBadge estado={estadoPersonal} />
        </td>

        {/* Acciones */}
        <td className='py-4 pr-6'>
          <div ref={menuRef} className='relative flex justify-end'>
            <button
              onClick={() => setMenuAbierto(v => !v)}
              className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition opacity-0 group-hover:opacity-100'
            >
              <MoreHorizontal size={15} />
            </button>

            {menuAbierto && (
              <div className='absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5 min-w-[170px]'>
                {esCasero && (
                  <MenuFactura
                    factura={factura}
                    expandido={expandido}
                    onToggleExpandido={() => setExpandido(v => !v)}
                    onEditar={onEditar}
                    onMarcarPagada={onMarcarPagada}
                    onEliminar={onEliminar}
                    onCerrar={() => setMenuAbierto(false)}
                  />
                )}
                {!esCasero && factura.url_documento && (
                  <a
                    href={factura.url_documento} target='_blank' rel='noreferrer'
                    onClick={() => setMenuAbierto(false)}
                    className='w-full flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition'
                  >
                    <FileText size={14} className='text-slate-400' /> Ver documento
                  </a>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Pagos expandidos (solo casero) */}
      {expandido && esCasero && (
        <tr className='bg-slate-50 border-b border-slate-100'>
          <td colSpan={7} className='px-6 py-4'>
            <PagosPorInquilino factura={factura} onTogglePago={onTogglePago} />
          </td>
        </tr>
      )}
    </>
  )
}

// ── FacturaCardMobile (tarjeta, solo mobile) ───────────────────────────

function FacturaCardMobile({ factura, esCasero, userId, onTogglePago, onEliminar, onEditar, onMarcarPagada }) {
  const [expandido,  setExpandido]  = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef()

  const { cfg, subtitulo, montoDisplay, estadoPersonal } = useFacturaDatos(factura, esCasero, userId)
  const { Icon } = cfg

  useEffect(() => {
    if (!menuAbierto) return
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuAbierto])

  return (
    <div className='px-4 py-4 border-b border-slate-50 last:border-0'>
      <div className='flex items-start gap-3'>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
          <Icon size={16} className={cfg.iconText} />
        </div>

        <div className='flex-1 min-w-0'>
          <p className='text-[0.9375rem] font-semibold text-slate-800 truncate'>
            {cfg.label}{factura.descripcion ? ` · ${factura.descripcion}` : ''}
          </p>
          <p className='font-mono text-[0.6875rem] text-slate-400 mt-0.5 truncate'>
            {subtitulo ?? `${formatFechaCorta(factura.fecha_emision)} · vence ${formatFechaCorta(factura.fecha_vencimiento)}`}
          </p>
          <div className='flex items-center justify-between gap-2 mt-2'>
            <EstadoBadge estado={estadoPersonal} size='sm' />
            <span className={`font-display text-base font-bold ${estadoPersonal === 'pagada' ? 'text-emerald-600' : 'text-slate-900'}`}>
              {formatEuros(montoDisplay)}
            </span>
          </div>
        </div>

        <div ref={menuRef} className='relative shrink-0'>
          <button
            onClick={() => setMenuAbierto(v => !v)}
            aria-label='Acciones de la factura'
            className='cursor-pointer! w-11 h-11 -mt-1.5 -mr-2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition'
          >
            <MoreHorizontal size={17} />
          </button>

          {menuAbierto && (
            <div className='absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5 min-w-[170px]'>
              {esCasero && (
                <MenuFactura
                  factura={factura}
                  expandido={expandido}
                  onToggleExpandido={() => setExpandido(v => !v)}
                  onEditar={onEditar}
                  onMarcarPagada={onMarcarPagada}
                  onEliminar={onEliminar}
                  onCerrar={() => setMenuAbierto(false)}
                />
              )}
              {!esCasero && factura.url_documento && (
                <a
                  href={factura.url_documento} target='_blank' rel='noreferrer'
                  onClick={() => setMenuAbierto(false)}
                  className='w-full flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition'
                >
                  <FileText size={14} className='text-slate-400' /> Ver documento
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {expandido && esCasero && (
        <div className='mt-3 pl-13'>
          <PagosPorInquilino factura={factura} onTogglePago={onTogglePago} />
        </div>
      )}
    </div>
  )
}

// ── Header compartido ─────────────────────────────────────────────────

function Header({ user, esCasero, onLogout, onVolver }) {
  const navigate = useNavigate()
  return (
    <header className='bg-white border-b border-slate-100'>
      <div className='max-w-5xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center gap-3'>
        {onVolver && (
          <button onClick={onVolver} className='cursor-pointer! w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0'>
            <ArrowLeft size={17} />
          </button>
        )}

        {esCasero ? (
          <button onClick={() => navigate('/')} className='cursor-pointer! font-display text-2xl font-bold -tracking-[0.02em] text-slate-900 shrink-0'>
            Housie
          </button>
        ) : (
          <span className='font-display text-[1.5rem] font-bold text-slate-900 shrink-0'>
            Mis facturas
          </span>
        )}

        <div className='flex-1' />

        <div className='hidden sm:flex flex-col items-end'>
          <span className='text-sm font-semibold text-slate-900 leading-tight'>{user?.nombre}</span>
          <span className={`font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] ${esCasero ? 'text-emerald-600' : 'text-slate-400'}`}>
            {esCasero ? 'Casero' : 'Inquilino'}
          </span>
        </div>

        <div className='sm:hidden w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0'>
          <span className='text-sm font-bold text-emerald-700'>{user?.nombre?.[0]?.toUpperCase()}</span>
        </div>

        {onLogout && (
          <button onClick={onLogout} title='Cerrar sesión'
            className='cursor-pointer! w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0'>
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  )
}

// ── Vista Casero ──────────────────────────────────────────────────────

function VistaCasero({ facturas, setFacturas, grupo, miembros, grupoId, selectorGrupo }) {
  const [modalAbierto,    setModalAbierto]    = useState(false)
  const [facturaEditando, setFacturaEditando] = useState(null)
  const [filtro,          setFiltro]          = useState('todas')
  const [error,           setError]           = useState(null)

  const facturasEsteMes = facturas.filter(f => esEsteMes(f.fecha_emision))

  const porCobrar = facturasEsteMes
    .flatMap(f => f.pagos).filter(p => !p.pagado)
    .reduce((s, p) => s + Number(p.importe_asignado), 0)

  const cobrado = facturasEsteMes
    .flatMap(f => f.pagos).filter(p => p.pagado)
    .reduce((s, p) => s + Number(p.importe_asignado), 0)

  const pendienteCount = facturasEsteMes.filter(f => getEstado(f) === 'pendiente').length
  const pagadaCount    = facturasEsteMes.filter(f => getEstado(f) === 'pagada').length

  const facturasFiltradas = facturas.filter(f => {
    if (filtro === 'pendientes') return getEstado(f) === 'pendiente'
    if (filtro === 'pagadas')    return getEstado(f) === 'pagada'
    return true
  })

  const handleEliminar = async (id) => {
    try {
      const r = await apiFetch(`/api/facturas/${id}?grupo_id=${grupoId}`, { method: 'DELETE' })
      if (!r.ok) { const d = await r.json(); setError(d.message); return }
      setFacturas(prev => prev.filter(f => f.id !== id))
    } catch {
      setError('Error al eliminar la factura')
    }
  }

  const handleActualizada = (facturaActualizada) => {
    setFacturas(prev => prev.map(f => f.id !== facturaActualizada.id ? f : facturaActualizada))
    setFacturaEditando(null)
  }

  const handleMarcarPagada = async (facturaId) => {
    try {
      const r = await apiFetch(`/api/facturas/${facturaId}/pagada?grupo_id=${grupoId}`, { method: 'PATCH' })
      if (!r.ok) { const d = await r.json(); setError(d.message); return }
      const { pagos } = await r.json()
      setFacturas(prev => prev.map(f => f.id !== facturaId ? f : { ...f, pagos }))
    } catch {
      setError('Error al actualizar los pagos')
    }
  }

  const handleTogglePago = async (facturaId, usuarioId) => {
    try {
      const r = await apiFetch(`/api/facturas/${facturaId}/pagos/${usuarioId}?grupo_id=${grupoId}`, { method: 'PATCH' })
      if (!r.ok) { const d = await r.json(); setError(d.message); return }
      const { pago } = await r.json()
      setFacturas(prev => prev.map(f => {
        if (f.id !== facturaId) return f
        return { ...f, pagos: f.pagos.map(p => p.usuario_id === usuarioId ? { ...p, pagado: pago.pagado, fecha_pago: pago.fecha_pago } : p) }
      }))
    } catch {
      setError('Error al actualizar el pago')
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Fecha + título + selector */}
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='font-display text-3xl sm:text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>Tus facturas</h1>
        </div>
        {selectorGrupo}
      </div>

      {/* Error */}
      {error && (
        <div className='flex items-start gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3'>
          <AlertCircle size={14} className='text-red-500 mt-0.5 shrink-0' />
          <p className='text-sm text-red-700'>{error}</p>
          <button onClick={() => setError(null)} className='cursor-pointer! ml-auto text-red-400 hover:text-red-600'><X size={13} /></button>
        </div>
      )}

      {/* Cards resumen */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {/* Por cobrar */}
        <div className='bg-slate-900 rounded-3xl px-5 sm:px-7 py-5 sm:py-6 flex flex-col gap-2'>
          <p className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-400'>Por cobrar este mes</p>
          <p className='font-display text-4xl sm:text-[2.5rem] font-bold text-white leading-none'>{formatEuros(porCobrar)}</p>
          <p className='text-sm text-slate-400'>
            {pendienteCount === 0 ? 'Todo cobrado' : `${pendienteCount} ${pendienteCount === 1 ? 'factura pendiente' : 'facturas pendientes'}`}
          </p>
        </div>

        {/* Cobrado */}
        <div className='bg-emerald-50 border border-emerald-100 rounded-3xl px-5 sm:px-7 py-5 sm:py-6 flex flex-col gap-2'>
          <p className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-emerald-600'>Cobrado este mes</p>
          <p className='font-display text-4xl sm:text-[2.5rem] font-bold text-emerald-700 leading-none'>{formatEuros(cobrado)}</p>
          <p className='text-sm text-emerald-500'>
            {pagadaCount === 0 ? 'Sin pagos recibidos' : `${pagadaCount} ${pagadaCount === 1 ? 'pagada' : 'pagadas'}`}
          </p>
        </div>

        {/* Subir factura */}
        <div className='bg-white border border-slate-100 rounded-3xl px-5 sm:px-7 py-5 sm:py-6 flex flex-col gap-3' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}>
          <p className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-400'>Subir nueva factura</p>
          <p className='text-sm text-slate-400 leading-relaxed'>Tipo, monto, fecha límite y adjuntar PDF</p>
          <button
            onClick={() => setModalAbierto(true)}
            className='cursor-pointer! mt-auto inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition w-fit'
          >
            <Plus size={14} /> Subir factura
          </button>
        </div>
      </div>

      {/* Tabla historial */}
      <div className='bg-white border border-slate-100 rounded-3xl' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}>

        {/* Cabecera */}
        <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between px-4 sm:px-6 py-4 border-b border-slate-100'>
          <div>
            {(grupo?.direccion || grupo?.nombre) && (
              <p className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-400'>
                {formatDireccion(grupo)}{grupo?.ciudad ? ` · ${grupo.ciudad}` : ''}
              </p>
            )}
            <h3 className='font-display text-base font-bold text-slate-900 mt-0.5'>Historial de facturas</h3>
          </div>
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
              <FileText size={18} className='text-slate-400' />
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
                      <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400'>Subida</span>
                    </th>
                    <th className='text-left py-2.5 w-28 pr-6'>
                      <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400'>Vence</span>
                    </th>
                    <th className='text-right py-2.5 w-24 pr-6'>
                      <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400'>Monto</span>
                    </th>
                    <th className='text-left py-2.5 w-28'>
                      <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400'>Estado</span>
                    </th>
                    <th className='w-10' />
                  </tr>
                </thead>
                <tbody>
                  {facturasFiltradas.map(f => (
                    <FacturaRow
                      key={f.id}
                      factura={f}
                      esCasero
                      onTogglePago={handleTogglePago}
                      onEliminar={handleEliminar}
                      onEditar={setFacturaEditando}
                      onMarcarPagada={handleMarcarPagada}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — mobile */}
            <div className='sm:hidden flex flex-col'>
              {facturasFiltradas.map(f => (
                <FacturaCardMobile
                  key={f.id}
                  factura={f}
                  esCasero
                  onTogglePago={handleTogglePago}
                  onEliminar={handleEliminar}
                  onEditar={setFacturaEditando}
                  onMarcarPagada={handleMarcarPagada}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {modalAbierto && (
        <ModalNuevaFactura
          onClose={() => setModalAbierto(false)}
          onCreada={nueva => setFacturas(prev => [nueva, ...prev])}
          grupoId={grupoId}
          miembros={miembros}
        />
      )}
      {facturaEditando && (
        <ModalEditarFactura
          onClose={() => setFacturaEditando(null)}
          onActualizada={handleActualizada}
          grupoId={grupoId}
          factura={facturaEditando}
        />
      )}
    </div>
  )
}

// ── SelectorGrupo (casero con múltiples pisos) ────────────────────────

function SelectorGrupo({ grupos, grupoActivo, onChange, onVincular }) {
  const [abierto,   setAbierto]   = useState(false)
  const [codigo,    setCodigo]    = useState('')
  const [enviando,  setEnviando]  = useState(false)
  const [errorCod,  setErrorCod]  = useState(null)
  const inputRef = useRef()

  const abrirVincular = () => {
    setAbierto(true)
    setErrorCod(null)
    setCodigo('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const vincular = async (e) => {
    e.preventDefault()
    const cod = codigo.trim().toUpperCase()
    if (cod.length !== 6) { setErrorCod('El código debe tener 6 caracteres'); return }
    setEnviando(true); setErrorCod(null)
    try {
      const r = await apiFetch('/api/grupos/unirse', {
        method: 'POST', body: JSON.stringify({ codigo_acceso: cod }),
      })
      const data = await r.json()
      if (!r.ok) { setErrorCod(data.message ?? 'Código incorrecto'); return }
      if (!data.esCasero) { setErrorCod('Ese código no es de casero'); return }
      setAbierto(false)
      onVincular(data.grupo)
    } catch {
      setErrorCod('Error de conexión')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className='flex items-center gap-2 flex-wrap'>
      {grupos.map(g => {
        const activo = g.id === grupoActivo?.id
        const nInquilinos = Number(g.num_inquilinos ?? 0)
        const subtitulo = [g.ciudad, nInquilinos > 0 ? `${nInquilinos} ${nInquilinos === 1 ? 'inquilino' : 'inquilinos'}` : null].filter(Boolean).join(' · ')
        const direccion = formatDireccion(g)
        return (
          <button
            key={g.id}
            onClick={() => onChange(g)}
            className={`cursor-pointer! inline-flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition text-left
              ${activo
                ? 'bg-emerald-50 border-emerald-500'
                : 'bg-white border-slate-200 hover:border-slate-300'}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${activo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span className='flex flex-col leading-tight'>
              <span className={`text-[0.9rem] font-bold ${activo ? 'text-slate-900' : 'text-slate-700'}`}>{direccion}</span>
              {subtitulo && <span className='text-[0.75rem] font-normal text-slate-400 mt-0.5'>{subtitulo}</span>}
            </span>
          </button>
        )
      })}

      {/* Botón vincular / formulario inline */}
      {!abierto ? (
        <button
          onClick={abrirVincular}
          className='cursor-pointer! inline-flex items-center gap-2 text-[0.8125rem] font-semibold px-4 py-2.5 rounded-2xl border border-dashed border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-700 transition'
        >
          <Plus size={13} /> Vincular grupo con código
        </button>
      ) : (
        <form onSubmit={vincular} className='inline-flex items-center gap-2'>
          <input
            ref={inputRef}
            value={codigo}
            onChange={e => { setCodigo(e.target.value.toUpperCase()); setErrorCod(null) }}
            maxLength={6}
            placeholder='CÓDIGO'
            className='w-28 bg-white border border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl px-3 py-2 text-[0.8125rem] font-mono font-bold text-slate-800 placeholder:text-slate-400 outline-none transition uppercase tracking-widest'
          />
          <button type='submit' disabled={enviando}
            className='cursor-pointer! inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[0.8125rem] font-semibold px-3.5 py-2 rounded-xl transition disabled:opacity-50'>
            {enviando ? <div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' /> : <Check size={13} />}
          </button>
          <button type='button' onClick={() => setAbierto(false)}
            className='cursor-pointer! w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition'>
            <X size={14} />
          </button>
          {errorCod && <p className='text-xs text-red-500 font-medium'>{errorCod}</p>}
        </form>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────

function Gastos({ onLogout }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [misGrupos,  setMisGrupos]  = useState([])
  const [grupoActivo, setGrupoActivo] = useState(null)
  const [miembros,   setMiembros]   = useState([])
  const [facturas,   setFacturas]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [cargandoFacturas, setCargandoFacturas] = useState(false)

  // Carga inicial: todos los grupos del usuario
  useEffect(() => {
    apiFetch('/api/grupos/mis-grupos')
      .then(r => r.json())
      .then(data => {
        const grupos = data.grupos ?? []
        setMisGrupos(grupos)
        if (grupos.length) setGrupoActivo(grupos[0])
        else setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Cada vez que cambia el grupo activo, recarga miembros y facturas
  useEffect(() => {
    if (!grupoActivo) return
    setCargandoFacturas(true)
    Promise.all([
      apiFetch(`/api/grupos/mi-grupo?grupo_id=${grupoActivo.id}`).then(r => r.json()),
      apiFetch(`/api/facturas?grupo_id=${grupoActivo.id}`).then(r => r.json()),
    ]).then(([grupoData, facturasData]) => {
      setMiembros(grupoData.miembros ?? [])
      setFacturas(facturasData.facturas ?? [])
    }).catch(() => setFacturas([]))
     .finally(() => { setLoading(false); setCargandoFacturas(false) })
  }, [grupoActivo?.id])

  const handleCambioGrupo = (g) => {
    setGrupoActivo(g)
    setFacturas(null)
    setMiembros([])
  }

  const handleVincular = async (grupoNuevo) => {
    // Pedir los miembros del grupo recién vinculado para obtener num_inquilinos
    let nInquilinos = 0
    try {
      const r = await apiFetch(`/api/grupos/mi-grupo?grupo_id=${grupoNuevo.id}`)
      const data = await r.json()
      nInquilinos = (data.miembros ?? []).filter(m => !m.es_casero).length
    } catch { /* no crítico */ }

    const nuevoEntry = {
      id: grupoNuevo.id,
      nombre: grupoNuevo.nombre,
      ciudad: grupoNuevo.ciudad ?? null,
      foto_perfil: grupoNuevo.foto_perfil ?? null,
      rol: 'MEMBER',
      es_casero: true,
      num_inquilinos: nInquilinos,
    }
    setMisGrupos(prev => [...prev, nuevoEntry])
    handleCambioGrupo(nuevoEntry)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-200 flex items-center justify-center'>
        <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-200'>
      <Header
        user={user}
        esCasero={true}
        onLogout={onLogout}
      />
      <div className='max-w-8xl mx-auto p-4 sm:p-8 lg:p-15'>
        {cargandoFacturas || facturas === null ? (
          <div className='flex justify-center py-20'>
            <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
          </div>
        ) : (
          <VistaCasero
            facturas={facturas} setFacturas={setFacturas}
            grupo={grupoActivo} miembros={miembros}
            grupoId={grupoActivo?.id}
            selectorGrupo={
              <SelectorGrupo
                grupos={misGrupos} grupoActivo={grupoActivo}
                onChange={handleCambioGrupo} onVincular={handleVincular}
              />
            }
          />
        )
        }
      </div>
    </div>
  )
}

export default Gastos
