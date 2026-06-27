import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

function CustomSelect({ options, placeholder, value, onChange, hasError }) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const ref = useRef(null)

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const dropdownHeight = Math.min(options.length * 38 + 8, 200)
      setOpenUp(window.innerHeight - rect.bottom < dropdownHeight + 40)
    }
    setOpen(o => !o)
  }

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full border rounded-xl px-4 py-3 text-left flex items-center justify-between cursor-pointer! transition focus:outline-none focus:ring-2 ${
          hasError ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-emerald-400'
        } bg-white`}
      >
        <span className={selected ? 'text-slate-900' : 'text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul className={`absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto ${
          openUp ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}>
          {options.map(o => (
            <li
              key={o.value}
              onMouseDown={() => { onChange(o.value); setOpen(false) }}
              className={`px-4 py-2 cursor-pointer text-sm hover:bg-emerald-50 hover:text-emerald-700 transition ${
                value === o.value ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'
              }`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CustomSelect
