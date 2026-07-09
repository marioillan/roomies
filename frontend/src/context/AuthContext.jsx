import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiFetch } from '../lib/apiFetch'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Rutas públicas / la propia ruta del formulario: no deben disparar la redirección obligatoria
const RUTAS_EXCLUIDAS_PERFIL_INCOMPLETO = ['/', '/perfil/usuario/editar']

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [tieneGrupo, setTieneGrupo] = useState(false)
  const [cargando, setCargando] = useState(true)

  const recargarUsuario = useCallback(async () => {
    try {
      // Fetch directo para /me: un 401 aquí no implica redirigir (puede ser usuario anónimo)
      let r = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })

      if (r.status === 401) {
        // Intentar renovar la sesión con el refresh token
        const refresh = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
        if (refresh.ok) {
          r = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
        }
      }

      if (!r.ok) {
        setUser(null)
        setTieneGrupo(false)
        return
      }

      const data = await r.json()
      setUser(data.user)

      const grupoR = await apiFetch('/api/grupos/mi-grupo')
      if (grupoR.ok) {
        const d = await grupoR.json()
        setTieneGrupo(!!d.grupo)
      } else {
        setTieneGrupo(false)
      }
    } catch {
      setUser(null)
      setTieneGrupo(false)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    recargarUsuario()
  }, [])

  // Redirección obligatoria al formulario de perfil si está incompleto
  useEffect(() => {
    if (cargando || !user) return
    if (user.perfil_completo === false && !RUTAS_EXCLUIDAS_PERFIL_INCOMPLETO.includes(location.pathname)) {
      navigate('/perfil/usuario/editar')
    }
  }, [user, cargando, location.pathname, navigate])

  return (
    <AuthContext.Provider value={{ user, setUser, tieneGrupo, setTieneGrupo, recargarUsuario, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
