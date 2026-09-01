import { Link } from 'react-router-dom'

const ESMERALDA = '#10b981'
function PieDePagina() {
  return (
    <footer className="relative bg-slate-900 text-white pt-20 pb-10 overflow-hidden">
      {/* Halo esmeralda muy tenue: cierra la página con el mismo aire del hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full blur-[150px] opacity-[0.16]"
        style={{ backgroundColor: ESMERALDA }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          <div className="md:col-span-2">
            <span className="font-display font-bold text-white text-3xl -tracking-[0.02em]">Housie</span>
            <p className="mt-4 text-slate-300 text-sm max-w-xs leading-relaxed">
              La plataforma para encontrar compañeros de piso compatibles y
              gestionar la convivencia del día a día.
            </p>
            <p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
              Hecho en España
            </p>
          </div>

          <nav aria-label="Plataforma">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-5">
              Plataforma
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <Link to="/buscar" className="text-slate-300 hover:text-emerald-300 text-sm transition">
                  Buscar habitación en España
                </Link>
              </li>
              <li>
                <Link to="/grupo" className="text-slate-300 hover:text-emerald-300 text-sm transition">
                  Mi grupo de convivencia
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Ayuda">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-5">
              Ayuda
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <Link to="/faq" className="text-slate-300 hover:text-emerald-300 text-sm transition">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <a href="mailto:housie.app@gmail.com" className="text-slate-300 hover:text-emerald-300 text-sm transition">
                  Contactar por correo
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-5">
              Legal
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <Link to="/aviso-legal" className="text-slate-300 hover:text-emerald-300 text-sm transition">
                  Aviso legal
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="text-slate-300 hover:text-emerald-300 text-sm transition">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-slate-300 hover:text-emerald-300 text-sm transition">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© 2026 Housie. Todos los derechos reservados.</p>
          <p className="text-slate-400 text-xs">Hecho con ♥ para estudiantes y jóvenes de España</p>
        </div>
      </div>
    </footer>
  )
}

export default PieDePagina
