import { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronRight, ChevronLeft, Check, Home, Wifi, Wind,
  Flame, Car, Trees, AlertCircle, ArrowLeft, WashingMachine,
  MapPin, Euro, Bed, Ruler, Building2, Layers, MoveUp, Megaphone,
  FileText, SlidersHorizontal, Phone, MessageCircle, PhoneCall,
  ImagePlus, TriangleAlert, X, Star,
} from 'lucide-react'
import {
  IconInput, baseCls, textareaCls,
  Label, FieldError, Section, PillGroup, StepBar,
} from '../components/FormPrimitivos'

// ── Schema ────────────────────────────────────────────────────────
const schema = z.object({
  titulo:               z.string().min(5, 'Mínimo 5 caracteres').max(255),
  descripcion:          z.string().min(10, 'Mínimo 10 caracteres').max(500, 'Máximo 500 caracteres'),
  ciudad:               z.string().min(2, 'La ciudad es obligatoria'),
  direccion:            z.string().optional(),
  latitud:              z.number().nullable().optional(),
  longitud:             z.number().nullable().optional(),
  precio:               z.coerce.number({ invalid_type_error: 'Introduce un precio válido' }).positive('El precio debe ser positivo'),
  habitaciones_libres:  z.coerce.number().int().min(1, 'Mínimo 1'),
  tipo_piso:            z.string().optional(),
  habitaciones_totales: z.coerce.number().int().positive().optional().or(z.literal('')),
  tamano_piso:          z.coerce.number().positive().optional().or(z.literal('')),
  planta:               z.coerce.number().int().optional().or(z.literal('')),
  ascensor:             z.boolean().default(false),
  wifi:                 z.boolean().default(false),
  lavadora:             z.boolean().default(false),
  lavavajillas:         z.boolean().default(false),
  aire_acondicionado:   z.boolean().default(false),
  calefaccion:          z.boolean().default(false),
  parking:              z.boolean().default(false),
  terraza:              z.boolean().default(false),
  amueblado:            z.boolean().default(false),
  permite_fumar:        z.boolean().default(false),
  permite_mascotas:     z.boolean().default(false),
  genero_preferido:     z.string().optional(),
  modo_contacto:        z.enum(['CHAT', 'TELEFONO', 'AMBOS']).default('CHAT'),
  telefono_contacto:    z.string().max(20).optional(),
  visible:              z.boolean().default(true),
}).superRefine((data, ctx) => {
  if ((data.modo_contacto === 'TELEFONO' || data.modo_contacto === 'AMBOS') && !data.telefono_contacto?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El teléfono es obligatorio para este modo de contacto', path: ['telefono_contacto'] })
  }
})

const STEPS = ['Información general', 'Detalles', 'Fotos']
const STEP_FIELDS = [
  ['titulo', 'descripcion', 'ciudad', 'precio', 'habitaciones_libres', 'modo_contacto', 'telefono_contacto'],
  ['tipo_piso', 'habitaciones_totales', 'tamano_piso', 'planta', 'ascensor',
   'wifi', 'lavadora', 'lavavajillas', 'aire_acondicionado', 'calefaccion', 'parking', 'terraza', 'amueblado',
   'permite_fumar', 'permite_mascotas', 'genero_preferido'],
  [],
]

const STEP_META = [
  {
    icon: FileText,
    color: 'text-emerald-600', iconBg: 'bg-emerald-100',
    ring: 'ring-emerald-200',
    borderLeft: 'border-l-emerald-400',
    headerBg: 'bg-emerald-50', headerBorder: 'border-emerald-100',
    hint: 'Título, descripción, ubicación y contacto.',
  },
  {
    icon: SlidersHorizontal,
    color: 'text-blue-600', iconBg: 'bg-blue-100',
    ring: 'ring-blue-200',
    borderLeft: 'border-l-blue-400',
    headerBg: 'bg-blue-50', headerBorder: 'border-blue-100',
    hint: 'Características, comodidades y restricciones.',
  },
  {
    icon: ImagePlus,
    color: 'text-rose-600', iconBg: 'bg-rose-100',
    ring: 'ring-rose-200',
    borderLeft: 'border-l-rose-400',
    headerBg: 'bg-rose-50', headerBorder: 'border-rose-100',
    hint: 'Añade fotos para que el anuncio destaque.',
  },
]

const MAX_FOTOS = 10

function YesNo({ value, onChange }) {
  return (
    <div className='flex gap-2'>
      {[{ v: true, l: 'Sí' }, { v: false, l: 'No' }].map(({ v, l }) => (
        <button key={l} type='button' onClick={() => onChange(v)}
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

// ── Dirección con Google Places Autocomplete ──────────────────────
function DireccionAutocomplete({ setValue, defaultValue = '' }) {
  const inputRef = useRef(null)
  const acRef    = useRef(null)
  const [texto, setTexto] = useState(defaultValue)

  // Sincroniza si el formulario se resetea con datos de una publicación existente
  useEffect(() => { setTexto(defaultValue) }, [defaultValue])

  useEffect(() => {
    function initAutocomplete() {
      if (!inputRef.current || !window.google?.maps?.places) return
      acRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'es' },
        fields: ['formatted_address', 'geometry', 'address_components'],
      })
      acRef.current.addListener('place_changed', () => {
        const place = acRef.current.getPlace()
        if (!place?.geometry) return

        const direccion = place.formatted_address
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()

        // Extrae la ciudad de los componentes de la dirección
        const ciudadComp = place.address_components?.find(c =>
          c.types.includes('locality') || c.types.includes('administrative_area_level_2')
        )

        setTexto(direccion)
        setValue('direccion', direccion, { shouldValidate: true })
        setValue('latitud', lat)
        setValue('longitud', lng)
        if (ciudadComp?.long_name) setValue('ciudad', ciudadComp.long_name, { shouldValidate: true })
      })
    }

    if (window.google?.maps?.places) {
      initAutocomplete()
      return
    }

    if (!document.querySelector('script[data-places]')) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_KEY}&libraries=places&language=es&region=ES&loading=async`
      script.async = true
      script.dataset.places = '1'
      script.onload = initAutocomplete
      document.head.appendChild(script)
    } else {
      document.querySelector('script[data-places]').addEventListener('load', initAutocomplete)
    }
  }, [setValue])

  return (
    <IconInput icon={MapPin} error={false}>
      <input
        ref={inputRef}
        type='text'
        value={texto}
        onChange={e => {
          setTexto(e.target.value)
          setValue('direccion', e.target.value)
          // Si el usuario edita manualmente, borra las coordenadas anteriores
          setValue('latitud', null)
          setValue('longitud', null)
        }}
        className={baseCls(false)}
        placeholder='Calle Mayor, 10, Madrid'
      />
    </IconInput>
  )
}

// ── Paso 1 — Información general ──────────────────────────────────
const MODO_CONTACTO_OPTIONS = [
  { value: 'CHAT',     label: 'Solo por chat',     desc: 'Los interesados te escriben desde la app', icon: MessageCircle },
  { value: 'TELEFONO', label: 'Solo por teléfono', desc: 'Comparte tu número directamente',           icon: Phone },
  { value: 'AMBOS',    label: 'Chat y teléfono',   desc: 'Cualquiera de las dos vías',                icon: PhoneCall },
]

function Paso1({ register, errors, descLength, control, watch, setValue }) {
  const modoContacto = watch('modo_contacto')
  return (
    <div className='flex flex-col gap-6'>
      <Section title='Sobre el anuncio' accent='emerald'>
        <div>
          <Label required>Título del anuncio</Label>
          <IconInput icon={Megaphone} error={errors.titulo}>
            <input {...register('titulo')} className={baseCls(errors.titulo)}
              placeholder='Piso luminoso en el centro de Madrid' />
          </IconInput>
          <FieldError message={errors.titulo?.message} />
        </div>

        <div>
          <Label required>Descripción</Label>
          <textarea {...register('descripcion')} rows={4} maxLength={500}
            className={textareaCls(errors.descripcion)}
            placeholder='Describe el piso, su entorno, qué lo hace especial para vivir...' />
          <div className='flex justify-between items-center mt-1'>
            {errors.descripcion ? <FieldError message={errors.descripcion?.message} /> : <span />}
            <p className={`text-[11px] ml-auto tabular-nums ${descLength >= 500 ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
              {500 - descLength} restantes
            </p>
          </div>
          
        </div>
                  <div className='flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 mb-2'>
            <TriangleAlert size={13} className='text-amber-500 shrink-0 mt-0.5' />
            <p className='text-[11px] text-amber-700 leading-relaxed'>
              Los comentarios machistas, homófobos o discriminatorios de cualquier tipo serán motivo de eliminación inmediata del anuncio.
            </p>
          </div>
      </Section>

      <Section title='Ubicación y precio' accent='emerald'>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <Label required>Ciudad</Label>
            <IconInput icon={MapPin} error={errors.ciudad}>
              <input {...register('ciudad')} className={baseCls(errors.ciudad)} placeholder='Madrid' />
            </IconInput>
            <FieldError message={errors.ciudad?.message} />
          </div>
          <div>
            <Label>Dirección</Label>
            <DireccionAutocomplete setValue={setValue} defaultValue={watch('direccion') ?? ''} />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <Label required>Precio mensual</Label>
            <IconInput icon={Euro} error={errors.precio}>
              <input {...register('precio')} type='number' min='1' step='0.01'
                className={baseCls(errors.precio)} placeholder='450' />
            </IconInput>
            <FieldError message={errors.precio?.message} />
          </div>
          <div>
            <Label required>Habitaciones disponibles</Label>
            <IconInput icon={Bed} error={errors.habitaciones_libres}>
              <input {...register('habitaciones_libres')} type='number' min='1'
                className={baseCls(errors.habitaciones_libres)} placeholder='1' />
            </IconInput>
            <FieldError message={errors.habitaciones_libres?.message} />
          </div>
        </div>
      </Section>

      <Section title='Contacto' accent='emerald'>
        <div>
          <Label required>¿Cómo pueden contactarte los interesados?</Label>
          <div className='flex flex-col gap-2'>
            {MODO_CONTACTO_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
              <Controller key={value} name='modo_contacto' control={control} render={({ field }) => (
                <button type='button' onClick={() => field.onChange(value)}
                  className={`cursor-pointer! flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    field.value === value
                      ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    field.value === value ? 'bg-white/20' : 'bg-slate-100'
                  }`}>
                    <Icon size={15} className={field.value === value ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className={`text-sm font-semibold ${field.value === value ? 'text-white' : 'text-slate-700'}`}>{label}</p>
                    <p className={`text-[11px] ${field.value === value ? 'text-emerald-100' : 'text-slate-400'}`}>{desc}</p>
                  </div>
                  {field.value === value && <Check size={15} className='text-white shrink-0' />}
                </button>
              )} />
            ))}
          </div>
        </div>
        {(modoContacto === 'TELEFONO' || modoContacto === 'AMBOS') && (
          <div>
            <Label required>Número de teléfono</Label>
            <IconInput icon={Phone} error={errors.telefono_contacto}>
              <input {...register('telefono_contacto')} type='tel'
                className={baseCls(errors.telefono_contacto)} placeholder='+34 600 000 000' />
            </IconInput>
            <FieldError message={errors.telefono_contacto?.message} />
          </div>
        )}
      </Section>

      <Section title='Visibilidad' accent='emerald'>
        <Controller name='visible' control={control} render={({ field }) => (
          <div className='flex flex-col gap-3'>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => field.onChange(true)}
                className={`cursor-pointer! flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  field.value
                    ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${field.value ? 'bg-white' : 'bg-emerald-400'}`} />
                <div>
                  <p className={`text-sm font-semibold ${field.value ? 'text-white' : 'text-slate-700'}`}>Publicado</p>
                  <p className={`text-[11px] ${field.value ? 'text-emerald-100' : 'text-slate-400'}`}>Aparece en los resultados de búsqueda</p>
                </div>
                {field.value && <Check size={15} className='text-white ml-auto shrink-0' />}
              </button>
              <button
                type='button'
                onClick={() => field.onChange(false)}
                className={`cursor-pointer! flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  !field.value
                    ? 'bg-slate-700 border-slate-700 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${!field.value ? 'bg-slate-400' : 'bg-slate-300'}`} />
                <div>
                  <p className={`text-sm font-semibold ${!field.value ? 'text-white' : 'text-slate-700'}`}>Borrador</p>
                  <p className={`text-[11px] ${!field.value ? 'text-slate-400' : 'text-slate-400'}`}>No aparece en búsquedas, solo tú lo ves</p>
                </div>
                {!field.value && <Check size={15} className='text-white ml-auto shrink-0' />}
              </button>
            </div>
          </div>
        )} />
      </Section>
    </div>
  )
}

// ── Paso 2 — Detalles ─────────────────────────────────────────────
const COMODIDADES = [
  { name: 'wifi',               label: 'Wifi',         icon: Wifi },
  { name: 'lavadora',           label: 'Lavadora',     icon: WashingMachine },
  { name: 'lavavajillas',       label: 'Lavavajillas', icon: WashingMachine },
  { name: 'aire_acondicionado', label: 'Aire acond.',  icon: Wind },
  { name: 'calefaccion',        label: 'Calefacción',  icon: Flame },
  { name: 'parking',            label: 'Parking',      icon: Car },
  { name: 'terraza',            label: 'Terraza',      icon: Trees },
  { name: 'amueblado',          label: 'Amueblado',    icon: Home },
]

function Paso2({ register, errors, control, watch }) {
  const selected = COMODIDADES.filter(c => watch(c.name)).length
  return (
    <div className='flex flex-col gap-6'>
      <Section title='Tipo de vivienda' accent='blue'>
        <Controller name='tipo_piso' control={control} render={({ field }) => (
          <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
            options={[
              { value: 'PISO',    label: 'Piso' },
              { value: 'CASA',    label: 'Casa' },
              { value: 'ESTUDIO', label: 'Estudio' },
              { value: 'ATICO',   label: 'Ático' },
              { value: 'DUPLEX',  label: 'Dúplex' },
            ]}
          />
        )} />
      </Section>

      <Section title='Dimensiones' accent='blue'>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <Label>Habitaciones totales</Label>
            <IconInput icon={Layers} error={errors.habitaciones_totales}>
              <input {...register('habitaciones_totales')} type='number' min='1'
                className={baseCls(errors.habitaciones_totales)} placeholder='3' />
            </IconInput>
            <FieldError message={errors.habitaciones_totales?.message} />
          </div>
          <div>
            <Label>Tamaño (m²)</Label>
            <IconInput icon={Ruler} error={errors.tamano_piso}>
              <input {...register('tamano_piso')} type='number' min='1'
                className={baseCls(errors.tamano_piso)} placeholder='80' />
            </IconInput>
            <FieldError message={errors.tamano_piso?.message} />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <Label>Planta</Label>
            <IconInput icon={MoveUp} error={errors.planta}>
              <input {...register('planta')} type='number' min='0'
                className={baseCls(errors.planta)} placeholder='2' />
            </IconInput>
            <FieldError message={errors.planta?.message} />
          </div>
          <div>
            <Label>Ascensor</Label>
            <Controller name='ascensor' control={control} render={({ field }) => (
              <YesNo value={field.value} onChange={field.onChange} />
            )} />
          </div>
        </div>
      </Section>

      <Section title='Comodidades' accent='blue'>
        <div className='flex items-center justify-between mb-1'>
          <p className='text-xs text-slate-400'>Selecciona todo lo que incluye el piso.</p>
          {selected > 0 && (
            <span className='text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full'>
              {selected} seleccionada{selected !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className='grid grid-cols-4 gap-2.5'>
          {COMODIDADES.map(({ name, label, icon: Icon }) => (
            <Controller key={name} name={name} control={control} render={({ field }) => (
              <button type='button' onClick={() => field.onChange(!field.value)}
                className={`cursor-pointer! relative flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 text-center transition-all select-none ${
                  field.value
                    ? 'bg-blue-500 border-blue-500 shadow-md shadow-blue-200/60 text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                }`}>
                {field.value && (
                  <span className='absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center'>
                    <Check size={9} className='text-white' />
                  </span>
                )}
                <Icon size={22} />
                <span className='text-[11px] font-semibold leading-tight'>{label}</span>
              </button>
            )} />
          ))}
        </div>
      </Section>

      <Section title='Restricciones' accent='blue'>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <Label>¿Se puede fumar?</Label>
            <Controller name='permite_fumar' control={control} render={({ field }) => (
              <YesNo value={field.value} onChange={field.onChange} />
            )} />
          </div>
          <div>
            <Label>¿Se aceptan mascotas?</Label>
            <Controller name='permite_mascotas' control={control} render={({ field }) => (
              <YesNo value={field.value} onChange={field.onChange} />
            )} />
          </div>
        </div>
        <div>
          <Label>¿Quién puede solicitar la habitación?</Label>
          <p className='text-xs text-slate-400 mb-2.5'>Si no seleccionas nada, cualquiera puede solicitarla.</p>
          <Controller name='genero_preferido' control={control} render={({ field }) => (
            <PillGroup value={field.value ?? ''} onChange={field.onChange} accent='blue'
              options={[
                { value: 'CHICOS', label: 'Solo chicos' },
                { value: 'CHICAS', label: 'Solo chicas' },
              ]}
            />
          )} />
        </div>
      </Section>
    </div>
  )
}

// ── Paso 3 — Fotos ────────────────────────────────────────────────
function Paso3({ fotosExistentes, onDeleteExistente, fotosNuevas, setFotosNuevas }) {
  const inputRef  = useRef(null)
  const [dragging, setDragging] = useState(false)
  const total = fotosExistentes.length + fotosNuevas.length

  const addFiles = (files) => {
    const imgs = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, MAX_FOTOS - total)
    if (!imgs.length) return
    setFotosNuevas(prev => [...prev, ...imgs].slice(0, MAX_FOTOS - fotosExistentes.length))
  }

  const removeNueva = (i) => setFotosNuevas(prev => prev.filter((_, idx) => idx !== i))

  return (
    <div className='flex flex-col gap-5'>
      <p className='text-sm text-slate-500 leading-relaxed'>
        Las fotos son opcionales pero aumentan el interés del anuncio.
        Puedes añadir hasta <span className='font-semibold text-slate-700'>{MAX_FOTOS} imágenes</span>.
        La primera será la portada.
      </p>

      {/* Grid de fotos */}
      {total > 0 && (
        <div className='grid grid-cols-3 gap-2.5'>
          {fotosExistentes.map((foto, i) => (
            <div key={foto.id} className='relative aspect-video rounded-xl overflow-hidden bg-slate-100 group'>
              <img src={foto.url} alt='' className='w-full h-full object-cover' />
              {i === 0 && (
                <span className='absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm'>
                  <Star size={9} className='fill-current' /> Portada
                </span>
              )}
              <button type='button' onClick={() => onDeleteExistente(foto.id)}
                className='cursor-pointer! absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                <X size={11} className='text-white' />
              </button>
            </div>
          ))}
          {fotosNuevas.map((file, i) => (
            <div key={i} className='relative aspect-video rounded-xl overflow-hidden bg-slate-100 group'>
              <img src={URL.createObjectURL(file)} alt='' className='w-full h-full object-cover' />
              {fotosExistentes.length === 0 && i === 0 && (
                <span className='absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm'>
                  <Star size={9} className='fill-current' /> Portada
                </span>
              )}
              <div className='absolute top-1.5 left-1.5 bg-rose-500/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md'>
                Nueva
              </div>
              <button type='button' onClick={() => removeNueva(i)}
                className='cursor-pointer! absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                <X size={11} className='text-white' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {total < MAX_FOTOS && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer! border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all ${
            dragging
              ? 'border-rose-400 bg-rose-50'
              : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50/40'
          }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            dragging ? 'bg-rose-200' : 'bg-rose-100'
          }`}>
            <ImagePlus size={22} className='text-rose-500' />
          </div>
          <div className='text-center'>
            <p className='text-sm font-semibold text-slate-700'>Arrastra fotos aquí o haz clic para seleccionar</p>
            <p className='text-xs text-slate-400 mt-0.5'>
              {MAX_FOTOS - total} foto{MAX_FOTOS - total !== 1 ? 's' : ''} más disponible{MAX_FOTOS - total !== 1 ? 's' : ''} · JPG, PNG, WEBP
            </p>
          </div>
          <input ref={inputRef} type='file' multiple accept='image/*' className='hidden'
            onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
        </div>
      )}

      {total === MAX_FOTOS && (
        <p className='text-xs text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl py-2.5'>
          Has alcanzado el límite de {MAX_FOTOS} fotos. Elimina alguna para añadir otra.
        </p>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────
function PublicacionFormPage() {
  const navigate = useNavigate()
  const [step, setStep]                     = useState(0)
  const [serverError, setServerError]       = useState('')
  const [publicacion, setPublicacion]       = useState(undefined)
  const [fotosExistentes, setFotosExistentes] = useState([])   // [{ id, url, orden }]
  const [fotosNuevas, setFotosNuevas]       = useState([])     // File[]

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/grupos/publicacion`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setPublicacion(d.publicacion ?? null)
        setFotosExistentes(d.fotos ?? [])
      })
      .catch(() => setPublicacion(null))
  }, [])

  const defaults = (pub) => pub ? {
    titulo:               pub.titulo ?? '',
    descripcion:          pub.descripcion ?? '',
    ciudad:               pub.ciudad ?? '',
    direccion:            pub.direccion ?? '',
    latitud:              pub.latitud ?? null,
    longitud:             pub.longitud ?? null,
    precio:               pub.precio ?? '',
    habitaciones_libres:  pub.habitaciones_libres ?? 1,
    tipo_piso:            pub.tipo_piso ?? '',
    habitaciones_totales: pub.habitaciones_totales ?? '',
    tamano_piso:          pub.tamano_piso ?? '',
    planta:               pub.planta ?? '',
    ascensor:             pub.ascensor ?? false,
    wifi:                 pub.wifi ?? false,
    lavadora:             pub.lavadora ?? false,
    lavavajillas:         pub.lavavajillas ?? false,
    aire_acondicionado:   pub.aire_acondicionado ?? false,
    calefaccion:          pub.calefaccion ?? false,
    parking:              pub.parking ?? false,
    terraza:              pub.terraza ?? false,
    amueblado:            pub.amueblado ?? false,
    permite_fumar:        pub.permite_fumar ?? false,
    permite_mascotas:     pub.permite_mascotas ?? false,
    genero_preferido:     pub.genero_preferido ?? '',
    modo_contacto:        pub.modo_contacto ?? 'CHAT',
    telefono_contacto:    pub.telefono_contacto ?? '',
    visible:              pub.visible ?? true,
  } : {
    titulo: '', descripcion: '', ciudad: '', direccion: '', latitud: null, longitud: null, precio: '',
    habitaciones_libres: 1, tipo_piso: '', habitaciones_totales: '',
    tamano_piso: '', planta: '', ascensor: false,
    wifi: false, lavadora: false, lavavajillas: false, aire_acondicionado: false,
    calefaccion: false, parking: false, terraza: false, amueblado: false,
    permite_fumar: false, permite_mascotas: false,
    genero_preferido: '', modo_contacto: 'CHAT', telefono_contacto: '',
    visible: true,
  }

  const { register, control, handleSubmit, trigger, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults(null),
    mode: 'onTouched',
  })

  useEffect(() => {
    if (publicacion !== undefined) reset(defaults(publicacion))
  }, [publicacion])

  const next = async () => {
    const ok = await trigger(STEP_FIELDS[step])
    if (ok) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }

  const handleDeleteExistente = async (fotoId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/grupos/publicacion/fotos/${fotoId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) setFotosExistentes(prev => prev.filter(f => f.id !== fotoId))
    } catch { /* silencioso */ }
  }

  const onSubmit = async (data) => {
    setServerError('')
    const payload = {
      ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])),
    }
    try {
      // 1. Guardar datos de la publicación
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/grupos/publicacion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) return setServerError(json.message ?? 'Error al guardar')

      // 2. Subir fotos nuevas si las hay
      if (fotosNuevas.length > 0) {
        const formData = new FormData()
        fotosNuevas.forEach(f => formData.append('fotos', f))
        const fotosRes = await fetch(`${import.meta.env.VITE_API_URL}/api/grupos/publicacion/fotos`, {
          method: 'PUT',
          credentials: 'include',
          body: formData,
        })
        if (!fotosRes.ok) {
          const fj = await fotosRes.json()
          return setServerError(fj.message ?? 'Error al subir las fotos')
        }
      }

      navigate('/grupo/publicacion')
    } catch {
      setServerError('Error de conexión con el servidor')
    }
  }

  if (publicacion === undefined) {
    return (
      <div className='min-h-screen flex items-center justify-center'
        style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: '#f8fafc' }}>
        <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  const meta     = STEP_META[step]
  const StepIcon = meta.icon

  return (
    <div className='min-h-screen'
      style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: '#f8fafc' }}>

      {/* Cabecera */}
      <div className='sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3.5 flex items-center gap-4'>
        <button type='button' onClick={() => navigate('/grupo/publicacion')}
          className='cursor-pointer! flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 font-medium transition'>
          <ArrowLeft size={15} /> Volver
        </button>
        <div className='h-4 w-px bg-slate-200' />
        <p className='text-sm font-semibold text-slate-700'>
          {publicacion ? 'Editar publicación' : 'Crear publicación'}
        </p>
        <span className={`ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full ${meta.iconBg} ${meta.color}`}>
          Paso {step + 1} de {STEPS.length}
        </span>
      </div>

      <div className='max-w-2xl mx-auto px-6 py-10'>
        <StepBar current={step} steps={STEPS} stepMeta={STEP_META} />

        <form onSubmit={handleSubmit(onSubmit)} className='mt-8 flex flex-col gap-7'>
          {step === 0 && <Paso1 register={register} errors={errors} descLength={(watch('descripcion') ?? '').length} control={control} watch={watch} setValue={setValue} />}
          {step === 1 && <Paso2 register={register} errors={errors} control={control} watch={watch} />}
          {step === 2 && (
            <Paso3
              fotosExistentes={fotosExistentes}
              onDeleteExistente={handleDeleteExistente}
              fotosNuevas={fotosNuevas}
              setFotosNuevas={setFotosNuevas}
            />
          )}

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
              <button key='siguiente' type='button' onClick={next}
                className='cursor-pointer! ml-auto flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm shadow-sm'>
                Siguiente <ChevronRight size={15} />
              </button>
            ) : (
              <button key='publicar' type='submit' disabled={isSubmitting}
                className='cursor-pointer! ml-auto flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-semibold px-7 py-2.5 rounded-xl transition text-sm shadow-sm shadow-emerald-200'>
                {isSubmitting
                  ? (fotosNuevas.length > 0 ? 'Subiendo fotos...' : 'Guardando...')
                  : (publicacion ? 'Guardar cambios' : 'Publicar anuncio')
                }
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default PublicacionFormPage
