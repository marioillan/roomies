# Info para mockups — Housie

Extracción de información visual/funcional de cada vista principal del frontend, pensada como base para crear mockups precisos en la memoria del TFG.

---

## Home

**Elementos principales:**
- Header sticky con logo "Housie" y navegación adaptativa a la derecha (login/registro o iconos de usuario).
- Sección hero a pantalla completa con fondo degradado oscuro (slate→emerald), título grande, buscador de ciudad (autocompletado Google Places) y badges de confianza ("Sin cuotas", "Registro en 30 segundos", "Disponible en España").
- Imagen ilustrativa con 3 tarjetas flotantes decorativas (tarea completada, factura pagada, compañeros compatibles) — solo desktop.
- Sección "Cómo funciona": 3 pasos en stepper horizontal (desktop) / vertical (mobile) con icono, número y descripción; el paso 3 destacado en emerald.
- Sección "La plataforma": grid de 6 funcionalidades (buscar habitación, perfiles compatibilidad, chat, tareas/eventos, gastos, lista de la compra) con icono + texto.
- Sección CTA final: tarjeta con borde grueso, contenido dinámico según estado del usuario.
- Footer oscuro con enlaces (Buscar habitación, Mi grupo, FAQ, Contacto).
- Modales de Login/Registro superpuestos.

**Datos que muestra:**
- Estado de sesión y si tiene grupo (para adaptar CTA y header).
- Foto de perfil o inicial del nombre.

**Acciones disponibles:**
- Sin sesión: abrir modal login/registro, buscar ciudad → `/buscar`.
- Con sesión, sin grupo: introducir código de 6 caracteres para unirse a un grupo, o navegar a `/creacion-grupo`.
- Con sesión, con grupo (no casero): navegar a `/grupo`.
- Casero: botón directo a `/casero/facturas` en header y CTA.
- Iconos de favoritos/mensajes visibles solo si tiene sesión y no tiene grupo aún.

**Diferencias por rol:**
- No registrado: ve login/registro y CTA genérico.
- Registrado sin grupo: ve buscador de código + botón "Crear mi grupo".
- Registrado con grupo (miembro): ve icono "Mi grupo" en el header, CTA distinto.
- Casero: CTA y header muestran "Gestión de facturas" en vez de las opciones de piso/favoritos.

**Navegación:**
- Es la ruta raíz `/`. Desde aquí se navega a `/buscar`, `/creacion-grupo`, `/acceso-grupo`, `/perfil/usuario`, `/perfil/favoritos`, `/perfil/chat`, `/grupo`, `/casero/facturas`, `/faq`. No tiene "vuelta" porque es la entrada.

---

## BuscarPage

**Elementos principales:**
- Header sticky con logo, input de ciudad (Google Places) centrado, botón de filtros (mobile) y navegación de usuario.
- Aside de filtros verde esmeralda (`bg-emerald-600`), fijo en desktop / drawer deslizante en mobile: precio min/max, habitaciones libres (chips 1-4+), tipo de vivienda (radio-like), características (chips toggle: wifi, amueblado, parking, mascotas, lavadora, A/C, calefacción, ascensor, se puede fumar), género preferido, intereses del grupo por categoría, botón "Aplicar filtros".
- Barra de resumen de resultados + selector de orden (compatibles/recientes/precio asc/desc).
- Banner de invitación a registrarse si no hay perfil de convivencia.
- Lista vertical de `PublicacionCard`: carrusel de fotos con botón favorito, título, precio, ciudad, descripción, avatar+nombre del grupo, badge de compatibilidad (%), chips de intereses en común, botones "Llamar" / "Contactar".
- Paginación numérica con flechas.

**Datos que muestra:**
- Listado de publicaciones con fotos, precio, ciudad, descripción, grupo, compatibilidad (si logueado y con perfil), intereses en común, teléfono de contacto opcional.
- Contador total de resultados y número de filtros activos.

**Acciones disponibles:**
- Buscar por ciudad (autocompletado), aplicar/limpiar filtros, ordenar resultados.
- Marcar/desmarcar favorito (requiere sesión, si no redirige a `/`).
- Contactar (crea solicitud de chat) o llamar directamente.
- Paginar resultados.
- Registrarse desde el banner de compatibilidad.

**Diferencias por rol:**
- Sin sesión: no puede marcar favoritos ni contactar (redirige a inicio); ve botón "Iniciar sesión".
- Con sesión sin grupo: ve iconos de favoritos/mensajes en header.
- Con sesión con grupo: ve icono "Mi grupo" en vez de favoritos/mensajes.
- Casero: ve botón "Mis facturas" en vez de favoritos/mensajes.
- Orden "Más compatibles" deshabilitado si no tiene perfil de convivencia completo.

**Navegación:**
- Accesible desde Home (buscador), footer, o enlaces directos con query params (ciudad, filtros).
- Cada card navega a `/anuncio/:id` (con estado de la búsqueda para el botón "Volver").
- Header permite ir a `/`, `/perfil/usuario`, `/perfil/favoritos`, `/perfil/chat`, `/grupo`, `/casero/facturas`.

---

## AnuncioPublico

**Elementos principales:**
- Header público (igual patrón que BuscarPage) con buscador de ciudad.
- Botón "Volver a la búsqueda" que preserva la query anterior.
- Galería principal con miniaturas (hasta 4 + contador "+N"), flechas de navegación.
- Cabecera con título, dirección, chips (habitaciones libres, habitaciones totales, tamaño, planta, tipo de piso, género preferido).
- Secciones: Descripción, Comodidades (grid de iconos), Normas de la casa, Mapa embed de Google Maps.
- Columna derecha sticky: botones Guardar (con desplegable "ver favoritos"/"quitar") y Compartir (copia URL), `CardContacto` (precio, grupo publicante, botón enviar mensaje / llamar / "ya perteneces al grupo"), `CardCompaneros` (donut de compatibilidad, desglose "coincidís/parecido/diferente", avatares solapados de miembros, botón "Ver perfil de convivencia").

**Datos que muestra:**
- Todos los datos de la publicación, fotos, comodidades, normas, ubicación, precio, miembros del grupo, compatibilidad calculada (score + desglose por dimensión: horario, ambiente, visitas, fiestas, ocupación, limpieza, ruido).

**Acciones disponibles:**
- Guardar/quitar de favoritos, compartir enlace, enviar solicitud de contacto o llamar, ver perfil de convivencia del grupo (`/anuncio/:id/convivencia`), ver mapa.

**Diferencias por rol:**
- Sin sesión: botón contacto pide iniciar sesión; no puede guardar en favoritos.
- Usuario ya perteneciente al grupo (`perteneceAlGrupo`): botón de favorito deshabilitado ("Ya eres miembro"), botón de contacto reemplazado por "Ya perteneces a este grupo", sin teléfono visible.
- Usuario sin perfil de convivencia: tarjeta de compatibilidad muestra mensaje invitando a completarlo, sin score.
- Grupo sin perfil de convivencia: mensaje "no es posible calcular la compatibilidad".

**Navegación:**
- Se llega desde `BuscarPage`, `Favoritos`, o enlace directo compartido.
- Volver regresa a `/buscar` con los filtros previos. Enlaces internos a `/anuncio/:id/convivencia`, `/perfil/favoritos`, `/perfil/chat`, `/perfil/usuario`, `/grupo`.

---

## Favoritos

**Elementos principales:**
- Cabecera con contador de publicaciones guardadas y chips de orden (Todos / Más baratos / Más caros).
- Estado vacío ilustrado con icono de corazón y CTA "Buscar habitaciones".
- Lista vertical de `FavCard`: foto, botón quitar favorito, título, ciudad, tipo de piso, precio, tags (amueblado/wifi/parking/mascotas), compatibilidad y en-común, avatar+nombre de grupo, "Guardado hace X", botones de contacto (mensaje/llamar según `modo_contacto`).

**Datos que muestra:**
- Publicaciones favoritas del usuario con toda su metainformación de búsqueda, tiempo relativo desde que se guardó.

**Acciones disponibles:**
- Quitar de favoritos, ordenar por precio, contactar (crea solicitud) o llamar, navegar al detalle del anuncio.

**Diferencias por rol:**
- Vista exclusiva de usuario logueado sin grupo (ruta `/perfil/favoritos` dentro de `LayoutPerfil`); no aplica a caseros ni miembros de grupo.

**Navegación:**
- Accesible desde el icono de corazón en headers (Home, BuscarPage, AnuncioPublico, perfiles públicos) y desde el sidebar de `LayoutPerfil`.
- Cada card navega a `/anuncio/:id`.

---

## Chat

**Elementos principales:**
- Layout de dos paneles tipo email: lista de conversaciones a la izquierda (avatar, nombre, hora, último mensaje o estado "Pendiente"), panel de conversación a la derecha.
- En mobile, toggle entre panel lista y panel conversación (`mostrandoConversacion`), con botón "volver" (flecha).
- Panel conversación: cabecera con avatar, nombre (clickable → perfil público si es admin), botón cerrar chat; historial de mensajes con burbujas (propio a la derecha en emerald, ajeno a la izquierda), separadores de día; composer con input + botón enviar.
- Panel de solicitud pendiente (`DetalleSolicitud`, solo admin): avatar, nombre, email, fecha, botones Aceptar/Rechazar.
- `ModalCerrarChat`: confirmación antes de borrar la conversación.

**Datos que muestra:**
- Solicitudes pendientes (admin: nombre+email del solicitante; solicitante: nombre del grupo), chats activos con último mensaje y hora, mensajes completos de la conversación seleccionada en tiempo real (Socket.io).

**Acciones disponibles:**
- Aceptar/rechazar solicitud (solo admin) → crea/activa el chat.
- Enviar mensajes en tiempo real.
- Cerrar (eliminar) un chat con confirmación.
- Navegar al perfil público del solicitante (solo admin, desde la cabecera del chat).

**Diferencias por rol:**
- Modo admin (`/grupo/mensajes`): ve solicitudes recibidas + chats donde es admin del grupo; puede aceptar/rechazar.
- Modo solicitante (`/perfil/chat`): ve sus propias solicitudes pendientes (no clickables) y chats donde contactó a un grupo; no ve botón de aceptar/rechazar.

**Navegación:**
- `/perfil/chat` dentro de `LayoutPerfil`; `/grupo/mensajes` dentro de `LayoutGrupo` (solo visible si `esAdmin && !esCasero`).
- Se accede desde icono de mensajes en headers públicos, o desde `Publicacion.jsx` ("Mensajes" con badge de nº de chats).

---

## PerfilUsuario

**Elementos principales:**
- Cabecera con título "Mi perfil" y botones "Compartir" / "Editar perfil".
- Hero card: carrusel de 3 fotos (perfil + 2 extra) a la izquierda, identidad (nombre+edad, chips género/país, "sobre mí") a la derecha.
- Grid de 2 tarjetas: "Datos personales" (email, género, país, edad en filas) y tarjeta oscura de "Estilo de vida" + "Intereses" (chips).
- Sección "Compatibilidad" con grid 2×3 de `TraitCard` (una por cada dimensión de convivencia: horario, ambiente, visitas, fiestas, limpieza, ruido), o aviso naranja si el perfil de convivencia está vacío.

**Datos que muestra:**
- Datos personales, fotos, perfil de convivencia completo, intereses seleccionados.

**Acciones disponibles:**
- Compartir perfil (Web Share API), editar perfil (`/perfil/usuario/editar`), rellenar perfil de convivencia o añadir intereses si están vacíos.

**Diferencias por rol:**
- Solo lectura del propio usuario (no aplica a caseros directamente, aunque el aviso de "completar perfil" se oculta si `user.es_casero`).

**Navegación:**
- Ruta índice de `LayoutPerfil` (`/perfil/usuario`). Se llega desde header/sidebar en toda la app. Navega a `/perfil/usuario/editar`.

---

## EditarUsuario

**Elementos principales:**
- Formulario standalone de 3 pasos con `StepBar` (barra de progreso con iconos) y banner de color por paso (emerald/blue/violet).
- **Paso 1 — Datos personales:** avatar circular editable, nombre, "sobre mí" (textarea con contador 399 car.), género y país (pill-buttons), fecha de nacimiento (3 selects día/mes/año), selector de intereses por categoría, subida de 2 fotos obligatorias adicionales (drag&drop + grid de miniaturas).
- **Paso 2 — Tu perfil (convivencia):** pill-buttons para ocupación, horario, ambiente, visitas, limpieza, ruido, fiestas, salidas nocturnas; `BoolPillGroup` para fumador/mascotas.
- **Paso 3 — Filtros de convivencia (preferencias de compañero):** mismos campos pero para lo que se busca en un compañero, cada uno con `ImportanciaToggle` (Preferente/Obligatorio) que aparece al seleccionar un valor.
- Botones "Anterior"/"Siguiente"/"Guardar perfil", banners de error.

**Datos que muestra:**
- Datos actuales del usuario, perfil de convivencia, preferencias de compañero e intereses, precargados vía `reset()`.

**Acciones disponibles:**
- Editar todos los campos anteriores, subir/cambiar foto de perfil y fotos adicionales, marcar preferencias como obligatorias u opcionales, guardar (llama a 3 endpoints en paralelo: perfil, intereses, preferencias).

**Diferencias por rol:**
- Ninguna — es la misma pantalla para todos los usuarios registrados (no aplica a caseros de forma diferenciada en este componente).

**Navegación:**
- Se llega desde `PerfilUsuario` ("Editar perfil"), desde el registro (redirección automática tras crear cuenta), o desde avisos de perfil incompleto en `BuscarPage`/`AnuncioPublico`. Botón "Volver" regresa a `/perfil/usuario`. Al guardar, navega a `/perfil/usuario`.

---

## AccesoGrupo

**Elementos principales:**
- Cabecera sticky con botón "Volver" a `/`.
- Tarjeta "Unirse con código": input de 6 caracteres en mayúsculas con tracking amplio, botón "Unirse al grupo".
- Separador "o".
- Tarjeta "Crear un grupo nuevo": botón que navega a `/creacion-grupo`.
- Estado de éxito tras unirse: tarjeta de confirmación con icono, mensaje distinto si es casero o miembro, botón para ir al dashboard/publicación y botón "Volver al inicio".

**Datos que muestra:**
- Nombre del grupo al que se ha unido tras el éxito.

**Acciones disponibles:**
- Introducir código de acceso (miembro) o de casero para unirse, crear grupo nuevo.

**Diferencias por rol:**
- Si el código es de casero, el mensaje de éxito y el CTA cambian ("Acceso concedido" → "Ver publicación del grupo" en vez de "Ir al dashboard").
- Redirige automáticamente a `/grupo` si el usuario ya pertenece a un grupo (gateway page).

**Navegación:**
- Se llega desde el footer de Home ("Mi grupo") o cuando un usuario logueado sin grupo intenta acceder a rutas de grupo. Navega a `/creacion-grupo`, `/grupo`, `/grupo/publicacion`, o `/`.

---

## CreacionGrupo

**Elementos principales:**
- Cabecera sticky con "Volver" a `/`.
- Formulario: nombre del grupo (input con icono), día de limpieza semanal (chips de los 7 días, opcional).
- Estado de éxito: tarjeta con código de acceso generado en grande (tracking amplio), botón "Copiar código", botones "Ir al dashboard del grupo" / "Volver al inicio".

**Datos que muestra:**
- Código de acceso de 6 caracteres generado tras crear el grupo.

**Acciones disponibles:**
- Crear el grupo (nombre + día de limpieza opcional), copiar el código generado.

**Diferencias por rol:**
- Ninguna explícita; redirige a `/grupo` si el usuario ya pertenece a uno.

**Navegación:**
- Se llega desde `AccesoGrupo` o desde el CTA de Home ("Crear mi grupo"). Tras crear, navega a `/grupo`.

---

## GrupoDashboard

**Elementos principales:**
- Saludo dinámico ("Buenos días/tardes/noches, {nombre}") + badge "Administrador" si aplica.
- Bento grid responsive (1→2→4 columnas):
  - `TareasCard` (oscura, ocupa 2 cols): mensaje sobre el día de limpieza, contador de tareas hechas/total, donut de progreso.
  - `FacturaCard`: próximo pago pendiente al casero, o estado "Todo al día" si no hay pendientes.
  - `AvisoCard`: próximo evento destacado (o "Sin eventos próximos").
  - `AgendaCard` (2 cols): lista de próximos eventos, botón "Nuevo evento", banner para conectar Google Calendar si no está conectado.
  - `ListaCompraCard`: nº de artículos pendientes por categoría con barras de progreso.
  - `HistoricoCard`: gráfico de barras (Recharts) del gasto mensual + variación vs mes anterior.
- Modal de creación de evento (`ModalEvento`).

**Datos que muestra:**
- Estado de tareas de la semana, próxima factura pendiente del usuario, próximo evento, agenda completa, lista de la compra por categoría, histórico de gastos (6 meses).

**Acciones disponibles:**
- Navegar a cada módulo (tareas, facturas, calendario, compra) mediante flechas/enlaces, crear evento nuevo, conectar Google Calendar.

**Diferencias por rol:**
- Solo visible para miembros/admin de grupo (no caseros — el `LayoutGrupo` redirige a los caseros a `/casero/facturas`).
- Badge "Administrador" (amber, con icono Crown) solo si `esAdmin`.

**Navegación:**
- Ruta índice de `LayoutGrupo` (`/grupo`). Navega a `/grupo/tareas`, `/grupo/calendario`, `/grupo/facturas`, `/grupo/compra`.

---

## Tareas

**Elementos principales:**
- Vista "no configurada": icono, mensaje distinto para admin/no-admin, botón "Inicializar zonas" (solo admin).
- Hero grid: tarjeta oscura "Esta semana te toca" (icono de zona, nombre de zona asignada, botón marcar hecha/deshacer, fecha límite) + tarjeta "Cómo funciona la rotación" (explicación + barra de progreso).
- Tabla "Quién limpia qué": fila por miembro con avatar, zona actual, estado (pill), zona de la próxima semana; fila del usuario resaltada en rosa.
- Sección "Espacios en rotación": chips de zonas con icono y color, botón eliminar (solo zonas no predefinidas, solo admin), botón "Añadir zona" (solo admin).
- `ModalAñadirZona` y `ModalConfirmarEliminar` (zona).

**Datos que muestra:**
- Zona asignada al usuario, estado (pendiente/completada), progreso semanal, tabla completa de asignaciones, lista de zonas configuradas.

**Acciones disponibles:**
- Marcar/desmarcar la propia tarea como hecha.
- Admin: inicializar zonas predefinidas, añadir zona personalizada, eliminar zona no predefinida.

**Diferencias por rol:**
- Solo admin puede inicializar, añadir o eliminar zonas; el resto solo puede alternar el estado de su propia asignación.
- Caseros no aparecen en la tabla de miembros (excluidos de la rotación).

**Navegación:**
- `/grupo/tareas` dentro de `LayoutGrupo`. Se accede desde `GrupoDashboard` (TareasCard) o sidebar/bottom-nav.

---

## Facturas (vista casero — componente `Gastos`)

**Elementos principales:**
- Header con logo, nombre y rol ("Casero") del usuario, botón logout.
- `SelectorGrupo`: chips de los pisos del casero (dirección, nº inquilinos) + formulario inline para vincular un nuevo grupo con código.
- Cabecera con fecha actual y título "Tus facturas".
- 3 tarjetas resumen: "Por cobrar este mes" (oscura), "Cobrado este mes" (verde), "Subir nueva factura" (botón CTA).
- Tabla historial de facturas con filtros (Todas/Pendientes/Pagadas): icono tipo, concepto, fecha subida, fecha vencimiento, monto, estado, menú de acciones (ver pagos, editar, ver documento, marcar pagada, eliminar).
- Fila expandible "Ver pagos" (solo casero): lista de inquilinos con avatar, importe asignado individual y botón toggle pagado/pendiente; cabecera indica si la división es equitativa o personalizada.
- `ModalNuevaFactura` / `ModalEditarFactura`: tipo (chips), importe total, selector de división (Equitativo/Personalizado) con desglose por inquilino y validación de suma en tiempo real, fechas, descripción, adjunto PDF/imagen.

**Datos que muestra:**
- Todas las facturas del grupo activo con su desglose de pagos por inquilino, importe asignado, estado de pago, documento adjunto.

**Acciones disponibles:**
- Crear/editar/eliminar factura (eliminar bloqueado si algún pago está confirmado), marcar factura completa como pagada/no pagada, confirmar pago individual de un inquilino, cambiar entre pisos (multi-grupo), vincular nuevo grupo con código de casero.

**Diferencias por rol:**
- Exclusiva del rol casero (`es_casero`). Ve todos los pagos de todos los inquilinos; puede confirmar pagos ajenos.

**Navegación:**
- Ruta standalone `/casero/facturas` (fuera de `LayoutGrupo`). Se llega desde Home/BuscarPage (botón "Gestión de facturas"/"Mis facturas") o tras unirse con código de casero.

---

## MisFacturas

**Elementos principales:**
- Cabecera con título "Mis facturas" y tarjeta de "Deuda pendiente" si aplica.
- Tabla historial (filtros Todas/Pendientes/Pagadas): icono tipo, concepto, fecha de pago si aplica, emisión, vencimiento, importe asignado al usuario, estado, menú "ver documento".
- `HistorialGastos`: gráfico de área (Recharts) del importe pagado mes a mes, comparación con mes anterior, leyenda.

**Datos que muestra:**
- Solo las facturas/pagos que corresponden al usuario logueado (su `importe_asignado` individual, no el total de la factura).

**Acciones disponibles:**
- Filtrar por estado, ver documento adjunto de una factura. (El pago en sí lo confirma el casero, no el inquilino).

**Diferencias por rol:**
- Exclusiva de inquilinos (no caseros). Solo ve su propio pago, no los de los demás miembros.

**Navegación:**
- `/grupo/facturas` dentro de `LayoutGrupo`. Se accede desde `GrupoDashboard` (FacturaCard) o sidebar/bottom-nav.

---

## Calendario

**Elementos principales:**
- Cabecera con nombre del mes/año, navegación (anterior/hoy/siguiente), botón "Nuevo evento".
- Grid mensual (7 columnas): celdas con día, hasta 2 eventos visibles (con color) + "+N", resaltado si es hoy o día de limpieza; leyenda de colores debajo.
- Sidebar: tarjeta "Hoy" (eventos de hoy + aviso de limpieza), tarjeta "Próximos" (hasta 6 eventos futuros con fecha, hora, creador, botones editar/eliminar si el usuario es el creador).
- `ModalEvento` (crear/editar) y `ModalConfirmarEliminar`.

**Datos que muestra:**
- Todos los eventos del grupo, día de limpieza semanal configurado.

**Acciones disponibles:**
- Navegar entre meses, crear evento, editar/eliminar evento propio, ver eventos de un día.

**Diferencias por rol:**
- Editar/eliminar un evento solo disponible si `ev.creado_por_id === user.id` (no depende de ser admin, sino de ser el creador).

**Navegación:**
- `/grupo/calendario` dentro de `LayoutGrupo`. Se accede desde `GrupoDashboard` (AgendaCard → "Calendario →") o sidebar/bottom-nav.

---

## ListaCompra

**Elementos principales:**
- Cabecera con título y contador de pendientes.
- Formulario de añadir producto: input de nombre + selector de categoría (comida/hogar/limpieza/otros) + botón añadir, todo en una fila.
- Tarjeta con filtros (Pendientes/Comprados/Todos) y lista de productos: checkbox de comprado, punto de color por categoría, nombre, categoría, "Añadido por"/"Comprado por", botones editar (inline: nombre + categoría) y eliminar.

**Datos que muestra:**
- Productos del grupo con su categoría, estado (comprado/pendiente), quién lo añadió o compró.

**Acciones disponibles:**
- Añadir producto, marcar/desmarcar como comprado, editar nombre/categoría inline, eliminar producto, filtrar por estado.

**Diferencias por rol:**
- Ninguna — todos los miembros tienen las mismas acciones (no hay restricción de admin).

**Navegación:**
- `/grupo/compra` dentro de `LayoutGrupo`. Se accede desde `GrupoDashboard` (ListaCompraCard) o sidebar/bottom-nav.

---

## Publicacion

**Elementos principales:**
- Estado "sin anuncio": tarjeta centrada con icono, mensaje y botón "Crear anuncio" (deshabilitado si no es admin).
- Estado "con anuncio": cabecera con badge de visibilidad; grid 2 columnas:
  - Izquierda: `Carrusel` de fotos con badge público/no visible, tarjeta de información (título, ciudad, precio, hab. libres, tamaño).
  - Derecha (sticky, solo admin): tarjeta "Visibilidad" con toggle Publicado/No visible, tarjeta "Acciones" (ver anuncio público, editar, mensajes con badge de nº chats, eliminar en rojo).
- `ModalConfirmarVisible` y `ModalEliminar`.

**Datos que muestra:**
- Datos completos de la publicación del grupo, fotos, estado de visibilidad, nº de chats de solicitudes.

**Acciones disponibles:**
- Ver el anuncio público (nueva pestaña), editar (solo admin), cambiar visibilidad (solo admin, con confirmación), eliminar (solo admin, con confirmación), ir a mensajes.

**Diferencias por rol:**
- Solo el admin ve el toggle de visibilidad y los botones editar/mensajes/eliminar; el resto de miembros solo ve la información y el botón "Ver anuncio público".

**Navegación:**
- `/grupo/publicacion` dentro de `LayoutGrupo`. Navega a `/grupo/publicacion/formulario` (crear/editar), `/anuncio/:id` (nueva pestaña), `/grupo/mensajes`.

---

## PublicacionFormulario

**Elementos principales:**
- Formulario standalone de 3 pasos con `StepBar`.
- **Paso 1 — Información general:** título, descripción (contador 500 car., aviso sobre contenido discriminatorio), ciudad + dirección (Google Places Autocomplete), precio, habitaciones disponibles, modo de contacto (Chat/Teléfono/Ambos como tarjetas seleccionables), teléfono si aplica, selector Publicado/Borrador.
- **Paso 2 — Detalles:** tipo de vivienda (pills), habitaciones totales, tamaño, planta, ascensor (Sí/No), grid de 8 comodidades (iconos toggle), restricciones (fuma/mascotas Sí-No), género preferido para solicitar.
- **Paso 3 — Fotos:** grid de miniaturas (existentes + nuevas, máx. 10), primera marcada como "Portada", drag&drop para subir, eliminar individual.

**Datos que muestra:**
- Datos precargados de la publicación existente (si edita) o formulario vacío (si crea).

**Acciones disponibles:**
- Rellenar/editar todos los campos, subir/eliminar fotos, guardar (PUT datos + PUT fotos en pasos separados), publicar o guardar como borrador.

**Diferencias por rol:**
- Implícitamente solo accesible para el admin del grupo (enlazado desde `Publicacion.jsx` que oculta el botón editar a no-admins).

**Navegación:**
- Ruta standalone `/grupo/publicacion/formulario`. Se llega desde `Publicacion.jsx` ("Crear anuncio" / "Editar anuncio"). Al guardar, navega a `/grupo/publicacion`.

---

## GrupoPerfil

**Elementos principales:**
- Cabecera con título "Mi grupo" y botones: "Invitar miembro" (copia código), "Código casero" (solo admin), "Editar grupo" (solo admin), "Salir del grupo" (no caseros).
- Modales de confirmación: salir del grupo, o transferir administración antes de salir (si es admin con otros miembros).
- Hero card: columna de miembros (avatar, nombre clickable a perfil público si no es el propio usuario ni casero, edad, año de incorporación, badge Casero/Residente) + columna de identidad del grupo (nombre, chips ciudad/año conviviendo/buscando compañero, descripción).
- Grid: "Datos del piso" (ubicación, nº miembros, buscando compañero, año conviviendo, visibilidad de publicación) + tarjeta oscura "Estilo de vida" + "Intereses del grupo".
- Sección "Convivencia" con grid 2×3 de `TraitCard`, o aviso si no está rellena (con botón solo para admin).

**Datos que muestra:**
- Miembros del grupo con sus datos, identidad y descripción del grupo, perfil de convivencia del grupo, intereses, estado de la publicación.

**Acciones disponibles:**
- Copiar código de invitación (miembro/casero), editar grupo (solo admin), salir del grupo (con transferencia de admin si aplica), navegar al perfil de un miembro.

**Diferencias por rol:**
- Solo admin ve "Código casero", "Editar grupo" y el botón para rellenar convivencia.
- Casero no puede "Salir del grupo" desde aquí (no se muestra el botón).
- El nombre del casero no es clickable; el de los residentes sí.

**Navegación:**
- `/grupo/perfil` dentro de `LayoutGrupo`. Navega a `/grupo/perfil/editar`, `/usuario/:id`, `/perfil/usuario`, `/acceso-grupo` (al salir).

---

## EditarPerfilGrupo

**Elementos principales:**
- Formulario standalone de 2 pasos con `StepBar`.
- **Paso 1 — Datos del grupo:** foto del grupo editable, nombre, ciudad, descripción (contador 500), día de limpieza semanal (select), "¿Buscáis compañero?" (BoolPillGroup), selector de intereses del grupo por categoría (máx. 20).
- **Paso 2 — Convivencia:** pill-buttons para horario, ambiente, ocupación, limpieza, ruido, LGBTQ+ friendly, visitas, fiestas, salidas nocturnas, se permite fumar, se aceptan mascotas.
- Acceso restringido: mensaje si el usuario no es admin.

**Datos que muestra:**
- Datos actuales del grupo, perfil de convivencia del grupo e intereses, precargados.

**Acciones disponibles:**
- Editar todos los campos anteriores, cambiar foto del grupo, guardar (PUT grupo + PUT intereses + PUT convivencia en paralelo).

**Diferencias por rol:**
- Acceso exclusivo del admin del grupo; cualquier otro rol ve un mensaje de "Acceso restringido" con botón para volver.

**Navegación:**
- Ruta standalone `/grupo/perfil/editar`. Se llega desde `GrupoPerfil` ("Editar grupo"). Al guardar, navega a `/grupo/perfil`.

---

## PerfilPublicoUsuario

**Elementos principales:**
- Header público sticky (logo + iconos condicionales según sesión).
- Botón "Volver" + título "Perfil de usuario".
- Hero card: carrusel vertical de fotos (aspect 3:4) + identidad (nombre+edad, chips género/país, "sobre mí").
- Grid: "Datos personales" (género, país, edad) + tarjeta oscura de estilo de vida + intereses.
- Sección "Compatibilidad" (fondo gris, no blanco) con grid de `TraitCard`, o aviso si no tiene perfil de convivencia.

**Datos que muestra:**
- Datos públicos del usuario consultado (sin datos sensibles como email), su perfil de convivencia e intereses.

**Acciones disponibles:**
- Volver (`navigate(-1)`), navegar a íconos de favoritos/mensajes/perfil propio si hay sesión.

**Diferencias por rol:**
- Accesible sin autenticación (sin `requireAuth` en backend). El header se adapta si hay sesión (con o sin grupo) o no.

**Navegación:**
- Ruta `/usuario/:id`. Se llega desde `GrupoPerfil` y `PerfilPublicoGrupo` (clic en nombre de un residente, nunca del casero) o desde la cabecera de un chat en modo admin.

---

## PerfilPublicoGrupo

**Elementos principales:**
- Header público igual que `PerfilPublicoUsuario`.
- Botón "Volver al anuncio" + título "Perfil del grupo".
- Hero card: columna de miembros (igual patrón que `GrupoPerfil`, con nombres clickables salvo el casero) + columna de identidad del grupo (nombre, chips ciudad/año/buscando compañero, descripción).
- Grid: "Datos del piso" (ubicación, miembros, buscando compañero, año conviviendo, habitaciones libres) + tarjeta oscura de estilo de vida + intereses del grupo.
- Sección "Convivencia" con grid de `TraitCard`, o aviso si no está rellena.

**Datos que muestra:**
- Datos públicos del grupo asociado a una publicación: miembros, identidad, perfil de convivencia, intereses.

**Acciones disponibles:**
- Volver al anuncio, navegar al perfil de un miembro residente, iconos de navegación según sesión.

**Diferencias por rol:**
- Sin autenticación requerida. El casero del grupo no es clickable (solo residentes).

**Navegación:**
- Ruta `/anuncio/:id/convivencia`. Se llega desde `AnuncioPublico` (botón "Ver perfil de convivencia" en `CardCompaneros`). Vuelve a `/anuncio/:id`.
