import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/apiFetch'
import {
  Megaphone, MapPin, Eye, EyeOff, Plus, Pencil,
  Trash2, MessageCircle, ChevronLeft, ChevronRight, ImageOff, Globe, UserPlus,
} from 'lucide-react'

// ── Constantes de estilo ──────────────────────────────────────────────

const CARD = 'bg-white border border-slate-100 rounded-[1.25rem]'

// ── Toggle ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      role='switch'
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`cursor-pointer! flex items-center w-11 h-6 rounded-full px-0.5 transition-colors duration-200 disabled:opacity-50 shrink-0 ${
        checked ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
      }`}
    >
      <span className='w-5 h-5 rounded-full bg-white shadow-sm block transition-all duration-200' />
    </button>
  )
}

// ── Modal confirmar visibilidad ───────────────────────────────────────

function ModalConfirmarVisible({ publicar, onConfirmar, onCancelar }) {
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'
      onClick={onCancelar}
    >
      <div
        className='bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-start gap-4'>
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
            publicar ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'
          }`}>
            {publicar
              ? <Globe aria-hidden='true' size={20} className='text-emerald-600' />
              : <EyeOff aria-hidden='true' size={20} className='text-slate-500' />
            }
          </div>
          <div>
            <h3 className='font-display text-lg font-bold text-slate-900'>
              {publicar ? '¿Publicar el anuncio?' : '¿Ocultar el anuncio?'}
            </h3>
            <p className='text-sm text-slate-500 mt-1.5 leading-relaxed'>
              {publicar
                ? 'El anuncio aparecerá en el marketplace y cualquier persona podrá verlo y contactaros.'
                : 'El anuncio dejará de aparecer en las búsquedas. Podrás volver a publicarlo cuando quieras.'
              }
            </p>
          </div>
        </div>
        <div className='flex gap-2.5 justify-end'>
          <button
            onClick={onCancelar}
            className='cursor-pointer! px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition'
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className={`cursor-pointer! px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition ${
              publicar ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-800'
            }`}
          >
            {publicar ? 'Sí, publicar' : 'Sí, ocultar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal eliminar ────────────────────────────────────────────────────

function ModalEliminar({ eliminando, onConfirmar, onCancelar }) {
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'
      onClick={onCancelar}
    >
      <div
        className='bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-start gap-4'>
          <div role='alert' className='w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0'>
            <Trash2 aria-hidden='true' size={20} className='text-red-500' />
          </div>
          <div>
            <h3 className='font-display text-lg font-bold text-slate-900'>¿Eliminar el anuncio?</h3>
            <p className='text-sm text-slate-500 mt-1.5 leading-relaxed'>
              Esta acción es irreversible. El anuncio desaparecerá del marketplace y se perderán las estadísticas.
            </p>
          </div>
        </div>
        <div className='flex gap-2.5 justify-end'>
          <button
            onClick={onCancelar}
            className='cursor-pointer! px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition'
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={eliminando}
            className='cursor-pointer! px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60'
          >
            {eliminando ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Carrusel ──────────────────────────────────────────────────────────

function Carrusel({ fotos, visible }) {
  const [idx, setIdx] = useState(0)

  if (!fotos.length) {
    return (
      <div className={`${CARD} p-5`}>
        <div className='w-full aspect-video bg-slate-50 rounded-[0.875rem] flex flex-col items-center justify-center gap-2 border border-slate-100'>
          <ImageOff aria-hidden='true' size={28} className='text-slate-500' />
          <p className='font-mono text-xs text-slate-500'>Sin fotos</p>
        </div>
      </div>
    )
  }

  const prev = () => setIdx(i => (i - 1 + fotos.length) % fotos.length)
  const next = () => setIdx(i => (i + 1) % fotos.length)

  const thumbs = fotos.slice(0, 4)
  const extra  = fotos.length > 4 ? fotos.length - 4 : 0

  return (
    <div className={`${CARD} p-5 flex flex-col gap-4`}>

      {/* Foto principal */}
      <div className='relative w-full aspect-video bg-slate-100 rounded-[0.875rem] overflow-hidden group'>
        <img
          src={fotos[idx].url}
          alt={`Foto ${idx + 1}`}
          className='w-full h-full object-cover'
        />

        {/* Badge visibilidad */}
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${
          visible
            ? 'text-emerald-700 bg-emerald-50/90 border-emerald-100'
            : 'text-slate-600 bg-slate-100/90 border-slate-200'
        }`}>
          {visible ? <Eye aria-hidden='true' size={10} /> : <EyeOff aria-hidden='true' size={10} />}
          {visible ? 'Público' : 'No visible'}
        </span>

        {/* Flechas */}
        {fotos.length > 1 && (
          <>
            <button
              aria-label='Foto anterior' onClick={prev}
              className={`cursor-pointer! absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm text-slate-700 transition backdrop-blur-sm ${
                idx === 0 ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <ChevronLeft aria-hidden='true' size={18} />
            </button>
            <button
              aria-label='Foto siguiente' onClick={next}
              className={`cursor-pointer! absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm text-slate-700 transition backdrop-blur-sm ${
                idx === fotos.length - 1 ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <ChevronRight aria-hidden='true' size={18} />
            </button>

            {/* Contador */}
            <span className='absolute bottom-3 right-3 font-mono text-[11px] font-semibold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full'>
              {idx + 1} / {fotos.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {fotos.length > 1 && (
        <div className='grid grid-cols-4 gap-2'>
          {thumbs.map((f, i) => {
            const esOverlay = i === 3 && extra > 0
            return (
              <button
                key={f.id}
                onClick={() => setIdx(i)}
                className={`cursor-pointer! relative aspect-[1.3] rounded-xl overflow-hidden border-2 transition ${
                  i === idx
                    ? 'border-emerald-600 opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-90'
                }`}
              >
                <img src={f.url} alt='' className='w-full h-full object-cover' />
                {esOverlay && (
                  <div className='absolute inset-0 bg-black/55 flex items-center justify-center'>
                    <span className='font-mono text-sm font-bold text-white'>+{extra}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Fila de tabla ─────────────────────────────────────────────────────

function FilaInfo({ label, children, last }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${!last ? 'border-b border-dashed border-slate-100' : ''}`}>
      <span className='font-mono text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-slate-500 shrink-0'>
        {label}
      </span>
      <span className='text-sm text-slate-800 text-right'>{children}</span>
    </div>
  )
}

// ── Fila de acción ────────────────────────────────────────────────────

function FilaAccion({ icon: Icon, iconBg, iconColor, title, subtitle, onClick, badge, rojo }) {
  if (rojo) {
    return (
      <button
        onClick={onClick}
        className='cursor-pointer! w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-left transition'
      >
        <div className='w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0'>
          <Icon aria-hidden='true' size={16} className='text-red-600' />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-semibold text-red-600'>{title}</p>
          {subtitle && <p className='text-xs text-red-400 mt-0.5'>{subtitle}</p>}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className='cursor-pointer! w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 text-left transition'
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon aria-hidden='true' size={16} className={iconColor} />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-semibold text-slate-800'>{title}</p>
        {subtitle && <p className='text-xs text-slate-500 mt-0.5'>{subtitle}</p>}
      </div>
      {badge != null && (
        <span className='shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-500 text-white font-mono text-[10px] font-bold flex items-center justify-center'>
          {badge}
        </span>
      )}
    </button>
  )
}

// ── Página ────────────────────────────────────────────────────────────

function Publicacion() {
  const { miembros, user } = useOutletContext()
  const navigate = useNavigate()

  const [publicacion,   setPublicacion]   = useState(undefined)
  const [fotos,         setFotos]         = useState([])
  const [numChats,      setNumChats]      = useState(0)
  const [numSolicitudesUnion, setNumSolicitudesUnion] = useState(0)
  const [toggling,        setToggling]        = useState(false)
  const [modalVisible,    setModalVisible]    = useState(null) // null | true | false
  const [modalEliminar,   setModalEliminar]   = useState(false)
  const [eliminando,      setEliminando]      = useState(false)

  const esAdmin = miembros.find(m => m.id === user?.id)?.rol_en_grupo === 'ADMIN'

  useEffect(() => {
    apiFetch('/api/grupos/publicacion')
      .then(r => r.json())
      .then(d => {
        setPublicacion(d.publicacion ?? null)
        setFotos(d.fotos ?? [])
      })
      .catch(() => setPublicacion(null))
  }, [])

  useEffect(() => {
    if (!esAdmin) return
    apiFetch('/api/chats/como-admin')
      .then(r => r.json())
      .then(d => setNumChats(d.chats?.length ?? 0))
      .catch(() => {})
  }, [esAdmin])

  useEffect(() => {
    if (!esAdmin) return
    apiFetch('/api/grupos/solicitudes-union')
      .then(r => r.json())
      .then(d => setNumSolicitudesUnion(d.solicitudes?.length ?? 0))
      .catch(() => {})
  }, [esAdmin])

  const handleToggleVisible = (nuevoValor) => {
    if (toggling || !publicacion) return
    setModalVisible(nuevoValor)
  }

  const aplicarVisibilidad = async (nuevoValor) => {
    setModalVisible(null)
    setToggling(true)
    const anterior = publicacion
    setPublicacion(p => ({ ...p, visible: nuevoValor }))
    try {
      const r = await apiFetch('/api/grupos/publicacion/visible', {
        method: 'PATCH',
        body: JSON.stringify({ visible: nuevoValor }),
      })
      if (!r.ok) setPublicacion(anterior)
    } catch {
      setPublicacion(anterior)
    } finally {
      setToggling(false)
    }
  }

  const handleEliminar = async () => {
    setEliminando(true)
    try {
      const r = await apiFetch('/api/grupos/publicacion', { method: 'DELETE' })
      if (r.ok) {
        setPublicacion(null)
        setFotos([])
        setModalEliminar(false)
      }
    } catch {}
    setEliminando(false)
  }

  // ── Loading ───────────────────────────────────────────────────────

  if (publicacion === undefined) {
    return (
      <div className='flex justify-center py-16'>
        <div role='status' aria-label='Cargando' className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  // ── Estado 1 — Sin anuncio ────────────────────────────────────────

  if (!publicacion) {
    return (
      <div className='flex items-center justify-center min-h-[70vh]'>
        <div className={`${CARD} p-12 flex flex-col items-center text-center gap-5 w-full max-w-[28rem]`}>
          <div className='w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center'>
            <Megaphone aria-hidden='true' size={28} className='text-emerald-500' />
          </div>

          <div className='flex flex-col gap-2'>
            <h2 className='font-display text-[2rem] font-bold text-slate-900 leading-tight'>
              Todavía no tenéis anuncio
            </h2>
            <p className='text-sm text-slate-500 leading-relaxed max-w-xs mx-auto'>
              El anuncio muestra vuestro piso en el marketplace para que futuros compañeros puedan contactaros y pedir unirse al grupo.
            </p>
          </div>

          <button
            onClick={() => navigate('/grupo/publicacion/formulario')}
            disabled={!esAdmin}
            className='cursor-pointer! flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-3 rounded-xl transition w-full max-w-[20rem]'
          >
            <Plus aria-hidden='true' size={15} /> Crear anuncio
          </button>

          <p className='text-xs text-slate-500'>
            Solo el administrador puede crear y editar el anuncio
          </p>
        </div>
      </div>
    )
  }

  // ── Estado 2 / 3 — Con anuncio ────────────────────────────────────

  return (
    <div className='flex flex-col gap-6'>

      {/* Header */}
      <div className='flex items-center justify-between gap-4'>
        <h1 className='font-display text-3xl sm:text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>
          Tu anuncio
        </h1>
        {esAdmin && (
          <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold px-3 py-1.5 rounded-full border shrink-0 ${
            publicacion.visible
              ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
              : 'text-slate-500 bg-slate-100 border-slate-200'
          }`}>
            {publicacion.visible ? <Eye aria-hidden='true' size={11} /> : <EyeOff aria-hidden='true' size={11} />}
            {publicacion.visible ? 'Visible en búsquedas' : 'No visible'}
          </span>
        )}
      </div>

      {/* Grid dos columnas */}
      <div className='grid grid-cols-1 lg:grid-cols-[1fr_19rem] gap-6 items-start'>

        {/* ── Columna izquierda ───────────────────────────────── */}
        <div className='flex flex-col gap-5'>

          {/* Carrusel */}
          <Carrusel fotos={fotos} visible={publicacion.visible} />

          {/* Información */}
          <div className={`${CARD} p-5`}>
            <p className='font-mono text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-slate-500 mb-0.5'>
              Información
            </p>
            <FilaInfo label='Título'>{publicacion.titulo}</FilaInfo>
            {publicacion.ciudad && (
              <FilaInfo label='Ciudad'>
                <span className='flex items-center justify-end gap-1.5'>
                  <MapPin aria-hidden='true' size={12} className='text-slate-500' />
                  {publicacion.ciudad}
                </span>
              </FilaInfo>
            )}
            <FilaInfo label='Precio'>
              <span className='font-semibold text-emerald-700'>
                {Number(publicacion.precio).toFixed(0)} € / persona al mes
              </span>
            </FilaInfo>
            <FilaInfo label='Hab. libres'>
              {publicacion.habitaciones_libres} habitación{publicacion.habitaciones_libres !== 1 ? 'es' : ''}
            </FilaInfo>
            <FilaInfo label='Tamaño' last>
              {publicacion.tamano_piso ? `${publicacion.tamano_piso} m²` : '—'}
            </FilaInfo>
          </div>

        </div>

        {/* ── Columna derecha ─────────────────────────────────── */}
        <div className='flex flex-col gap-4 lg:sticky lg:top-6'>

          {/* Visibilidad — solo admin */}
          {esAdmin && (
            <div className={`${CARD} overflow-hidden`}>
              <div className='px-5 pt-5 pb-3'>
                <p className='font-mono text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-slate-500'>
                  Visibilidad
                </p>
              </div>
              <div className={`mx-3 mb-3 flex items-center gap-3 pl-3 pr-3 py-3 rounded-xl transition ${
                publicacion.visible ? 'bg-emerald-50' : 'bg-slate-50'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition ${
                  publicacion.visible ? 'bg-emerald-500' : 'bg-slate-300'
                }`} />
                <span className='flex-1 text-sm font-semibold text-slate-800'>
                  {publicacion.visible ? 'Público' : 'No visible'}
                </span>
                <Toggle
                  checked={publicacion.visible}
                  onChange={handleToggleVisible}
                  disabled={toggling}
                />
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className={`${CARD} p-5 flex flex-col gap-2`}>
            <p className='font-mono text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-slate-500 mb-1'>
              Acciones
            </p>

            <FilaAccion
              icon={Eye}
              iconBg='bg-emerald-50'
              iconColor='text-emerald-600'
              title='Ver anuncio público'
              subtitle='Cómo lo ven los demás'
              onClick={() => navigate(`/anuncio/${publicacion.id}`)}
            />

            {esAdmin && (
              <>
                <FilaAccion
                  icon={Pencil}
                  iconBg='bg-slate-100'
                  iconColor='text-slate-600'
                  title='Editar anuncio'
                  subtitle='Cambiar fotos, precio y datos'
                  onClick={() => navigate('/grupo/publicacion/formulario')}
                />
                <FilaAccion
                  icon={MessageCircle}
                  iconBg='bg-blue-50'
                  iconColor='text-blue-500'
                  title='Mensajes'
                  subtitle='Solicitudes de contacto'
                  onClick={() => navigate('/grupo/mensajes')}
                  badge={numChats > 0 ? numChats : null}
                />
                <FilaAccion
                  icon={UserPlus}
                  iconBg='bg-amber-50'
                  iconColor='text-amber-600'
                  title='Solicitudes de acceso'
                  subtitle='Peticiones para unirse al grupo'
                  onClick={() => navigate('/grupo/solicitudes-union')}
                  badge={numSolicitudesUnion > 0 ? numSolicitudesUnion : null}
                />
                <FilaAccion
                  icon={Trash2}
                  title='Eliminar anuncio'
                  subtitle='Acción irreversible'
                  onClick={() => setModalEliminar(true)}
                  rojo
                />
              </>
            )}
          </div>

        </div>
      </div>

      {modalVisible !== null && (
        <ModalConfirmarVisible
          publicar={modalVisible}
          onConfirmar={() => aplicarVisibilidad(modalVisible)}
          onCancelar={() => setModalVisible(null)}
        />
      )}

      {modalEliminar && (
        <ModalEliminar
          eliminando={eliminando}
          onConfirmar={handleEliminar}
          onCancelar={() => setModalEliminar(false)}
        />
      )}

    </div>
  )
}

export default Publicacion
