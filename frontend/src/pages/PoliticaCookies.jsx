import PaginaLegal from '../components/PaginaLegal.jsx'

// Las cookies de la tabla son las que fija el backend al iniciar sesión
// (backend/controllers/authController.js). Si cambian nombre o duración, hay
// que actualizar también esta página.
const SECCIONES = [
  {
    titulo: 'Qué son las cookies',
    parrafos: [
      'Una cookie es un pequeño fichero que un sitio web guarda en tu navegador cuando lo visitas. Sirve, entre otras cosas, para recordar quién eres entre una página y la siguiente, de modo que no tengas que identificarte en cada clic.',
      'Esta política explica qué cookies utiliza Housie, para qué sirven y cómo puedes gestionarlas.',
    ],
  },
  {
    titulo: 'Cookies que utiliza Housie',
    parrafos: [
      'Housie no utiliza cookies publicitarias, de analítica ni de perfilado. Solo instala las estrictamente necesarias para mantener tu sesión iniciada, y únicamente cuando accedes a tu cuenta:',
    ],
    tabla: {
      cabeceras: ['Cookie', 'Finalidad', 'Duración', 'Tipo'],
      filas: [
        ['token', 'Identifica tu sesión en cada petición al servidor y permite acceder a las zonas privadas.', '15 minutos', 'Técnica, propia'],
        ['refresh_token', 'Renueva la sesión cuando caduca la anterior, para que no tengas que volver a iniciar sesión constantemente.', '30 días', 'Técnica, propia'],
      ],
    },
  },
  {
    titulo: 'Cómo están protegidas',
    parrafos: [
      'Ambas cookies son de tipo httpOnly: el navegador no permite que ningún código JavaScript de la página las lea, lo que reduce el riesgo de robo de sesión. Además viajan cifradas y solo se envían a los servidores de Housie.',
      'El identificador de renovación se sustituye por uno nuevo cada vez que se usa, de forma que un valor antiguo deja de servir.',
    ],
  },
  {
    titulo: 'Cookies de terceros',
    parrafos: [
      'Algunas funciones se apoyan en servicios externos que pueden instalar sus propias cookies cuando los utilizas:',
    ],
    lista: [
      'Google Maps: el mapa que se muestra en la ficha de un anuncio y el autocompletado de ciudades en el buscador.',
      'Google (inicio de sesión): solo si eliges acceder con tu cuenta de Google.',
      'Google Calendar: solo si decides conectar tu calendario para sincronizar los eventos del grupo.',
    ],
  },
  {
    titulo: 'Base jurídica y consentimiento',
    parrafos: [
      'Las cookies técnicas necesarias para prestar un servicio expresamente solicitado por el usuario están exentas del deber de consentimiento previo, según el artículo 22.2 de la LSSI-CE y los criterios de la Agencia Española de Protección de Datos. Por eso Housie no muestra un banner de cookies: las que instala son imprescindibles para que la sesión funcione.',
      'Si en el futuro se incorporasen cookies de analítica o publicidad, se solicitaría tu consentimiento previo mediante un mecanismo que permitiese aceptarlas o rechazarlas con la misma facilidad.',
    ],
  },
  {
    titulo: 'Cómo gestionar o eliminar las cookies',
    parrafos: [
      'Puedes ver, bloquear o borrar las cookies desde la configuración de tu navegador. Ten en cuenta que si bloqueas las cookies técnicas de Housie no podrás iniciar sesión ni acceder a las zonas privadas de la plataforma.',
      'Encontrarás las instrucciones en la ayuda de cada navegador: Google Chrome, Mozilla Firefox, Microsoft Edge y Safari incluyen una sección de privacidad donde se gestionan los datos de los sitios web.',
      'También puedes cerrar sesión desde tu perfil: al hacerlo, Housie elimina las dos cookies y borra la sesión guardada en el servidor.',
    ],
  },
  {
    titulo: 'Cambios en esta política',
    parrafos: [
      'Si cambian las cookies que utiliza la plataforma, actualizaremos esta página y la fecha de última actualización que figura al principio.',
    ],
  },
]

export default function PoliticaCookies() {
  return (
    <PaginaLegal
      titulo="Política de"
      tituloAcento="cookies"
      descripcion="Qué cookies instala Housie, para qué sirven y cómo puedes gestionarlas."
      actualizado="1 de septiembre de 2026"
      secciones={SECCIONES}
    />
  )
}
