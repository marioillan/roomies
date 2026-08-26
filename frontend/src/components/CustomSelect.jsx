import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Desplegable accesible siguiendo el patrón "select-only combobox" de las
 * WAI-ARIA Authoring Practices:
 *  - el botón expone role="combobox", aria-expanded y aria-controls,
 *  - la lista es un role="listbox" con role="option" y aria-selected,
 *  - se maneja por teclado (flechas, Inicio/Fin, Enter, Espacio, Escape, Tab),
 *  - la opción activa se enlaza con aria-activedescendant para que el lector de
 *    pantalla la anuncie sin sacar el foco del botón.
 */
function CustomSelect({ options, placeholder, value, onChange, hasError, id, ariaLabel, describedBy }) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [indiceActivo, setIndiceActivo] = useState(-1)
  const ref = useRef(null)
  const refBoton = useRef(null)
  const refLista = useRef(null)

  const idGenerado = useId()
  const idBoton = id ?? `select-${idGenerado}`
  const idLista = `${idBoton}-lista`
  const idOpcion = (i) => `${idBoton}-opcion-${i}`

  const selected = options.find(o => o.value === value)
  const indiceSeleccionado = options.findIndex(o => o.value === value)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Mantener la opción activa siempre visible dentro de la lista con scroll.
  useEffect(() => {
    if (!open || indiceActivo < 0) return
    refLista.current?.querySelector(`#${CSS.escape(`${idBoton}-opcion-${indiceActivo}`)}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, indiceActivo, idBoton])

  const abrir = (indiceInicial) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const dropdownHeight = Math.min(options.length * 38 + 8, 200)
      setOpenUp(window.innerHeight - rect.bottom < dropdownHeight + 40)
    }
    setIndiceActivo(indiceInicial)
    setOpen(true)
  }

  const cerrar = () => {
    setOpen(false)
    setIndiceActivo(-1)
  }

  const seleccionar = (i) => {
    if (i < 0 || i >= options.length) return
    onChange(options[i].value)
    cerrar()
    refBoton.current?.focus()
  }

  const handleToggle = () => {
    if (open) cerrar()
    else abrir(indiceSeleccionado >= 0 ? indiceSeleccionado : 0)
  }

  const alPulsarTecla = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) abrir(indiceSeleccionado >= 0 ? indiceSeleccionado : 0)
        else setIndiceActivo(i => Math.min(i + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) abrir(indiceSeleccionado >= 0 ? indiceSeleccionado : options.length - 1)
        else setIndiceActivo(i => Math.max(i - 1, 0))
        break
      case 'Home':
        if (open) { e.preventDefault(); setIndiceActivo(0) }
        break
      case 'End':
        if (open) { e.preventDefault(); setIndiceActivo(options.length - 1) }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open) seleccionar(indiceActivo)
        else abrir(indiceSeleccionado >= 0 ? indiceSeleccionado : 0)
        break
      case 'Escape':
        if (open) { e.preventDefault(); cerrar() }
        break
      case 'Tab':
        if (open) cerrar()
        break
      default:
        break
    }
  }

  return (
    <div ref={ref} className="relative w-full">
      <button
        ref={refBoton}
        id={idBoton}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={idLista}
        aria-activedescendant={open && indiceActivo >= 0 ? idOpcion(indiceActivo) : undefined}
        aria-invalid={hasError || undefined}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        onClick={handleToggle}
        onKeyDown={alPulsarTecla}
        className={`w-full border rounded-xl px-4 py-3 text-left flex items-center justify-between cursor-pointer! transition focus:outline-none focus:ring-2 ${
          hasError ? 'border-red-500 focus:ring-red-300' : 'border-slate-500 focus:ring-emerald-600'
        } bg-white`}
      >
        <span className={selected ? 'text-slate-900' : 'text-slate-500'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown aria-hidden="true" size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <ul
        ref={refLista}
        id={idLista}
        role="listbox"
        aria-label={ariaLabel ?? placeholder}
        hidden={!open}
        className={`absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto ${
          openUp ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}
      >
        {options.map((o, i) => (
          <li
            key={o.value}
            id={idOpcion(i)}
            role="option"
            aria-selected={value === o.value}
            onMouseEnter={() => setIndiceActivo(i)}
            onMouseDown={(e) => { e.preventDefault(); seleccionar(i) }}
            className={`px-4 py-2 cursor-pointer text-sm transition ${
              i === indiceActivo ? 'bg-emerald-50 text-emerald-800' : ''
            } ${value === o.value ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-slate-700'}`}
          >
            {o.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CustomSelect
