import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const recargarUsuario = useCallback(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data.user) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    recargarUsuario()
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, recargarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
