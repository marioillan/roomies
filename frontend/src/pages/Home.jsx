import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../lib/apiFetch'
import {
  ArrowRight, Bed, Users, CalendarCheck, Calendar, Clock,
  ShoppingCart, Receipt, MessageCircle, House,
  Heart, CheckCircle2, MapPin, Shield, Zap, AlertCircle, ChevronDown, ChevronsLeftRight, RefreshCw,
} from 'lucide-react'
import habitacionhero from '../assets/habitacionhero.jpg'
import LoginModal from '../components/LoginModal.jsx'
import RegistroModal from '../components/RegistroModal.jsx'
import PieDePagina from '../components/PieDePagina.jsx'
import { SaltarAlContenido } from '../components/Accesibilidad.jsx'

const ESMERALDA = '#10b981'

// Textura de grano generada con SVG en línea: da profundidad al fondo oscuro
// sin pedir ningún fichero extra al servidor.
const GRANO = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23r)'/%3E%3C/svg%3E\")",
}

const VENTAJAS = [
  { icon: Shield, texto: 'Gratis, sin comisiones' },
  { icon: Zap,    texto: 'Registro en segundos' },
  { icon: MapPin, texto: 'Toda España' },
]

// Tarjetas que flotan a los lados del titular en escritorio. `posicion` se
// aplica en línea porque son coordenadas del diseño, no utilidades de Tailwind.
const TARJETAS_HERO = [
  {
    icon: Receipt,
    titulo: 'Factura de la luz',
    detalle: 'Pagada por los 4',
    acento: true,
    posicion: { top: '25%', right: '-18px' },
    rotacion: '1.6deg',
    retardo: 0.62,
    duracion: 8.4,
  },
  {
    icon: Users,
    titulo: '3 compañeros compatibles',
    detalle: 'Disponibles ahora',
    acento: false,
    posicion: { top: '30%', left: '-18px' },
    rotacion: '1.2deg',
    retardo: 0.74,
    duracion: 7.6,
  },
  {
    icon: Calendar,
    titulo: 'Cena de piso',
    detalle: 'Viernes, 21:00',
    acento: false,
    posicion: { top: '54%', left: '26px' },
    rotacion: '2.1deg',
    retardo: 0.98,
    duracion: 7.3,
  },
  {
    icon: Clock,
    titulo: 'Turno de basura',
    detalle: 'Hoy le toca a Dani',
    acento: false,
    posicion: { top: '56%', right: '30px' },
    rotacion: '-2deg',
    retardo: 1.1,
    duracion: 8.7,
  },
  {
    icon: ShoppingCart,
    titulo: 'Lista de la compra',
    detalle: '6 cosas pendientes',
    acento: false,
    posicion: { top: '79%', right: '-4px' },
    rotacion: '-1.8deg',
    retardo: 0.86,
    duracion: 8.1,
  },
  {
    icon: CheckCircle2,
    titulo: 'Tarea completada',
    detalle: 'Cocina — María',
    acento: false,
    posicion: { top: '82%', left: '-6px' },
    rotacion: '-1.4deg',
    retardo: 0.5,
    duracion: 7,
  },
]

function useInView(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        obs.unobserve(el)
      }
    }, { threshold: 0.15, ...options })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return [ref, visible]
}

function Reveal({ children, delay = 0, className = '', from = 'bottom', as: Etiqueta = 'div' }) {
  const [ref, visible] = useInView()
  const translateMap = { bottom: 'translateY(28px)', left: 'translateX(-28px)', right: 'translateX(28px)' }

  return (
    <Etiqueta
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0,0)' : translateMap[from],
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </Etiqueta>
  )
}

// Dos puntos de partida ALTERNATIVOS, no dos pasos consecutivos: cada usuario
// entra por uno o por el otro según su situación.
const puntosDePartida = [
  {
    title: 'Si buscas habitación',
    descripcion: 'Creas tu perfil de convivencia, ves pisos ordenados por compatibilidad, mandas solicitud y chateas directo con el grupo.',
  },
  {
    title: 'Si tienes habitación libre',
    descripcion: 'Publicas la habitación, recibes solicitudes filtradas por compatibilidad, aceptas el match e integras al nuevo compañero.',
  },
]

const funcionalidades = [
  {
    icon: Bed,
    title: 'Busca habitación',
    descripcion:'Filtra por ciudad, precio y compatibilidad. Encuentra la habitación que encaja con tu estilo de vida.',
  },
  {
    icon: Users,
    title: 'Perfiles de compatibilidad',
    descripcion:'Rellena tu perfil de convivencia y conoce a compañeros afines antes de comprometerte.',
  },
  {
    icon: MessageCircle,
    title: 'Chat integrado',
    descripcion:'Habla directamente con el administrador del piso sin salir de la plataforma.',
  },
  {
    icon: CalendarCheck,
    title: 'Gestión de tareas y eventos',
    descripcion:'Reparte las tareas del hogar de forma justa, organiza eventos y mantén un calendario actualizado.',
  },
  {
    icon: Receipt,
    title: 'Control de gastos',
    descripcion:'Paga facturas y gastos comunes. Calcula automáticamente lo que le toca pagar a cada uno.',
  },
  {
    icon: ShoppingCart,
    title: 'Lista de la compra',
    descripcion:'Crea listas compartidas en tiempo real. Todos saben qué falta y quién lo añadió.',
  },
]

// Anuncio de ejemplo del comparador de compatibilidad. Se pinta dos veces —con
// y sin perfil de convivencia— para enseñar qué información se pierde sin él.
const ANUNCIO_DEMO = {
  titulo: 'Piso universitario — Valladolid',
  precio: 280,
  ciudad: 'Valladolid',
  descripcion: 'Ideal para estudiantes. Cerca de la UVa y del campus Miguel Delibes. Muy bien comunicado.',
  grupo: 'Piso Valladolid',
  compatibilidad: 90,
  interesesComunes: ['Running', 'Cine'],
}

function TarjetaAnuncioDemo({ conPerfil }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[1.25rem] overflow-hidden shadow-[0_1px_0_rgba(15,23,42,0.04),0_0.5rem_2rem_rgba(15,23,42,0.06)]">
      <div className="flex flex-col sm:flex-row">
        <img
          src={habitacionhero} alt=""
          className="w-full h-44 sm:w-[330px] sm:h-auto sm:min-h-[232px] shrink-0 self-stretch object-cover"
        />
        <div className="flex-1 min-w-0 px-5 py-5 sm:px-7 sm:py-6">
          <h3 className="font-display text-lg sm:text-xl font-semibold text-slate-900">{ANUNCIO_DEMO.titulo}</h3>
          <p className="mt-2 sm:mt-2.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-bold text-slate-900 -tracking-[0.02em]">{ANUNCIO_DEMO.precio}</span>
            <span className="text-sm text-slate-500">€/mes</span>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin aria-hidden="true" size={14} />
            {ANUNCIO_DEMO.ciudad}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 text-pretty">{ANUNCIO_DEMO.descripcion}</p>
          <p className="mt-4 flex items-center gap-2.5">
            <span aria-hidden="true" className="w-[30px] h-[30px] rounded-full bg-emerald-500 text-white flex items-center justify-center text-[0.8125rem] font-bold">P</span>
            <span className="text-sm font-medium text-slate-700">{ANUNCIO_DEMO.grupo}</span>
          </p>
        </div>
      </div>

      {/* Pie: es la única parte que cambia entre las dos versiones. La altura
          fija en escritorio mantiene alineadas las dos capas del comparador. */}
      <div className="min-h-[86px] sm:h-[78px] px-5 sm:px-7 py-4 sm:py-0 flex items-center justify-between gap-4 sm:gap-5 border-t border-slate-200 bg-slate-50">
        {conPerfil ? (
          <div className="flex flex-col gap-2 min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 whitespace-nowrap">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-emerald-500" />
              {ANUNCIO_DEMO.compatibilidad}% de compatibilidad
            </p>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-600">En común:</span>
              {ANUNCIO_DEMO.interesesComunes.map(interes => (
                <span key={interes} className="bg-emerald-100 text-emerald-800 rounded-full px-3 py-1 text-xs font-semibold">
                  {interes}
                </span>
              ))}
            </div>
          </div>
        ) : <span />}
        <span className="shrink-0 inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white text-sm font-semibold px-4 sm:px-5 py-2.5 whitespace-nowrap">
          <MessageCircle aria-hidden="true" size={15} />
          Contactar
        </span>
      </div>
    </div>
  )
}

// La divisoria puede llegar a los dos extremos de la tarjeta.
const limitar = (n) => Math.min(100, Math.max(0, n))

// Comparador de la sección de compatibilidad: en escritorio una divisoria
// arrastrable (y manejable con el teclado) revela una versión u otra del mismo
// anuncio; en móvil, donde arrastrar es incómodo, la misma tarjeta se cambia
// de una versión a la otra con un botón fijo debajo.
function ComparadorCompatibilidad() {
  const refCaja = useRef(null)
  const [posicion, setPosicion] = useState(52)
  const [arrastrando, setArrastrando] = useState(false)
  const [conPerfilMovil, setConPerfilMovil] = useState(false)

  const mover = (e) => {
    const caja = refCaja.current
    if (!caja) return
    const r = caja.getBoundingClientRect()
    setPosicion(limitar(((e.clientX - r.left) / r.width) * 100))
  }

  const alPulsarTecla = (e) => {
    const salto = { ArrowLeft: -4, ArrowRight: 4, Home: -100, End: 100 }[e.key]
    if (salto === undefined) return
    e.preventDefault()
    setPosicion(p => limitar(p + salto))
  }

  return (
    <>
      {/* ── Escritorio: divisoria arrastrable ── */}
      <div className="hidden lg:block mt-10">
        <div className="mb-3 flex justify-between font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
          <span className="text-emerald-700">Con perfil de convivencia</span>
          <span className="text-slate-500">Sin perfil</span>
        </div>

        <div
          ref={refCaja}
          onPointerMove={e => { if (arrastrando) mover(e) }}
          onPointerUp={() => setArrastrando(false)}
          className="relative select-none touch-none"
        >
          <TarjetaAnuncioDemo conPerfil />

          {/* La versión sin perfil se recorta desde la izquierda: solo se ve
              la parte de la tarjeta que queda a la derecha de la divisoria. */}
          <div className="absolute inset-0" aria-hidden="true" style={{ clipPath: `inset(0 0 0 ${posicion}%)` }}>
            <TarjetaAnuncioDemo conPerfil={false} />
          </div>

          <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500" style={{ left: `${posicion}%` }}>
            <button
              type="button"
              role="slider"
              aria-label="Arrastrar para comparar el anuncio con y sin perfil de convivencia"
              aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(posicion)}
              aria-valuetext={`${Math.round(posicion)} % del anuncio con perfil de convivencia`}
              onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setArrastrando(true) }}
              onKeyDown={alPulsarTecla}
              className="cursor-ew-resize! absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center shadow-lg shadow-slate-900/20"
            >
              <ChevronsLeftRight aria-hidden="true" size={18} strokeWidth={2.2} className="text-emerald-700" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Móvil: la misma tarjeta, cambiada con un botón fijo ── */}
      <div className="lg:hidden mt-8">
        <p aria-live="polite"
          className="mb-3 flex items-center gap-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span aria-hidden="true"
            className={'w-2 h-2 rounded-full ' + (conPerfilMovil ? 'bg-emerald-500' : 'bg-slate-300')} />
          {conPerfilMovil ? 'Con perfil de convivencia' : 'Sin perfil de convivencia'}
        </p>

        <TarjetaAnuncioDemo conPerfil={conPerfilMovil} />

        <button
          type="button"
          aria-pressed={conPerfilMovil}
          onClick={() => setConPerfilMovil(v => !v)}
          className="cursor-pointer! mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-[0.9375rem] font-semibold px-6 py-3.5 transition-colors"
        >
          <RefreshCw aria-hidden="true" size={16} />
          {conPerfilMovil ? 'Ver sin perfil de convivencia' : 'Ver con perfil de convivencia'}
        </button>
      </div>
    </>
  )
}

function BuscadorCiudad({ onBuscar }) {
  const inputRef = useRef(null)
  const acRef = useRef(null)

  useEffect(() => {
    function init() {
      if (!inputRef.current || !window.google?.maps?.places) return
      acRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        componentRestrictions: { country: 'es' },
        fields: ['name'],
        language: 'es',
      })
      acRef.current.addListener('place_changed', () => {
        const place = acRef.current.getPlace()
        const ciudad = place?.name
        if (ciudad) onBuscar(ciudad)
      })
    }

    if (window.google?.maps?.places) {
      init()
      return
    }

    if (!import.meta.env.VITE_GOOGLE_PLACES_KEY) return
    if (!document.querySelector('script[data-places]')) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_KEY}&libraries=places&language=es&region=ES&loading=async`
      script.async = true
      script.dataset.places = '1'
      script.onload = init
      document.head.appendChild(script)
    }
  }, [onBuscar])

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      onBuscar(inputRef.current?.value?.trim() ?? '')
    }
  }

  return (
    <div className="group flex items-center gap-3 bg-white/10 hover:bg-white/[0.13] backdrop-blur-md border border-white/20 rounded-2xl p-2 pl-4 shadow-lg shadow-black/20 focus-within:border-emerald-400/70 focus-within:bg-white/[0.15] focus-within:shadow-emerald-500/10 transition-all">
      <MapPin size={18} aria-hidden="true" className="text-emerald-400 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        aria-label="¿En qué ciudad buscas piso?"
        placeholder="¿En qué ciudad buscas piso?"
        onKeyDown={handleKey}
        className="flex-1 bg-transparent text-white placeholder-slate-300 text-[0.9375rem] outline-none min-w-0 py-2"
      />
      <button
        onClick={() => onBuscar(inputRef.current?.value?.trim() ?? '')}
        className="cursor-pointer! shrink-0 h-11 px-4 rounded-xl flex items-center gap-2 text-white text-sm font-semibold transition hover:brightness-110 active:scale-95"
        style={{ backgroundColor: ESMERALDA }}
        aria-label="Buscar"
      >
        {/* En móvil solo cabe la flecha; el aria-label mantiene el nombre. */}
        <span className="hidden sm:inline" aria-hidden="true">Buscar</span>
        <ArrowRight aria-hidden='true' size={16} className="transition-transform group-focus-within:translate-x-0.5" />
      </button>
    </div>
  )
}

export default function Home() {
  const { user, tieneGrupo, recargarUsuario } = useAuth()
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registroOpen, setRegistroOpen] = useState(false)
  const [codigoHome, setCodigoHome] = useState('')
  const [loadingHome, setLoadingHome] = useState(false)
  const [errorHome, setErrorHome] = useState('')
  const [mensajeHome, setMensajeHome] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const openRegistro = () => setRegistroOpen(true)
  const openLogin = () => setLoginOpen(true)

  const handleBuscar = (ciudad) => {
    const c = ciudad?.trim()
    navigate(c ? `/buscar?ciudad=${encodeURIComponent(c)}` : '/buscar')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleUnirseCodigo = async (e) => {
    e.preventDefault()
    const codigoLimpio = codigoHome.trim().toUpperCase()
    if (codigoLimpio.length !== 6) { setErrorHome('El código debe tener exactamente 6 caracteres'); return }
    setErrorHome('')
    setMensajeHome('')
    setLoadingHome(true)
    try {
      const res = await apiFetch('/api/grupos/unirse', {
        method: 'POST',
        body: JSON.stringify({ codigo_acceso: codigoLimpio }),
      })
      const json = await res.json()
      if (!res.ok) { setErrorHome(json.message); return }

      if (json.solicitud) {
        setCodigoHome('')
        setMensajeHome(json.message || 'Solicitud enviada correctamente. El administrador del grupo debe aceptarla para que puedas acceder.')
        return
      }

      await recargarUsuario()
      navigate('/grupo')
    } catch {
      setErrorHome('Error de conexión con el servidor')
    } finally {
      setLoadingHome(false)
    }
  }

  return (
    <div className="overflow-x-hidden">

      <SaltarAlContenido />
      {/* Cabecera flotante: se separa del borde de la ventana por arriba y por
          los lados. El fondo va en la caja interior y no en la cabecera, para
          que al hacer scroll quede una isla redondeada —el hueco superior se
          lee como parte del diseño— en vez de una barra de ancho completo con
          una franja transparente encima por la que se cuela el contenido. */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-2 px-2 sm:px-4">
        <div className={'max-w-[80rem] mx-auto flex items-center gap-3 sm:gap-6 px-4 sm:px-8 py-3 rounded-2xl transition-all duration-300 ' + (
          scrolled
            ? 'bg-white/85 backdrop-blur-md ring-1 ring-slate-200/70 shadow-lg shadow-slate-900/5'
            : 'bg-transparent ring-1 ring-transparent'
        )}>

          <button onClick={() => navigate('/')} className={'cursor-pointer! font-display text-2xl font-bold -tracking-[0.02em] shrink-0 transition-colors ' + (scrolled ? 'text-slate-900' : 'text-white')}>
            Housie
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                {user.es_casero ? (
                  <>
                    <button onClick={() => navigate('/casero/facturas')} aria-label="Gestión de facturas"
                      className="cursor-pointer! sm:hidden w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
                      <Receipt aria-hidden='true' size={20} />
                    </button>
                    <button onClick={() => navigate('/casero/facturas')}
                      className="cursor-pointer! hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:underline underline-offset-4 decoration-2 transition">
                      Gestión de facturas
                    </button>
                  </>
                ) : (
                  <>
                    {tieneGrupo ? (
                      <button onClick={() => navigate('/grupo')} aria-label="Mi grupo"
                        className={'cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center transition ' + (scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/15')}>
                        <House aria-hidden='true' size={20} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => navigate('/perfil/favoritos')} aria-label="Favoritos"
                          className={'cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center transition ' + (scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/15')}>
                          <Heart aria-hidden='true' size={20} />
                        </button>
                        <button onClick={() => navigate('/perfil/chat')} aria-label="Mensajes"
                          className={'cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center transition ' + (scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/15')}>
                          <MessageCircle aria-hidden='true' size={20} />
                        </button>
                      </>
                    )}
                    <button onClick={() => navigate('/perfil/usuario')} title="Mi perfil"
                      className="cursor-pointer! p-0 rounded-full overflow-hidden">
                      {user.foto_perfil
                        ? <img src={user.foto_perfil} alt="" className="w-10 h-10 rounded-full object-cover" />
                        : <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-emerald-700">{user.nombre?.[0]?.toUpperCase()}</span>
                          </div>
                      }
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button onClick={openLogin}
                  className={'cursor-pointer! hidden sm:inline-flex px-4 py-2 text-sm font-semibold transition ' + (scrolled ? 'text-slate-700 hover:text-slate-900' : 'text-white hover:text-emerald-200')}>
                  Iniciar sesión
                </button>
                <button onClick={openRegistro}
                  className="cursor-pointer! inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: ESMERALDA }}>
                  Crear cuenta
                  <ArrowRight aria-hidden='true' size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main id='contenido-principal' tabIndex={-1}>
      <section aria-label="Inicio"
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white">

        {/* Atmósfera del hero: dos halos de color difuminados y una capa de
            grano. Todo decorativo. */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 opacity-25">
            <div className="absolute -top-10 -left-10 w-[28rem] h-[28rem] rounded-full blur-[120px]" style={{ backgroundColor: ESMERALDA }} />
            <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-teal-500 rounded-full blur-[140px]" />
          </div>
          <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={GRANO} />
        </div>

        <div className="relative max-w-[78rem] mx-auto px-6 sm:px-10 pt-24 pb-20 sm:pt-32 sm:pb-26 flex flex-col items-center">

          {/* ── Tarjetas flotantes a los lados del titular (escritorio) ── */}
          <div className="hidden xl:block" aria-hidden="true">
            {TARJETAS_HERO.map(({ icon: Icono, titulo, detalle, acento, posicion, rotacion, retardo, duracion }) => (
              <div
                key={titulo}
                className="absolute z-[5] w-[236px] pointer-events-none bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl ring-1 ring-slate-900/5 flex items-center gap-3 tarjeta-flotante"
                style={{
                  ...posicion,
                  '--rot': rotacion,
                  '--retardo': retardo + 's',
                  '--duracion': duracion + 's',
                  '--retardo-flote': (retardo + 1) + 's',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-100 shrink-0">
                  <Icono aria-hidden="true" size={18} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-xs leading-tight">{titulo}</p>
                  <p className={'text-xs leading-tight mt-0.5 ' + (acento ? 'text-emerald-600 font-medium' : 'text-slate-500')}>{detalle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Columna central de texto ── */}
          <div className="relative z-[2] w-full max-w-2xl flex flex-col items-center text-center">
            <p
              className="inline-flex items-center gap-2.5 mb-7 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-emerald-200"
              style={{ animation: 'heroFadeUp 0.6s ease both' }}
            >
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              Pisos compartidos en España
            </p>

            <h1
              className="font-display font-extrabold text-[clamp(2.4rem,6.4vw,4.25rem)] leading-[1] -tracking-[0.035em] text-balance"
              style={{ animation: 'heroFadeUp 0.7s ease 0.08s both' }}
            >
              El piso perfecto<br />
              empieza por el{' '}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 text-emerald-300">compañero</span>
                {/* Trazo dibujado bajo la palabra clave */}
                <svg
                  className="absolute left-0 -bottom-[0.12em] w-full h-[0.4em] overflow-visible"
                  viewBox="0 0 200 18" preserveAspectRatio="none" aria-hidden="true" focusable="false"
                >
                  <path
                    d="M3 12.5C38 5.5 92 3.5 197 8.5"
                    fill="none" stroke={ESMERALDA} strokeWidth="5" strokeLinecap="round"
                    pathLength="1" className="trazo-subrayado"
                  />
                </svg>
              </span>
              <br />perfecto
            </h1>

            <p
              className="mt-7 text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg text-pretty"
              style={{ animation: 'heroFadeUp 0.7s ease 0.16s both' }}
            >
              Housie te empareja con quien encaja con tu forma de vivir y después os
              organiza el día a día: gastos, tareas, calendario y lista de la compra.
            </p>

            <div className="mt-8 w-full max-w-md" style={{ animation: 'heroFadeUp 0.7s ease 0.24s both' }}>
              <BuscadorCiudad onBuscar={handleBuscar} />
              <p className="mt-3 text-xs text-slate-300">
                ¿Aún no tienes ciudad decidida?{' '}
                <Link
                  to="/buscar"
                  className="font-semibold text-emerald-300 underline underline-offset-4 decoration-emerald-500/60 hover:decoration-emerald-300 transition"
                >
                  Ver todas las habitaciones disponibles
                </Link>
              </p>
            </div>

            <ul
              className="mt-9 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm text-slate-300"
              style={{ animation: 'heroFadeUp 0.7s ease 0.32s both' }}
            >
              {VENTAJAS.map(({ icon: Icono, texto }) => (
                <li key={texto} className="flex items-center gap-2">
                  <Icono aria-hidden="true" size={15} className="text-emerald-400 shrink-0" />
                  {texto}
                </li>
              ))}
            </ul>

          {/* Las mismas tarjetas en móvil, donde no caben a los lados: pasan a
              ser una tira desplazable para que el hero siga enseñando el producto. */}
          <ul
            className="xl:hidden self-stretch -mx-6 sm:-mx-10 mt-10 px-6 sm:px-10 flex gap-3 overflow-x-auto no-scrollbar"
            style={{ animation: 'heroFadeUp 0.7s ease 0.4s both' }}
          >
            {TARJETAS_HERO.map(({ icon: Icono, titulo, detalle, acento }) => (
              <li
                key={titulo}
                className="shrink-0 bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/20 shrink-0">
                  <Icono aria-hidden="true" size={16} className="text-emerald-300" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs whitespace-nowrap leading-tight">{titulo}</p>
                  <p className={'text-xs whitespace-nowrap leading-tight mt-0.5 ' + (acento ? 'text-emerald-300' : 'text-slate-300')}>{detalle}</p>
                </div>
              </li>
            ))}
          </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── */}
      {/* CÓMO FUNCIONA                                */}
      {/* ─────────────────────────────────────────── */}
      <section aria-labelledby="como-funciona-heading" className="relative bg-white pt-20 sm:pt-28 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">

          <Reveal className="mb-4 flex items-baseline gap-4">
            <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-emerald-700 shrink-0">
              Cómo funciona
            </p>
            <span className="flex-1 h-px bg-slate-200" aria-hidden="true" />
          </Reveal>

          <Reveal delay={60}>
            <h2
              id="como-funciona-heading"
              className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold text-slate-900 leading-[1.05] -tracking-[0.03em] max-w-2xl"
            >
              Dos formas de <span style={{ color: '#059669' }}>empezar</span>,<br />una sola plataforma
            </h2>
            <p className="mt-5 text-slate-500 text-base sm:text-lg leading-relaxed max-w-xl text-pretty">
              Da igual en qué punto estés: buscando habitación o con una libre en tu piso.
              Housie cubre las dos y sigue contigo después.
            </p>
          </Reveal>

          {/* Los dos puntos de partida — alternativas en paralelo, no pasos */}
          <ul className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 list-none">
            {puntosDePartida.map(({ title, descripcion }, i) => (
              // El desplazamiento del hover va en el div interior: `Reveal` ya
              // usa `transform` en línea para su animación de entrada y una
              // clase de Tailwind no podría sobreescribirlo.
              <Reveal key={title} as="li" delay={i * 130}>
                <div className="h-full bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-[0_2px_4px_rgba(15,23,42,0.04),0_14px_36px_-12px_rgba(15,23,42,0.22)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_6px_12px_rgba(15,23,42,0.05),0_26px_52px_-14px_rgba(15,23,42,0.3)]">
                  <h3 className="font-display text-xl sm:text-[1.375rem] font-semibold leading-snug text-slate-900">{title}</h3>
                  <p className="mt-3 text-slate-500 text-sm leading-relaxed text-pretty">{descripcion}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          {/* Confluencia: las dos alternativas desembocan en la sección siguiente */}
          <Reveal delay={260} className="flex flex-col items-center pt-10">
            <span aria-hidden="true" className="w-0.5 h-14" style={{ background: 'linear-gradient(to bottom, #e2e8f0, ' + ESMERALDA + ')' }} />
            <ChevronDown aria-hidden="true" size={18} strokeWidth={2.4} className="-mt-1" style={{ color: ESMERALDA }} />
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────── */}
      {/* Y DESPUÉS — LA CONVIVENCIA                   */}
      {/* ─────────────────────────────────────────── */}
      <section aria-labelledby="convivencia-heading" className="bg-white pt-10 pb-20 sm:pb-28 px-6 sm:px-10">
        <Reveal className="relative max-w-5xl mx-auto bg-slate-900 rounded-3xl p-8 sm:p-14 overflow-hidden">
          <div aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-20 w-96 h-96 rounded-full blur-[130px] opacity-20"
            style={{ backgroundColor: ESMERALDA }} />

          <div className="relative">
            <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-300 mb-5">
              Y después
            </p>
            <h2 id="convivencia-heading"
              className="font-display text-[clamp(1.9rem,4.4vw,2.75rem)] font-bold text-white leading-[1.05] -tracking-[0.03em]">
              Ya vivís juntos
            </h2>
            <p className="mt-5 text-slate-300 text-base leading-relaxed max-w-2xl text-pretty">
              Gestionáis tareas rotativas, gastos divididos, calendario y lista de la compra.
              Todo conectado, nada se olvida ni se discute.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              {!user?.es_casero && (
                <button
                  onClick={user ? () => navigate('/perfil/usuario') : openRegistro}
                  className="cursor-pointer! group inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[0.9375rem] font-semibold px-6 py-3.5 rounded-xl transition-colors"
                >
                  Empezar ahora — es gratis
                  <ArrowRight aria-hidden="true" size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              )}
              <Link
                to="/faq"
                className="inline-flex items-center border-2 border-slate-300/25 hover:border-emerald-500 rounded-xl text-[0.9375rem] font-semibold text-slate-300 hover:text-white px-6 py-3 transition-colors"
              >
                Resolver dudas en las preguntas frecuentes
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─────────────────────────────────────────── */}
      {/* COMPATIBILIDAD                               */}
      {/* ─────────────────────────────────────────── */}
      <section aria-labelledby="compatibilidad-heading" className="bg-white pb-20 sm:pb-28 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">

          <Reveal className="mb-4 flex items-baseline gap-4">
            <span className="flex-1 h-px bg-slate-200" aria-hidden="true" />
            <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-emerald-700 shrink-0">
              Compatibilidad
            </p>
          </Reveal>

          <Reveal delay={60} className="sm:text-right">
            <h2
              id="compatibilidad-heading"
              className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold text-slate-900 leading-[1.05] -tracking-[0.03em] sm:ml-auto max-w-2xl text-balance"
            >
              Sabes cuánto <span style={{ color: '#059669' }}>encajáis</span> antes de escribir el primer mensaje
            </h2>
            <p className="mt-5 text-slate-500 text-base sm:text-lg leading-relaxed sm:ml-auto max-w-xl text-pretty">
              Mismo anuncio, dos personas: una con su perfil de convivencia
              completo y otra sin él.{' '}
              <span className="hidden lg:inline">Arrastra para comprobarlo.</span>
              <span className="lg:hidden">Pulsa el botón para comprobarlo.</span>
            </p>
          </Reveal>

          <Reveal delay={120}>
            <ComparadorCompatibilidad />
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────── */}
      {/* FUNCIONALIDADES                              */}
      {/* ─────────────────────────────────────────── */}
      <section aria-labelledby="features-heading" className="bg-slate-50 py-20 sm:py-28 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">

          <Reveal className="mb-4 flex items-baseline gap-4">
            <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-emerald-700 shrink-0">
              La plataforma
            </p>
            <span className="flex-1 h-px bg-slate-200" aria-hidden="true" />
          </Reveal>

          <Reveal delay={60}>
            <h2
              id="features-heading"
              className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold text-slate-900 leading-[1.05] -tracking-[0.03em] max-w-2xl"
            >
              Todo lo que <span style={{ color: '#059669' }}>necesitas</span>,<br />ya está cubierto
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 border-t border-slate-200">
            {funcionalidades.map(({ icon: Icono, title, descripcion }, i) => (
              <Reveal key={title} delay={(i % 2) * 80}>
                <article
                  className={'group relative flex gap-5 py-9 border-b border-slate-200 transition-colors hover:bg-white ' + (
                    i % 2 === 0 ? 'sm:pr-10 sm:pl-2' : 'sm:pl-10 sm:border-l sm:border-slate-200'
                  )}
                >
                  {/* Barra de acento que crece al pasar por encima */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 bottom-[-1px] h-[2px] w-0 bg-emerald-500 transition-all duration-300 group-hover:w-full"
                  />
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-emerald-100 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icono aria-hidden="true" size={19} style={{ color: '#047857' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1.5">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{descripcion}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Llamada a la acción" className="py-20 sm:py-28 px-6 sm:px-10 bg-white">
        <Reveal>
          <div className="relative max-w-5xl mx-auto rounded-[1.75rem] p-10 sm:p-16 text-center border-2 border-slate-900 bg-white overflow-hidden shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">

            {/* Manchas decorativas de fondo */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.14), transparent 70%)' }} />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.10), transparent 70%)' }} />
            {/* Rejilla tenue que ata esta tarjeta con la textura del hero */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                backgroundSize: '22px 22px',
                maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 35%, #000 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 35%, #000 100%)',
              }}
            />

            <div className="relative">

            {user?.es_casero ? (
              <>
                <h2 className="font-display text-[clamp(1.9rem,4.6vw,3rem)] font-bold mb-5 leading-[1.05] -tracking-[0.03em] text-slate-900">
                  Todo listo para<br /><span style={{ color: ESMERALDA }}>gestionar</span> tus facturas
                </h2>
                <p className="text-slate-500 text-base sm:text-lg mb-10 max-w-lg mx-auto">
                  Accede a tu panel de gestión y mantén el control de los pagos de tus inquilinos en tiempo real.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={() => navigate('/casero/facturas')}
                    className="cursor-pointer! group inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all active:scale-95 shadow-lg shadow-emerald-700/25 hover:shadow-emerald-600/35">
                    Ir a gestión de facturas
                  </button>
                </div>
                <div className="mt-10 flex flex-wrap gap-2.5 justify-center text-slate-600 text-sm">
                  <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5"><CheckCircle2 aria-hidden='true' size={14} className="text-emerald-600" /> División automática</span>
                  <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5"><CheckCircle2 aria-hidden='true' size={14} className="text-emerald-600" /> Seguimiento de pagos</span>
                  <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5"><CheckCircle2 aria-hidden='true' size={14} className="text-emerald-600" /> Varios pisos</span>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-[clamp(1.9rem,4.6vw,3rem)] font-bold mb-5 leading-[1.05] -tracking-[0.03em] text-slate-900">
                  {!user
                    ? <>¿Listo para <span style={{ color: ESMERALDA }}>encontrar</span> tu<br />piso y compañeros ideales?</>
                    : !tieneGrupo
                      ? <>¿Ya tienes piso?<br /><span style={{ color: ESMERALDA }}>Únete</span> o crea tu grupo</>
                      : <>Tu piso, <span style={{ color: ESMERALDA }}>organizado</span><br />en un solo sitio</>}
                </h2>
                <p className="text-slate-500 text-base sm:text-lg mb-10 max-w-lg mx-auto">
                  {!user
                    ? 'Entra a tu perfil para completar tu información de convivencia, encuentra pisos compatibles y conecta con tus futuros compañeros.'
                    : !tieneGrupo
                      ? 'Introduce el código que te ha dado tu compañero de piso, o crea tú el grupo y comparte el código.'
                      : 'Reparte las tareas, controla los gastos y mantén el calendario al día con tus compañeros de piso.'}
                </p>

                {user && !tieneGrupo ? (
                  <form onSubmit={handleUnirseCodigo} className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
                    <div className="w-full flex gap-2">
                      <input
                        type="text"
                        value={codigoHome}
                        onChange={e => setCodigoHome(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                        placeholder="ABC123"
                        aria-label="Código de acceso del grupo"
                        maxLength={6}
                        className={`flex-1 min-w-0 px-6 py-3.5 rounded-xl bg-slate-50 border-2 outline-none transition-all text-center tracking-[0.4em] font-bold text-xl text-slate-900 placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500
                          ${errorHome ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-100'}`}
                      />
                      <button
                        type="submit"
                        disabled={loadingHome || codigoHome.length === 0}
                        className="cursor-pointer! shrink-0 inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-semibold px-6 py-3.5 rounded-xl text-base transition active:scale-95">
                        {loadingHome
                          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <>Unirse <ArrowRight aria-hidden='true' size={16} /></>}
                      </button>
                    </div>
                    {errorHome && (
                      <p className="flex items-center gap-1 text-xs text-red-500 -mt-2">
                        <AlertCircle aria-hidden='true' size={11} /> {errorHome}
                      </p>
                    )}
                    {mensajeHome && (
                      <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 w-full -mt-2">
                        <CheckCircle2 aria-hidden='true' size={16} className="shrink-0 mt-0.5" />
                        <span>{mensajeHome}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs text-slate-500 font-medium">o</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/creacion-grupo')}
                      className="cursor-pointer! w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition active:scale-95">
                      Crear mi grupo
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      onClick={user ? () => navigate('/perfil/usuario') : openRegistro}
                      className="cursor-pointer! group inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all active:scale-95 shadow-lg shadow-emerald-700/25 hover:shadow-emerald-600/35">
                      {user ? 'Ir a mi perfil' : 'Crear cuenta gratis'}
                    </button>
                    <button
                      onClick={user ? () => navigate('/grupo') : openLogin}
                      className="cursor-pointer! inline-flex items-center gap-2 border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white text-slate-600 font-semibold px-8 py-3.5 rounded-xl text-base transition">
                      {user ? 'Mi grupo de convivencia' : 'Iniciar sesión'}
                    </button>
                  </div>
                )}

                <div className="mt-10 flex flex-wrap gap-2.5 justify-center text-slate-600 text-sm">
                  <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5"><CheckCircle2 aria-hidden='true' size={14} className="text-emerald-600" /> Compatibilidad</span>
                  <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5"><CheckCircle2 aria-hidden='true' size={14} className="text-emerald-600" /> Convivencia</span>
                  <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5"><CheckCircle2 aria-hidden='true' size={14} className="text-emerald-600" /> Comunidad</span>
                </div>
              </>
            )}
            </div>
          </div>
        </Reveal>
      </section>

      </main>

      <PieDePagina />

      <style>{`
        /* Google Places autocomplete dropdown */
        .pac-container {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          margin-top: 6px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          font-family: inherit;
          overflow: hidden;
        }
        .pac-item {
          padding: 10px 14px;
          color: #cbd5e1;
          border-top: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          font-size: 13px;
        }
        .pac-item:first-child { border-top: none; }
        .pac-item:hover, .pac-item-selected {
          background: rgba(16,185,129,0.15);
          color: #fff;
        }
        .pac-item-query { color: #fff; font-weight: 600; }
        .pac-icon { display: none; }
        .pac-logo::after { display: none; }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Igual que heroFadeUp, pero conservando la inclinación de la tarjeta. */
        @keyframes heroFadeUpInclinado {
          from { opacity: 0; transform: translateY(24px) rotate(var(--rot, 0deg)); }
          to   { opacity: 1; transform: translateY(0) rotate(var(--rot, 0deg)); }
        }

        /* El subrayado del titular se dibuja de izquierda a derecha una vez que
           el texto ya ha entrado, para que la mirada caiga en la palabra clave. */
        @keyframes trazoSubrayado {
          from { stroke-dashoffset: 1; }
          to   { stroke-dashoffset: 0; }
        }
        .trazo-subrayado {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: trazoSubrayado 0.9s cubic-bezier(0.65, 0, 0.35, 1) 0.7s both;
        }

        /* Flotación muy lenta y desincronizada de las tarjetas del hero: cada
           una recibe su retardo y su duración por variables CSS en línea. */
        @keyframes flotar {
          0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
          50%      { transform: translateY(-7px) rotate(var(--rot, 0deg)); }
        }
        .tarjeta-flotante {
          animation:
            heroFadeUpInclinado 0.6s ease var(--retardo, 0s) both,
            flotar var(--duracion, 8s) ease-in-out var(--retardo-flote, 1.5s) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .trazo-subrayado  { stroke-dashoffset: 0; animation: none; }
          .tarjeta-flotante { animation: none; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

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
