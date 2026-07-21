import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../lib/apiFetch'
import {
  ArrowRight, Bed, Users, CalendarCheck,
  ShoppingCart, Receipt, MessageCircle, House,
  Heart, CheckCircle2, MapPin, Shield, Zap, Search, Handshake, AlertCircle,
} from 'lucide-react'
import habitacionhero from '../assets/habitacionhero.jpg'
import LoginModal from '../components/LoginModal.jsx'
import RegistroModal from '../components/RegistroModal.jsx'

const ESMERALDA = '#10b981'

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

function Reveal({ children, delay = 0, className = '', from = 'bottom' }) {
  const [ref, visible] = useInView()
  const translateMap = { bottom: 'translateY(28px)', left: 'translateX(-28px)', right: 'translateX(28px)' }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0,0)' : translateMap[from],
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

const pasos =[
  {
    n: '01',
    icon: Search,
    title: 'Buscas piso',
    descripcion:'Creas tu perfil de convivencia, ves pisos ordenados por compatibilidad, mandas solicitud y chateas directo con el grupo.',
    destacado:false,
  },
  {
    n: '02',
    icon: House,
    title: 'Tienes habitación libre',
    descripcion:'Publicas la habitación, recibes solicitudes filtradas por compatibilidad, aceptas el match e integras al nuevo compañero.',
    destacado:false,
  },
  {
    n: '03',
    icon: Handshake,
    title: 'Ya vivís juntos',
    descripcion:'Gestionáis tareas rotativas, gastos divididos, calendario y lista de la compra. Todo conectado, nada se olvida ni se discute.',
    destacado:true,
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
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 focus-within:border-emerald-400/60 transition-colors">
      <MapPin size={18} className="text-emerald-400 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        placeholder="¿En qué ciudad buscas piso?"
        onKeyDown={handleKey}
        className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm outline-none min-w-0"
      />
      <button
        onClick={() => onBuscar(inputRef.current?.value?.trim() ?? '')}
        className="cursor-pointer! shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white transition hover:opacity-80 active:scale-95"
        style={{ backgroundColor: ESMERALDA }}
        aria-label="Buscar"
      >
        <ArrowRight size={15} />
      </button>
    </div>
  )
}

export default function Home({ tieneGrupo, setTieneGrupo }) {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registroOpen, setRegistroOpen] = useState(false)
  const [codigoHome, setCodigoHome] = useState('')
  const [loadingHome, setLoadingHome] = useState(false)
  const [errorHome, setErrorHome] = useState('')
  const [mensajeHome, setMensajeHome] = useState('')

  const openRegistro = () => setRegistroOpen(true)
  const openLogin = () => setLoginOpen(true)

  const handleBuscar = (ciudad) => {
    const c = ciudad?.trim()
    navigate(c ? `/buscar?ciudad=${encodeURIComponent(c)}` : '/buscar')
  }

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

      setTieneGrupo?.(true)
      navigate('/grupo')
    } catch {
      setErrorHome('Error de conexión con el servidor')
    } finally {
      setLoadingHome(false)
    }
  }

  return (
    <div className="overflow-x-hidden">

      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-[80rem] mx-auto flex items-center gap-3 sm:gap-6 px-4 sm:px-10 py-3.5">

          <button onClick={() => navigate('/')} className="cursor-pointer! font-display text-2xl font-bold -tracking-[0.02em] text-slate-900 shrink-0">
            Housie
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                {user.es_casero ? (
                  <>
                    <button onClick={() => navigate('/casero/facturas')} title="Gestión de facturas"
                      className="cursor-pointer! sm:hidden w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
                      <Receipt size={20} />
                    </button>
                    <button onClick={() => navigate('/casero/facturas')}
                      className="cursor-pointer! hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:underline underline-offset-4 decoration-2 transition">
                      Gestión de facturas
                    </button>
                  </>
                ) : (
                  <>
                    {tieneGrupo ? (
                      <button onClick={() => navigate('/grupo')} title="Mi grupo"
                        className="cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
                        <House size={20} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => navigate('/perfil/favoritos')} title="Favoritos"
                          className="cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
                          <Heart size={20} />
                        </button>
                        <button onClick={() => navigate('/perfil/chat')} title="Mensajes"
                          className="cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
                          <MessageCircle size={20} />
                        </button>
                      </>
                    )}
                    <button onClick={() => navigate('/perfil/usuario')} title="Mi perfil"
                      className="cursor-pointer! p-0 rounded-full overflow-hidden">
                      {user.foto_perfil
                        ? <img src={user.foto_perfil} alt="Perfil" className="w-10 h-10 rounded-full object-cover" />
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
                  className="cursor-pointer! hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition">
                  Iniciar sesión
                </button>
                <button onClick={openRegistro}
                  className="cursor-pointer! inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: ESMERALDA }}>
                  Crear cuenta
                  <ArrowRight size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <section aria-label="Inicio"
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white">

        <div className="absolute inset-0 opacity-25 pointer-events-none" aria-hidden="true">
          <div className="absolute top-16 left-8 w-80 h-80 rounded-full blur-[110px]" style={{ backgroundColor: ESMERALDA }} />
          <div className="absolute bottom-8 right-8 w-96 h-96 bg-teal-500 rounded-full blur-[130px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-12 pb-16 sm:pt-20 sm:pb-28 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">

          {/* Texto */}
          <div className="max-w-xl" style={{ animation: 'heroFadeUp 0.7s ease both' }}>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium px-4 py-1.5 rounded-full mb-6">
              <CheckCircle2 size={13} />
              La plataforma para encontrar tu piso compartido
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight">
              El piso perfecto<br />
              <span style={{ color: '#34d399' }}>empieza por</span><br />
              el compañero perfecto
            </h1>

            <p className="mt-5 text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg">
              Busca habitación, conecta con compañeros compatibles y gestiona la convivencia. Todo en un solo lugar.
            </p>

            <div className="mt-7 max-w-md">
              <BuscadorCiudad onBuscar={handleBuscar} />
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Shield size={14} className="text-emerald-400" /> Gratuita</span>
              <span className="flex items-center gap-1.5"><Zap size={14} className="text-emerald-400" /> Registro en segundos</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-400" /> Disponible en España</span>
            </div>
          </div>

          {/* Imagen */}
          <div className="hidden lg:block relative min-w-0" style={{ animation: 'heroFadeRight 0.8s ease 0.15s both' }}>
            <img src={habitacionhero} alt="Habitación compartida moderna en España"
              width={520} height={360}
              className="w-full max-w-[520px] h-[360px] object-cover rounded-3xl shadow-2xl"
              loading="eager" />

            <div className="absolute top-4 left-[-20px] bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
              style={{ animation: 'heroFadeUp 0.6s ease 0.4s both' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-100">
                <CalendarCheck size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-xs">Tarea completada</p>
                <p className="text-xs text-slate-500">Cocina — María</p>
              </div>
            </div>

            <div className="absolute bottom-6 right-[-20px] bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
              style={{ animation: 'heroFadeUp 0.6s ease 0.55s both' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-100">
                <Receipt size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-xs">Factura luz</p>
                <p className="text-xs text-emerald-600 font-medium">Pagada ✓</p>
              </div>
            </div>

            <div className="absolute bottom-[-18px] left-16 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
              style={{ animation: 'heroFadeUp 0.6s ease 0.7s both' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-100">
                <Heart size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-xs">3 compañeros compatibles</p>
                <p className="text-xs text-slate-500">Disponibles ya</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── */}
      {/* CÓMO FUNCIONA — editorial table              */}
      {/* ─────────────────────────────────────────── */}
      <section aria-labelledby="como-funciona-heading" className="bg-white py-16 sm:py-24 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">

          <Reveal className="mb-12">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
              Cómo funciona
            </p>
            <h2 id="como-funciona-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Tres situaciones,<br />una plataforma
            </h2>
          </Reveal>

          {/* Stepper — horizontal en desktop, vertical en mobile */}
          <div className="mt-14 relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0">

            {/* Línea conectora — solo en desktop */}
            <div
              className="hidden sm:block absolute h-px bg-slate-200 z-0"
              style={{ top: '24px', left: 'calc(100% / 6 + 24px)', right: 'calc(100% / 6 + 24px)' }}
            />

            {pasos.map(({ n, icon: Icono, title, descripcion, destacado }, i) => (
              <Reveal key={n} delay={i * 130} className="flex flex-col sm:items-center gap-3 sm:gap-0 text-left sm:text-center sm:px-6">

                {/* Círculo numerado */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-sm border-2 shrink-0 transition-shadow ${
                    destacado
                      ? 'text-white border-transparent shadow-lg'
                      : 'text-slate-600 bg-white border-slate-200'
                  }`}
                  style={destacado
                    ? { backgroundColor: ESMERALDA, boxShadow: '0 8px 24px -4px rgba(16,185,129,0.35)' }
                    : {}}
                >
                  {n}
                </div>

                {/* Icono */}
                <div
                  className={`mt-1 sm:mt-7 mb-1 sm:mb-4 w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center ${
                    destacado ? 'bg-emerald-50' : 'bg-slate-50'
                  }`}
                >
                  <Icono size={20} style={{ color: destacado ? ESMERALDA : '#64748b' }} />
                </div>

                {/* Título */}
                <h3 className={`font-bold text-base sm:text-lg leading-snug mb-2 ${
                  destacado ? 'text-emerald-700' : 'text-slate-900'
                }`}>
                  {title}
                </h3>

                {/* Descripción */}
                <p className="text-slate-500 text-sm leading-relaxed">
                  {descripcion}
                </p>

              </Reveal>
            ))}
          </div>

          <Reveal delay={350} className="mt-10">
            {!user?.es_casero && (
              <button
                onClick={user ? () => navigate('/perfil/usuario') : openRegistro}
                className="cursor-pointer! inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3"
                style={{ color: ESMERALDA }}>
                Empezar ahora — es gratis
                <ArrowRight size={15} />
              </button>
            )}
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="bg-slate-50 py-16 sm:py-24 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">

          <Reveal className="mb-12 text-right">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
              La plataforma
            </p>
            <h2 id="features-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Todo lo que necesitas<br />lo tenemos cubierto
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-slate-200">
            {funcionalidades.map(({ icon: Icono, title, descripcion }, i) => (
              <Reveal key={title} delay={(i % 2) * 80}>
                <article className={`flex gap-5 py-8 border-b border-slate-200 ${i % 2 === 0 ? 'sm:pr-10' : 'sm:pl-10 sm:border-l sm:border-slate-200'}`}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: '#d1fae5' }}>
                    <Icono size={18} style={{ color: ESMERALDA }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{descripcion}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Llamada a la acción" className="py-20 px-6 sm:px-10">
        <Reveal>
          <div className="relative max-w-5xl mx-auto rounded-3xl p-10 sm:p-14 text-center border-2 border-slate-900 bg-white overflow-hidden">

            {/* Manchas decorativas de fondo */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)' }} />
            <div className="pointer-events-none absolute -bottom-20 -left-20 w-56 h-56 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)' }} />

            {user?.es_casero ? (
              <>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-slate-900">
                  Todo listo para<br /><span style={{ color: ESMERALDA }}>gestionar</span> tus facturas
                </h2>
                <p className="text-slate-500 text-base sm:text-lg mb-10 max-w-lg mx-auto">
                  Accede a tu panel de gestión y mantén el control de los pagos de tus inquilinos en tiempo real.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={() => navigate('/casero/facturas')}
                    className="cursor-pointer! inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition active:scale-95">
                    Ir a gestión de facturas
                  </button>
                </div>
                <div className="mt-10 flex flex-wrap gap-6 justify-center text-slate-500 text-sm">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> División automática</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> Seguimiento de pagos</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> Varios pisos</span>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-slate-900">
                  {user && !tieneGrupo
                    ? <>¿Ya tienes piso?<br /><span style={{ color: ESMERALDA }}>Únete</span> o crea tu grupo</>
                    : <>¿Listo para <span style={{ color: ESMERALDA }}>encontrar</span> tu<br />piso y compañeros ideales?</>}
                </h2>
                <p className="text-slate-500 text-base sm:text-lg mb-10 max-w-lg mx-auto">
                  {user && !tieneGrupo
                    ? 'Introduce el código que te ha dado tu compañero de piso, o crea tú el grupo y comparte el código.'
                    : 'Entra a tu perfil para completar tu información de convivencia, encuentra pisos compatibles y conecta con tus futuros compañeros.'}
                </p>

                {user && !tieneGrupo ? (
                  <form onSubmit={handleUnirseCodigo} className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
                    <div className="w-full flex gap-2">
                      <input
                        type="text"
                        value={codigoHome}
                        onChange={e => setCodigoHome(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                        placeholder="ABC123"
                        maxLength={6}
                        className={`flex-1 min-w-0 px-6 py-3.5 rounded-xl bg-slate-50 border-2 outline-none transition-all text-center tracking-[0.4em] font-bold text-xl text-slate-900 placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-300
                          ${errorHome ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-100'}`}
                      />
                      <button
                        type="submit"
                        disabled={loadingHome || codigoHome.length === 0}
                        className="cursor-pointer! shrink-0 inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-semibold px-6 py-3.5 rounded-xl text-base transition active:scale-95">
                        {loadingHome
                          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <>Unirse <ArrowRight size={16} /></>}
                      </button>
                    </div>
                    {errorHome && (
                      <p className="flex items-center gap-1 text-xs text-red-500 -mt-2">
                        <AlertCircle size={11} /> {errorHome}
                      </p>
                    )}
                    {mensajeHome && (
                      <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 w-full -mt-2">
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                        <span>{mensajeHome}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs text-slate-400 font-medium">o</span>
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
                      className="cursor-pointer! inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition active:scale-95">
                      {user ? 'Ir a mi perfil' : 'Crear cuenta gratis'}
                    </button>
                    <button
                      onClick={user ? () => navigate('/grupo') : openLogin}
                      className="cursor-pointer! inline-flex items-center gap-2 border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white text-slate-600 font-semibold px-8 py-3.5 rounded-xl text-base transition">
                      {user ? 'Mi grupo de convivencia' : 'Iniciar sesión'}
                    </button>
                  </div>
                )}

                <div className="mt-10 flex flex-wrap gap-6 justify-center text-slate-500 text-sm">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> Compatibilidad</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> Convivencia</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> Comunidad</span>
                </div>
              </>
            )}
          </div>
        </Reveal>
      </section>

      <footer className="bg-slate-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <span className="font-display font-bold text-white text-2xl">Housie</span>
              <p className="mt-3 text-slate-400 text-sm max-w-xs leading-relaxed">
                La plataforma para encontrar compañeros de piso compatibles y gestionar la convivencia.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Plataforma</p>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <button onClick={() => navigate('/buscar')}
                    className="cursor-pointer! text-slate-400 hover:text-white text-sm transition">
                    Buscar habitación
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/')}
                    className="cursor-pointer! text-slate-400 hover:text-white text-sm transition">
                    Mi grupo
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Ayuda</p>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <button onClick={() => navigate('/faq')}
                    className="cursor-pointer! text-slate-400 hover:text-white text-sm transition">
                    Preguntas frecuentes
                  </button>
                </li>
                <li>
                  <a href="mailto:housie.app@gmail.com"
                    className="text-slate-400 hover:text-white text-sm transition">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© 2026 Housie. Todos los derechos reservados.</p>
            <p className="text-slate-600 text-xs">Hecho con ♥ para estudiantes y jóvenes de España</p>
          </div>
        </div>
      </footer>

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
        @keyframes heroFadeRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={(u) => { setUser(u); setLoginOpen(false) }}
          onSwitchToRegistro={() => { setLoginOpen(false); setRegistroOpen(true) }}
        />
      )}
      {registroOpen && (
        <RegistroModal
          onClose={() => setRegistroOpen(false)}
          onSuccess={(u, esCasero) => { setUser(u); setRegistroOpen(false); navigate(esCasero ? '/' : '/perfil/usuario/editar') }}
          onSwitchToLogin={() => { setRegistroOpen(false); setLoginOpen(true) }}
        />
      )}
    </div>
  )
}
