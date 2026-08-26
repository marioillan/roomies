import { Fragment } from 'react'
import { AlertCircle, Check } from 'lucide-react'

export function IconInput({ icon: Icon, error, children }) {
  return (
    <div className='relative'>
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
        {/* Icono decorativo: la información ya la da la etiqueta del campo. */}
        <Icon size={17} aria-hidden='true' className={error ? 'text-red-400' : 'text-slate-500'} />
      </div>
      {children}
    </div>
  )
}

// Para inputs con icono (pl-11)
export const baseCls = (error) =>
  `w-full pl-11 pr-4 py-4 rounded-2xl text-base text-slate-800 bg-white border-2 outline-none transition-all
   placeholder:text-slate-500
   ${error
     ? 'border-red-500 bg-red-50/40 focus:ring-2 focus:ring-red-200'
     : 'border-slate-500 hover:border-slate-600 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
   }`

// Para inputs sin icono (px-4), p.ej. editarperfilgrupo
export const baseClsPlain = (error) =>
  `w-full px-4 py-4 rounded-2xl text-base text-slate-800 bg-white border-2 outline-none transition-all
   placeholder:text-slate-500
   ${error
     ? 'border-red-500 bg-red-50/40 focus:ring-2 focus:ring-red-200'
     : 'border-slate-500 hover:border-slate-600 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
   }`

export const textareaCls = (error) =>
  `w-full px-4 py-4 rounded-2xl text-base text-slate-800 bg-white border-2 outline-none transition-all resize-none
   placeholder:text-slate-500
   ${error
     ? 'border-red-500 bg-red-50/40 focus:ring-2 focus:ring-red-200'
     : 'border-slate-500 hover:border-slate-600 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
   }`

// 3.3.2 Etiquetas o instrucciones — `htmlFor` asocia la etiqueta con el input
// (id coincidente) para que los lectores de pantalla la anuncien al enfocarlo.
// El asterisco de campo obligatorio se refuerza con texto para no depender solo
// del color ni de un símbolo sin significado (1.4.1).
export function Label({ children, required, htmlFor, id }) {
  return (
    <label htmlFor={htmlFor} id={id} className='block text-sm font-semibold text-slate-700 mb-2'>
      {children}
      {required && (
        <span className='text-red-500 ml-0.5' aria-hidden='true'>*</span>
      )}
      {required && <span className='sr-only'> (obligatorio)</span>}
    </label>
  )
}

// 3.3.1 Identificación de errores — `role="alert"` anuncia el error en cuanto
// aparece; el `id` permite enlazarlo desde el input con `aria-describedby`.
export function FieldError({ message, id }) {
  if (!message) return null
  return (
    <p id={id} role='alert' className='flex items-center gap-1 text-red-600 text-[11px] mt-1.5 font-medium'>
      <AlertCircle size={10} aria-hidden='true' /> {message}
    </p>
  )
}

export const SECTION_DOT = {
  emerald: 'bg-emerald-400',
  blue:    'bg-blue-400',
  violet:  'bg-violet-400',
}

export function Section({ title, children, accent = '' }) {
  return (
    <div className='flex flex-col gap-4'>
      {title && (
        <div className='flex items-center gap-2 pb-2.5 border-b border-slate-100'>
          {accent && <div className={`w-1 h-3.5 rounded-full shrink-0 ${SECTION_DOT[accent] ?? 'bg-slate-300'}`} />}
          <p className='font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest'>{title}</p>
        </div>
      )}
      {children}
    </div>
  )
}

// 4.1.2 Nombre, función, valor — los "pills" son botones de alternancia, así que
// se agrupan en un `role="group"` con nombre accesible y cada botón expone su
// estado con `aria-pressed`. Sin esto, un lector de pantalla los lee como
// botones sueltos y no puede saber cuál está seleccionado.
export function PillGroup({ options, value, onChange, accent = 'emerald', etiqueta }) {
  const on  = accent === 'blue'   ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-200'
            : accent === 'violet' ? 'bg-violet-500 text-white border-violet-500 shadow-sm shadow-violet-200'
            : 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
  const off = accent === 'blue'   ? 'hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
            : accent === 'violet' ? 'hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50'
            : 'hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50'
  return (
    <div className='flex flex-wrap gap-2' role='group' aria-label={etiqueta}>
      {options.map(opt => (
        <button key={String(opt.value)} type='button'
          aria-pressed={value === opt.value}
          onClick={() => onChange(value === opt.value ? '' : opt.value)}
          className={`cursor-pointer! px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
            value === opt.value ? on : `bg-white text-slate-600 border-slate-200 ${off}`
          }`}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function BoolPillGroup({ value, onChange, etiqueta }) {
  return (
    <div className='flex gap-2' role='group' aria-label={etiqueta}>
      {[{ v: true, l: 'Sí' }, { v: false, l: 'No' }].map(({ v, l }) => (
        <button key={l} type='button'
          aria-pressed={value === v}
          onClick={() => onChange(value === v ? null : v)}
          className={`cursor-pointer! flex-1 py-3.5 rounded-2xl border-2 text-sm font-semibold transition-all ${
            value === v
              ? v
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                : 'bg-slate-700 text-white border-slate-700'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}>{l}</button>
      ))}
    </div>
  )
}

// StepBar recibe steps y stepMeta como props para ser reutilizable
// en formularios con distinto número de pasos y metadatos.
export function StepBar({ current, steps, stepMeta }) {
  return (
    <div>
      {/* 4.1.3 El progreso del formulario se anuncia como texto; los iconos y la
          barra de abajo son decoración visual del mismo dato. */}
      <p className='sr-only' role='status'>
        Paso {current + 1} de {steps.length}: {steps[current]}
      </p>
      <div className='flex items-start' aria-hidden='true'>
        {steps.map((label, i) => {
          const done   = i < current
          const active = i === current
          const meta   = stepMeta[i]
          const Icon   = meta.icon
          return (
            <Fragment key={i}>
              <div className='flex flex-col items-center gap-2 shrink-0'>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  done
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                    : active
                    ? `${meta.iconBg} ${meta.color} ring-4 ${meta.ring} shadow-sm`
                    : 'bg-white border-2 border-slate-200 text-slate-500'
                }`}>
                  {done ? <Check aria-hidden='true' size={16} /> : <Icon aria-hidden='true' size={17} />}
                </div>
                <span className={`text-[10px] font-semibold text-center whitespace-nowrap leading-tight ${
                  active ? 'text-slate-800' : done ? 'text-emerald-600' : 'text-slate-500'
                }`}>{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 min-w-0 h-0.5 mx-2.5 mt-5 rounded-full transition-colors duration-300 ${
                  done ? 'bg-emerald-300' : 'bg-slate-200'
                }`} />
              )}
            </Fragment>
          )
        })}
      </div>
      <div className='mt-4 h-1 bg-slate-100 rounded-full overflow-hidden' aria-hidden='true'>
        <div
          className='h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-[width] duration-500 ease-out'
          style={{ width: `${((current + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
