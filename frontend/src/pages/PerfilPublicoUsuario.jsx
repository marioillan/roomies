import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react'
import DonutChart from '../components/DonutChart.jsx'
import { CARD_SHADOW, DONUTS_CONFIG_USUARIO, calcEdad, calcChips, calcPct } from '../lib/convivencia.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function PerfilPublicoUsuario() {
  const { user } = useAuth()
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [datos,    setDatos]    = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/perfil/publico/${id}`)
      .then(r => r.json())
      .then(d => setDatos(d))
      .catch(() => setDatos(null))
      .finally(() => setCargando(false))
  }, [id])

  if (cargando) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (!datos?.usuario) {
    return (
      <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4'>
        <p className='text-slate-500 font-semibold'>Usuario no encontrado</p>
        <button onClick={() => navigate(-1)}
          className='cursor-pointer! text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition'>
          ← Volver
        </button>
      </div>
    )
  }

  const { usuario, convivencia, intereses } = datos

  const edad  = calcEdad(usuario.fecha_nacimiento ?? convivencia?.fecha_nacimiento)
  const chips = calcChips(convivencia)
  const pct   = calcPct(convivencia)

  return (
    <div className='min-h-screen bg-slate-50'>

      {/* Header */}
      <header className='sticky top-0 z-20 bg-white border-b border-slate-200'>
        <div className='max-w-[80rem] mx-auto flex items-center gap-6 px-10 py-3.5'>
          <button onClick={() => navigate('/buscar')}
            className='cursor-pointer! font-display text-2xl font-bold -tracking-[0.02em] text-slate-900 shrink-0'>
            Housie
          </button>
          <div className='flex-1' />
          <div className='flex items-center gap-2'>
            {user ? (
              <>
                <button onClick={() => navigate('/perfil/favoritos')} aria-label='Favoritos'
                  className='cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition'>
                  <Heart size={20} />
                </button>
                <button onClick={() => navigate('/perfil/chat')} aria-label='Mensajes'
                  className='cursor-pointer! w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition'>
                  <MessageCircle size={20} />
                </button>
                {user.foto_perfil
                  ? <img src={user.foto_perfil} alt={user.nombre}
                      className='w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500 ring-offset-2 ring-offset-white cursor-pointer'
                      onClick={() => navigate('/perfil/usuario')} />
                  : <button onClick={() => navigate('/perfil/usuario')}
                      className='cursor-pointer! w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center ring-2 ring-emerald-500 ring-offset-2 ring-offset-white'>
                      <span className='text-sm font-bold text-emerald-700'>{user.nombre?.[0]?.toUpperCase()}</span>
                    </button>
                }
              </>
            ) : (
              <button onClick={() => navigate('/')}
                className='cursor-pointer! text-sm font-semibold text-slate-700 hover:text-slate-900 transition px-4 py-2'>
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-10 py-8 flex flex-col gap-5'>

        {/* Volver */}
        <div className='flex items-center justify-between'>
          <button
            onClick={() => navigate(-1)}
            className='cursor-pointer! inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition bg-slate-100 hover:bg-white border border-slate-200 px-[1.125rem] py-3 rounded-full'
          >
            <ArrowLeft size={15} /> Volver
          </button>
          <h1 className='font-display text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>
            Perfil de usuario
          </h1>
        </div>

        {/* ── Hero card ── */}
        <div className='bg-white border border-slate-100 rounded-3xl p-7 grid grid-cols-[21.25rem_1fr] gap-5' style={CARD_SHADOW}>

          {/* Foto */}
          <div className='flex justify-center items-center'>
            {usuario.foto_perfil
              ? <img src={usuario.foto_perfil} alt='Foto de perfil'
                  className='rounded-full object-cover'
                  style={{ width: 284, height: 284 }} />
              : <div
                  className='rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold'
                  style={{ width: 284, height: 284, fontSize: '5rem' }}
                >
                  {usuario.nombre?.[0]?.toUpperCase() ?? '?'}
                </div>
            }
          </div>

          {/* Identidad */}
          <div className='flex flex-col justify-center gap-4'>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Identidad</p>
            <h2 className='font-display text-[2.75rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>
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
              : <p className='font-display text-[1.0625rem] font-normal text-slate-400 italic leading-[1.4]'>Sin descripción todavía.</p>
            }
          </div>
        </div>

        {/* ── Datos personales + Intereses ── */}
        <div className='grid grid-cols-2 gap-5'>

          <div className='bg-white border border-slate-100 rounded-3xl p-7 flex flex-col gap-4' style={CARD_SHADOW}>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Datos personales</p>
            <div className='flex flex-col'>
              {[
                { label: 'Género', value: usuario.genero ?? convivencia?.genero },
                { label: 'País',   value: usuario.pais   ?? convivencia?.pais   },
                { label: 'Edad',   value: edad != null ? `${edad} años` : null  },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  className={`flex justify-between items-center py-[0.875rem] ${i < arr.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}
                >
                  <span className='font-mono text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-[0.10em]'>{label}</span>
                  <span className='text-right truncate max-w-[58%] text-[0.9375rem] font-medium text-slate-700'>
                    {value ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-slate-900 text-slate-200 rounded-3xl p-7 flex flex-col gap-4 min-w-0 overflow-hidden' style={CARD_SHADOW}>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-400'>Intereses</p>
            {!intereses?.length ? (
              <p className='text-[0.8125rem] font-medium text-slate-500'>Sin intereses todavía.</p>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {intereses.map(({ id: interesId, nombre }) => (
                  <span key={interesId} className='bg-slate-700 text-slate-100 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>
                    {nombre}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Compatibilidad ── */}
        <div className='bg-white border border-slate-100 rounded-3xl p-7 flex flex-col gap-6' style={CARD_SHADOW}>
          <div className='flex items-start justify-between'>
            <div>
              <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-1.5'>Compatibilidad</p>
              <h3 className='font-display text-[2rem] font-normal text-slate-900 leading-none'>¿Cómo soy en casa?</h3>
            </div>
            {convivencia && (
              <div className='text-right'>
                <p className='font-display text-[2.625rem] font-normal text-emerald-600 leading-none tabular-nums'>
                  {pct}<span className='text-[1.125rem] font-medium text-slate-400'>%</span>
                </p>
                <p className='font-mono text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-[0.08em] mt-1'>Completado</p>
              </div>
            )}
          </div>

          {!convivencia ? (
            <div className='bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3'>
              <p className='text-sm font-semibold text-orange-800'>Perfil de convivencia sin rellenar</p>
              <p className='text-xs text-orange-600 leading-relaxed mt-0.5'>
                Este usuario aún no ha añadido sus preferencias de convivencia.
              </p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-4 gap-6'>
                {DONUTS_CONFIG_USUARIO.map(cfg => (
                  <DonutChart
                    key={cfg.campo}
                    sublabel={cfg.sublabel}
                    color={cfg.color}
                    labels={cfg.labels}
                    valor={convivencia[cfg.campo]}
                  />
                ))}
              </div>
              {chips.length > 0 && (
                <div className='flex flex-wrap gap-2 pt-2 border-t border-dashed border-slate-200'>
                  {chips.map(chip => (
                    <span key={chip} className='bg-slate-100 text-slate-600 rounded-full text-[0.8125rem] font-medium px-3.5 py-[7px]'>
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
