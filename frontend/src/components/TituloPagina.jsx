import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * 2.4.2 Página con título — Housie es una SPA: al navegar entre rutas el
 * documento no se recarga, así que el <title> del index.html se quedaría fijo y
 * quien use un lector de pantalla no sabría a qué página ha llegado.
 * Este componente actualiza el título en cada cambio de ruta y, además, lo
 * anuncia en una región "live" (4.1.3), que es la forma habitual de comunicar
 * un cambio de página en aplicaciones de una sola página.
 */

// [patrón de ruta, nombre corto (se anuncia y va al <title>), título completo
// opcional]. El tercer elemento existe para las páginas públicas, donde el
// <title> es un activo de SEO y debe llevar las palabras clave enteras en vez
// del "Nombre · Housie" que basta para la parte privada.
const TITULOS = [
  [/^\/$/,                          'Inicio', 'Housie | Encuentra piso compartido y compañeros compatibles'],
  [/^\/faq$/,                       'Preguntas frecuentes', 'Preguntas frecuentes sobre pisos compartidos | Housie'],
  [/^\/buscar/,                     'Buscar piso', 'Habitaciones en pisos compartidos en España | Housie'],
  [/^\/anuncio\/[^/]+\/convivencia/,'Perfil de convivencia del grupo'],
  [/^\/anuncio\//,                  'Anuncio'],
  [/^\/usuario\//,                  'Perfil de usuario'],
  [/^\/perfil\/usuario\/editar$/,   'Editar mi perfil'],
  [/^\/perfil\/usuario/,            'Mi perfil'],
  [/^\/perfil\/favoritos/,          'Mis favoritos'],
  [/^\/perfil\/chat/,               'Mis mensajes'],
  [/^\/perfil\/convivencia/,        'Perfil de convivencia'],
  [/^\/creacion-grupo$/,            'Crear grupo'],
  [/^\/casero\/facturas/,           'Gestión de facturas'],
  [/^\/grupo\/perfil\/editar$/,     'Editar el grupo'],
  [/^\/grupo\/perfil/,              'Mi grupo'],
  [/^\/grupo\/publicacion\/formulario$/, 'Editar el anuncio'],
  [/^\/grupo\/publicacion/,         'Tu anuncio'],
  [/^\/grupo\/tareas/,              'Tareas de limpieza'],
  [/^\/grupo\/calendario/,          'Calendario del grupo'],
  [/^\/grupo\/facturas/,            'Mis facturas'],
  [/^\/grupo\/compra/,              'Lista de la compra'],
  [/^\/grupo\/mensajes/,            'Mensajes del grupo'],
  [/^\/grupo\/solicitudes-union/,   'Solicitudes de unión'],
  [/^\/grupo$/,                     'Mi grupo'],
]

function tituloDeRuta(pathname) {
  const encontrado = TITULOS.find(([patron]) => patron.test(pathname))
  if (!encontrado) return { corto: 'Housie', documento: 'Housie' }
  const [, corto, completo] = encontrado
  return { corto, documento: completo ?? `${corto} · Housie` }
}

function TituloPagina() {
  const { pathname } = useLocation()
  const { corto: titulo, documento } = tituloDeRuta(pathname)

  // El <title> del documento es un sistema externo a React: se sincroniza en un
  // efecto. El texto de la región "live" se deriva de la ruta, sin estado.
  useEffect(() => {
    document.title = documento
  }, [documento])

  return (
    <p aria-live='polite' aria-atomic='true' className='sr-only'>
      {titulo}
    </p>
  )
}

export default TituloPagina
