import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, House, Plus, KeyRound, AlertCircle, Users } from 'lucide-react'

export default function AccesoGrupo({ setTieneGrupo }) {
  const navigate = useNavigate()
  const [codigo, setCodigo]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [checking, setChecking]     = useState(true)
  const [grupoUnido, setGrupoUnido] = useState(null)
  const [esCasero, setEsCasero]     = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/grupos/mi-grupo`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.grupo) navigate('/grupo', { replace: true }) })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  const handleUnirse = async (e) => {
    e.preventDefault()
    const codigoLimpio = codigo.trim().toUpperCase()
    if (codigoLimpio.length !== 6) {
      setError('El código debe tener exactamente 6 caracteres')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/grupos/unirse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ codigo_acceso: codigoLimpio }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message); return }
      setTieneGrupo?.(true)
      setEsCasero(json.esCasero ?? false)
      setGrupoUnido(json.grupo)
    } catch {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // ── Estado de éxito ────────────────────────────────────────────
  if (grupoUnido) return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3.5 flex items-center gap-4">
        <div className="h-4 w-px bg-slate-200" />
        <p className="text-sm font-semibold text-slate-700">
          {esCasero ? 'Acceso como casero' : 'Te has unido al grupo'}
        </p>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
          <div className="bg-emerald-50 px-6 py-5 border-b border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <House size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {esCasero ? '¡Acceso concedido!' : '¡Bienvenido al grupo!'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {esCasero
                  ? `Tienes acceso como casero a ${grupoUnido.nombre}`
                  : grupoUnido.nombre
                }
              </p>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-3">
            <button
              onClick={() => navigate(esCasero ? '/grupo/publicacion' : '/grupo')}
              className="cursor-pointer! w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm shadow-emerald-200"
            >
              <Users size={16} />
              {esCasero ? 'Ver publicación del grupo' : 'Ir al dashboard del grupo'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="cursor-pointer! w-full text-slate-400 hover:text-slate-700 font-medium px-6 py-2.5 rounded-xl transition text-sm"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Formulario principal ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3.5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cursor-pointer! flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 font-medium transition"
        >
          <ArrowLeft size={15} /> Volver
        </button>
        <div className="h-4 w-px bg-slate-200" />
        <p className="text-sm font-semibold text-slate-700">Mi grupo</p>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-4">

        {/* Tarjeta — Unirse con código */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
          <div className="bg-emerald-50 px-6 py-5 border-b border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <KeyRound size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Unirse con código</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pide el código de 6 caracteres al administrador de tu piso.</p>
            </div>
          </div>

          <form onSubmit={handleUnirse} className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Código de acceso
              </label>
              <input
                type="text"
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                placeholder="ABC123"
                maxLength={6}
                className={`w-full px-4 py-3 rounded-xl text-sm text-slate-800 bg-slate-50 border outline-none transition-all text-center tracking-[0.4em] font-bold text-lg placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400
                  ${error
                    ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white focus:shadow-sm'
                  }`}
              />
              {error && (
                <p className="flex items-center gap-1 text-red-500 text-[11px] mt-1.5">
                  <AlertCircle size={10} /> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || codigo.length === 0}
              className="cursor-pointer! w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition shadow-sm shadow-emerald-200"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Unirse al grupo'
              }
            </button>
          </form>
        </div>

        {/* Separador */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">o</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Tarjeta — Crear grupo */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Plus size={20} className="text-slate-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Crear un grupo nuevo</h2>
              <p className="text-xs text-slate-500 mt-0.5">¿Eres el primero en llegar? Crea el grupo y comparte el código con tus compañeros.</p>
            </div>
          </div>

          <div className="p-6">
            <button
              type="button"
              onClick={() => navigate('/creacion-grupo')}
              className="cursor-pointer! w-full flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-emerald-400 hover:text-emerald-700 text-slate-700 font-semibold py-3 rounded-xl transition"
            >
             Crear mi grupo
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
