import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../lib/apiFetch'
import LoginModal from '../components/LoginModal.jsx'
import RegistroModal from '../components/RegistroModal.jsx'
import PieDePagina from '../components/PieDePagina.jsx'
import {
  Search, MapPin, Euro, Bed, Wifi, Car, PawPrint, Home, House, Receipt,
  ChevronLeft, ChevronRight, X, ImageOff,
  Ruler, Building2, Heart, MessageCircle, Check, SlidersHorizontal,
  Phone, Users, Sparkles, ArrowRight,
} from 'lucide-react'
import { SaltarAlContenido } from '../components/Accesibilidad.jsx'
import { useModalAccesible } from '../lib/useModalAccesible.js'

const ESMERALDA = '#10b981'

const TIPOS_PISO = [
  { value: 'PISO',    label: 'Piso' },
  { value: 'CASA',    label: 'Casa' },
  { value: 'ESTUDIO', label: 'Estudio' },
  { value: 'ATICO',   label: 'Ático' },
  { value: 'DUPLEX',  label: 'Dúplex' },
]

const HAB_OPTIONS = ['1', '2', '3', '4']

// ── Chip ──────────────────────────────────────────────────────────
function Chip({ icon: Icon, label, accent }) {
  return (
    <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
      accent
        ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
        : 'text-slate-500 bg-slate-50 border-slate-100'
    }`}>
      <Icon aria-hidden='true' size={9} /> {label}
    </span>
  )
}

// ── Carrusel de fotos ─────────────────────────────────────────────
function FotoCarrusel({ fotos, titulo, publicacionId, user, esFavorito, onToggleFavorito }) {
  const [idx, setIdx] = useState(0)
  const [guardando, setGuardando] = useState(false)
  const total = fotos?.length ?? 0

  const prev = (e) => { e.stopPropagation(); setIdx(i => Math.max(0, i - 1)) }
  const next = (e) => { e.stopPropagation(); setIdx(i => Math.min(total - 1, i + 1)) }

  const toggleFav = async (e) => {
    e.stopPropagation()
    if (!user || guardando) return
    setGuardando(true)
    try {
      const res = await apiFetch(`/api/favoritos/${publicacionId}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) onToggleFavorito(publicacionId, data.guardado)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className='relative w-full h-full bg-slate-100 overflow-hidden'>
      {total > 0
        ? <img src={fotos[idx]} alt={titulo} className='w-full h-full object-cover' />
        : <div className='w-full h-full flex items-center justify-center'><ImageOff aria-hidden='true' size={28} className='text-slate-500' /></div>
      }

      {/* Botón favorito — esquina superior izquierda */}
      <button
        type='button'
        onClick={toggleFav}
        disabled={guardando}
        className='cursor-pointer! absolute top-2 left-2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition disabled:opacity-60'
        aria-pressed={esFavorito}
        aria-label={esFavorito ? `Quitar ${titulo} de favoritos` : `Guardar ${titulo} en favoritos`}
      >
        <Heart aria-hidden='true'
          size={15}
          className={esFavorito ? 'text-red-500 fill-red-500' : 'text-slate-500'}
        />
      </button>

      {total > 1 && (
        <>
          <button
            type='button'
            aria-label='Foto anterior' onClick={prev}
            disabled={idx === 0}
            className='cursor-pointer! absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center disabled:opacity-0 transition'
          >
            <ChevronLeft aria-hidden='true' size={14} />
          </button>
          <button
            type='button'
            aria-label='Foto siguiente' onClick={next}
            disabled={idx === total - 1}
            className='cursor-pointer! absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center disabled:opacity-0 transition'
          >
            <ChevronRight aria-hidden='true' size={14} />
          </button>
          <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1'>
            {fotos.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Card publicación ───────────────────────────────────────────────
function PublicacionCard({ pub, user, esFavorito, onToggleFavorito, onRequireLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [enviando, setEnviando] = useState(false)
  const [enviado,  setEnviado]  = useState(false)

  const contactar = async (e) => {
    e.stopPropagation()
    if (!user) { onRequireLogin?.(); return }
    setEnviando(true)
    try {
      const res = await apiFetch(`/api/chats/solicitar/${pub.id}`, { method: 'POST' })
      if (res.ok) { setEnviado(true); return }
      const data = await res.json()
      if (data.yaEnviada) navigate('/perfil/chat')
    } catch {} finally { setEnviando(false) }
  }
  return (
    <div
      onClick={() => navigate(`/anuncio/${pub.id}`, { state: { busqueda: location.search } })}
      className='cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:bg-slate-50 transition-colors duration-150 group flex flex-col'
    >
      {/* Fila principal: foto + info */}
      <div className='flex flex-col sm:flex-row sm:h-52'>

        {/* Carrusel izquierda / arriba */}
        <div className='w-full h-48 sm:w-72 sm:h-full shrink-0'>
          <FotoCarrusel
            fotos={pub.fotos}
            titulo={pub.titulo}
            publicacionId={pub.id}
            user={user}
            esFavorito={esFavorito}
            onToggleFavorito={onToggleFavorito}
          />
        </div>

        {/* Info derecha / abajo */}
        <div className='flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between pb-1'>
          <div className='space-y-1.5'>
            <div className='flex items-start justify-between gap-2'>
              <h3 className='font-semibold text-slate-900 text-base leading-snug truncate hover:underline'>{pub.titulo}</h3>
            </div>

            <p className='font-mono text-2xl font-bold text-slate-900 tabular-nums leading-none'>
              {Number(pub.precio).toFixed(0)}<span className='text-sm font-normal text-slate-900 ml-1'>€/mes</span>
            </p>

            <p className='flex items-center gap-1.5 text-sm text-slate-900'>
              <MapPin aria-hidden='true' size={13} className='shrink-0 text-slate-900' />
              {pub.ciudad}
            </p>

            {pub.descripcion && (
              <p className='text-sm text-slate-600 leading-relaxed line-clamp-2'>{pub.descripcion}</p>
            )}

            {/* Grupo convivencia */}
            {pub.nombre_grupo && (
              <div className='flex items-center gap-2 min-w-0 pt-1'>
                {pub.foto_grupo
                  ? <img src={pub.foto_grupo} alt={pub.nombre_grupo} className='w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200' />
                  : <div className='w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center shrink-0'>
                      <span className='text-[0.65rem] font-bold text-white'>{pub.nombre_grupo[0]?.toUpperCase()}</span>
                    </div>
                }
                <span className='text-sm text-slate-900 font-medium truncate'>{pub.nombre_grupo}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: compatibilidad + botones */}
      <div
        className='flex flex-wrap items-center justify-between gap-y-2 px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/60'
        onClick={e => e.stopPropagation()}
      >
        {/* Compatibilidad + intereses en común */}
        <div className='flex flex-col gap-1'>
          {pub.compatibilidad !== null && pub.compatibilidad !== undefined && (
            <div className='text-xs font-semibold mb-0.5'>
              <span className={`flex items-center gap-1.5
                ${pub.compatibilidad >= 75 ? 'text-emerald-600'
                : pub.compatibilidad >= 50 ? 'text-amber-500'
                : 'text-slate-500'}`}>
                <span className={`w-2 h-2 rounded-full shrink-0
                  ${pub.compatibilidad >= 75 ? 'bg-emerald-400'
                  : pub.compatibilidad >= 50 ? 'bg-amber-400'
                  : 'bg-slate-300'}`} />
                {pub.compatibilidad}% de compatibilidad
              </span>
            </div>
          )}
          {pub.intereses_comunes?.length > 0 && (
            <div className='flex items-center gap-1.5 flex-wrap'>
              <span className='font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-600 shrink-0'>
                En común:
              </span>
              {pub.intereses_comunes.map(nombre => (
                <span key={nombre} className='inline-flex items-center gap-1 bg-emerald-200 text-emerald-900 text-[0.6875rem] font-medium px-2 py-0.5 rounded-full'>
                  <span className='w-1 h-1 rounded-full bg-emerald-400 shrink-0' />
                  {nombre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Botones de contacto */}
        <div className='flex items-center gap-2 shrink-0'>
          {pub.telefono_contacto && (
            <a
              href={`tel:${pub.telefono_contacto}`}
              onClick={e => e.stopPropagation()}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-slate-700 text-xs font-semibold transition'
            >
              <Phone aria-hidden='true' size={13} />
              Llamar
            </a>
          )}
          {enviado ? (
            <span className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl'>
              <Check aria-hidden='true' size={13} />
              Solicitud enviada
            </span>
          ) : (
            <button
              type='button'
              onClick={contactar}
              disabled={enviando}
              className='cursor-pointer! flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-semibold transition'
            >
              {enviando
                ? <span className='w-3 h-3 border border-white border-t-transparent rounded-full animate-spin' />
                : <MessageCircle aria-hidden='true' size={13} />
              }
              Contactar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Input ciudad con Google Places ────────────────────────────────
function InputCiudad({ value, onChange, onBuscar }) {
  const inputRef = useRef(null)
  const acRef    = useRef(null)

  useEffect(() => {
    function init() {
      if (!inputRef.current || !window.google?.maps?.places) return
      acRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        componentRestrictions: { country: 'es' },
        fields: ['name'],
      })
      acRef.current.addListener('place_changed', () => {
        const place = acRef.current.getPlace()
        if (place?.name) { onChange(place.name); onBuscar(place.name) }
      })
    }
    if (window.google?.maps?.places) { init(); return }
    if (!import.meta.env.VITE_GOOGLE_PLACES_KEY) return
    if (!document.querySelector('script[data-places]')) {
      const s = document.createElement('script')
      s.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_KEY}&libraries=places&language=es&region=ES&loading=async`
      s.async = true
      s.dataset.places = '1'
      s.onload = init
      document.head.appendChild(s)
    }
  }, [])

  return (
    <div className='flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition'>
      <MapPin aria-hidden='true' size={14} className='text-slate-500 shrink-0' />
      <input
        ref={inputRef}
        type='text'
        aria-label='Buscar por ciudad'
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onBuscar(value) }}
        placeholder='Ciudad...'
        className='flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-500 outline-none'
      />
      <button
        onClick={() => onBuscar(value)}
        aria-label='Buscar'
        className='cursor-pointer! shrink-0 w-7 h-7 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center transition'
      >
        <Search size={13} aria-hidden='true' className='text-white' />
      </button>
    </div>
  )
}

// ── Panel de filtros ───────────────────────────────────────────────
function FilterSection({ title, children }) {
  return (
    <div className='py-4 border-b border-emerald-500 last:border-0'>
      <p className='font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-100 mb-3'>{title}</p>
      {children}
    </div>
  )
}

function FilterPanelContent({
  precioMin, setPrecioMin,
  precioMax, setPrecioMax,
  habitacionesMin, setHabitacionesMin,
  tipoPiso, setTipoPiso,
  filtAmueblado, setFiltAmueblado,
  filtWifi, setFiltWifi,
  filtMascotas, setFiltMascotas,
  filtParking, setFiltParking,
  filtLavadora, setFiltLavadora,
  filtAC, setFiltAC,
  filtCalefaccion, setFiltCalefaccion,
  filtAscensor, setFiltAscensor,
  filtPermiteFumar, setFiltPermiteFumar,
  generoPref, setGeneroPref,
  filtIntereses, setFiltIntereses, todosIntereses,
  onAplicar, onLimpiar, filtrosActivos,
  onClose,
}) {
  const chipCls = (active) => `cursor-pointer! px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
    active
      ? 'bg-white border-white text-emerald-700'
      : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'
  }`

  return (
    <>
      <div className='flex items-center justify-between px-5 py-4 border-b border-emerald-500'>
        <h2 className='font-bold text-white text-sm'>Filtros</h2>
        <div className='flex items-center gap-2'>
          {filtrosActivos && (
            <button type='button' onClick={onLimpiar}
              className='cursor-pointer! flex items-center gap-1 text-xs text-emerald-100 hover:text-white transition'>
              <X aria-hidden='true' size={11} /> Limpiar
            </button>
          )}
          {onClose && (
            <button aria-label='Cerrar' type='button' onClick={onClose}
              className='cursor-pointer! p-1 text-emerald-100 hover:text-white transition'>
              <X aria-hidden='true' size={16} />
            </button>
          )}
        </div>
      </div>

      <div className='px-5'>
        {/* Precio */}
        <FilterSection title='Precio mensual (€)'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <input
                type='number' min='0' placeholder='Mín' aria-label='Precio mínimo en euros'
                value={precioMin}
                onChange={e => setPrecioMin(e.target.value)}
                className='w-full px-3 py-2.5 text-sm border border-white/20 rounded-xl bg-white/10 text-white placeholder:text-emerald-100 outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 focus:bg-white/20 transition'
              />
            </div>
            <span className='text-emerald-100 text-sm self-center'>—</span>
            <div className='relative flex-1'>
              <input
                type='number' min='0' placeholder='Máx' aria-label='Precio máximo en euros'
                value={precioMax}
                onChange={e => setPrecioMax(e.target.value)}
                className='w-full px-3 py-2.5 text-sm border border-white/20 rounded-xl bg-white/10 text-white placeholder:text-emerald-100 outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 focus:bg-white/20 transition'
              />
            </div>
          </div>
        </FilterSection>

        {/* Habitaciones libres */}
        <FilterSection title='Habitaciones libres (mín.)'>
          <div className='grid grid-cols-4 gap-1.5'>
            {HAB_OPTIONS.map(v => (
              <button key={v} type='button'
                onClick={() => setHabitacionesMin(habitacionesMin === v ? '' : v)}
                className={`cursor-pointer! py-2 rounded-xl text-sm font-semibold border transition ${
                  habitacionesMin === v
                    ? 'bg-white border-white text-emerald-700 shadow-sm'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'
                }`}>
                {v === '4' ? '4+' : v}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Tipo de vivienda */}
        <FilterSection title='Tipo de vivienda'>
          <div className='space-y-2.5'>
            {TIPOS_PISO.map(({ value, label }) => {
              const active = tipoPiso === value
              return (
                <button key={value} type='button'
                  aria-pressed={active}
                  onClick={() => setTipoPiso(active ? '' : value)}
                  className='cursor-pointer! w-full flex items-center gap-3 group'>
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${
                    active ? 'bg-white border-white' : 'border-white/30 group-hover:border-white/60'
                  }`}>
                    {active && <Check aria-hidden='true' size={10} className='text-emerald-600' />}
                  </span>
                  <span className='text-sm text-white text-left'>{label}</span>
                </button>
              )
            })}
          </div>
        </FilterSection>

        {/* Características */}
        <FilterSection title='Características'>
          <div className='flex flex-wrap gap-2'>
            {[
              { label: 'Wifi',             state: filtWifi,         set: setFiltWifi },
              { label: 'Amueblado',        state: filtAmueblado,    set: setFiltAmueblado },
              { label: 'Parking',          state: filtParking,      set: setFiltParking },
              { label: 'Mascotas',         state: filtMascotas,     set: setFiltMascotas },
              { label: 'Lavadora',         state: filtLavadora,     set: setFiltLavadora },
              { label: 'Aire acond.',      state: filtAC,           set: setFiltAC },
              { label: 'Calefacción',      state: filtCalefaccion,  set: setFiltCalefaccion },
              { label: 'Ascensor',         state: filtAscensor,     set: setFiltAscensor },
              { label: 'Se puede fumar',   state: filtPermiteFumar, set: setFiltPermiteFumar },
            ].map(({ label, state, set }) => (
              <button key={label} type='button' onClick={() => set(s => !s)} className={chipCls(state)}>
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Género preferido */}
        <FilterSection title='Género preferido'>
          <div className='flex gap-2'>
            {[
              { value: '',       label: 'Todos' },
              { value: 'MUJER',  label: 'Chicas' },
              { value: 'HOMBRE', label: 'Chicos' },
            ].map(({ value, label }) => (
              <button key={label} type='button'
                onClick={() => setGeneroPref(value)}
                className={`cursor-pointer! flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                  generoPref === value
                    ? 'bg-white border-white text-emerald-700'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Intereses */}
        {Object.keys(todosIntereses).length > 0 && (
          <FilterSection title='Intereses del grupo'>
            <div className='flex flex-col gap-3'>
              {Object.entries(todosIntereses).map(([categoria, lista]) => (
                <div key={categoria}>
                  <p className='text-[9px] font-bold uppercase tracking-widest text-emerald-100 mb-1.5'>{categoria}</p>
                  <div className='flex flex-wrap gap-1.5'>
                    {lista.map(({ id, nombre }) => {
                      const activo = filtIntereses.has(id)
                      return (
                        <button key={id} type='button'
                          onClick={() => setFiltIntereses(prev => {
                            const next = new Set(prev)
                            activo ? next.delete(id) : next.add(id)
                            return next
                          })}
                          className={`cursor-pointer! px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                            activo
                              ? 'bg-white border-white text-emerald-700'
                              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                          }`}>
                          {nombre}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </FilterSection>
        )}
      </div>

      <div className='px-5 pb-5 pt-3'>
        <button type='button' onClick={onAplicar}
          className='cursor-pointer! w-full bg-white hover:bg-emerald-50 text-emerald-700 text-sm font-bold py-3 rounded-xl transition shadow-sm'>
          Aplicar filtros
        </button>
      </div>
    </>
  )
}

function FilterAside({ mobileOpen, onMobileClose, ...filterProps }) {
  // El panel de filtros en móvil es un cajón modal: se comporta como diálogo
  // (foco atrapado, Escape cierra, el foco vuelve al botón "Filtros").
  // El hook también bloquea el scroll del fondo mientras está abierto.
  const refCajon = useModalAccesible(onMobileClose, mobileOpen)

  return (
    <>
      {/* Desktop — siempre visible */}
      <aside className='hidden md:block w-72 shrink-0'>
        <div className='bg-emerald-700 rounded-2xl border border-emerald-600 shadow-sm overflow-hidden'>
          <FilterPanelContent {...filterProps} />
        </div>
      </aside>

      {/* Mobile — drawer */}
      {mobileOpen && (
        <div className='fixed inset-0 z-50 md:hidden'>
          <div
            className='absolute inset-0 bg-black/40 backdrop-blur-sm'
            onClick={onMobileClose}
          />
          <div ref={refCajon} role='dialog' aria-modal='true' aria-label='Filtros de búsqueda' tabIndex={-1}
            className='absolute left-0 top-0 bottom-0 w-[min(20rem,100vw)] bg-emerald-700 overflow-y-auto shadow-2xl'>
            <FilterPanelContent {...filterProps} onClose={onMobileClose} />
          </div>
        </div>
      )}
    </>
  )
}

// ── Página ─────────────────────────────────────────────────────────
export default function BuscarPage() {
  const { user, tieneGrupo, cargando, recargarUsuario } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registroOpen, setRegistroOpen] = useState(false)

  const [ciudad, setCiudad]                         = useState(searchParams.get('ciudad') ?? '')
  const [ciudadBuscada, setCiudadBuscada]           = useState(searchParams.get('ciudad') ?? '')
  const [precioMin, setPrecioMin]                   = useState(searchParams.get('precio_min') ?? '')
  const [precioMax, setPrecioMax]                   = useState(searchParams.get('precio_max') ?? '')
  const [habitacionesMin, setHabitacionesMin]       = useState(searchParams.get('habitaciones_min') ?? '')
  const [tipoPiso, setTipoPiso]                     = useState(searchParams.get('tipo_piso') ?? '')
  const [filtAmueblado, setFiltAmueblado]           = useState(searchParams.get('amueblado') === 'true')
  const [filtWifi, setFiltWifi]                     = useState(searchParams.get('wifi') === 'true')
  const [filtMascotas, setFiltMascotas]             = useState(searchParams.get('mascotas') === 'true')
  const [filtParking, setFiltParking]               = useState(searchParams.get('parking') === 'true')
  const [filtLavadora, setFiltLavadora]             = useState(searchParams.get('lavadora') === 'true')
  const [filtAC, setFiltAC]                         = useState(searchParams.get('aire_acondicionado') === 'true')
  const [filtCalefaccion, setFiltCalefaccion]       = useState(searchParams.get('calefaccion') === 'true')
  const [filtAscensor, setFiltAscensor]             = useState(searchParams.get('ascensor') === 'true')
  const [filtPermiteFumar, setFiltPermiteFumar]     = useState(searchParams.get('permite_fumar') === 'true')
  const [generoPref, setGeneroPref]                 = useState(searchParams.get('genero_preferido') ?? '')
  const [page, setPage]                       = useState(parseInt(searchParams.get('page') ?? '1'))
  const [ordenar, setOrdenar]                 = useState(searchParams.get('ordenar') ?? 'recientes')

  const [resultados, setResultados] = useState([])
  const [total, setTotal]           = useState(0)
  const [paginas, setPaginas]       = useState(1)
  const [loading, setLoading]       = useState(false)
  const [cargandoInicial, setCargandoInicial] = useState(true)
  const [error, setError]           = useState(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [favoritosIds, setFavoritosIds] = useState(new Set())
  const [tienePerfilConvivencia, setTienePerfilConvivencia] = useState(null)
  const [filtIntereses, setFiltIntereses] = useState(() => {
    const param = searchParams.get('intereses')
    return param ? new Set(param.split(',').map(Number).filter(Boolean)) : new Set()
  })
  const [todosIntereses, setTodosIntereses] = useState({})

  const buildParams = (c, p, overrides = {}) => {
    const f = {
      precioMin, precioMax, habitacionesMin, tipoPiso,
      amueblado: filtAmueblado, wifi: filtWifi, mascotas: filtMascotas, parking: filtParking,
      lavadora: filtLavadora, ac: filtAC, calefaccion: filtCalefaccion,
      ascensor: filtAscensor, permiteFumar: filtPermiteFumar, generoPref,
      ordenar, filtIntereses,
      ...overrides,
    }
    const q = new URLSearchParams({ page: p })
    if (c)                 q.set('ciudad',             c)
    if (f.precioMin)       q.set('precio_min',         f.precioMin)
    if (f.precioMax)       q.set('precio_max',         f.precioMax)
    if (f.habitacionesMin) q.set('habitaciones_min',   f.habitacionesMin)
    if (f.tipoPiso)        q.set('tipo_piso',          f.tipoPiso)
    if (f.amueblado)       q.set('amueblado',          'true')
    if (f.wifi)            q.set('wifi',               'true')
    if (f.mascotas)        q.set('mascotas',           'true')
    if (f.parking)         q.set('parking',            'true')
    if (f.lavadora)        q.set('lavadora',           'true')
    if (f.ac)              q.set('aire_acondicionado', 'true')
    if (f.calefaccion)     q.set('calefaccion',        'true')
    if (f.ascensor)        q.set('ascensor',           'true')
    if (f.permiteFumar)    q.set('permite_fumar',      'true')
    if (f.generoPref)      q.set('genero_preferido',   f.generoPref)
    if (f.ordenar && f.ordenar !== 'recientes') q.set('ordenar', f.ordenar)
    if (f.filtIntereses?.size > 0) q.set('intereses', [...f.filtIntereses].join(','))
    return q
  }

  const buscar = async (c, p, overrides = {}) => {
    setLoading(true)
    setError(null)
    setCiudadBuscada(c)
    const q = buildParams(c, p, overrides)
    setSearchParams(Object.fromEntries(q), { replace: true })
    try {
      const res = await apiFetch(`/api/publicaciones?${q}`)
      const data = await res.json()
      if (!res.ok) { setError(data.message ?? 'Error al buscar'); return }
      setResultados(data.publicaciones)
      setTotal(data.total)
      setPaginas(data.paginas)
    } catch {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
      setCargandoInicial(false)
    }
  }

  useEffect(() => {
    buscar(ciudad, page)

    apiFetch('/api/perfil/intereses')
      .then(r => r.json())
      .then(d => { if (d.categorias) setTodosIntereses(d.categorias) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (cargando) return

    if (user) {
      apiFetch('/api/favoritos')
        .then(r => r.json())
        .then(d => { if (d.favoritos) setFavoritosIds(new Set(d.favoritos)) })
        .catch(() => {})

      apiFetch('/api/perfil/convivencia')
        .then(r => r.json())
        .then(d => {
          const p = d.perfil
          const tienePerf = !!(p && ['horario','ambiente','frecuencia_visitas','tolerancia_fiestas','ocupacion'].some(k => p[k] != null))
          setTienePerfilConvivencia(tienePerf)
          if (tienePerf && !searchParams.get('ordenar')) setOrdenar('compatibles')
        })
        .catch(() => setTienePerfilConvivencia(false))
    } else {
      setTienePerfilConvivencia(false)
    }
  }, [user, cargando])

  const handleCiudadBuscar = (c) => {
    setCiudad(c)
    setPage(1)
    buscar(c, 1)
  }

  const handleOrdenar = (valor) => {
    setOrdenar(valor)
    setPage(1)
    buscar(ciudad, 1, { ordenar: valor })
  }

  const aplicarFiltros = () => {
    setPage(1)
    buscar(ciudad, 1)
    setMobileFiltersOpen(false)
  }

  const limpiarFiltros = (yBuscar = false) => {
    setPrecioMin(''); setPrecioMax(''); setHabitacionesMin(''); setTipoPiso('')
    setFiltAmueblado(false); setFiltWifi(false); setFiltMascotas(false); setFiltParking(false)
    setFiltLavadora(false); setFiltAC(false); setFiltCalefaccion(false)
    setFiltAscensor(false); setFiltPermiteFumar(false); setGeneroPref('')
    setFiltIntereses(new Set())
    if (yBuscar) buscar(ciudad, 1, {
      precioMin: '', precioMax: '', habitacionesMin: '', tipoPiso: '',
      amueblado: false, wifi: false, mascotas: false, parking: false,
      lavadora: false, ac: false, calefaccion: false,
      ascensor: false, permiteFumar: false, generoPref: '',
      filtIntereses: new Set(),
    })
  }

  const cambiarPagina = (n) => {
    setPage(n)
    buscar(ciudad, n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFavorito = (publicacionId, guardado) => {
    setFavoritosIds(prev => {
      const next = new Set(prev)
      guardado ? next.add(publicacionId) : next.delete(publicacionId)
      return next
    })
  }

  const nFiltros = [precioMin, precioMax, habitacionesMin, tipoPiso, filtAmueblado, filtWifi, filtMascotas, filtParking, filtLavadora, filtAC, filtCalefaccion, filtAscensor, filtPermiteFumar, generoPref].filter(Boolean).length + filtIntereses.size
  const filtrosActivos = nFiltros > 0

  if (cargandoInicial) {
    return (
      <div className='min-h-screen bg-slate-200 flex items-center justify-center'>
        <div role='status' aria-label='Cargando' className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-200 overflow-x-hidden'>

      {/* ── Header ── */}
      <SaltarAlContenido />
      <header className='sticky top-0 z-30 bg-white border-b border-slate-200'>
        <div className='max-w-[80rem] mx-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-6 lg:px-10 py-2.5'>

          <button onClick={() => navigate('/')} className='cursor-pointer! shrink-0 flex items-center'>
            <span className='font-display text-xl sm:text-2xl font-bold -tracking-[0.02em] text-slate-900'>Housie</span>
          </button>

          <div className='flex-1 min-w-0 flex items-center gap-2 sm:max-w-[34rem] sm:mx-auto'>
            <InputCiudad value={ciudad} onChange={setCiudad} onBuscar={handleCiudadBuscar} />

            {/* Botón filtros — solo mobile */}
            <button
              type='button'
              onClick={() => setMobileFiltersOpen(true)}
              className='cursor-pointer! md:hidden relative shrink-0 p-2 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 transition'
            >
              <SlidersHorizontal aria-hidden='true' size={18} />
              {filtrosActivos && (
                <span className='absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center'>
                  {nFiltros}
                </span>
              )}
            </button>
          </div>

          {/* Nav usuario */}
          <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
            {user ? (
              <>
                {user.es_casero ? (
                  <button onClick={() => navigate('/casero/facturas')}
                    className='cursor-pointer! hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition'>
                    <Receipt aria-hidden='true' size={15} />
                    Mis facturas
                  </button>
                ) : tieneGrupo ? (
                  <button onClick={() => navigate('/grupo')} aria-label='Mi grupo'
                    className='cursor-pointer! hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-slate-600 hover:bg-slate-100 transition'>
                    <House aria-hidden='true' size={20} />
                  </button>
                ) : (
                  <>
                    <button onClick={() => navigate('/perfil/favoritos')} aria-label='Favoritos'
                      className='cursor-pointer! hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-slate-600 hover:bg-slate-100 transition'>
                      <Heart aria-hidden='true' size={20} />
                    </button>
                    <button onClick={() => navigate('/perfil/chat')} aria-label='Mensajes'
                      className='cursor-pointer! hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-slate-600 hover:bg-slate-100 transition'>
                      <MessageCircle aria-hidden='true' size={20} />
                    </button>
                  </>
                )}
                {user.foto_perfil
                  ? <img src={user.foto_perfil} alt={user.nombre}
                      className='hidden sm:block sm:w-10 sm:h-10 rounded-full object-cover cursor-pointer shrink-0'
                      onClick={() => navigate('/perfil/usuario')} />
                  : <button onClick={() => navigate('/perfil/usuario')}
                      className='cursor-pointer! hidden sm:flex sm:w-10 sm:h-10 rounded-full bg-emerald-100 items-center justify-center shrink-0'>
                      <span className='text-sm font-bold text-emerald-700'>{user.nombre?.[0]?.toUpperCase()}</span>
                    </button>
                }
              </>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className='cursor-pointer! hidden sm:block text-sm font-semibold text-slate-700 hover:text-slate-900 transition px-4 py-2 whitespace-nowrap'
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Layout principal ── */}
      <main id='contenido-principal' tabIndex={-1} className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-10'>
        {/* El título de la página es visualmente redundante con la cabecera de
            búsqueda, pero un lector de pantalla necesita el <h1> para situarse. */}
        <h1 className='sr-only'>Buscar piso compartido</h1>
        <div className='flex gap-6 pt-6 pb-10 items-start min-h-0'>

          {/* Aside filtros */}
          <FilterAside
            precioMin={precioMin}             setPrecioMin={setPrecioMin}
            precioMax={precioMax}             setPrecioMax={setPrecioMax}
            habitacionesMin={habitacionesMin} setHabitacionesMin={setHabitacionesMin}
            tipoPiso={tipoPiso}               setTipoPiso={setTipoPiso}
            filtAmueblado={filtAmueblado}     setFiltAmueblado={setFiltAmueblado}
            filtWifi={filtWifi}               setFiltWifi={setFiltWifi}
            filtMascotas={filtMascotas}       setFiltMascotas={setFiltMascotas}
            filtParking={filtParking}         setFiltParking={setFiltParking}
            filtLavadora={filtLavadora}       setFiltLavadora={setFiltLavadora}
            filtAC={filtAC}                   setFiltAC={setFiltAC}
            filtCalefaccion={filtCalefaccion} setFiltCalefaccion={setFiltCalefaccion}
            filtAscensor={filtAscensor}       setFiltAscensor={setFiltAscensor}
            filtPermiteFumar={filtPermiteFumar} setFiltPermiteFumar={setFiltPermiteFumar}
            generoPref={generoPref}           setGeneroPref={setGeneroPref}
            filtIntereses={filtIntereses}     setFiltIntereses={setFiltIntereses}
            todosIntereses={todosIntereses}
            onAplicar={aplicarFiltros}
            onLimpiar={() => limpiarFiltros(true)}
            filtrosActivos={filtrosActivos}
            mobileOpen={mobileFiltersOpen}
            onMobileClose={() => setMobileFiltersOpen(false)}
          />

          {/* Área de resultados — es un <div>, no un <main>: la landmark
              principal de la página es el <main> exterior y solo puede haber
              una por documento. */}
          <div className='flex-1 min-w-0'>

            {/* Resumen + ordenar */}
            {!loading && total > 0 && (
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-5'>
                <p className='text-sm sm:text-base lg:text-lg text-slate-500'>
                  <span className='font-bold text-slate-800'>{total}</span> anuncio{total !== 1 ? 's' : ''}{ciudadBuscada ? <> en <span className='font-bold text-slate-800'>{ciudadBuscada}</span></> : ' disponibles'}
                  {filtrosActivos && <span className='text-slate-500'> · con filtros activos</span>}
                </p>
                <select
                  aria-label='Ordenar resultados'
                  value={ordenar}
                  onChange={e => handleOrdenar(e.target.value)}
                  className='cursor-pointer! text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition appearance-none pr-8'
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                >
                  <option value='compatibles' disabled={!tienePerfilConvivencia}>
                    {tienePerfilConvivencia ? ' Más compatibles' : ' Más compatibles (requiere perfil)'}
                  </option>
                  <option value='recientes'>Más recientes</option>
                  <option value='precio_asc'>Precio: menor a mayor</option>
                  <option value='precio_desc'>Precio: mayor a menor</option>
                </select>
              </div>
            )}

            {/* Banner perfil de convivencia */}
            {tienePerfilConvivencia === false && (
              <div className='mb-5 flex flex-wrap items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl'>
                <div className='w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0'>
                  <Sparkles aria-hidden='true' size={18} className='text-emerald-600' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-slate-800'>Encuentra tu piso ideal</p>
                  <p className='text-xs text-slate-500 mt-0.5'>
                    Regístrate y completa tu perfil para ver qué anuncios encajan mejor contigo.
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => setRegistroOpen(true)}
                  className='cursor-pointer! shrink-0 flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition'
                >
                  Registrarse
                  <ArrowRight aria-hidden='true' size={13} />
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className='flex justify-center py-24'>
                <div className='w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className='text-center py-12 text-sm text-red-500'>{error}</div>
            )}

            {/* Sin resultados */}
            {!loading && !error && total === 0 && (
              <div className='flex flex-col items-center justify-center py-28 gap-4'>
                <div className='w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center'>
                  <Search aria-hidden='true' size={28} className='text-slate-500' />
                </div>
                <div className='text-center'>
                  <p className='text-sm font-semibold text-slate-600'>{ciudadBuscada ? `Sin anuncios en ${ciudadBuscada}` : 'No hay anuncios disponibles'}</p>
                  <p className='text-xs text-slate-500 mt-1'>Prueba con otra ciudad o amplía los filtros</p>
                </div>
                {filtrosActivos && (
                  <button
                    type='button'
                    onClick={() => limpiarFiltros(true)}
                    className='cursor-pointer! text-sm font-semibold text-emerald-600 hover:text-emerald-700 underline transition'
                  >
                    Quitar filtros
                  </button>
                )}
              </div>
            )}

            {/* Resultados */}
            {!loading && resultados.length > 0 && (
              <>
                <div className='flex flex-col gap-4'>
                  {resultados.map(pub => (
                    <PublicacionCard
                      key={pub.id}
                      pub={pub}
                      user={user}
                      esFavorito={favoritosIds.has(pub.id)}
                      onToggleFavorito={toggleFavorito}
                      onRequireLogin={() => setLoginOpen(true)}
                    />
                  ))}
                </div>

                {paginas > 1 && (
                  <div className='flex items-center justify-center gap-2 mt-10'>
                    <button
                      type='button'
                      onClick={() => cambiarPagina(page - 1)}
                      aria-label='Página anterior'
                      disabled={page === 1}
                      className='cursor-pointer! w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition'
                    >
                      <ChevronLeft aria-hidden='true' size={15} />
                    </button>
                    {Array.from({ length: paginas }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        type='button'
                        onClick={() => cambiarPagina(n)}
                        aria-label={`Página ${n}`}
                        aria-current={n === page ? 'page' : undefined}
                        className={`cursor-pointer! w-9 h-9 rounded-xl text-sm font-semibold transition ${
                          n === page
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'border border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type='button'
                      onClick={() => cambiarPagina(page + 1)}
                      aria-label='Página siguiente'
                      disabled={page === paginas}
                      className='cursor-pointer! w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition'
                    >
                      <ChevronRight aria-hidden='true' size={15} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <PieDePagina />

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={async () => { await recargarUsuario(); setLoginOpen(false) }}
          onSwitchToRegistro={() => { setLoginOpen(false); setRegistroOpen(true) }}
        />
      )}
      {registroOpen && (
        <RegistroModal
          onClose={() => setRegistroOpen(false)}
          onSuccess={async (esCasero) => { await recargarUsuario(); setRegistroOpen(false); navigate(esCasero ? '/' : '/perfil/usuario/editar') }}
          onSwitchToLogin={() => { setRegistroOpen(false); setLoginOpen(true) }}
        />
      )}
    </div>
  )
}
