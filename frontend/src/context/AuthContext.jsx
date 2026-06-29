import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [tieneGrupo, setTieneGrupo] = useState(false)
  const [cargando, setCargando] = useState(true)

  const recargarUsuario = useCallback(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setUser(data.user)
          fetch(`${import.meta.env.VITE_API_URL}/api/grupos/mi-grupo`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setTieneGrupo(!!d.grupo))
            .catch(() => setTieneGrupo(false))
        } else {
          setTieneGrupo(false)
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    recargarUsuario()
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, tieneGrupo, setTieneGrupo, recargarUsuario, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
