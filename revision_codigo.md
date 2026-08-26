# Revisión de código — Housie TFG

---

## Sección 1 — Controladores (`backend/controllers/`)

### Lógica duplicada

**1. `upload` de Multer definido 3 veces**
- `perfilController.js:12`, `gruposController.js:19`, `facturasController.js:7`
- Los tres definen `export const upload = multer({ storage: multer.memoryStorage(), ... })` con diferencias mínimas (fileSize, fileFilter).
- Solución: extraer a `src/config/multer.js` con una función `crearUpload(opciones)`.

**2. Wrapper de subida a Cloudinary repetido 5 veces**
- `perfilController.js:107`, `perfilController.js:135`, `gruposController.js:404`, `gruposController.js:453`, `facturasController.js:19` (ya extraído como `subirDocumento`).
- Patrón repetido:
  ```js
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ ... }, (err, result) =>
      err ? reject(err) : resolve(result.secure_url))
    stream.end(buffer)
  })
  ```
- Solución: extraer a `src/utils/cloudinaryUpload.js` como `uploadToCloudinary(buffer, options)`.

**3. `getIntereses` copiado literalmente**
- `perfilController.js:367` y `gruposController.js:608` tienen exactamente el mismo código: buscan todos los intereses y los agrupan por categoría en un objeto `categorias`.
- Solución: extraer a `src/utils/intereses.js` como `getCatalogoIntereses()` y llamarlo desde ambos controladores.

**4. `editarIntereses` — misma lógica con tabla diferente**
- `perfilController.js:398` (`usuarioInteres`) y `gruposController.js:642` (`grupoInteres`) hacen lo mismo: delete + createMany en transacción.
- Solución: extraer a helper `reemplazarIntereses(tabla, whereKey, idValor, intereses)` o simplemente documentar que son análogos.

**5. `APP_URL` definida en dos controladores**
- `gruposController.js:17` y `chatsController.js:13` ambos hacen:
  ```js
  const APP_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'
  ```
- Solución: exportarla desde `src/config/env.js` o similar e importarla en ambos.

---

### Código muerto / problemas específicos

**6. `perfilController.js:131` — índice `'3'` permitido pero `foto_3` no existe en BD**
- `subirFotoExtra` valida `['1', '2', '3']` pero la tabla `usuarios` solo tiene columnas `foto_1` y `foto_2`.
- Guardar en `foto_3` no falla en Prisma (campo dinámico con `[campo]`) pero nunca se leerá en ninguna query.
- Solución: cambiar la validación a `['1', '2']`.

**7. `perfilController.js:36–49` — objeto `camposOpcionales` innecesario**
- En `editarPerfil`, se construye `camposOpcionales` filtrando campos no nulos, luego se hace `...camposOpcionales` en el `update`.
- El `create` ya pone todos los campos con `?? null`, por lo que el `update` podría hacer lo mismo directamente sin el bloque intermedio.
- Solución: unificar usando el mismo objeto plano con `?? null` tanto en `create` como en `update`.

**8. `chatsController.js` — funciones sin `try/catch`**
- Las siguientes funciones no tienen `try/catch` y no llaman a `next(err)`:
  - `getSolicitudes` (línea 89)
  - `getMisSolicitudes` (línea 175)
  - `getChatsComoSolicitante` (línea 195)
  - `getChatsComoAdmin` (línea 214)
  - `getMensajes` (línea 243)
  - `cerrarChat` (línea 280)
  - `enviarMensaje` (línea 301)
- Si la BD falla, el error no llega al manejador global de Express y la respuesta queda colgada.
- Solución: envolver cada función en `try/catch` con `next(err)` como el resto de controladores.

---

### Imports

**9. `publicacionesController.js:3` — importa `calcularCompatibilidad` y `calcularScore`**
- Ambos se usan (`calcularScore` en `buscarPublicaciones`, `calcularCompatibilidad` en `getPublicacion`). No hay problema, pero conviene verificar que no dupliquen lógica interna (ver sección 4).

---

## Sección 2 — Validators (`backend/validators/`)

### Schemas Zod duplicados o muy similares

**1. `interesesSchema` definido dos veces idéntico**
- `perfilValidator.js:45` y `gruposValidator.js:81` exportan exactamente el mismo schema:
  ```js
  export const interesesSchema = z.object({
    intereses: z.array(z.number().int().positive()).max(20),
  });
  ```
- Solución: moverlo a un fichero compartido (p. ej. `validators/sharedSchemas.js`) e importarlo en ambos.

**2. Enums de convivencia repetidos en 3 ficheros**
- Los mismos valores de enum aparecen en `perfilValidator.js`, `gruposValidator.js` y `perfilValidator.js` (preferencias):
  - `['MADRUGADOR', 'INTERMEDIO', 'NOCTURNO']` — horario
  - `['TRANQUILO', 'EQUILIBRADO', 'SOCIAL']` — ambiente
  - `['CASI_NUNCA', 'A_VECES', 'FRECUENTE']` — frecuencia_visitas
  - `['NUNCA', 'OCASIONAL', 'FRECUENTE']` — tolerancia_fiestas
  - `['ESTUDIO', 'TRABAJO', 'ESTUDIO_Y_TRABAJO']` — ocupacion
  - `['SI', 'NO', 'INDIFERENTE']` — acepta_fumadores
  - `['SI', 'NO', 'DEPENDE']` — acepta_mascotas
  - `['DESPREOCUPADO', 'FLEXIBLE', 'ORDENADO']` — limpieza_orden
  - `['SILENCIO_TOTAL', 'MODERADO', 'INDIFERENTE']` — nivel_ruido
- Solución: extraer a constantes en `validators/convivenciaEnums.js` y usar `z.enum(HORARIO_ENUM)` en todos los schemas.

**3. `convivenciaSchema` (perfil) y `grupoConvivenciaSchema` son casi idénticos**
- `perfilValidator.js:24` y `gruposValidator.js:18` comparten los mismos 10 campos de convivencia.
- Diferencias: `convivenciaSchema` tiene `.nullable().optional()` en todos y requiere mínimo 3 campos (`superRefine`); `grupoConvivenciaSchema` tiene algunos campos obligatorios.
- Solución: definir un objeto base de campos de convivencia y construir ambos schemas a partir de él con `.extend()` o `.partial()`.

**4. `preferenciasSchema` (`perfilValidator.js:49`) repite los mismos enums**
- Es esencialmente `convivenciaSchema` con un campo `_req` booleano extra por cada campo.
- No se puede unificar trivialmente, pero los enums base sí se pueden compartir (ver punto 2).

---

### Constantes repetidas entre archivos

**5. `DIAS_SEMANA` en `gruposValidator.js:3` — no exportada**
- La constante `['LUNES', 'MARTES', ...]` se define localmente en `gruposValidator.js` pero no se exporta.
- Si en algún momento se necesita en el frontend o en otro fichero, habría que redefinirla.
- Solución: exportarla (`export const DIAS_SEMANA = [...]`).

---

### Sin problemas relevantes

- `authValidator.js` — limpio y mínimo.
- `compraValidator.js` — limpio, `añadirSchema` y `editarSchema` son correctamente distintos.
- `tareasValidator.js` — un único schema trivial, correcto.
- `facturasValidator.js` — limpio y correcto.
- `chatsValidator.js` y `publicacionesValidator.js` — solo exportan constantes, correctos.

---

## Sección 3 — Routes (`backend/routes/`)

### Patrones de middleware repetidos

**1. `requireAuth` + `requireMiembro` o `requireAdmin` siempre van juntos**
- En `grupos.js`, `tareas.js`, `compra.js` y `facturas.js` todas las rutas protegidas llevan `requireAuth, requireMiembro` o `requireAuth, requireAdmin`.
- Sin embargo, `requireMiembro` y `requireAdmin` ya llaman a `getMiembroActivo` que hace una query a BD, pero **no verifican el JWT** — dependen de que `requireAuth` lo haya hecho antes y puesto `req.userId`.
- Si alguien usara `requireMiembro` sin `requireAuth` antes, `req.userId` sería `undefined` y la query devolvería siempre `null`.
- Solución: hacer que `requireMiembro` y `requireAdmin` incorporen internamente la verificación del token (o documentar claramente que siempre se usan tras `requireAuth`).

**2. `requireAdmin` hace la misma query a BD que `requireMiembro`**
- `getMiembroActivo` se llama dos veces seguidas cuando se encadenan (no ocurre actualmente, son alternativos), pero sí ocurre que tanto `requireMiembro` como `requireAdmin` llaman cada uno a `getMiembroActivo` de forma independiente.
- La implementación actual es correcta (solo se usa uno u otro), sin duplicación real.

---

### Inconsistencias detectadas

**3. `chats.js:18` — `requireAdmin` importado pero usado de forma incorrecta**
- `PUT /solicitudes/:solicitudId` usa solo `requireAuth` sin `requireAdmin`, y la comprobación de admin se hace **dentro del controlador** (`gestionarSolicitud`).
- El resto del proyecto delega esa comprobación al middleware. Es inconsistente pero funciona.
- Solución menor: mover la comprobación de admin al middleware, igual que en el resto de rutas, y eliminar el import de `requireAdmin` que actualmente no se usa en `chats.js`.

**4. `grupos.js:43–45` — eventos usan `requireMiembro` pero editar/eliminar verifica admin dentro del controlador**
- `PUT /eventos/:id` y `DELETE /eventos/:id` usan `requireMiembro` pero en el controlador vuelven a comprobar si el usuario es el creador o admin.
- No es un bug (la lógica es correcta), pero mezcla responsabilidades entre middleware y controlador.

---

### Rutas sin usar / posibles huérfanas

**5. `perfil.js` — `GET /datos` no existe**
- En `CLAUDE.md` se documenta `GET /api/perfil/datos` pero esa ruta no está en `perfil.js`.
- El controlador correspondiente (`getDatos`) tampoco existe en `perfilController.js`.
- Es probable que esta ruta nunca se implementara o fue eliminada y el CLAUDE.md no se actualizó.

**6. `auth.js:19` — `POST /refresh` implementado pero no documentado en CLAUDE.md**
- El endpoint `POST /api/auth/refresh` existe en el router y tiene su controlador (`refreshToken`), pero no aparece en la lista de endpoints del `CLAUDE.md`.
- No es un problema funcional, pero conviene documentarlo.

---

### Sin problemas

- `publicaciones.js`, `favoritos.js`, `compra.js`, `tareas.js`, `facturas.js` — limpios, sin rutas huérfanas.
- `src/middleware/auth.js` — bien estructurado, `getMiembroActivo` correctamente compartida como helper interno.

---

## Sección 4 — `backend/src/utils/compatibilidad.js`

### Estado general

El fichero está limpio y sin código muerto. Sin embargo hay varios problemas de lógica y coherencia:

**1. El desglose usa claves distintas a los campos reales de la BD**
- `calcularCompatibilidad` devuelve `desglose.visitas` y `desglose.fiestas` (líneas 50–51), pero los campos en BD se llaman `frecuencia_visitas` y `tolerancia_fiestas`.
- El frontend en `AnuncioPublico.jsx` usa `desglose.frecuencia_visitas` y `desglose.tolerancia_fiestas` en `DIMENSIONES`, por lo que **los valores del desglose nunca coinciden** con las claves que busca el frontend — siempre son `undefined`.
- Solución: renombrar las claves del desglose a `frecuencia_visitas` y `tolerancia_fiestas`.

**2. `matchOcupacion` tiene una rama inalcanzable**
- Líneas 20–21: si `u === 'ESTUDIO_Y_TRABAJO'` devuelve `0.5`, y si `g === 'ESTUDIO_Y_TRABAJO'` también devuelve `0.5`. El `return 0.5` final (línea 21) nunca se alcanza porque los dos casos anteriores ya cubren todo lo que no es `u === g`.
- Solución: eliminar la segunda condición del `if` y el `return 0.5` del final, o simplificar a:
  ```js
  return u === g ? 1.0 : 0.5
  ```

**3. Los pesos del score no suman exactamente 1.0**
- Pesos actuales: `0.20 + 0.20 + 0.15 + 0.15 + 0.10 + 0.10 + 0.10 = 1.00`. Correcto, suman 1.
- Sin embargo la suma máxima teórica es 100 pero la mínima real con todos los campos a `null` devuelve `0.5 * 100 = 50` (por los valores por defecto de `matchOrdinal`), no 0. Esto es intencionado (campos vacíos = neutral), pero conviene documentarlo.

**4. `calcularScore` es un wrapper de una sola línea útil pero confuso de nombre**
- `calcularScore` hace lo mismo que `calcularCompatibilidad` pero extrae solo el `.score` y recibe el formato plano de la query SQL (`pcg_horario`, `pcg_ambiente`…).
- No es un problema, pero el nombre es ambiguo respecto a `calcularCompatibilidad`. Un nombre más claro sería `calcularScoreDesdeQuery`.

**5. `ORDEN` repite los mismos enums que los validators**
- Las claves y valores de `ORDEN` (`MADRUGADOR`, `INTERMEDIO`, `NOCTURNO`…) son los mismos que están hardcodeados en `perfilValidator.js` y `gruposValidator.js`.
- Si se cambiara un valor de enum en la BD habría que actualizarlo en tres sitios distintos.
- Solución: exportar las constantes desde `validators/convivenciaEnums.js` y usarlas también aquí.

---

## Sección 5 — Páginas frontend (`frontend/src/pages/`)

### Componentes duplicados entre ficheros

**1. `CarruselFotos` definido dos veces**
- `PerfilUsuario.jsx:10` y `PerfilPublicoUsuario.jsx:10` tienen exactamente el mismo componente `CarruselFotos` (lógica de índice, flechas y dots).
- Solución: moverlo a `frontend/src/components/CarruselFotos.jsx` e importarlo en ambas páginas.

**2. `useInView` y `Reveal` duplicados en `Home.jsx` y `FAQ.jsx`**
- `Home.jsx:16` y `FAQ.jsx:10` definen `useInView` con lógica idéntica (IntersectionObserver, `threshold`, `unobserve` al cruzar).
- Ambos también definen un componente `Reveal` con animación de fade-up usando el mismo hook.
- Diferencia: `Home.jsx` añade la prop `from` para soportar animaciones laterales; `FAQ.jsx` no la tiene.
- Solución: extraer `useInView` a `frontend/src/hooks/useInView.js` y `Reveal` a `frontend/src/components/Reveal.jsx` con soporte de `from`.

**3. Header idéntico en `Home.jsx` y `FAQ.jsx`**
- El bloque de header (logo, botones de navegación condicionales por estado de sesión, modales de login/registro) es prácticamente idéntico en ambas páginas (~80 líneas duplicadas).
- Diferencia mínima: `Home.jsx` usa `tieneGrupo` recibido por props; `FAQ.jsx` lo obtiene de `useAuth`.
- Solución: extraer a un componente `PublicHeader` en `frontend/src/components/PublicHeader.jsx`.

**4. Footer idéntico en `Home.jsx` y `FAQ.jsx`**
- El bloque de footer (columnas con links de plataforma y ayuda) es exactamente el mismo en ambas páginas.
- Solución: extraer a `frontend/src/components/PublicFooter.jsx`.

---

### Primitivos de formulario no reutilizados

**5. `CreacionGrupo.jsx` redefine `IconInput`, `baseCls`, `Label`, `FieldError`, `Section` localmente**
- `frontend/src/components/FormPrimitivos.jsx` exporta exactamente esos primitivos, y ya los usan `EditarUsuario.jsx`, `EditarPerfilGrupo.jsx` y `PublicacionFormulario.jsx`.
- `CreacionGrupo.jsx:25–73` los redefine localmente (versiones idénticas o casi idénticas).
- Solución: importarlos desde `FormPrimitivos.jsx` y eliminar las definiciones locales.

---

### Convención de nombres

**6. `favoritos.jsx` — nombre de fichero en minúsculas**
- Todos los ficheros de página están en PascalCase según las convenciones del proyecto (ver CLAUDE.md).
- `favoritos.jsx` debería llamarse `Favoritos.jsx`.
- La ruta en `App.jsx` también tendría que actualizarse si se renombra.

---

### Definición local de constante compartida

**7. `AnuncioPublico.jsx:14` — `CARD_SHADOW` definida localmente**
- `CARD_SHADOW` ya está exportada de `frontend/src/lib/convivencia.js` y es usada desde allí en `GrupoPerfil.jsx`, `PerfilPublicoGrupo.jsx`, `GrupoDashboard.jsx`, etc.
- `AnuncioPublico.jsx` la redefine localmente en lugar de importarla.
- Solución: eliminar la definición local e importarla desde `convivencia.js`.

---

### Sin problemas relevantes

- `Publicacion.jsx`, `AccesoGrupo.jsx`, `GrupoDashboard.jsx`, `Tareas.jsx`, `MisFacturas.jsx`, `ListaCompra.jsx`, `Facturas.jsx`, `Calendario.jsx`, `Chat.jsx`, `GrupoPerfil.jsx` — limpios, sin código muerto ni duplicaciones significativas.
- `BuscarPage.jsx` — pattern de race condition auth correctamente implementado con `if (cargando) return`.

---

## Sección 6 — Componentes (`frontend/src/components/`)

### Código duplicado entre componentes

**1. `GoogleIcon` definido dos veces**
- `LoginModal.jsx:8` y `RegistroModal.jsx:8` definen exactamente el mismo SVG inline del logo de Google.
- Solución: extraer a un componente compartido `GoogleIcon` en un fichero propio o en un fichero de iconos auxiliares, e importarlo en ambos modales.

**2. Estilos de input inconsistentes entre modales y formularios**
- `LoginModal.jsx` y `RegistroModal.jsx` usan inputs con clases propias (`border rounded-xl px-4 py-3`), mientras que los formularios multi-paso usan `FormPrimitivos.jsx` (`border-2 rounded-2xl py-4`).
- No hay un bug, pero sí una inconsistencia visual visible al comparar el modal de login con los formularios de edición.
- No es obligatorio unificar (los modales son más compactos deliberadamente), pero conviene documentarlo.

---

### `FormPrimitivos.jsx` — bien estructurado

- `IconInput`, `baseCls`, `baseClsPlain`, `textareaCls`, `Label`, `FieldError`, `Section`, `PillGroup`, `BoolPillGroup`, `StepBar` — todos exportados correctamente y usados en `EditarUsuario.jsx`, `EditarPerfilGrupo.jsx` y `PublicacionFormulario.jsx`.
- La diferencia entre `baseCls` (con icono, `pl-11`) y `baseClsPlain` (sin icono, `px-4`) está bien separada y documentada con comentario.
- El componente `StepBar` recibe `steps` y `stepMeta` como props, correctamente desacoplado del módulo padre.

---

### `DonutChart.jsx` — sin problemas

- `FILL_MAP` para convertir valores de enum a porcentaje visual — correcto.
- El componente es stateless (recibe `valor`, `labels`, `color`, `sublabel`). Limpio.
- Nótese que `FILL_MAP` también usa los mismos valores de enum que están hardcodeados en los validators. Si se añadieran nuevos valores en la BD, habría que actualizarlo aquí también.

---

### `CustomSelect.jsx` — sin problemas

- Detecta si el dropdown debe abrirse hacia arriba (`openUp`) según el espacio disponible. Solución correcta para dropdowns cerca del borde inferior de pantalla.
- Solo se usa en `EditarUsuario.jsx` (selector de país). Componente limpio.

---

### `ModalEvento.jsx` — sin problemas

- Formulario unificado de creación y edición (diferencia por prop `evento`). Correcto.
- Validación inline mínima antes de llamar a la API. Aceptable para el volumen de campos.

---

### Sin componentes huérfanos

Todos los componentes en `components/` tienen al menos un consumidor identificado. No hay ficheros muertos.

---

## Sección 7 — `frontend/src/lib/`

### `apiFetch.js` — lógica de refresh de token

El fichero implementa un patrón de cola para refresh de access token con un par de notas:

**1. `refrescando` y `colaEspera` son variables de módulo (singleton)**
- Al ser variables a nivel de módulo, sobreviven entre navegaciones dentro de la SPA.
- Si se produjera un logout y un nuevo login en la misma sesión sin recarga, la cola podría tener callbacks viejos.
- En la práctica no es un problema porque el logout hace `window.location.href = '/'` que recarga la página, pero conviene ser consciente de ello.

**2. La URL de la API está hardcodeada como fallback**
- `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'` — correcto, fallback explícito para desarrollo.
- El problema es que en todos los fetch del frontend la URL ya pasa a través de `apiFetch`, que usa `API_URL`, excepto en `LoginModal.jsx` y `RegistroModal.jsx` donde la redirección OAuth usa `import.meta.env.VITE_API_URL` directamente (sin fallback):
  ```js
  window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`
  ```
- Si `VITE_API_URL` no está definido, `import.meta.env.VITE_API_URL` es `undefined` y la URL queda como `undefined/api/auth/google`.
- Solución: usar la misma constante `API_URL` en los modales, o extraer `API_URL` a un fichero compartido (`lib/config.js`).

---

### `convivencia.js` — bien estructurado, con un problema potencial

**3. `TARJETAS_CONVIVENCIA_USUARIO` y `TARJETAS_CONVIVENCIA_GRUPO` son casi idénticos**
- Los dos arrays tienen exactamente los mismos 6 campos y los mismos colores. Solo difiere `sublabel` de `horario`: `'Horario'` vs `'Ritmo'`.
- No es un bug, pero si se añade un campo a uno hay que recordar añadirlo al otro.
- Solución opcional: definir uno como base y el otro como `[...BASE_DONUTS].map(d => d.campo === 'horario' ? {...d, sublabel: 'Ritmo'} : d)`.

**4. `CAMPOS_CONVIVENCIA` no está exportada**
- Se usa internamente en `calcPct` pero no se exporta. Si alguna página quisiera calcular el porcentaje de relleno sin llamar a `calcPct`, tendría que redefinirla.
- No es un problema activo, pero exportarla daría más flexibilidad sin coste.

**5. `labelsUsuario` y `labelsGrupo` repiten las mismas claves de enum**
- Ambos tienen los mismos campos (`horario`, `ambiente`, `frecuencia_visitas`, `tolerancia_fiestas`, `ocupacion`, `limpieza_orden`, `nivel_ruido`) con textos distintos (primera vs tercera persona).
- No hay duplicación real de lógica, es contenido distinto. Correcto.

---

### `schemas.js` — sin problemas relevantes

- `editarGrupoSchema` y `crearGrupoSchema` son distintos correctamente: editar tiene `descripcion` y `ciudad`, crear no.
- `convivenciaSchema` replica parte de la validación del backend (mínimo 3 campos). Es la práctica correcta para validación doble (frontend + backend).
- `publicacionSchema` no valida `habitaciones_totales`, `planta`, `tamano_piso` como obligatorios — consistente con el formulario donde son opcionales.

---

## Sección 8 — Ficheros sin usar / inconsistencias de imports

### Ruta documentada pero no implementada

**1. `/perfil/convivencia` — ruta fantasma**
- `CLAUDE.md` documenta la ruta `/perfil/convivencia` con el componente `PerfilConvivencia`, pero:
  - No existe `PerfilConvivencia.jsx` en `frontend/src/pages/`.
  - No hay `<Route path="convivencia" ...>` en `App.jsx` bajo `/perfil`.
- La funcionalidad probablemente se integró dentro de `EditarUsuario.jsx` (paso 2 del formulario) y la página standalone nunca llegó a crearse.
- Solución: actualizar `CLAUDE.md` eliminando la referencia a esta ruta.

---

### Import con nombre de fichero incorrecto

**2. `App.jsx:16` importa `Favoritos` desde `./pages/Favoritos.jsx` pero el fichero se llama `favoritos.jsx`**
- En Windows el sistema de ficheros es insensible a mayúsculas, por lo que el import funciona localmente.
- En un entorno Linux (servidor de producción, CI) fallará con `Module not found`.
- Solución: renombrar el fichero a `Favoritos.jsx` (ya detectado en Sección 5, punto 6).

---

### Estado duplicado entre `App.jsx` y `AuthContext`

**3. `tieneGrupo` definido dos veces**
- `AuthContext.jsx` exporta `tieneGrupo` y `setTieneGrupo` como fuente de verdad.
- `App.jsx:36` define su propio `useState(false)` para `tieneGrupo` local, sincronizado mediante un `useEffect([user?.id])` que llama a `/api/grupos/mi-grupo` otra vez.
- Este estado local se pasa como prop a `<Home tieneGrupo={...}>` y `<AccesoGrupo setTieneGrupo={...}>`.
- Resultado: hay dos peticiones a `/api/grupos/mi-grupo` al cargar la app (una en `AuthContext`, otra en `App.jsx`) y dos fuentes de verdad que pueden desincronizarse.
- Solución: usar directamente `tieneGrupo` de `useAuth()` en `App.jsx` y eliminar el estado local y el `useEffect` duplicado.

---

### `API_URL` definida en tres sitios distintos

**4. `apiFetch.js:1`, `AuthContext.jsx:4` y los modales de login/registro**
- `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'` aparece de forma idéntica en `apiFetch.js` y `AuthContext.jsx`.
- Los modales usan `import.meta.env.VITE_API_URL` directamente sin fallback.
- Solución: extraer a `lib/config.js` y exportar `export const API_URL = ...`. Importar desde ahí en los tres sitios.

---

### Sin ficheros muertos en el frontend

- `App.css` — importado en `App.jsx`, necesario para la configuración de fuentes y Tailwind.
- `habitacionhero.jpg` — usado en `Home.jsx`.
- `components/ui/chart.jsx` — usado en `GrupoDashboard.jsx`.
- No hay ficheros `.jsx` o `.js` sin ningún importador.

---

## Sección 9 — `.gitignore`

### Estado general

El proyecto tiene tres `.gitignore`:
- Raíz (`D:\tfg\pisoscompartidos\.gitignore`) — cubre todo el monorepo
- `frontend/.gitignore` — generado por Vite, cubre specificamente el frontend
- No hay `.gitignore` específico en `backend/`

---

### Sin problemas críticos

- `node_modules/`, `.env`, `dist/` están correctamente ignorados en ambos ficheros.
- `*.local` en `frontend/.gitignore` captura `.env.local`, `.env.development.local`, etc.
- `.claude/` y `.agents/` están en el gitignore raíz (excepto `CLAUDE.md` que sí se versiona).

---

### Observaciones menores

**1. `revision_codigo.md` en la raíz no está en `.gitignore`**
- El fichero que estás leyendo ahora mismo quedará incluido en el repositorio si se hace `git add .`.
- Si es un documento de trabajo interno que no debería subirse al repo, añadir `revision_codigo.md` al `.gitignore` raíz.

**2. No existe `.env.example`**
- Es buena práctica comprometer un `.env.example` con las claves necesarias pero sin valores reales, para que cualquier colaborador sepa qué variables configurar.
- Especialmente útil para un TFG que se presenta ante un tribunal: el evaluador podrá saber qué credenciales necesita configurar para arrancar el proyecto.

**3. `seed.sql` y `seed_demo_convivencia.sql` en la raíz — no ignorados**
- Están versionados, lo cual es correcto para un TFG (el tribunal los necesita para ejecutar la demo).
- Verificar que no contienen contraseñas reales u otros datos sensibles en los datos de seed.

**4. Redundancia menor entre los dos `.gitignore`**
- `node_modules` está en ambos (raíz y frontend). No causa problemas — git comprueba el `.gitignore` más cercano al fichero.
