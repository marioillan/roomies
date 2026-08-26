# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Skills disponibles — revisar SIEMPRE antes de responder

Antes de ejecutar cualquier tarea, comprobar si alguna de estas skills aplica e invocarla con el Skill tool:

- `frontend-design` — construir o mejorar UI (páginas, componentes, layouts, estilos).
- `ui-ux-pro-max` — diseño UI/UX, paletas, tipografía, accesibilidad, patrones visuales.
- `vercel-react-best-practices` — optimización de componentes React/Next.js, data fetching, bundle.
- `web-design-guidelines` — auditoría de UI: accesibilidad, buenas prácticas, revisión de diseño.
- `accessibility` — auditoría WCAG 2.2: navegación por teclado, lectores de pantalla, contraste, ARIA.
- `seo` — meta tags, Open Graph, datos estructurados, sitemap (páginas públicas: Home, FAQ, AnuncioPublico).
- `simplify` — revisar código cambiado en busca de mejoras de calidad y eficiencia.
- `security-review` — revisar cambios en la rama actual en busca de vulnerabilidades.
- `review` — revisar un pull request completo.
- `init` — inicializar o actualizar CLAUDE.md con documentación del código base.
- `update-config` — configurar settings.json, permisos, hooks, variables de entorno.

## Contexto del proyecto

**Housie** — aplicación web de búsqueda de pisos compartidos. Proyecto de Trabajo Final de Grado (TFG) de ingeniería informática. El código debe ser claro, bien estructurado y apropiado para presentar y defender ante un tribunal académico.

## Convenciones de nombrado

- **Variables en español** siempre que sea posible. Términos técnicos sin traducción directa (`socket`, `ref`, `token`, `payload`, `router`, `hook`…) se mantienen en inglés o en forma híbrida (`refSocket`, `tieneGrupo`, `nombreGrupo`).
- Esto aplica a variables locales, estados React (`useState`), funciones de componente, props y parámetros de funciones auxiliares.
- Los nombres de las **tablas y columnas de la BD** ya están en español; mantenerlos así.
- Los **endpoints de la API** (`/api/grupos`, `/api/chats`…) también están en español; mantenerlos así.
- **Ficheros JSX de páginas:** todos en **PascalCase** — `PerfilUsuario.jsx`, `EditarUsuario.jsx`, `GrupoDashboard.jsx`, `Facturas.jsx`, `MisFacturas.jsx`, etc. No usar kebab-case ni camelCase para nombres de fichero de página.

## Commands

### Backend (`/backend`)
```bash
npm run dev      # nodemon — hot reload en desarrollo
npm start        # node — producción
```

### Frontend (`/frontend`)
```bash
npm run dev      # Vite dev server (puerto 5173)
npm run build    # Build de producción
npm run lint     # ESLint
npm run preview  # Preview del build
```

Ambos servicios deben correr simultáneamente. El frontend llama al backend en `http://localhost:3000`.

## Arquitectura

Monorepo con dos carpetas independientes: `backend/` y `frontend/`. Sin workspace compartido — cada una tiene su propio `package.json` y `node_modules`.

### Backend — Express + PostgreSQL + Socket.io

- **Entrada:** `backend/index.js` — configura Express, CORS, cookie-parser, Socket.io y monta las rutas.
- **Socket.io:** El servidor HTTP envuelve Express. La autenticación de sockets se hace leyendo la cookie `token` (JWT) en el middleware de `io.use`. Las rutas pueden emitir eventos con `req.app.get('io')`. Eventos implementados: `join_chat`, `leave_chat`, `nuevo_mensaje`.
- **Estructura MVC:**
  - `backend/routes/` — solo definición de rutas y wiring de middleware (`requireAuth`, `upload`). Sin lógica de negocio. Cada fichero es un router montado en `/api/<nombre>`:
    - `auth.js` → `/api/auth` (registro, login, me, logout, google OAuth, google Calendar OAuth)
    - `perfil.js` → `/api/perfil` (editar datos, foto, perfil de convivencia, perfil público, intereses de usuario)
    - `grupos.js` → `/api/grupos` (crear, editar, mi-grupo, mis-grupos, convivencia, publicación, foto, unirse, eventos, intereses)
    - `publicaciones.js` → `/api/publicaciones`
    - `favoritos.js` → `/api/favoritos`
    - `chats.js` → `/api/chats` (solicitudes, mensajes, Socket.io)
    - `compra.js` → `/api/compra` (lista de la compra del grupo)
    - `tareas.js` → `/api/tareas` (rotación semanal de limpieza por zonas)
    - `facturas.js` → `/api/facturas` (gestión de facturas del grupo)
  - `backend/controllers/` — lógica de negocio y queries Prisma. Un fichero por router: `authController.js`, `perfilController.js`, `gruposController.js`, `publicacionesController.js`, `chatsController.js`, `favoritosController.js`, `compraController.js`, `tareasController.js`, `facturasController.js`. La instancia `upload` de Multer se exporta desde el controlador correspondiente y se usa como middleware inline en el fichero de rutas.
  - `backend/validators/` — schemas Zod y constantes de validación. Un fichero por router excepto `favoritos` (sin validación propia). Algunos solo exportan constantes: `publicacionesValidator.js` exporta `TIPOS_VALIDOS`, `GENEROS_VALIDOS`, `ORDENES_VALIDOS`; `chatsValidator.js` exporta `ACCIONES_SOLICITUD_VALIDAS`.
- **Base de datos:** `backend/src/config/db.js` exporta `pool` (pg, legacy) y `prisma` (PrismaClient). Los controladores usan **Prisma** para todas las queries.
- **Subida de imágenes:** Multer (memoria) → Cloudinary. Config en `backend/src/config/cloudinary.js`.
- **Autenticación:** par de cookies `httpOnly` — `token` (JWT access, TTL 15 min, verificado por `requireAuth`) y `refresh_token` (UUID opaco, TTL 30 días, almacenado en la tabla `refresh_tokens`). `setAuthCookies(res, userId)` en `authController.js` crea la fila de `RefreshToken` y fija ambas cookies (login, registro, callback Google). `POST /api/auth/refresh` rota el refresh token (borra la fila vieja + crea una nueva en una `$transaction`) y reemite ambas cookies; si el refresh token no existe o expiró, limpia cookies y devuelve 401. `logout` borra también la fila de `refresh_tokens`. Middleware centralizado en `backend/src/middleware/auth.js` — exporta `requireAuth`, que solo comprueba `token` (no conoce el refresh). Todas las rutas protegidas lo importan y usan como middleware; el `userId` queda en `req.userId`.
- **Validación:** Zod. Schemas centralizados en `backend/validators/`. Cada controlador importa solo sus schemas. Validación siempre antes de tocar la BD.
- **IDs:** `randomUUID()` de Node `crypto` (nativo, no uuid package).
- **Emails:** `backend/src/config/email.js` — nodemailer con Gmail. Patrón fire-and-forget (`.then().catch(() => {})`); nunca bloquean la respuesta HTTP. Si `EMAIL_USER`/`EMAIL_PASS` no están en `.env`, se silencia sin error. Plantillas exportadas: `emailSolicitudEnviadaUsuario`, `emailSolicitudRecibidaAdmin`, `emailSolicitudAceptada`, `emailSolicitudRechazada`, `emailPublicacionConfirmada`.

### Frontend — React + Vite + Tailwind

- **Entrada:** `frontend/src/main.jsx` → `App.jsx`.
- **Estado global:** `AuthContext` (`frontend/src/context/AuthContext.jsx`) es la fuente de verdad para `user`, `tieneGrupo` y `cargando`. Exporta `{ user, setUser, tieneGrupo, setTieneGrupo, recargarUsuario, cargando }`. `cargando` empieza en `true` y pasa a `false` cuando la llamada inicial a `/api/auth/me` termina — úsalo para evitar race conditions al decidir si hay sesión (ej. `if (cargando) return` al inicio de efectos que dependan de `user`). Páginas públicas con header propio usan `const { user, tieneGrupo } = useAuth()`. `recargarUsuario` llama a `/api/auth/me`; si devuelve 401, hace `POST /api/auth/refresh` y reintenta `/api/auth/me` una vez antes de dar por no autenticado (ver refresh token en la sección de backend). Tras un `/me` exitoso, también carga `/api/grupos/mi-grupo` para poblar `tieneGrupo`. **`tieneGrupo` solo se calcula al montar**, así que toda acción que cambie la pertenencia al grupo tiene que actualizarlo a mano: `CreacionGrupo` (`setTieneGrupo(true)` al crear), `Home` (`setTieneGrupo(true)` al unirse con `codigo_casero`) y `GrupoPerfil` (`setTieneGrupo(false)` al salir). Si se olvida, la navegación de `LayoutPerfil` enseña u oculta el acceso "Mi grupo" de forma incorrecta hasta que se recarga la página. Usa `useLocation`/`useNavigate` para forzar la redirección a `/perfil/usuario/editar` cuando `user.perfil_completo === false` y la ruta actual no está en `RUTAS_EXCLUIDAS_PERFIL_INCOMPLETO` (`['/', '/perfil/usuario/editar']`). `perfil_completo` lo calcula `authController.js` (`me`): requiere `sobre_mi, genero, pais, fecha_nacimiento, ocupacion, horario, frecuencia_visitas, ambiente, tolerancia_fiestas, limpieza_orden, nivel_ruido` todos no-nulos, salvo que el usuario sea `es_casero`.
- **Routing:** React Router v7. Layouts anidados por sección.
- **Formularios:** `react-hook-form` + `zodResolver`. Schemas en `frontend/src/lib/schemas.js`.
- **Componentes:** `frontend/src/components/` — `CustomSelect`, `LoginModal`, `RegistroModal`, `DonutChart`, `ui/chart.jsx` (wrapper recharts), `FormPrimitivos.jsx` (primitivos de formulario compartidos).
- **Estilos:** Tailwind v4. Color principal: `emerald`. Sin fichero de config — usa el plugin de Vite directamente.
- **Iconos:** `lucide-react`.

### Rutas React Router v7

```
/                              — Home (frontend/src/pages/Home.jsx — landing page con scroll-reveal, ya no inline en App.jsx)
/faq                           — FAQ (página pública, acordeón de preguntas por categorías, CTAs de login/registro)
/buscar                        — BuscarPage (búsqueda con filtros, ciudad opcional)
/perfil                        — LayoutPerfil (sidebar emerald icon-only w-25, bottom nav en mobile)
  /perfil/usuario              — PerfilUsuario (solo lectura + nav a editar)
  /perfil/favoritos            — Favoritos
  /perfil/chat                 — Chat (modo solicitante — funcional con Socket.io)
/grupo                         — LayoutGrupo (sidebar emerald icon-only w-25, bottom nav en mobile)
  /grupo                       — GrupoDashboard (index)
  /grupo/perfil                — GrupoPerfil (miembros residentes clickables → /usuario/:id; casero no clickable)
  /grupo/publicacion           — Publicacion (vista lectura)
  /grupo/tareas                — Tareas (rotación semanal de limpieza — funcional)
  /grupo/calendario            — Calendario (vista mensual de eventos — funcional)
  /grupo/facturas              — MisFacturas (inquilino: sus facturas y estado de pago)
  /grupo/compra                — ListaCompra (funcional)
  /grupo/mensajes              — Chat (modo admin — funcional con Socket.io)
  /grupo/solicitudes-union     — SolicitudesUnion (admin: aceptar/rechazar solicitudes de unión; sin % de compatibilidad, ver nota abajo)
/casero/facturas               — Gastos (standalone, casero: gestión de facturas de múltiples pisos)
— Rutas standalone (sin layout) —
/grupo/perfil/editar           — EditarPerfilGrupo (2 pasos: datos + convivencia + intereses)
/grupo/publicacion/formulario  — PublicacionFormulario (3 pasos: info + detalles + fotos + visibilidad)
/perfil/usuario/editar         — EditarUsuario (2 pasos: datos + convivencia)
/perfil/convivencia            — PerfilConvivencia (pill-buttons, upsert)
/creacion-grupo                — CreacionGrupo
/anuncio/:id                   — AnuncioPublico (vista pública del anuncio)
/anuncio/:id/convivencia       — PerfilPublicoGrupo (perfil público del grupo — sin auth)
/usuario/:id                   — PerfilPublicoUsuario (perfil público del usuario — sin auth)
```

### API endpoints implementados

```
POST   /api/auth/registro
POST   /api/auth/login
GET    /api/auth/me                              # devuelve también tiene_calendar: bool y perfil_completo: bool
POST   /api/auth/refresh                         # rota refresh_token y reemite ambas cookies (token + refresh_token)
POST   /api/auth/logout                          # borra también la fila de refresh_tokens
POST   /api/auth/google                          # OAuth Google (no guarda foto del payload)
GET    /api/auth/google/calendar                 # Inicia OAuth Google Calendar
GET    /api/auth/google/calendar/callback        # Callback OAuth Calendar — guarda refresh token en usuarios.google_calendar_token

GET    /api/perfil/datos
PUT    /api/perfil/editar
PUT    /api/perfil/foto
PUT    /api/perfil/fotos/:index                  # sube foto extra (0 o 1) → usuarios.foto_1 / foto_2
DELETE /api/perfil/fotos/:index                  # elimina foto extra (0 o 1)
GET    /api/perfil/convivencia
PUT    /api/perfil/convivencia
GET    /api/perfil/publico/:userId               # perfil público del usuario (sin auth) — devuelve { usuario, convivencia, intereses }
GET    /api/perfil/intereses                     # catálogo completo de intereses (sin auth)
GET    /api/perfil/mis-intereses                 # intereses del usuario autenticado
PUT    /api/perfil/intereses                     # reemplaza intereses del usuario (máx 20)
GET    /api/perfil/preferencias                  # preferencias de compañero del usuario autenticado
PUT    /api/perfil/preferencias                  # upsert preferencias de compañero (mismos campos que convivencia)

POST   /api/grupos/crear
PUT    /api/grupos/editar
GET    /api/grupos/mi-grupo                      # acepta ?grupo_id= para caseros con múltiples pisos
GET    /api/grupos/mis-grupos                    # todos los grupos a los que pertenece el usuario (para casero multi-piso)
POST   /api/grupos/unirse                        # codigo_casero: une inmediatamente. codigo_acceso: crea SolicitudUnion PENDIENTE
                                               # (ya NO une directamente) — devuelve { solicitud, message }. Si había una
                                               # RECHAZADA la resetea a PENDIENTE en vez de duplicar (unique [usuario_id, grupo_id])
GET    /api/grupos/convivencia
PUT    /api/grupos/convivencia
GET    /api/grupos/publicacion
PUT    /api/grupos/publicacion                   # envía email de confirmación al admin (fire & forget)
PUT    /api/grupos/foto
PUT    /api/grupos/publicacion/fotos             # subir fotos nuevas
DELETE /api/grupos/publicacion/fotos/:id         # eliminar foto existente
GET    /api/grupos/eventos                       # eventos del grupo — devuelve creado_por_nombre (NO creador_nombre)
POST   /api/grupos/eventos                       # crear evento; sincroniza a todos los miembros con Calendar conectado
PUT    /api/grupos/eventos/:id                   # editar evento (creador o admin)
DELETE /api/grupos/eventos/:id                   # eliminar evento (creador o admin)
GET    /api/grupos/intereses                     # catálogo completo de intereses del grupo (público, sin auth)
GET    /api/grupos/mis-intereses                 # intereses del grupo del usuario autenticado
PUT    /api/grupos/intereses                     # reemplaza intereses del grupo (admin, máx 20)
POST   /api/grupos/transferir-admin              # admin transfiere el rol ADMIN a otro miembro (body: { nuevo_admin_id })
DELETE /api/grupos/salir                         # sale del grupo (body: { grupo_id? }). Si admin con otros miembros, devuelve 400
DELETE /api/grupos/miembros/:usuarioId           # admin elimina un miembro (activo=false, no borra fila). 400 si usuarioId === admin
GET    /api/grupos/solicitudes-union             # admin: solicitudes PENDIENTE con usuario + compatibilidad (0-100) + desglose
                                               # OJO: compatibilidad/desglose ya NO se pintan (ver nota sobre el flujo); el
                                               # frontend solo usa `usuario`. Se mantienen por si se reintroducen
PUT    /api/grupos/solicitudes-union/:id/aceptar # admin: ACEPTADA + crea MiembroGrupo (rol MEMBER)
PUT    /api/grupos/solicitudes-union/:id/rechazar # admin: RECHAZADA

GET    /api/favoritos
GET    /api/favoritos/publicaciones              # devuelve compatibilidad (number|null) e intereses_comunes (string[]) igual que /api/publicaciones
POST   /api/favoritos/:publicacionId

POST   /api/chats/solicitar/:publicacionId       # crea solicitud; si estaba RECHAZADA hace UPDATE en lugar de INSERT; envía emails al usuario y al admin
GET    /api/chats/solicitudes                    # admin: solicitudes recibidas. Devuelve compatibilidad (0-100|null) e
                                               # intereses_comunes (string[]). Usa preferencias_companero con prioridad
                                               # sobre perfil_convivencia y selecciona las 7 dimensiones del algoritmo
PUT    /api/chats/solicitudes/:solicitudId       # admin: aceptar o rechazar; envía email al solicitante (body: { accion: 'ACEPTADA'|'RECHAZADA' })
GET    /api/chats/mis-solicitudes                # solicitante: estado de sus solicitudes (incluye grupo_id)
GET    /api/chats/como-solicitante               # chats donde el usuario fue quien solicitó
GET    /api/chats/como-admin                     # chats donde el usuario es admin; incluye solicitante_id por chat
GET    /api/chats/:chatId/mensajes               # últimos 50 mensajes (ordenados ASC)
POST   /api/chats/:chatId/mensajes               # envía mensaje; emite 'nuevo_mensaje' vía Socket.io
DELETE /api/chats/:chatId                        # cierra y borra chat (cascade solicitud → mensajes)

GET    /api/publicaciones                        # búsqueda paginada con filtros; ciudad es opcional (sin ciudad lista todos)
                                               # Solo devuelve publicaciones con visible=true
                                               # Filtros: ciudad, precio_min, precio_max, habitaciones_min, tipo_piso,
                                               # amueblado, wifi, mascotas, parking, lavadora, aire_acondicionado,
                                               # calefaccion, ascensor, permite_fumar, genero_preferido, ordenar
                                               # Si el usuario tiene sesión: devuelve compatibilidad + intereses_comunes por pub
                                               # ordenar=precio_asc|precio_desc se respeta incluso cuando tieneMatching=true
                                               # Auth opcional: decodifica la cookie 'token' directamente con jwt.verify (no usa requireAuth),
                                               # así los anónimos siguen viendo resultados. Ver algoritmo de matching más abajo.

GET    /api/compra                               # lista de productos del grupo (pendientes primero)
POST   /api/compra                               # añadir producto
PUT    /api/compra/:id                           # editar nombre/categoría
PATCH  /api/compra/:id/comprado                  # toggle comprado/pendiente
DELETE /api/compra/:id                           # eliminar producto

GET    /api/tareas                               # zonas + asignaciones semana actual (auto-crea si nueva semana)
POST   /api/tareas/iniciar                       # admin: crear zonas predefinidas (Cocina, Baño, Salón, Pasillo)
POST   /api/tareas/zonas                         # admin: añadir zona personalizada
DELETE /api/tareas/zonas/:id                     # admin: eliminar zona NO predefinida (predefinidas no se pueden borrar)
PATCH  /api/tareas/turnos/:id/estado             # toggle PENDIENTE ↔ COMPLETADA (solo el asignado)

GET    /api/facturas                             # facturas del grupo (casero: todas con todos los pagos; inquilino: solo su pago por factura). Acepta ?grupo_id=
GET    /api/facturas/historial                   # inquilino: agregado mensual (pagado) de los últimos 12 meses. Acepta ?grupo_id=
POST   /api/facturas                             # casero crea factura (multipart/form-data: campos + campo 'documento' opcional PDF/imagen) → auto-crea pagos equitativos para cada inquilino
PUT    /api/facturas/:id                         # casero edita factura; si cambia importe, recalcula pagos automáticamente
PATCH  /api/facturas/:id/pagada                  # casero toggle: marca/desmarca todos los pagos de la factura
DELETE /api/facturas/:id                         # casero elimina factura (pagos se borran en cascada). Acepta ?grupo_id=
PATCH  /api/facturas/:id/pagos/:usuarioId        # casero confirma/deshace el pago de un inquilino concreto. Acepta ?grupo_id=
```

### Base de datos — PostgreSQL

El schema completo está en `backend/src/config/database.sql`. Los datos de demostración están en `seed.sql` (raíz del repo). Datos de demo para presentación TFG en `seed_demo_convivencia.sql` (raíz del repo). Tablas principales:
- `usuarios` — identidad y datos básicos. Tiene `google_calendar_token` para la integración de Google Calendar. **No tiene columna `username`** (solo `nombre`). El campo `username` en las queries de `mi-grupo` es un alias de `u.nombre`. Campos `foto_1`/`foto_2` (además de `foto_perfil`) — galería de hasta 3 fotos de perfil.
- `refresh_tokens` — tabla `RefreshToken` (Prisma) para el flujo de refresh token (ver Autenticación en Arquitectura): `token` (UUID opaco), `usuario_id`, `expires_at`.
- `preferencias_companero` — lo que el usuario busca en futuros compañeros (1:1 con usuarios, opcional). Mismos campos enum que `perfiles_convivencia_usuario` pero sin genero/pais/fecha_nacimiento/sobre_mi. Incluye `limpieza_orden`/`nivel_ruido` (con sus `_req`). Se usa en el matching de búsqueda con prioridad sobre el perfil propio; los campos con `_req = true` actúan como filtro duro (excluyen resultados) en `GET /api/publicaciones`.
- `perfiles_convivencia_usuario` — preferencias de convivencia (1:1 con usuarios). Incluye `sobre_mi` (NOT NULL en BD) — aunque conceptualmente es un campo de presentación del usuario, se almacena aquí porque se edita junto con los datos de convivencia en `PUT /api/perfil/editar`. Incluye `limpieza_orden` (`limpieza_orden_enum`: `DESPREOCUPADO`/`FLEXIBLE`/`ORDENADO`) y `nivel_ruido` (`nivel_ruido_enum`: `SILENCIO_TOTAL`/`MODERADO`/`INDIFERENTE`), usados en el algoritmo de compatibilidad. **Mínimo 3 campos** del bloque de preferencias requeridos (validado en Zod).
- `perfiles_convivencia_grupo` — misma estructura para grupos (sin `sobre_mi`), incluye también `limpieza_orden`/`nivel_ruido`.
- `grupos` — pisos compartidos con `codigo_acceso` (6 chars, miembros) y `codigo_casero` (6 chars, casero). Campo `dia_limpieza` (`dia_semana_enum`) para el calendario. `descripcion` es NOT NULL en BD pero opcional en el form de creación. Campos `semana_rotacion` (INT, índice de rotación actual) y `rotacion_semana_actual` (DATE, lunes de la semana en curso) para el sistema de tareas.
- `miembros_grupo` — relación N:M usuarios↔grupos con rol (`ADMIN` | `MEMBER`) y flag `es_casero`. El ENUM usa `'MEMBER'` (no `'MIEMBRO'`); el frontend compara solo `=== 'ADMIN'` por lo que no hay bug activo.
- `solicitudes_union` — modelo `SolicitudUnion`, solicitud para unirse a un grupo con `codigo_acceso` (no aplica a `codigo_casero`, que sigue uniendo directo). Reutiliza el enum `EstadoSolicitud` (`PENDIENTE`/`ACEPTADA`/`RECHAZADA`) que ya usaba `solicitudes_contacto`, en vez de duplicarlo. `@@unique([usuario_id, grupo_id])`.
- `publicaciones` — anuncios de habitaciones (1:1 con grupos, UNIQUE constraint en grupo_id). Campo `visible` (boolean): `true` → aparece en búsquedas; `false` → borrador, no aparece. `direccion`, `tipo_piso`, `habitaciones_totales`, `tamano_piso`, `planta` y `ascensor` son **NOT NULL** (obligatorios también en `PublicacionFormulario.jsx` y en `publicacionSchema` de `gruposValidator.js`).
- `fotos_publicacion` — fotos asociadas a publicaciones (url, orden). **No tiene columna `cloudinary_id`.**
- `chats` / `mensajes` / `solicitudes_contacto` — mensajería entre solicitante y admin del grupo. Si una solicitud estaba `RECHAZADA`, el endpoint la resetea a `PENDIENTE` en lugar de crear una nueva.
- `favoritos` — publicaciones guardadas por usuario
- `tareas` — zonas de limpieza del grupo. **Reutilizada como "zonas"**: los registros con `es_recurrente = TRUE` son las zonas de la rotación semanal. No son tareas puntuales.
- `asignaciones_tarea` — asignación zona↔miembro por semana (`semana` DATE = lunes de esa semana). Estados: `PENDIENTE` | `COMPLETADA`.
- `facturas` / `pagos_factura` — sistema de gastos. `tipo_division` siempre `'EQUITATIVA'`. El importe se divide equitativamente entre los inquilinos activos al crear la factura.
- `eventos` — eventos del grupo con soporte de Google Calendar (`google_calendar_event_id`)
- `productos` — lista de la compra por grupo. **No tiene `cantidad` ni `unidad_medida`** (eliminadas). Campos: `id, nombre, categoria, comprado, created_at`. `categoria` (default `'otros'`) se usa en el frontend para agrupar visualmente y colorear (`CATEGORIAS` en `ListaCompra.jsx`).
- `intereses` — catálogo de intereses con `nombre` y `categoria` (SERIAL PK, no UUID). Pre-poblado con intereses en 5 categorías: Deporte y actividad física, Alimentación, Cultura y ocio, Vida social, Bienestar.
- `usuario_intereses` — intereses de usuarios (N:M, PK compuesta `(usuario_id, interes_id)`)
- `grupo_intereses` — intereses de grupos (N:M, PK compuesta, no tiene columna `id`)

ENUMs de PostgreSQL: al modificar valores hay que usar `ALTER TYPE ... RENAME TO old; CREATE TYPE ...; ALTER TABLE ... ALTER COLUMN ... TYPE ... USING ...::text::nuevo_tipo; DROP TYPE old;`. Valores válidos de `horario_enum`: `'MADRUGADOR'`, `'INTERMEDIO'`, `'NOCTURNO'` (no existe `'MATUTINO'`).

**Trampa histórica — datos de catálogo fuera de las migraciones:** el `INSERT INTO intereses` vivía solo en `backend/src/config/database.sql` (fichero de referencia, no se ejecuta nunca solo) y nunca se migró a `backend/prisma/migrations/`. Como producción se aprovisionó vía `prisma migrate deploy` (no ejecutando `database.sql`), el catálogo de intereses llegó a estar vacío en producción durante un tiempo sin que ningún error lo delatara (`GET /api/perfil/intereses` devolvía `200 {"categorias":{}}`). Arreglado en la migración `20260713120344_seed_intereses` (INSERT idempotente, `WHERE NOT EXISTS (SELECT 1 FROM intereses)`). Lección: cualquier dato de catálogo/seed que la app necesite en runtime debe vivir en una migración de Prisma, nunca solo en `database.sql`.

### seed.sql

Fichero en la raíz del repo. Idempotente: todos los bloques tienen `ON CONFLICT ... DO NOTHING`. Incluye:
- 23 usuarios (11 originales + 12 extra para paginación). Todos tienen `perfiles_convivencia_usuario` completo (incl. `limpieza_orden`/`nivel_ruido`).
- 15 grupos → 15 publicaciones (3 originales + 12 extra) → paginación funciona en dos páginas (límite 12/página). Variedad de `parking`/`terraza` en `TRUE` para poder probar esos filtros.
- **40 fotos de Cloudinary** distribuidas entre las 15 publicaciones (IDs prefijo `cl000001-...`). Las 3 publicaciones originales tienen 3 fotos c/u; las 12 extra tienen 2-3 fotos c/u; Granada Albaicín tiene 4.
- `grupo_intereses`/`usuario_intereses`: **referenciados por nombre** vía `(SELECT id FROM intereses WHERE nombre='X')`, nunca por ID numérico — la tabla `intereses` usa SERIAL y su orden cambia cada vez que se añade un interés nuevo al catálogo en `database.sql`/la migración, así que un ID hardcodeado queda desincronizado sin dar error (inserta un interés distinto al pretendido, en silencio).
- Chat activo entre pablo↔grupo Granada, solicitud pendiente isabel↔Barcelona.
- 6 meses de facturas en Granada, 2 meses en Madrid.
- **Requiere que la migración `20260713120344_seed_intereses` ya esté aplicada** (ver más abajo) — si el catálogo de `intereses` está vacío, los `(SELECT id FROM intereses WHERE nombre=...)` devuelven `NULL` y el INSERT falla por la PK compuesta NOT NULL (falla ruidoso, no silencioso).

### seed_demo_convivencia.sql

Fichero en la raíz del repo para demo de presentación TFG. Idempotente. Trabaja sobre el grupo `074301e3-0cb1-4b0f-bd23-d994a0bfc0d8` (Granada Sol), que ya tiene al usuario real `marioiv` (ADMIN) y al casero. Crea:
- 3 inquilinos demo: Javier López, Sofía Ruiz, Ana García.
- 3 solicitantes externos: Laura Sánchez (chat activo), Marcos Vega (chat activo), Elena Torres (solicitud pendiente).
- Zonas de limpieza (DELETEs previos para evitar duplicados), asignaciones semana actual y semana anterior.
- 8 productos en lista de la compra, 5 eventos, 5 facturas.
- 2 chats con 6 mensajes cada uno.

### Perfil de convivencia

Flujo: `PerfilUsuario` → aviso naranja si no relleno → navega a `/perfil/convivencia`. El formulario usa pill-buttons. Hace upsert vía `ON CONFLICT (usuario_id) DO UPDATE`. Campos opcionales individualmente, mínimo 3 requeridos (validado en Zod frontend y backend).

### Algoritmo de compatibilidad (matching)

`backend/src/utils/compatibilidad.js` es la única fuente del cálculo, usada tanto por `publicacionesController.js` como por `favoritosController.js`:
- `calcularCompatibilidad(usuario, pcg)` compara el perfil del usuario (usa `preferencias_companero` si existe, si no cae al `perfiles_convivencia_usuario`) contra el `perfiles_convivencia_grupo` (pcg) del grupo, en 7 dimensiones. Ordinal/enum vía `matchOrdinal` (1.0 si coinciden, 0.5 si son adyacentes en el `ORDEN` del enum, 0.0 si están lejos): `horario` (20%), `limpieza_orden` (20%), `ambiente` (15%), `nivel_ruido` (15%), `frecuencia_visitas` (10%), `tolerancia_fiestas` (10%); `ocupacion` (10%) vía `matchOcupacion` (stub: 0.5 salvo coincidencia exacta). Devuelve `{ score, desglose }` (score 0-100 redondeado; `desglose` no se renderiza actualmente en ningún sitio).
- `calcularScore(usuario, grupoRow)` es un adaptador para resultados de listado donde el SQL devuelve columnas prefijadas `pcg_*`; las remapea y llama a `calcularCompatibilidad`.
- En `GET /api/publicaciones` (`buscarPublicaciones`), si el usuario tiene `preferencias_companero` con campos `_req = true`, esos campos se convierten en **filtros SQL duros** (excluyen grupos que no cumplan, incl. fumadores/mascotas/lgbtq_friendly). Sin `preferencias_companero`, cae a un filtrado blando usando solo `perfiles_convivencia_usuario` (fumador/mascotas/lgbtq). Los resultados se ordenan por `compatibilidad` descendente por defecto.
- `intereses_comunes` se calcula igual en ambos controladores: intersección de los IDs de interés del usuario con los del grupo, devuelta como array de nombres.

### Fotos extra de perfil de usuario

`usuarios.foto_1`/`foto_2` amplían `foto_perfil` a una galería de 3 fotos. `EditarUsuario.jsx` gestiona `fotosSlots` (array de 2, cada slot `null | URL existente | File`) y diffea contra el estado original al enviar, subiendo (`PUT /api/perfil/fotos/:index`) o borrando (`DELETE /api/perfil/fotos/:index`) solo lo que cambió. Las 3 fotos son obligatorias para avanzar del primer paso del wizard. `PerfilUsuario.jsx` y `PerfilPublicoUsuario.jsx` construyen `fotos = [foto_perfil, foto_1, foto_2]` para renderizar la galería.

### Perfil público de usuario (`/usuario/:id`)

- `GET /api/perfil/publico/:userId` — sin auth, devuelve `{ usuario, convivencia, intereses }`. Usa `Promise.all` para la query principal y la de intereses en paralelo.
- `PerfilPublicoUsuario.jsx` — mismo layout que `PerfilUsuario.jsx`: foto 284px + identidad, datos personales + intereses (dark card), donuts de compatibilidad + chips. Misma `DONUTS_CONFIG` que `PerfilUsuario`.
- Acceso: desde `GrupoPerfil` y `PerfilPublicoGrupo` pulsando el nombre de cualquier **residente** (botón con `navigate('/usuario/:id')`). El nombre del **casero no es clickable** en ninguna de las dos vistas.

### Rol casero (`es_casero`)

Un usuario puede unirse con el `codigo_casero` en lugar del `codigo_acceso`. El flag `es_casero = TRUE` se guarda en `miembros_grupo`. Un casero puede pertenecer a múltiples grupos (cada `unirse` añade una fila nueva en `miembros_grupo`).

En `LayoutGrupo`:
- Los caseros ven solo los tabs con `soloCasero: true` (actualmente: publicación y gastos/facturas).
- Si `esCasero` navega a una ruta no permitida, se redirige automáticamente a `/casero/facturas`.
- El botón de mensajes solo aparece cuando `esAdmin && !esCasero`.

La vista de gastos del casero es la ruta standalone `/casero/facturas` (componente `Gastos` en `Facturas.jsx`), que carga todos sus grupos vía `GET /api/grupos/mis-grupos` y permite cambiar entre ellos con `SelectorGrupo`. La vista del inquilino es `/grupo/facturas` (componente `MisFacturas` en `MisFacturas.jsx`), dentro de `LayoutGrupo`.

### Sistema de tareas (rotación de limpieza)

La tabla `tareas` se usa como contenedor de zonas (`es_recurrente = TRUE`). El sistema funciona así:
1. Admin inicializa con `POST /api/tareas/iniciar` → crea las 4 zonas predefinidas y pone `semana_rotacion = 0`.
2. `GET /api/tareas` detecta si es semana nueva (compara `rotacion_semana_actual` con el lunes actual). Si es nueva, avanza `semana_rotacion` y crea asignaciones automáticamente para esa semana.
3. Cada miembro tiene asignada una zona distinta, rotando cada semana. El orden es: `zonas[(miembroIdx + semanaRotacion) % nZonas]`.
4. Caseros están excluidos (`es_casero = FALSE` en la query de miembros).
5. Solo se pueden eliminar zonas **no predefinidas** (`esPredefinida` se calcula en el frontend comparando con `['Cocina','Baño','Salón','Pasillo']`).

## Patrones de diseño establecidos

### Responsive design

La app es completamente responsive con breakpoints Tailwind: `sm` (640px), `md` (768px), `lg` (1024px).

- **Layouts con sidebar:** `LayoutGrupo` y `LayoutPerfil` usan `hidden md:flex` en el sidebar de escritorio y un **bottom nav** fijo emerald (`md:hidden fixed bottom-0 inset-x-0 z-40`) en mobile. El `main` tiene `p-4 sm:p-6 md:p-12 pb-24 md:pb-12` para dejar espacio al bottom nav en mobile.
- **Acceso al perfil dentro del grupo (móvil) — regla:** el bottom nav de `LayoutGrupo` tiene 7 botones y **ninguno lleva al perfil**. En móvil el único acceso está en la **esquina superior derecha de `GrupoDashboard`** (la ruta índice `/grupo`): la foto del usuario, `md:hidden`, con `aria-label='Mi perfil'`. Si el usuario es admin, el avatar lleva `ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-200` y el chip "Administrador" va **debajo** del avatar, no al lado. En escritorio ese avatar se oculta porque el sidebar ya tiene su propio "Mi perfil". **No volver a añadir el avatar al bottom nav**: se quitó a propósito para descargar la barra y porque saltar al perfil no es navegación del grupo.
- **Grids de 2 columnas:** siempre `grid-cols-1 sm:grid-cols-2` (o `lg:grid-cols-4` para el bento). Nunca `grid-cols-2` sin breakpoint.
- **Cards horizontales (BuscarPage, Favoritos):** `flex flex-col sm:flex-row` — foto arriba en mobile, izquierda en desktop.
- **AnuncioPublico:** `grid-cols-1 lg:grid-cols-[1fr_20rem]` — columna única en mobile/tablet, dos columnas en desktop.
- **Chat móvil:** estado `mostrandoConversacion` (boolean) controla qué panel se ve. Panel lista: `hidden sm:flex` cuando `mostrandoConversacion`. Panel conversación: `hidden sm:flex` cuando `!mostrandoConversacion`. El componente `Conversacion` recibe prop `onVolver` y muestra botón `ArrowLeft` solo en mobile (`sm:hidden`).
- **Headers públicos:** `px-4 sm:px-10` en el contenedor del header.
- **Título de página — estándar único:** `font-display text-3xl sm:text-[2.25rem] font-medium text-slate-900 leading-none -tracking-[0.02em]` (el mismo que `PerfilUsuario` "Mi perfil"). Usado en `GrupoPerfil`, `Favoritos`, `Chat`, `PerfilPublicoGrupo`, `PerfilPublicoUsuario`, `Facturas`, `MisFacturas`, `Publicacion` ("Tu anuncio"), `Calendario`, `Tareas`, `ListaCompra`, `SolicitudesUnion`. No usar `text-3xl sm:text-5xl font-bold` (estilo antiguo, ya no queda en ningún sitio) ni tamaños fijos sin variante mobile.
- **Header de `BuscarPage`/`AnuncioPublico`/`PerfilPublicoGrupo`/`PerfilPublicoUsuario` — nav en mobile:** dos variantes coexisten a propósito:
  - `BuscarPage` y `AnuncioPublico`: avatar/iconos/"Iniciar sesión" con `hidden sm:...` — **desaparecen del todo** en mobile para dejar sitio al buscador de ciudad. El logo "Housie" es siempre texto (`font-display text-xl sm:text-2xl font-bold`, nunca imagen — `housienegrologo.png` era un logo cuadrado en 2 líneas que se veía roto al forzarlo a una cabecera fina).
  - `PerfilPublicoGrupo` y `PerfilPublicoUsuario`: nav **siempre visible**, sin `hidden sm:`, logo `text-2xl` fijo (sin variante mobile) — a propósito distinto del resto, por petición explícita.
- **Botón "Volver" — patrón mobile-al-final:** en `PerfilPublicoGrupo`, `PerfilPublicoUsuario` y `AnuncioPublico`, el botón "Volver" de la cabecera es `hidden sm:inline-flex`, y se repite como botón de ancho completo dentro de una card (`sm:hidden bg-white border border-slate-100 rounded-3xl p-4`) al final de la página. No poner el volver arriba visible en mobile en estas 3 páginas — es intencional.
- **`StepBar` (`FormPrimitivos.jsx`) — líneas conectoras de igual ancho:** las líneas entre pasos son hermanas directas de los bloques icono+etiqueta en el mismo flex row (`Fragment`), cada una `flex-1 min-w-0`, NO anidadas dentro del contenedor de cada paso — si van anidadas, el ancho de la etiqueta más larga (p.ej. "Información general" vs "Fotos") empuja visualmente esa línea y las dos dejan de medir igual en mobile.

### Modales de confirmación (sin `window.confirm`)

Nunca usar `window.confirm`. Todas las acciones destructivas usan modales inline con este patrón:
```jsx
function ModalConfirmar({ item, eliminando, onConfirmar, onCancelar }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm' onClick={onCancelar}>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-sm' onClick={e => e.stopPropagation()}>
        {/* cabecera con X, cuerpo con descripción, botones Cancelar + Confirmar (rojo) */}
      </div>
    </div>
  )
}
```
Implementado en: `Tareas.jsx` (eliminar zona), `Calendario.jsx` (eliminar evento), `Chat.jsx` (`ModalCerrarChat`).

### FormPrimitivos compartidos

`frontend/src/components/FormPrimitivos.jsx` exporta `IconInput`, `baseCls` (con icono, `pl-11`), `baseClsPlain` (sin icono, `px-4`), `textareaCls`, `Label`, `FieldError`, `Section`, `PillGroup`, `BoolPillGroup`, `StepBar`. Usado en `EditarUsuario.jsx`, `EditarPerfilGrupo.jsx` y `PublicacionFormulario.jsx`. `EditarPerfilGrupo.jsx` importa `baseClsPlain as baseCls` porque sus inputs no tienen icono. `YesNo` en `PublicacionFormulario.jsx` **no** se extrajo — llama `onChange(v)` directamente sin toggle a `null`, comportamiento distinto a `BoolPillGroup`.

### Accesibilidad (WCAG 2.2 nivel AA)

La app se auditó y adaptó a la WCAG 2.2 nivel AA. Piezas clave:

- **`frontend/src/components/Accesibilidad.jsx`** — `SaltarAlContenido` (enlace de salto, 2.4.1), `Cargando` (spinner con `role="status"`), `AvisoError` (`role="alert"`).
- **`frontend/src/lib/useModalAccesible.js`** — hook con el patrón de diálogo modal: foco inicial dentro del diálogo, trampa de tabulador, cierre con `Escape`, devolución del foco al elemento que lo abrió y bloqueo del scroll de fondo. Acepta `(onCerrar, abierto)`; el segundo parámetro solo hace falta en modales que se renderizan condicionalmente dentro de una página (`GrupoPerfil`, cajón de filtros de `BuscarPage`). **Todo modal nuevo debe usarlo** y llevar `role='dialog' aria-modal='true' aria-label|aria-labelledby tabIndex={-1}` en la caja blanca.
- **`frontend/src/components/TituloPagina.jsx`** — al ser una SPA el `<title>` no cambiaba nunca (2.4.2). Este componente, montado en `App.jsx` junto a `ScrollToTop`, mapea ruta → título, actualiza `document.title` y anuncia el cambio en una región `aria-live`. **Al añadir una ruta nueva hay que añadirla al array `TITULOS`.**
- **`App.css`** — capa global: `:focus-visible` con outline verde (la app usa `outline-none` en muchos sitios), `scroll-margin` para que las cabeceras sticky y el bottom nav no tapen el elemento enfocado (2.4.11), tamaño mínimo 24×24 px en controles (2.5.8) y bloque `prefers-reduced-motion`.
- **Contraste (1.4.3 / 1.4.11):** `text-slate-400` (2,56:1) y `text-slate-300` estaban por debajo del mínimo sobre fondo claro → se usa `text-slate-500` (4,76:1). Sobre las **tarjetas oscuras** (`bg-slate-900`) y el footer pasa lo contrario: ahí se usa `text-slate-300`. Los bordes de input son `border-slate-500` (antes `slate-300`, 1,47:1). El panel de filtros de `BuscarPage` es `bg-emerald-700` (sobre `emerald-600` ni el blanco puro llegaba a 4,5:1).
- **Formularios:** `Label` acepta `htmlFor`; los inputs llevan `id`, `aria-invalid` y `aria-describedby` apuntando al `id` del `FieldError` (que es `role="alert"`). Los grupos de pills (`PillGroup`/`BoolPillGroup`) son `role="group"` con prop `etiqueta` y `aria-pressed` por botón.
- **`CustomSelect`** implementa el patrón *combobox* de las WAI-ARIA APG: `role="combobox"`/`listbox`/`option`, `aria-expanded`, `aria-activedescendant` y teclado completo (flechas, Inicio/Fin, Enter, Espacio, Escape, Tab). Acepta `ariaLabel` y `describedBy`.
- **Convenciones al escribir UI nueva:** botón de solo icono → `aria-label` (nunca `title`); icono decorativo → `aria-hidden='true'`; botón de alternancia → `aria-pressed`; pestaña/enlace activo → `aria-current='page'`; imagen cuyo botón ya tiene nombre → `alt=''`; controles que aparecen en hover → añadir también `focus-visible:opacity-100`.
- El acordeón de `FAQ.jsx` usa `aria-expanded`/`aria-controls` y oculta el panel con `hidden` **solo cuando termina la transición de altura** (si no, se corta la animación de plegado).

### SEO y landing page

- **`frontend/index.html`** concentra el SEO estático: title/description optimizados, canonical, `robots`, Open Graph, Twitter Card y un bloque JSON-LD con `@graph` (Organization + WebSite con SearchAction + WebApplication). La imagen social es `public/portada-housie.jpg`.
- **`public/robots.txt`** permite el rastreo público y bloquea `/perfil/`, `/grupo/`, `/casero/` y `/creacion-grupo` (requieren sesión). **`public/sitemap.xml`** lista las tres rutas públicas: `/`, `/buscar` y `/faq` — **hay que añadir ahí cualquier ruta pública nueva** y actualizar `lastmod`.
- **`TituloPagina.jsx`** admite un tercer elemento opcional en `TITULOS` con el `<title>` completo: las rutas públicas lo usan para conservar las palabras clave (si no, se generaría `Nombre · Housie`, que desperdicia el title en SEO).
- **Navegación rastreable:** en páginas públicas los enlaces de navegación deben ser `<Link>` de React Router (renderiza `<a href>`), **nunca `<button onClick={navigate}>`** — un botón no lo sigue ningún rastreador ni se puede abrir en otra pestaña.
- **`components/PieDePagina.jsx`** — pie de página único de la aplicación. Estaba duplicado en `Home.jsx` y `FAQ.jsx` y las copias se habían desincronizado (distinto tamaño de logo y espaciado, y FAQ navegaba con botones en lugar de enlaces). **No volver a escribir un `<footer>` dentro de una página: importar este componente.** Es el único `<footer>` de todo `src/`.
- **Dónde va el pie de página — regla:** lo llevan las páginas **sin layout propio y accesibles sin sesión**, que son las que actúan de puerta de entrada desde Google: `Home`, `FAQ`, `BuscarPage`, `AnuncioPublico`, `PerfilPublicoGrupo` y `PerfilPublicoUsuario`. **No** lo llevan las páginas del módulo de convivencia (`GrupoDashboard`, `GrupoPerfil`, `Publicacion`, `Tareas`, `Calendario`, `MisFacturas`, `ListaCompra`, `Chat`, `PerfilUsuario`, `Favoritos`…), porque `LayoutGrupo`/`LayoutPerfil` ya aportan navegación y en móvil el **bottom nav fijo** se solaparía con el footer. Tampoco lo llevan los formularios standalone (`EditarUsuario`, `EditarPerfilGrupo`, `PublicacionFormulario`, `CreacionGrupo`): invitarían a abandonar el formulario a medias.
- **Una sola landmark `<main>` por página.** `BuscarPage` llegó a tener dos `<main>` anidados (el exterior como destino del enlace de salto y el interior, preexistente, como columna de resultados); el interior pasó a ser un `<div>`.
- **`Home.jsx`** — hero oscuro con tres capas decorativas (halos difuminados, rejilla de puntos con máscara y grano SVG en línea, constantes `REJILLA` y `GRANO`). Las tarjetas de producto (`TARJETAS_HERO`) flotan sobre la foto en escritorio y se convierten en una tira desplazable en móvil. El titular lleva un subrayado SVG que se dibuja solo (`.trazo-subrayado`). `Reveal` acepta `as` para que el contenedor animado sea el elemento correcto (`li` dentro de un `ol`).

### Otros patrones

- **Iconos de la barra inferior de `LayoutPerfil`:** "Inicio" (landing) usa `Home` y "Mi grupo" usa `Users` — no `House`, porque los dos iconos quedan a pocos píxeles en la barra móvil y ambos son una casa. `Users` además coincide con el icono de "Mi grupo" en `LayoutGrupo`.


- **`StepBar` basado en props:** recibe `current`, `steps` (array de strings) y `stepMeta` (array de objetos `{ label, icon }`). No lee constantes del módulo padre.
- **`CARD_SHADOW`:** definida en `frontend/src/lib/convivencia.js` y compartida. Importar desde ahí en lugar de redefinirla localmente.
- **Formularios multi-paso:** `STEP_FIELDS` array + `trigger()` de react-hook-form para validar por paso. **IMPORTANTE:** el botón final debe ser `type='button'` con `onClick={handleSubmit(onSubmit)}` — si es `type='submit'` dentro del mismo `<form>`, el `mouseup` del click en "Siguiente" puede caer sobre él tras el re-render y disparar el submit accidentalmente.
- **Inputs:** `IconInput` wrapper (icono absoluto + `pl-4`), función `baseCls(error)`, emerald ring en focus.
- **Pill-buttons booleanos (`BoolPillGroup`):** usan `null` como valor vacío (no `undefined`), schema con `.nullish()`. `onChange(null)` al deseleccionar — react-hook-form no gestiona `undefined` de forma fiable en Controllers.
- **Pill-buttons enum (`PillGroup`):** usan `''` como valor vacío. `onChange('')` al deseleccionar.
- **Secciones:** componente `Section({ title, accent })` — título bold uppercase + `border-b` + `gap-4` + dot de color.
- **Cabeceras sticky:** `backdrop-blur`, `border-b`, botón "Volver" con `ArrowLeft`, chip de paso activo a la derecha.
- **Loading:** spinner emerald uniforme — `w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin`.
- **Errores servidor:** banner rojo con `AlertCircle`.
- **Admin badge:** amber con `Crown` icon. En `GrupoPerfil` el ADMIN se muestra como "Fundador/a" (pink) y MEMBER como "Residente" (teal).
- **`esAdmin`:** `miembros.find(m => m.id === user?.id)?.rol_en_grupo === 'ADMIN'`.
- **`esCasero`:** `miembros.find(m => m.id === user?.id)?.es_casero === true`.
- **Fondo de formularios standalone:** `radial-gradient(circle, #e2e8f0 1px, transparent 1px)` dot grid sobre `#f8fafc`, `backgroundSize: '20px 20px'`.
- **Socket.io en chat:** cada conversación abierta hace `socket.emit('join_chat', chatId)` al montar y `socket.emit('leave_chat', chatId)` + `socket.disconnect()` al desmontar. El backend emite `nuevo_mensaje` con el objeto mensaje completo (incluye `remitente_id`, `remitente_nombre`, `remitente_foto`).
- **`useOutletContext`:** `LayoutGrupo` provee `{ grupo, miembros, user }` a todas las rutas hijas. `ListaCompra`, `GrupoDashboard`, `GrupoPerfil`, `Tareas`, `MisFacturas` lo usan.
- **Intereses del grupo:** El catálogo se obtiene de `GET /api/grupos/intereses` (sin auth). Los IDs son enteros (SERIAL), no UUIDs. `PUT /api/grupos/intereses` recibe `{ intereses: [id1, id2, ...] }` y reemplaza toda la lista del grupo (máx 20). La tabla `grupo_intereses` no tiene columna `id`.
- **Google Calendar sync en eventos:** Al crear un evento, el backend itera TODOS los miembros del grupo con `google_calendar_token` y llama a `crearEventoEnCalendar` con `Promise.allSettled`. Si alguno falla, el evento se crea igualmente en BD. El campo devuelto por la API es `creado_por_nombre` (no `creador_nombre`).
- **Facturas multi-grupo (casero):** `GET /api/grupos/mis-grupos` devuelve todos los grupos del usuario con `es_casero` y `num_inquilinos`. Todos los endpoints de `/api/facturas` y `/api/grupos/mi-grupo` aceptan `?grupo_id=` para especificar el grupo activo cuando el casero tiene varios.
- **Páginas públicas sin auth** (`AnuncioPublico`, `PerfilPublicoGrupo`, `PerfilPublicoUsuario`): header sticky con logo Housie + iconos de favoritos/mensajes/avatar si hay sesión. `CARD_SHADOW` constante compartida. Botón volver con `navigate(-1)` o a ruta específica. Sin `requireAuth` en el backend.
- **`AnuncioPublico` — bloqueo por pertenencia:** `perteneceAlGrupo = user && miembros.some(m => m.id === user.id)`. Si el usuario ya pertenece al grupo: botón "Guardar" deshabilitado (muestra "Ya eres miembro"), botón de contacto reemplazado por "Ya perteneces a este grupo", teléfono oculto.
- **`AnuncioPublico` — mapa:** iframe al final de la columna izquierda con `https://maps.google.com/maps?q=ENCODED_ADDRESS&output=embed&hl=es&z=15`. No requiere API key. Enlace "Ver en Google Maps →" abre en nueva pestaña. Solo se muestra si hay `pub.direccion` o `pub.ciudad`.
- **`BuscarPage` — filtros:** aside emerald sticky en desktop; en mobile, drawer (izquierda) activado por botón `SlidersHorizontal` (`md:hidden`) en la cabecera. El `FilterAside` ya gestiona ambos casos internamente.
- **`BuscarPage` — race condition auth:** el check del perfil de convivencia y favoritos vive en un `useEffect([user, cargando])` separado (no en el `useEffect([])` de la búsqueda inicial). El patrón `if (cargando) return` al inicio evita que `user === null` transitorio active el `else { setTienePerfilConvivencia(false) }`. Aplicar este mismo patrón en cualquier página que tome decisiones basadas en `user` al montar.
- **Dónde se muestra la compatibilidad — decisión de producto:** el orden real del flujo es (1) el solicitante pide contacto desde el anuncio, (2) el administrador ve esa solicitud en **Mensajes** y decide ahí, con el % de compatibilidad y los intereses en común, si abre el chat, (3) hablan, (4) si le convence, el administrador le pasa **él mismo** el `codigo_acceso`, (5) el solicitante lo usa y se crea la `SolicitudUnion`. Por eso el porcentaje se muestra en `Chat.jsx` (punto de decisión) y **no** en `SolicitudesUnion.jsx` (confirmación final de alguien con quien ya se ha hablado). No volver a añadirlo allí "por consistencia".
  El `codigo_acceso` es una señal de confianza, no un dato público: solo lo tiene quien el administrador o un miembro ha decidido dárselo. Si alguien llega con el código sin haber pasado por el chat, es porque un miembro ya lo dio por compatible, así que tampoco en ese caso hace falta recalcular la afinidad. Decisión explícita del autor del proyecto, no un descuido.

- **`components/Compatibilidad.jsx`** — piezas visuales del matching, compartidas: `DonutCompatibilidad`, `DesgloseCompatibilidad`, `TarjetaCompatibilidad` (donut + frase + desglose opcional; prop `sujeto` para "con este grupo" vs "con el grupo") e `InteresesComunes` (chips "En común:"). **No duplicar estos bloques en una página: importarlos.** El donut y el desglose estaban copiados en `AnuncioPublico` y `SolicitudesUnion`, y los chips en `BuscarPage` y `Favoritos`. Lo usan `AnuncioPublico` y `Chat` (detalle de solicitud de contacto).
- **Intereses en común — display estándar:** el componente `InteresesComunes`. `BuscarPage` y `Favoritos` aún llevan el marcado en línea (etiqueta `"En común:"` en `font-mono text-[0.6rem] uppercase tracking-[0.12em] text-slate-600` + chips `bg-emerald-200 text-emerald-900 rounded-full` con dot `bg-emerald-400`); migrarlas al componente cuando se toquen.
- **`PublicacionFormulario` — visibilidad:** campo `visible` (boolean, default `true`) al final del paso 1. Dos pill buttons: "Publicado" (emerald) → aparece en búsquedas; "Borrador" (slate) → no aparece. Guardado en `publicaciones.visible`.
- **`MisFacturas` — histórico:** el `AreaChart` solo muestra la serie `pagado` (sin `pendiente`). El diff de tendencia compara `pagado` del último mes vs el anterior.
- **Emails fire-and-forget:** Siempre `.then(() => {}).catch(() => {})` al llamar a `sendMail`. Nunca `await` en el handler de la ruta si el email no es crítico para la respuesta.
- **Chat — nombre del solicitante clickable (solo admin):** en la cabecera de `Conversacion`, cuando `esAdmin && idOtro`, el nombre se renderiza como `<button onClick={() => navigate('/usuario/${idOtro}')} className='hover:text-emerald-600'>`. La prop `idOtro` viene de `chatActivo.solicitante_id` (campo devuelto por `GET /api/chats/como-admin`).
- **Solicitudes de unión al grupo:** `AccesoGrupo.jsx` se eliminó — su funcionalidad (unirse con código) vive ahora en `Home.jsx` (`handleUnirseCodigo`). Al unirse con `codigo_acceso` ya no se entra al grupo al momento: la respuesta trae `{ solicitud, message }` (no `{ grupo }`), y `Home.jsx` muestra un banner emerald con `CheckCircle2` con el mensaje del backend en vez de `setTieneGrupo(true)` + redirigir. El flujo de `codigo_casero` no cambia (sigue uniendo directo, `{ grupo, esCasero }`). El admin gestiona las solicitudes en `/grupo/solicitudes-union` (link desde `Publicacion.jsx`, badge con el nº de pendientes). Todas las navegaciones que antes iban a `/acceso-grupo` (footer de `Home`/`FAQ`, `onSuccess` de registro de casero en `Home`/`FAQ`/`BuscarPage`, redirect tras `salirDelGrupo` en `GrupoPerfil`) ahora van a `/`.
- **`BuscarPage` — "Contactar" sin sesión:** `PublicacionCard` recibe `onRequireLogin` desde `BuscarPage` (`() => setLoginOpen(true)`); si `!user` al contactar, abre el `LoginModal` en sitio en vez de `navigate('/')`.
- **`Publicacion.jsx` — "Ver anuncio público":** usa `navigate(`/anuncio/${id}`)`, no `window.open(..., '_blank')` — abrir en pestaña nueva hacía que la vista no heredara el viewport/emulación mobile de la pestaña actual.

## Variables de entorno

### Backend (`.env`)
```
DATABASE_URL=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/auth/google/calendar/callback
# Notificaciones por correo (Gmail — requiere Verificación en 2 pasos + Contraseña de aplicación)
EMAIL_USER=
EMAIL_PASS=
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_PLACES_KEY=
```
`VITE_GOOGLE_PLACES_KEY` debe estar en `frontend/.env` (no en `backend/.env`) porque el SDK de Google Maps se carga directamente en el navegador. Si la variable está vacía, los scripts de Google Places no se inyectan y los campos de ciudad funcionan como inputs de texto libre. Requiere activar **Maps JavaScript API** y **Places API** en Google Cloud Console.

## Estado de implementación

### Completado
- Auth completa: par de cookies httpOnly (access `token` + `refresh_token` con rotación), Google OAuth, modales de registro/login. Redirección forzada a completar perfil (`perfil_completo`) si faltan campos de convivencia.
- Fotos extra de perfil (`foto_1`/`foto_2`): galería de hasta 3 fotos, gestionadas en `EditarUsuario.jsx`.
- Algoritmo de compatibilidad (`backend/src/utils/compatibilidad.js`) con `limpieza_orden`/`nivel_ruido` incluidos en el matching y como filtros duros de búsqueda vía `preferencias_companero`.
- Landing (`Home.jsx`) y `FAQ.jsx` como páginas propias con scroll-reveal, branding Housie (`housielogo.svg`, `housienegrologo.png`).
- Google Calendar OAuth: flujo completo de conexión, `google_calendar_token` guardado en BD. `/api/auth/me` devuelve `tiene_calendar: bool`.
- Middleware `requireAuth` centralizado en `backend/src/middleware/auth.js`.
- Perfil usuario: editar datos (nombre, sobre_mi máx 399 chars con contador, género/país/fecha OBLIGATORIOS), foto Cloudinary, perfil de convivencia.
- `EditarUsuario.jsx` — formulario standalone 2 pasos.
- `PerfilUsuario.jsx` — solo lectura. Aviso naranja si perfil de convivencia vacío.
- Grupos: crear (con check si ya perteneces), unirse con `codigo_casero` (directo) o `codigo_acceso` (crea `SolicitudUnion`, requiere aprobación del admin), dashboard.
- Home CTA adaptativo: sin sesión / sesión sin grupo / sesión con grupo. Búsqueda sin ciudad navega a `/buscar` listando todos los pisos. Formulario de unirse con código integrado en la propia Home (`AccesoGrupo.jsx` se eliminó).
- **Solicitudes de unión** (`/grupo/solicitudes-union`): admin acepta/rechaza con % de compatibilidad y desglose (mismo componente visual que `AnuncioPublico`). Aceptar crea el `MiembroGrupo`; rechazar solo cambia el estado.
- **Eliminar miembro del grupo:** en `GrupoPerfil.jsx`, hover en la fila del miembro (`group` + `opacity-0 group-hover:opacity-100`) muestra botón rojo "Eliminar del grupo" (solo admin, no en la fila propia) con modal de confirmación. `DELETE /api/grupos/miembros/:usuarioId` marca `activo=false`.
- `GrupoDashboard.jsx`: bento grid responsive (1→2→4 cols), TareasCard, FacturaCard, AvisoCard, AgendaCard, ListaCompraCard, HistoricoCard.
- `GrupoPerfil.jsx` (`/grupo/perfil`): miembros con avatares (residentes clickables → `/usuario/:id`, casero no clickable), identidad del grupo, datos del piso, intereses en dark card, donuts de convivencia.
- `LayoutGrupo.jsx` y `LayoutPerfil.jsx`: sidebar en desktop, **bottom nav** emerald en mobile.
- `EditarPerfilGrupo.jsx` (`/grupo/perfil/editar`): 2 pasos — datos del grupo + convivencia + selector de intereses del catálogo.
- `PublicacionFormulario.jsx` 3 pasos: info general → detalles → fotos + control de visibilidad (Publicado/Borrador). `tipo_piso`, `habitaciones_totales`, `tamano_piso`, `planta` y `ascensor` son obligatorios (antes opcionales); `ascensor` (`YesNo`) arranca en `undefined` en vez de `false` para forzar una elección explícita en vez de asumir "No" en silencio.
- `/grupo/publicacion`: vista lectura con chips comodidades, normas, carrusel de fotos, botón editar (solo admin).
- `BuscarPage.jsx`: búsqueda con Google Places, filtros en aside (desktop) / drawer (mobile), paginación, carrusel de fotos, favoritos, solicitud de contacto. Cards verticales en mobile.
- **Chat funcional** (`/perfil/chat` y `/grupo/mensajes`): toggle de paneles en mobile (`mostrandoConversacion`), Socket.io en tiempo real, solicitudes con aceptar/rechazar (admin), `ModalCerrarChat`, nombre del solicitante clickable en vista admin.
- **Lista de la compra** (`/grupo/compra`): añadir, toggle comprado, editar inline, eliminar, sección comprados colapsable.
- **Eventos del grupo**: calendario mensual, modal creación/edición, `ModalConfirmarEliminar` (sin `window.confirm`). Google Calendar sync implementado **solo en creación** (editar y eliminar no sincronizan — ver Pendiente).
- **Intereses del grupo**: catálogo 41 intereses, selección en `EditarPerfilGrupo`, visualización en `GrupoPerfil`.
- **Rol casero**: flujo de unión con `codigo_casero`, vista restringida en `LayoutGrupo`, redirección automática a `/casero/facturas`.
- **Gastos / Facturas**: `Facturas.jsx` (casero) + `MisFacturas.jsx` (inquilino). Casero: subida PDF/imagen, división equitativa, confirmar pagos. Histórico solo muestra `pagado` (sin `pendiente`). Soporta múltiples pisos.
- **Tareas — rotación de limpieza**: `ModalConfirmarEliminar` para zonas personalizadas (predefinidas no eliminables).
- **Calendario** (`/grupo/calendario`): vista mensual con `ModalConfirmarEliminar` para eventos.
- **Salir del grupo**: modal de transferencia de admin si hay otros miembros. Redirige a `/`.
- **Notificaciones por email**: fire-and-forget en solicitudes y publicación.
- **Re-envío de solicitud rechazada**: `UPDATE SET estado='PENDIENTE'` en lugar de INSERT duplicado.
- **Perfil público de usuario** (`/usuario/:id`): sin auth, accesible desde `GrupoPerfil` y `PerfilPublicoGrupo` (solo residentes, no casero).
- **`AnuncioPublico`**: mapa embed, bloqueo si ya pertenece al grupo.
- **Responsive design completo**: bottom nav mobile en layouts, grids adaptativos, cards verticales en mobile, chat con toggle de paneles, headers con padding mobile.
- **`seed_demo_convivencia.sql`**: seed idempotente para demo TFG con inquilinos, solicitantes, chats, tareas, facturas y eventos.

### Pendiente / no implementado
- **Google Calendar — sync de edición y eliminación de eventos**: la integración actual solo sincroniza al crear un evento (`POST /api/grupos/eventos`). Editar (`PUT`) y eliminar (`DELETE`) no actualizan Google Calendar. `google_calendar_event_id` se guarda en la BD por evento para implementarlo en el futuro.
- **UI para editar intereses de usuario**: `perfil.js` ya tiene `GET /api/perfil/mis-intereses` y `PUT /api/perfil/intereses`, pero no hay pantalla en el frontend para seleccionarlos (solo se ven en el perfil público). Nota: los intereses SÍ se editan en el paso 1 de `EditarUsuario.jsx`.
- URL backend hardcodeada `http://localhost:3000` en todos los fetch del frontend.
- Tab activo en `LayoutPerfil` usa `===` en lugar de `startsWith` — bug conocido, no crítico.
- `grupos.descripcion` es NOT NULL en BD pero el form de creación no lo pide — insertar un grupo sin descripción dará error SQL. El form de edición sí lo exige.
