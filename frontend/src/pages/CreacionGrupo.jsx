import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  ArrowLeft, House, Copy, Check, Users, AlertCircle,
  PenLine, CalendarDays,
} from 'lucide-react'
import { crearGrupoSchema } from '../lib/schemas'

const DIAS = [
  { value: 'LUNES',     label: 'Lunes' },
  { value: 'MARTES',    label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES',    label: 'Jueves' },
  { value: 'VIERNES',   label: 'Viernes' },
  { value: 'SABADO',    label: 'Sábado' },
  { value: 'DOMINGO',   label: 'Domingo' },
]

// ── Primitivos compartidos con PublicacionFormulario ──────────────

function IconInput({ icon: Icon, error, children }) {
  return (
    <div className='relative'>
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5'>
        <Icon size={15} className={error ? 'text-red-400' : 'text-slate-400'} />
      </div>
      {children}
    </div>
  )
}

const baseCls = (error) =>
  `w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-800 bg-slate-50 border outline-none transition-all
   placeholder:text-slate-400
   focus:bg-white focus:shadow-sm
   ${error
     ? 'border-red-300 focus:ring-2 focus:ring-red-200'
     : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
   }`

function Label({ children, required }) {
  return (
    <label className='block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5'>
      {children}{required && <span className='text-red-400 ml-0.5'>*</span>}
    </label>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className='flex items-center gap-1 text-red-500 text-[11px] mt-1.5'>
      <AlertCircle size={10} /> {message}
    </p>
  )
}

function Section({ title, children }) {
  return (
    <div className='flex flex-col gap-4'>
      {title && (
        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100'>
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────
function CreacionGrupo() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [grupoCreado, setGrupoCreado] = useState(null)
  const [copiado, setCopiado]         = useState(false)
  const [checking, setChecking]       = useState(true)

  useEffect(() => {
    fetch('http://localhost:3000/api/grupos/mi-grupo', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.grupo) navigate('/grupo', { replace: true }) })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(crearGrupoSchema),
    defaultValues: { nombre: '', dia_limpieza: '' },
  })

  const onSubmit = async (data) => {
    setServerError('')
    try {
      const res = await fetch('http://localhost:3000/api/grupos/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre: data.nombre, dia_limpieza: data.dia_limpieza || null }),
      })
      const json = await res.json()
      if (!res.ok) return setServerError(json.message)
      if (setUser) setUser(prev => prev ? { ...prev } : prev)
      setGrupoCreado(json.grupo)
    } catch {
      setServerError('Error de conexión con el servidor')
    }
  }

  const copiarCodigo = () => {
    navigator.clipboard.writeText(grupoCreado.codigo_acceso)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  // ── Estado de éxito ───────────────────────────────────────────
  if (grupoCreado) {
    return (
      <div className='min-h-screen bg-slate-50'>
        <div className='sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3.5 flex items-center gap-4'>
          <div className='h-4 w-px bg-slate-200' />
          <p className='text-sm font-semibold text-slate-700'>Grupo creado</p>
        </div>

        <div className='max-w-lg mx-auto px-6 py-10'>
          <div className='bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden'>
            <div className='bg-emerald-50 px-6 py-5 border-b border-slate-100 flex items-center gap-4'>
              <div className='w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0'>
                <House size={20} className='text-emerald-600' />
              </div>
              <div>
                <h2 className='text-base font-bold text-slate-900'>¡Grupo creado!</h2>
                <p className='text-xs text-slate-500 mt-0.5'>Comparte el código con tus compañeros para que se unan.</p>
              </div>
            </div>

            <div className='p-6 flex flex-col gap-6 text-center'>
              <div className='bg-slate-50 border border-slate-200 rounded-xl px-6 py-5'>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3'>Código de acceso</p>
                <p className='text-4xl font-bold tracking-[0.3em] text-slate-900 mb-4'>{grupoCreado.codigo_acceso}</p>
                <button onClick={copiarCodigo}
                  className='cursor-pointer! inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition'>
                  {copiado ? <Check size={15} className='text-emerald-500' /> : <Copy size={15} />}
                  {copiado ? 'Copiado' : 'Copiar código'}
                </button>
              </div>

              <div className='flex flex-col gap-2'>
                <button onClick={() => navigate('/grupo')}
                  className='cursor-pointer! w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm shadow-emerald-200'>
                  <Users size={16} /> Ir al dashboard del grupo
                </button>
                <button onClick={() => navigate('/')}
                  className='cursor-pointer! w-full text-slate-400 hover:text-slate-700 font-medium px-6 py-2.5 rounded-xl transition text-sm'>
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (checking) return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
      <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
    </div>
  )

  // ── Formulario ────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Cabecera */}
      <div className='sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3.5 flex items-center gap-4'>
        <button type='button' onClick={() => navigate('/')}
          className='cursor-pointer! flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 font-medium transition'>
          <ArrowLeft size={15} /> Volver
        </button>
        <div className='h-4 w-px bg-slate-200' />
        <p className='text-sm font-semibold text-slate-700'>Crear grupo</p>
      </div>

      <div className='max-w-lg mx-auto px-6 py-10'>
        <div className='bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden'>

          {/* Banner del formulario */}
          <div className='bg-emerald-50 px-6 py-5 border-b border-slate-100 flex items-center gap-4'>
            <div className='w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0'>
              <House size={20} className='text-emerald-600' />
            </div>
            <div>
              <h2 className='text-base font-bold text-slate-900'>Configura tu grupo</h2>
              <p className='text-xs text-slate-500 mt-0.5'>Nombre del piso compartido y preferencias iniciales.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='p-6 flex flex-col gap-6'>
            <Section title='Información del grupo'>
              <div>
                <Label required>Nombre del grupo</Label>
                <IconInput icon={PenLine} error={errors.nombre}>
                  <input {...register('nombre')} className={baseCls(errors.nombre)}
                    placeholder='Piso de la Calle Mayor' />
                </IconInput>
                <FieldError message={errors.nombre?.message} />
              </div>
            </Section>

            <Section title='Preferencias'>
              <div>
                <Label>Día de limpieza semanal</Label>
                <Controller name='dia_limpieza' control={control} render={({ field }) => (
                  <div className='flex flex-wrap gap-2'>
                    {DIAS.map(({ value, label }) => (
                      <button key={value} type='button'
                        onClick={() => field.onChange(field.value === value ? '' : value)}
                        className={`cursor-pointer! px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                          field.value === value
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                )} />
                <p className='text-[11px] text-slate-400 mt-1.5'>Opcional — lo puedes cambiar después.</p>
              </div>
            </Section>

            {serverError && (
              <div className='flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
                <AlertCircle size={13} className='text-red-500 shrink-0' />
                <p className='text-xs text-red-700'>{serverError}</p>
              </div>
            )}

            <div className='pt-2 border-t border-slate-100'>
              <button type='submit' disabled={isSubmitting}
                className='cursor-pointer! w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition shadow-sm shadow-emerald-200'>
                {isSubmitting ? 'Creando grupo...' : 'Crear grupo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreacionGrupo
