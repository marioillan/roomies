import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import './App.css'
import LayoutPerfil from './pages/LayoutPerfil.jsx'
import LayoutGrupo from './pages/LayoutGrupo.jsx'
import GrupoDashboard from './pages/GrupoDashboard.jsx'
import PerfilUsuario from './pages/PerfilUsuario.jsx'
import EditarUsuario from './pages/EditarUsuario.jsx'
import EditarPerfilGrupo from './pages/EditarPerfilGrupo.jsx'
import AccesoGrupo from './pages/AccesoGrupo.jsx'
import CreacionGrupo from './pages/CreacionGrupo.jsx'
import Publicacion from './pages/Publicacion.jsx'
import PublicacionFormPage from './pages/PublicacionFormulario.jsx'
import Favoritos from './pages/Favoritos.jsx'
import Chat from './pages/Chat.jsx'
import Home from './pages/Home.jsx'
import BuscarPage from './pages/BuscarPage.jsx'
import ListaCompra from './pages/ListaCompra.jsx'
import GrupoPerfil from './pages/GrupoPerfil.jsx'
import Gastos from './pages/Facturas.jsx'
import AnuncioPublico from './pages/AnuncioPublico.jsx'
import PerfilPublicoGrupo from './pages/PerfilPublicoGrupo.jsx'
import PerfilPublicoUsuario from './pages/PerfilPublicoUsuario.jsx'
import MisFacturas from './pages/MisFacturas.jsx'
import Tareas from './pages/Tareas.jsx'
import Calendario from './pages/Calendario.jsx'


function App() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, setUser, recargarUsuario } = useAuth()
  const [tieneGrupo, setTieneGrupo] = useState(false)

  useEffect(() => {
    if (!user) { setTieneGrupo(false); return }
    fetch(`${import.meta.env.VITE_API_URL}/api/grupos/mi-grupo`, { credentials: 'include' })
      .then(r => r.json())
      .then(g => setTieneGrupo(!!g.grupo))
      .catch(() => {})
  }, [user?.id])

  useEffect(() => {
    // Limpiar parámetros de retorno de Google OAuth
    if (searchParams.has('auth') || searchParams.has('auth_error') ||
        searchParams.has('calendar') || searchParams.has('calendar_error')) {
      const authParam = searchParams.get('auth')
      if (searchParams.get('calendar') === 'connected') recargarUsuario()
      setSearchParams({}, { replace: true })
      if (authParam === 'google_new') navigate('/perfil/usuario/editar')
    }
  }, [])

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    setUser(null)
    navigate('/')
  }

  return (
    <Routes>
      <Route path="/perfil" element={<LayoutPerfil onLogout={handleLogout} />}>
        <Route path="usuario" element={<PerfilUsuario />} />
        <Route path="favoritos" element={<Favoritos />} />
        <Route path="chat"      element={<Chat modo="solicitante" />} />
      </Route>
      <Route path="/casero/facturas" element={<Gastos onLogout={handleLogout} />} />
      <Route path="/grupo" element={<LayoutGrupo onLogout={handleLogout} />}>
        <Route index element={<GrupoDashboard />} />
        <Route path="perfil" element={<GrupoPerfil />} />
        <Route path="publicacion" element={<Publicacion />} />
        <Route path="tareas"      element={<Tareas />} />
        <Route path="calendario"  element={<Calendario />} />
        <Route path="facturas"    element={<MisFacturas />} />
        <Route path="compra"      element={<ListaCompra />} />
        <Route path="mensajes"    element={<Chat modo="admin" />} />
      </Route>
      <Route path="/grupo/perfil/editar" element={<EditarPerfilGrupo />} />
      <Route path="/grupo/publicacion/formulario" element={<PublicacionFormPage />} />
      <Route path="/perfil/usuario/editar" element={<EditarUsuario />} />
      <Route path="/acceso-grupo" element={<AccesoGrupo setTieneGrupo={setTieneGrupo} />} />
      <Route path="/creacion-grupo" element={<CreacionGrupo />} />
      <Route path="/buscar" element={<BuscarPage />} />
      <Route path="/anuncio/:id" element={<AnuncioPublico />} />
      <Route path="/anuncio/:id/convivencia" element={<PerfilPublicoGrupo />} />
      <Route path="/usuario/:id" element={<PerfilPublicoUsuario />} />
      <Route path="/" element={
        <Home tieneGrupo={tieneGrupo} setTieneGrupo={setTieneGrupo} />
      } />
    </Routes>
  )
}

export default App
