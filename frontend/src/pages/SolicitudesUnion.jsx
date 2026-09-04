import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { apiFetch } from '../lib/apiFetch'
import { UserPlus, UserCheck, UserX, AlertCircle } from 'lucide-react'
import { EstadoVacio } from '../components/EstadoVacio'

// ─── Avatar ───

function AvatarUsuario({ foto, nombre }) {
  if (foto) return <img src={foto} alt={nombre} className='w-14 h-14 rounded-full object-cover shrink-0' />
  return (
    <div className='w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0'>
      <span className='text-lg font-bold text-emerald-700'>{nombre?.[0]?.toUpperCase() ?? '?'}</span>
    </div>
  )
}

// ─── Card solicitud ───

// Aquí no se muestra la compatibilidad a propósito: para cuando llega una
// solicitud de unión, el administrador ya evaluó la afinidad en la solicitud de
// contacto (Chat.jsx), ya ha hablado con la persona y le ha dado él mismo el
// código de acceso. Esta pantalla es la confirmación final, no el punto de
// decisión, así que repetir el porcentaje solo añadiría ruido.
function CardSolicitud({ solicitud, procesando, onAceptar, onRechazar }) {
  const { usuario } = solicitud
  const enCurso = procesando != null

  return (
    <div className='bg-white border border-slate-100 rounded-[1.25rem] p-6 flex flex-col gap-5'>
      <div className='flex items-center gap-4'>
        <AvatarUsuario foto={usuario.foto_perfil} nombre={usuario.nombre} />
        <div className='min-w-0'>
          <p className='font-display text-lg font-semibold text-slate-900 truncate'>{usuario.nombre}</p>
          <p className='text-xs text-slate-500'>Quiere unirse al grupo</p>
        </div>
      </div>

      <div className='flex items-center gap-2 pt-1 border-t border-slate-100 mt-1'>
        <button
          onClick={() => onAceptar(solicitud.id)}
          disabled={enCurso}
          className='cursor-pointer! flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition'
        >
          {procesando === 'aceptar'
            ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
            : <UserCheck aria-hidden='true' size={15} />}
          Aceptar
        </button>
        <button
          onClick={() => onRechazar(solicitud.id)}
          disabled={enCurso}
          className='cursor-pointer! flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-50 text-red-600 text-sm font-semibold transition'
        >
          {procesando === 'rechazar'
            ? <div className='w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin' />
            : <UserX aria-hidden='true' size={15} />}
          Rechazar
        </button>
      </div>
    </div>
  )
}

// ─── Página ───

function SolicitudesUnion() {
  const { miembros, user } = useOutletContext()
  const [solicitudes, setSolicitudes] = useState(null)
  const [error,       setError]       = useState('')
  const [procesando,  setProcesando]  = useState({}) // { [solicitudId]: 'aceptar' | 'rechazar' }

  const esAdmin = miembros.find(m => m.id === user?.id)?.rol_en_grupo === 'ADMIN'

  useEffect(() => {
    apiFetch('/api/grupos/solicitudes-union')
      .then(r => r.json())
      .then(d => setSolicitudes(d.solicitudes ?? []))
      .catch(() => { setSolicitudes([]); setError('No se pudieron cargar las solicitudes') })
  }, [])

  const resolver = async (id, accion) => {
    setProcesando(prev => ({ ...prev, [id]: accion }))
    try {
      const r = await apiFetch(`/api/grupos/solicitudes-union/${id}/${accion}`, { method: 'PUT' })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        setError(data.message ?? 'No se pudo procesar la solicitud')
        return
      }
      setSolicitudes(prev => (prev ?? []).filter(s => s.id !== id))
    } catch {
      setError('Error de conexión con el servidor')
    } finally {
      setProcesando(prev => {
        const { [id]: _quitado, ...resto } = prev
        return resto
      })
    }
  }

  const handleAceptar  = (id) => resolver(id, 'aceptar')
  const handleRechazar = (id) => resolver(id, 'rechazar')

  return (
    <div className='flex flex-col gap-6'>

      {/* Cabecera */}
      <div>
        <h1 className='font-display text-3xl sm:text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]'>Solicitudes de acceso</h1>
      </div>

      {error && (
        <div role='alert' className='flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
          <AlertCircle aria-hidden='true' size={15} className='shrink-0' /> {error}
        </div>
      )}

      {!esAdmin ? (
        <p className='text-sm text-slate-500'>Solo el administrador del grupo puede ver las solicitudes de acceso.</p>
      ) : solicitudes === null ? (
        <div className='flex items-center justify-center min-h-[40vh]'>
          <div role='status' aria-label='Cargando' className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
        </div>
      ) : solicitudes.length === 0 ? (
        <EstadoVacio
          icono={UserPlus}
          titulo='No hay solicitudes pendientes'
          descripcion='Cuando alguien intente unirse con el código de acceso del grupo, aparecerá aquí.'
        />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          {solicitudes.map(s => (
            <CardSolicitud
              key={s.id}
              solicitud={s}
              procesando={procesando[s.id] ?? null}
              onAceptar={handleAceptar}
              onRechazar={handleRechazar}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SolicitudesUnion
