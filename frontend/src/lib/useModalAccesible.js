import { useEffect, useRef } from 'react'

const SELECTOR_FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Patrón de diálogo modal accesible (2.1.2 sin trampas de teclado,
 * 2.4.3 orden del foco, 2.1.1 accesible por teclado):
 *  - mueve el foco al diálogo al abrirse,
 *  - mantiene el tabulador dentro del diálogo mientras está abierto,
 *  - cierra con la tecla Escape,
 *  - devuelve el foco al elemento que abrió el modal al cerrarse,
 *  - bloquea el scroll del fondo.
 *
 * Devuelve la ref que hay que colocar en el contenedor del diálogo.
 */
export function useModalAccesible(onCerrar, abierto = true) {
  const refDialogo = useRef(null)

  useEffect(() => {
    if (!abierto) return

    const elementoPrevio = document.activeElement
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Foco inicial: el primer control del diálogo o el propio diálogo.
    const dialogo = refDialogo.current
    const primero = dialogo?.querySelector(SELECTOR_FOCUSABLE)
    ;(primero ?? dialogo)?.focus()

    const alPulsarTecla = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCerrar?.()
        return
      }
      if (e.key !== 'Tab' || !refDialogo.current) return

      const focusables = Array.from(refDialogo.current.querySelectorAll(SELECTOR_FOCUSABLE))
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }
      const primerElemento = focusables[0]
      const ultimoElemento = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === primerElemento) {
        e.preventDefault()
        ultimoElemento.focus()
      } else if (!e.shiftKey && document.activeElement === ultimoElemento) {
        e.preventDefault()
        primerElemento.focus()
      }
    }

    document.addEventListener('keydown', alPulsarTecla)
    return () => {
      document.removeEventListener('keydown', alPulsarTecla)
      document.body.style.overflow = overflowPrevio
      if (elementoPrevio instanceof HTMLElement) elementoPrevio.focus()
    }
  }, [abierto, onCerrar])

  return refDialogo
}
