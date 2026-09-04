// Estado vacío de pantalla completa: el bloque que ocupa el área de contenido
// cuando no hay nada que listar todavía (sin favoritos, sin solicitudes, sin
// anuncio) o cuando una búsqueda no devuelve resultados.
export function EstadoVacio({ icono: Icono, titulo, descripcion, accion, pantallaCompleta, children }) {
  const IconoAccion = accion?.icono

  return (
    <div className={`flex flex-col items-center justify-center gap-6 px-4 text-center
      ${pantallaCompleta ? 'min-h-screen bg-slate-50' : 'min-h-[70vh]'}`}>
      <div className='w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center'>
        {/* Decorativo: el título que va debajo ya da la información. */}
        <Icono aria-hidden='true' size={28} className='text-slate-500' />
      </div>

      <div>
        <h2 className='font-display text-2xl font-bold text-slate-900 max-w-sm mx-auto text-balance'>{titulo}</h2>
        {descripcion && (
          <p className='text-slate-500 text-sm mt-2 max-w-xs mx-auto'>{descripcion}</p>
        )}
      </div>

      {accion && (
        <button
          type='button'
          onClick={accion.onClick}
          disabled={accion.disabled}
          className='cursor-pointer! inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition'
        >
          {accion.cargando
            ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
            : IconoAccion && <IconoAccion aria-hidden='true' size={16} />}
          {accion.label}
        </button>
      )}

      {children}
    </div>
  )
}
