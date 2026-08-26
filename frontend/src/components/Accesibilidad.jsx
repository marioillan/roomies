/**
 * Utilidades de accesibilidad compartidas por toda la aplicación.
 * Implementan los criterios de la WCAG 2.2 que necesitan apoyo de JS o de
 * marcado repetido: enlace de salto, indicadores de carga anunciados por
 * lectores de pantalla y el patrón de diálogo modal accesible.
 */

/**
 * 2.4.1 Evitar bloques — enlace oculto que solo aparece al recibir el foco con
 * el tabulador y permite saltarse la navegación repetida de cada página.
 * El destino debe ser un elemento con id="contenido-principal" y tabIndex={-1}.
 */
export function SaltarAlContenido({ destino = '#contenido-principal' }) {
  return (
    <a
      href={destino}
      className='sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]
                 focus:px-5 focus:py-3 focus:rounded-2xl focus:bg-emerald-600 focus:text-white
                 focus:text-sm focus:font-semibold focus:shadow-lg'
    >
      Saltar al contenido principal
    </a>
  )
}

/**
 * 4.1.3 Mensajes de estado — el spinner es puramente visual, así que se
 * acompaña de un texto solo para lectores de pantalla dentro de una región
 * `role="status"` para que la espera se anuncie sin robar el foco.
 */
export function Cargando({ texto = 'Cargando…', className = '' }) {
  return (
    <div role='status' className={`flex items-center gap-3 ${className}`}>
      <div
        aria-hidden='true'
        className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin'
      />
      <span className='sr-only'>{texto}</span>
    </div>
  )
}

/**
 * 4.1.3 Mensajes de estado — banner de error de servidor. `role="alert"` hace
 * que el lector de pantalla lo lea en cuanto aparece, sin mover el foco.
 */
export function AvisoError({ children, className = '' }) {
  if (!children) return null
  return (
    <div role='alert' className={className}>
      {children}
    </div>
  )
}
