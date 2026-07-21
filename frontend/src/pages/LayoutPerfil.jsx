import { useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  ArrowLeft, CircleUserRound, LogOut, User, Heart, MessageCircle,
  Home, UserCheck, House,
} from 'lucide-react'

const navItems = [
  { icon: Home,          path: '/',                  exact: true,  title: 'Inicio' },
  { icon: User,          path: '/perfil/usuario',    exact: false, title: 'Mi perfil' },
  { icon: MessageCircle, path: '/perfil/chat',       exact: false, title: 'Mensajes' },
  { icon: Heart,         path: '/perfil/favoritos',  exact: false, title: 'Favoritos' },
]

function LayoutPerfil({ onLogout }) {
  const { user, tieneGrupo } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className='min-h-screen bg-slate-100 md:h-screen md:overflow-hidden md:flex'>

      {/* Sidebar izquierdo — oculto en mobile */}
      <aside
        className='group hidden md:flex w-25 shrink-0 flex-col min-h-screen sticky top-0 h-screen'
        style={{ backgroundColor: '#0b8059' }}
      >
        {/* Logo */}
        <div className='flex justify-center py-5'>
          <button onClick={() => navigate('/')} className='cursor-pointer!'>
            <img src='/logohousie.png' alt='Housie' className='w-20 h-20 object-contain' />
          </button>
        </div>

        {/* Nav */}
        <nav className='flex-1 px-2 py-4 flex flex-col gap-1'>
          {navItems.filter(n => n.path !== '/').map(({ icon: Icon, path, exact, title }) => {
            const active = exact ? pathname === path : pathname.startsWith(path)
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className='cursor-pointer! w-full flex flex-col items-center justify-center py-2.5 gap-1 rounded-xl transition'
                style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : 'transparent' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <Icon size={20} style={{ color: 'rgba(255,255,255,0.85)' }} />
                <span className='text-[0.6rem] font-semibold tracking-wide text-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-150 leading-none'>
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
              <House size={20} style={{ color: 'rgba(255,255,255,0.85)' }} />
              <span className='text-[0.6rem] font-semibold tracking-wide text-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-150 leading-none'>
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
              ? <img src={user.foto_perfil} alt='Perfil' className='w-8 h-8 rounded-full object-cover ring-2 ring-white/30' />
              : <div className='w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold'>
                  {user?.nombre?.[0]?.toUpperCase() ?? <CircleUserRound size={18} />}
                </div>
            }
            <span className='text-[0.6rem] font-semibold tracking-wide text-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-150 leading-none'>
              Mi perfil
            </span>
          </button>
          <button
            onClick={onLogout}
            className='cursor-pointer! w-full flex flex-col items-center justify-center py-2.5 gap-1 rounded-xl transition'
            style={{ color: 'rgba(255,255,255,0.75)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <LogOut size={20} />
            <span className='text-[0.6rem] font-semibold tracking-wide text-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-150 leading-none'>
              Salir
            </span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main ref={mainRef} className='flex-1 min-w-0 p-4 sm:p-6 md:p-15 overflow-y-auto pb-24 md:pb-10'>
        <div className='max-w-7xl mx-auto'>
          <Outlet />
        </div>
      </main>

      {/* Bottom nav — solo mobile */}
      <nav
        className='md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around px-1 py-1.5 border-t border-emerald-700'
        style={{ backgroundColor: '#0b8059' }}
      >
        {navItems.map(({ icon: Icon, path, exact, title }) => {
          const active = exact ? pathname === path : pathname.startsWith(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              title={title}
              className='cursor-pointer! flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition'
              style={{ color: active ? 'white' : 'rgba(255,255,255,0.55)', backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent' }}
            >
              <Icon size={20} />
            </button>
          )
        })}
        {tieneGrupo && (
          <button
            onClick={() => navigate('/grupo')}
            title='Mi grupo'
            className='cursor-pointer! flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition'
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            <House size={20} />
          </button>
        )}
        <button
          onClick={onLogout}
          title='Cerrar sesión'
          className='cursor-pointer! flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition'
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          <LogOut size={20} />
        </button>
      </nav>

    </div>
  )
}

export default LayoutPerfil
