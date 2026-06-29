# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Skills disponibles — revisar SIEMPRE antes de responder

Antes de ejecutar cualquier tarea, comprobar si alguna de estas skills aplica e invocarla con el Skill tool:

- `frontend-design` — construir o mejorar UI (páginas, componentes, layouts, estilos).
- `ui-ux-pro-max` — diseño UI/UX, paletas, tipografía, accesibilidad, patrones visuales.
- `vercel-react-best-practices` — optimización de componentes React/Next.js, data fetching, bundle.
- `web-design-guidelines` — auditoría de UI: accesibilidad, buenas prácticas, revisión de diseño.
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
- **Autenticación:** JWT en cookie `httpOnly`. Middleware centralizado en `backend/src/middleware/auth.js` — exporta `requireAuth`. Todas las rutas protegidas lo importan y usan como middleware; el `userId` queda en `req.userId`.
- **Validación:** Zod. Schemas centralizados en `backend/validators/`. Cada controlador importa solo sus schemas. Validación siempre antes de tocar la BD.
- **IDs:** `randomUUID()` de Node `crypto` (nativo, no uuid package).
- **Emails:** `backend/src/config/email.js` — nodemailer con Gmail. Patrón fire-and-forget (`.then().catch(() => {})`); nunca bloquean la respuesta HTTP. Si `EMAIL_USER`/`EMAIL_PASS` no están en `.env`, se silencia sin error. Plantillas exportadas: `emailSolicitudEnviadaUsuario`, `emailSolicitudRecibidaAdmin`, `emailSolicitudAceptada`, `emailSolicitudRechazada`, `emailPublicacionConfirmada`.

### Frontend — React + Vite + Tailwind

- **Entrada:** `frontend/src/main.jsx` → `App.jsx`.
- **Estado global:** `AuthContext` (`frontend/src/context/AuthContext.jsx`) es la fuente de verdad para `user`, `tieneGrupo` y `cargando`. Exporta `{ user, setUser, tieneGrupo, setTieneGrupo, recargarUsuario, cargando }`. `cargando` empieza en `true` y pasa a `false` cuando la llamada inicial a `/api/auth/me` termina — úsalo para evitar race conditions al decidir si hay sesión (ej. `if (cargando) return` al inicio de efectos que dependan de `user`). Páginas públicas con header propio usan `const { user, tieneGrupo } = useAuth()`.
- **Routing:** React Router v7. Layouts anidados por sección.
- **Formularios:** `react-hook-form` + `zodResolver`. Schemas en `frontend/src/lib/schemas.js`.
- **Componentes:** `frontend/src/components/` — `CustomSelect`, `LoginModal`, `RegistroModal`, `DonutChart`, `ui/chart.jsx` (wrapper recharts), `FormPrimitivos.jsx` (primitivos de formulario compartidos).
- **Estilos:** Tailwind v4. Color principal: `emerald`. Sin fichero de config — usa el plugin de Vite directamente.
- **Iconos:** `lucide-react`.

### Rutas React Router v7

```
/                              — Home (inline en App.jsx)
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
/casero/facturas               — Gastos (standalone, casero: gestión de facturas de múltiples pisos)
— Rutas standalone (sin layout) —
/grupo/perfil/editar           — EditarPerfilGrupo (2 pasos: datos + convivencia + intereses)
/grupo/publicacion/formulario  — PublicacionFormulario (3 pasos: info + detalles + fotos + visibilidad)
/perfil/usuario/editar         — EditarUsuario (2 pasos: datos + convivencia)
/perfil/convivencia            — PerfilConvivencia (pill-buttons, upsert)
/creacion-grupo                — CreacionGrupo
/acceso-grupo                  — AccesoGrupo (unirse con código o crear)
/anuncio/:id                   — AnuncioPublico (vista pública del anuncio)
/anuncio/:id/convivencia       — PerfilPublicoGrupo (perfil público del grupo — sin auth)
/usuario/:id                   — PerfilPublicoUsuario (perfil público del usuario — sin auth)
```

### API endpoints implementados

```
POST   /api/auth/registro
POST   /api/auth/login
GET    /api/auth/me                              # devuelve también tiene_calendar: bool
POST   /api/auth/logout
POST   /api/auth/google                          # OAuth Google (no guarda foto del payload)
GET    /api/auth/google/calendar                 # Inicia OAuth Google Calendar
GET    /api/auth/google/calendar/callback        # Callback OAuth Calendar — guarda refresh token en usuarios.google_calendar_token

GET    /api/perfil/datos
PUT    /api/perfil/editar
PUT    /api/perfil/foto
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
POST   /api/grupos/unirse                        # une al usuario con el código de 6 caracteres (acceso o casero)
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

GET    /api/favoritos
GET    /api/favoritos/publicaciones              # devuelve compatibilidad (number|null) e intereses_comunes (string[]) igual que /api/publicaciones
POST   /api/favoritos/:publicacionId

POST   /api/chats/solicitar/:publicacionId       # crea solicitud; si estaba RECHAZADA hace UPDATE en lugar de INSERT; envía emails al usuario y al admin
GET    /api/chats/solicitudes                    # admin: solicitudes recibidas
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

GET    /api/compra                               # lista de productos del grupo (pendientes primero)
POST   /api/compra                               # añadir producto
PUT    /api/compra/:id                           # editar nombre/cantidad/unidad_medida
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
- `usuarios` — identidad y datos básicos. Tiene `google_calendar_token` para la integración de Google Calendar. **No tiene columna `username`** (solo `nombre`). El campo `username` en las queries de `mi-grupo` es un alias de `u.nombre`.
- `preferencias_companero` — lo que el usuario busca en futuros compañeros (1:1 con usuarios, opcional). Mismos campos enum que `perfiles_convivencia_usuario` pero sin genero/pais/fecha_nacimiento/sobre_mi. Se usa en el matching de búsqueda con prioridad sobre el perfil propio.
- `perfiles_convivencia_usuario` — preferencias de convivencia (1:1 con usuarios). Incluye `sobre_mi` (NOT NULL en BD) — aunque conceptualmente es un campo de presentación del usuario, se almacena aquí porque se edita junto con los datos de convivencia en `PUT /api/perfil/editar`. **Mínimo 3 campos** del bloque de preferencias requeridos (validado en Zod).
- `perfiles_convivencia_grupo` — misma estructura para grupos (sin `sobre_mi`)
- `grupos` — pisos compartidos con `codigo_acceso` (6 chars, miembros) y `codigo_casero` (6 chars, casero). Campo `dia_limpieza` (`dia_semana_enum`) para el calendario. `descripcion` es NOT NULL en BD pero opcional en el form de creación. Campos `semana_rotacion` (INT, índice de rotación actual) y `rotacion_semana_actual` (DATE, lunes de la semana en curso) para el sistema de tareas.
- `miembros_grupo` — relación N:M usuarios↔grupos con rol (`ADMIN` | `MEMBER`) y flag `es_casero`. El ENUM usa `'MEMBER'` (no `'MIEMBRO'`); el frontend compara solo `=== 'ADMIN'` por lo que no hay bug activo.
- `publicaciones` — anuncios de habitaciones (1:1 con grupos, UNIQUE constraint en grupo_id). Campo `visible` (boolean): `true` → aparece en búsquedas; `false` → borrador, no aparece.
- `fotos_publicacion` — fotos asociadas a publicaciones (url, orden). **No tiene columna `cloudinary_id`.**
- `chats` / `mensajes` / `solicitudes_contacto` — mensajería entre solicitante y admin del grupo. Si una solicitud estaba `RECHAZADA`, el endpoint la resetea a `PENDIENTE` en lugar de crear una nueva.
- `favoritos` — publicaciones guardadas por usuario
- `tareas` — zonas de limpieza del grupo. **Reutilizada como "zonas"**: los registros con `es_recurrente = TRUE` son las zonas de la rotación semanal. No son tareas puntuales.
- `asignaciones_tarea` — asignación zona↔miembro por semana (`semana` DATE = lunes de esa semana). Estados: `PENDIENTE` | `COMPLETADA`.
- `facturas` / `pagos_factura` — sistema de gastos. `tipo_division` siempre `'EQUITATIVA'`. El importe se divide equitativamente entre los inquilinos activos al crear la factura.
- `eventos` — eventos del grupo con soporte de Google Calendar (`google_calendar_event_id`)
- `productos` — lista de la compra por grupo (funcional)
- `intereses` — catálogo de intereses con `nombre` y `categoria` (SERIAL PK, no UUID). Pre-poblado con 41 intereses en 5 categorías: Deporte y actividad física, Alimentación, Cultura y ocio, Vida social, Bienestar.
- `usuario_intereses` — intereses de usuarios (N:M, PK compuesta `(usuario_id, interes_id)`)
- `grupo_intereses` — intereses de grupos (N:M, PK compuesta, no tiene columna `id`)

ENUMs de PostgreSQL: al modificar valores hay que usar `ALTER TYPE ... RENAME TO old; CREATE TYPE ...; ALTER TABLE ... ALTER COLUMN ... TYPE ... USING ...::text::nuevo_tipo; DROP TYPE old;`. Valores válidos de `horario_enum`: `'MADRUGADOR'`, `'INTERMEDIO'`, `'NOCTURNO'` (no existe `'MATUTINO'`).

### seed.sql

Fichero en la raíz del repo. Idempotente: todos los bloques tienen `ON CONFLICT ... DO NOTHING`. Incluye:
- 23 usuarios (11 originales + 12 extra para paginación). Todos tienen `perfiles_convivencia_usuario` completo.
- 15 grupos → 15 publicaciones (3 originales + 12 extra) → paginación funciona en dos páginas (límite 12/página).
- **40 fotos de Cloudinary** distribuidas entre las 15 publicaciones (IDs prefijo `cl000001-...`). Las 3 publicaciones originales tienen 3 fotos c/u; las 12 extra tienen 2-3 fotos c/u; Granada Albaicín tiene 4.
- `usuario_intereses`: 3 intereses por cada usuario no-casero.
- Chat activo entre pablo↔grupo Granada, solicitud pendiente isabel↔Barcelona.
- 6 meses de facturas en Granada, 2 meses en Madrid.

### seed_demo_convivencia.sql

Fichero en la raíz del repo para demo de presentación TFG. Idempotente. Trabaja sobre el grupo `074301e3-0cb1-4b0f-bd23-d994a0bfc0d8` (Granada Sol), que ya tiene al usuario real `marioiv` (ADMIN) y al casero. Crea:
- 3 inquilinos demo: Javier López, Sofía Ruiz, Ana García.
- 3 solicitantes externos: Laura Sánchez (chat activo), Marcos Vega (chat activo), Elena Torres (solicitud pendiente).
- Zonas de limpieza (DELETEs previos para evitar duplicados), asignaciones semana actual y semana anterior.
- 8 productos en lista de la compra, 5 eventos, 5 facturas.
- 2 chats con 6 mensajes cada uno.

### Perfil de convivencia

Flujo: `PerfilUsuario` → aviso naranja si no relleno → navega a `/perfil/convivencia`. El formulario usa pill-buttons. Hace upsert vía `ON CONFLICT (usuario_id) DO UPDATE`. Campos opcionales individualmente, mínimo 3 requeridos (validado en Zod frontend y backend).

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
- **Grids de 2 columnas:** siempre `grid-cols-1 sm:grid-cols-2` (o `lg:grid-cols-4` para el bento). Nunca `grid-cols-2` sin breakpoint.
- **Cards horizontales (BuscarPage, Favoritos):** `flex flex-col sm:flex-row` — foto arriba en mobile, izquierda en desktop.
- **AnuncioPublico:** `grid-cols-1 lg:grid-cols-[1fr_20rem]` — columna única en mobile/tablet, dos columnas en desktop.
- **Chat móvil:** estado `mostrandoConversacion` (boolean) controla qué panel se ve. Panel lista: `hidden sm:flex` cuando `mostrandoConversacion`. Panel conversación: `hidden sm:flex` cuando `!mostrandoConversacion`. El componente `Conversacion` recibe prop `onVolver` y muestra botón `ArrowLeft` solo en mobile (`sm:hidden`).
- **Headers públicos:** `px-4 sm:px-10` en el contenedor del header.

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

### Otros patrones

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
- **Intereses en común — display estándar:** etiqueta `"En común:"` en `font-mono text-[0.6rem] uppercase tracking-[0.12em] text-slate-600` + chips `bg-emerald-200 text-emerald-900 rounded-full` con dot `bg-emerald-400`. Usado igual en `BuscarPage` y `Favoritos`.
- **`PublicacionFormulario` — visibilidad:** campo `visible` (boolean, default `true`) al final del paso 1. Dos pill buttons: "Publicado" (emerald) → aparece en búsquedas; "Borrador" (slate) → no aparece. Guardado en `publicaciones.visible`.
- **`MisFacturas` — histórico:** el `AreaChart` solo muestra la serie `pagado` (sin `pendiente`). El diff de tendencia compara `pagado` del último mes vs el anterior.
- **Emails fire-and-forget:** Siempre `.then(() => {}).catch(() => {})` al llamar a `sendMail`. Nunca `await` en el handler de la ruta si el email no es crítico para la respuesta.
- **Chat — nombre del solicitante clickable (solo admin):** en la cabecera de `Conversacion`, cuando `esAdmin && idOtro`, el nombre se renderiza como `<button onClick={() => navigate('/usuario/${idOtro}')} className='hover:text-emerald-600'>`. La prop `idOtro` viene de `chatActivo.solicitante_id` (campo devuelto por `GET /api/chats/como-admin`).

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
- Auth completa: JWT httpOnly cookie, Google OAuth, modales de registro/login.
- Google Calendar OAuth: flujo completo de conexión, `google_calendar_token` guardado en BD. `/api/auth/me` devuelve `tiene_calendar: bool`.
- Middleware `requireAuth` centralizado en `backend/src/middleware/auth.js`.
- Perfil usuario: editar datos (nombre, sobre_mi máx 399 chars con contador, género/país/fecha OBLIGATORIOS), foto Cloudinary, perfil de convivencia.
- `EditarUsuario.jsx` — formulario standalone 2 pasos.
- `PerfilUsuario.jsx` — solo lectura. Aviso naranja si perfil de convivencia vacío.
- Grupos: crear (con check si ya perteneces), acceder con código de 6 chars (miembro o casero), dashboard.
- `AccesoGrupo.jsx` — gateway page. Redirige a `/grupo` si ya tiene grupo.
- Home CTA adaptativo: sin sesión / sesión sin grupo / sesión con grupo. Búsqueda sin ciudad navega a `/buscar` listando todos los pisos.
- `GrupoDashboard.jsx`: bento grid responsive (1→2→4 cols), TareasCard, FacturaCard, AvisoCard, AgendaCard, ListaCompraCard, HistoricoCard.
- `GrupoPerfil.jsx` (`/grupo/perfil`): miembros con avatares (residentes clickables → `/usuario/:id`, casero no clickable), identidad del grupo, datos del piso, intereses en dark card, donuts de convivencia.
- `LayoutGrupo.jsx` y `LayoutPerfil.jsx`: sidebar en desktop, **bottom nav** emerald en mobile.
- `EditarPerfilGrupo.jsx` (`/grupo/perfil/editar`): 2 pasos — datos del grupo + convivencia + selector de intereses del catálogo.
- `PublicacionFormulario.jsx` 3 pasos: info general → detalles → fotos + control de visibilidad (Publicado/Borrador).
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
- **Salir del grupo**: modal de transferencia de admin si hay otros miembros. Redirige a `/acceso-grupo`.
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
