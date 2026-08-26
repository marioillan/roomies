import { useState, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { registroSchema } from '../lib/schemas'
import { apiFetch } from '../lib/apiFetch'
import { useModalAccesible } from '../lib/useModalAccesible.js'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

function RegistroModal({ onClose, onSuccess, onSwitchToLogin }) {
  const [serverError, setServerError] = useState('')
  const [esCasero, setEsCasero] = useState(false)

  // Diálogo modal accesible: foco atrapado, Escape cierra, el foco vuelve al
  // botón que abrió el modal (2.1.2 / 2.4.3).
  const refDialogo = useModalAccesible(onClose)

  const idBase   = useId()
  const idTitulo = `${idBase}-titulo`
  const idPerfil = `${idBase}-perfil`
  const campo    = (nombre) => `${idBase}-${nombre}`
  const idError  = (nombre) => `${idBase}-error-${nombre}`

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registroSchema) })

  const onSubmit = async (data) => {
    setServerError('')
    try {
      const res = await apiFetch('/api/auth/registro', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) return setServerError(json.message)
      onSuccess(esCasero)
    } catch {
      setServerError('Error de conexión con el servidor')
    }
  }

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`
  }

  const fieldClass = (hasError) =>
    `w-full border rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 transition ${
      hasError ? 'border-red-500 focus:ring-red-300' : 'border-slate-500 focus:ring-emerald-600'
    }`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={refDialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex">
          <h2 id={idTitulo} className="text-2xl font-bold text-slate-900 mb-1">Registrarse</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="ml-auto -mt-1 self-start text-slate-500 hover:text-slate-700 cursor-pointer transition-transform hover:rotate-90"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="cursor-pointer! w-full flex items-center justify-center gap-3 border border-slate-200 hover:bg-slate-50 transition rounded-xl py-3 text-slate-700 font-medium mb-4"
        >
          <GoogleIcon />
          Registrarse con Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-500">o con email</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="mb-4">
          <p id={idPerfil} className="block text-sm font-medium text-slate-700 mb-1.5">¿Qué te trae por aquí?</p>
          <div className="flex gap-2" role="group" aria-labelledby={idPerfil}>
            <button
              type="button"
              aria-pressed={!esCasero}
              onClick={() => setEsCasero(false)}
              className={`cursor-pointer! flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                !esCasero
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              Busco piso
            </button>
            <button
              type="button"
              aria-pressed={esCasero}
              onClick={() => setEsCasero(true)}
              className={`cursor-pointer! flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                esCasero
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              Soy casero
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label htmlFor={campo('nombre')} className="block text-sm font-medium text-slate-700 mb-1">
              Nombre <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only"> (obligatorio)</span>
            </label>
            <input
              id={campo('nombre')}
              type="text"
              autoComplete="name"
              placeholder="Tu nombre"
              required
              aria-invalid={!!errors.nombre}
              aria-describedby={errors.nombre ? idError('nombre') : undefined}
              {...register('nombre')}
              className={fieldClass(errors.nombre)}
            />
            {errors.nombre && (
              <p id={idError('nombre')} role="alert" className="text-red-600 text-xs mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label htmlFor={campo('email')} className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only"> (obligatorio)</span>
            </label>
            <input
              id={campo('email')}
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? idError('email') : undefined}
              {...register('email')}
              className={fieldClass(errors.email)}
            />
            {errors.email && (
              <p id={idError('email')} role="alert" className="text-red-600 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor={campo('password')} className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only"> (obligatorio)</span>
            </label>
            <input
              id={campo('password')}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? idError('password') : undefined}
              {...register('password')}
              className={fieldClass(errors.password)}
            />
            {errors.password && (
              <p id={idError('password')} role="alert" className="text-red-600 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {serverError && <p role="alert" className="text-red-600 text-sm">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer! mt-2 w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 transition text-white font-semibold py-3 rounded-xl"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
          </button>

          <p className="text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="cursor-pointer! text-emerald-700 font-medium hover:underline"
            >
              Inicia sesión
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegistroModal
