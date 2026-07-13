import { Fragment } from 'react'
import { AlertCircle, Check } from 'lucide-react'

export function IconInput({ icon: Icon, error, children }) {
  return (
    <div className='relative'>
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
        <Icon size={17} className={error ? 'text-red-400' : 'text-slate-400'} />
      </div>
      {children}
    </div>
  )
}

// Para inputs con icono (pl-11)
export const baseCls = (error) =>
  `w-full pl-11 pr-4 py-4 rounded-2xl text-base text-slate-800 bg-white border-2 outline-none transition-all
   placeholder:text-slate-300
   ${error
     ? 'border-red-300 bg-red-50/40 focus:ring-2 focus:ring-red-200'
     : 'border-slate-300 hover:border-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
   }`

// Para inputs sin icono (px-4), p.ej. editarperfilgrupo
export const baseClsPlain = (error) =>
  `w-full px-4 py-4 rounded-2xl text-base text-slate-800 bg-white border-2 outline-none transition-all
   placeholder:text-slate-300
   ${error
     ? 'border-red-300 bg-red-50/40 focus:ring-2 focus:ring-red-200'
     : 'border-slate-300 hover:border-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
   }`

export const textareaCls = (error) =>
  `w-full px-4 py-4 rounded-2xl text-base text-slate-800 bg-white border-2 outline-none transition-all resize-none
   placeholder:text-slate-300
   ${error
     ? 'border-red-300 bg-red-50/40 focus:ring-2 focus:ring-red-200'
     : 'border-slate-300 hover:border-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
   }`

export function Label({ children, required }) {
  return (
    <label className='block text-sm font-semibold text-slate-700 mb-2'>
      {children}{required && <span className='text-red-400 ml-0.5'>*</span>}
    </label>
  )
}

export function FieldError({ message }) {
  if (!message) return null
  return (
    <p className='flex items-center gap-1 text-red-500 text-[11px] mt-1.5 font-medium'>
      <AlertCircle size={10} /> {message}
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

export function PillGroup({ options, value, onChange, accent = 'emerald' }) {
  const on  = accent === 'blue'   ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-200'
            : accent === 'violet' ? 'bg-violet-500 text-white border-violet-500 shadow-sm shadow-violet-200'
            : 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
  const off = accent === 'blue'   ? 'hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
            : accent === 'violet' ? 'hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50'
            : 'hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50'
  return (
    <div className='flex flex-wrap gap-2'>
      {options.map(opt => (
        <button key={String(opt.value)} type='button'
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

export function BoolPillGroup({ value, onChange }) {
  return (
    <div className='flex gap-2'>
      {[{ v: true, l: 'Sí' }, { v: false, l: 'No' }].map(({ v, l }) => (
        <button key={l} type='button'
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
      <div className='flex items-start'>
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
                    : 'bg-white border-2 border-slate-200 text-slate-300'
                }`}>
                  {done ? <Check size={16} /> : <Icon size={17} />}
                </div>
                <span className={`text-[10px] font-semibold text-center whitespace-nowrap leading-tight ${
                  active ? 'text-slate-800' : done ? 'text-emerald-600' : 'text-slate-400'
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
      <div className='mt-4 h-1 bg-slate-100 rounded-full overflow-hidden'>
        <div
          className='h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-[width] duration-500 ease-out'
          style={{ width: `${((current + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
