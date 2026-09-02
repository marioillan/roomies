import { useForm, Controller, useWatch, useController } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../lib/apiFetch'
import { useState, useRef, useEffect } from 'react'
import { z } from 'zod'
import {
  ArrowLeft, Camera, User, Users, Search,
  AlertCircle, Check, ChevronLeft, ChevronRight, X, Star
} from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import {
  IconInput, baseCls, textareaCls,
  Label, FieldError, Section, PillGroup, BoolPillGroup, StepBar,
} from '../components/FormPrimitivos'

// ─── Helpers ───
const enumReq = (values) =>
  z.string({ required_error: 'Obligatorio' })
    .min(1, 'Selecciona una opción')
    .refine(v => values.includes(v), 'Selecciona una opción')

// ─── Schema ───
const schema = z.object({
  nombre:             z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  genero:             z.string().min(1, 'El género es obligatorio'),
  pais:               z.string().min(1, 'El país es obligatorio'),
  dia:                z.string().min(1, 'Selecciona el día'),
  mes:                z.string().min(1, 'Selecciona el mes'),
  anio:               z.string().min(1, 'Selecciona el año'),
  sobre_mi:           z.string().min(1, 'La descripción es obligatoria').max(399, 'Máximo 399 caracteres'),
  // Paso 2 — mi perfil (campos de compatibilidad: obligatorios)
  ocupacion:          enumReq(['ESTUDIO', 'TRABAJO', 'ESTUDIO_Y_TRABAJO']),
  horario:            enumReq(['MADRUGADOR', 'INTERMEDIO', 'NOCTURNO']),
  frecuencia_visitas: enumReq(['CASI_NUNCA', 'A_VECES', 'FRECUENTE']),
  ambiente:           enumReq(['TRANQUILO', 'EQUILIBRADO', 'SOCIAL']),
  tolerancia_fiestas: enumReq(['NUNCA', 'OCASIONAL', 'FRECUENTE']),
  limpieza_orden:     enumReq(['DESPREOCUPADO', 'FLEXIBLE', 'ORDENADO']),
  nivel_ruido:        enumReq(['SILENCIO_TOTAL', 'MODERADO', 'ALTO']),
  fumador:            z.boolean().nullish(),
  tiene_mascotas:     z.boolean().nullish(),
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
  pref_acepta_fumadores:        z.string().optional(),
  pref_acepta_fumadores_req:    z.boolean().nullish(),
  pref_acepta_mascotas:         z.string().optional(),
  pref_acepta_mascotas_req:     z.boolean().nullish(),
  pref_lgbtq_friendly:          z.boolean().nullish(),
  pref_lgbtq_friendly_req:      z.boolean().nullish(),
  pref_limpieza_orden:          z.string().optional(),
  pref_limpieza_orden_req:      z.boolean().nullish(),
  pref_nivel_ruido:             z.string().optional(),
  pref_nivel_ruido_req:         z.boolean().nullish(),
})

// ─── Opciones de fecha ───
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

// Campos que se envían a PUT /api/perfil/editar
const PERFIL_FIELDS = [
  'nombre', 'genero', 'pais', 'sobre_mi',
  'ocupacion', 'horario', 'frecuencia_visitas', 'ambiente', 'tolerancia_fiestas',
  'limpieza_orden', 'nivel_ruido',
  'fumador', 'tiene_mascotas', 'lgbtq_friendly',
]

// Preferencias del compañero. En el formulario llevan el prefijo `pref_` y cada
// una arrastra un `pref_<campo>_req` con su importancia (obligatorio o no).
const PREF_FIELDS = [
  'ocupacion', 'horario', 'frecuencia_visitas', 'ambiente', 'tolerancia_fiestas',
  'limpieza_orden', 'nivel_ruido', 'acepta_fumadores', 'acepta_mascotas', 'lgbtq_friendly',
]

const tieneValor = v => v !== '' && v !== null && v !== undefined
const limpiar    = v => (tieneValor(v) ? v : null)

// ─── Steps ───
const STEPS = ['Datos personales', 'Tu perfil', 'Filtros de convivencia']
const STEP_FIELDS = [
  ['nombre', 'sobre_mi', 'genero', 'pais', 'dia', 'mes', 'anio'],
  ['ocupacion', 'horario', 'ambiente', 'frecuencia_visitas', 'tolerancia_fiestas', 'limpieza_orden', 'nivel_ruido'],
  [],
]
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
    hint: 'Tus preferencias de convivencia',
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

// ─── Paso 1: Datos personales ───
const MAX_FOTOS_PERFIL = 4
const MIN_FOTOS_PERFIL = 2

function Paso1({ register, control, errors, watch, todosIntereses, interesesSeleccionados, onToggleInteres, fotos, onAddFotos, onRemoveFoto, fotosReqError, interesesReqError }) {
  const [draggingFotos, setDraggingFotos] = useState(false)
  const fotosInputRef = useRef(null)
  const sobreMiLength = (watch('sobre_mi') ?? '').length
  return (
    <div className='flex flex-col gap-6'>

      <Section title='Información básica' accent='emerald'>
        <div>
          <Label htmlFor='campo-nombre' required>Nombre</Label>
          <IconInput icon={User} error={errors.nombre}>
            <input id='campo-nombre' aria-invalid={!!errors.nombre} aria-describedby={errors.nombre ? 'error-nombre' : undefined} {...register('nombre')} className={baseCls(errors.nombre)}
              placeholder='Tu nombre' />
          </IconInput>
          <FieldError id='error-nombre' message={errors.nombre?.message} />
        </div>

        <div>
          <Label htmlFor='campo-sobre_mi' required>Sobre mí</Label>
          <textarea id='campo-sobre_mi' aria-invalid={!!errors.sobre_mi} aria-describedby={errors.sobre_mi ? 'error-sobre_mi' : undefined} {...register('sobre_mi')} rows={4} maxLength={399}
            placeholder='Cuéntanos algo sobre ti...'
            className={textareaCls(errors.sobre_mi)} />
          <div className='flex items-start justify-between mt-1'>
            <FieldError id='error-sobre_mi' message={errors.sobre_mi?.message} />
            <p className={`font-mono text-[11px] ml-auto shrink-0 ${sobreMiLength >= 399 ? 'text-red-400 font-semibold' : 'text-slate-500'}`}>
              {sobreMiLength}/399
            </p>
          </div>
        </div>
      </Section>

      <Section title='Identidad' accent='emerald'>
        <div>
          <Label required>Género</Label>
          <Controller name='genero' control={control} render={({ field }) => (
            <PillGroup etiqueta='Género'
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
          <FieldError id='error-genero' message={errors.genero?.message} />
        </div>

        <div>
          <Label required>País</Label>
          <Controller name='pais' control={control} render={({ field }) => (
            <PillGroup etiqueta='País'
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
          <FieldError id='error-pais' message={errors.pais?.message} />
        </div>
      </Section>

      <Section title='Fecha de nacimiento' accent='emerald'>
        <div>
          <Label required>Fecha de nacimiento</Label>
          <div className='flex gap-2'>
            <div className='flex-1'>
              <Controller name='dia' control={control} render={({ field }) => (
                <CustomSelect ariaLabel='Fecha de nacimiento — Día' options={DIAS} placeholder='Día'
                  value={field.value ?? ''} onChange={field.onChange} />
              )} />
            </div>
            <div className='flex-1'>
              <Controller name='mes' control={control} render={({ field }) => (
                <CustomSelect ariaLabel='Fecha de nacimiento — Mes' options={MESES} placeholder='Mes'
                  value={field.value ?? ''} onChange={field.onChange} />
              )} />
            </div>
            <div className='flex-1'>
              <Controller name='anio' control={control} render={({ field }) => (
                <CustomSelect ariaLabel='Fecha de nacimiento — Año' options={ANIOS} placeholder='Año'
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
          <p className='text-xs text-slate-500 -mt-1'>Selecciona <span className='font-semibold text-slate-600'>al menos 3</span> que te describan. Aparecerán en tu perfil público.</p>
          {interesesReqError && (
            <div role='alert' className='flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
              <AlertCircle size={13} aria-hidden='true' className='text-red-600 shrink-0' />
              <p className='text-xs text-red-700 font-medium'>{interesesReqError}</p>
            </div>
          )}
          <div className='flex flex-col gap-4'>
            {Object.entries(todosIntereses).map(([categoria, lista]) => (
              <div key={categoria}>
                <p className='font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2'>{categoria}</p>
                <div className='flex flex-wrap gap-2'>
                  {lista.map(({ id, nombre }) => {
                    const seleccionado = interesesSeleccionados.has(id)
                    return (
                      <button
                        key={id}
                        type='button'
                        aria-pressed={seleccionado}
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

      <Section title='Fotos de perfil' accent='emerald'>
        <p className='text-xs text-slate-500 -mt-1'>
          Añade entre <span className='font-semibold text-slate-600'>{MIN_FOTOS_PERFIL} y {MAX_FOTOS_PERFIL} fotos</span>.
          La primera será tu foto principal.
        </p>
        {fotosReqError && (
          <div role='alert' className='flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
            <AlertCircle size={13} aria-hidden='true' className='text-red-600 shrink-0' />
            <p className='text-xs text-red-700 font-medium'>{fotosReqError}</p>
          </div>
        )}

        {fotos.length > 0 && (
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5'>
            {fotos.map((foto, idx) => {
              const esNueva = foto instanceof File
              const src = esNueva ? URL.createObjectURL(foto) : foto.url
              return (
                <div key={esNueva ? `nueva-${idx}` : foto.id}
                  className='relative aspect-3/4 rounded-xl overflow-hidden bg-slate-100 group'>
                  <img src={src} alt='' className='w-full h-full object-cover' />
                  {idx === 0 && (
                    <span className='absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm'>
                      <Star aria-hidden='true' size={9} className='fill-current' /> Principal
                    </span>
                  )}
                  {esNueva && (
                    <div className='absolute top-1.5 left-1.5 bg-emerald-500/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md'>
                      Nueva
                    </div>
                  )}
                  <button type='button' onClick={() => onRemoveFoto(idx)}
                    aria-label={`Eliminar la foto ${idx + 1}`}
                    className='cursor-pointer! absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity'>
                    <X size={11} aria-hidden='true' className='text-white' />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {fotos.length < MAX_FOTOS_PERFIL && (
          <div
            onDragOver={e => { e.preventDefault(); setDraggingFotos(true) }}
            onDragLeave={() => setDraggingFotos(false)}
            onDrop={e => { e.preventDefault(); setDraggingFotos(false); onAddFotos(e.dataTransfer.files) }}
            onClick={() => fotosInputRef.current?.click()}
            className={`cursor-pointer! border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 transition-all ${
              draggingFotos ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${draggingFotos ? 'bg-emerald-200' : 'bg-emerald-100'}`}>
              <Camera aria-hidden='true' size={18} className='text-emerald-500' />
            </div>
            <div className='text-center'>
              <p className='text-sm font-semibold text-slate-700'>Arrastra fotos aquí o haz clic</p>
              <p className='text-xs text-slate-500 mt-0.5'>
                {MAX_FOTOS_PERFIL - fotos.length} foto{MAX_FOTOS_PERFIL - fotos.length !== 1 ? 's' : ''} más · JPG, PNG, WEBP
              </p>
            </div>
            <input ref={fotosInputRef} type='file' multiple accept='image/*' className='hidden'
              onChange={e => { onAddFotos(e.target.files); e.target.value = '' }} />
          </div>
        )}

        {fotos.length === MAX_FOTOS_PERFIL && (
          <p className='text-xs text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-xl py-2.5'>
            Has alcanzado el máximo de {MAX_FOTOS_PERFIL} fotos.
          </p>
        )}
      </Section>
    </div>
  )
}

// ─── Paso 2: Convivencia ───
function Paso2({ control, errors }) {
  return (
    <div className='flex flex-col gap-6'>
      <p className='text-sm text-slate-500 leading-relaxed'>
        Cuanto más completo esté tu perfil, mejores resultados obtendrás en tus futuros compañeros.
      </p>

      <Section title='Estilo de vida' accent='blue'>
        <div>
          <Label>Ocupación principal</Label>
          <Controller name='ocupacion' control={control} render={({ field }) => (
            <PillGroup etiqueta='Ocupación principal' value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'ESTUDIO',           label: 'Estudio' },
                { value: 'TRABAJO',           label: 'Trabajo' },
                { value: 'ESTUDIO_Y_TRABAJO', label: 'Estudio y trabajo' },
              ]}
            />
          )} />
          <FieldError id='error-ocupacion' message={errors?.ocupacion?.message} />
        </div>

        <div>
          <Label>Horario típico</Label>
          <Controller name='horario' control={control} render={({ field }) => (
            <PillGroup etiqueta='Horario típico' value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'MADRUGADOR', label: 'Madrugador' },
                { value: 'INTERMEDIO', label: 'Intermedio' },
                { value: 'NOCTURNO',   label: 'Nocturno' },
              ]}
            />
          )} />
          <FieldError id='error-horario' message={errors?.horario?.message} />
        </div>

        <div>
          <Label>Ambiente deseado en casa</Label>
          <Controller name='ambiente' control={control} render={({ field }) => (
            <PillGroup etiqueta='Ambiente deseado en casa' value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'TRANQUILO',   label: 'Tranquilo' },
                { value: 'EQUILIBRADO', label: 'Equilibrado' },
                { value: 'SOCIAL',      label: 'Social' },
              ]}
            />
          )} />
          <FieldError id='error-ambiente' message={errors?.ambiente?.message} />
        </div>

        <div>
          <Label>Frecuencia de visitas en casa</Label>
          <Controller name='frecuencia_visitas' control={control} render={({ field }) => (
            <PillGroup etiqueta='Frecuencia de visitas en casa' value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'CASI_NUNCA', label: 'Casi nunca' },
                { value: 'A_VECES',   label: 'A veces' },
                { value: 'FRECUENTE', label: 'Frecuente' },
              ]}
            />
          )} />
          <FieldError id='error-frecuencia_visitas' message={errors?.frecuencia_visitas?.message} />
        </div>

        <div>
          <Label>Limpieza y orden en casa</Label>
          <Controller name='limpieza_orden' control={control} render={({ field }) => (
            <PillGroup etiqueta='Limpieza y orden en casa' value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'DESPREOCUPADO', label: 'Despreocupado' },
                { value: 'FLEXIBLE',      label: 'Flexible' },
                { value: 'ORDENADO',      label: 'Ordenado' },
              ]}
            />
          )} />
          <FieldError id='error-limpieza_orden' message={errors?.limpieza_orden?.message} />
        </div>

        <div>
          <Label>Nivel de ruido que toleras</Label>
          <Controller name='nivel_ruido' control={control} render={({ field }) => (
            <PillGroup etiqueta='Nivel de ruido que toleras' value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'SILENCIO_TOTAL', label: 'Silencio total' },
                { value: 'MODERADO',       label: 'Moderado' },
                { value: 'ALTO',           label: 'Alto' },
              ]}
            />
          )} />
          <FieldError id='error-nivel_ruido' message={errors?.nivel_ruido?.message} />
        </div>
      </Section>

      <Section title='Ocio' accent='blue'>
        <div>
          <Label>Fiestas en casa</Label>
          <Controller name='tolerancia_fiestas' control={control} render={({ field }) => (
            <PillGroup etiqueta='Fiestas en casa' value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'NUNCA',     label: 'Nunca' },
                { value: 'OCASIONAL', label: 'Ocasional' },
                { value: 'FRECUENTE', label: 'Frecuente' },
              ]}
            />
          )} />
          <FieldError id='error-tolerancia_fiestas' message={errors?.tolerancia_fiestas?.message} />
        </div>
      </Section>

      <Section title='Hábitos' accent='blue'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div>
            <Label>¿Fumas?</Label>
            <Controller name='fumador' control={control} render={({ field }) => (
              <BoolPillGroup etiqueta='¿Fumas?' value={field.value} onChange={field.onChange} />
            )} />
          </div>

          <div>
            <Label>¿Tienes mascotas?</Label>
            <Controller name='tiene_mascotas' control={control} render={({ field }) => (
              <BoolPillGroup etiqueta='¿Tienes mascotas?' value={field.value} onChange={field.onChange} />
            )} />
          </div>

          <div>
            <Label>¿Entorno LGBTQ+ friendly?</Label>
            <Controller name='lgbtq_friendly' control={control} render={({ field }) => (
              <BoolPillGroup etiqueta='¿Entorno LGBTQ+ friendly?' value={field.value} onChange={field.onChange} />
            )} />
          </div>
        </div>
      </Section>
    </div>
  )
}

// ─── Toggle de importancia (aparece al seleccionar un valor) ───
function ImportanciaToggle({ nameReq, control }) {
  return (
    <Controller name={nameReq} control={control} render={({ field }) => (
      <div className='flex items-center gap-2 mt-2 pl-0.5'>
        <span className='text-[11px] text-slate-500 font-medium shrink-0'>Importancia:</span>
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
// y auto-pone "Preferente" (false) al seleccionar por primera vez
function CampoPref({ label, nameVal, nameReq, control, children }) {
  const valor = useWatch({ control, name: nameVal })
  const tieneValor = valor !== '' && valor !== null && valor !== undefined
  const { field: reqField } = useController({ control, name: nameReq })

  useEffect(() => {
    if (tieneValor && reqField.value === null) reqField.onChange(false)
    else if (!tieneValor && reqField.value !== null) reqField.onChange(null)
  }, [tieneValor])

  return (
    <div>
      <Label>{label}</Label>
      {children}
      {tieneValor && <ImportanciaToggle nameReq={nameReq} control={control} />}
    </div>
  )
}

// ─── Paso 3: Filtros de convivencia ───
function Paso3({ control }) {
  return (
    <div className='flex flex-col gap-6'>
      <p className='text-sm text-slate-500 leading-relaxed'>
        Indica cómo quieres que sea tu futuro compañero de piso. Para cada preferencia puedes indicar
        si es <span className='font-semibold text-violet-600'>preferente</span> (influye en el orden de resultados)
        u <span className='font-semibold text-amber-600'>obligatorio</span> (filtra grupos que no lo cumplan). * No es obligatorio rellenar todas las preferencias *
      </p>

      <Section title='Estilo de vida' accent='violet'>
        <CampoPref label='Ocupación del compañero' nameVal='pref_ocupacion' nameReq='pref_ocupacion_req' control={control}>
          <Controller name='pref_ocupacion' control={control} render={({ field }) => (
            <PillGroup etiqueta='Ocupación del compañero' value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'ESTUDIO',           label: 'Estudiante' },
                { value: 'TRABAJO',           label: 'Trabajador/a' },
                { value: 'ESTUDIO_Y_TRABAJO', label: 'Ambas' },
              ]}
            />
          )} />
        </CampoPref>

        <CampoPref label='Horario del compañero' nameVal='pref_horario' nameReq='pref_horario_req' control={control}>
          <Controller name='pref_horario' control={control} render={({ field }) => (
            <PillGroup etiqueta='Horario del compañero' value={field.value ?? ''} onChange={field.onChange} accent='violet'
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
            <PillGroup etiqueta='Ambiente en casa' value={field.value ?? ''} onChange={field.onChange} accent='violet'
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
            <PillGroup etiqueta='Visitas en casa' value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'CASI_NUNCA', label: 'Casi nunca' },
                { value: 'A_VECES',   label: 'A veces' },
                { value: 'FRECUENTE', label: 'Frecuente' },
              ]}
            />
          )} />
        </CampoPref>

        <CampoPref label='Limpieza y orden en casa' nameVal='pref_limpieza_orden' nameReq='pref_limpieza_orden_req' control={control}>
          <Controller name='pref_limpieza_orden' control={control} render={({ field }) => (
            <PillGroup etiqueta='Limpieza y orden en casa' value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'DESPREOCUPADO', label: 'Despreocupado' },
                { value: 'FLEXIBLE',      label: 'Flexible' },
                { value: 'ORDENADO',      label: 'Ordenado' },
              ]}
            />
          )} />
        </CampoPref>

        <CampoPref label='Nivel de ruido tolerable' nameVal='pref_nivel_ruido' nameReq='pref_nivel_ruido_req' control={control}>
          <Controller name='pref_nivel_ruido' control={control} render={({ field }) => (
            <PillGroup etiqueta='Nivel de ruido tolerable' value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'SILENCIO_TOTAL', label: 'Silencio total' },
                { value: 'MODERADO',       label: 'Moderado' },
                { value: 'ALTO',           label: 'Alto' },
              ]}
            />
          )} />
        </CampoPref>
      </Section>

      <Section title='Ocio' accent='violet'>
        <CampoPref label='Fiestas en casa' nameVal='pref_tolerancia_fiestas' nameReq='pref_tolerancia_fiestas_req' control={control}>
          <Controller name='pref_tolerancia_fiestas' control={control} render={({ field }) => (
            <PillGroup etiqueta='Fiestas en casa' value={field.value ?? ''} onChange={field.onChange} accent='violet'
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
        <CampoPref label='¿El grupo debe aceptar fumadores?' nameVal='pref_acepta_fumadores' nameReq='pref_acepta_fumadores_req' control={control}>
          <Controller name='pref_acepta_fumadores' control={control} render={({ field }) => (
            <PillGroup etiqueta='¿El grupo debe aceptar fumadores?' value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'SI',          label: 'Sí' },
                { value: 'NO',          label: 'No' },
                { value: 'INDIFERENTE', label: 'Indiferente' },
              ]}
            />
          )} />
        </CampoPref>

        <CampoPref label='¿El grupo debe aceptar mascotas?' nameVal='pref_acepta_mascotas' nameReq='pref_acepta_mascotas_req' control={control}>
          <Controller name='pref_acepta_mascotas' control={control} render={({ field }) => (
            <PillGroup etiqueta='¿El grupo debe aceptar mascotas?' value={field.value ?? ''} onChange={field.onChange} accent='violet'
              options={[
                { value: 'SI',      label: 'Sí' },
                { value: 'NO',      label: 'No' },
                { value: 'DEPENDE', label: 'Depende' },
              ]}
            />
          )} />
        </CampoPref>

      </Section>
    </div>
  )
}

// ─── Componente principal ───
function EditarUsuario() {
  const { user, recargarUsuario } = useAuth()
  const navigate = useNavigate()
  const [esPrimeraVez] = useState(() => user?.perfil_completo === false)
  const [step, setStep]               = useState(0)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]         = useState(true)
  const [fotos, setFotos] = useState([])
  const [idsOriginales, setIdsOriginales] = useState([])
  const [fotosReqError, setFotosReqError] = useState('')
  const [todosIntereses, setTodosIntereses]           = useState({})
  const [interesesSeleccionados, setInteresesSeleccionados] = useState(new Set())
  const [interesesReqError, setInteresesReqError] = useState('')

  const toggleInteres = (id) => {
    setInteresesReqError('')
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
      tolerancia_fiestas: '',
      fumador: null,
      tiene_mascotas: null,
      lgbtq_friendly: null,
      limpieza_orden: '', nivel_ruido: '',
      pref_ocupacion: '', pref_ocupacion_req: null,
      pref_horario: '', pref_horario_req: null,
      pref_frecuencia_visitas: '', pref_frecuencia_visitas_req: null,
      pref_ambiente: '', pref_ambiente_req: null,
      pref_tolerancia_fiestas: '', pref_tolerancia_fiestas_req: null,
      pref_acepta_fumadores: '', pref_acepta_fumadores_req: null,
      pref_acepta_mascotas: '', pref_acepta_mascotas_req: null,
      pref_lgbtq_friendly: null, pref_lgbtq_friendly_req: null,
      pref_limpieza_orden: '', pref_limpieza_orden_req: null,
      pref_nivel_ruido: '', pref_nivel_ruido_req: null,
    },
  })

  useEffect(() => {
    Promise.allSettled([
      apiFetch('/api/perfil/convivencia').then(r => r.json()),
      apiFetch('/api/perfil/intereses').then(r => r.json()),
      apiFetch('/api/perfil/mis-intereses').then(r => r.json()),
      apiFetch('/api/perfil/preferencias').then(r => r.json()),
      apiFetch('/api/perfil/fotos').then(r => r.json()),
    ]).then(([convRes, todosRes, misRes, prefRes, fotosRes]) => {
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
          fumador: perfil.fumador ?? null,
          tiene_mascotas: perfil.tiene_mascotas ?? null,
          lgbtq_friendly: perfil.lgbtq_friendly ?? null,
          limpieza_orden: perfil.limpieza_orden ?? '',
          nivel_ruido:    perfil.nivel_ruido    ?? '',
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
          pref_acepta_fumadores:        pref?.acepta_fumadores        ?? '',
          pref_acepta_fumadores_req:    pref?.acepta_fumadores_req    ?? null,
          pref_acepta_mascotas:         pref?.acepta_mascotas         ?? '',
          pref_acepta_mascotas_req:     pref?.acepta_mascotas_req     ?? null,
          pref_lgbtq_friendly:          pref?.lgbtq_friendly          ?? null,
          pref_lgbtq_friendly_req:      pref?.lgbtq_friendly_req      ?? null,
          pref_limpieza_orden:          pref?.limpieza_orden          ?? '',
          pref_limpieza_orden_req:      pref?.limpieza_orden_req      ?? null,
          pref_nivel_ruido:             pref?.nivel_ruido             ?? '',
          pref_nivel_ruido_req:         pref?.nivel_ruido_req         ?? null,
        })
      }
      if (todosRes.status === 'fulfilled') setTodosIntereses(todosRes.value.categorias ?? {})
      if (misRes.status   === 'fulfilled') setInteresesSeleccionados(new Set((misRes.value.intereses ?? []).map(i => i.id)))
      if (fotosRes.status === 'fulfilled') {
        const lista = fotosRes.value.fotos ?? []
        setFotos(lista.map(f => ({ id: f.id, url: f.url })))
        setIdsOriginales(lista.map(f => f.id))
      }  
    }).finally(() => setLoading(false))
  }, [])

  const addFotos = (files) => {
    setFotosReqError('')
    const imagenes = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, MAX_FOTOS_PERFIL - fotos.length)
    if (imagenes.length) setFotos(prev => [...prev, ...imagenes])
  }

  const removeFoto = (idx) => {
    setFotosReqError('')
    setFotos(prev => prev.filter((_, i) => i !== idx))
  }

  const next = async () => {
    let hayErrorManual = false
    if (step === 0) {
      if (fotos.length < MIN_FOTOS_PERFIL) {
        setFotosReqError(`Añade al menos ${MIN_FOTOS_PERFIL} fotos.`)
        hayErrorManual = true
      } else {
        setFotosReqError('')
      }
      if (interesesSeleccionados.size < 3) {
        setInteresesReqError('Selecciona al menos 3 intereses.')
        hayErrorManual = true
      } else {
        setInteresesReqError('')
      }
    }
    const ok = await trigger(STEP_FIELDS[step])
    if (ok && !hayErrorManual) { setStep(s => s + 1); setServerError(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }

  const onSubmit = async (data) => {
    setServerError('')

    const fecha_nacimiento = (data.dia && data.mes && data.anio)
      ? `${data.anio}-${data.mes.padStart(2, '0')}-${data.dia.padStart(2, '0')}`
      : null

    const payload = { fecha_nacimiento }
    for (const campo of PERFIL_FIELDS) payload[campo] = limpiar(data[campo])

    const payloadPref = {}
    for (const campo of PREF_FIELDS) {
      const valor = data[`pref_${campo}`]
      payloadPref[campo] = limpiar(valor)
      // La importancia solo tiene sentido si hay valor seleccionado
      payloadPref[`${campo}_req`] = tieneValor(valor) ? (data[`pref_${campo}_req`] ?? false) : false
    }

    try {
      const [res] = await Promise.all([
        apiFetch('/api/perfil/editar', { method: 'PUT', body: JSON.stringify(payload) }),
        apiFetch('/api/perfil/intereses', { method: 'PUT', body: JSON.stringify({ intereses: [...interesesSeleccionados] }) }),
        apiFetch('/api/perfil/preferencias', { method: 'PUT', body: JSON.stringify(payloadPref) }),
      ])
      const json = await res.json()
      if (!res.ok) return setServerError(json.message)

      const idsActuales = new Set(fotos.filter(f => !(f instanceof File)).map(f => f.id))
      for (const id of idsOriginales) {
        if (!idsActuales.has(id)) await apiFetch(`/api/perfil/fotos/${id}`, { method: 'DELETE' })
      }

      const nuevas = fotos.filter(f => f instanceof File)
      if (nuevas.length) {
        const fd = new FormData()
        nuevas.forEach(f => fd.append('fotos', f))
        await apiFetch('/api/perfil/fotos', { method: 'PUT', body: fd })
      }

      await recargarUsuario()
      navigate(esPrimeraVez ? '/buscar' : '/perfil/usuario')
    } catch {
      setServerError('Error de conexión con el servidor')
    }
  }

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center'
      style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: '#f8fafc' }}>
      <div role='status' aria-label='Cargando' className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
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
          className='cursor-pointer! flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 font-medium transition'>
          <ArrowLeft aria-hidden='true' size={15} /> Volver
        </button>
        <div className='h-4 w-px bg-slate-200' />
        <p className='text-sm font-semibold text-slate-700'>Editar perfil</p>
        <span className={`ml-auto font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full ${meta.iconBg} ${meta.color}`}>
          Paso {step + 1} de {STEPS.length}
        </span>
      </div>

      <div className='max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10'>

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
              <h1 className='font-display text-base font-bold text-slate-900'>Editar mi perfil: {STEPS[step]}</h1>
              <p className='text-xs text-slate-500 mt-0.5'>{meta.hint}</p>
            </div>
          </div>

          <form onSubmit={e => e.preventDefault()} className='p-6 flex flex-col gap-6'>
            {step === 0 && (
              <Paso1
                register={register} control={control}
                errors={errors} watch={watch}
                todosIntereses={todosIntereses}
                interesesSeleccionados={interesesSeleccionados}
                onToggleInteres={toggleInteres}
                fotos={fotos}
                onAddFotos={addFotos}
                onRemoveFoto={removeFoto}
                fotosReqError={fotosReqError}
                interesesReqError={interesesReqError}
              />
            )}
            {step === 1 && <Paso2 control={control} errors={errors} />}
            {step === 2 && <Paso3 control={control} />}

            {serverError && (
              <div role='alert' className='flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
                <AlertCircle aria-hidden='true' size={13} className='text-red-500 shrink-0' />
                <p className='text-xs text-red-700 font-medium'>{serverError}</p>
              </div>
            )}

            {step === 0 && (STEP_FIELDS[0].some(f => errors[f]) || fotosReqError || interesesReqError) && (
              <div role='alert' className='flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
                <AlertCircle aria-hidden='true' size={13} className='text-red-500 shrink-0' />
                <p className='text-xs text-red-700 font-medium'>Revisa los avisos de cada apartado antes de continuar.</p>
              </div>
            )}

            {step === 1 && STEP_FIELDS[1].some(f => errors[f]) && (
              <div role='alert' className='flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
                <AlertCircle aria-hidden='true' size={13} className='text-red-500 shrink-0' />
                <p className='text-xs text-red-700 font-medium'>Debes seleccionar una opción en todos los campos.</p>
              </div>
            )}

            <div className='flex items-center gap-3 pt-4 border-t border-slate-200'>
              {step > 0 && (
                <button type='button' onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className='cursor-pointer! flex items-center gap-1.5 border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-5 py-2.5 rounded-xl transition text-sm'>
                  <ChevronLeft aria-hidden='true' size={15} /> Anterior
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type='button' onClick={next}
                  className='cursor-pointer! ml-auto flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm shadow-sm'>
                  Siguiente <ChevronRight aria-hidden='true' size={15} />
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
    </div>
  )
}

export default EditarUsuario
