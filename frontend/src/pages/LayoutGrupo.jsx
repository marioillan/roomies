import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../lib/apiFetch'
import {
  House, LogOut, CircleUserRound,
  LayoutDashboard, Megaphone, ClipboardList, Receipt, ShoppingCart, Users, CalendarDays,
} from 'lucide-react'

const TABS = [
  { path: '/grupo',             icon: LayoutDashboard, exact: true, title: 'Inicio',     soloCasero: false },
  { path: '/grupo/calendario',  icon: CalendarDays,                 title: 'Calendario', soloCasero: false },
  { path: '/grupo/tareas',      icon: ClipboardList,                title: 'Tareas',     soloCasero: false },
  { path: '/grupo/facturas',    icon: Receipt,                      title: 'Facturas',   soloCasero: false },
  { path: '/grupo/compra',      icon: ShoppingCart,                 title: 'Compra',     soloCasero: false },
]

function LayoutGrupo({ onLogout }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [grupo, setGrupo] = useState(null)
  const [miembros, setMiembros] = useState([])
  const [loading, setLoading] = useState(true)
  const mainRef = useRef(null)

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    apiFetch('/api/grupos/mi-grupo')
      .then(r => r.json())
      .then(data => {
        setGrupo(data.grupo ?? null)
        setMiembros(data.miembros ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-100 flex items-center justify-center'>
        <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (!grupo) {
    return (
      <div className='min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4 text-center px-6'>
        <div className='w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center'>
          <House size={32} className='text-emerald-500' />
        </div>
        <h2 className='text-xl font-bold text-slate-800'>No perteneces a ningún grupo</h2>
        <p className='text-slate-500 text-sm max-w-xs'>
          Accede a un grupo con un código o crea uno nuevo desde la página principal.
        </p>
        <button
          onClick={() => navigate('/')}
          className='cursor-pointer! mt-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition text-sm'
        >
          Ir al inicio
        </button>
      </div>
    )
  }

  const miembroActual = miembros.find(m => m.id === user?.id)
  const esAdmin  = miembroActual?.rol_en_grupo === 'ADMIN'
  const esCasero = miembroActual?.es_casero === true

  const tabsVisibles = esCasero ? TABS.filter(t => t.soloCasero) : TABS

  if (!loading && esCasero && !pathname.startsWith('/casero/facturas')) {
    return <Navigate to='/casero/facturas' replace />
  }

  return (
    <div className='min-h-screen bg-slate-200 md:h-screen md:overflow-hidden md:flex'>

      {/* Sidebar — oculto en mobile, visible en desktop */}
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
          {tabsVisibles.map(({ path, icon: Icon, exact, title }) => {
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

        {/* Mi grupo + Publicación + Avatar + Logout */}
        <div className='px-2 py-4 flex flex-col gap-1'>
          {[
            { path: '/grupo/perfil',      icon: Users,     title: 'Mi grupo'    },
            { path: '/grupo/publicacion', icon: Megaphone, title: 'Tu anuncio' },
          ].map(({ path, icon: Icon, title }) => {
            const active = pathname.startsWith(path)
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
      <main ref={mainRef} className='flex-1 min-w-0 p-4 sm:p-6 md:p-12 overflow-y-auto pb-24 md:pb-13'>
        <div className='max-w-9xl mx-auto'>
          <Outlet context={{ grupo, miembros, setMiembros, user }} />
        </div>
      </main>

      {/* Bottom nav — solo mobile */}
      <nav
        className='md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around px-1 py-1.5 border-t border-emerald-700'
        style={{ backgroundColor: '#0b8059' }}
      >
        {tabsVisibles.map(({ path, icon: Icon, exact, title }) => {
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
        {[
          { path: '/grupo/perfil',      icon: Users,     title: 'Mi grupo'    },
          { path: '/grupo/publicacion', icon: Megaphone, title: 'Publicación' },
        ].map(({ path, icon: Icon, title }) => {
          const active = pathname.startsWith(path)
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
        <button
          onClick={() => navigate('/perfil/usuario')}
          title='Mi perfil'
          className='cursor-pointer! flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition'
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          {user?.foto_perfil
            ? <img src={user.foto_perfil} alt='Perfil' className='w-6 h-6 rounded-full object-cover' />
            : <CircleUserRound size={20} style={{ color: 'rgba(255,255,255,0.55)' }} />
          }
        </button>
      </nav>

    </div>
  )
}

export default LayoutGrupo
