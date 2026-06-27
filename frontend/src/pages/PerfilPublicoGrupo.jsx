import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react'
import DonutChart from '../components/DonutChart.jsx'
import { CARD_SHADOW, DONUTS_CONFIG_GRUPO, PASTEL } from '../lib/convivencia.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function PerfilPublicoGrupo() {
  const { user } = useAuth()
  const { id }   = useParams()
  const navigate = useNavigate()

  const [datos,    setDatos]    = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/publicaciones/${id}`)
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

  if (!datos?.publicacion) {
    return (
      <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4'>
        <p className='text-slate-500 font-semibold'>Grupo no encontrado</p>
        <button onClick={() => navigate('/buscar')}
          className='cursor-pointer! text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition'>
          ← Volver a la búsqueda
        </button>
      </div>
    )
  }

  const { publicacion: pub, miembros, convivencia, intereses } = datos

  const miembrosSinCasero = miembros.filter(m => !m.es_casero)
  const miembroMasAntiguo = miembrosSinCasero.length > 0
    ? miembrosSinCasero.reduce((a, b) => new Date(a.fecha_union) < new Date(b.fecha_union) ? a : b)
    : null
  const anioDesde = miembroMasAntiguo?.fecha_union
    ? new Date(miembroMasAntiguo.fecha_union).getFullYear()
    : null

  return (
    <div className='min-h-screen bg-slate-50'>

      {/* Header */}
      <header className='sticky top-0 z-20 bg-white border-b border-slate-200'>
        <div className='max-w-[80rem] mx-auto flex items-center gap-3 sm:gap-6 px-4 sm:px-10 py-3.5'>
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
                      className='w-10 h-10 rounded-full object-cover  cursor-pointer'
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

      {/* Contenido */}
      <div className='max-w-7xl mx-auto px-4 sm:px-10 py-8 flex flex-col gap-5'>

        {/* Volver */}
        <div className='flex items-center justify-between'>
          <button
            onClick={() => navigate(`/anuncio/${id}`)}
            className='cursor-pointer! inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition bg-slate-100 hover:bg-white border border-slate-200 px-[1.125rem] py-3 rounded-full'
          >
            <ArrowLeft size={15} /> Volver al anuncio
          </button>
          <h1 className='font-display text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>
            Perfil del grupo
          </h1>
        </div>

        {/* ── Hero card ── */}
        <div className='bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 grid grid-cols-1 sm:grid-cols-2' style={CARD_SHADOW}>

          {/* Columna izq: miembros */}
          <div className='flex flex-col gap-4 pr-8 border-r border-dashed border-slate-200'>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Miembros</p>
            <div className='flex flex-col divide-y divide-dashed divide-slate-200'>
              {[...miembros].sort((a, b) => (a.es_casero === b.es_casero ? 0 : a.es_casero ? 1 : -1)).map((m, i) => {
                const desde = m.fecha_union ? new Date(m.fecha_union).getFullYear() : null
                const pastel = PASTEL[i % PASTEL.length]
                return (
                  <div key={m.id} className='flex items-center gap-3 py-3'>
                    {m.foto_perfil
                      ? <img src={m.foto_perfil} alt={m.nombre} className='w-11 h-11 rounded-full object-cover shrink-0' />
                      : <div
                          className='w-11 h-11 rounded-full flex items-center justify-center shrink-0'
                          style={{ backgroundColor: pastel.bg }}
                        >
                          <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                            <circle cx='12' cy='8' r='4' stroke={pastel.icon} strokeWidth='2' strokeLinecap='round' />
                            <path d='M4 20c0-4 3.6-7 8-7s8 3 8 7' stroke={pastel.icon} strokeWidth='2' strokeLinecap='round' />
                          </svg>
                        </div>
                    }
                    <div className='flex-1 min-w-0'>
                      {m.es_casero ? (
                        <p className='font-display text-[1.0625rem] font-semibold text-slate-800 leading-tight truncate'>
                          {m.nombre}
                        </p>
                      ) : (
                        <button
                          onClick={() => navigate(`/usuario/${m.id}`)}
                          className='cursor-pointer! font-display text-[1.0625rem] font-semibold text-slate-800 hover:text-emerald-600 transition leading-tight truncate text-left block w-full'
                        >
                          {m.nombre}
                        </button>
                      )}
                      {desde && (
                        <p className='font-mono text-[0.7rem] text-slate-400 mt-0.5'>desde {desde}</p>
                      )}
                    </div>
                    <div className='shrink-0'>
                      {m.es_casero
                        ? <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-amber-500'>Casero</span>
                        : <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-teal-500'>Residente</span>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Columna der: identidad del grupo */}
          <div className='flex flex-col justify-center gap-4 pt-6 sm:pt-0 sm:pl-8 min-w-0'>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Grupo de convivencia</p>
            <h2 className='font-display text-[3rem] font-bold text-slate-900 leading-none -tracking-[0.02em] break-words'>
              {pub.nombre_grupo ?? '—'}
            </h2>
            <div className='flex flex-wrap gap-2'>
              {pub.ciudad && (
                <span className='inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-[0.8125rem] font-medium px-3.5 py-[7px] rounded-full'>
                  <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0' />
                  {pub.ciudad}
                </span>
              )}
              {anioDesde && (
                <span className='inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-[0.8125rem] font-medium px-3.5 py-[7px] rounded-full'>
                  <span className='w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0' />
                  Conviviendo desde {anioDesde}
                </span>
              )}
              {pub.buscar_companero_grupo && (
                <span className='inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[0.8125rem] font-medium px-3.5 py-[7px] rounded-full'>
                  <span className='w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0' />
                  Buscando compañero
                </span>
              )}
            </div>
            {pub.descripcion_grupo
              ? <p className='font-display text-[1.0625rem] font-normal text-slate-700 leading-[1.6] bg-slate-50 rounded-2xl px-4 py-4 break-words'>
                  {pub.descripcion_grupo}
                </p>
              : <p className='font-display text-[1.0625rem] font-normal text-slate-400 italic leading-[1.4]'>
                  Sin descripción todavía.
                </p>
            }
          </div>
        </div>

        {/* ── Datos del piso + Intereses ── */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>

          {/* Datos del piso */}
          <div className='bg-white border border-slate-100 rounded-3xl p-7 flex flex-col gap-4' style={CARD_SHADOW}>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Datos del piso</p>
            <div className='flex flex-col'>
              {[
                {
                  label: 'Ubicación',
                  value: pub.ciudad ?? '—',
                },
                {
                  label: 'Miembros',
                  value: (() => { const n = miembrosSinCasero.length; return `${n} ${n === 1 ? 'persona' : 'personas'}` })(),
                },
                {
                  label: 'Buscando',
                  value: pub.buscar_companero_grupo ? 'Buscamos compañera/o de piso' : 'No buscamos',
                  valueColor: pub.buscar_companero_grupo ? 'text-emerald-600' : undefined,
                },
                {
                  label: 'Conviven',
                  value: anioDesde ? `Desde ${anioDesde}` : '—',
                },
                {
                  label: 'Habitaciones libres',
                  value: `${pub.habitaciones_libres} ${pub.habitaciones_libres === 1 ? 'habitación' : 'habitaciones'}`,
                },
              ].map(({ label, value, valueColor }, i, arr) => (
                <div
                  key={label}
                  className={`flex justify-between items-center py-[0.875rem] ${i < arr.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}
                >
                  <span className='font-mono text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-[0.10em]'>{label}</span>
                  <span className={`text-right truncate max-w-[58%] text-[0.9375rem] font-medium ${valueColor ?? 'text-slate-700'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Intereses */}
          <div className='bg-slate-900 text-slate-200 rounded-3xl p-7 flex flex-col gap-4 min-w-0 overflow-hidden' style={CARD_SHADOW}>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-400'>Intereses del grupo</p>
            {intereses.length === 0 ? (
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

        {/* ── Perfil de convivencia ── */}
        <div className='bg-white border border-slate-100 rounded-3xl p-7 flex flex-col gap-6' style={CARD_SHADOW}>
          <div>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-1.5'>Convivencia</p>
            <h3 className='font-display text-[2rem] font-normal text-slate-900 leading-none'>¿Cómo se vive aquí?</h3>
          </div>

          {!convivencia ? (
            <div className='bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3'>
              <p className='text-sm font-semibold text-orange-800'>Perfil de convivencia del grupo sin rellenar</p>
              <p className='text-xs text-orange-600 leading-relaxed mt-0.5'>
                Este grupo aún no ha añadido sus preferencias de convivencia.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-4 gap-6'>
              {DONUTS_CONFIG_GRUPO.map(cfg => (
                <DonutChart
                  key={cfg.campo}
                  sublabel={cfg.sublabel}
                  color={cfg.color}
                  labels={cfg.labels}
                  valor={convivencia[cfg.campo]}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
