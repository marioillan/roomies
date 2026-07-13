import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../lib/apiFetch'
import { CARD_SHADOW } from '../lib/convivencia.js'
import {
  Heart, MessageCircle, ArrowLeft, MapPin, Euro, Bed, Ruler,
  Home, House, Layers, MoveUp, Wifi, WashingMachine, Wind, Flame, Car, Trees,
  Cigarette, PawPrint, Phone, ChevronLeft, ChevronRight, ImageOff,
  Users, Check, Search, Link2, CheckCircle, MinusCircle, XCircle,
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────

const COMODIDAD_CONFIG = {
  wifi:               { Icon: Wifi,          label: 'Wifi fibra'          },
  lavadora:           { Icon: WashingMachine, label: 'Lavadora'            },
  lavavajillas:       { Icon: WashingMachine, label: 'Lavavajillas'        },
  aire_acondicionado: { Icon: Wind,           label: 'Aire acondicionado'  },
  calefaccion:        { Icon: Flame,          label: 'Calefacción'         },
  parking:            { Icon: Car,            label: 'Parking'             },
  terraza:            { Icon: Trees,          label: 'Terraza'             },
  amueblado:          { Icon: Home,           label: 'Amueblado'           },
}

function AvatarMiembro({ foto, nombre, size = 8 }) {
  const cls = `w-${size} h-${size} rounded-full object-cover border-2 border-white`
  if (foto) return <img src={foto} alt={nombre} className={cls} />
  return (
    <div className={`w-${size} h-${size} rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center shrink-0`}>
      <span className='text-xs font-bold text-emerald-700'>{nombre?.[0]?.toUpperCase() ?? '?'}</span>
    </div>
  )
}

// ── Galería ───────────────────────────────────────────────────────────

function Galeria({ fotos, publicacionId, user, esFavorito, onToggleFavorito }) {
  const [activa, setActiva] = useState(0)
  const [toggling, setToggling] = useState(false)

  const prev = () => setActiva(i => (i - 1 + fotos.length) % fotos.length)
  const next = () => setActiva(i => (i + 1) % fotos.length)

  const handleFavorito = async (e) => {
    e.stopPropagation()
    if (!user || toggling) return
    setToggling(true)
    await onToggleFavorito()
    setToggling(false)
  }

  if (!fotos.length) {
    return (
      <div className='w-full aspect-video bg-slate-100 rounded-[1.25rem] flex flex-col items-center justify-center gap-3 border border-slate-200'>
        <ImageOff size={32} className='text-slate-300' />
        <p className='text-sm text-slate-400'>Sin fotos</p>
      </div>
    )
  }

  const visibles   = fotos.slice(0, 4)
  const restantes  = fotos.length - 4

  return (
    <div className='flex flex-col gap-3'>
      {/* Foto principal */}
      <div className='relative w-full aspect-video rounded-[1.25rem] overflow-hidden group bg-slate-100'>
        <img
          src={fotos[activa].url}
          alt={`Foto ${activa + 1}`}
          className='w-full h-full object-cover transition-opacity duration-200'
        />

        {/* Contador */}
        <span className='absolute bottom-3 right-3 bg-slate-900/70 text-white font-mono text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm'>
          {activa + 1} / {fotos.length}
        </span>

        {/* Flechas */}
        {fotos.length > 1 && (
          <>
            <button onClick={prev}
              className='cursor-pointer! absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition opacity-0 group-hover:opacity-100'>
              <ChevronLeft size={18} />
            </button>
            <button onClick={next}
              className='cursor-pointer! absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition opacity-0 group-hover:opacity-100'>
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {fotos.length > 1 && (
        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2.5'>
          {visibles.map((f, i) => {
            const esUltima   = i === 3 && restantes > 0
            const estaActiva = activa === i
            return (
              <button
                key={f.id ?? i}
                onClick={() => setActiva(i)}
                className={`cursor-pointer! relative aspect-[1.3] rounded-xl overflow-hidden border-2 transition
                  ${estaActiva ? 'border-emerald-600' : 'border-transparent hover:border-slate-300'}`}
              >
                <img src={f.url} alt='' className='w-full h-full object-cover' />
                {esUltima && (
                  <div className='absolute inset-0 bg-slate-900/60 flex items-center justify-center'>
                    <span className='font-display text-lg font-semibold text-white'>+{restantes}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Card contacto (columna derecha) ───────────────────────────────────

function CardContacto({ pub, miembros, user, navigate, onSolicitar, estadoSolicitud, perteneceAlGrupo }) {
  return (
    <div className='bg-white border border-slate-100 rounded-[1.25rem] p-6 flex flex-col gap-5' style={CARD_SHADOW}>
      {/* Precio */}
      <div>
        <p className='font-display text-[2.25rem] font-medium text-slate-900 leading-none'>
          {Number(pub.precio).toFixed(0)}<span className='text-xl text-slate-900 ml-1'>€</span>
          <span className='font-sans text-sm text-slate-900 font-normal ml-1'>/mes</span>
        </p>
      </div>

      <div className='border-t border-slate-100' />

      {/* Grupo */}
      <div>
        <p className='font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-3'>Publicado por</p>
        <div className='flex items-center gap-3'>
          {pub.foto_grupo
            ? <img src={pub.foto_grupo} alt={pub.nombre_grupo} className='w-11 h-11 rounded-full object-cover shrink-0' />
            : <div className='w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0'>
                <Users size={18} className='text-emerald-600' />
              </div>
          }
          <div className='min-w-0'>
            <p className='font-semibold text-[0.9375rem] text-slate-900 truncate'>{pub.nombre_grupo}</p>
            <p className='font-mono text-[0.6875rem] text-slate-500'>{pub.ciudad}</p>
          </div>
        </div>
      </div>

      <div className='border-t border-slate-100' />

      {/* Botones */}
      <div className='flex flex-col gap-2'>
        {perteneceAlGrupo ? (
          <div className='flex items-center justify-center gap-2 w-full py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-sm font-semibold'>
            <Check size={15} /> Ya perteneces a este grupo
          </div>
        ) : estadoSolicitud === 'enviada' ? (
          <div className='flex items-center justify-center gap-2 w-full py-3 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold'>
            <Check size={15} /> Solicitud enviada
          </div>
        ) : (
          <button
            onClick={onSolicitar}
            disabled={estadoSolicitud === 'enviando' || !user}
            className='cursor-pointer! flex items-center justify-center gap-2 w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition'
          >
            {estadoSolicitud === 'enviando'
              ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              : <MessageCircle size={15} />
            }
            {!user ? 'Inicia sesión para contactar' : 'Enviar mensaje'}
          </button>
        )}
        {!perteneceAlGrupo && pub.telefono_contacto && (
          <a
            href={`tel:${pub.telefono_contacto}`}
            className='flex items-center justify-center gap-2 w-full py-3 rounded-full bg-slate-100 hover:bg-white border border-slate-200 text-slate-900 text-sm font-semibold transition'
          >
            <Phone size={15} /> Llamar
          </a>
        )}
      </div>
    </div>
  )
}

// ── Donut pequeño ────────────────────────────────────────────────────

function MiniDonut({ score }) {
  const r    = 28
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 100)
  return (
    <div className='relative w-20 h-20 shrink-0'>
      <svg className='w-full h-full -rotate-90' viewBox='0 0 72 72'>
        <circle cx='36' cy='36' r={r} fill='none' stroke='#d1fae5' strokeWidth='6' />
        <circle cx='36' cy='36' r={r} fill='none' stroke='#059669' strokeWidth='6'
          strokeDasharray={`${dash} ${circ}`} strokeLinecap='round' />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='font-display text-[1.125rem] font-bold text-emerald-700'>{score}%</span>
      </div>
    </div>
  )
}

const TAGLINE = (s) =>
  s >= 85 ? 'Muy buena afinidad con este grupo' :
  s >= 70 ? 'Buena afinidad con este grupo'     :
  s >= 50 ? 'Afinidad moderada con este grupo'  :
            'Baja afinidad con este grupo'

const DIMENSIONES = [
  { key: 'horario',            label: 'Horario'   },
  { key: 'ambiente',           label: 'Ambiente'  },
  { key: 'frecuencia_visitas', label: 'Visitas'   },
  { key: 'tolerancia_fiestas', label: 'Fiestas'   },
  { key: 'ocupacion',          label: 'Ocupación' },
  { key: 'limpieza_orden',     label: 'Limpieza'  },
  { key: 'nivel_ruido',        label: 'Ruido'     },
]

function GrupoCompatibilidad({ desglose }) {
  const coinciden = DIMENSIONES.filter(d => desglose[d.key] === 1.0)
  const parecido  = DIMENSIONES.filter(d => desglose[d.key] === 0.5)
  const diferente = DIMENSIONES.filter(d => desglose[d.key] === 0.0)

  const Seccion = ({ icono: Icono, titulo, color, items }) => {
    if (!items.length) return null
    return (
      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center gap-1.5'>
          <Icono size={13} style={{ color }} />
          <span className='font-mono text-[0.6rem] font-bold uppercase tracking-widest' style={{ color }}>{titulo}</span>
        </div>
        <div className='flex flex-wrap gap-1.5'>
          {items.map(d => (
            <span key={d.key} className='text-[0.75rem] font-medium px-2.5 py-1 rounded-full border' style={{ color, borderColor: color + '40', background: color + '10' }}>
              {d.label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      <Seccion icono={CheckCircle} titulo='Coincidís en'  color='#059669' items={coinciden} />
      <Seccion icono={MinusCircle} titulo='Parecido en'   color='#ea580c' items={parecido}  />
      <Seccion icono={XCircle}     titulo='Diferente en'  color='#dc2626' items={diferente} />
    </div>
  )
}

// ── Card compañeros ───────────────────────────────────────────────────

function CardCompaneros({ miembros, compatibilidad, grupoTieneConvivencia, user, navigate, publicacionId }) {
  const visibles  = miembros.slice(0, 5)
  const restantes = miembros.length - visibles.length

  return (
    <div className='bg-white border border-slate-100 rounded-[1.25rem] p-6 flex flex-col gap-4' style={CARD_SHADOW}>

      {/* Bloque de compatibilidad */}
      {compatibilidad ? (
        <div className='flex flex-col gap-3'>
          {/* Score destacado */}
          <div className='flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-[0.875rem] p-4'>
            <MiniDonut score={compatibilidad.score} />
            <div className='min-w-0'>
              <p className='font-display text-[1.0625rem] font-semibold text-slate-900 leading-tight'>
                {compatibilidad.score}% de compatibilidad
              </p>
              <p className='text-xs text-emerald-700 mt-0.5'>{TAGLINE(compatibilidad.score)}</p>
            </div>
          </div>
          {/* Desglose agrupado */}
          <GrupoCompatibilidad desglose={compatibilidad.desglose} />
        </div>
      ) : (
        <div className='bg-slate-50 border border-slate-100 rounded-[0.875rem] p-4'>
          {!user ? (
            <>
              <p className='text-xs text-slate-500 leading-relaxed'>
                Inicia sesión y completa tu perfil de convivencia para ver tu compatibilidad.
              </p>
              <button
                onClick={() => navigate('/')}
                className='cursor-pointer! mt-2.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition'
              >
                Iniciar sesión →
              </button>
            </>
          ) : !grupoTieneConvivencia ? (
            <p className='text-xs text-slate-500 leading-relaxed'>
              Este grupo aún no ha completado su perfil de convivencia. No es posible calcular la compatibilidad.
            </p>
          ) : (
            <>
              <p className='text-xs text-slate-500 leading-relaxed'>
                Completa tu perfil de convivencia para ver tu compatibilidad con este grupo.
              </p>
              <button
                onClick={() => navigate('/perfil/usuario/editar')}
                className='cursor-pointer! mt-2.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition'
              >
                Completar perfil →
              </button>
            </>
          )}
        </div>
      )}

      {/* Avatares solapados */}
      <div className='flex items-center gap-3 pt-1 border-t border-slate-100'>
        <div className='flex items-center'>
          {visibles.map((m, i) => (
            <div key={m.id} style={{ marginLeft: i === 0 ? 0 : '-0.625rem', zIndex: visibles.length - i }} className='relative'>
              <AvatarMiembro foto={m.foto_perfil} nombre={m.nombre} size={8} />
            </div>
          ))}
          {restantes > 0 && (
            <div className='w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center' style={{ marginLeft: '-0.625rem' }}>
              <span className='font-mono text-[0.625rem] font-bold text-slate-500'>+{restantes}</span>
            </div>
          )}
        </div>
        <p className='text-sm text-slate-500 font-medium'>
          {miembros.length} {miembros.length === 1 ? 'miembro' : 'miembros'}
        </p>
      </div>

      <button
        onClick={() => navigate(`/anuncio/${publicacionId}/convivencia`)}
        className='cursor-pointer! flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-slate-100 hover:bg-white border border-slate-200 text-slate-900 text-sm font-semibold transition'
      >
        Ver perfil de convivencia
      </button>
    </div>
  )
}

// ── Chip ──────────────────────────────────────────────────────────────

function Chip({ icon: Icon, children, variant = 'default' }) {
  const cls = variant === 'price'
    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
    : 'bg-white border-slate-200 text-slate-700'
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[0.8125rem] font-semibold ${cls}`}>
      {Icon && <Icon size={14} className='shrink-0' />}
      {children}
    </span>
  )
}

// ── Sección ───────────────────────────────────────────────────────────

function Seccion({ title, children }) {
  return (
    <div className='bg-white border border-slate-100 rounded-[1.25rem] p-6 flex flex-col gap-4' style={CARD_SHADOW}>
      <p className='font-mono text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-slate-800 pb-3 border-b border-slate-100'>
        {title}
      </p>
      {children}
    </div>
  )
}

// ── Input ciudad con Google Places ────────────────────────────────────

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
      <MapPin size={14} className='text-slate-400 shrink-0' />
      <input
        ref={inputRef}
        type='text'
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onBuscar(value) }}
        placeholder='Ciudad...'
        className='flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none'
      />
      <button
        onClick={() => onBuscar(value)}
        className='cursor-pointer! shrink-0 w-7 h-7 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition'
      >
        <Search size={13} className='text-white' />
      </button>
    </div>
  )
}

// ── AnuncioPublico ────────────────────────────────────────────────────

export default function AnuncioPublico() {
  const { user, tieneGrupo } = useAuth()
  const { id }     = useParams()
  const navigate   = useNavigate()
  const location   = useLocation()
  const busqueda   = location.state?.busqueda ?? ''

  const [datos,           setDatos]           = useState(null)
  const [cargando,        setCargando]        = useState(true)
  const [esFavorito,      setEsFavorito]      = useState(false)
  const [estadoSolicitud, setEstadoSolicitud] = useState(null)
  const [ciudad,          setCiudad]          = useState('')
  const [copiado,         setCopiado]         = useState(false)
  const [menuFav,         setMenuFav]         = useState(false)
  const refMenuFav = useRef(null)

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/publicaciones/${id}`).then(r => r.json()),
      user
        ? apiFetch('/api/favoritos')
            .then(r => r.json())
            .then(d => (d.favoritos ?? []).includes(id))
            .catch(() => false)
        : Promise.resolve(false),
    ]).then(([datosRes, favorito]) => {
      setDatos(datosRes)
      setEsFavorito(favorito)
    }).catch(() => setDatos(null))
    .finally(() => setCargando(false))
  }, [id, user])

  const toggleFavorito = async () => {
    if (!user) return
    try {
      await apiFetch(`/api/favoritos/${id}`, { method: 'POST' })
      setEsFavorito(v => !v)
    } catch { /* ignorar */ }
  }

  useEffect(() => {
    if (!menuFav) return
    const cerrar = (e) => { if (refMenuFav.current && !refMenuFav.current.contains(e.target)) setMenuFav(false) }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [menuFav])

  const solicitar = async () => {
    if (!user) { navigate('/'); return }
    setEstadoSolicitud('enviando')
    try {
      const r = await apiFetch(`/api/chats/solicitar/${id}`, { method: 'POST' })
      if (r.ok) { setEstadoSolicitud('enviada'); return }
      const d = await r.json()
      if (d.yaEnviada) navigate('/perfil/chat')
      else setEstadoSolicitud('error')
    } catch { setEstadoSolicitud('error') }
  }

  // ── Loading ───────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className='min-h-screen bg-slate-100 flex items-center justify-center'>
        <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (!datos?.publicacion) {
    return (
      <div className='min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4'>
        <p className='text-slate-500 font-semibold'>Anuncio no encontrado</p>
        <button onClick={() => navigate('/buscar')}
          className='cursor-pointer! text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition'>
          ← Volver a la búsqueda
        </button>
      </div>
    )
  }

  const { publicacion: pub, fotos, miembros, stats } = datos

  const perteneceAlGrupo = user && miembros.some(m => m.id === user.id)

  const handleCiudadBuscar = (c) => {
    if (c?.trim()) navigate(`/buscar?ciudad=${encodeURIComponent(c.trim())}`)
  }

  const comodidades = Object.keys(COMODIDAD_CONFIG).filter(k => pub[k])
  const normas = [
    pub.permite_fumar     != null && { Icon: Cigarette, label: pub.permite_fumar     ? 'Se puede fumar'      : 'No se puede fumar'      },
    pub.permite_mascotas  != null && { Icon: PawPrint,  label: pub.permite_mascotas  ? 'Mascotas permitidas' : 'No se permiten mascotas' },
  ].filter(Boolean)

  return (
    <div className='min-h-screen bg-slate-100'>

      {/* Header */}
      <header className='sticky top-0 z-20 bg-white border-b border-slate-200'>
        <div className='max-w-[80rem] mx-auto flex items-center gap-3 sm:gap-6 px-4 sm:px-10 py-3.5'>
          <button onClick={() => navigate('/buscar')} className='cursor-pointer! shrink-0 flex items-center'>
            <span className='font-display text-xl sm:text-2xl font-bold -tracking-[0.02em] text-slate-900'>Housie</span>
          </button>

          <div className='flex-1 min-w-0 flex items-center gap-2 sm:max-w-[34rem] sm:mx-auto'>
            <InputCiudad value={ciudad} onChange={setCiudad} onBuscar={handleCiudadBuscar} />
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            {user ? (
              <>
                {tieneGrupo ? (
                  <button onClick={() => navigate('/grupo')} title='Mi grupo'
                    className='cursor-pointer! hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-slate-600 hover:bg-slate-100 transition'>
                    <House size={20} />
                  </button>
                ) : (
                  <>
                    <button onClick={() => navigate('/perfil/favoritos')} aria-label='Favoritos'
                      className='cursor-pointer! hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-slate-600 hover:bg-slate-100 transition'>
                      <Heart size={20} />
                    </button>
                    <button onClick={() => navigate('/perfil/chat')} aria-label='Mensajes'
                      className='cursor-pointer! hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-slate-600 hover:bg-slate-100 transition'>
                      <MessageCircle size={20} />
                    </button>
                  </>
                )}
                {user.foto_perfil
                  ? <img src={user.foto_perfil} alt={user.nombre}
                      className='hidden sm:block sm:w-10 sm:h-10 rounded-full object-cover cursor-pointer'
                      onClick={() => navigate('/perfil/usuario')} />
                  : <button onClick={() => navigate('/perfil/usuario')}
                      className='cursor-pointer! hidden sm:flex sm:w-10 sm:h-10 rounded-full bg-emerald-100 items-center justify-center'>
                      <span className='text-sm font-bold text-emerald-700'>{user.nombre?.[0]?.toUpperCase()}</span>
                    </button>
                }
              </>
            ) : (
              <button onClick={() => navigate('/')}
                className='cursor-pointer! hidden sm:block text-sm font-semibold text-slate-700 hover:text-slate-900 transition px-4 py-2'>
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className='max-w-[80rem] mx-auto px-4 sm:px-10 py-8'>

        {/* Volver */}
        <button
          onClick={() => navigate(`/buscar${busqueda}`)}
          className='cursor-pointer! hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition bg-slate-100 hover:bg-white border border-slate-200 px-[1.125rem] py-3 rounded-full'
        >
          <ArrowLeft size={15} /> Volver a la búsqueda
        </button>

        {/* Grid principal — 1 col mobile, 2 col desktop */}
        <div className='grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-6' style={{ alignItems: 'start' }}>

          {/* ── Columna izquierda ─────────────────────────────── */}
          <div className='flex flex-col gap-5'>

            {/* Galería */}
            <Galeria
              fotos={fotos}
              publicacionId={id}
              user={user}
              esFavorito={esFavorito}
              onToggleFavorito={toggleFavorito}
            />

            {/* Cabecera */}
            <div className='bg-white border border-slate-100 rounded-[1.25rem] p-6' style={CARD_SHADOW}>
              <h1 className='font-display text-[2.25rem] font-medium text-slate-900 leading-tight'>
                {pub.titulo}
              </h1>
              {(pub.direccion || pub.ciudad) && (
                <p className='flex items-center gap-1.5 text-[0.9375rem] text-slate-500 mt-2'>
                  <MapPin size={14} className='shrink-0 text-slate-400' />
                  {pub.direccion ? `${pub.direccion}${pub.piso_puerta ? `, ${pub.piso_puerta}` : ''}, ${pub.ciudad}` : pub.ciudad}
                </p>
              )}
              <div className='flex flex-wrap gap-2 mt-5'>
                <Chip icon={Bed}>{pub.habitaciones_libres} hab. libre{pub.habitaciones_libres !== 1 ? 's' : ''}</Chip>
                {pub.habitaciones_totales && <Chip icon={Layers}>{pub.habitaciones_totales} hab. en total</Chip>}
                {pub.tamano_piso         && <Chip icon={Ruler}>{pub.tamano_piso} m²</Chip>}
                {pub.planta != null      && <Chip icon={MoveUp}>Planta {pub.planta}</Chip>}
                {pub.tipo_piso           && <Chip icon={Home}>{pub.tipo_piso.charAt(0) + pub.tipo_piso.slice(1).toLowerCase()}</Chip>}
                {pub.genero_preferido    && <Chip icon={Users}>Solo {pub.genero_preferido.toLowerCase()}</Chip>}
              </div>
            </div>

            {/* Descripción */}
            {pub.descripcion && (
              <Seccion title='Descripción'>
                <p className='text-slate-700 leading-relaxed' style={{ textWrap: 'pretty' }}>
                  {pub.descripcion}
                </p>
              </Seccion>
            )}

            {/* Comodidades */}
            {comodidades.length > 0 && (
              <Seccion title='Comodidades'>
                <div className='grid grid-cols-2 gap-2.5'>
                  {comodidades.map(k => {
                    const { Icon, label } = COMODIDAD_CONFIG[k]
                    return (
                      <div key={k} className='flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-3'>
                        <div className='w-9 h-9 rounded-[0.625rem] bg-emerald-50 flex items-center justify-center shrink-0'>
                          <Icon size={16} className='text-emerald-600' />
                        </div>
                        <span className='text-[0.875rem] font-semibold text-slate-700'>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </Seccion>
            )}

            {/* Normas */}
            {(normas.length > 0 || pub.normas_adicionales) && (
              <Seccion title='Normas de la casa'>
                {normas.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {normas.map(({ Icon, label }) => (
                      <span key={label} className='inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-full'>
                        <Icon size={14} className='shrink-0' /> {label}
                      </span>
                    ))}
                  </div>
                )}
                {pub.normas_adicionales && (
                  <p className='text-slate-600 leading-relaxed text-sm'>{pub.normas_adicionales}</p>
                )}
              </Seccion>
            )}

            {/* Mapa */}
            {(pub.direccion || pub.ciudad) && (
              <div className='bg-white border border-slate-100 rounded-[1.25rem] overflow-hidden flex flex-col' style={CARD_SHADOW}>
                <div className='relative w-full' style={{ height: '18rem' }}>
                  <iframe
                    title='Mapa de ubicación'
                    width='100%'
                    height='100%'
                    style={{ border: 0, display: 'block' }}
                    loading='lazy'
                    allowFullScreen
                    referrerPolicy='no-referrer-when-downgrade'
                    src={`https://maps.google.com/maps?q=${encodeURIComponent([pub.direccion, pub.ciudad].filter(Boolean).join(', '))}&output=embed&hl=es&z=15`}
                  />
                </div>
              </div>
            )}

          </div>

          {/* ── Columna derecha (sticky) ──────────────────────── */}
          <div className='flex flex-col gap-4 sticky top-24'>

            {/* Botones guardar + compartir */}
            <div className='flex gap-2 order-last lg:order-first'>
              {/* Botón favorito con desplegable */}
              <div className='relative flex-1' ref={refMenuFav}>
                <button
                  type='button'
                  disabled={perteneceAlGrupo}
                  onClick={async () => {
                    if (!user) { navigate('/'); return }
                    if (esFavorito) { setMenuFav(v => !v); return }
                    await toggleFavorito()
                  }}
                  className={`cursor-pointer! w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition
                    ${perteneceAlGrupo
                      ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed!'
                      : esFavorito
                        ? 'border-pink-200 bg-pink-50 text-pink-600 hover:bg-pink-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                >
                  <Heart size={15} fill={esFavorito && !perteneceAlGrupo ? 'currentColor' : 'none'} />
                  {perteneceAlGrupo ? 'Ya eres miembro' : esFavorito ? 'Guardado' : 'Guardar'}
                </button>
                {menuFav && (
                  <div className='absolute top-full mt-1.5 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-10'>
                    <button
                      type='button'
                      onClick={() => { navigate('/perfil/favoritos'); setMenuFav(false) }}
                      className='cursor-pointer! w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition'
                    >
                      Ver favoritos
                    </button>
                    <button
                      type='button'
                      onClick={async () => { await toggleFavorito(); setMenuFav(false) }}
                      className='cursor-pointer! w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition border-t border-slate-100'
                    >
                      Quitar de favoritos
                    </button>
                  </div>
                )}
              </div>
              <button
                type='button'
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  setCopiado(true)
                  setTimeout(() => setCopiado(false), 2000)
                }}
                className='cursor-pointer! flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 text-sm font-semibold transition'
              >
                {copiado ? <Check size={15} className='text-emerald-500' /> : <Link2 size={15} />}
                {copiado ? '¡Copiado!' : 'Compartir'}
              </button>
            </div>

            <CardContacto
              pub={pub}
              miembros={miembros}
              user={user}
              navigate={navigate}
              onSolicitar={solicitar}
              estadoSolicitud={estadoSolicitud}
              perteneceAlGrupo={perteneceAlGrupo}
            />
            <CardCompaneros
              miembros={miembros}
              compatibilidad={datos.compatibilidad}
              grupoTieneConvivencia={!!datos.convivencia}
              user={user}
              navigate={navigate}
              publicacionId={id}
            />
          </div>

        </div>

        {/* Botón volver — solo móvil, al final de la página */}
        <div className='sm:hidden bg-white border border-slate-100 rounded-3xl p-4 mt-6' style={CARD_SHADOW}>
          <button onClick={() => navigate(`/buscar${busqueda}`)}
            className='cursor-pointer! w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition bg-slate-100 hover:bg-white border border-slate-200 px-[1.125rem] py-3 rounded-full'>
            <ArrowLeft size={15} /> Volver a la búsqueda
          </button>
        </div>
      </main>
    </div>
  )
}
