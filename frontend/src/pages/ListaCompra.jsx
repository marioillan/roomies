import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  ShoppingCart, Plus, Trash2, Check, Package,
  ChevronDown, ChevronUp, AlertCircle, Loader2, Pencil, X,
} from 'lucide-react'

// ── Constantes ────────────────────────────────────────────────────

const CATEGORIAS = [
  { value: 'comida',   label: 'Comida',   color: '#f59e0b' },
  { value: 'hogar',    label: 'Hogar',    color: '#3b82f6' },
  { value: 'limpieza', label: 'Limpieza', color: '#10b981' },
  { value: 'otros',    label: 'Otros',    color: '#8b5cf6' },
]

function colorCategoria(cat) {
  return CATEGORIAS.find(c => c.value === cat)?.color ?? '#94a3b8'
}

function labelCategoria(cat) {
  return CATEGORIAS.find(c => c.value === cat)?.label ?? 'Otros'
}

// ── Helpers ───────────────────────────────────────────────────────

function etiquetaCantidad(cantidad, unidad) {
  if (!unidad) return `×${Number(cantidad)}`
  return `${Number(cantidad)} ${unidad}`
}

// ── Componente fila de producto ───────────────────────────────────

function FilaProducto({ producto, onToggle, onEditar, onEliminar }) {
  const [cargando, setCargando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [nombre, setNombre] = useState(producto.nombre)
  const [cantidad, setCantidad] = useState(String(producto.cantidad ?? ''))
  const [unidad, setUnidad] = useState(producto.unidad_medida ?? '')
  const [categoria, setCategoria] = useState(producto.categoria ?? 'otros')
  const inputRef = useRef(null)

  const abrirEdicion = () => {
    setNombre(producto.nombre)
    setCantidad(String(producto.cantidad ?? ''))
    setUnidad(producto.unidad_medida ?? '')
    setEditando(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const cancelarEdicion = () => setEditando(false)

  const handleToggle = async () => {
    setCargando(true)
    await onToggle(producto.id)
    setCargando(false)
  }

  const handleEliminar = async () => {
    setEliminando(true)
    await onEliminar(producto.id)
    setEliminando(false)
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    const nombreTrim = nombre.trim()
    if (!nombreTrim) return
    setGuardando(true)
    const body = { nombre: nombreTrim, categoria }
    if (cantidad && !isNaN(Number(cantidad))) body.cantidad = Number(cantidad)
    if (unidad) body.unidad_medida = unidad
    else body.unidad_medida = null
    const ok = await onEditar(producto.id, body)
    if (ok) setEditando(false)
    setGuardando(false)
  }

  if (editando) {
    return (
      <form
        onSubmit={handleGuardar}
        className='flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-emerald-200 shadow-sm'
      >
        <div className='w-5 h-5 rounded-md border-2 border-dashed border-slate-300 shrink-0' />
        <input
          ref={inputRef}
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className='flex-1 min-w-0 text-sm text-slate-800 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition'
        />
        <input
          type='number'
          min='0.1'
          step='any'
          value={cantidad}
          onChange={e => setCantidad(e.target.value)}
          className='w-16 text-sm text-slate-800 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition'
          placeholder='1'
        />
        <select
          value={unidad}
          onChange={e => setUnidad(e.target.value)}
          className='w-16 text-sm text-slate-800 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition bg-white'
        >
          <option value=''>—</option>
          <option value='kg'>kg</option>
          <option value='L'>L</option>
          <option value='uds'>uds</option>
        </select>
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className='w-24 text-sm text-slate-800 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition bg-white'
        >
          {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button
          type='submit'
          disabled={guardando || !nombre.trim()}
          className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white transition shrink-0'
          title='Guardar'
        >
          {guardando ? <Loader2 size={13} className='animate-spin' /> : <Check size={13} strokeWidth={3} />}
        </button>
        <button
          type='button'
          onClick={cancelarEdicion}
          className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0'
          title='Cancelar'
        >
          <X size={13} />
        </button>
      </form>
    )
  }

  return (
    <div className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      producto.comprado
        ? 'bg-slate-50 hover:bg-slate-100'
        : 'bg-white border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md'
    }`}>
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={cargando}
        className={`cursor-pointer! shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
          producto.comprado
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-300 hover:border-emerald-400'
        } ${cargando ? 'opacity-50' : ''}`}
      >
        {cargando
          ? <Loader2 size={11} className='animate-spin' />
          : producto.comprado ? <Check size={11} strokeWidth={3} /> : null}
      </button>

      {/* Nombre + metadatos */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-1.5'>
          <span
            className='w-2 h-2 rounded-full shrink-0'
            style={{ backgroundColor: colorCategoria(producto.categoria) }}
          />
          <span className={`text-sm font-medium leading-tight ${
            producto.comprado ? 'line-through text-slate-400' : 'text-slate-800'
          }`}>
            {producto.nombre}
          </span>
        </div>
        <div className='flex items-center gap-2 mt-0.5 pl-3.5'>
          <span className='text-[11px] text-slate-400 font-mono'>
            {etiquetaCantidad(producto.cantidad, producto.unidad_medida)}
          </span>
          <span className='text-[11px] text-slate-300'>·</span>
          <span className='text-[11px] text-slate-400'>
            {producto.comprado
              ? `Comprado por ${producto.comprado_por ?? 'alguien'}`
              : `Añadido por ${producto.anadido_por}`}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition'>
        <button
          onClick={abrirEdicion}
          className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition'
          title='Editar'
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={handleEliminar}
          disabled={eliminando}
          className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition'
          title='Eliminar'
        >
          {eliminando
            ? <Loader2 size={13} className='animate-spin text-slate-400' />
            : <Trash2 size={13} />}
        </button>
      </div>
    </div>
  )
}

// ── Formulario añadir ─────────────────────────────────────────────

function FormularioAnadir({ onAnadir }) {
  const [nombre, setNombre] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [unidad, setUnidad] = useState('')
  const [categoria, setCategoria] = useState('otros')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [expandido, setExpandido] = useState(false)
  const inputRef = useRef(null)

  const enviar = async (e) => {
    e.preventDefault()
    const nombreTrim = nombre.trim()
    if (!nombreTrim) return
    setEnviando(true)
    setError(null)
    const body = { nombre: nombreTrim, categoria }
    if (cantidad && !isNaN(Number(cantidad))) body.cantidad = Number(cantidad)
    if (unidad.trim()) body.unidad_medida = unidad.trim()
    const ok = await onAnadir(body)
    if (ok) {
      setNombre('')
      setCantidad('')
      setUnidad('')
      setCategoria('otros')
      setExpandido(false)
      inputRef.current?.focus()
    } else {
      setError('No se pudo añadir el producto')
    }
    setEnviando(false)
  }

  return (
    <form onSubmit={enviar} className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
      {/* Fila principal */}
      <div className='flex items-center gap-3 px-4 py-3'>
        <div className='w-5 h-5 rounded-md border-2 border-dashed border-slate-300 shrink-0' />
        <input
          ref={inputRef}
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder='Añadir producto...'
          className='flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent'
        />
        <button
          type='button'
          onClick={() => setExpandido(v => !v)}
          title='Más opciones'
          className='cursor-pointer! text-slate-300 hover:text-slate-500 transition'
        >
          {expandido ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        <button
          type='submit'
          disabled={enviando || !nombre.trim()}
          className='cursor-pointer! shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white transition'
        >
          {enviando ? <Loader2 size={14} className='animate-spin' /> : <Plus size={14} />}
        </button>
      </div>

      {/* Opciones extra */}
      {expandido && (
        <div className='px-4 pb-4 flex gap-3 border-t border-slate-50 pt-3'>
          <div className='flex flex-col gap-1 flex-1'>
            <label className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>Cantidad</label>
            <input
              type='number'
              min='0.1'
              step='any'
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              placeholder='1'
              className='border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition'
            />
          </div>
          <div className='flex flex-col gap-1 flex-1'>
            <label className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>Unidad</label>
            <select
              value={unidad}
              onChange={e => setUnidad(e.target.value)}
              className='border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition bg-white'
            >
              <option value=''>—</option>
              <option value='kg'>kg</option>
              <option value='L'>L</option>
              <option value='uds'>uds</option>
            </select>
          </div>
          <div className='flex flex-col gap-1 flex-1'>
            <label className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>Categoría</label>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className='border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition bg-white'
            >
              {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {error && (
        <p className='px-4 pb-3 text-xs text-red-500 flex items-center gap-1.5'>
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </form>
  )
}

// ── Página principal ──────────────────────────────────────────────

function ListaCompra() {
  const { miembros, user } = useOutletContext()
  const [productos, setProductos] = useState(null)
  const [error,     setError]     = useState(null)
  const [filtro,    setFiltro]    = useState('pendientes')

  useEffect(() => {
    fetch('http://localhost:3000/api/compra', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setProductos(d.productos ?? []))
      .catch(() => { setProductos([]); setError('No se pudieron cargar los productos') })
  }, [])

  const pendientes = (productos ?? []).filter(p => !p.comprado)
  const comprados  = (productos ?? []).filter(p =>  p.comprado)

  const productosFiltrados =
    filtro === 'pendientes' ? pendientes :
    filtro === 'comprados'  ? comprados  :
    (productos ?? [])

  const handleAnadir = async (body) => {
    try {
      const r = await fetch('http://localhost:3000/api/compra', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) return false
      setProductos(prev => [data.producto, ...(prev ?? [])])
      return true
    } catch { return false }
  }

  const handleToggle = async (id) => {
    try {
      const r = await fetch(`http://localhost:3000/api/compra/${id}/comprado`, { method: 'PATCH', credentials: 'include' })
      const data = await r.json()
      if (!r.ok) return
      setProductos(prev => {
        const actualizado = (prev ?? []).map(p => p.id === id ? data.producto : p)
        return [...actualizado.filter(p => !p.comprado), ...actualizado.filter(p => p.comprado)]
      })
    } catch {}
  }

  const handleEditar = async (id, body) => {
    try {
      const r = await fetch(`http://localhost:3000/api/compra/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) return false
      setProductos(prev => (prev ?? []).map(p => p.id === id ? data.producto : p))
      return true
    } catch { return false }
  }

  const handleEliminar = async (id) => {
    try {
      const r = await fetch(`http://localhost:3000/api/compra/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!r.ok) return
      setProductos(prev => (prev ?? []).filter(p => p.id !== id))
    } catch {}
  }

  return (
    <div className='flex flex-col gap-6 pb-8'>

      {/* Cabecera */}
      <div className='flex items-end justify-between'>
        <h1 className='font-display text-5xl font-bold text-slate-900'>Lista de la compra</h1>
        {pendientes.length > 0 && (
          <div className='bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 text-right'>
            <p className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-amber-500'>Pendientes</p>
            <p className='font-display text-[1.5rem] font-bold text-amber-700 leading-none mt-0.5'>{pendientes.length}</p>
          </div>
        )}
      </div>

      {error && (
        <div className='flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-2xl'>
          <AlertCircle size={15} className='shrink-0' /> {error}
        </div>
      )}

      {/* Tarjeta principal */}
      <div className='bg-white border border-slate-100 rounded-3xl' style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}>

        {/* Header: label + filtros */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <h3 className='font-display text-base font-bold text-slate-900'>Productos</h3>
          <div className='flex gap-1'>
            {[['pendientes','Pendientes'],['comprados','Comprados'],['todos','Todos']].map(([val, lbl]) => (
              <button key={val} onClick={() => setFiltro(val)}
                className={`cursor-pointer! text-xs font-semibold px-3.5 py-1.5 rounded-full transition
                  ${filtro === val ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Formulario añadir */}
        <div className='px-6 py-4 border-b border-slate-50'>
          <FormularioAnadir onAnadir={handleAnadir} />
        </div>

        {/* Lista */}
        {productos === null ? (
          <div className='flex justify-center py-12'>
            <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className='px-6 py-12 flex flex-col items-center gap-3 text-center'>
            <div className='w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center'>
              {filtro === 'comprados'
                ? <Check size={18} className='text-emerald-400' />
                : <Package size={18} className='text-slate-400' />}
            </div>
            <p className='text-sm font-semibold text-slate-600'>
              {filtro === 'pendientes' ? 'Sin productos pendientes'
                : filtro === 'comprados' ? 'Nada comprado aún'
                : 'Sin productos todavía'}
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-2 px-6 py-4'>
            {productosFiltrados.map(p => (
              <FilaProducto
                key={p.id}
                producto={p}
                onToggle={handleToggle}
                onEditar={handleEditar}
                onEliminar={handleEliminar}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default ListaCompra
