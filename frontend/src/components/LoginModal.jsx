import { useState, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { loginSchema } from '../lib/schemas'
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

function LoginModal({ onClose, onSuccess, onSwitchToRegistro }) {
  const [serverError, setServerError] = useState('')

  // Patrón de diálogo modal accesible: foco atrapado, cierre con Escape y
  // devolución del foco al elemento que abrió el modal.
  const refDialogo = useModalAccesible(onClose)

  const idBase        = useId()
  const idTitulo      = `${idBase}-titulo`
  const idEmail       = `${idBase}-email`
  const idPassword    = `${idBase}-password`
  const idErrorEmail  = `${idBase}-error-email`
  const idErrorPass   = `${idBase}-error-password`

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    setServerError('')
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) return setServerError(json.message)
      onSuccess()
    } catch {
      setServerError('Error de conexión con el servidor')
    }
  }

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`
  }

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
          <h2 id={idTitulo} className="text-2xl font-bold text-slate-900 mb-1">Iniciar sesión</h2>
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
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-500">o con email</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label htmlFor={idEmail} className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              id={idEmail}
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? idErrorEmail : undefined}
              {...register('email')}
              className={`w-full border rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 transition ${
                errors.email ? 'border-red-500 focus:ring-red-300' : 'border-slate-500 focus:ring-emerald-600'
              }`}
            />
            {errors.email && (
              <p id={idErrorEmail} role="alert" className="text-red-600 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor={idPassword} className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            {/* 3.3.8 Autenticación accesible: `autocomplete` permite que el
                gestor de contraseñas rellene el campo, sin obligar a memorizar. */}
            <input
              id={idPassword}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? idErrorPass : undefined}
              {...register('password')}
              className={`w-full border rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 transition ${
                errors.password ? 'border-red-500 focus:ring-red-300' : 'border-slate-500 focus:ring-emerald-600'
              }`}
            />
            {errors.password && (
              <p id={idErrorPass} role="alert" className="text-red-600 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {serverError && <p role="alert" className="text-red-600 text-sm">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer! mt-2 w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 transition text-white font-semibold py-3 rounded-xl"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            {/* Era un <a href="#">: un enlace que no navega debe ser un botón,
                para que se anuncie con el rol correcto (4.1.2). */}
            <button
              type="button"
              onClick={onSwitchToRegistro}
              className="cursor-pointer! text-emerald-700 font-medium hover:underline"
            >
              Regístrate
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
