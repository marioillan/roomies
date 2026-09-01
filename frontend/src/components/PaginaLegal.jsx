import { useEffect } from 'react'
import CabeceraPublica from './CabeceraPublica.jsx'
import PieDePagina from './PieDePagina.jsx'
import Reveal from './Reveal.jsx'
import { SaltarAlContenido } from './Accesibilidad.jsx'

/**
 * Armazón común de las tres páginas legales (aviso legal, política de
 * privacidad y política de cookies). Misma estructura que FAQ.jsx: cabecera
 * pública, hero oscuro, contenido sobre `slate-50` con un bloque por apartado
 * —título en monoespaciada fuera de la tarjeta blanca— y pie compartido.
 *
 * Cada página solo aporta su título y sus apartados. Un apartado es
 * { titulo, parrafos?, lista?, tabla? }.
 */
function PaginaLegal({ titulo, tituloAcento, descripcion, actualizado, secciones }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <SaltarAlContenido />
      <CabeceraPublica />

      <main id='contenido-principal' tabIndex={-1}>

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white px-6 sm:px-10 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <h1
              className="font-display font-bold text-4xl sm:text-5xl leading-tight mb-4"
              style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}
            >
              {titulo}<br />
              <span className="text-emerald-400">{tituloAcento}</span>
            </h1>
            <p
              className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed text-pretty"
              style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}
            >
              {descripcion}
            </p>
            <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
              Última actualización: {actualizado}
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-w-4xl mx-auto px-4 sm:px-10 py-14">
          {secciones.map(seccion => (
            <Reveal key={seccion.titulo}>
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-mono text-m font-semibold uppercase tracking-widest text-slate-900">
                    {seccion.titulo}
                  </h2>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-5">
                    {seccion.parrafos?.map(parrafo => (
                      <p key={parrafo} className="text-slate-500 text-sm leading-relaxed mb-3 last:mb-0 text-pretty">
                        {parrafo}
                      </p>
                    ))}

                    {seccion.lista && (
                      <ul className="mt-4 flex flex-col gap-2.5">
                        {seccion.lista.map(elemento => (
                          <li key={elemento} className="flex gap-3 text-slate-500 text-sm leading-relaxed">
                            <span aria-hidden="true" className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-pretty">{elemento}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {seccion.tabla && (
                      <div className="mt-5 overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <caption className="sr-only">{seccion.titulo}</caption>
                          <thead>
                            <tr className="border-b border-slate-200">
                              {seccion.tabla.cabeceras.map(cabecera => (
                                <th key={cabecera} scope="col" className="py-2.5 pr-4 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                  {cabecera}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {seccion.tabla.filas.map(fila => (
                              <tr key={fila[0]} className="border-b border-slate-100 last:border-0 align-top">
                                {fila.map((celda, i) => (
                                  <td key={i} className={'py-3 pr-4 leading-relaxed ' + (i === 0 ? 'font-semibold text-slate-800 whitespace-nowrap' : 'text-slate-500')}>
                                    {celda}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </main>

      {/* Pie de página compartido con la Home (components/PieDePagina.jsx) */}
      <PieDePagina />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  )
}

export default PaginaLegal
