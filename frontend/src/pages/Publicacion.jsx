import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import {
  Megaphone, MapPin, Euro, Bed, Ruler, Users, Eye, EyeOff,
  Pencil, Plus, Check, Home, Cigarette, PawPrint,
  ChevronLeft, ChevronRight, ImageOff, Wifi, Wind, Flame,
  Car, Trees, WashingMachine, Layers, MoveUp,
} from 'lucide-react'

// ── Galería de fotos ──────────────────────────────────────────────

function Galeria({ fotos }) {
  const [actual, setActual] = useState(0)

  if (!fotos.length) {
    return (
      <div className='w-full aspect-video bg-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-200'>
        <ImageOff size={28} className='text-slate-300' />
        <p className='text-xs text-slate-400'>Sin fotos</p>
      </div>
    )
  }

  const prev = () => setActual(i => (i - 1 + fotos.length) % fotos.length)
  const next = () => setActual(i => (i + 1) % fotos.length)

  return (
    <div className='flex flex-col gap-2'>
      {/* Foto principal */}
      <div className='relative w-full aspect-video bg-slate-100 rounded-2xl overflow-hidden group'>
        <img
          src={fotos[actual].url}
          alt={`Foto ${actual + 1}`}
          className='w-full h-full object-cover transition-opacity duration-200'
        />

        {fotos.length > 1 && (
          <>
            <button
              onClick={prev}
              className='cursor-pointer! absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition opacity-0 group-hover:opacity-100'
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className='cursor-pointer! absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition opacity-0 group-hover:opacity-100'
            >
              <ChevronRight size={16} />
            </button>
            <span className='absolute bottom-3 right-3 bg-black/40 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm'>
              {actual + 1} / {fotos.length}
            </span>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {fotos.length > 1 && (
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {fotos.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setActual(i)}
              className={`cursor-pointer! shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${
                i === actual ? 'border-emerald-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <img src={f.url} alt='' className='w-full h-full object-cover' />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Chip de info ──────────────────────────────────────────────────

function Chip({ icon: Icon, children, accent }) {
  const cls = accent === 'emerald'
    ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
    : 'text-slate-600 bg-slate-50 border-slate-100'
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-xl ${cls}`}>
      <Icon size={12} className='shrink-0' /> {children}
    </span>
  )
}

// ── Fila de comodidad ─────────────────────────────────────────────

const COMODIDAD_ICON = {
  wifi:               Wifi,
  lavadora:           WashingMachine,
  lavavajillas:       WashingMachine,
  aire_acondicionado: Wind,
  calefaccion:        Flame,
  parking:            Car,
  terraza:            Trees,
  amueblado:          Home,
}

const COMODIDAD_LABEL = {
  wifi:               'Wifi',
  lavadora:           'Lavadora',
  lavavajillas:       'Lavavajillas',
  aire_acondicionado: 'Aire acondicionado',
  calefaccion:        'Calefacción',
  parking:            'Parking',
  terraza:            'Terraza',
  amueblado:          'Amueblado',
}

// ── Sección visual ────────────────────────────────────────────────

function Seccion({ title, children }) {
  return (
    <div className='flex flex-col gap-3'>
      <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2'>
        {title}
      </p>
      {children}
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────

function Publicacion() {
  const { miembros, user } = useOutletContext()
  const navigate = useNavigate()
  const [publicacion, setPublicacion] = useState(undefined)
  const [fotos, setFotos] = useState([])

  const esAdmin = miembros.find(m => m.id === user?.id)?.rol_en_grupo === 'ADMIN'

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/grupos/publicacion`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setPublicacion(d.publicacion ?? null)
        setFotos(d.fotos ?? [])
      })
      .catch(() => setPublicacion(null))
  }, [])

  if (publicacion === undefined) {
    return (
      <div className='flex justify-center py-16'>
        <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  // ── Sin anuncio ───────────────────────────────────────────────

  if (!publicacion) {
    return (
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 flex flex-col items-center text-center gap-4'>
          <div className='w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center'>
            <Megaphone size={24} className='text-emerald-400' />
          </div>
          <div>
            <p className='text-sm font-bold text-slate-800'>
              {esAdmin ? 'Aún no tienes un anuncio publicado' : 'Sin anuncio publicado'}
            </p>
            <p className='text-xs text-slate-400 mt-1'>
              {esAdmin
                ? 'Tu piso no aparece en las búsquedas todavía.'
                : 'El administrador del grupo aún no ha publicado el anuncio del piso.'}
            </p>
          </div>
          {esAdmin && (
            <button
              onClick={() => navigate('/grupo/publicacion/formulario')}
              className='cursor-pointer! flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition'
            >
              <Plus size={14} /> Crear anuncio
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Con anuncio ───────────────────────────────────────────────

  const comodidades = Object.keys(COMODIDAD_LABEL).filter(k => publicacion[k])

  const normas = [
    publicacion.permite_fumar != null && { icon: Cigarette, label: publicacion.permite_fumar ? 'Fumar permitido' : 'No se puede fumar' },
    publicacion.permite_mascotas != null && { icon: PawPrint, label: publicacion.permite_mascotas ? 'Mascotas permitidas' : 'No se permiten mascotas' },
  ].filter(Boolean)

  return (
    <div className='max-w-2xl mx-auto flex flex-col gap-5'>

      {/* Galería */}
      <Galeria fotos={fotos} />

      {/* Cabecera */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1 min-w-0'>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border mb-1.5 ${
            publicacion.visible
              ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
              : 'text-slate-500 bg-slate-100 border-slate-200'
          }`}>
            {publicacion.visible ? <Eye size={10} /> : <EyeOff size={10} />}
            {publicacion.visible ? 'Visible en búsquedas' : 'Oculta en búsquedas'}
          </span>
          <h1 className='text-xl font-bold text-slate-900 leading-tight'>{publicacion.titulo}</h1>
          {publicacion.ciudad && (
            <p className='flex items-center gap-1 text-sm text-slate-400 mt-1'>
              <MapPin size={12} /> {publicacion.direccion ? `${publicacion.direccion}, ${publicacion.ciudad}` : publicacion.ciudad}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2 shrink-0'>
          {esAdmin && (
            <button
              onClick={() => navigate('/grupo/publicacion/formulario')}
              className='cursor-pointer! flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-600 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl transition'
            >
              <Pencil size={12} /> Editar
            </button>
          )}
          {publicacion.visible && (
            <button
              onClick={() => navigate(`/anuncio/${publicacion.id}`)}
              className='cursor-pointer! flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition'
            >
              <Eye size={12} /> Ver anuncio
            </button>
          )}
        </div>
      </div>

      {/* Datos clave */}
      <div className='flex flex-wrap gap-2'>
        <Chip icon={Euro} accent='emerald'>{Number(publicacion.precio).toFixed(0)} €/mes</Chip>
        <Chip icon={Bed}>{publicacion.habitaciones_libres} hab. libre{publicacion.habitaciones_libres !== 1 ? 's' : ''}</Chip>
        {publicacion.habitaciones_totales && <Chip icon={Layers}>{publicacion.habitaciones_totales} hab. en total</Chip>}
        {publicacion.tamano_piso        && <Chip icon={Ruler}>{publicacion.tamano_piso} m²</Chip>}
        {publicacion.planta != null     && <Chip icon={MoveUp}>Planta {publicacion.planta}</Chip>}
        {publicacion.tipo_piso          && <Chip icon={Home}>{publicacion.tipo_piso.charAt(0) + publicacion.tipo_piso.slice(1).toLowerCase()}</Chip>}
        {publicacion.genero_preferido   && <Chip icon={Users}>Solo {publicacion.genero_preferido.toLowerCase()}</Chip>}
      </div>

      {/* Descripción */}
      <Seccion title='Descripción'>
        <p className='text-sm text-slate-600 leading-relaxed whitespace-pre-line'>{publicacion.descripcion}</p>
      </Seccion>

      {/* Comodidades */}
      {comodidades.length > 0 && (
        <Seccion title='Comodidades'>
          <div className='grid grid-cols-2 gap-2'>
            {comodidades.map(k => {
              const Icon = COMODIDAD_ICON[k]
              return (
                <div key={k} className='flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5'>
                  <div className='w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0'>
                    <Icon size={13} className='text-emerald-600' />
                  </div>
                  <span className='text-sm font-medium text-slate-700'>{COMODIDAD_LABEL[k]}</span>
                  <Check size={12} className='text-emerald-500 ml-auto shrink-0' />
                </div>
              )
            })}
          </div>
        </Seccion>
      )}

      {/* Normas */}
      {(normas.length > 0 || publicacion.normas_adicionales) && (
        <Seccion title='Normas de la casa'>
          {normas.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {normas.map(({ icon: Icon, label }) => (
                <span key={label} className='flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl'>
                  <Icon size={12} className='shrink-0' /> {label}
                </span>
              ))}
            </div>
          )}
          {publicacion.normas_adicionales && (
            <p className='text-sm text-slate-500 leading-relaxed'>{publicacion.normas_adicionales}</p>
          )}
        </Seccion>
      )}

    </div>
  )
}

export default Publicacion
