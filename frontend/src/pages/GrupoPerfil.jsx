import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Pencil, Link, Check, LogOut, AlertCircle } from 'lucide-react'
import DonutChart from '../components/DonutChart.jsx'
import { CARD_SHADOW, DONUTS_CONFIG_GRUPO, PASTEL, calcEdad } from '../lib/convivencia.js'

// ── Componente principal ───────────────────────────────────────────

function GrupoPerfil() {
  const navigate = useNavigate()
  const { grupo, miembros, user } = useOutletContext()

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

  useEffect(() => {
    Promise.allSettled([
      fetch('http://localhost:3000/api/grupos/convivencia',   { credentials: 'include' }).then(r => r.json()),
      fetch('http://localhost:3000/api/grupos/mis-intereses', { credentials: 'include' }).then(r => r.json()),
      fetch('http://localhost:3000/api/grupos/publicacion',   { credentials: 'include' }).then(r => r.json()),
    ]).then(([convRes, interesesRes, pubRes]) => {
      if (convRes.status      === 'fulfilled') setConvivencia(convRes.value.perfil ?? null)
      if (interesesRes.status === 'fulfilled') setIntereses(interesesRes.value.intereses ?? [])
      if (pubRes.status       === 'fulfilled') setPublicacion(pubRes.value.publicacion ?? null)
    }).finally(() => setLoading(false))
  }, [])

  const miembroActual = miembros.find(m => m.id === user?.id)
  const esAdmin   = miembroActual?.rol_en_grupo === 'ADMIN'
  const esCasero  = miembroActual?.es_casero === true
  const miembrosParaTransferir = miembros.filter(m => !m.es_casero && m.id !== user?.id)

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
      const res = await fetch('http://localhost:3000/api/grupos/salir', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupo_id: grupo.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        setErrorSalir(data.message ?? 'Error al salir del grupo')
        return
      }
      navigate('/acceso-grupo')
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
      const res = await fetch('http://localhost:3000/api/grupos/transferir-admin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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
      <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
    </div>
  )

  return (
    <div className='max-w-7xl mx-auto flex flex-col gap-5 '>

      {/* ── Header ── */}
      <div className='flex items-center justify-between'>
        <h1 className='font-display text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>Mi grupo</h1>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => copiarCodigo('miembro')}
            className='cursor-pointer! inline-flex items-center gap-1.5 bg-slate-100 hover:bg-white text-slate-900 border border-slate-200 hover:border-slate-300 text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
          >
            {copiadoTipo === 'miembro' ? <Check size={14} className='text-emerald-500' /> : <Link size={14} />}
            {copiadoTipo === 'miembro' ? '¡Copiado!' : 'Invitar miembro'}
          </button>
          {esAdmin && (
            <button
              onClick={() => copiarCodigo('casero')}
              className='cursor-pointer! inline-flex items-center gap-1.5 bg-slate-100 hover:bg-white text-slate-900 border border-slate-200 hover:border-slate-300 text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
            >
              {copiadoTipo === 'casero' ? <Check size={14} className='text-emerald-500' /> : <Link size={14} />}
              {copiadoTipo === 'casero' ? '¡Copiado!' : 'Código casero'}
            </button>
          )}
          {esAdmin && (
            <button
              onClick={() => navigate('/grupo/perfil/editar')}
              className='cursor-pointer! inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
            >
              <Pencil size={14} /> Editar grupo
            </button>
          )}
          {!esCasero && (
            <button
              onClick={handleSalirClick}
              className='cursor-pointer! inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 text-[0.75rem] font-semibold px-[1.125rem] py-3 rounded-full transition'
            >
              <LogOut size={14} /> Salir del grupo
            </button>
          )}
        </div>
      </div>

      {/* ── Modal: confirmar salida ── */}
      {mostrarModalSalir && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
          <div className='bg-white rounded-3xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5 shadow-2xl'>
            <div className='flex flex-col gap-1.5'>
              <h2 className='font-display text-[1.375rem] font-semibold text-slate-900'>¿Salir del grupo?</h2>
              <p className='text-[0.875rem] text-slate-500 leading-relaxed'>
                {esAdmin
                  ? 'Eres el único miembro. Al salir, el grupo quedará sin administrador.'
                  : 'Dejarás de tener acceso al grupo y a todas sus funcionalidades.'}
              </p>
            </div>
            {errorSalir && (
              <div className='flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3'>
                <AlertCircle size={16} className='text-red-500 shrink-0' />
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
          <div className='bg-white rounded-3xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5 shadow-2xl'>
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
                  {nuevoAdminId === m.id && <Check size={16} className='text-emerald-600 shrink-0' />}
                </button>
              ))}
            </div>
            {errorSalir && (
              <div className='flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3'>
                <AlertCircle size={16} className='text-red-500 shrink-0' />
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

      {/* ── Hero card ── */}
      <div
        className='bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 grid grid-cols-1 sm:grid-cols-2'
        style={CARD_SHADOW}
      >
        {/* Columna izq: miembros */}
        <div className='flex flex-col gap-4 sm:pr-8 sm:border-r border-dashed border-slate-200'>
          <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500'>Miembros</p>
          <div className='flex flex-col divide-y divide-dashed divide-slate-200'>
            {[...miembros].sort((a, b) => (a.es_casero === b.es_casero ? 0 : a.es_casero ? 1 : -1)).map((m, i) => {
              const edad  = calcEdad(m.fecha_nacimiento)
              const desde = m.fecha_union ? new Date(m.fecha_union).getFullYear() : null
              const pastel = PASTEL[i % PASTEL.length]
              return (
                <div key={m.id} className='flex items-center gap-3 py-3'>
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
                    {m.es_casero ? (
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
                    <p className='font-mono text-[0.7rem] text-slate-400 mt-0.5'>
                      {[edad != null ? `${edad} años` : null, desde ? `desde ${desde}` : null].filter(Boolean).join(' · ')}
                    </p>
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
            : <p className='font-display text-[1.0625rem] font-normal text-slate-400 italic leading-[1.4]'>
                Sin descripción todavía.
              </p>
          }
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
                value: (() => { const n = miembros.filter(m => !m.es_casero).length; return `${n} ${n === 1 ? 'persona' : 'personas'}` })(),
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
                <span className='font-mono text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-[0.10em]'>{label}</span>
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
        <div className='bg-slate-900 text-slate-200 rounded-3xl p-7 flex flex-col gap-4 min-w-0 overflow-hidden' style={CARD_SHADOW}>
          <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-400'>Intereses del grupo</p>
          {intereses.length === 0 ? (
            <div className='flex-1 flex flex-col justify-center gap-2'>
              <p className='text-[0.8125rem] font-medium text-slate-500'>Sin intereses todavía.</p>
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
                <span key={id} className='bg-slate-700 text-slate-100 rounded-full text-[0.8125rem] font-medium px-3 py-1.5'>
                  {nombre}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Perfil de convivencia ── */}
      <div className='bg-white border border-slate-100 rounded-3xl p-7 flex flex-col gap-6' style={CARD_SHADOW}>
        <div className='flex items-start justify-between'>
          <div>
            <p className='font-mono text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-1.5'>Convivencia</p>
            <h3 className='font-display text-[2rem] font-normal text-slate-900 leading-none'>¿Cómo se vive aquí?</h3>
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
  )
}

export default GrupoPerfil
