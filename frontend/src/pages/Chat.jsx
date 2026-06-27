import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext.jsx'
import {
  MessageCircle, Send, CheckCircle2, XCircle,
  Clock, Trash2, X, ArrowLeft,
} from 'lucide-react'

const API = 'http://localhost:3000'

const AVATAR_COLORS = ['#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']

function avatarColor(nombre) {
  return AVATAR_COLORS[(nombre?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
}

function hora(ts) {
  if (!ts) return ''
  const d   = new Date(ts)
  const hoy = new Date()
  if (d.toDateString() === hoy.toDateString())
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function Avatar({ foto, nombre, size = 'md' }) {
  const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-11 h-11 text-sm' }
  const cls = `${sizeMap[size] ?? sizeMap.md} rounded-full shrink-0 flex items-center justify-center font-semibold text-white overflow-hidden`
  return foto
    ? <img src={foto} alt={nombre} className={`${cls} object-cover`} />
    : <div className={cls} style={{ backgroundColor: avatarColor(nombre) }}>
        {nombre?.[0]?.toUpperCase()}
      </div>
}

// ── Modal confirmar cierre de chat ────────────────────────────────

function ModalCerrarChat({ nombreOtro, cerrando, onConfirmar, onCancelar }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm' onClick={onCancelar}>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-sm' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <h3 className='font-display text-base font-bold text-slate-900'>Cerrar conversación</h3>
          <button onClick={onCancelar} className='cursor-pointer! w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition'>
            <X size={16} />
          </button>
        </div>
        <div className='px-6 py-5 flex flex-col gap-4'>
          <div className='bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-3'>
            <div className='w-2 h-2 rounded-full bg-red-400 shrink-0' />
            <p className='text-sm font-semibold text-slate-900'>Conversación con {nombreOtro}</p>
          </div>
          <p className='text-sm text-slate-500 leading-relaxed'>
            ¿Seguro que quieres cerrar esta conversación? Se borrarán todos los mensajes y no podrá recuperarse.
          </p>
          <div className='flex gap-2 justify-end'>
            <button type='button' onClick={onCancelar} className='cursor-pointer! px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition'>
              Cancelar
            </button>
            <button
              type='button'
              onClick={onConfirmar}
              disabled={cerrando}
              className='cursor-pointer! inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50'
            >
              {cerrando
                ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                : <Trash2 size={14} />}
              Cerrar chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Conversación ──────────────────────────────────────────────────

function Conversacion({ chatId, user, nombreOtro, fotoOtro, subtituloOtro, idOtro, esAdmin, onCerrar, onVolver }) {
  const navigate = useNavigate()
  const [mensajes,          setMensajes]          = useState([])
  const [texto,             setTexto]             = useState('')
  const [enviando,          setEnviando]  = useState(false)
  const [modalCierre,       setModalCierre] = useState(false)
  const [cerrando,          setCerrando]  = useState(false)
  const bottomRef  = useRef(null)
  const refSocket  = useRef(null)

  const cargarMensajes = useCallback(async () => {
    const res = await fetch(`${API}/api/chats/${chatId}/mensajes`, { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json()
    setMensajes(data.mensajes)
  }, [chatId])

  useEffect(() => {
    cargarMensajes()
    const socket = io(API, { withCredentials: true })
    refSocket.current = socket
    socket.emit('join_chat', chatId)
    socket.on('nuevo_mensaje', msg => setMensajes(prev => [...prev, msg]))
    return () => { socket.emit('leave_chat', chatId); socket.disconnect() }
  }, [chatId, cargarMensajes])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const cerrarChat = async () => {
    setCerrando(true)
    try {
      const res = await fetch(`${API}/api/chats/${chatId}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) onCerrar(chatId)
    } finally { setCerrando(false) }
  }

  const enviar = async (e) => {
    e.preventDefault()
    if (!texto.trim() || enviando) return
    setEnviando(true)
    try {
      const res = await fetch(`${API}/api/chats/${chatId}/mensajes`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: texto.trim() }),
      })
      if (res.ok) setTexto('')
    } finally { setEnviando(false) }
  }

  return (
    <div className='flex flex-col h-full'>

      {/* Cabecera */}
      <div className='flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 shrink-0'>
        {onVolver && (
          <button type='button' onClick={onVolver} className='cursor-pointer! sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 transition'>
            <ArrowLeft size={18} />
          </button>
        )}
        <Avatar foto={fotoOtro} nombre={nombreOtro} size='md' />
        <div className='flex-1 min-w-0'>
          {esAdmin && idOtro ? (
            <button
              type='button'
              onClick={() => navigate(`/usuario/${idOtro}`)}
              className='cursor-pointer! text-[0.9375rem] font-semibold text-slate-900 truncate hover:text-emerald-600 transition text-left'
            >
              {nombreOtro}
            </button>
          ) : (
            <p className='text-[0.9375rem] font-semibold text-slate-900 truncate'>{nombreOtro}</p>
          )}
          {subtituloOtro && (
            <p className='font-mono text-[0.6875rem] text-slate-500 truncate leading-none mt-0.5'>{subtituloOtro}</p>
          )}
        </div>
        <div className='flex items-center gap-1 shrink-0'>
          <button
            type='button'
            aria-label='Cerrar chat'
            onClick={() => setModalCierre(true)}
            className='cursor-pointer! w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-400 transition'
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Mensajes */}
      <div className='flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3 bg-slate-50'>
        {mensajes.length === 0 && (
          <p className='text-center text-xs text-slate-400 py-8'>Sé el primero en escribir</p>
        )}
        {mensajes.map((m, i) => {
          const esMio    = m.remitente_id === user?.id
          const esNuevoDia = i === 0 || new Date(m.enviado_en).toDateString() !== new Date(mensajes[i - 1].enviado_en).toDateString()
          return (
            <div key={m.id}>
              {esNuevoDia && (
                <div className='flex justify-center mb-2'>
                  <span className='font-mono text-[0.625rem] font-semibold uppercase tracking-widest text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full'>
                    {new Date(m.enviado_en).toDateString() === new Date().toDateString()
                      ? 'Hoy'
                      : new Date(m.enviado_en).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })
                    }
                  </span>
                </div>
              )}
              <div className={`flex gap-2 ${esMio ? 'flex-row-reverse' : 'flex-row'}`}>
                {!esMio && <Avatar foto={m.remitente_foto} nombre={m.remitente_nombre} size='sm' />}
                <div className={`max-w-[70%] px-3.5 py-2.5 text-[0.875rem] leading-relaxed ${
                  esMio
                    ? 'self-end bg-emerald-600 text-white rounded-2xl rounded-br-sm'
                    : 'self-start bg-white border border-slate-100 text-slate-900 rounded-2xl rounded-bl-sm'
                }`}>
                  {m.contenido}
                  <p className={`font-mono text-[0.625rem] mt-1 ${esMio ? 'text-white/60' : 'text-slate-400'}`}>
                    {hora(m.enviado_en)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={enviar} className='flex items-center gap-2 px-4 py-3.5 border-t border-slate-100 bg-white shrink-0'>
        <input
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder='Escribe un mensaje...'
          className='flex-1 text-sm bg-slate-50 border border-slate-200 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition'
        />
        <button
          type='submit'
          disabled={!texto.trim() || enviando}
          aria-label='Enviar'
          className='cursor-pointer! w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 flex items-center justify-center transition shrink-0'
        >
          <Send size={16} className='text-white' />
        </button>
      </form>

      {modalCierre && (
        <ModalCerrarChat
          nombreOtro={nombreOtro}
          cerrando={cerrando}
          onConfirmar={cerrarChat}
          onCancelar={() => setModalCierre(false)}
        />
      )}
    </div>
  )
}

// ── Detalle solicitud (admin) ─────────────────────────────────────

function DetalleSolicitud({ solicitud, onAccion }) {
  const [cargando, setCargando] = useState(null)

  const accion = async (a) => {
    setCargando(a)
    const res  = await fetch(`${API}/api/chats/solicitudes/${solicitud.id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: a }),
    })
    const data = await res.json()
    setCargando(null)
    if (res.ok) onAccion(solicitud.id, a, data.chatId)
  }

  return (
    <div className='flex flex-col items-center justify-center h-full gap-6 px-8 bg-slate-50'>
      <div className='flex flex-col items-center gap-3 text-center'>
        <Avatar foto={solicitud.foto_perfil} nombre={solicitud.nombre} size='lg' />
        <div>
          <p className='font-semibold text-slate-900 text-lg'>{solicitud.nombre}</p>
          <p className='text-sm text-slate-400 font-mono'>{solicitud.email}</p>
        </div>
        <p className='text-xs text-slate-400'>Solicita contacto · {hora(solicitud.fecha_envio)}</p>
      </div>

      {solicitud.estado === 'PENDIENTE' && (
        <div className='flex gap-3'>
          <button type='button' onClick={() => accion('RECHAZADA')} disabled={!!cargando}
            className='cursor-pointer! flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-500 text-sm font-semibold transition disabled:opacity-50'>
            {cargando === 'RECHAZADA'
              ? <span className='w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin' />
              : <XCircle size={16} />
            }
            Rechazar
          </button>
          <button type='button' onClick={() => accion('ACEPTADA')} disabled={!!cargando}
            className='cursor-pointer! flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition disabled:opacity-50'>
            {cargando === 'ACEPTADA'
              ? <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              : <CheckCircle2 size={16} />
            }
            Aceptar
          </button>
        </div>
      )}
    </div>
  )
}

// ── Fila de conversación (lista izquierda) ────────────────────────

function ConvRow({ foto, nombre, subtitulo, ultimoMensaje, ultimoEn, activa, onClick, isPendiente }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`cursor-pointer! w-full flex items-center gap-3 px-5 py-3.5 text-left transition ${
        activa
          ? 'bg-emerald-50 shadow-[inset_3px_0_0_#059669]'
          : 'hover:bg-slate-50'
      }`}
    >
      <Avatar foto={foto} nombre={nombre} size='md' />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2'>
          <p className='text-[0.875rem] font-semibold text-slate-800 truncate'>{nombre}</p>
          {ultimoEn && (
            <span className='font-mono text-[0.625rem] text-slate-400 shrink-0'>{hora(ultimoEn)}</span>
          )}
        </div>
        <p className='text-xs text-slate-500 truncate mt-0.5'>
          {isPendiente
            ? <span className='flex items-center gap-1 text-amber-500 font-medium'><Clock size={10} />Pendiente</span>
            : (ultimoMensaje ?? subtitulo ?? '')
          }
        </p>
      </div>
    </button>
  )
}

// ── Página Chat ───────────────────────────────────────────────────

export default function Chat({ modo }) {
  const { user } = useAuth()
  const esAdmin = modo === 'admin'

  const [solicitudes,           setSolicitudes]           = useState([])
  const [chats,                 setChats]                 = useState([])
  const [seleccion,             setSeleccion]             = useState(null)
  const [loading,               setLoading]               = useState(true)
  const [mostrandoConversacion, setMostrandoConversacion] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const endpointSol   = esAdmin ? '/api/chats/solicitudes'    : '/api/chats/mis-solicitudes'
      const endpointChats = esAdmin ? '/api/chats/como-admin'     : '/api/chats/como-solicitante'
      const [resSol, resChats] = await Promise.all([
        fetch(`${API}${endpointSol}`,   { credentials: 'include' }),
        fetch(`${API}${endpointChats}`, { credentials: 'include' }),
      ])
      if (resSol.ok)   { const d = await resSol.json();   setSolicitudes(d.solicitudes) }
      if (resChats.ok) { const d = await resChats.json(); setChats(d.chats) }
    } finally { setLoading(false) }
  }, [esAdmin])

  useEffect(() => { cargar() }, [cargar])

  const chatActivo      = seleccion?.tipo === 'chat'      ? chats.find(c => c.id === seleccion.id)      : null
  const solicitudActiva = seleccion?.tipo === 'solicitud' ? solicitudes.find(s => s.id === seleccion.id) : null

  const handleCerrarChat = (chatId) => {
    setChats(prev => prev.filter(c => c.id !== chatId))
    setSeleccion(null)
    setMostrandoConversacion(false)
  }

  const seleccionar = (item) => {
    setSeleccion(item)
    setMostrandoConversacion(true)
  }

  const handleAccionSolicitud = (solicitudId, accion, chatId) => {
    setSolicitudes(prev => prev.filter(s => s.id !== solicitudId))
    if (accion === 'ACEPTADA' && chatId) { cargar(); seleccionar({ tipo: 'chat', id: chatId }) }
    else { setSeleccion(null); setMostrandoConversacion(false) }
  }

  const otroNombre    = chatActivo ? (esAdmin ? chatActivo.nombre_solicitante : chatActivo.nombre_grupo)  : null
  const otraFoto      = chatActivo ? (esAdmin ? chatActivo.foto_solicitante   : chatActivo.foto_grupo)    : null
  const otroId        = chatActivo ? (esAdmin ? chatActivo.solicitante_id     : null)                     : null
  const otroSubtitulo = chatActivo
    ? (esAdmin ? 'Solicitante' : chatActivo.ciudad ? `${chatActivo.ciudad} · ${Number(chatActivo.precio ?? 0).toFixed(0)}€` : null)
    : null

  const pendientes    = solicitudes.filter(s => s.estado === 'PENDIENTE')
  const hayContenido  = chats.length > 0 || pendientes.length > 0

  if (loading) return (
    <div className='flex justify-center py-24'>
      <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
    </div>
  )

  return (
    <div className='flex flex-col gap-6'>

      {/* Header */}
      <div>
        <h1 className='font-display text-[2.25rem] font-medium -tracking-[0.02em] text-slate-900 leading-none mt-1'>
          Mensajes
        </h1>
      </div>

      {/* Shell */}
      <div
        className='bg-white border border-slate-100 rounded-[1.25rem] overflow-hidden sm:grid'
        style={{
          gridTemplateColumns: '20rem 1fr',
          height: 'calc(100vh - 13rem)',
          minHeight: '480px',
          boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)',
        }}
      >

        {/* Panel izquierdo — lista */}
        <div className={`border-r border-slate-100 flex flex-col overflow-hidden ${mostrandoConversacion ? 'hidden sm:flex' : 'flex'}`}>
          <div className='flex-1 overflow-y-auto'>
            {!hayContenido && (
              <div className='flex flex-col items-center justify-center h-full gap-3 px-6 text-center'>
                <MessageCircle size={28} className='text-slate-200' />
                <p className='text-xs text-slate-400'>
                  {esAdmin
                    ? 'Aún no has recibido solicitudes'
                    : 'Contacta con un anuncio para iniciar una conversación'
                  }
                </p>
              </div>
            )}

            {/* Solicitudes pendientes (admin) */}
            {esAdmin && pendientes.length > 0 && (
              <div>
                <p className='px-5 pt-4 pb-1 font-mono text-[0.625rem] font-bold uppercase tracking-widest text-slate-400'>
                  Pendientes
                </p>
                {pendientes.map(s => (
                  <ConvRow
                    key={s.id}
                    foto={s.foto_perfil}
                    nombre={s.nombre}
                    subtitulo={s.email}
                    ultimoEn={s.fecha_envio}
                    activa={seleccion?.id === s.id}
                    isPendiente
                    onClick={() => seleccionar({ tipo: 'solicitud', id: s.id })}
                  />
                ))}
              </div>
            )}

            {/* Chats activos */}
            {chats.length > 0 && (
              <div>
                {esAdmin && pendientes.length > 0 && (
                  <p className='px-5 pt-4 pb-1 font-mono text-[0.625rem] font-bold uppercase tracking-widest text-slate-400'>
                    Mensajes
                  </p>
                )}
                {chats.map(c => {
                  const nombre = esAdmin ? c.nombre_solicitante : c.nombre_grupo
                  const foto   = esAdmin ? c.foto_solicitante   : c.foto_grupo
                  return (
                    <ConvRow
                      key={c.id}
                      foto={foto}
                      nombre={nombre}
                      ultimoMensaje={c.ultimo_mensaje}
                      ultimoEn={c.ultimo_mensaje_en}
                      activa={seleccion?.id === c.id}
                      onClick={() => seleccionar({ tipo: 'chat', id: c.id })}
                    />
                  )
                })}
              </div>
            )}

            {/* Solicitudes pendientes del solicitante */}
            {!esAdmin && pendientes.length > 0 && (
              <div>
                <p className='px-5 pt-4 pb-1 font-mono text-[0.625rem] font-bold uppercase tracking-widest text-slate-400'>
                  Solicitudes
                </p>
                {pendientes.map(s => (
                  <ConvRow
                    key={s.id}
                    foto={null}
                    nombre={s.nombre_grupo ?? 'Grupo'}
                    ultimoEn={s.fecha_envio}
                    activa={false}
                    isPendiente
                    onClick={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho */}
        <div className={`flex flex-col overflow-hidden ${mostrandoConversacion ? 'flex' : 'hidden sm:flex'}`}>
          {!seleccion && (
            <div className='flex flex-col items-center justify-center h-full gap-3 text-center px-8 bg-slate-50'>
              <div className='w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm'>
                <MessageCircle size={22} className='text-slate-300' />
              </div>
              <p className='text-sm font-semibold text-slate-600'>Selecciona una conversación</p>
              <p className='text-xs text-slate-400'>Elige un chat de la lista para ver los mensajes</p>
            </div>
          )}

          {seleccion?.tipo === 'solicitud' && solicitudActiva && (
            <div className='flex flex-col h-full overflow-hidden'>
              <div className='sm:hidden flex items-center gap-2 px-5 py-3 border-b border-slate-100 shrink-0'>
                <button type='button' onClick={() => setMostrandoConversacion(false)} className='cursor-pointer! w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 transition'>
                  <ArrowLeft size={18} />
                </button>
                <span className='text-sm font-semibold text-slate-700'>Solicitud</span>
              </div>
              <div className='flex-1 overflow-hidden'>
                <DetalleSolicitud solicitud={solicitudActiva} onAccion={handleAccionSolicitud} />
              </div>
            </div>
          )}

          {seleccion?.tipo === 'chat' && chatActivo && (
            <Conversacion
              chatId={chatActivo.id}
              user={user}
              nombreOtro={otroNombre}
              fotoOtro={otraFoto}
              subtituloOtro={otroSubtitulo}
              idOtro={otroId}
              esAdmin={esAdmin}
              onCerrar={handleCerrarChat}
              onVolver={() => setMostrandoConversacion(false)}
            />
          )}
        </div>

      </div>
    </div>
  )
}
