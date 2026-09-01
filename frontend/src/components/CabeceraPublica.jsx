import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Receipt, House, Heart, MessageCircle, ArrowRight } from 'lucide-react'
import LoginModal from './LoginModal.jsx'
import RegistroModal from './RegistroModal.jsx'

const ESMERALDA = '#10b981'

/**
 * Cabecera de las páginas públicas con fondo claro (FAQ y páginas legales).
 * Estaba escrita dentro de FAQ.jsx y habría que repetirla en cada página nueva,
 * así que vive aquí, igual que el pie de página (components/PieDePagina.jsx).
 * Gestiona ella misma los modales de acceso porque son parte de la cabecera.
 *
 * La Home tiene su propia cabecera: allí es transparente sobre el hero oscuro y
 * cambia de aspecto al hacer scroll, comportamiento que no aplica aquí.
 */
function CabeceraPublica() {
  const navigate = useNavigate()
  const { user, tieneGrupo, recargarUsuario } = useAuth()
  const [loginAbierto, setLoginAbierto] = useState(false)
  const [registroAbierto, setRegistroAbierto] = useState(false)

  return (
    <>
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
                  <button
                    onClick={() => navigate('/casero/facturas')}
                    className="cursor-pointer! inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: ESMERALDA }}>
                    <Receipt aria-hidden='true' size={15} />
                    Gestión de facturas
                  </button>
                ) : (
                  <>
                    {tieneGrupo ? (
                      <button onClick={() => navigate('/grupo')} aria-label="Mi grupo"
                        className="cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
                        <House aria-hidden='true' size={20} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => navigate('/perfil/favoritos')} aria-label="Favoritos"
                          className="cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
                          <Heart aria-hidden='true' size={20} />
                        </button>
                        <button onClick={() => navigate('/perfil/chat')} aria-label="Mensajes"
                          className="cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
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
                <button onClick={() => setLoginAbierto(true)}
                  className="cursor-pointer! hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition">
                  Iniciar sesión
                </button>
                <button onClick={() => setRegistroAbierto(true)}
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

      {loginAbierto && (
        <LoginModal
          onClose={() => setLoginAbierto(false)}
          onSuccess={async () => { await recargarUsuario(); setLoginAbierto(false) }}
          onSwitchToRegistro={() => { setLoginAbierto(false); setRegistroAbierto(true) }}
        />
      )}
      {registroAbierto && (
        <RegistroModal
          onClose={() => setRegistroAbierto(false)}
          onSuccess={async (esCasero) => { await recargarUsuario(); setRegistroAbierto(false); navigate(esCasero ? '/' : '/perfil/usuario/editar') }}
          onSwitchToLogin={() => { setRegistroAbierto(false); setLoginAbierto(true) }}
        />
      )}
    </>
  )
}

export default CabeceraPublica
