import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Share2, ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import { CARD_SHADOW, TARJETAS_CONVIVENCIA_USUARIO, labelsUsuario, calcEdad } from '../lib/convivencia.js'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../lib/apiFetch'

const STRIPE_BG = 'repeating-linear-gradient(45deg,#f1f5f9,#f1f5f9 6px,#e2e8f0 6px,#e2e8f0 12px)'

function CarruselFotos({ fotos, nombre }) {
  const [idx, setIdx] = useState(0)
  const total = fotos.length
  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)
  const src = fotos[idx]
  return (
    <div className='relative w-full h-[24rem] rounded-3xl overflow-hidden' style={CARD_SHADOW}>
      {src
        ? <img src={src} alt={nombre} className='w-full h-full object-cover' />
        : <div className='w-full h-full flex flex-col items-center justify-center gap-2' style={{ background: STRIPE_BG }}>
            <Camera aria-hidden='true' size={24} className='text-slate-500' />
          </div>
      }
      {total > 1 && (
        <>
          <button aria-label='Foto anterior' onClick={prev}
            className='cursor-pointer! absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-white flex items-center justify-center transition'>
            <ChevronLeft aria-hidden='true' size={18} />
          </button>
          <button aria-label='Foto siguiente' onClick={next}
            className='cursor-pointer! absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-white flex items-center justify-center transition'>
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

export default function PerfilUsuario() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [perfilConvivencia, setPerfilConvivencia] = useState(null)
  const [intereses,         setIntereses]         = useState([])
  const [loading,           setLoading]           = useState(true)

  useEffect(() => {
    Promise.allSettled([
      apiFetch('/api/perfil/convivencia').then(r => r.json()),
      apiFetch('/api/perfil/mis-intereses').then(r => r.json()),
    ]).then(([perfilRes, interesesRes]) => {
      if (perfilRes.status    === 'fulfilled') setPerfilConvivencia(perfilRes.value.perfil ?? null)
      if (interesesRes.status === 'fulfilled') setIntereses(interesesRes.value.intereses ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const edad  = calcEdad(perfilConvivencia?.fecha_nacimiento)
  const fotos = [user?.foto_perfil ?? null, user?.foto_1 ?? null, user?.foto_2 ?? null]

  if (loading) return (
    <div className='flex justify-center py-16'>
      <div role='status' aria-label='Cargando' className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
    </div>
  )

  const botonesAccion = (
    <>
      <button
        onClick={() => navigator.share?.({ title: 'Mi perfil', url: window.location.href })}
        className='cursor-pointer! w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-white text-slate-900 border border-slate-200 hover:border-slate-300 text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
      >
        <Share2 aria-hidden='true' size={14} /> Compartir
      </button>
      <button
        onClick={() => navigate('/perfil/usuario/editar')}
        className='cursor-pointer! w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
      >
        <Pencil aria-hidden='true' size={14} /> Editar perfil
      </button>
    </>
  )

  return (
    <div className='flex flex-col gap-5'>

      {/* ── Header ── */}
      <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between'>
        <h1 className='font-display text-3xl sm:text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>Mi perfil</h1>
        {/* Botones de acción — solo escritorio; en móvil se muestran al final de la página */}
        <div className='hidden sm:flex items-center flex-wrap gap-2'>
          {botonesAccion}
        </div>
      </div>

      {/* ── Hero card ── */}
      <div className='bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-8 items-center' style={CARD_SHADOW}>

        {/* Carrusel de fotos */}
        <div className='px-0 sm:px-20'>
          <CarruselFotos fotos={fotos} nombre={user?.nombre} />
        </div>

        {/* Identidad */}
        <div className='flex flex-col gap-4'>
          <h2 className='font-display text-[2rem] sm:text-[2.75rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>
            {user?.nombre ?? '—'}{edad != null ? `, ${edad}` : ''}
          </h2>
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
          {perfilConvivencia?.sobre_mi
            ? <p className='font-display text-[1.0625rem] font-normal text-slate-700 leading-[1.4] bg-slate-50 rounded-2xl px-4 py-4'>
                {perfilConvivencia.sobre_mi}
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
              { label: 'Email',  value: user?.email,                          mono: false  },
              { label: 'Género', value: perfilConvivencia?.genero,            mono: false },
              { label: 'País',   value: perfilConvivencia?.pais,              mono: false },
              { label: 'Edad',   value: edad != null ? `${edad} años` : null, mono: false },
            ].map(({ label, value, mono }, i, arr) => (
              <div key={label} className={`flex justify-between items-center py-[0.875rem] ${i < arr.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}>
                <span className='font-mono text-[0.6875rem] font-semibold text-slate-500 uppercase tracking-[0.10em]'>{label}</span>
                <span className={`text-right truncate max-w-[58%] text-slate-700 ${mono ? 'font-mono text-[0.75rem] font-normal' : 'text-[0.9375rem] font-medium'}`}>
                  {value ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-slate-900 text-slate-200 rounded-3xl p-5 sm:p-7 flex flex-col gap-5 min-w-0 overflow-hidden' style={CARD_SHADOW}>

          {/* Estilo de vida */}
          {perfilConvivencia && (perfilConvivencia.ocupacion || perfilConvivencia.fumador !== null || perfilConvivencia.tiene_mascotas !== null || perfilConvivencia.lgbtq_friendly === true) && (
            <div className='flex flex-col gap-2'>
              <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-300'>Estilo de vida</p>
              <div className='flex flex-wrap gap-2'>
                {perfilConvivencia.ocupacion === 'ESTUDIO'           && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Estudiante</span>}
                {perfilConvivencia.ocupacion === 'TRABAJO'           && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Trabajador/a</span>}
                {perfilConvivencia.ocupacion === 'ESTUDIO_Y_TRABAJO' && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Estudiante y trabajador/a</span>}
                {perfilConvivencia.fumador === true  && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Fumador/a</span>}
                {perfilConvivencia.fumador === false && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>No fumador/a</span>}
                {perfilConvivencia.tiene_mascotas === true  && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Tiene mascotas</span>}
                {perfilConvivencia.tiene_mascotas === false && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Sin mascotas</span>}
                {perfilConvivencia.lgbtq_friendly === true  && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>LGBTQ+ friendly</span>}
              </div>
            </div>
          )}

          {/* Intereses */}
          <div className='flex flex-col gap-2'>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-300'>Intereses</p>
            {intereses.length === 0 ? (
              <div className='flex flex-col gap-2'>
                <p className='text-[0.8125rem] font-medium text-slate-300'>Sin intereses todavía.</p>
                <button onClick={() => navigate('/perfil/usuario/editar')}
                  className='cursor-pointer! text-[0.8125rem] font-semibold text-emerald-400 hover:text-emerald-300 transition text-left'>
                  Añadir intereses →
                </button>
              </div>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {intereses.map(({ id, nombre }) => (
                  <span key={id} className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>{nombre}</span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Compatibilidad — grid 3×2 de tarjetas ── */}
      <div className='bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 flex flex-col gap-6' style={CARD_SHADOW}>
        <div>
          <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-1.5'>Compatibilidad</p>
          <h3 className='font-display text-2xl sm:text-[2rem] font-normal text-slate-900 leading-none'>¿Cómo soy en casa?</h3>
        </div>
        {!perfilConvivencia && !user?.es_casero ? (
          <div className='bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3'>
            <p className='text-sm font-semibold text-orange-800'>Completa tu perfil de convivencia</p>
            <p className='text-xs text-orange-600 leading-relaxed mt-0.5'>Añade tus preferencias para que otros compañeros puedan conocerte mejor.</p>
            <button onClick={() => navigate('/perfil/usuario/editar')}
              className='cursor-pointer! mt-2 text-[0.75rem] font-semibold text-orange-700 hover:text-orange-900 transition'>
              Rellenar ahora →
            </button>
          </div>
        ) : perfilConvivencia ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4'>
            {TARJETAS_CONVIVENCIA_USUARIO.map(cfg => <TraitCard key={cfg.campo} cfg={cfg} valor={perfilConvivencia[cfg.campo]} />)}
          </div>
        ) : null}
      </div>

      {/* Botones de acción — solo móvil, al final de la página */}
      <div className='sm:hidden bg-white border border-slate-100 rounded-3xl p-4 grid grid-cols-2 gap-2' style={CARD_SHADOW}>
        {botonesAccion}
      </div>

    </div>
  )
}
