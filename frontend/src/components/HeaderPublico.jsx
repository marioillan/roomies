import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, Heart, MessageCircle, House, Receipt } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

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

export default function HeaderPublico({
  ciudad = '',
  onCiudadChange,
  onBuscarCiudad,
  mostrarBuscador = true,
  onIniciarSesion,
  children,
}) {
  const navigate = useNavigate()
  const { user, tieneGrupo } = useAuth()

  const iconoCls = 'cursor-pointer! hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-slate-600 hover:bg-slate-100 transition'

  return (
    <header className='sticky top-0 z-30 bg-white border-b border-slate-200'>
      <div className='max-w-[80rem] mx-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-6 lg:px-10 py-3.5'>

        <button onClick={() => navigate('/')} className='cursor-pointer! shrink-0 flex items-center'>
          <span className='font-display text-xl sm:text-2xl font-bold -tracking-[0.02em] text-slate-900'>Housie</span>
        </button>

        {mostrarBuscador
          ? (
            <div className='flex-1 min-w-0 flex items-center gap-2 sm:max-w-[34rem] sm:mx-auto'>
              <InputCiudad value={ciudad} onChange={onCiudadChange} onBuscar={onBuscarCiudad} />
              {children}
            </div>
          )
          : <div className='flex-1' />
        }

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
                <button onClick={() => navigate('/grupo')} aria-label='Mi grupo' className={iconoCls}>
                  <House aria-hidden='true' size={20} />
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/perfil/favoritos')} aria-label='Favoritos' className={iconoCls}>
                    <Heart aria-hidden='true' size={20} />
                  </button>
                  <button onClick={() => navigate('/perfil/chat')} aria-label='Mensajes' className={iconoCls}>
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
              onClick={() => (onIniciarSesion ? onIniciarSesion() : navigate('/'))}
              className='cursor-pointer! hidden sm:block text-sm font-semibold text-slate-700 hover:text-slate-900 transition px-4 py-2 whitespace-nowrap'
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
