import { useState, useId } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { useModalAccesible } from '../lib/useModalAccesible.js'

function toLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function ModalEvento({ evento, diaInicial, onClose, onGuardado }) {
  const [form, setForm] = useState({
    titulo:       evento?.titulo ?? '',
    descripcion:  evento?.descripcion ?? '',
    fecha_inicio: evento ? toLocal(evento.fecha_inicio) : (diaInicial ?? ''),
    fecha_fin:    evento ? toLocal(evento.fecha_fin) : '',
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const refDialogo = useModalAccesible(onClose)
  const idBase   = useId()
  const idTitulo = `${idBase}-titulo`
  const campo    = (n) => `${idBase}-${n}`

  const cambiar = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const enviar = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.fecha_inicio) { setError('El título y la fecha de inicio son obligatorios'); return }
    setEnviando(true); setError(null)
    try {
      const body = {
        titulo:       form.titulo.trim(),
        descripcion:  form.descripcion.trim() || null,
        fecha_inicio: form.fecha_inicio,
        fecha_fin:    form.fecha_fin || null,
      }
      const url = evento ? `/api/grupos/eventos/${evento.id}` : '/api/grupos/eventos'
      const r = await apiFetch(url, {
        method: evento ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) { setError(data.message ?? 'Error al guardar el evento'); return }
      onGuardado(data.evento, !!evento)
      onClose()
    } catch { setError('Error de conexión') }
    finally { setEnviando(false) }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm' onClick={onClose}>
      <div ref={refDialogo} role='dialog' aria-modal='true' aria-labelledby={idTitulo} tabIndex={-1}
        className='bg-white rounded-2xl shadow-xl w-full max-w-md' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <h3 id={idTitulo} className='font-display text-base font-bold text-slate-900'>
            {evento ? 'Editar evento' : 'Nuevo evento'}
          </h3>
          <button type='button' onClick={onClose} aria-label='Cerrar'
            className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition'>
            <X size={16} aria-hidden='true' />
          </button>
        </div>
        <form onSubmit={enviar} className='p-6 flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <label htmlFor={campo('titulo')} className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>
              Título <span aria-hidden='true'>*</span><span className='sr-only'>(obligatorio)</span>
            </label>
            <input id={campo('titulo')} name='titulo' value={form.titulo} onChange={cambiar} placeholder='Ej: Reunión de piso'
              required aria-required='true'
              className='w-full border border-slate-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition' />
          </div>
          <div className='flex flex-col gap-1.5'>
            <label htmlFor={campo('descripcion')} className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Descripción</label>
            <textarea id={campo('descripcion')} name='descripcion' value={form.descripcion} onChange={cambiar} rows={2} placeholder='Descripción opcional…'
              className='w-full border border-slate-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition resize-none' />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor={campo('fecha_inicio')} className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                Inicio <span aria-hidden='true'>*</span><span className='sr-only'>(obligatorio)</span>
              </label>
              <input id={campo('fecha_inicio')} required aria-required='true' type='datetime-local' name='fecha_inicio' value={form.fecha_inicio} onChange={cambiar}
                className='w-full border border-slate-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition' />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor={campo('fecha_fin')} className='font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide'>Fin</label>
              <input id={campo('fecha_fin')} type='datetime-local' name='fecha_fin' value={form.fecha_fin} onChange={cambiar}
                className='w-full border border-slate-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition' />
            </div>
          </div>
          {error && (
            <div role='alert' className='flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5'>
              <AlertCircle size={13} aria-hidden='true' className='text-red-600 shrink-0' />
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          )}
          <div className='flex gap-2 pt-1'>
            <button type='button' onClick={onClose} className='cursor-pointer! flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition'>
              Cancelar
            </button>
            <button type='submit' disabled={enviando} className='cursor-pointer! flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition'>
              {enviando ? 'Guardando…' : evento ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalEvento
