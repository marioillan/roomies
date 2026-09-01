import PaginaLegal from '../components/PaginaLegal.jsx'

const SECCIONES = [
  {
    titulo: 'Naturaleza del proyecto',
    parrafos: [
      'Housie es una plataforma desarrollada en el marco de un Trabajo de Fin de Grado de Ingeniería Informática. Se ofrece con finalidad académica y demostrativa, y no constituye una actividad comercial ni una agencia inmobiliaria.',
      'Housie no interviene en los contratos de arrendamiento ni en los acuerdos económicos que los usuarios alcancen entre ellos: se limita a poner en contacto a personas que buscan habitación con grupos que la ofrecen, y a facilitar herramientas para organizar la convivencia.',
    ],
  },
  {
    titulo: 'Objeto y ámbito de aplicación',
    parrafos: [
      'El presente aviso legal regula el acceso, la navegación y el uso del sitio web de Housie. El acceso al sitio atribuye la condición de usuario e implica la aceptación de estas condiciones desde el momento en que se accede.',
      'El titular se reserva el derecho a modificar en cualquier momento la presentación, la configuración y los contenidos del sitio, así como las presentes condiciones.',
    ],
  },
  {
    titulo: 'Condiciones de uso',
    parrafos: [
      'El usuario se compromete a hacer un uso diligente del sitio y de los servicios que ofrece, conforme a la ley, a la buena fe y al orden público. En particular, se obliga a abstenerse de:',
    ],
    lista: [
      'Publicar anuncios falsos, engañosos o de habitaciones sobre las que no se tiene derecho a disponer.',
      'Suplantar la identidad de otra persona o facilitar datos de registro falsos.',
      'Difundir contenidos discriminatorios, injuriosos, violentos o contrarios a la dignidad de las personas.',
      'Utilizar los datos de contacto obtenidos a través de la plataforma con fines publicitarios o ajenos a la búsqueda de piso.',
      'Introducir código malicioso o realizar acciones que puedan dañar, sobrecargar o impedir el normal funcionamiento del sitio.',
    ],
  },
  {
    titulo: 'Registro y cuenta de usuario',
    parrafos: [
      'Algunas funcionalidades requieren crear una cuenta. El usuario es responsable de la veracidad de los datos que facilita y de mantener la confidencialidad de sus credenciales de acceso, así como de toda actividad realizada desde su cuenta.',
      'El titular podrá suspender o cancelar cuentas que incumplan estas condiciones, previa comunicación al usuario cuando ello sea posible.',
    ],
  },
  {
    titulo: 'Contenidos publicados por los usuarios',
    parrafos: [
      'Los anuncios de habitaciones, las fotografías, los perfiles de convivencia y los mensajes son contenidos generados por los propios usuarios. Cada usuario responde de la licitud y veracidad de lo que publica y garantiza que dispone de los derechos necesarios sobre las imágenes que sube.',
      'El titular no revisa previamente todos los contenidos, pero retirará aquellos que resulten manifiestamente ilícitos o contrarios a estas condiciones tan pronto como tenga conocimiento efectivo de ellos.',
    ],
  },
  {
    titulo: 'Propiedad intelectual e industrial',
    parrafos: [
      'El diseño del sitio, su código fuente, los textos, la marca «Housie» y los demás elementos que lo componen pertenecen al titular o se utilizan con la correspondiente autorización, y están protegidos por la normativa de propiedad intelectual e industrial.',
      'Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa, salvo los usos permitidos por la ley. El usuario conserva los derechos sobre los contenidos que publica y concede a Housie una licencia limitada para mostrarlos dentro de la plataforma.',
    ],
  },
  {
    titulo: 'Exclusión de responsabilidad',
    parrafos: [
      'El titular no garantiza la disponibilidad ininterrumpida del sitio ni la ausencia de errores, y no se responsabiliza de los daños derivados de interrupciones del servicio, siempre que actúe con la diligencia debida para restablecerlo.',
      'Housie tampoco responde de la conducta de los usuarios fuera de la plataforma ni del resultado de los acuerdos de convivencia o arrendamiento que alcancen entre ellos. Se recomienda verificar presencialmente la vivienda y la identidad de las personas antes de firmar ningún contrato o realizar cualquier pago.',
    ],
  },
  {
    titulo: 'Enlaces a sitios de terceros',
    parrafos: [
      'El sitio puede incluir enlaces o contenidos incrustados de terceros, como los mapas de Google Maps. El titular no controla dichos sitios ni responde de sus contenidos ni de sus políticas de privacidad, que el usuario debe consultar por separado.',
    ],
  },
  {
    titulo: 'Protección de datos',
    parrafos: [
      'El tratamiento de los datos personales de los usuarios se rige por la política de privacidad, y el uso de cookies por la política de cookies, ambas accesibles desde el pie de página de este sitio.',
    ],
  },
  {
    titulo: 'Legislación aplicable y jurisdicción',
    parrafos: [
      'Estas condiciones se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los juzgados y tribunales del domicilio del usuario cuando este tenga la condición de consumidor.',
    ],
  },
]

export default function AvisoLegal() {
  return (
    <PaginaLegal
      titulo="Aviso"
      tituloAcento="legal"
      descripcion="Quién está detrás de Housie y en qué condiciones puedes usar la plataforma."
      actualizado="1 de septiembre de 2026"
      secciones={SECCIONES}
    />
  )
}
