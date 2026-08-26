import { Check, X, AlertCircle } from 'lucide-react'
import { useModalAccesible } from '../lib/useModalAccesible.js'

/**
 * Modal de confirmación con recuadro de aviso ámbar.
 *
 * Estructura: cabecera con título y X de cerrar, línea separadora, recuadro
 * ámbar con el aviso, párrafo de llamada a la acción, y botones de cancelar
 * (texto plano) y confirmar (verde con icono de check).
 *
 * Se usa en la rotación de tareas (`Tareas.jsx`) y en el aviso de perfil de
 * convivencia incompleto (`PublicacionFormulario.jsx`).
 */
export default function ModalConfirmarAccion({
  titulo,
  aviso,
  pregunta,
  error,
  cargando = false,
  textoCancelar = 'Cancelar',
  textoConfirmar,
  onConfirmar,
  onCancelar,
}) {
  const refDialogo = useModalAccesible(onCancelar)
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm' onClick={onCancelar}>
      <div ref={refDialogo} role='dialog' aria-modal='true' tabIndex={-1} aria-label={titulo} className='bg-white rounded-2xl shadow-xl w-full max-w-sm' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <h3 className='font-display text-base font-bold text-slate-900'>{titulo}</h3>
          <button aria-label='Cerrar' onClick={onCancelar} className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition'>
            <X aria-hidden='true' size={16} />
          </button>
        </div>
        <div className='px-6 py-5 flex flex-col gap-4'>
          <div className='flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3'>
            <AlertCircle aria-hidden='true' size={16} className='text-amber-500 shrink-0 mt-0.5' />
            <p className='text-sm text-amber-700 leading-relaxed'>{aviso}</p>
          </div>
          <p className='text-sm text-slate-500 leading-relaxed'>{pregunta}</p>
          {error && <p className='text-sm text-red-600'>{error}</p>}
          <div className='flex gap-2 justify-end'>
            <button type='button' onClick={onCancelar} className='cursor-pointer! px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition'>
              {textoCancelar}
            </button>
            <button
              type='button'
              onClick={onConfirmar}
              disabled={cargando}
              className='cursor-pointer! inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50'
            >
              {cargando
                ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                : <Check aria-hidden='true' size={14} />}
              {textoConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
