import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Camera, SearchX } from 'lucide-react'
import { EstadoVacio } from '../components/EstadoVacio'
import { CARD_SHADOW, TARJETAS_CONVIVENCIA_USUARIO, labelsUsuario, calcEdad } from '../lib/convivencia.js'
import { apiFetch } from '../lib/apiFetch'
import PieDePagina from '../components/PieDePagina.jsx'
import { SaltarAlContenido } from '../components/Accesibilidad.jsx'
import HeaderPublico from '../components/HeaderPublico.jsx'
import LoginModal from '../components/LoginModal.jsx'
import RegistroModal from '../components/RegistroModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const STRIPE_BG = 'repeating-linear-gradient(45deg,#f1f5f9,#f1f5f9 6px,#e2e8f0 6px,#e2e8f0 12px)'

// ─── Carrusel de fotos ───
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

// ─── Tarjeta de rasgo de convivencia ───
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

// ─── Página ───
export default function PerfilPublicoUsuario() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { recargarUsuario } = useAuth()
  const [ciudad, setCiudad] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [registroOpen, setRegistroOpen] = useState(false)

  const handleCiudadBuscar = (c) => {
    if (c?.trim()) navigate(`/buscar?ciudad=${encodeURIComponent(c.trim())}`)
  }

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
    <EstadoVacio
      pantallaCompleta
      icono={SearchX}
      titulo='Usuario no encontrado'
      descripcion='Puede que haya eliminado su cuenta o que el enlace no sea correcto.'
      accion={{ label: 'Volver', icono: ArrowLeft, onClick: () => navigate(-1) }}
    />
  )

  const { usuario, convivencia, intereses } = datos
  const edad  = calcEdad(usuario.fecha_nacimiento ?? convivencia?.fecha_nacimiento)
  const fotos = usuario.fotos ?? []

  return (
    <div className='min-h-screen bg-slate-50'>

      {/* Header */}
      <SaltarAlContenido />
      <HeaderPublico
        ciudad={ciudad}
        onCiudadChange={setCiudad}
        onBuscarCiudad={handleCiudadBuscar}
        onIniciarSesion={() => setLoginOpen(true)}
      />

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

        {/* ─── Hero card ─── */}
        <div className='bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-8 items-center' style={CARD_SHADOW}>

          {/* Carrusel de fotos */}
          <div className='px-0 sm:px-20'>
            <CarruselFotos fotos={fotos} nombre={usuario.nombre} />
          </div>

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

        {/* ─── Datos + Intereses ─── */}
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

        {/* ─── Compatibilidad — grid 3×2 de tarjetas ─── */}
        <div className='bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 flex flex-col gap-6' style={CARD_SHADOW}>
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

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={async () => { await recargarUsuario(); setLoginOpen(false) }}
          onSwitchToRegistro={() => { setLoginOpen(false); setRegistroOpen(true) }}
        />
      )}
      {registroOpen && (
        <RegistroModal
          onClose={() => setRegistroOpen(false)}
          onSuccess={async (esCasero) => { await recargarUsuario(); setRegistroOpen(false); navigate(esCasero ? '/' : '/perfil/usuario/editar') }}
          onSwitchToLogin={() => { setRegistroOpen(false); setLoginOpen(true) }}
        />
      )}
    </div>
  )
}
