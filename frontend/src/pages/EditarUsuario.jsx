import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useState, useRef, useEffect } from 'react'
import { z } from 'zod'
import {
  ArrowLeft, Camera, User, Users, Search,
  AlertCircle, Check, ChevronLeft, ChevronRight,
} from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import {
  IconInput, baseCls, textareaCls,
  Label, FieldError, Section, PillGroup, BoolPillGroup, StepBar,
} from '../components/FormPrimitivos'

// ── Schema ────────────────────────────────────────────────────────
const schema = z.object({
  nombre:             z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  genero:             z.string().min(1, 'El género es obligatorio'),
  pais:               z.string().min(1, 'El país es obligatorio'),
  dia:                z.string().min(1, 'Selecciona el día'),
  mes:                z.string().min(1, 'Selecciona el mes'),
  anio:               z.string().min(1, 'Selecciona el año'),
  sobre_mi:           z.string().min(1, 'La descripción es obligatoria').max(399, 'Máximo 399 caracteres'),
  // Paso 2 — mi perfil
  ocupacion:          z.string().optional(),
  horario:            z.string().optional(),
  frecuencia_visitas: z.string().optional(),
  ambiente:           z.string().optional(),
  tolerancia_fiestas: z.string().optional(),
  frecuencia_salidas: z.string().optional(),
  fumador:            z.boolean().nullish(),
  acepta_fumadores:   z.string().optional(),
  tiene_mascotas:     z.boolean().nullish(),
  acepta_mascotas:    z.string().optional(),
  lgbtq_friendly:     z.boolean().nullish(),
  // Paso 3 — filtros de convivencia (valor + importancia)
  pref_ocupacion:               z.string().optional(),
  pref_ocupacion_req:           z.boolean().nullish(),
  pref_horario:                 z.string().optional(),
  pref_horario_req:             z.boolean().nullish(),
  pref_frecuencia_visitas:      z.string().optional(),
  pref_frecuencia_visitas_req:  z.boolean().nullish(),
  pref_ambiente:                z.string().optional(),
  pref_ambiente_req:            z.boolean().nullish(),
  pref_tolerancia_fiestas:      z.string().optional(),
  pref_tolerancia_fiestas_req:  z.boolean().nullish(),
  pref_frecuencia_salidas:      z.string().optional(),
  pref_frecuencia_salidas_req:  z.boolean().nullish(),
  pref_fumador:                 z.boolean().nullish(),
  pref_fumador_req:             z.boolean().nullish(),
  pref_acepta_fumadores:        z.string().optional(),
  pref_acepta_fumadores_req:    z.boolean().nullish(),
  pref_tiene_mascotas:          z.boolean().nullish(),
  pref_tiene_mascotas_req:      z.boolean().nullish(),
  pref_acepta_mascotas:         z.string().optional(),
  pref_acepta_mascotas_req:     z.boolean().nullish(),
  pref_lgbtq_friendly:          z.boolean().nullish(),
  pref_lgbtq_friendly_req:      z.boolean().nullish(),
})

// ── Opciones de fecha ─────────────────────────────────────────────
const DIAS  = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  .map((m, i) => ({ value: String(i + 1), label: m }))
const ANIOS = Array.from({ length: 83 }, (_, i) => {
  const y = new Date().getFullYear() - 18 - i
  return { value: String(y), label: String(y) }
})

function parseFecha(fechaISO) {
  if (!fechaISO) return { dia: '', mes: '', anio: '' }
  const [anio, mes, dia] = fechaISO.split('T')[0].split('-')
  return { dia: String(Number(dia)), mes: String(Number(mes)), anio }
}

const CONV_FIELDS = ['ocupacion','horario','frecuencia_visitas','ambiente','tolerancia_fiestas','frecuencia_salidas','fumador','tiene_mascotas']

// ── Steps ─────────────────────────────────────────────────────────
const STEPS = ['Datos personales', 'Tu perfil', 'Filtros de convivencia']
const STEP_FIELDS = [['nombre', 'sobre_mi', 'genero', 'pais', 'dia', 'mes', 'anio'], [], []]
const STEP_META = [
  {
    icon: User,
    color: 'text-emerald-600', iconBg: 'bg-emerald-100',
    ring: 'ring-emerald-200',
    borderLeft: 'border-l-emerald-400',
    headerBg: 'bg-emerald-50', headerBorder: 'border-emerald-100',
    hint: 'Nombre, género, país y fecha de nacimiento.',
  },
  {
    icon: Users,
    color: 'text-blue-600', iconBg: 'bg-blue-100',
    ring: 'ring-blue-200',
    borderLeft: 'border-l-blue-400',
    headerBg: 'bg-blue-50', headerBorder: 'border-blue-100',
    hint: 'Tus preferencias de convivencia y estilo de vida.',
  },
  {
    icon: Search,
    color: 'text-violet-600', iconBg: 'bg-violet-100',
    ring: 'ring-violet-200',
    borderLeft: 'border-l-violet-400',
    headerBg: 'bg-violet-50', headerBorder: 'border-violet-100',
    hint: 'Filtra búsquedas según el compañero que quieres encontrar.',
  },
]

// ── Paso 1: Datos personales ──────────────────────────────────────
function Paso1({ register, control, errors, watch, user, fotoPreview, fotoLoading, fotoError, onFotoClick, todosIntereses, interesesSeleccionados, onToggleInteres }) {
  const sobreMiLength = (watch('sobre_mi') ?? '').length
  return (
    <div className='flex flex-col gap-6'>

      {/* Foto */}
      <div className='flex flex-col items-center gap-2 py-2'>
        <button type='button' onClick={onFotoClick} disabled={fotoLoading}
          className='cursor-pointer! relative group'>
          {fotoPreview
            ? <img src={fotoPreview} alt='Avatar' className='w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg' />
            : <div className='w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-600 ring-4 ring-white shadow-lg'>
                {user?.nombre?.[0]?.toUpperCase()}
              </div>
          }
          <div className='absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition'>
            <Camera size={22} className='text-white' />
          </div>
          {fotoLoading && (
            <div className='absolute inset-0 rounded-full bg-black/50 flex items-center justify-center'>
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
            </div>
          )}
        </button>
        <p className='text-xs text-slate-400'>Haz clic para cambiar la foto</p>
        {fotoError && <p className='text-red-500 text-[11px]'>{fotoError}</p>}
      </div>

      <Section title='Información básica' accent='emerald'>
        <div>
          <Label required>Nombre</Label>
          <IconInput icon={User} error={errors.nombre}>
            <input {...register('nombre')} className={baseCls(errors.nombre)}
              placeholder='Tu nombre' />
          </IconInput>
          <FieldError message={errors.nombre?.message} />
        </div>

        <div>
          <Label required>Sobre mí</Label>
          <textarea {...register('sobre_mi')} rows={4} maxLength={399}
            placeholder='Cuéntanos algo sobre ti...'
            className={textareaCls(errors.sobre_mi)} />
          <div className='flex items-start justify-between mt-1'>
            <FieldError message={errors.sobre_mi?.message} />
            <p className={`font-mono text-[11px] ml-auto shrink-0 ${sobreMiLength >= 399 ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
              {sobreMiLength}/399
            </p>
          </div>
        </div>
      </Section>

      <Section title='Identidad' accent='emerald'>
        <div>
          <Label required>Género</Label>
          <Controller name='genero' control={control} render={({ field }) => (
            <PillGroup
              value={field.value ?? ''}
              onChange={field.onChange}
              options={[
                { value: 'Hombre',              label: 'Hombre' },
                { value: 'Mujer',               label: 'Mujer' },
                { value: 'Otro',                label: 'Otro' },
                { value: 'Prefiero no decirlo', label: 'Prefiero no decirlo' },
              ]}
            />
          )} />
          <FieldError message={errors.genero?.message} />
        </div>

        <div>
          <Label required>País</Label>
          <Controller name='pais' control={control} render={({ field }) => (
            <PillGroup
              value={field.value ?? ''}
              onChange={field.onChange}
              options={[
                { value: 'España',      label: 'España' },
                { value: 'Francia',     label: 'Francia' },
                { value: 'Italia',      label: 'Italia' },
                { value: 'Alemania',    label: 'Alemania' },
                { value: 'Reino Unido', label: 'Reino Unido' },
                { value: 'Otro',        label: 'Otro' },
              ]}
            />
          )} />
          <FieldError message={errors.pais?.message} />
        </div>
      </Section>

      <Section title='Fecha de nacimiento' accent='emerald'>
        <div>
          <Label required>Fecha de nacimiento</Label>
          <div className='flex gap-2'>
            <div className='flex-1'>
              <Controller name='dia' control={control} render={({ field }) => (
                <CustomSelect options={DIAS} placeholder='Día'
                  value={field.value ?? ''} onChange={field.onChange} />
              )} />
            </div>
            <div className='flex-1'>
              <Controller name='mes' control={control} render={({ field }) => (
                <CustomSelect options={MESES} placeholder='Mes'
                  value={field.value ?? ''} onChange={field.onChange} />
              )} />
            </div>
            <div className='flex-1'>
              <Controller name='anio' control={control} render={({ field }) => (
                <CustomSelect options={ANIOS} placeholder='Año'
                  value={field.value ?? ''} onChange={field.onChange} />
              )} />
            </div>
          </div>
          {(errors.dia || errors.mes || errors.anio) && (
            <FieldError message='La fecha de nacimiento es obligatoria' />
          )}
        </div>
      </Section>

      {Object.keys(todosIntereses).length > 0 && (
        <Section title='Intereses' accent='emerald'>
          <p className='text-xs text-slate-400 -mt-1'>Selecciona los que te describan. Aparecerán en tu perfil público.</p>
          <div className='flex flex-col gap-4'>
            {Object.entries(todosIntereses).map(([categoria, lista]) => (
              <div key={categoria}>
                <p className='font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2'>{categoria}</p>
                <div className='flex flex-wrap gap-2'>
                  {lista.map(({ id, nombre }) => {
                    const seleccionado = interesesSeleccionados.has(id)
                    return (
                      <button
                        key={id}
                        type='button'
                        onClick={() => onToggleInteres(id)}
                        className={`cursor-pointer! px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                          seleccionado
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
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

// ── Paso 2: Convivencia ───────────────────────────────────────────
function Paso2({ control }) {
  return (
    <div className='flex flex-col gap-6'>
      <p className='text-sm text-slate-500 leading-relaxed'>
        Cuanto más completo esté tu perfil de convivencia, mejores resultados obtendrás al buscar grupos afines.
        Rellena al menos 3 campos.
      </p>

      <Section title='Estilo de vida' accent='blue'>
        <div>
          <Label>Ocupación principal</Label>
          <Controller name='ocupacion' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'ESTUDIO',           label: 'Estudio' },
                { value: 'TRABAJO',           label: 'Trabajo' },
                { value: 'ESTUDIO Y TRABAJO', label: 'Estudio y trabajo' },
              ]}
            />
          )} />
        </div>

        <div>
          <Label>Horario típico</Label>
          <Controller name='horario' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'MADRUGADOR', label: 'Madrugador' },
                { value: 'INTERMEDIO', label: 'Intermedio' },
                { value: 'NOCTURNO',   label: 'Nocturno' },
              ]}
            />
          )} />
        </div>

        <div>
          <Label>Ambiente deseado en casa</Label>
          <Controller name='ambiente' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'TRANQUILO',   label: 'Tranquilo' },
                { value: 'EQUILIBRADO', label: 'Equilibrado' },
                { value: 'SOCIAL',      label: 'Social' },
              ]}
            />
          )} />
        </div>

        <div>
          <Label>Frecuencia de visitas en casa</Label>
          <Controller name='frecuencia_visitas' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'CASI_NUNCA', label: 'Casi nunca' },
                { value: 'A_VECES',   label: 'A veces' },
                { value: 'FRECUENTE', label: 'Frecuente' },
              ]}
            />
          )} />
        </div>
      </Section>

      <Section title='Ocio' accent='blue'>
        <div>
          <Label>Fiestas en casa</Label>
          <Controller name='tolerancia_fiestas' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'NUNCA',     label: 'Nunca' },
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
                { value: 'NUNCA',     label: 'Nunca' },
                { value: 'OCASIONAL', label: 'Ocasional' },
                { value: 'FRECUENTE', label: 'Frecuente' },
              ]}
            />
          )} />
        </div>
      </Section>

      <Section title='Hábitos' accent='blue'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div>
            <Label>¿Fumas?</Label>
            <Controller name='fumador' control={control} render={({ field }) => (
              <BoolPillGroup value={field.value} onChange={field.onChange} />
            )} />
          </div>

          <div>
            <Label>¿Tienes mascotas?</Label>
            <Controller name='tiene_mascotas' control={control} render={({ field }) => (
              <BoolPillGroup value={field.value} onChange={field.onChange} />
            )} />
          </div>
        </div>
      </Section>
    </div>
  )
}

// ── Toggle de importancia (aparece al seleccionar un valor) ──────
function ImportanciaToggle({ nameReq, control }) {
  return (
    <Controller name={nameReq} control={control} render={({ field }) => (
      <div className='flex items-center gap-2 mt-2 pl-0.5'>
        <span className='text-[11px] text-slate-400 font-medium shrink-0'>Importancia:</span>
        <div className='flex gap-1.5'>
          {[
            { v: false, l: 'Preferente',   cls: field.value === false ? 'bg-violet-500 text-white border-violet-500 shadow-sm shadow-violet-100' : 'bg-white text-slate-500 border-slate-200 hover:border-violet-300 hover:text-violet-700' },
            { v: true,  l: 'Obligatorio',  cls: field.value === true  ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-100'    : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300 hover:text-amber-700'  },
          ].map(({ v, l, cls }) => (
            <button key={l} type='button'
              onClick={() => field.onChange(field.value === v ? null : v)}
              className={`cursor-pointer! px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${cls}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
    )} />
  )
}

// Wrapper: muestra ImportanciaToggle solo cuando hay valor seleccionado
function CampoPref({ label, nameVal, nameReq, control, children }) {
  const valor = useWatch({ control, name: nameVal })
  const tieneValor = valor !== '' && valor !== null && valor !== undefined
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {tieneValor && <ImportanciaToggle nameReq={nameReq} control={control} />}
    </div>
  )
}

// ── Paso 3: Filtros de convivencia ──────────────────────────────────────────
function Paso3({ control }) {
  return (
    <div className='flex flex-col gap-6'>
      <p className='text-sm text-slate-500 leading-relaxed'>
        Indica cómo quieres que sea tu futuro compañero de piso. Para cada preferencia puedes indicar
        si es <span className='font-semibold text-violet-600'>preferente</span> (influye en el orden de resultados)
        u <span className='font-semibold text-amber-600'>obligatorio</span> (filtra grupos que no cumplan).
      </p>

      <Section title='Estilo de vida' accent='violet'>
        <CampoPref label='Ocupación del compañero' nameVal='pref_ocupacion' nameReq='pref_ocupacion_req' control={control}>
          <Controller name='pref_ocupacion' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'ESTUDIO',           label: 'Que estudie' },
                { value: 'TRABAJO',           label: 'Que trabaje' },
                { value: 'ESTUDIO_Y_TRABAJO', label: 'Ambas' },
              ]}
            />
          )} />
        </CampoPref>

        <CampoPref label='Horario del compañero' nameVal='pref_horario' nameReq='pref_horario_req' control={control}>
          <Controller name='pref_horario' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'MADRUGADOR', label: 'Madrugador' },
                { value: 'INTERMEDIO', label: 'Intermedio' },
                { value: 'NOCTURNO',   label: 'Nocturno' },
              ]}
            />
          )} />
        </CampoPref>

        <CampoPref label='Ambiente en casa' nameVal='pref_ambiente' nameReq='pref_ambiente_req' control={control}>
          <Controller name='pref_ambiente' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'TRANQUILO',   label: 'Tranquilo' },
                { value: 'EQUILIBRADO', label: 'Equilibrado' },
                { value: 'SOCIAL',      label: 'Social' },
              ]}
            />
          )} />
        </CampoPref>

        <CampoPref label='Visitas en casa' nameVal='pref_frecuencia_visitas' nameReq='pref_frecuencia_visitas_req' control={control}>
          <Controller name='pref_frecuencia_visitas' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'CASI_NUNCA', label: 'Casi nunca' },
                { value: 'A_VECES',   label: 'A veces' },
                { value: 'FRECUENTE', label: 'Frecuente' },
              ]}
            />
          )} />
        </CampoPref>
      </Section>

      <Section title='Ocio' accent='violet'>
        <CampoPref label='Fiestas en casa' nameVal='pref_tolerancia_fiestas' nameReq='pref_tolerancia_fiestas_req' control={control}>
          <Controller name='pref_tolerancia_fiestas' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'NUNCA',     label: 'Nunca' },
                { value: 'OCASIONAL', label: 'Ocasional' },
                { value: 'FRECUENTE', label: 'Frecuente' },
              ]}
            />
          )} />
        </CampoPref>

        <CampoPref label='Salidas nocturnas' nameVal='pref_frecuencia_salidas' nameReq='pref_frecuencia_salidas_req' control={control}>
          <Controller name='pref_frecuencia_salidas' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'NUNCA',     label: 'Nunca' },
                { value: 'OCASIONAL', label: 'Ocasional' },
                { value: 'FRECUENTE', label: 'Frecuente' },
              ]}
            />
          )} />
        </CampoPref>
      </Section>

      <Section title='Hábitos' accent='violet'>
        <CampoPref label='¿Buscas compañero fumador?' nameVal='pref_fumador' nameReq='pref_fumador_req' control={control}>
          <Controller name='pref_fumador' control={control} render={({ field }) => (
            <BoolPillGroup value={field.value} onChange={field.onChange} />
          )} />
        </CampoPref>

        <CampoPref label='¿El grupo debe aceptar fumadores?' nameVal='pref_acepta_fumadores' nameReq='pref_acepta_fumadores_req' control={control}>
          <Controller name='pref_acepta_fumadores' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'SI',          label: 'Sí' },
                { value: 'NO',          label: 'No' },
                { value: 'INDIFERENTE', label: 'Indiferente' },
              ]}
            />
          )} />
        </CampoPref>

        <CampoPref label='¿Buscas compañero con mascotas?' nameVal='pref_tiene_mascotas' nameReq='pref_tiene_mascotas_req' control={control}>
          <Controller name='pref_tiene_mascotas' control={control} render={({ field }) => (
            <BoolPillGroup value={field.value} onChange={field.onChange} />
          )} />
        </CampoPref>

        <CampoPref label='¿El grupo debe aceptar mascotas?' nameVal='pref_acepta_mascotas' nameReq='pref_acepta_mascotas_req' control={control}>
          <Controller name='pref_acepta_mascotas' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'SI',      label: 'Sí' },
                { value: 'NO',      label: 'No' },
                { value: 'DEPENDE', label: 'Depende' },
              ]}
            />
          )} />
        </CampoPref>

        <CampoPref label='¿Buscas entorno LGBTQ+ friendly?' nameVal='pref_lgbtq_friendly' nameReq='pref_lgbtq_friendly_req' control={control}>
          <Controller name='pref_lgbtq_friendly' control={control} render={({ field }) => (
            <BoolPillGroup value={field.value} onChange={field.onChange} />
          )} />
        </CampoPref>
      </Section>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────
function EditarUsuario() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]               = useState(0)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]         = useState(true)
  const [fotoPreview, setFotoPreview] = useState(user?.foto_perfil ?? null)
  const [fotoLoading, setFotoLoading] = useState(false)
  const [fotoError, setFotoError]     = useState('')
  const [todosIntereses, setTodosIntereses]           = useState({})
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
      nombre: '', genero: '', pais: '', dia: '', mes: '', anio: '', sobre_mi: '',
      ocupacion: '', horario: '', frecuencia_visitas: '', ambiente: '',
      tolerancia_fiestas: '', frecuencia_salidas: '',
      fumador: null, acepta_fumadores: '',
      tiene_mascotas: null, acepta_mascotas: '',
      lgbtq_friendly: null,
      pref_ocupacion: '', pref_ocupacion_req: null,
      pref_horario: '', pref_horario_req: null,
      pref_frecuencia_visitas: '', pref_frecuencia_visitas_req: null,
      pref_ambiente: '', pref_ambiente_req: null,
      pref_tolerancia_fiestas: '', pref_tolerancia_fiestas_req: null,
      pref_frecuencia_salidas: '', pref_frecuencia_salidas_req: null,
      pref_fumador: null, pref_fumador_req: null,
      pref_acepta_fumadores: '', pref_acepta_fumadores_req: null,
      pref_tiene_mascotas: null, pref_tiene_mascotas_req: null,
      pref_acepta_mascotas: '', pref_acepta_mascotas_req: null,
      pref_lgbtq_friendly: null, pref_lgbtq_friendly_req: null,
    },
  })

  useEffect(() => {
    Promise.allSettled([
      fetch('http://localhost:3000/api/perfil/convivencia',   { credentials: 'include' }).then(r => r.json()),
      fetch('http://localhost:3000/api/perfil/intereses').then(r => r.json()),
      fetch('http://localhost:3000/api/perfil/mis-intereses', { credentials: 'include' }).then(r => r.json()),
      fetch('http://localhost:3000/api/perfil/preferencias',  { credentials: 'include' }).then(r => r.json()),
    ]).then(([convRes, todosRes, misRes, prefRes]) => {
      const perfil = convRes.status === 'fulfilled' ? convRes.value.perfil : null
      const pref   = prefRes.status === 'fulfilled'  ? prefRes.value.preferencias : null

      if (perfil) {
        const { dia, mes, anio } = parseFecha(perfil.fecha_nacimiento)
        reset({
          nombre: user?.nombre ?? '',
          sobre_mi: perfil.sobre_mi ?? '',
          genero: perfil.genero ?? '',
          pais: perfil.pais ?? '',
          dia, mes, anio,
          ocupacion: perfil.ocupacion ?? '',
          horario: perfil.horario ?? '',
          frecuencia_visitas: perfil.frecuencia_visitas ?? '',
          ambiente: perfil.ambiente ?? '',
          tolerancia_fiestas: perfil.tolerancia_fiestas ?? '',
          frecuencia_salidas: perfil.frecuencia_salidas ?? '',
          fumador: perfil.fumador ?? null,
          acepta_fumadores: perfil.acepta_fumadores ?? '',
          tiene_mascotas: perfil.tiene_mascotas ?? null,
          acepta_mascotas: perfil.acepta_mascotas ?? '',
          lgbtq_friendly: perfil.lgbtq_friendly ?? null,
          pref_ocupacion:               pref?.ocupacion               ?? '',
          pref_ocupacion_req:           pref?.ocupacion_req           ?? null,
          pref_horario:                 pref?.horario                 ?? '',
          pref_horario_req:             pref?.horario_req             ?? null,
          pref_frecuencia_visitas:      pref?.frecuencia_visitas      ?? '',
          pref_frecuencia_visitas_req:  pref?.frecuencia_visitas_req  ?? null,
          pref_ambiente:                pref?.ambiente                ?? '',
          pref_ambiente_req:            pref?.ambiente_req            ?? null,
          pref_tolerancia_fiestas:      pref?.tolerancia_fiestas      ?? '',
          pref_tolerancia_fiestas_req:  pref?.tolerancia_fiestas_req  ?? null,
          pref_frecuencia_salidas:      pref?.frecuencia_salidas      ?? '',
          pref_frecuencia_salidas_req:  pref?.frecuencia_salidas_req  ?? null,
          pref_fumador:                 pref?.fumador                 ?? null,
          pref_fumador_req:             pref?.fumador_req             ?? null,
          pref_acepta_fumadores:        pref?.acepta_fumadores        ?? '',
          pref_acepta_fumadores_req:    pref?.acepta_fumadores_req    ?? null,
          pref_tiene_mascotas:          pref?.tiene_mascotas          ?? null,
          pref_tiene_mascotas_req:      pref?.tiene_mascotas_req      ?? null,
          pref_acepta_mascotas:         pref?.acepta_mascotas         ?? '',
          pref_acepta_mascotas_req:     pref?.acepta_mascotas_req     ?? null,
          pref_lgbtq_friendly:          pref?.lgbtq_friendly          ?? null,
          pref_lgbtq_friendly_req:      pref?.lgbtq_friendly_req      ?? null,
        })
      }
      if (todosRes.status === 'fulfilled') setTodosIntereses(todosRes.value.categorias ?? {})
      if (misRes.status   === 'fulfilled') setInteresesSeleccionados(new Set((misRes.value.intereses ?? []).map(i => i.id)))
    }).finally(() => setLoading(false))
  }, [reset, user])

  useEffect(() => {
    if (user?.foto_perfil) setFotoPreview(user.foto_perfil)
  }, [user?.foto_perfil])

  const handleFotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFotoPreview(URL.createObjectURL(file))
    setFotoLoading(true)
    setFotoError('')
    try {
      const formData = new FormData()
      formData.append('foto', file)
      const res = await fetch('http://localhost:3000/api/perfil/foto', {
        method: 'PUT', credentials: 'include', body: formData,
      })
      const json = await res.json()
      if (!res.ok) return setFotoError(json.message)
      setUser(json.user)
      setFotoPreview(json.user.foto_perfil)
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
    const filled = CONV_FIELDS.filter(k => data[k] !== '' && data[k] !== undefined && data[k] !== null).length
    if (filled < 3) {
      setServerError('Debes rellenar al menos 3 preferencias de convivencia')
      return
    }
    const {
      dia, mes, anio,
      pref_ocupacion, pref_ocupacion_req,
      pref_horario, pref_horario_req,
      pref_frecuencia_visitas, pref_frecuencia_visitas_req,
      pref_ambiente, pref_ambiente_req,
      pref_tolerancia_fiestas, pref_tolerancia_fiestas_req,
      pref_frecuencia_salidas, pref_frecuencia_salidas_req,
      pref_fumador, pref_fumador_req,
      pref_acepta_fumadores, pref_acepta_fumadores_req,
      pref_tiene_mascotas, pref_tiene_mascotas_req,
      pref_acepta_mascotas, pref_acepta_mascotas_req,
      pref_lgbtq_friendly, pref_lgbtq_friendly_req,
      ...rest
    } = data
    const fecha_nacimiento = (dia && mes && anio)
      ? `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
      : null
    const payload = Object.fromEntries(
      Object.entries({ ...rest, fecha_nacimiento }).map(([k, v]) => [k, v === '' ? null : v ?? null])
    )
    const strOrNull = v => (v === '' ? null : v ?? null)
    const payloadPref = {
      ocupacion:               strOrNull(pref_ocupacion),
      ocupacion_req:           pref_ocupacion          ? (pref_ocupacion_req          ?? false) : false,
      horario:                 strOrNull(pref_horario),
      horario_req:             pref_horario            ? (pref_horario_req            ?? false) : false,
      frecuencia_visitas:      strOrNull(pref_frecuencia_visitas),
      frecuencia_visitas_req:  pref_frecuencia_visitas ? (pref_frecuencia_visitas_req  ?? false) : false,
      ambiente:                strOrNull(pref_ambiente),
      ambiente_req:            pref_ambiente           ? (pref_ambiente_req           ?? false) : false,
      tolerancia_fiestas:      strOrNull(pref_tolerancia_fiestas),
      tolerancia_fiestas_req:  pref_tolerancia_fiestas ? (pref_tolerancia_fiestas_req ?? false) : false,
      frecuencia_salidas:      strOrNull(pref_frecuencia_salidas),
      frecuencia_salidas_req:  pref_frecuencia_salidas ? (pref_frecuencia_salidas_req  ?? false) : false,
      fumador:                 pref_fumador            ?? null,
      fumador_req:             pref_fumador !== null   ? (pref_fumador_req            ?? false) : false,
      acepta_fumadores:        strOrNull(pref_acepta_fumadores),
      acepta_fumadores_req:    pref_acepta_fumadores   ? (pref_acepta_fumadores_req   ?? false) : false,
      tiene_mascotas:          pref_tiene_mascotas     ?? null,
      tiene_mascotas_req:      pref_tiene_mascotas !== null ? (pref_tiene_mascotas_req ?? false) : false,
      acepta_mascotas:         strOrNull(pref_acepta_mascotas),
      acepta_mascotas_req:     pref_acepta_mascotas    ? (pref_acepta_mascotas_req    ?? false) : false,
      lgbtq_friendly:          pref_lgbtq_friendly     ?? null,
      lgbtq_friendly_req:      pref_lgbtq_friendly !== null ? (pref_lgbtq_friendly_req ?? false) : false,
    }
    try {
      const [res] = await Promise.all([
        fetch('http://localhost:3000/api/perfil/editar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }),
        fetch('http://localhost:3000/api/perfil/intereses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ intereses: [...interesesSeleccionados] }),
        }),
        fetch('http://localhost:3000/api/perfil/preferencias', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payloadPref),
        }),
      ])
      const json = await res.json()
      if (!res.ok) return setServerError(json.message)
      setUser(json.user)
      navigate('/perfil/usuario')
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

  const meta     = STEP_META[step]
  const StepIcon = meta.icon

  return (
    <div className='min-h-screen'
      style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: '#f8fafc' }}>

      {/* Cabecera */}
      <div className='sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3.5 flex items-center gap-4'>
        <button type='button' onClick={() => navigate('/perfil/usuario')}
          className='cursor-pointer! flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 font-medium transition'>
          <ArrowLeft size={15} /> Volver
        </button>
        <div className='h-4 w-px bg-slate-200' />
        <p className='text-sm font-semibold text-slate-700'>Editar perfil</p>
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
                user={user} fotoPreview={fotoPreview}
                fotoLoading={fotoLoading} fotoError={fotoError}
                onFotoClick={() => fotoInputRef.current?.click()}
                todosIntereses={todosIntereses}
                interesesSeleccionados={interesesSeleccionados}
                onToggleInteres={toggleInteres}
              />
            )}
            {step === 1 && <Paso2 control={control} />}
            {step === 2 && <Paso3 control={control} />}

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
                  {isSubmitting ? 'Guardando...' : 'Guardar perfil'}
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

export default EditarUsuario
