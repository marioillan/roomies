import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, MessageCircle, Phone, Search } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'

// ─── Constantes y helpers ───
const AVATAR_COLORS = ['#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']

function tiempoRelativo(fechaStr) {
  if (!fechaStr) return null
  const dias = Math.floor((Date.now() - new Date(fechaStr).getTime()) / 86400000)
  if (dias === 0) return 'hoy'
  if (dias === 1) return 'hace 1 día'
  if (dias < 7)  return `hace ${dias} días`
  const semanas = Math.floor(dias / 7)
  if (semanas === 1) return 'hace 1 semana'
  if (semanas < 4)   return `hace ${semanas} semanas`
  const meses = Math.floor(dias / 30)
  return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`
}

function buildTags(pub) {
  const tags = []
  if (pub.amueblado)        tags.push('Amueblado')
  if (pub.wifi)             tags.push('Wifi')
  if (pub.parking)          tags.push('Parking')
  if (pub.permite_mascotas) tags.push('Mascotas')
  return tags
}

// ─── Tarjeta de favorito ───
function FavCard({ pub, onQuitar }) {
  const navigate  = useNavigate()
  const foto      = pub.fotos?.[0]
  const tags      = buildTags(pub)
  const guardado  = tiempoRelativo(pub.fecha_guardado)
  const inicial   = pub.nombre_grupo?.[0]?.toUpperCase() ?? '?'
  const color     = AVATAR_COLORS[(pub.nombre_grupo?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
  const modo      = pub.modo_contacto ?? 'CHAT'

  const [solicitud, setSolicitud] = useState(null)

  const contactar = async (e) => {
    e.stopPropagation()
    setSolicitud('enviando')
    try {
      const res = await apiFetch(`/api/chats/solicitar/${pub.id}`, { method: 'POST' })
      if (res.ok) { setSolicitud('enviada'); return }
      const data = await res.json()
      if (data.yaEnviada) navigate('/perfil/chat')
      else setSolicitud(null)
    } catch {
      setSolicitud(null)
    }
  }

  return (
    <div
      onClick={() => navigate(`/anuncio/${pub.id}`)}
      className='cursor-pointer bg-white border border-slate-100 rounded-[1.25rem] overflow-hidden flex flex-col sm:flex-row sm:h-56 transition-all duration-150 hover:-translate-y-px'
      style={{ boxShadow: '0 1px 0 rgba(15,23,42,.04), 0 0.5rem 2rem rgba(15,23,42,.06)' }}
    >
      {/* Foto */}
      <div className='w-full h-52 sm:w-56 sm:h-56 shrink-0 relative bg-slate-100 overflow-hidden'>
        {foto
          ? <img src={foto} alt={pub.titulo} className='w-full h-full object-cover' />
          : <div className='w-full h-full' style={{ background: 'repeating-linear-gradient(135deg,#f1f5f9 0 14px,#e2e8f0 14px 28px)' }} />
        }
        <button
          type='button'
          aria-label='Quitar de favoritos'
          onClick={e => { e.stopPropagation(); onQuitar(pub.id) }}
          className='cursor-pointer! absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-white'
          style={{ background: 'rgba(255,255,255,0.9)' }}
        >
          <Heart aria-hidden='true' size={15} className='text-pink-500 fill-pink-500' />
        </button>
      </div>

      {/* Cuerpo */}
      <div className='flex-1 min-w-0 flex flex-col px-4 sm:px-6 py-4 sm:py-5 overflow-hidden'>

        {/* Título + precio */}
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <h3 className='font-display text-[1.25rem] font-medium text-slate-900 leading-snug truncate'>{pub.titulo}</h3>
            <p className='flex items-center gap-1 mt-0.5 text-[0.8125rem] text-slate-900'>
              <MapPin aria-hidden='true' size={12} className='shrink-0 text-slate-900' />
              {pub.ciudad}
              {pub.tipo_piso && (
                <><span className='text-slate-900 mx-0.5'>·</span>{pub.tipo_piso.charAt(0) + pub.tipo_piso.slice(1).toLowerCase()}</>
              )}
            </p>
          </div>
          <div className='text-right shrink-0'>
            <span className='font-display text-[1.5rem] font-medium text-slate-900 leading-none'>{Number(pub.precio).toFixed(0)}</span>
            <span className='font-mono text-[0.6875rem] text-slate-900 ml-0.5'>/mes</span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5 mt-3'>
            {tags.map(tag => (
              <span key={tag} className='bg-slate-100 text-slate-600 text-[0.6875rem] font-medium px-2.5 py-1 rounded-full'>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Compatibilidad + Intereses comunes */}
        {(pub.compatibilidad != null || pub.intereses_comunes?.length > 0) && (
          <div className='flex flex-col gap-1.5 mt-3'>
            {pub.compatibilidad != null && (
              <div className='flex items-center gap-1.5'>
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  pub.compatibilidad >= 70 ? 'bg-emerald-500' :
                  pub.compatibilidad >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                }`} />
                <span className={`font-mono text-[0.6875rem] font-semibold ${
                  pub.compatibilidad >= 70 ? 'text-emerald-600' :
                  pub.compatibilidad >= 40 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {pub.compatibilidad}% de compatibilidad
                </span>
              </div>
            )}
            {pub.intereses_comunes?.length > 0 && (
              <div className='flex items-center gap-1.5 flex-wrap'>
                <span className='font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-600 shrink-0'>
                  En común:
                </span>
                {pub.intereses_comunes.map(nombre => (
                  <span key={nombre} className='inline-flex items-center gap-1 bg-emerald-200 text-emerald-900 text-[0.6875rem] font-medium px-2 py-0.5 rounded-full'>
                    <span className='w-1 h-1 rounded-full bg-emerald-400 shrink-0' />
                    {nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className='flex items-center justify-between mt-auto pt-4'>
          {/* Avatar + nombre + guardado */}
          <div className='flex items-center gap-2 min-w-0'>
            {pub.foto_grupo
              ? <img src={pub.foto_grupo} alt={pub.nombre_grupo} className='w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200' />
              : <div className='w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-semibold' style={{ backgroundColor: color }}>
                  {inicial}
                </div>
            }
            <div className='min-w-0'>
              <p className='text-[0.8125rem] font-semibold text-slate-700 truncate'>{pub.nombre_grupo}</p>
              {guardado && (
                <p className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-slate-500 leading-none mt-0.5'>
                  Guardado {guardado}
                </p>
              )}
            </div>
          </div>

          {/* Botones contacto */}
          <div className='flex items-center gap-2 shrink-0' onClick={e => e.stopPropagation()}>
            {solicitud === 'enviada' ? (
              <span className='flex items-center gap-1.5 text-[0.8125rem] font-semibold text-emerald-600 px-1'>
                <MessageCircle aria-hidden='true' size={14} />
                Enviado
              </span>
            ) : (
              <>
                {(modo === 'CHAT' || modo === 'AMBOS') && (
                  <button
                    type='button'
                    onClick={contactar}
                    disabled={solicitud === 'enviando'}
                    className='cursor-pointer! bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-[0.8125rem] rounded-full px-4 py-2.5 inline-flex items-center gap-1.5 transition'
                  >
                    {solicitud === 'enviando'
                      ? <span className='w-3 h-3 border border-white border-t-transparent rounded-full animate-spin' />
                      : <MessageCircle aria-hidden='true' size={14} />
                    }
                    Mensaje
                  </button>
                )}
                {(modo === 'TELEFONO' || modo === 'AMBOS') && pub.telefono_contacto && (
                  <a
                    href={`tel:${pub.telefono_contacto}`}
                    onClick={e => e.stopPropagation()}
                    aria-label='Llamar'
                    className={`cursor-pointer! bg-slate-100 hover:bg-white border border-slate-200 text-slate-900 font-semibold text-[0.8125rem] rounded-full inline-flex items-center justify-center transition ${
                      modo === 'AMBOS' ? 'w-10 h-10' : 'px-4 py-2.5 gap-1.5'
                    }`}
                  >
                    <Phone aria-hidden='true' size={14} />
                    {modo !== 'AMBOS' && 'Llamar'}
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Ordenación ───
const ORDEN_CHIPS = [
  { value: 'recientes',   label: 'Todos' },
  { value: 'precio_asc',  label: 'Más baratos' },
  { value: 'precio_desc', label: 'Más caros' },
]

function ordenar(lista, criterio) {
  const copia = [...lista]
  if (criterio === 'precio_asc')  return copia.sort((a, b) => a.precio - b.precio)
  if (criterio === 'precio_desc') return copia.sort((a, b) => b.precio - a.precio)
  return copia
}

// ─── Página ───
export default function Favoritos() {
  const navigate = useNavigate()
  const [publicaciones, setPublicaciones] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [orden, setOrden]                 = useState('recientes')

  useEffect(() => {
    apiFetch('/api/favoritos/publicaciones')
      .then(r => r.json())
      .then(d => { setPublicaciones(d.publicaciones ?? []); setLoading(false) })
      .catch(() => { setError('Error al cargar favoritos'); setLoading(false) })
  }, [])

  const quitarFavorito = async (publicacionId) => {
    await apiFetch(`/api/favoritos/${publicacionId}`, { method: 'POST' })
    setPublicaciones(prev => prev.filter(p => p.id !== publicacionId))
  }

  const lista = ordenar(publicaciones, orden)

  if (loading) return (
    <div className='flex justify-center py-24'>
      <div role='status' aria-label='Cargando' className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
    </div>
  )

  if (error) return (
    <div className='text-center py-12 text-sm text-red-500'>{error}</div>
  )

  return (
    <div className='flex flex-col gap-6'>

      {/* Cabecera */}
      <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between'>
        <div>
          <h1 className='font-display text-3xl sm:text-[2.25rem] font-medium -tracking-[0.02em] text-slate-900 leading-none'>
            Tus favoritos
          </h1>
        </div>

        {publicaciones.length > 0 && (
          <div className='flex items-center gap-1.5 shrink-0'>
            {ORDEN_CHIPS.map(chip => (
              <button
                key={chip.value}
                type='button'
                onClick={() => setOrden(chip.value)}
                className={`cursor-pointer! px-3 py-1.5 text-xs font-semibold rounded-[0.625rem] transition ${
                  orden === chip.value
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Estado vacío */}
      {publicaciones.length === 0 && (
        <div className='flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center'>
          <div className='w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center'>
            <Heart aria-hidden='true' size={28} className='text-emerald-500' />
          </div>
          <div>
            <h2 className='font-display text-2xl font-bold text-slate-900'>Aún no tienes favoritos</h2>
            <p className='text-slate-500 text-sm mt-2 max-w-xs mx-auto'>Explora habitaciones y guarda las que más te interesen</p>
          </div>
          <button
            type='button'
            onClick={() => navigate('/buscar')}
            className='cursor-pointer! inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition'
          >
            <Search aria-hidden='true' size={16} /> Buscar habitaciones
          </button>
        </div>
      )}

      {/* Lista */}
      {lista.length > 0 && (
        <div className='flex flex-col gap-4'>
          {lista.map(pub => (
            <FavCard key={pub.id} pub={pub} onQuitar={quitarFavorito} />
          ))}
        </div>
      )}

    </div>
  )
}
