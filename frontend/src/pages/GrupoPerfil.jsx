import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Pencil, Link, Check, LogOut, AlertCircle, TriangleAlert } from 'lucide-react'
import { CARD_SHADOW, TARJETAS_CONVIVENCIA_GRUPO, PASTEL, labelsGrupo, calcEdad } from '../lib/convivencia.js'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../lib/apiFetch'
import { useModalAccesible } from '../lib/useModalAccesible.js'

// ── Componente principal ───────────────────────────────────────────

function TraitCard({ cfg, valor }) {
  const frase = labelsGrupo[cfg.campo]?.[valor]
  return (
    <div className='bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-2'
      style={{ ...CARD_SHADOW, borderTop: `3px solid ${cfg.color}` }}>
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

function GrupoPerfil() {
  const navigate = useNavigate()
  const { grupo, miembros, setMiembros, user } = useOutletContext()
  const { setTieneGrupo } = useAuth()

  const [convivencia, setConvivencia] = useState(null)
  const [intereses,   setIntereses]   = useState([])
  const [publicacion, setPublicacion] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [copiadoTipo, setCopiadoTipo] = useState(null) // 'miembro' | 'casero' | null

  const [mostrarModalSalir,      setMostrarModalSalir]      = useState(false)
  const [mostrarModalTransferir, setMostrarModalTransferir] = useState(false)
  const [nuevoAdminId,           setNuevoAdminId]           = useState('')
  const [saliendo,               setSaliendo]               = useState(false)
  const [errorSalir,             setErrorSalir]             = useState('')

  const [miembroAEliminar, setMiembroAEliminar] = useState(null)
  const [eliminandoMiembro, setEliminandoMiembro] = useState(false)
  const [errorEliminarMiembro, setErrorEliminarMiembro] = useState('')

  // Diálogos modales accesibles: cada uno atrapa el foco mientras está abierto,
  // se cierra con Escape y devuelve el foco al botón que lo abrió.
  const refModalSalir       = useModalAccesible(() => setMostrarModalSalir(false), mostrarModalSalir)
  const refModalTransferir  = useModalAccesible(() => setMostrarModalTransferir(false), mostrarModalTransferir)
  const refModalEliminar    = useModalAccesible(
    () => { setMiembroAEliminar(null); setErrorEliminarMiembro('') },
    !!miembroAEliminar,
  )

  useEffect(() => {
    Promise.allSettled([
      apiFetch('/api/grupos/convivencia').then(r => r.json()),
      apiFetch('/api/grupos/mis-intereses').then(r => r.json()),
      apiFetch('/api/grupos/publicacion').then(r => r.json()),
    ]).then(([convRes, interesesRes, pubRes]) => {
      if (convRes.status      === 'fulfilled') setConvivencia(convRes.value.perfil ?? null)
      if (interesesRes.status === 'fulfilled') setIntereses(interesesRes.value.intereses ?? [])
      if (pubRes.status       === 'fulfilled') setPublicacion(pubRes.value.publicacion ?? null)
    }).finally(() => setLoading(false))
  }, [])

  const miembroActual = miembros.find(m => m.id === user?.id)
  const esAdmin   = miembroActual?.rol_en_grupo === 'ADMIN'
  const esCasero  = miembroActual?.rol_en_grupo === 'CASERO'
  const miembrosParaTransferir = miembros.filter(m => m.rol_en_grupo !== 'CASERO' && m.id !== user?.id)

  const handleSalirClick = () => {
    setErrorSalir('')
    setNuevoAdminId('')
    if (esAdmin && miembrosParaTransferir.length > 0) {
      setMostrarModalTransferir(true)
    } else {
      setMostrarModalSalir(true)
    }
  }

  const salirDelGrupo = async () => {
    setSaliendo(true)
    setErrorSalir('')
    try {
      const res = await apiFetch('/api/grupos/salir', {
        method: 'DELETE',
        body: JSON.stringify({ grupo_id: grupo.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        setErrorSalir(data.message ?? 'Error al salir del grupo')
        return
      }
      // Sin esto, `tieneGrupo` se queda en true hasta recargar la página y el
      // acceso "Mi grupo" sigue apareciendo en la navegación de perfil.
      setTieneGrupo(false)
      navigate('/')
    } catch {
      setErrorSalir('Error de conexión')
    } finally {
      setSaliendo(false)
    }
  }

  const handleTransferirYSalir = async () => {
    if (!nuevoAdminId) return
    setSaliendo(true)
    setErrorSalir('')
    try {
      const res = await apiFetch('/api/grupos/transferir-admin', {
        method: 'POST',
        body: JSON.stringify({ nuevo_admin_id: nuevoAdminId }),
      })
      if (!res.ok) {
        const data = await res.json()
        setErrorSalir(data.message ?? 'Error al transferir el rol')
        setSaliendo(false)
        return
      }
      await salirDelGrupo()
    } catch {
      setErrorSalir('Error de conexión')
      setSaliendo(false)
    }
  }

  const handleEliminarMiembro = async () => {
    if (!miembroAEliminar) return
    setEliminandoMiembro(true)
    setErrorEliminarMiembro('')
    try {
      const res = await apiFetch(`/api/grupos/miembros/${miembroAEliminar.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setErrorEliminarMiembro(data.message ?? 'Error al eliminar al miembro')
        return
      }
      setMiembros?.(prev => prev.filter(m => m.id !== miembroAEliminar.id))
      setMiembroAEliminar(null)
    } catch {
      setErrorEliminarMiembro('Error de conexión')
    } finally {
      setEliminandoMiembro(false)
    }
  }

  const copiarCodigo = (tipo) => {
    const codigo = tipo === 'casero' ? grupo?.codigo_casero : grupo?.codigo_acceso
    navigator.clipboard.writeText(codigo ?? '')
    setCopiadoTipo(tipo)
    setTimeout(() => setCopiadoTipo(null), 2000)
  }

  const miembroMasAntiguo = miembros.length > 0
    ? miembros.reduce((a, b) => new Date(a.fecha_union) < new Date(b.fecha_union) ? a : b)
    : null
  const anioDesde = miembroMasAntiguo?.fecha_union
    ? new Date(miembroMasAntiguo.fecha_union).getFullYear()
    : null

  if (loading) return (
    <div className='flex justify-center py-16'>
      <div role='status' aria-label='Cargando' className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
    </div>
  )

  const botonesAccion = (
    <>
      <button
        onClick={() => copiarCodigo('miembro')}
        className='cursor-pointer! w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-white text-slate-900 border border-slate-200 hover:border-slate-300 text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
      >
        {copiadoTipo === 'miembro' ? <Check aria-hidden='true' size={14} className='text-emerald-500' /> : <Link aria-hidden='true' size={14} />}
        {copiadoTipo === 'miembro' ? '¡Copiado!' : 'Invitar miembro'}
      </button>
      {esAdmin && (
        <button
          onClick={() => copiarCodigo('casero')}
          className='cursor-pointer! w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-white text-slate-900 border border-slate-200 hover:border-slate-300 text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
        >
          {copiadoTipo === 'casero' ? <Check aria-hidden='true' size={14} className='text-emerald-500' /> : <Link aria-hidden='true' size={14} />}
          {copiadoTipo === 'casero' ? '¡Copiado!' : 'Código casero'}
        </button>
      )}
      {esAdmin && (
        <button
          onClick={() => navigate('/grupo/perfil/editar')}
          className='cursor-pointer! w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
        >
          <Pencil aria-hidden='true' size={14} /> Editar grupo
        </button>
      )}
      {!esCasero && (
        <button
          onClick={handleSalirClick}
          className='cursor-pointer! w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
        >
          <LogOut aria-hidden='true' size={14} /> Salir del grupo
        </button>
      )}
    </>
  )

  return (
    <div className='max-w-7xl mx-auto flex flex-col gap-5 '>

      {/* ── Header ── */}
      <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between'>
        <h1 className='font-display text-3xl sm:text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>Mi grupo</h1>
        {/* Botones de acción — solo escritorio; en móvil se muestran al final de la página */}
        <div className='hidden sm:flex items-center flex-wrap gap-2'>
          {botonesAccion}
        </div>
      </div>

      {/* ── Modal: confirmar salida ── */}
      {mostrarModalSalir && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
          <div ref={refModalSalir} role='dialog' aria-modal='true' aria-label='¿Salir del grupo?' tabIndex={-1}
            className='bg-white rounded-3xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5 shadow-2xl'>
            <div className='flex flex-col gap-1.5'>
              <h2 className='font-display text-[1.375rem] font-semibold text-slate-900'>¿Salir del grupo?</h2>
              <p className='text-[0.875rem] text-slate-500 leading-relaxed'>
                {esAdmin
                  ? 'Eres el único miembro. Al salir, el grupo quedará sin administrador.'
                  : 'Dejarás de tener acceso al grupo y a todas sus funcionalidades.'}
              </p>
            </div>
            {errorSalir && (
              <div role='alert' className='flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3'>
                <AlertCircle aria-hidden='true' size={16} className='text-red-500 shrink-0' />
                <p className='text-[0.8125rem] font-medium text-red-700'>{errorSalir}</p>
              </div>
            )}
            <div className='flex gap-3'>
              <button
                onClick={() => { setMostrarModalSalir(false); setErrorSalir('') }}
                disabled={saliendo}
                className='cursor-pointer! flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[0.875rem] font-semibold py-3 rounded-full transition disabled:opacity-50'
              >
                Cancelar
              </button>
              <button
                onClick={salirDelGrupo}
                disabled={saliendo}
                className='cursor-pointer! flex-1 bg-red-600 hover:bg-red-700 text-white text-[0.875rem] font-semibold py-3 rounded-full transition disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {saliendo
                  ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  : 'Salir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: transferir admin antes de salir ── */}
      {mostrarModalTransferir && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
          <div ref={refModalTransferir} role='dialog' aria-modal='true' aria-label='Transferir administración' tabIndex={-1}
            className='bg-white rounded-3xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5 shadow-2xl'>
            <div className='flex flex-col gap-1.5'>
              <h2 className='font-display text-[1.375rem] font-semibold text-slate-900'>Transferir administración</h2>
              <p className='text-[0.875rem] text-slate-500 leading-relaxed'>
                Antes de salir debes elegir quién será el nuevo administrador del grupo.
              </p>
            </div>
            <div className='flex flex-col gap-2'>
              {miembrosParaTransferir.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setNuevoAdminId(m.id)}
                  className={`cursor-pointer! flex items-center gap-3 w-full rounded-2xl px-4 py-3 border transition ${
                    nuevoAdminId === m.id
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {m.foto_perfil
                    ? <img src={m.foto_perfil} alt={m.username} className='w-9 h-9 rounded-full object-cover shrink-0' />
                    : <div className='w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0'>
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
                          <circle cx='12' cy='8' r='4' stroke='#94a3b8' strokeWidth='2' strokeLinecap='round' />
                          <path d='M4 20c0-4 3.6-7 8-7s8 3 8 7' stroke='#94a3b8' strokeWidth='2' strokeLinecap='round' />
                        </svg>
                      </div>
                  }
                  <span className='font-display text-[0.9375rem] font-semibold text-slate-800 flex-1 text-left truncate'>{m.username}</span>
                  {nuevoAdminId === m.id && <Check aria-hidden='true' size={16} className='text-emerald-600 shrink-0' />}
                </button>
              ))}
            </div>
            {errorSalir && (
              <div role='alert' className='flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3'>
                <AlertCircle aria-hidden='true' size={16} className='text-red-500 shrink-0' />
                <p className='text-[0.8125rem] font-medium text-red-700'>{errorSalir}</p>
              </div>
            )}
            <div className='flex gap-3'>
              <button
                onClick={() => { setMostrarModalTransferir(false); setErrorSalir('') }}
                disabled={saliendo}
                className='cursor-pointer! flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[0.875rem] font-semibold py-3 rounded-full transition disabled:opacity-50'
              >
                Cancelar
              </button>
              <button
                onClick={handleTransferirYSalir}
                disabled={saliendo || !nuevoAdminId}
                className='cursor-pointer! flex-1 bg-red-600 hover:bg-red-700 text-white text-[0.875rem] font-semibold py-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {saliendo
                  ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  : 'Transferir y salir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {miembroAEliminar && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm' onClick={() => { setMiembroAEliminar(null); setErrorEliminarMiembro('') }}>
          <div ref={refModalEliminar} role='dialog' aria-modal='true' aria-label='Eliminar miembro del grupo' tabIndex={-1}
            className='bg-white rounded-3xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5 shadow-2xl' onClick={e => e.stopPropagation()}>
            <div className='flex flex-col gap-1.5'>
              <h2 className='font-display text-[1.375rem] font-semibold text-slate-900'>¿Eliminar a {miembroAEliminar.username} del grupo?</h2>
              <p className='text-[0.875rem] text-slate-500 leading-relaxed'>
                Esta acción eliminará al miembro del grupo de convivencia.
              </p>
            </div>

            {miembroAEliminar.rol_en_grupo === 'CASERO' && (
              <div className='flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3'>
                <TriangleAlert aria-hidden='true' size={16} className='text-amber-500 shrink-0 mt-0.5' />
                <p className='text-[0.8125rem] text-amber-700 leading-relaxed'>
                  Es el casero del grupo. Las facturas existentes se conservarán, pero nadie
                  podrá registrar nuevas ni actualizar los pagos hasta que otro casero se
                  vincule con el código.
                </p>
              </div>
            )}

            {errorEliminarMiembro && (
              <div role='alert' className='flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3'>
                <AlertCircle aria-hidden='true' size={16} className='text-red-500 shrink-0' />
                <p className='text-[0.8125rem] font-medium text-red-700'>{errorEliminarMiembro}</p>
              </div>
            )}
            <div className='flex gap-3'>
              <button
                onClick={() => { setMiembroAEliminar(null); setErrorEliminarMiembro('') }}
                disabled={eliminandoMiembro}
                className='cursor-pointer! flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[0.875rem] font-semibold py-3 rounded-full transition disabled:opacity-50'
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarMiembro}
                disabled={eliminandoMiembro}
                className='cursor-pointer! flex-1 bg-red-600 hover:bg-red-700 text-white text-[0.875rem] font-semibold py-3 rounded-full transition disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {eliminandoMiembro
                  ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero card ── */}
      <div
        className='bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 grid grid-cols-1 sm:grid-cols-2'
        style={CARD_SHADOW}
      >
        {/* Columna izq: identidad del grupo */}
        <div className='flex flex-col justify-center gap-4 sm:pr-8 sm:border-r border-dashed border-slate-200 min-w-0'>
          <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Grupo de convivencia</p>
          <h2 className='font-display text-[2rem] sm:text-[3rem] font-bold text-slate-900 leading-none -tracking-[0.02em] break-words'>
            {grupo?.nombre ?? '—'}
          </h2>
          <div className='flex flex-wrap gap-2'>
            {grupo?.ciudad && (
              <span className='inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-[0.8125rem] font-medium px-3.5 py-[7px] rounded-full'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0' />
                {grupo.ciudad}
              </span>
            )}
            {anioDesde && (
              <span className='inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-[0.8125rem] font-medium px-3.5 py-[7px] rounded-full'>
                <span className='w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0' />
                Conviviendo desde {anioDesde}
              </span>
            )}
            {grupo?.buscar_companero && (
              <span className='inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[0.8125rem] font-medium px-3.5 py-[7px] rounded-full'>
                <span className='w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0' />
                Buscando compañero
              </span>
            )}
          </div>
          {grupo?.descripcion
            ? <p className='font-display text-[1.0625rem] font-normal text-slate-700 leading-[1.6] bg-slate-50 rounded-2xl px-4 py-4 break-words'>
                {grupo.descripcion}
              </p>
            : <p className='font-display text-[1.0625rem] font-normal text-slate-500 italic leading-[1.4]'>
                Sin descripción todavía.
              </p>
          }
        </div>

        {/* Columna der: miembros */}
        <div className='flex flex-col gap-4 pt-6 sm:pt-0 sm:pl-8'>
          <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Miembros</p>
          <div className='flex flex-col divide-y divide-dashed divide-slate-200'>
            {[...miembros].sort((a, b) => (a.rol_en_grupo === 'CASERO' ? 1 : 0) - (b.rol_en_grupo === 'CASERO' ? 1 : 0)).map((m, i) => {
              const edad  = calcEdad(m.fecha_nacimiento)
              const desde = m.fecha_union ? new Date(m.fecha_union).getFullYear() : null
              const pastel = PASTEL[i % PASTEL.length]
              return (
                <div key={m.id} className='group flex items-center gap-3 py-3'>
                  {m.foto_perfil
                    ? <img src={m.foto_perfil} alt={m.username} className='w-11 h-11 rounded-full object-cover shrink-0' />
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
                    {m.rol_en_grupo === 'CASERO' ? (
                      <p className='font-display text-[1.0625rem] font-semibold text-slate-800 leading-tight truncate'>{m.username}</p>
                    ) : (
                      <button
                        type='button'
                        onClick={() => navigate(m.id === user?.id ? '/perfil/usuario' : `/usuario/${m.id}`)}
                        className='cursor-pointer! font-display text-[1.0625rem] font-semibold text-slate-800 hover:text-emerald-600 transition leading-tight truncate text-left block w-full'
                      >
                        {m.username}
                      </button>
                    )}
                    <p className='font-mono text-[0.7rem] text-slate-500 mt-0.5'>
                      {[edad != null ? `${edad} años` : null, desde ? `desde ${desde}` : null].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {esAdmin && m.id !== user?.id && (
                    <button
                      type='button'
                      onClick={() => setMiembroAEliminar(m)}
                      className='cursor-pointer! shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-[0.75rem] font-semibold text-red-600 hover:text-red-700'
                    >
                      Eliminar del grupo
                    </button>
                  )}
                  <div className='shrink-0'>
                    {m.rol_en_grupo === 'CASERO'
                      ? <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-amber-500'>Casero</span>
                      : <span className='font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-teal-500'>Residente</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Datos del piso + Intereses ── */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>

        {/* Datos del piso */}
        <div className='bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 flex flex-col gap-4' style={CARD_SHADOW}>
          <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Datos del piso</p>
          <div className='flex flex-col'>
            {[
              {
                label: 'Ubicación',
                value: grupo?.ciudad ?? '—',
              },
              {
                label: 'Miembros',
                value: (() => { const n = miembros.filter(m => m.rol_en_grupo !== 'CASERO').length; return `${n} ${n === 1 ? 'persona' : 'personas'}` })(),
              },
              {
                label: 'Buscando',
                value: grupo?.buscar_companero ? 'Buscamos compañera/o de piso' : 'No buscamos',
                valueColor: grupo?.buscar_companero ? 'text-emerald-600' : undefined,
              },
              {
                label: 'Conviven',
                value: 'Desde  ' + (anioDesde ? `${anioDesde}` : '—'),
              },
              {
                label: 'Visibilidad',
                value: publicacion
                  ? (publicacion.visible ? 'Publicación activa' : 'Publicación oculta')
                  : 'Sin publicación',
                chip: publicacion?.visible,
              },
            ].map(({ label, value, valueColor, chip }, i, arr) => (
              <div
                key={label}
                className={`flex justify-between items-center py-[0.875rem] ${i < arr.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}
              >
                <span className='font-mono text-[0.6875rem] font-semibold text-slate-500 uppercase tracking-[0.10em]'>{label}</span>
                {chip
                  ? <span className='inline-flex items-center gap-2 text-[0.9375rem] font-medium text-emerald-600'>
                      <span className='w-2 h-2 rounded-full bg-emerald-500 shrink-0' />
                      {value}
                    </span>
                  : <span className={`text-right truncate max-w-[58%] text-[0.9375rem] font-medium ${valueColor ?? 'text-slate-700'}`}>{value}</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Intereses */}
        <div className='bg-slate-900 text-slate-200 rounded-3xl p-5 sm:p-7 flex flex-col gap-5 min-w-0 overflow-hidden' style={CARD_SHADOW}>

          {/* Estilo de vida */}
          {convivencia && (convivencia.ocupacion || convivencia.acepta_fumadores || convivencia.acepta_mascotas || convivencia.lgbtq_friendly === true) && (
            <div className='flex flex-col gap-2'>
              <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-300'>Estilo de vida</p>
              <div className='flex flex-wrap gap-2'>
                {convivencia.ocupacion === 'ESTUDIO'           && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Estudiantes</span>}
                {convivencia.ocupacion === 'TRABAJO'           && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Trabajadores</span>}
                {convivencia.ocupacion === 'ESTUDIO_Y_TRABAJO' && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Estudiamos y trabajamos</span>}
                {convivencia.acepta_fumadores === 'SI'          && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Se puede fumar</span>}
                {convivencia.acepta_fumadores === 'NO'          && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>No se fuma</span>}
                {convivencia.acepta_fumadores === 'INDIFERENTE' && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Indiferente al tabaco</span>}
                {convivencia.acepta_mascotas  === 'SI'          && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Mascotas bienvenidas</span>}
                {convivencia.acepta_mascotas  === 'NO'          && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Sin mascotas</span>}
                {convivencia.acepta_mascotas  === 'DEPENDE'     && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>Mascotas: depende</span>}
                {convivencia.lgbtq_friendly   === true          && <span className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>LGBTQ+ friendly</span>}
              </div>
            </div>
          )}

          {/* Intereses del grupo */}
          <div className='flex flex-col gap-2'>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-300'>Intereses del grupo</p>
            {intereses.length === 0 ? (
              <div className='flex flex-col gap-2'>
                <p className='text-[0.8125rem] font-medium text-slate-300'>Sin intereses todavía.</p>
                {esAdmin && (
                  <button
                    onClick={() => navigate('/grupo/perfil/editar')}
                    className='cursor-pointer! text-[0.8125rem] font-semibold text-emerald-400 hover:text-emerald-300 transition text-left'
                  >
                    Añadir intereses →
                  </button>
                )}
              </div>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {intereses.map(({ id, nombre }) => (
                  <span key={id} className='border border-slate-600 text-slate-200 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>
                    {nombre}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ── Perfil de convivencia ── */}
      <div className='bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 flex flex-col gap-6' style={CARD_SHADOW}>
        <div className='flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between'>
          <div>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-1.5'>Convivencia</p>
            <h3 className='font-display text-2xl sm:text-[2rem] font-normal text-slate-900 leading-none'>¿Cómo se vive aquí?</h3>
          </div>
          {esAdmin && !convivencia && (
            <button
              onClick={() => navigate('/grupo/perfil/editar')}
              className='cursor-pointer! inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
            >
              Rellenar perfil
            </button>
          )}
        </div>

        {!convivencia ? (
          <div className='bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3'>
            <p className='text-sm font-semibold text-orange-800'>Perfil de convivencia del grupo sin rellenar</p>
            <p className='text-xs text-orange-600 leading-relaxed mt-0.5'>
              El administrador puede añadir las preferencias de convivencia del piso.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4'>
            {TARJETAS_CONVIVENCIA_GRUPO.map(cfg => (
              <TraitCard key={cfg.campo} cfg={cfg} valor={convivencia[cfg.campo]} />
            ))}
          </div>
        )}
      </div>

      {/* Botones de acción — solo móvil, al final de la página */}
      <div className='sm:hidden bg-white border border-slate-100 rounded-3xl p-4 grid grid-cols-2 gap-2' style={CARD_SHADOW}>
        {botonesAccion}
      </div>

    </div>
  )
}

export default GrupoPerfil
