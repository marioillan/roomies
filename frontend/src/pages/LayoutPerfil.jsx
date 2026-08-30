import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { SaltarAlContenido } from '../components/Accesibilidad.jsx'
import { useModalAccesible } from '../lib/useModalAccesible.js'
import { apiFetch } from '../lib/apiFetch'
import {
  ArrowLeft, CircleUserRound, LogOut, User, Heart, MessageCircle,
  Home, UserCheck, Users, Settings, Trash2, AlertCircle, TriangleAlert,
} from 'lucide-react'

// Palabra que el usuario debe teclear para habilitar el borrado de cuenta.
const CONFIRMACION_BORRADO = 'ELIMINAR'

const navItems = [
  { icon: Home,          path: '/',                  exact: true,  title: 'Inicio' },
  { icon: User,          path: '/perfil/usuario',    exact: false, title: 'Mi perfil' },
  { icon: MessageCircle, path: '/perfil/chat',       exact: false, title: 'Mensajes' },
  { icon: Heart,         path: '/perfil/favoritos',  exact: false, title: 'Favoritos' },
]

/**
 * Menú flotante de cuenta. `direccion` decide hacia dónde se abre:
 * 'derecha' en la barra lateral de escritorio (mide 100px, no cabe debajo)
 * y 'arriba' en la barra inferior de móvil.
 */
function MenuCuenta({ direccion, refDisparador, onCerrarSesion, onEliminarCuenta, onCerrar }) {
  const refMenu = useRef(null)

  useEffect(() => {
    const alPulsarFuera = (e) => {
      // El propio botón que abre el menú se excluye: si no, cerraría aquí y su
      // onClick lo volvería a abrir, y nunca se podría cerrar pulsándolo.
      if (refDisparador?.current?.contains(e.target)) return
      if (!refMenu.current?.contains(e.target)) onCerrar()
    }
    const alPulsarTecla = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('mousedown', alPulsarFuera)
    document.addEventListener('keydown', alPulsarTecla)
    return () => {
      document.removeEventListener('mousedown', alPulsarFuera)
      document.removeEventListener('keydown', alPulsarTecla)
    }
  }, [onCerrar, refDisparador])

  const posicion = direccion === 'derecha'
    ? 'left-full bottom-0 ml-2'
    : 'bottom-full right-0 mb-2'

  return (
    <div
      ref={refMenu}
      role='menu'
      aria-label='Opciones de cuenta'
      className={`absolute ${posicion} z-50 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 flex flex-col`}
    >
      <button
        role='menuitem'
        onClick={onCerrarSesion}
        className='cursor-pointer! flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 transition'
      >
        <LogOut aria-hidden='true' size={16} className='shrink-0' />
        Cerrar sesión
      </button>
      <button
        role='menuitem'
        onClick={onEliminarCuenta}
        className='cursor-pointer! flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition'
      >
        <Trash2 aria-hidden='true' size={16} className='shrink-0' />
        Eliminar cuenta
      </button>
    </div>
  )
}

function LayoutPerfil({ onLogout }) {
  const { user, tieneGrupo } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  // Un solo menú de cuenta compartido: 'escritorio' | 'movil' | null. Se guarda
  // cuál lo abrió para devolverle el foco al cerrarse.
  const [menuAbierto, setMenuAbierto] = useState(null)
  const btnCuentaEscritorioRef = useRef(null)
  const btnCuentaMovilRef = useRef(null)

  const [modalEliminar, setModalEliminar] = useState(false)
  const [textoConfirmacion, setTextoConfirmacion] = useState('')
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  const cerrarMenu = () => {
    const boton = menuAbierto === 'movil' ? btnCuentaMovilRef.current : btnCuentaEscritorioRef.current
    setMenuAbierto(null)
    boton?.focus()
  }

  const abrirModalEliminar = () => {
    setMenuAbierto(null)
    setTextoConfirmacion('')
    setErrorEliminar('')
    setModalEliminar(true)
  }

  const cerrarModalEliminar = () => {
    setModalEliminar(false)
    setTextoConfirmacion('')
    setErrorEliminar('')
  }

  const refModalEliminar = useModalAccesible(cerrarModalEliminar, modalEliminar)

  const confirmacionValida = textoConfirmacion.trim().toUpperCase() === CONFIRMACION_BORRADO

  const handleEliminarCuenta = async () => {
    if (!confirmacionValida || eliminando) return
    setEliminando(true)
    setErrorEliminar('')
    try {
      const res = await apiFetch('/api/perfil/cuenta', { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        // 409 con esAdmin: el usuario debe transferir la administración antes.
        setErrorEliminar(json.message ?? 'No se ha podido eliminar la cuenta')
        setEliminando(false)
        return
      }
      // La cuenta ya no existe y el backend ha limpiado las cookies: se
      // reutiliza el cierre de sesión para vaciar el contexto y volver a la
      // portada, en vez de dejar al usuario en una ruta de /perfil sin datos.
      setModalEliminar(false)
      await onLogout()
    } catch {
      setErrorEliminar('Error de conexión con el servidor')
      setEliminando(false)
    }
  }

  return (
    <div className='min-h-screen bg-slate-100 md:h-screen md:overflow-hidden md:flex'>
      <SaltarAlContenido />

      {/* Sidebar izquierdo — oculto en mobile */}
      <aside
        className='group hidden md:flex w-25 shrink-0 flex-col min-h-screen sticky top-0 h-screen'
        style={{ backgroundColor: '#0b8059' }}
      >
        {/* Logo */}
        <div className='flex justify-center py-5'>
          <button onClick={() => navigate('/')} aria-label='Ir al inicio' className='cursor-pointer!'>
            <img src='/logohousie.png' alt='Housie' className='w-20 h-20 object-contain' />
          </button>
        </div>

        {/* Nav */}
        <nav aria-label='Navegación de mi perfil' className='flex-1 px-2 py-4 flex flex-col gap-1'>
          {navItems.filter(n => n.path !== '/').map(({ icon: Icon, path, exact, title }) => {
            const active = exact ? pathname === path : pathname.startsWith(path)
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                aria-current={active ? 'page' : undefined}
                className='cursor-pointer! w-full flex flex-col items-center justify-center py-2.5 gap-1 rounded-xl transition'
                style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : 'transparent' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <Icon size={20} aria-hidden='true' style={{ color: 'rgba(255,255,255,0.9)' }} />
                <span className='text-[0.6rem] font-semibold tracking-wide text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 leading-none'>
                  {title}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Mi grupo + Avatar + Logout */}
        <div className='px-2 py-4 flex flex-col gap-1'>
          {tieneGrupo && (
            <button
              onClick={() => navigate('/grupo')}
              className='cursor-pointer! w-full flex flex-col items-center justify-center py-2.5 gap-1 rounded-xl transition'
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Users size={20} aria-hidden='true' style={{ color: 'rgba(255,255,255,0.9)' }} />
              <span className='text-[0.6rem] font-semibold tracking-wide text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 leading-none'>
                Mi grupo
              </span>
            </button>
          )}
          <button
            onClick={() => navigate('/perfil/usuario')}
            className='cursor-pointer! w-full flex flex-col items-center justify-center py-2 gap-1 rounded-xl transition'
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            {user?.foto_perfil
              ? <img src={user.foto_perfil} alt='' className='w-8 h-8 rounded-full object-cover ring-2 ring-white/30' />
              : <div className='w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold'>
                  {user?.nombre?.[0]?.toUpperCase() ?? <CircleUserRound size={18} aria-hidden='true' />}
                </div>
            }
            <span className='text-[0.6rem] font-semibold tracking-wide text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 leading-none'>
              Mi perfil
            </span>
          </button>
          <div className='relative'>
            <button
              ref={btnCuentaEscritorioRef}
              onClick={() => setMenuAbierto(prev => (prev === 'escritorio' ? null : 'escritorio'))}
              aria-haspopup='menu'
              aria-expanded={menuAbierto === 'escritorio'}
              className='cursor-pointer! w-full flex flex-col items-center justify-center py-2.5 gap-1 rounded-xl transition'
              style={{ color: 'rgba(255,255,255,0.75)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Settings size={20} aria-hidden='true' />
              <span className='text-[0.6rem] font-semibold tracking-wide text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 leading-none'>
                Cuenta
              </span>
            </button>
            {menuAbierto === 'escritorio' && (
              <MenuCuenta
                direccion='derecha'
                refDisparador={btnCuentaEscritorioRef}
                onCerrarSesion={onLogout}
                onEliminarCuenta={abrirModalEliminar}
                onCerrar={cerrarMenu}
              />
            )}
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main id='contenido-principal' tabIndex={-1} ref={mainRef} className='flex-1 min-w-0 p-4 sm:p-6 md:p-15 overflow-y-auto pb-24 md:pb-10'>
        <div className='max-w-7xl mx-auto'>
          <Outlet />
        </div>
      </main>

      {/* Bottom nav — solo mobile */}
      <nav
        aria-label='Navegación principal'
        className='md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around px-1 py-1.5 border-t border-emerald-700'
        style={{ backgroundColor: '#0b8059' }}
      >
        {navItems.map(({ icon: Icon, path, exact, title }) => {
          const active = exact ? pathname === path : pathname.startsWith(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-label={title}
              aria-current={active ? 'page' : undefined}
              className='cursor-pointer! flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition'
              style={{ color: active ? 'white' : 'rgba(255,255,255,0.8)', backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent' }}
            >
              <Icon size={20} aria-hidden='true' />
            </button>
          )
        })}
        {tieneGrupo && (
          <button
            onClick={() => navigate('/grupo')}
            aria-label='Mi grupo'
            className='cursor-pointer! flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition'
            style={{ color: 'rgba(255,255,255,0.8)' }}
          >
            <Users size={20} aria-hidden='true' />
          </button>
        )}
        <div className='relative flex-1 flex'>
          <button
            ref={btnCuentaMovilRef}
            onClick={() => setMenuAbierto(prev => (prev === 'movil' ? null : 'movil'))}
            aria-label='Cuenta'
            aria-haspopup='menu'
            aria-expanded={menuAbierto === 'movil'}
            className='cursor-pointer! flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition'
            style={{ color: 'rgba(255,255,255,0.8)' }}
          >
            <Settings size={20} aria-hidden='true' />
          </button>
          {menuAbierto === 'movil' && (
            <MenuCuenta
              direccion='arriba'
              refDisparador={btnCuentaMovilRef}
              onCerrarSesion={onLogout}
              onEliminarCuenta={abrirModalEliminar}
              onCerrar={cerrarMenu}
            />
          )}
        </div>
      </nav>

      {/* ── Modal eliminar cuenta ── */}
      {modalEliminar && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm' onClick={cerrarModalEliminar}>
          <div ref={refModalEliminar} role='dialog' aria-modal='true' aria-label='Eliminar cuenta' tabIndex={-1}
            className='bg-white rounded-3xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5 shadow-2xl' onClick={e => e.stopPropagation()}>
            <div className='flex flex-col gap-1.5'>
              <h2 className='font-display text-[1.375rem] font-semibold text-slate-900'>¿Eliminar tu cuenta para siempre?</h2>
              <p className='text-[0.875rem] text-slate-500 leading-relaxed'>
                Se borrarán tu perfil, tus fotos, tus intereses, tus favoritos y tus
                conversaciones. Esta acción no se puede deshacer.
              </p>
            </div>

            <div className='flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3'>
              <TriangleAlert aria-hidden='true' size={16} className='text-amber-500 shrink-0 mt-0.5' />
              <p className='text-[0.8125rem] text-amber-700 leading-relaxed'>
                Si administras un grupo, antes tendrás que transferir la administración
                a otro miembro o salir del grupo.
              </p>
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor='confirmar-eliminar' className='text-[0.8125rem] text-slate-600'>
                Escribe <span className='font-mono font-bold text-slate-900'>{CONFIRMACION_BORRADO}</span> para confirmar.
              </label>
              <input
                id='confirmar-eliminar'
                type='text'
                value={textoConfirmacion}
                onChange={e => setTextoConfirmacion(e.target.value)}
                autoComplete='off'
                placeholder={CONFIRMACION_BORRADO}
                className='w-full px-4 py-2.5 rounded-xl border-2 border-slate-500 text-sm text-slate-800 placeholder:text-slate-500 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition'
              />
            </div>

            {errorEliminar && (
              <div role='alert' className='flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3'>
                <AlertCircle aria-hidden='true' size={16} className='text-red-500 shrink-0 mt-0.5' />
                <p className='text-[0.8125rem] font-medium text-red-700 leading-relaxed'>{errorEliminar}</p>
              </div>
            )}

            <div className='flex gap-3'>
              <button
                onClick={cerrarModalEliminar}
                disabled={eliminando}
                className='cursor-pointer! flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[0.875rem] font-semibold py-3 rounded-full transition disabled:opacity-50'
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarCuenta}
                disabled={!confirmacionValida || eliminando}
                className='cursor-pointer! flex-1 bg-red-600 hover:bg-red-700 text-white text-[0.875rem] font-semibold py-3 rounded-full transition disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {eliminando
                  ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  : 'Eliminar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default LayoutPerfil
