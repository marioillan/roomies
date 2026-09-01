import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import CabeceraPublica from '../components/CabeceraPublica.jsx'
import PieDePagina from '../components/PieDePagina.jsx'
import Reveal from '../components/Reveal.jsx'
import { SaltarAlContenido } from '../components/Accesibilidad.jsx'

function AccordionItem({ pregunta, respuesta, abierto, onToggle }) {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)

  // Patrón "acordeón" de las WAI-ARIA Authoring Practices: el botón declara si
  // el panel está desplegado (aria-expanded) y a qué panel controla
  // (aria-controls); el panel se oculta con `hidden` cuando está cerrado para
  // que su contenido no sea alcanzable por el tabulador ni por el lector.
  const idBase   = useId()
  const idBoton  = `${idBase}-boton`
  const idPanel  = `${idBase}-panel`

  // `hidden` saca el panel cerrado del orden de tabulación y del lector de
  // pantalla, pero aplicarlo de golpe cortaría la animación de plegado: se
  // marca como cerrado solo cuando la transición de altura ha terminado.
  const [cerrado, setCerrado] = useState(!abierto)
  const oculto = cerrado && !abierto

  useEffect(() => {
    if (contentRef.current) {
      setHeight(abierto ? contentRef.current.scrollHeight : 0)
    }
  }, [abierto])

  return (
    <div className={`border-b border-slate-100 last:border-0 transition-colors ${abierto ? 'bg-emerald-50/40' : ''}`}>
      <button
        type="button"
        id={idBoton}
        onClick={onToggle}
        aria-expanded={abierto}
        aria-controls={idPanel}
        className="cursor-pointer! w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className={`font-semibold text-base leading-snug transition-colors ${abierto ? 'text-emerald-700' : 'text-slate-800'}`}>
          {pregunta}
        </span>
        <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
          abierto ? 'bg-emerald-500 text-white rotate-180' : 'bg-slate-100 text-slate-500'
        }`}>
          <ChevronDown size={15} aria-hidden="true" />
        </div>
      </button>
      <div
        id={idPanel}
        role="region"
        aria-labelledby={idBoton}
        hidden={oculto}
        onTransitionEnd={() => setCerrado(!abierto)}
        style={{ height, overflow: 'hidden', transition: 'height 0.3s ease' }}
      >
        <div ref={contentRef} className="px-6 pb-5">
          <p className="text-slate-500 text-sm leading-relaxed">{respuesta}</p>
        </div>
      </div>
    </div>
  )
}

function CategoriaFAQ({ titulo, preguntas }) {
  const [abierto, setAbierto] = useState(null)
  return (
    <Reveal>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-mono text-m font-semibold uppercase tracking-widest text-slate-900">{titulo}</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {preguntas.map((item, i) => (
            <AccordionItem
              key={i}
              pregunta={item.p}
              respuesta={item.r}
              abierto={abierto === i}
              onToggle={() => setAbierto(abierto === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </Reveal>
  )
}

const CATEGORIAS = [
  {
    titulo: 'Cuenta y registro',
    preguntas: [
      {
        p: '¿Necesito una cuenta para usar Housie?',
        r: 'No es necesario tener una cuenta para explorar las publicaciones disponibles en Housie. Puedes navegar por el marketplace y consultar los anuncios de habitaciones sin registrarte. Sin embargo, sin cuenta no podrás ver tu porcentaje de compatibilidad con los compañeros de cada piso, que es una de las funcionalidades principales de Housie. Además, para contactar con un anunciante, publicar una habitación o acceder al módulo de gestión del piso compartido, también necesitarás una cuenta.',
      },
      {
        p: '¿Cómo puedo registrarme?',
        r: 'Puedes registrarte en Housie de dos formas: introduciendo tu nombre, correo electrónico y una contraseña, o accediendo directamente con tu cuenta de Google. En ambos casos el proceso es rápido y solo te llevará unos segundos. Una vez registrado, podrás completar tu perfil de convivencia para empezar a ver tu compatibilidad con los pisos disponibles.',
      },
      {
        p: '¿Puedo iniciar sesión con Google?',
        r: 'Sí. Housie permite iniciar sesión con tu cuenta de Google de forma rápida y segura, sin necesidad de recordar una contraseña adicional. Si ya tenías una cuenta creada con el mismo correo electrónico, ambos métodos quedarán vinculados automáticamente y podrás usar cualquiera de los dos para acceder.',
      },
      {
        p: '¿Cómo modifico mis datos personales?',
        r: 'Puedes modificar tus datos personales en cualquier momento desde la sección de perfil de tu cuenta. Allí podrás actualizar tu nombre, foto de perfil, correo electrónico, así como tus preferencias de convivencia, hábitos, horarios e intereses.',
      },
      {
        p: '¿Puedo eliminar mi cuenta? ¿Qué pasa con mis datos?',
        r: 'Sí, puedes eliminar tu cuenta en cualquier momento desde la sección de perfil. La eliminación es permanente e irreversible: todos tus datos personales, perfil de convivencia, publicaciones y mensajes serán borrados definitivamente de nuestros servidores. Si formas parte de un grupo de convivencia, abandonarás el grupo automáticamente al eliminar tu cuenta.',
      },
    ],
  },
  {
    titulo: 'Privacidad y seguridad',
    preguntas: [
      {
        p: '¿Qué datos personales recopila Housie?',
        r: 'Housie recopila información sobre tus hábitos yrancia al ruido, mascotas, visitas frecuentes, etc. Con esta información',
      },
      {
        p: '¿Para qué se utilizan mis datos?',
        r: 'Tus datos se utilizan exclusivamente para ofrecerte el servicio de Housie: gestionar tu cuenta, calcular tu compatibilidad con otros usuarios y mostrar tu perfil en el marketplace si publicas una habitación. No utilizamos tus datos con fines publicitarios ni los cedemos a terceros.',
      },
      {
        p: '¿Cómo protege Housie mis datos?',
        r: 'Housie aplica medidas de seguridad para garantizar que tu información esté protegida en todo momento. Las contraseñas se almacenan de forma segura y nunca son accesibles ni siquiera para el equipo de Housie. Toda la comunicación entre tu dispositivo y la plataforma está cifrada para evitar accesos no autorizados. Te recomendamos usar una contraseña segura y no compartir tus credenciales con nadie.',
      },
      {
        p: '¿Puedo ejercer mis derechos sobre mis datos (acceso, rectificación, supresión)?',
        r: 'Sí. De acuerdo con el Reglamento General de Protección de Datos (RGPD), tienes derecho a acceder a tus datos, rectificarlos, solicitar su eliminación y oponerte a su tratamiento. Puedes ejercer estos derechos directamente desde la sección de perfil de tu cuenta o contactando con nosotros a través de nuesto email de contacto.',
      },
    ],
  },
  {
    titulo: 'Matching y compatibilidad',
    preguntas: [
      {
        p: '¿Qué es el porcentaje de compatibilidad?',
        r: 'El porcentaje de compatibilidad es una puntuación que Housie calcula automáticamente para indicarte cómo de afín eres con los compañeros de un piso. Cuanto mayor sea el porcentaje, más coinciden vuestros hábitos y estilo de vida. El objetivo es ayudarte a encontrar no solo una habitación, sino un entorno de convivencia en el que te sientas cómodo.',
      },
      {
        p: '¿Cómo se calcula mi compatibilidad con un piso?',
        r: 'El sistema analiza las respuestas de tu perfil de convivencia y las compara con las del grupo que ha publicado la habitación. Se tienen en cuenta aspectos como el horario, el ambiente del piso, la actitud ante las visitas, las fiestas y la ocupación del espacio. El resultado es un porcentaje global que refleja el grado de coincidencia entre tu estilo de vida y el del grupo. Además, en el detalle de cada anuncio puedes ver exactamente en qué aspectos coincides y en cuáles hay diferencias.',
      },
      {
        p: '¿Qué información mía ve el anunciante cuando envío una solicitud?',
        r: 'Cuando envías una solicitud de contacto a un anuncio, el administrador del piso puede ver tu perfil de convivencia completo, incluyendo tus hábitos, horarios y preferencias, así como el porcentaje de compatibilidad que existe entre vosotros. Esto permite al anunciante tomar una decisión informada sobre si aceptar o rechazar tu solicitud.',
      },
      {
        p: '¿Puedo modificar mi perfil de convivencia una vez creado?',
        r: 'Sí, puedes modificar tu perfil de convivencia en cualquier momento desde la sección de perfil de tu cuenta. Ten en cuenta que cualquier cambio que realices actualizará automáticamente tu porcentaje de compatibilidad con los pisos disponibles.',
      },
    ],
  },
  {
    titulo: 'Publicaciones y contacto',
    preguntas: [
      {
        p: '¿Cómo publico una habitación?',
        r: 'Para publicar una habitación necesitas crear primero un grupo de convivencia desde tu cuenta. Una vez creado el grupo, podrás crear una publicación con la información del piso, como la dirección, el precio, las fotos y las características de la habitación. Solo el administrador del grupo puede crear y gestionar publicaciones.',
      },
      {
        p: '¿Puedo modificar o desactivar mi publicación?',
        r: 'Sí. Como administrador del grupo puedes modificar los datos de tu publicación en cualquier momento. También puedes desactivarla temporalmente si ya no buscas compañero, sin necesidad de eliminarla. Cuando vuelvas a necesitarla, puedes activarla de nuevo con un solo clic.',
      },
      {
        p: '¿Cómo funciona el sistema de solicitudes de contacto?',
        r: 'Cuando encuentres un piso que te interese, puedes enviar una solicitud de contacto al administrador del grupo. En ese momento el administrador recibirá tu solicitud y podrá consultar tu perfil de convivencia y tu porcentaje de compatibilidad antes de tomar una decisión.',
      },
      {
        p: '¿Qué pasa cuando el administrador acepta o rechaza mi solicitud?',
        r: 'Si el administrador acepta tu solicitud, podrás continuar la conversación a través del chat para coordinar los siguientes pasos. Si la rechaza, recibirás una notificación informándote de la decisión. En cualquier caso, siempre podrás seguir explorando otros pisos disponibles en el marketplace.',
      },
      {
        p: '¿Cómo me uno a un grupo con un código de acceso?',
        r: 'Para unirte a un grupo de convivencia necesitas un código de acceso de 6 dígitos que te facilitará el administrador del grupo. Introdúcelo y pasarás a formar parte del grupo automáticamente.',
      },
    ],
  },
  {
    titulo: ' Gestión del piso compartido',
    preguntas: [
      {
        p: '¿Qué es el módulo de gestión del piso?',
        r: 'El módulo de gestión del piso es un espacio privado para los miembros de tu grupo de convivencia. Desde aquí podréis organizar las tareas domésticas, gestionar los gastos y facturas del piso, compartir un calendario común y coordinar la lista de la compra, todo en un mismo lugar.',
      },
      {
        p: '¿Cómo se gestionan las tareas domésticas?',
        r: 'Cualquier miembro del grupo puede crear tareas y asignarlas a otros compañeros. Las tareas pueden marcarse como completadas una vez realizadas y el sistema mostrará en todo momento qué tareas están pendientes y cuáles han sido completadas.',
      },
      {
        p: '¿Cómo funciona la lista de la compra compartida?',
        r: 'Cualquier miembro del grupo puede añadir productos a la lista de la compra compartida. El resto de compañeros podrán ver los productos añadidos, modificarlos o marcarlos como comprados en tiempo real, de modo que todos estéis siempre al día de lo que falta en casa.',
      },
      {
        p: '¿Qué es el calendario compartido?',
        r: 'El calendario compartido permite a todos los miembros del grupo crear y consultar eventos comunes, como reuniones del piso, visitas o cualquier otro acontecimiento relevante para la convivencia. De esta forma todos los compañeros están informados de lo que ocurre en el piso.',
      },
      {
        p: '¿Cómo se gestionan las facturas del piso?',
        r: 'El casero es el encargado de subir las facturas del piso, como el alquiler, la luz, el agua o el internet. El casero puede ser un miembro del grupo o una persona externa que se une mediante el código de acceso. Los miembros del grupo podrán consultar el listado de facturas y confirmar sus pagos dentro de la plataforma, manteniendo así un registro claro y organizado de los gastos comunes.',
      },
      {
        p: '¿Quién puede ver la información del grupo?',
        r: 'La información del grupo es privada y solo accesible para los miembros que forman parte de él. Ningún usuario externo puede ver las tareas, facturas, el calendario ni la lista de la compra de tu grupo',
      },
    ],
  },
]

export default function FAQ() {
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
            ¿En qué podemos<br />
            <span className="text-emerald-400">ayudarte?</span>
          </h1>
          <p
            className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed text-pretty"
            style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}
          >
            Las dudas más habituales sobre el registro, el cálculo de la
            compatibilidad, los anuncios y la gestión del piso compartido.
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 sm:px-10 py-14">
        {CATEGORIAS.map((cat, i) => (
          <CategoriaFAQ key={i} {...cat} />
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
