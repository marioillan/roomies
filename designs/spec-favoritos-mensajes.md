# Favoritos y Mensajes — Especificación para handoff

Dos vistas del módulo, ambas dentro del **LayoutPerfil** existente. Pensadas para React + Tailwind, unidades en `rem` (`1rem = 16px`).

> ⚠️ **IMPORTANTE — NO TOCAR EL ASIDE.**
> El aside lateral (barra de navegación emerald de la izquierda) **ya está implementado** en el proyecto, tanto en el `LayoutPerfil` del **usuario** como en el del **grupo de convivencia**. Estas vistas se montan **dentro** de ese layout existente: se debe reutilizar el aside tal cual, sin modificar su estructura, iconos, orden ni estilos. Lo que aquí se especifica es **solo el contenido del `<main>`** (la zona a la derecha del aside).
>
> - Vista **Favoritos** → se renderiza dentro del `LayoutPerfil` del **usuario** (su aside: home · buscar · favoritos · grupo · chat). Marca el item "favoritos" como activo.
> - Vista **Mensajes (solicitante)** → dentro del `LayoutPerfil` del **usuario**. Marca "chat/mensajes" como activo.
> - Vista **Mensajes (administrador)** → dentro del `LayoutPerfil` del **grupo de convivencia** (su aside: home · grupo · tareas · facturas · compra · calendario · chat). Marca "chat/mensajes" como activo.
>
> En los mockups de referencia el aside se dibuja para dar contexto, pero en producción **es el aside real del layout, no uno nuevo**.

---

## 0. Sistema compartido (recordatorio)

### Tipografía
```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Manrope:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```
- **Display / títulos:** Bricolage Grotesque 500
- **Body / UI:** Manrope 400–600
- **Datos / eyebrow / mono:** Geist Mono 500–600

### Paleta
| Rol | Token | Hex |
|---|---|---|
| Fondo página | slate-100 | `#f1f5f9` |
| Card | white | `#fff` (borde slate-100) |
| Acento | emerald-600 | `#059669` (hover emerald-700 `#047857`) |
| Burbuja propia (chat) | emerald-600 | `#059669` texto blanco |
| Texto | slate-900 `#0f172a` / muted slate-500 `#64748b` / very-muted slate-400 `#94a3b8` |
| Borde / divisor | slate-100 `#f1f5f9` / slate-200 `#e2e8f0` |

### Main (zona de contenido, a la derecha del aside)
- `flex: 1`, padding `2rem 2.5rem` (tablet `1.5rem`, móvil `1rem`)
- Header: eyebrow (Geist Mono `0.625rem`/600/UPPER/tracking `0.16em`/slate-500) + h1 Bricolage Grotesque `2.25rem`/500/tracking `-0.02em`

### Card base
- bg white, radius `1.25rem`, shadow `0 1px 0 rgba(15,23,42,0.04), 0 0.5rem 2rem rgba(15,23,42,0.06)`, border `1px solid #f1f5f9`

### Avatares
- Círculo con color de fondo por entidad + inicial blanca Manrope 600
- Colores usados: pink `#ec4899` · blue `#3b82f6` · emerald `#10b981` · violet `#8b5cf6` · amber `#f59e0b`

---

# A · VISTA FAVORITOS

Listado de publicaciones (habitaciones) que el usuario ha guardado. Cada una permite contactar por **chat**, **llamada** o **ambas**, según lo que tenga habilitado el anunciante. Se monta en el `LayoutPerfil` del **usuario** (no tocar su aside).

## A.1 Header
- Eyebrow: `"{n} publicaciones guardadas"`
- h1: **"Tus favoritos"**
- Derecha: filtros de orden por precio — chips **Todos · Más baratos · Más caros** (el activo bg slate-900 color white radius `0.625rem`; inactivos transparentes color slate-600)

## A.2 Listado
Columna vertical de tarjetas, gap `1rem`.

### Tarjeta de publicación (`.fv-card`)
- Layout horizontal (flex), radius `1.25rem`, overflow hidden, border slate-100, shadow base
- Hover: `translateY(-1px)` + shadow más marcada

**Foto (izquierda):**
- Width `13rem`, placeholder con franjas diagonales (`repeating-linear-gradient(135deg, color1 0 14px, color2 14px 28px)`) — en producción es la foto real de la habitación
- **Corazón** arriba-derecha (`2rem` círculo bg `rgba(255,255,255,0.9)` color pink-500) para quitar de favoritos
- (Nota: NO se muestra etiqueta de tipo — todas son habitaciones)
- En móvil (≤ 52rem) la foto pasa arriba a `height: 9rem` y la tarjeta se apila en columna

**Cuerpo (derecha, padding `1.25rem 1.5rem`, flex column):**
1. Fila superior (space-between):
   - Izquierda: título Bricolage Grotesque `1.25rem`/500 + ubicación (icono pin + texto Manrope `0.8125rem` slate-500)
   - Derecha: precio Bricolage Grotesque `1.5rem`/500 + periodo (Geist Mono `0.6875rem` slate-400, ej. "/mes")
2. **Tags** (flex wrap gap `0.375rem`, margin-top `0.75rem`): cada tag bg slate-100, color slate-600, Manrope `0.6875rem`, padding `0.25rem 0.5625rem`, radius pill (ej. "Sin gastos", "Wifi", "Exterior")
3. **Footer** (margin-top auto, padding-top `1rem`, space-between):
   - Izquierda: avatar `2rem` del anunciante + nombre (`0.8125rem`/600) + "GUARDADO HACE X" (Geist Mono `0.625rem` slate-400 UPPER)
   - Derecha: **botones de contacto** (ver A.3)

## A.3 Botones de contacto (según `contacto: 'chat' | 'llamada' | 'ambas'`)
- **Botón Mensaje** (chat): `.fv-btn-chat` bg emerald-600 color white, icono burbuja + "Mensaje"
- **Botón Llamar**: `.fv-btn-call` bg slate-100 border slate-200 color slate-900, icono teléfono + "Llamar"
- Botón base: padding `0.625rem 1rem`, radius pill, Manrope `0.8125rem`/600, gap icono `0.4375rem`

Lógica de render:
- `chat` → solo botón "Mensaje"
- `llamada` → solo botón "Llamar"
- `ambas` → "Mensaje" (principal emerald) + botón **solo-icono** de teléfono (`2.5rem` cuadrado, estilo call) al lado

## A.4 Mock data
```js
const favoritos = [
  { id:1, titulo:"Habitación luminosa en Realejo",          zona:"Granada · Realejo",          precio:320, periodo:"/mes",
    anunciante:"Marta R.",     inicial:"M", color:"#ec4899", tags:["Sin gastos","Wifi","Exterior"],       contacto:"ambas",   guardado:"hace 2 días" },
  { id:2, titulo:"Habitación amplia cerca de la facultad",  zona:"Granada · Cartuja",          precio:280, periodo:"/mes",
    anunciante:"Inmo Cartuja", inicial:"I", color:"#3b82f6", tags:["Amueblada","Wifi","Cerca facultad"],   contacto:"llamada", guardado:"hace 5 días" },
  { id:3, titulo:"Habitación individual en el Centro",      zona:"Granada · Centro",           precio:350, periodo:"/mes",
    anunciante:"Diego S.",     inicial:"D", color:"#10b981", tags:["No fumador","Tranquila","Exterior"],   contacto:"chat",    guardado:"hace 1 semana" },
  { id:4, titulo:"Habitación en piso de chicas",            zona:"Granada · Camino de Ronda",  precio:290, periodo:"/mes",
    anunciante:"Lucía P.",     inicial:"L", color:"#8b5cf6", tags:["Solo chicas","Wifi","Calefacción"],    contacto:"ambas",   guardado:"hace 1 semana" },
];
```

## A.5 Interacciones
- **Corazón:** quita la publicación de favoritos (con confirmación o undo).
- **Filtros:** ordenan el listado por precio (asc/desc) o muestran todos.
- **Mensaje:** abre el chat con ese anunciante (→ vista Mensajes).
- **Llamar:** lanza la llamada (`tel:`), solo si el anunciante lo tiene habilitado.

## A.6 Responsive Favoritos
- ≤ 64rem: main padding `1.5rem`
- ≤ 52rem: tarjeta en columna, foto arriba `height: 9rem`
- ≤ 40rem: el aside pasa a su modo móvil (definido por el layout — no tocar)

---

# B · VISTA MENSAJES (chat usuario ↔ administrador del grupo)

Dos perspectivas de la **misma conversación**, cada una dentro de su propio layout (no tocar ninguno de los dos asides):
- **Solicitante** → `LayoutPerfil` del usuario.
- **Administrador** → `LayoutPerfil` del grupo de convivencia.

Layout **master-detail**: a la izquierda el listado de conversaciones, a la derecha el chat abierto.

## B.1 Estructura del `<main>`

```
Header — eyebrow + h1 "Mensajes"
┌─────────────────────────────────────────────────────────┐
│  ms-shell (grid 20rem / 1fr · card redondeada)           │
│  ┌────────────────┬──────────────────────────────────┐ │
│  │ LISTADO         │  CHAT ABIERTO                     │ │
│  │ conversaciones  │  ├ cabecera (avatar + nombre + …) │ │
│  │ (sin buscador)  │  ├ body burbujas (scroll)         │ │
│  │                 │  └ composer (input + enviar)      │ │
│  └────────────────┴──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

- El shell es una card (bg white, radius `1.25rem`, overflow hidden, border slate-100) con `grid-template-columns: 20rem 1fr`.
- Altura del shell: que ocupe el alto disponible del main (en el mock el contenedor mide ~`46rem` de alto; en producción `height: 100%` del main / `calc(100vh - header)`).

## B.2 Listado de conversaciones (columna izquierda)
- Border-right slate-100, scroll vertical interno.
- **SIN barra de búsqueda** — el listado de conversaciones aparece directamente desde arriba.
- Cada fila `.ms-conv` (padding `0.875rem 1.25rem`, gap `0.75rem`):
  - Avatar `2.75rem` con color/inicial de la contraparte
  - Bloque: línea 1 = nombre (`0.875rem`/600) + hora (Geist Mono `0.625rem` slate-400, a la derecha); línea 2 = último mensaje (truncado; en negrita slate-900 si hay no leídos, slate-500 si no) + **badge** de no leídos (círculo emerald, Geist Mono `0.625rem` blanco) si > 0
  - Hover: bg slate-50
  - **Activa:** bg emerald-50 + `box-shadow: inset 0.1875rem 0 0 #059669` (barra emerald a la izquierda)

## B.3 Panel de chat (columna derecha)
**Cabecera** (`.ms-chat-head`, padding `0.875rem 1.25rem`, border-bottom slate-100):
- Avatar `2.5rem` + nombre de la contraparte (`0.9375rem`/600) + subtítulo (Geist Mono `0.6875rem` slate-500)
- Acciones a la derecha (botones icono `2.25rem`, color slate-500, hover bg slate-100):
  - **Ver perfil** (si admin) / **Ver publicación** (si solicitante)
  - Kebab (3 puntos)

**Body** (`.ms-chat-body`, flex column gap `0.75rem`, padding `1.5rem 1.25rem`, bg slate-50, scroll):
- Separador de día centrado (`.ms-daysep`): "Hoy" — Geist Mono `0.625rem` UPPER, pill bg white border slate-100
- **Burbujas** (`max-width: 70%`, padding `0.625rem 0.875rem`, radius `1rem`, Manrope `0.875rem`/1.4):
  - **Propia (`yo`):** align-self end, bg emerald-600 color white, `border-bottom-right-radius: 0.25rem`
  - **Otro:** align-self start, bg white border slate-100 color slate-900, `border-bottom-left-radius: 0.25rem`
  - Hora dentro de la burbuja (Geist Mono `0.625rem`): blanco translúcido si propia, slate-400 si otro

**Composer** (`.ms-composer`, padding `0.875rem 1.25rem`, border-top slate-100):
- **SIN botón de adjuntar archivo** — solo:
  - Input de texto (flex 1, bg slate-50, border slate-200, radius pill, padding `0.75rem 1rem`)
  - Botón **Enviar** circular `2.75rem` bg emerald-600 (hover emerald-700), icono avión de papel

## B.4 Datos según perspectiva

**Solicitante** — conversaciones con grupos/anunciantes:
```js
[
  { id:1, nombre:"Casa Lavanda",  sub:"Realejo · 320€",            inicial:"C", color:"#ec4899", ultimo:"¡Genial! ¿Te vendría bien verla el jueves?", hora:"12:40", noleidos:2, activa:true },
  { id:2, nombre:"Piso Cartuja",  sub:"Cartuja · 280€",            inicial:"P", color:"#3b82f6", ultimo:"La habitación sigue disponible, sí.",        hora:"Ayer",  noleidos:0, activa:false },
  { id:3, nombre:"Piso de chicas",sub:"Camino de Ronda · 290€",    inicial:"L", color:"#8b5cf6", ultimo:"Tú: Vale, ¡muchas gracias!",                 hora:"Lun",   noleidos:0, activa:false },
]
// Cabecera del chat: "Casa Lavanda" · "Realejo · habitación 320€"
// Acción cabecera: "Ver publicación"
```

**Administrador** — conversaciones con solicitantes:
```js
[
  { id:1, nombre:"Lucía Vargas", sub:"27 · Diseñadora",  inicial:"L", color:"#ec4899", ultimo:"¡Genial! ¿Te vendría bien verla el jueves?", hora:"12:40", noleidos:0, activa:true },
  { id:2, nombre:"Diego Serra",  sub:"24 · Estudiante",  inicial:"D", color:"#10b981", ultimo:"Hola, ¿la habitación sigue libre?",          hora:"10:15", noleidos:1, activa:false },
  { id:3, nombre:"Marta Ríos",   sub:"29 · Enfermera",   inicial:"M", color:"#f59e0b", ultimo:"Tú: Te paso la dirección por aquí.",         hora:"Ayer",  noleidos:0, activa:false },
]
// Cabecera del chat: "Lucía Vargas" · "Solicitante · 27 años"
// Acción cabecera: "Ver perfil"
```

**Mensajes de la conversación abierta** (los mismos vistos desde ambos lados — `de: 'yo' | 'otro'`):
```js
[
  { de:"otro", texto:"¡Hola! Vi que te interesa la habitación del Realejo 😊", hora:"12:05" },
  { de:"yo",   texto:"¡Hola! Sí, me encanta la zona. ¿Sigue disponible?",       hora:"12:18" },
  { de:"otro", texto:"Sí, sigue libre. Son 320€ al mes, gastos aparte (luz, agua y wifi se reparten entre los 3).", hora:"12:22" },
  { de:"yo",   texto:"Perfecto. ¿Se podría visitar esta semana?",               hora:"12:35" },
  { de:"otro", texto:"¡Genial! ¿Te vendría bien verla el jueves?",              hora:"12:40" },
]
```
> `de:'yo'` se renderiza como burbuja propia (emerald, derecha); `de:'otro'` como burbuja de la contraparte (blanca, izquierda). La misma conversación es simétrica entre las dos perspectivas.

## B.5 Responsive Mensajes
- ≤ 64rem: main padding `1.5rem`
- ≤ 52rem: el shell pasa a 1 columna; se muestra **solo el chat abierto** (el listado se oculta y se accede por un botón "volver" — patrón típico de móvil)
- ≤ 40rem: aside en modo móvil (lo gestiona el layout — no tocar)

## B.6 Interacciones
- **Click en conversación:** marca activa y abre su chat en el panel derecho.
- **Enviar:** añade burbuja propia al final + scroll al fondo.
- **Ver perfil / Ver publicación:** navega al perfil del solicitante (admin) o a la publicación de la habitación (solicitante).

---

## C · Tailwind cheat-sheet (común a las dos vistas)

| Elemento | Clases |
|---|---|
| Main | `flex-1 p-8 lg:p-6 sm:p-4 min-w-0` |
| Card | `bg-white border border-slate-100 rounded-[1.25rem] shadow-sm` |
| Eyebrow | `font-mono text-[0.625rem] font-semibold tracking-[0.16em] uppercase text-slate-500` |
| h1 | `font-display text-[2.25rem] font-medium -tracking-[0.02em] text-slate-900` |
| Botón chat (Mensaje) | `bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[0.8125rem] rounded-full px-4 py-2.5 inline-flex items-center gap-1.5` |
| Botón llamar | `bg-slate-100 hover:bg-white border border-slate-200 text-slate-900 font-semibold text-[0.8125rem] rounded-full px-4 py-2.5 inline-flex items-center gap-1.5` |
| Tag | `bg-slate-100 text-slate-600 text-[0.6875rem] font-medium px-2.5 py-1 rounded-full` |
| Conversación activa | `bg-emerald-50 shadow-[inset_3px_0_0_#059669]` |
| Burbuja propia | `self-end bg-emerald-600 text-white rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[70%]` |
| Burbuja otro | `self-start bg-white border border-slate-100 text-slate-900 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[70%]` |
| Botón enviar | `w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center` |

---

## D · Notas de implementación

- **NO modificar el aside** de ninguno de los dos layouts. Estas vistas son el contenido del `<main>` y nada más. Reutilizar `LayoutPerfil` (usuario) y el layout del grupo de convivencia tal cual existen.
- **Favoritos** vive en el layout del usuario; **Mensajes** existe en ambos layouts (la misma vista de chat, parametrizada por el rol/perspectiva del usuario logueado).
- **Sin buscador** en el listado de conversaciones y **sin adjuntar archivos** en el composer (decisión de producto).
- La conversación es la misma entidad para ambas partes: el backend devuelve los mensajes con un flag de emisor; el front decide `yo`/`otro` según el usuario logueado.
- **Contacto en Favoritos:** el campo `contacto` lo define el anunciante al publicar (chat / llamada / ambas). El front muestra los botones correspondientes; "Llamar" usa `tel:`.
- **Accesibilidad:** botones de icono (corazón, enviar, ver perfil, kebab) con `aria-label`.
