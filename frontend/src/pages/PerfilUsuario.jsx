import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Share2 } from 'lucide-react'
import DonutChart from '../components/DonutChart.jsx'
import { CARD_SHADOW, DONUTS_CONFIG_USUARIO, calcEdad, calcChips, calcPct } from '../lib/convivencia.js'
import { useAuth } from '../context/AuthContext.jsx'

// ── Componente principal ──────────────────────────────────────────

function PerfilUsuario() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [perfilConvivencia,  setPerfilConvivencia]  = useState(null)
  const [publicacionVisible, setPublicacionVisible] = useState(false)
  const [intereses,          setIntereses]          = useState([])
  const [loading,            setLoading]            = useState(true)

  useEffect(() => {
    Promise.allSettled([
      fetch('http://localhost:3000/api/perfil/convivencia', { credentials: 'include' }).then(r => r.json()),
      fetch('http://localhost:3000/api/grupos/publicacion', { credentials: 'include' }).then(r => r.json()),
      fetch('http://localhost:3000/api/perfil/mis-intereses', { credentials: 'include' }).then(r => r.json()),
    ]).then(([perfilRes, pubRes, interesesRes]) => {
      if (perfilRes.status     === 'fulfilled') setPerfilConvivencia(perfilRes.value.perfil ?? null)
      if (pubRes.status        === 'fulfilled') setPublicacionVisible(pubRes.value.publicacion?.visible ?? false)
      if (interesesRes.status  === 'fulfilled') setIntereses(interesesRes.value.intereses ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const edad  = calcEdad(perfilConvivencia?.fecha_nacimiento)
  const chips = calcChips(perfilConvivencia)
  const pct   = calcPct(perfilConvivencia)

  if (loading) return (
    <div className='flex justify-center py-16'>
      <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
    </div>
  )

  return (
    <div className='flex flex-col gap-5'>

      {/* ── Header — spec §5 ── */}
      <div className='flex items-center justify-between'>
        <h1 className='font-display text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>Mi perfil</h1>
        <div className='flex items-center gap-2'>
          {/* secondary — spec §9: bg-slate-100, border slate-200 */}
          <button
            onClick={() => navigator.share?.({ title: 'Mi perfil', url: window.location.href })}
            className='cursor-pointer! inline-flex items-center gap-1.5 bg-slate-100 hover:bg-white text-slate-900 border border-slate-200 hover:border-slate-300 text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
          >
            <Share2 size={14} /> Compartir
          </button>
          {/* primary — spec §9: emerald-600 */}
          <button
            onClick={() => navigate('/perfil/usuario/editar')}
            className='cursor-pointer! inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
          >
            <Pencil size={14} /> Editar perfil
          </button>
        </div>
      </div>

      {/* ── Hero card — spec §6: grid 21.25rem 1fr, gap 1.25rem, p 1.75rem ── */}
      <div
        className='bg-white border border-slate-100 rounded-3xl p-7 grid grid-cols-[21.25rem_1fr] gap-5'
        style={CARD_SHADOW}
      >
        {/* Columna izq: foto 284px centrada + VISIBLE */}
        <div className='relative flex justify-center items-center'>
          {user?.foto_perfil
            ? <img
                src={user.foto_perfil}
                alt='Foto de perfil'
                className='rounded-full object-cover'
                style={{ width: 284, height: 284 }}
              />
            : <div
                className='rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-6xl font-bold'
                style={{ width: 284, height: 284 }}
              >
                {user?.nombre?.[0]?.toUpperCase() ?? '?'}
              </div>
          }
        </div>

        {/* Columna der: identidad */}
        <div className='flex flex-col justify-center gap-4'>
          {/* eyebrow IDENTIDAD — spec §6 */}
          <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Identidad</p>
          {/* nombre — spec: 2.75rem, tracking -0.02em */}
          <h2 className='font-display text-[2.75rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>
            {user?.nombre ?? '—'}{edad != null ? `, ${edad}` : ''}
          </h2>
          {/* chips género + país — spec §10 */}
          <div className='flex flex-wrap gap-2'>
            {perfilConvivencia?.genero && (
              <span className='inline-flex items-center gap-2 bg-pink-50 text-pink-700 text-[0.8125rem] font-medium px-3.5 py-[7px] rounded-full'>
                <span className='w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0' />
                {perfilConvivencia.genero}
              </span>
            )}
            {perfilConvivencia?.pais && (
              <span className='inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-[0.8125rem] font-medium px-3.5 py-[7px] rounded-full'>
                <span className='w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0' />
                {perfilConvivencia.pais}
              </span>
            )}
          </div>
          {/* bio — spec: bg-slate-50, 1.0625rem, leading-[1.4], text-slate-700 */}
          {perfilConvivencia?.sobre_mi
            ? <p className='font-display text-[1.0625rem] font-normal text-slate-700 leading-[1.4] bg-slate-50 rounded-2xl px-4 py-4'>
                {perfilConvivencia.sobre_mi}
              </p>
            : <p className='font-display text-[1.0625rem] font-normal text-slate-400 italic leading-[1.4]'>Sin descripción todavía.</p>
          }
        </div>
      </div>

      {/* ── Datos personales + Intereses*/}
      <div className='grid grid-cols-2 gap-5'>

        {/* Datos personales */}
        <div className='bg-white border border-slate-100 rounded-3xl p-7 flex flex-col gap-4' style={CARD_SHADOW}>
          <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Datos personales</p>
          <div className='flex flex-col'>
            {[
              { label: 'Email',  value: user?.email,                          mono: true  },
              { label: 'Género', value: perfilConvivencia?.genero,            mono: false },
              { label: 'País',   value: perfilConvivencia?.pais,              mono: false },
              { label: 'Edad',   value: edad != null ? `${edad} años` : null, mono: false },
            ].map(({ label, value, mono }, i, arr) => (
              <div
                key={label}
                className={`flex justify-between items-center py-[0.875rem] ${i < arr.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}
              >
                {/* etiqueta — spec: Geist Mono 11px/600/tracking 0.10em */}
                <span className='font-mono text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-[0.10em]'>{label}</span>
                {/* valor — spec: Manrope 15px/500 · email Geist Mono 12px/400 */}
                <span className={`text-right truncate max-w-[58%] text-slate-700 ${mono ? 'font-mono text-[0.75rem] font-normal' : 'text-[0.9375rem] font-medium'}`}>
                  {value ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Intereses — spec §7b: bg-slate-900, chips todos bg-slate-700 text-slate-100 */}
        <div className='bg-slate-900 text-slate-200 rounded-3xl p-7 flex flex-col gap-4 min-w-0 overflow-hidden' style={CARD_SHADOW}>
          <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-400'>Intereses</p>
          {intereses.length === 0 ? (
            <div className='flex-1 flex flex-col justify-center gap-2'>
              <p className='text-[0.8125rem] font-medium text-slate-500'>Sin intereses todavía.</p>
              <button
                onClick={() => navigate('/perfil/usuario/editar')}
                className='cursor-pointer! text-[0.8125rem] font-semibold text-emerald-400 hover:text-emerald-300 transition text-left'
              >
                Añadir intereses →
              </button>
            </div>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {intereses.map(({ id, nombre }) => (
                <span key={id} className='bg-slate-700 text-slate-100 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>
                  {nombre}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Compatibilidad — spec §8: p 1.75rem, grid 4 cols gap 1.5rem ── */}
      <div className='bg-white border border-slate-100 rounded-3xl p-7 flex flex-col gap-6' style={CARD_SHADOW}>
        <div className='flex items-start justify-between'>
          <div>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-1.5'>Compatibilidad</p>
            <h3 className='font-display text-[2rem] font-normal text-slate-900 leading-none'>¿Cómo soy en casa?</h3>
          </div>
          {perfilConvivencia && (
            <div className='text-right'>
              {/* KPI — spec: emerald-600, 2.625rem */}
              <p className='font-display text-[2.625rem] font-normal text-emerald-600 leading-none tabular-nums'>
                {pct}<span className='text-[1.125rem] font-medium text-slate-400'>%</span>
              </p>
              <p className='font-mono text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-[0.08em] mt-1'>Completado</p>
            </div>
          )}
        </div>

        {!perfilConvivencia && !user?.es_casero ? (
          <div className='bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3'>
            <p className='text-sm font-semibold text-orange-800'>Completa tu perfil de convivencia</p>
            <p className='text-xs text-orange-600 leading-relaxed mt-0.5'>
              Añade tus preferencias para que otros compañeros puedan conocerte mejor.
            </p>
            <button
              onClick={() => navigate('/perfil/usuario/editar')}
              className='cursor-pointer! mt-2 text-[0.75rem] font-semibold text-orange-700 hover:text-orange-900 transition'
            >
              Rellenar ahora →
            </button>
          </div>
        ) : perfilConvivencia ? (
          <div className='grid grid-cols-4 gap-6'>
            {DONUTS_CONFIG_USUARIO.map(cfg => (
              <DonutChart
                key={cfg.campo}
                sublabel={cfg.sublabel}
                color={cfg.color}
                labels={cfg.labels}
                valor={perfilConvivencia[cfg.campo]}
              />
            ))}
          </div>
        ) : null}
      </div>

    </div>
  )
}

export default PerfilUsuario
