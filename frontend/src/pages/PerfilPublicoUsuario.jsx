import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, House, ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import { CARD_SHADOW, TARJETAS_CONVIVENCIA_USUARIO, labelsUsuario, calcEdad } from '../lib/convivencia.js'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../lib/apiFetch'
import PieDePagina from '../components/PieDePagina.jsx'
import { SaltarAlContenido } from '../components/Accesibilidad.jsx'

const STRIPE_BG = 'repeating-linear-gradient(45deg,#f1f5f9,#f1f5f9 6px,#e2e8f0 6px,#e2e8f0 12px)'

function CarruselFotos({ fotos, nombre }) {
  const [idx, setIdx] = useState(0)
  const total = fotos.length
  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)
  const src = fotos[idx]
  return (
    <div className='relative w-full aspect-[3/4] rounded-3xl overflow-hidden' style={CARD_SHADOW}>
      {src
        ? <img src={src} alt={nombre} className='w-full h-full object-cover object-top' />
        : <div className='w-full h-full flex flex-col items-center justify-center gap-2' style={{ background: STRIPE_BG }}>
            <Camera aria-hidden='true' size={24} className='text-slate-500' />
          </div>
      }
      {total > 1 && (
        <>
          <button aria-label='Foto anterior' onClick={prev}
            className='cursor-pointer! absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition backdrop-blur-sm'>
            <ChevronLeft aria-hidden='true' size={18} />
          </button>
          <button aria-label='Foto siguiente' onClick={next}
            className='cursor-pointer! absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition backdrop-blur-sm'>
            <ChevronRight aria-hidden='true' size={18} />
          </button>
          <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5'>
            {fotos.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                aria-label={`Ver foto ${i + 1} de ${total}`}
                aria-current={i === idx ? 'true' : undefined}
                className={`cursor-pointer! w-2 h-2 rounded-full transition ${i === idx ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function TraitCard({ cfg, valor }) {
  const frase = labelsUsuario[cfg.campo]?.[valor]
  return (
    <div className='bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-2' style={{ ...CARD_SHADOW, borderTop: `3px solid ${cfg.color}` }}>
      <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em]' style={{ color: cfg.color }}>
        {cfg.sublabel}
      </span>
      {frase
        ? <p className='text-[0.9375rem] font-medium text-slate-800 leading-snug'>{frase}</p>
        : <p className='text-[0.9375rem] text-slate-500 italic'>Sin rellenar</p>
      }
    </div>
  )
}

export default function PerfilPublicoUsuario() {
  const { user, tieneGrupo } = useAuth()
  const { id }   = useParams()
  const navigate = useNavigate()

  const [datos,    setDatos]    = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    apiFetch(`/api/perfil/publico/${id}`)
      .then(r => r.json())
      .then(d => setDatos(d))
      .catch(() => setDatos(null))
      .finally(() => setCargando(false))
  }, [id])

  if (cargando) return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
      <div role='status' aria-label='Cargando' className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
    </div>
  )

  if (!datos?.usuario) return (
    <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4'>
      <p className='text-slate-500 font-semibold'>Usuario no encontrado</p>
      <button onClick={() => navigate(-1)} className='cursor-pointer! text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition'>← Volver</button>
    </div>
  )

  const { usuario, convivencia, intereses } = datos
  const edad  = calcEdad(usuario.fecha_nacimiento ?? convivencia?.fecha_nacimiento)
  const fotos = [usuario.foto_perfil ?? null, usuario.foto_1 ?? null, usuario.foto_2 ?? null]

  return (
    <div className='min-h-screen bg-slate-50'>

      {/* Header */}
      <SaltarAlContenido />
      <header className='sticky top-0 z-20 bg-white border-b border-slate-200'>
        <div className='max-w-[80rem] mx-auto flex items-center gap-6 px-4 sm:px-10 py-3.5'>
          <button onClick={() => navigate('/buscar')}
            className='cursor-pointer! font-display text-2xl font-bold -tracking-[0.02em] text-slate-900 shrink-0'>
            Housie
          </button>
          <div className='flex-1' />
          <div className='flex items-center gap-2'>
            {user ? (
              <>
                {tieneGrupo ? (
                  <button onClick={() => navigate('/grupo')} aria-label='Mi grupo'
                    className='cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition'>
                    <House aria-hidden='true' size={20} />
                  </button>
                ) : (
                  <>
                    <button onClick={() => navigate('/perfil/favoritos')} aria-label='Favoritos'
                      className='cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition'>
                      <Heart aria-hidden='true' size={20} />
                    </button>
                    <button onClick={() => navigate('/perfil/chat')} aria-label='Mensajes'
                      className='cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition'>
                      <MessageCircle aria-hidden='true' size={20} />
                    </button>
                  </>
                )}
                {user.foto_perfil
                  ? <img src={user.foto_perfil} alt={user.nombre} className='w-10 h-10 rounded-full object-cover cursor-pointer' onClick={() => navigate('/perfil/usuario')} />
                  : <button onClick={() => navigate('/perfil/usuario')}
                      className='cursor-pointer! w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center ring-2 ring-emerald-500 ring-offset-2 ring-offset-white'>
                      <span className='text-sm font-bold text-emerald-700'>{user.nombre?.[0]?.toUpperCase()}</span>
                    </button>
                }
              </>
            ) : (
              <button onClick={() => navigate('/')} className='cursor-pointer! text-sm font-semibold text-slate-700 hover:text-slate-900 transition px-4 py-2'>
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <main id='contenido-principal' tabIndex={-1} className='max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-8 flex flex-col gap-5'>

        {/* Volver */}
        <div className='flex items-center sm:justify-between'>
          <button onClick={() => navigate(-1)}
            className='cursor-pointer! hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition bg-slate-100 hover:bg-white border border-slate-200 px-[1.125rem] py-3 rounded-full w-fit'>
            <ArrowLeft aria-hidden='true' size={15} /> Volver
          </button>
          <h1 className='font-display text-3xl sm:text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>
            Perfil de usuario
          </h1>
        </div>

        {/* ── Hero card ── */}
        <div className='bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 grid grid-cols-1 md:grid-cols-[18rem_1fr] gap-8 items-start' style={CARD_SHADOW}>

          {/* Carrusel de fotos */}
          <CarruselFotos fotos={fotos} nombre={usuario.nombre} />

          {/* Identidad */}
          <div className='flex flex-col gap-4'>
            <h2 className='font-display text-[2rem] sm:text-[2.75rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>
              {usuario.nombre ?? '—'}{edad != null ? `, ${edad}` : ''}
            </h2>
            <div className='flex flex-wrap gap-2'>
              {(usuario.genero ?? convivencia?.genero) && (
                <span className='inline-flex items-center gap-2 bg-pink-50 text-pink-700 text-[0.8125rem] font-medium px-3.5 py-[7px] rounded-full'>
                  <span className='w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0' />
                  {usuario.genero ?? convivencia?.genero}
                </span>
              )}
              {(usuario.pais ?? convivencia?.pais) && (
                <span className='inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-[0.8125rem] font-medium px-3.5 py-[7px] rounded-full'>
                  <span className='w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0' />
                  {usuario.pais ?? convivencia?.pais}
                </span>
              )}
            </div>
            {(usuario.sobre_mi ?? convivencia?.sobre_mi)
              ? <p className='font-display text-[1.0625rem] font-normal text-slate-700 leading-[1.4] bg-slate-50 rounded-2xl px-4 py-4'>
                  {usuario.sobre_mi ?? convivencia?.sobre_mi}
                </p>
              : <p className='font-display text-[1.0625rem] font-normal text-slate-500 italic leading-[1.4]'>Sin descripción todavía.</p>
            }
          </div>
        </div>

        {/* ── Datos + Intereses ── */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>

          <div className='bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 flex flex-col gap-4' style={CARD_SHADOW}>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Datos personales</p>
            <div className='flex flex-col'>
              {[
                { label: 'Género', value: usuario.genero ?? convivencia?.genero },
                { label: 'País',   value: usuario.pais   ?? convivencia?.pais   },
                { label: 'Edad',   value: edad != null ? `${edad} años` : null  },
              ].map(({ label, value }, i, arr) => (
                <div key={label} className={`flex justify-between items-center py-[0.875rem] ${i < arr.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}>
                  <span className='font-mono text-[0.6875rem] font-semibold text-slate-500 uppercase tracking-[0.10em]'>{label}</span>
                  <span className='text-right truncate max-w-[58%] text-[0.9375rem] font-medium text-slate-700'>{value ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-slate-900 text-slate-200 rounded-3xl p-5 sm:p-7 flex flex-col gap-5 min-w-0 overflow-hidden' style={CARD_SHADOW}>

            {/* Estilo de vida */}
            {convivencia && (convivencia.ocupacion || convivencia.fumador !== null || convivencia.tiene_mascotas !== null || convivencia.lgbtq_friendly === true) && (
              <div className='flex flex-col gap-2'>
                <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-300'>Estilo de vida</p>
                <div className='flex flex-wrap gap-2'>
                  {convivencia.ocupacion === 'ESTUDIO'           && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Estudiante</span>}
                  {convivencia.ocupacion === 'TRABAJO'           && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Trabajador/a</span>}
                  {convivencia.ocupacion === 'ESTUDIO_Y_TRABAJO' && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Estudiante y trabajador/a</span>}
                  {convivencia.fumador === true  && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Fumador/a</span>}
                  {convivencia.fumador === false && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>No fumador/a</span>}
                  {convivencia.tiene_mascotas === true  && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Tiene mascotas</span>}
                  {convivencia.tiene_mascotas === false && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Sin mascotas</span>}
                  {convivencia.lgbtq_friendly === true  && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>LGBTQ+ friendly</span>}
                </div>
              </div>
            )}

            {/* Intereses */}
            <div className='flex flex-col gap-2'>
              <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-300'>Intereses</p>
              {!intereses?.length ? (
                <p className='text-[0.8125rem] font-medium text-slate-300'>Sin intereses todavía.</p>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  {intereses.map(({ id: interesId, nombre }) => (
                    <span key={interesId} className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>{nombre}</span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Compatibilidad — grid 3×2 de tarjetas ── */}
        <div className='bg-slate-50 border border-slate-100 rounded-3xl p-5 sm:p-7 flex flex-col gap-6' style={CARD_SHADOW}>
          <div>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-1.5'>Compatibilidad</p>
            <h3 className='font-display text-2xl sm:text-[2rem] font-normal text-slate-900 leading-none'>¿Cómo es en casa?</h3>
          </div>
          {!convivencia ? (
            <div className='bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3'>
              <p className='text-sm font-semibold text-orange-800'>Perfil de convivencia sin rellenar</p>
              <p className='text-xs text-orange-600 leading-relaxed mt-0.5'>Este usuario aún no ha añadido sus preferencias de convivencia.</p>
            </div>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4'>
              {TARJETAS_CONVIVENCIA_USUARIO.map(cfg => <TraitCard key={cfg.campo} cfg={cfg} valor={convivencia[cfg.campo]} />)}
            </div>
          )}
        </div>

        {/* Botón volver — solo móvil, al final de la página */}
        <div className='sm:hidden bg-white border border-slate-100 rounded-3xl p-4' style={CARD_SHADOW}>
          <button onClick={() => navigate(-1)}
            className='cursor-pointer! w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition bg-slate-100 hover:bg-white border border-slate-200 px-[1.125rem] py-3 rounded-full'>
            <ArrowLeft aria-hidden='true' size={15} /> Volver
          </button>
        </div>

      </main>

      <PieDePagina />
    </div>
  )
}
