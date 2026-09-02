import PaginaLegal from '../components/PaginaLegal.jsx'

// Los datos entre corchetes identifican al responsable del tratamiento y hay
// que completarlos antes de publicar el sitio.
const SECCIONES = [
  {
    titulo: 'Datos que tratamos',
    parrafos: [
      'Housie trata únicamente los datos necesarios para prestar el servicio. Según el uso que hagas de la plataforma, podemos tratar:',
    ],
    lista: [
      'Datos identificativos y de contacto: nombre, correo electrónico y contraseña, que se almacena siempre cifrada y nunca en claro.',
      'Datos de perfil: fotografías, fecha de nacimiento, género, país, ocupación y descripción personal.',
      'Perfil de convivencia e intereses: horario, ambiente, tolerancia a las fiestas, frecuencia de visitas, limpieza y orden, nivel de ruido e intereses seleccionados. Son los datos con los que se calcula la compatibilidad.',
      'Datos de los anuncios: dirección de la vivienda, características del piso y fotografías, cuando publicas una habitación.',
      'Comunicaciones: mensajes intercambiados en el chat y solicitudes de contacto o de unión a un grupo.',
      'Datos de convivencia del grupo: tareas, eventos del calendario, lista de la compra y facturas compartidas.',
      'Datos técnicos: dirección IP y datos de la sesión, necesarios para mantener la seguridad del servicio.',
    ],
  },
  {
    titulo: 'Finalidades y base jurídica',
    parrafos: [
      'Cada tratamiento se apoya en una base jurídica del artículo 6 del Reglamento General de Protección de Datos (RGPD):',
    ],
    tabla: {
      cabeceras: ['Finalidad', 'Base jurídica'],
      filas: [
        ['Crear y gestionar tu cuenta', 'Ejecución del contrato: sin cuenta no es posible prestar el servicio.'],
        ['Calcular la compatibilidad y ordenar los anuncios', 'Ejecución del contrato y consentimiento al completar el perfil de convivencia, que es voluntario.'],
        ['Publicar tu anuncio y mostrarlo en las búsquedas', 'Ejecución del contrato, a petición tuya al publicar la habitación.'],
        ['Permitir el chat y las solicitudes de contacto', 'Ejecución del contrato.'],
        ['Avisar por correo de solicitudes y publicaciones', 'Ejecución del contrato: son comunicaciones de servicio, no publicidad.'],
        ['Sincronizar eventos con Google Calendar', 'Consentimiento, que otorgas al conectar tu cuenta de Google y puedes retirar cuando quieras.'],
        ['Mantener la seguridad y prevenir usos fraudulentos', 'Interés legítimo del responsable.'],
      ],
    },
  },
  {
    titulo: 'Plazo de conservación',
    parrafos: [
      'Conservamos tus datos mientras mantengas la cuenta activa. Si la eliminas, se suprimen tus datos de perfil, tus publicaciones y tus mensajes.',
      'Algunos datos pueden conservarse bloqueados durante los plazos de prescripción legal cuando sea necesario para atender posibles responsabilidades. Los datos de las facturas compartidas permanecen en el grupo mientras este exista, porque pertenecen también al resto de miembros.',
    ],
  },
  {
    titulo: 'Destinatarios de los datos',
    parrafos: [
      'No vendemos tus datos ni los cedemos con fines publicitarios. Solo acceden a ellos los proveedores necesarios para que la plataforma funcione, que actúan como encargados del tratamiento:',
    ],
    tabla: {
      cabeceras: ['Proveedor', 'Para qué'],
      filas: [
        ['Cloudinary', 'Alojamiento de las fotografías de perfil, de los grupos y de los anuncios.'],
        ['Google', 'Inicio de sesión con Google, sincronización opcional con Google Calendar, y mapas y autocompletado de ciudades.'],
        ['Gmail', 'Envío de los correos de aviso sobre solicitudes y publicaciones.'],
        ['Proveedor de alojamiento', 'Servidores y base de datos donde se ejecuta la aplicación.'],
      ],
    },
  },
  {
    titulo: 'Datos visibles para otros usuarios',
    parrafos: [
      'Parte de tu información es visible para otras personas, porque es la finalidad misma del servicio: tu perfil público —nombre, fotografías, descripción, perfil de convivencia e intereses— puede ser consultado por otros usuarios.',
      'Cuando envías una solicitud de contacto, el administrador del grupo ve tu perfil y vuestro porcentaje de compatibilidad. Los datos del módulo de convivencia (tareas, calendario, lista de la compra y facturas) solo son visibles para los miembros de tu grupo.',
    ],
  },
  {
    titulo: 'Transferencias internacionales',
    parrafos: [
      'Algunos de los proveedores indicados tienen su sede fuera del Espacio Económico Europeo. En esos casos, las transferencias se amparan en las cláusulas contractuales tipo aprobadas por la Comisión Europea o en una decisión de adecuación.',
    ],
  },
  {
    titulo: 'Tus derechos',
    parrafos: [
      'Puedes ejercer en cualquier momento los derechos que te reconoce el RGPD escribiendo a housie.app@gmail.com, indicando el derecho que ejercitas y acreditando tu identidad:',
    ],
    lista: [
      'Acceso: saber qué datos tuyos tratamos.',
      'Rectificación: corregir los datos inexactos, algo que también puedes hacer tú mismo desde tu perfil.',
      'Supresión: solicitar que borremos tus datos.',
      'Oposición: oponerte a un tratamiento basado en nuestro interés legítimo.',
      'Limitación: pedir que suspendamos el tratamiento mientras se resuelve una reclamación.',
      'Portabilidad: recibir tus datos en un formato estructurado y de uso común.',
      'Retirar el consentimiento cuando quieras, sin que ello afecte a la licitud del tratamiento anterior.',
    ],
  },
  {
    titulo: 'Reclamación ante la autoridad de control',
    parrafos: [
      'Si consideras que no hemos atendido correctamente tus derechos, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es), autoridad de control competente en España.',
    ],
  },
  {
    titulo: 'Seguridad de la información',
    parrafos: [
      'Aplicamos medidas técnicas y organizativas adecuadas al riesgo: las contraseñas se almacenan cifradas, la sesión se mantiene con cookies que el navegador no expone a JavaScript y la comunicación con el servidor viaja cifrada.',
      'Ningún sistema es infalible, así que te recomendamos usar una contraseña única y no compartir tus credenciales con nadie.',
    ],
  },
  {
    titulo: 'Menores de edad',
    parrafos: [
      'El servicio no está dirigido a menores de 14 años, edad mínima que fija la normativa española para consentir el tratamiento de sus propios datos. Si detectamos una cuenta de un menor de esa edad, la eliminaremos.',
    ],
  },
  {
    titulo: 'Cambios en esta política',
    parrafos: [
      'Podemos actualizar esta política para adaptarla a cambios legales o del servicio. La fecha de la última actualización figura al principio de la página y, si los cambios son sustanciales, te avisaremos por correo electrónico.',
    ],
  },
]

export default function PoliticaPrivacidad() {
  return (
    <PaginaLegal
      titulo="Política de"
      tituloAcento="privacidad"
      descripcion="Qué datos tratamos, para qué los usamos y cómo puedes controlarlos."
      actualizado="1 de septiembre de 2026"
      secciones={SECCIONES}
    />
  )
}
