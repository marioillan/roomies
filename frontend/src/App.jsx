import { useState } from 'react'
import './App.css'
import habitacionhero from './assets/habitacionhero.jpg';
import { 
  Search, MapPin, Bed, Building2, Users, CalendarCheck, 
  ShoppingCart, Receipt, MessageCircle, ChevronRight,
  Sparkles, Shield, Clock, ArrowRight, CircleUserRound
} from 'lucide-react';

function App() {
  const [query, setQuery] = useState('')

return (
    <div className='min-h-screen bg-slate-50'>

      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white max-h-[800px]">
        
        {/* Blobs de fondo */}
        <div className="absolute inset-0 opacity-20 pointer-events-none ">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500 rounded-full blur-[120px]" />
        </div>

        {/* Acceso a usuario */}
        <div className="absolute top-6 right-6">
          <button className="cursor-pointer bg-white/20 hover:bg-white/30 transition p-3 rounded-full">
            <CircleUserRound size={24} />
          </button>
        </div>

        {/* Contenido: texto + imagen lado a lado */}
        <div className="relative flex items-center justify-between px-20 pt-28 pb-24">
          
          {/* Texto izquierda */}
          <div className="max-w-lg">
            <h1 className='font-bold text-6xl leading-tight'>Tu piso compartido,</h1>
            <h1 className='font-bold text-6xl text-emerald-400'>organizado</h1>
            <p className="mt-6 text-slate-300 text-lg">
              Encuentra habitación, gestiona tareas, gastos y compras con tus compañeros. 
              Todo en una sola plataforma diseñada para la convivencia.
            </p>

            {/* Buscador */}
            <div className="mt-8 flex gap-2 relative flex-1">
              <Search size={20} className="text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿En qué ciudad buscas piso?"
                className="flex-1 p-4 rounded-2xl text-slate-900 outline-none bg-white pr-4 pl-12"
              />
              <button className="bg-emerald-500 hover:bg-emerald-400 transition px-6 py-4 rounded-2xl font-semibold cursor-pointer flex items-center gap-2">
                Buscar <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Imagen derecha */}
          <div className="hidden lg:block flex-shrink-0">
            <img
              src={habitacionhero}
              alt="Habitación hero"
              className="w-[520px] h-[360px] object-cover rounded-3xl shadow-2xl"
            />

            {/* Card flotante 1 */}
            <div className="absolute left-225 top-45 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CalendarCheck size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Tarea completada</p>
                  <p className="text-xs text-slate-500">Cocina - María</p>
                </div>
              </div>
            </div>

            {/* Card flotante 2 */}
            <div className="absolute right-10 bottom-45 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Receipt size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Factura luz</p>
                  <p className="text-xs text-emerald-600">Pagada ✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex absolute left-1/2 transform -translate-x-1/2 bottom- gap-20 top-140'>
        {/* Boton Buscar Habitacion */}
          <div className='flex items-center gap-3 bg-white rounded-xl p-7 shadow-lg cursor-pointer'>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Bed size={20} className="text-blue-600" />
            </div>
            <div className=''>
              <p className="font-semibold text-slate-800 text-lg">Busco habitación</p>
              <p className="text-sm text-slate-500">Encuentra tu habitación ideal</p>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </div>
        {/* Boton Grupos de convivencia */}
          <div className='flex items-center gap-3 bg-white rounded-xl p-7 shadow-lg cursor-pointer'>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Building2 size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-lg">Grupos de convivencia</p>
                <p className="text-sm text-slate-500">Quiero acceder a mi grupo de convivencia</p>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
          </div>
      </div>
      {/* Ciudades */}
      <div className='relative px-20 py-40 flex items-center justify-between gap-20'>
        <div>
          <h2 className='text-3xl font-bold'>Ciudades más populares</h2>
          <p className='text-slate-500 text-base'>Encuentra habitaciones en las ciudades más demandadas</p>
        </div>
        <a className='flex text-slate-600 gap-2' href="#">
          <p>Ver todas</p> 
          <ArrowRight className='mt-1' size={18} />
        </a> 
      </div>
      {/* Necesidades y funcionalidades */}
      <div className='px-20 py-16 bg-white'>
        <div className='text-center mb-12'>
          <h2 className='text-4xl font-bold text-slate-900'>Todo lo que necesitas para convivir</h2>
          <p className='mt-3 text-slate-500 text-lg'>Una plataforma completa pensada para que la vida en piso compartido sea más fácil</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>

          {/* Card 1 - Buscar habitación */}
          <div className='group bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-2xl p-7 transition-all duration-200 cursor-pointer'>
            <div className='w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center mb-5 transition-colors'>
              <Bed size={24} className='text-emerald-600' />
            </div>
            <h3 className='font-semibold text-slate-900 text-lg mb-2'>Busca habitación</h3>
            <p className='text-slate-500 text-sm leading-relaxed'>Filtra por ciudad, precio y características. Encuentra la habitación que encaja contigo en segundos.</p>
          </div>

          {/* Card 2 - Gestión de tareas */}
          <div className='group bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl p-7 transition-all duration-200 cursor-pointer'>
            <div className='w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mb-5 transition-colors'>
              <CalendarCheck size={24} className='text-blue-600' />
            </div>
            <h3 className='font-semibold text-slate-900 text-lg mb-2'>Gestión de tareas</h3>
            <p className='text-slate-500 text-sm leading-relaxed'>Organiza y reparte las tareas del hogar de forma justa. Nada queda sin hacer ni nadie sin responsabilidad.</p>
          </div>

          {/* Card 3 - Control de gastos */}
          <div className='group bg-slate-50 hover:bg-violet-50 border border-slate-100 hover:border-violet-200 rounded-2xl p-7 transition-all duration-200 cursor-pointer'>
            <div className='w-12 h-12 rounded-xl bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center mb-5 transition-colors'>
              <Receipt size={24} className='text-violet-600' />
            </div>
            <h3 className='font-semibold text-slate-900 text-lg mb-2'>Control de gastos</h3>
            <p className='text-slate-500 text-sm leading-relaxed'>Registra facturas, suministros y gastos comunes. Calcula automáticamente lo que le toca pagar a cada uno.</p>
          </div>

          {/* Card 4 - Lista de la compra */}
          <div className='group bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-200 rounded-2xl p-7 transition-all duration-200 cursor-pointer'>
            <div className='w-12 h-12 rounded-xl bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center mb-5 transition-colors'>
              <ShoppingCart size={24} className='text-orange-600' />
            </div>
            <h3 className='font-semibold text-slate-900 text-lg mb-2'>Lista de la compra</h3>
            <p className='text-slate-500 text-sm leading-relaxed'>Crea listas de compra compartidas en tiempo real. Todos saben qué falta y quién lo añadió.</p>
          </div>

          {/* Card 5 - Grupos de convivencia */}
          <div className='group bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 rounded-2xl p-7 transition-all duration-200 cursor-pointer'>
            <div className='w-12 h-12 rounded-xl bg-teal-100 group-hover:bg-teal-200 flex items-center justify-center mb-5 transition-colors'>
              <Users size={24} className='text-teal-600' />
            </div>
            <h3 className='font-semibold text-slate-900 text-lg mb-2'>Grupos de convivencia</h3>
            <p className='text-slate-500 text-sm leading-relaxed'>Tu piso, tu grupo. Invita a tus compañeros y tenéis todo centralizado: quién vive contigo y qué pasa en casa.</p>
          </div>

          {/* Card 6 - Mensajería */}
          <div className='group bg-slate-50 hover:bg-pink-50 border border-slate-100 hover:border-pink-200 rounded-2xl p-7 transition-all duration-200 cursor-pointer'>
            <div className='w-12 h-12 rounded-xl bg-pink-100 group-hover:bg-pink-200 flex items-center justify-center mb-5 transition-colors'>
              <MessageCircle size={24} className='text-pink-600' />
            </div>
            <h3 className='font-semibold text-slate-900 text-lg mb-2'>Comunicación interna</h3>
            <p className='text-slate-500 text-sm leading-relaxed'>Habla con tus compañeros o con el propietario directamente desde la app. Sin grupos de WhatsApp eternos.</p>
          </div>

        </div>
      </div>
      {/* Footer simple */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2025 Roomies. Tu plataforma de gestión de pisos compartidos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
