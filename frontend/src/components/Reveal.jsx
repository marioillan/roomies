import { useState, useRef, useEffect } from 'react'

/**
 * Aparición al entrar en pantalla, compartida por las páginas públicas con
 * fondo claro (FAQ y páginas legales). El bloque empieza transparente y
 * desplazado hacia abajo, y se coloca en su sitio la primera vez que el
 * observador lo ve; después deja de observarse, para no repetir la animación.
 */
function useInView(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) { setVisible(true); obs.unobserve(el) }
    }, { threshold: 0.1, ...options })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return [ref, visible]
}

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useInView()

  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(20px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export default Reveal
