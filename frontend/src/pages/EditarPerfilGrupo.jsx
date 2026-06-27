import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useState, useRef, useEffect } from 'react'
import { z } from 'zod'
import {
  ArrowLeft, Camera, Users, Home,
  AlertCircle, Check, ChevronLeft, ChevronRight,
} from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import {
  baseClsPlain as baseCls, textareaCls,
  Label, FieldError, Section, PillGroup, BoolPillGroup, StepBar,
} from '../components/FormPrimitivos'

// ── Schema ────────────────────────────────────────────────────────
const schema = z.object({
  nombre:             z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  descripcion:        z.string().min(1, 'La descripción es obligatoria').max(500, 'Máximo 500 caracteres'),
  ciudad:             z.string().max(100).optional(),
  dia_limpieza:       z.string().optional(),
  buscar_companero:   z.boolean().nullish(),
  // convivencia
  horario:            z.string().optional(),
  ambiente:           z.string().optional(),
  frecuencia_visitas: z.string().optional(),
  tolerancia_fiestas: z.string().optional(),
  frecuencia_salidas: z.string().optional(),
  ocupacion:          z.string().optional(),
  acepta_fumadores:   z.string().optional(),
  acepta_mascotas:    z.string().optional(),
  lgbtq_friendly:     z.boolean().nullish(),
})

const DIAS_SEMANA = [
  { value: 'LUNES',    label: 'Lunes'    },
  { value: 'MARTES',   label: 'Martes'   },
  { value: 'MIERCOLES',label: 'Miércoles'},
  { value: 'JUEVES',   label: 'Jueves'   },
  { value: 'VIERNES',  label: 'Viernes'  },
  { value: 'SABADO',   label: 'Sábado'   },
  { value: 'DOMINGO',  label: 'Domingo'  },
]

const CONV_FIELDS = ['horario','ambiente','frecuencia_visitas','tolerancia_fiestas','frecuencia_salidas','ocupacion','acepta_fumadores','acepta_mascotas','lgbtq_friendly']

// ── Steps ─────────────────────────────────────────────────────────
const STEPS = ['Datos del grupo', 'Convivencia']
const STEP_FIELDS = [['nombre', 'descripcion'], []]
const STEP_META = [
  {
    icon: Users,
    color: 'text-emerald-600', iconBg: 'bg-emerald-100',
    ring: 'ring-emerald-200',
    borderLeft: 'border-l-emerald-400',
    hint: 'Nombre, ciudad, descripción e intereses del grupo.',
  },
  {
    icon: Home,
    color: 'text-blue-600', iconBg: 'bg-blue-100',
    ring: 'ring-blue-200',
    borderLeft: 'border-l-blue-400',
    hint: 'Normas y estilo de vida en el piso.',
  },
]

// ── Paso 1: Datos del grupo ───────────────────────────────────────
function Paso1({ register, control, errors, watch, fotoPreview, fotoLoading, fotoError, onFotoClick, todosIntereses, interesesSeleccionados, onToggleInteres }) {
  const descLength = (watch('descripcion') ?? '').length
  return (
    <div className='flex flex-col gap-6'>

      {/* Foto */}
      <div className='flex flex-col items-center gap-2 py-2'>
        <button type='button' onClick={onFotoClick} disabled={fotoLoading}
          className='cursor-pointer! relative group'>
          {fotoPreview
            ? <img src={fotoPreview} alt='Grupo' className='w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-lg' />
            : <div className='w-24 h-24 rounded-2xl bg-emerald-100 flex items-center justify-center ring-4 ring-white shadow-lg'>
                <Users size={32} className='text-emerald-600' />
              </div>
          }
          <div className='absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition'>
            <Camera size={22} className='text-white' />
          </div>
          {fotoLoading && (
            <div className='absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center'>
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
            </div>
          )}
        </button>
        <p className='text-xs text-slate-400'>Haz clic para cambiar la foto</p>
        {fotoError && <p className='text-red-500 text-[11px]'>{fotoError}</p>}
      </div>

      <Section title='Información básica' accent='emerald'>
        <div>
          <Label required>Nombre del grupo</Label>
          <input {...register('nombre')} className={baseCls(errors.nombre)} placeholder='Casa Lavanda...' />
          <FieldError message={errors.nombre?.message} />
        </div>

        <div>
          <Label>Ciudad</Label>
          <input {...register('ciudad')} className={baseCls(false)} placeholder='Madrid, Barcelona...' />
        </div>

        <div>
          <Label required>Descripción</Label>
          <textarea {...register('descripcion')} rows={4} maxLength={500}
            placeholder='Cuéntanos cómo es la vida en vuestro piso...'
            className={textareaCls(errors.descripcion)} />
          <div className='flex justify-between mt-1'>
            <FieldError message={errors.descripcion?.message} />
            <p className={`font-mono text-[11px] ml-auto ${descLength >= 500 ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
              {descLength}/500
            </p>
          </div>
        </div>
      </Section>

      <Section title='Preferencias' accent='emerald'>
        <div>
          <Label>Día de limpieza semanal</Label>
          <Controller name='dia_limpieza' control={control} render={({ field }) => (
            <CustomSelect
              options={DIAS_SEMANA}
              placeholder='Selecciona un día (opcional)'
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )} />
        </div>

        <div>
          <Label>¿Buscáis compañero de piso?</Label>
          <Controller name='buscar_companero' control={control} render={({ field }) => (
            <BoolPillGroup value={field.value} onChange={field.onChange} />
          )} />
        </div>
      </Section>

      {Object.keys(todosIntereses).length > 0 && (
        <Section title='Intereses del grupo' accent='emerald'>
          <p className='text-xs text-slate-400 -mt-1'>Selecciona los que mejor describan a vuestro grupo (máx. 20).</p>
          <div className='flex flex-col gap-4'>
            {Object.entries(todosIntereses).map(([categoria, lista]) => (
              <div key={categoria}>
                <p className='font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2'>{categoria}</p>
                <div className='flex flex-wrap gap-2'>
                  {lista.map(({ id, nombre }) => {
                    const sel = interesesSeleccionados.has(id)
                    return (
                      <button key={id} type='button' onClick={() => onToggleInteres(id)}
                        className={`cursor-pointer! px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                          sel
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}>
                        {nombre}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Paso 2: Convivencia del grupo ─────────────────────────────────
function Paso2({ control }) {
  return (
    <div className='flex flex-col gap-6'>
      <p className='text-sm text-slate-500 leading-relaxed'>
        Define el estilo de vida del piso para encontrar compañeros compatibles.
      </p>

      <Section title='Ritmo y ambiente' accent='blue'>
        <div>
          <Label>Horario general del piso</Label>
          <Controller name='horario' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'MADRUGADOR', label: 'Madrugador' },
                { value: 'INTERMEDIO', label: 'Intermedio' },
                { value: 'NOCTURNO',   label: 'Nocturno'   },
              ]}
            />
          )} />
        </div>

        <div>
          <Label>Ambiente en casa</Label>
          <Controller name='ambiente' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'TRANQUILO',   label: 'Tranquilo'   },
                { value: 'EQUILIBRADO', label: 'Equilibrado' },
                { value: 'SOCIAL',      label: 'Social'      },
              ]}
            />
          )} />
        </div>

        <div>
          <Label>Ocupación predominante</Label>
          <Controller name='ocupacion' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'ESTUDIO',           label: 'Estudio'          },
                { value: 'TRABAJO',           label: 'Trabajo'          },
                { value: 'ESTUDIO_Y_TRABAJO', label: 'Estudio y trabajo'},
              ]}
            />
          )} />
        </div>
      </Section>

      <Section title='Ocio y visitas' accent='blue'>
        <div>
          <Label>Visitas en casa</Label>
          <Controller name='frecuencia_visitas' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'CASI_NUNCA', label: 'Casi nunca' },
                { value: 'A_VECES',   label: 'A veces'    },
                { value: 'FRECUENTE', label: 'Frecuente'  },
              ]}
            />
          )} />
        </div>

        <div>
          <Label>Fiestas en casa</Label>
          <Controller name='tolerancia_fiestas' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'NUNCA',     label: 'Nunca'     },
                { value: 'OCASIONAL', label: 'Ocasional' },
                { value: 'FRECUENTE', label: 'Frecuente' },
              ]}
            />
          )} />
        </div>

        <div>
          <Label>Salidas nocturnas</Label>
          <Controller name='frecuencia_salidas' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'NUNCA',     label: 'Nunca'     },
                { value: 'OCASIONAL', label: 'Ocasional' },
                { value: 'FRECUENTE', label: 'Frecuente' },
              ]}
            />
          )} />
        </div>
      </Section>

      <Section title='Normas del piso' accent='blue'>
        <div>
          <Label>¿Se permite fumar en el piso?</Label>
          <Controller name='acepta_fumadores' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'SI',          label: 'Sí'          },
                { value: 'NO',          label: 'No'          },
                { value: 'INDIFERENTE', label: 'Indiferente' },
              ]}
            />
          )} />
        </div>

        <div>
          <Label>¿Se aceptan mascotas?</Label>
          <Controller name='acepta_mascotas' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'SI',     label: 'Sí'     },
                { value: 'NO',     label: 'No'     },
                { value: 'DEPENDE',label: 'Depende'},
              ]}
            />
          )} />
        </div>

        <div>
          <Label>¿Es LGBTQ+ friendly?</Label>
          <Controller name='lgbtq_friendly' control={control} render={({ field }) => (
            <BoolPillGroup value={field.value} onChange={field.onChange} />
          )} />
        </div>
      </Section>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────
function EditarPerfilGrupo() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step,        setStep]        = useState(0)
  const [serverError, setServerError] = useState('')
  const [loading,     setLoading]     = useState(true)
  const [esAdmin,     setEsAdmin]     = useState(false)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoLoading, setFotoLoading] = useState(false)
  const [fotoError,   setFotoError]   = useState('')
  const [todosIntereses,         setTodosIntereses]         = useState({})
  const [interesesSeleccionados, setInteresesSeleccionados] = useState(new Set())
  const fotoInputRef = useRef(null)

  const toggleInteres = (id) => {
    setInteresesSeleccionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const { register, control, handleSubmit, reset, trigger, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '', descripcion: '', ciudad: '', dia_limpieza: '', buscar_companero: null,
      horario: '', ambiente: '', frecuencia_visitas: '', tolerancia_fiestas: '',
      frecuencia_salidas: '', ocupacion: '', acepta_fumadores: '', acepta_mascotas: '',
      lgbtq_friendly: null,
    },
  })

  useEffect(() => {
    Promise.allSettled([
      fetch(`${import.meta.env.VITE_API_URL}/api/grupos/mi-grupo`,      { credentials: 'include' }).then(r => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/grupos/convivencia`,   { credentials: 'include' }).then(r => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/grupos/intereses`,     { credentials: 'include' }).then(r => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/grupos/mis-intereses`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([grupoRes, convRes, todosRes, misRes]) => {
      const camposGrupo = grupoRes.status === 'fulfilled' && grupoRes.value.grupo
        ? {
            nombre:           grupoRes.value.grupo.nombre           ?? '',
            descripcion:      grupoRes.value.grupo.descripcion      ?? '',
            ciudad:           grupoRes.value.grupo.ciudad           ?? '',
            dia_limpieza:     grupoRes.value.grupo.dia_limpieza     ?? '',
            buscar_companero: grupoRes.value.grupo.buscar_companero ?? null,
          }
        : {}
      const camposConv = convRes.status === 'fulfilled' && convRes.value.perfil
        ? {
            horario:            convRes.value.perfil.horario            ?? '',
            ambiente:           convRes.value.perfil.ambiente           ?? '',
            frecuencia_visitas: convRes.value.perfil.frecuencia_visitas ?? '',
            tolerancia_fiestas: convRes.value.perfil.tolerancia_fiestas ?? '',
            frecuencia_salidas: convRes.value.perfil.frecuencia_salidas ?? '',
            ocupacion:          convRes.value.perfil.ocupacion          ?? '',
            acepta_fumadores:   convRes.value.perfil.acepta_fumadores   ?? '',
            acepta_mascotas:    convRes.value.perfil.acepta_mascotas    ?? '',
            lgbtq_friendly:     convRes.value.perfil.lgbtq_friendly     ?? null,
          }
        : {}

      if (grupoRes.status === 'fulfilled') {
        setFotoPreview(grupoRes.value.grupo?.foto_perfil ?? null)
        const miembroActual = grupoRes.value.miembros?.find(m => m.id === user?.id)
        setEsAdmin(miembroActual?.rol_en_grupo === 'ADMIN')
      }
      reset(prev => ({ ...prev, ...camposGrupo, ...camposConv }))

      if (todosRes.status === 'fulfilled') setTodosIntereses(todosRes.value.categorias ?? {})
      if (misRes.status   === 'fulfilled') setInteresesSeleccionados(new Set((misRes.value.intereses ?? []).map(i => i.id)))
    }).finally(() => setLoading(false))
  }, [reset, user?.id])

  const handleFotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFotoPreview(URL.createObjectURL(file))
    setFotoLoading(true)
    setFotoError('')
    try {
      const formData = new FormData()
      formData.append('foto', file)
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/grupos/foto`, { method: 'PUT', credentials: 'include', body: formData })
      const json = await res.json()
      if (!res.ok) return setFotoError(json.message)
      setFotoPreview(json.grupo.foto_perfil)
    } catch {
      setFotoError('Error al subir la imagen')
    } finally {
      setFotoLoading(false)
    }
  }

  const next = async () => {
    const ok = await trigger(STEP_FIELDS[step])
    if (ok) { setStep(s => s + 1); setServerError(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }

  const onSubmit = async (data) => {
    setServerError('')
    const convPayload = Object.fromEntries(
      CONV_FIELDS.map(k => [k, data[k] === '' ? null : data[k] ?? null])
    )
    try {
      const [res] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/grupos/editar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            nombre:           data.nombre,
            dia_limpieza:     data.dia_limpieza     || null,
            descripcion:      data.descripcion      || null,
            ciudad:           data.ciudad           || null,
            buscar_companero: data.buscar_companero ?? null,
          }),
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/grupos/intereses`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ intereses: [...interesesSeleccionados] }),
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/grupos/convivencia`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(convPayload),
        }),
      ])
      const json = await res.json()
      if (!res.ok) return setServerError(json.message)
      navigate('/grupo/perfil')
    } catch {
      setServerError('Error de conexión con el servidor')
    }
  }

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center'
      style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: '#f8fafc' }}>
      <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
    </div>
  )

  if (!esAdmin) return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6'
      style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: '#f8fafc' }}>
      <p className='text-lg font-bold text-slate-800'>Acceso restringido</p>
      <p className='text-sm text-slate-500'>Solo el administrador puede editar la información del grupo.</p>
      <button onClick={() => navigate('/grupo/perfil')} className='cursor-pointer! mt-2 text-emerald-600 font-semibold text-sm hover:underline'>
        Volver al grupo
      </button>
    </div>
  )

  const meta     = STEP_META[step]
  const StepIcon = meta.icon

  return (
    <div className='min-h-screen'
      style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: '#f8fafc' }}>

      {/* Cabecera */}
      <div className='sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3.5 flex items-center gap-4'>
        <button type='button' onClick={() => navigate('/grupo/perfil')}
          className='cursor-pointer! flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 font-medium transition'>
          <ArrowLeft size={15} /> Volver
        </button>
        <div className='h-4 w-px bg-slate-200' />
        <p className='text-sm font-semibold text-slate-700'>Editar grupo</p>
        <span className={`ml-auto font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full ${meta.iconBg} ${meta.color}`}>
          Paso {step + 1} de {STEPS.length}
        </span>
      </div>

      <div className='max-w-2xl mx-auto px-6 py-10'>

        {/* Step bar */}
        <StepBar current={step} steps={STEPS} stepMeta={STEP_META} />

        {/* Tarjeta */}
        <div className='mt-8 bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden'>

          {/* Banner del paso */}
          <div className={`border-l-4 ${meta.borderLeft} px-6 py-5 border-b border-slate-100 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center shrink-0`}>
              <StepIcon size={20} className={meta.color} />
            </div>
            <div>
              <h2 className='font-display text-base font-bold text-slate-900'>{STEPS[step]}</h2>
              <p className='text-xs text-slate-500 mt-0.5'>{meta.hint}</p>
            </div>
          </div>

          <form onSubmit={e => e.preventDefault()} className='p-6 flex flex-col gap-6'>
            {step === 0 && (
              <Paso1
                register={register} control={control}
                errors={errors} watch={watch}
                fotoPreview={fotoPreview}
                fotoLoading={fotoLoading} fotoError={fotoError}
                onFotoClick={() => fotoInputRef.current?.click()}
                todosIntereses={todosIntereses}
                interesesSeleccionados={interesesSeleccionados}
                onToggleInteres={toggleInteres}
              />
            )}
            {step === 1 && <Paso2 control={control} />}

            {serverError && (
              <div className='flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
                <AlertCircle size={13} className='text-red-500 shrink-0' />
                <p className='text-xs text-red-700 font-medium'>{serverError}</p>
              </div>
            )}

            <div className='flex items-center gap-3 pt-4 border-t border-slate-200'>
              {step > 0 && (
                <button type='button' onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className='cursor-pointer! flex items-center gap-1.5 border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-5 py-2.5 rounded-xl transition text-sm'>
                  <ChevronLeft size={15} /> Anterior
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type='button' onClick={next}
                  className='cursor-pointer! ml-auto flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm shadow-sm'>
                  Siguiente <ChevronRight size={15} />
                </button>
              ) : (
                <button type='button' disabled={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                  className='cursor-pointer! ml-auto flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-semibold px-7 py-2.5 rounded-xl transition text-sm shadow-sm shadow-emerald-200'>
                  {isSubmitting ? 'Guardando...' : 'Guardar grupo'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <input ref={fotoInputRef} type='file' accept='image/*' className='hidden' onChange={handleFotoChange} />
    </div>
  )
}

export default EditarPerfilGrupo
