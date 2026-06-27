# Publicación y Anuncio del grupo — Especificación para handoff

Dos vistas relacionadas del **módulo de marketplace** (Housie):
- **A · Publicación (pública)** — detalle del anuncio que ve cualquier usuario solicitante. Vive en el marketplace, con su **header propio** (NO el aside del LayoutPerfil).
- **B · Anuncio del grupo (admin)** — el mismo anuncio visto desde el **grupo de convivencia**. Solo el **administrador** del grupo accede; puede ver el anuncio público o editar su información. Mantiene el **aside del grupo de convivencia** (ya implementado — no tocar).

> React + Tailwind. Unidades en `rem` (`1rem = 16px`). Paleta y tipografía heredadas del proyecto.

---

## 0. Sistema compartido

### Tipografía
```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Manrope:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```
- **Display / títulos:** Bricolage Grotesque 500 (brand del header 700)
- **Body / UI:** Manrope 400–600
- **Datos / eyebrow / mono:** Geist Mono 500–600

### Paleta
| Rol | Token | Hex |
|---|---|---|
| Fondo página | slate-100 | `#f1f5f9` |
| Card | white `#fff` (borde slate-100 `#f1f5f9`) | |
| Acento | emerald-600 | `#059669` (hover emerald-700 `#047857`) |
| Acento claro / éxito | emerald-50 `#ecfdf5` / emerald-100 `#d1fae5` / emerald-500 `#10b981` / emerald-700 `#047857` |
| Texto | slate-900 `#0f172a` / muted slate-500 `#64748b` / very-muted slate-400 `#94a3b8` / cuerpo slate-700 `#334155` |
| Borde | slate-200 `#e2e8f0` |
| Favorito (corazón) | pink-500 `#ec4899` |

### Card base
- bg white, radius `1.25rem`, shadow `0 1px 0 rgba(15,23,42,0.04), 0 0.5rem 2rem rgba(15,23,42,0.06)`, border `1px solid #f1f5f9`

### Chip (precio/atributos)
- inline-flex, gap `0.4375rem`, padding `0.5rem 0.875rem`, radius pill, Manrope `0.8125rem`/600, border slate-200, bg white, color slate-700
- variante precio: bg emerald-50, border emerald-100, color emerald-700
- icono inline 14×14 stroke 2

### Botones
- `.btn-pri`: bg emerald-600 → hover emerald-700, texto blanco
- `.btn-sec`: bg slate-100, border slate-200, color slate-900 → hover white
- Base: padding `0.75rem 1.125rem`, radius pill, Manrope `0.875rem`/600, gap icono `0.5rem`

### Ancho
- Ambas vistas centradas en `max-width: 80rem` (1280px).

---

# A · PUBLICACIÓN (vista pública)

Detalle del anuncio para el usuario solicitante. **Sin aside** — lleva el **header del marketplace**.

## A.1 Header del marketplace (Housie)
Barra superior full-width, bg white, border-bottom slate-200, padding `0.875rem 2.5rem`, flex align-center gap `1.5rem`:
- **Brand** "Housie" — Bricolage Grotesque `1.5rem`/**700**/tracking `-0.02em`, slate-900
- **Buscador** (centrado, `flex:1` max-width `34rem`, `margin: 0 auto`): pill bg slate-50, border slate-200, radius pill, padding `0.375rem 0.375rem 0.375rem 1rem`; contiene icono pin + input (placeholder/valor "Granada", Manrope `0.9375rem`) + **botón circular** `2.25rem` bg emerald-500 (hover emerald-600) con icono lupa
- **Acciones derecha** (flex gap `0.5rem`): botón icono **favoritos** (corazón) + botón icono **mensajes** (chat), ambos `2.5rem` redondos color slate-600 hover bg slate-100; **avatar** `2.5rem` redondo con `box-shadow: 0 0 0 2px #fff, 0 0 0 4px #10b981` (anillo emerald)

## A.2 Contenido — layout
- Padding del main `2rem 2.5rem`
- Botón "← Volver a la búsqueda" (secondary pequeño) arriba
- **Grid `1fr 20rem` gap `1.5rem`**, align-items start. ≤ 56rem → 1 columna.

## A.3 Columna izquierda
### Galería
- **Foto principal** `aspect-ratio: 16/9`, radius `1.25rem`. En producción = foto real; placeholder = franjas diagonales.
  - **Corazón favorito** arriba-derecha: `2.5rem` círculo bg `rgba(255,255,255,0.9)` backdrop-blur, color pink-500
  - **Contador** abajo-derecha: pill `rgba(15,23,42,0.75)` blanco, Geist Mono `0.6875rem`, formato `{activa+1} / {total}`
- **Miniaturas**: grid 4 columnas, gap `0.625rem`, `aspect-ratio: 1.3`, radius `0.75rem`, border 2px (activa → emerald-600). **SIN etiquetas** (nada de "Salón/Habitación").
  - **Más de 4 fotos:** se muestran 4 miniaturas; la **4ª** lleva overlay `rgba(15,23,42,0.6)` con **"+N"** (N = fotos restantes), Bricolage Grotesque `1.125rem` blanco. Al pulsarla → galería completa.
  - El contador de la foto principal refleja el total real (1/6, 2/6…).
- Click en miniatura → cambia la foto principal (estado `activa`).

### Card de cabecera
- **Título** Bricolage Grotesque `2.25rem`/500 — "Piso en Gonzalo Gallas"
- **Dirección** (icono pin + texto Manrope `0.9375rem` slate-500) — "Gonzalo Gallas 37, Granada"
- **Chips** (flex wrap gap `0.5rem`, margin-top `1.25rem`): `300 €/mes` (precio, emerald) · `1 hab. libre` · `4 hab. en total` · `Planta 3` · `Piso` · `Solo chicos`
- ⚠️ **NO** lleva pill "Visible en búsquedas" (ese estado solo se ve en la vista admin).

### Card Descripción
- Eyebrow "Descripción" + párrafo Manrope `1rem`/1.6 slate-700, `text-wrap: pretty`

### Card Comodidades
- Eyebrow "Comodidades" + grid 2 columnas gap `0.625rem`
- Cada comodidad: fila bg slate-50 border slate-100 radius `0.75rem` padding `0.75rem`, icono en cuadro `2.25rem` radius `0.625rem` bg emerald-50 color emerald-600 + label Manrope `0.875rem`/600
- Ej.: Wifi fibra · Lavadora · Calefacción · Cocina equipada · Amueblado · Terraza · TV · Aire acondicionado

## A.4 Columna derecha (sticky `top: 1.5rem`)
### Card de contacto
- **Precio destacado**: Bricolage Grotesque `2.25rem` "300 €" + "/mes" (slate-400)
- Eyebrow **"Publicado por"** + bloque: **avatar/foto de perfil del grupo** (`2.75rem` redondo, placeholder con franjas; en prod = foto del grupo) + **nombre del grupo** ("Casa Lavanda") Manrope `0.9375rem`/600 + debajo solo la **ciudad** ("Granada") en Geist Mono `0.6875rem` slate-500. (NO mostrar nombre del admin ni "Grupo de convivencia".)
- **Botones**: "Enviar mensaje" (primary, icono chat, ancho completo) + "Llamar" (secondary, icono teléfono, ancho completo)

### Card "Conoce a tus futuros compañeros"
- Eyebrow del mismo nombre
- **Bloque de compatibilidad** destacado (bg emerald-50, border emerald-100, radius `0.875rem`, padding `1rem`): **donut** `56px` (track emerald-100, progreso emerald-600, `strokeDashoffset` según %) con el **% en el centro** (Bricolage `0.9375rem` emerald-700) + texto "**87% de compatibilidad** / Muy buena afinidad con este grupo"
- **Avatares solapados** de los miembros (`2rem`, border blanco 2px, marginLeft `-0.625rem`) + "3 miembros"
- Botón "Ver perfil de convivencia" (secondary, ancho completo) → navega al perfil de convivencia del grupo

## A.5 Responsive (pública)
- ≤ 64rem: main padding `1.5rem`
- ≤ 56rem: layout a 1 columna (la columna de contacto baja debajo)
- ≤ 40rem: header con padding reducido; buscador puede colapsar

## A.6 Interacciones
- Corazón (galería) → guardar/quitar de favoritos
- Miniaturas → cambian foto principal; "+N" → abre galería completa
- Enviar mensaje → abre chat con el grupo (vista Mensajes, perspectiva solicitante)
- Llamar → `tel:` (si habilitado)
- Ver perfil de convivencia → perfil del grupo

---

# B · ANUNCIO DEL GRUPO (vista admin)

El mismo anuncio gestionado desde dentro del grupo. **Solo el administrador** del grupo. Mantiene el **aside del grupo de convivencia** (ya implementado — reutilizar, no tocar). Item activo del aside: "anuncio".

## B.1 Estructura

```
┌─[aside grupo]─┬──────────────────────────────────────────┐
│               │  Header admin:                            │
│               │   eyebrow "Anuncio del grupo · Casa…"     │
│               │   h1 "Tu anuncio"   [Visible] [Ver] [Edit]│
│               │                                           │
│               │  GRID 1fr / 19rem                         │
│               │  ┌────────────────────┬─────────────────┐ │
│               │  │ Galería (+Editar    │  Estado anuncio │ │
│               │  │ fotos) + cabecera + │  (toggle + btns)│ │
│               │  │ descripción +       │  Rendimiento    │ │
│               │  │ comodidades         │  (guardados,    │ │
│               │  │                     │   mensajes)     │ │
│               │  └────────────────────┴─────────────────┘ │
│               └───────────────────────────────────────────┘
```

## B.2 Aside (del grupo de convivencia — no tocar)
Iconos: home · grupo · **anuncio (activo)** · tareas · facturas · compra · calendario — abajo: chat · avatar · logout. Mismo estilo emerald que el resto del módulo del grupo.

## B.3 Header de admin
Flex space-between (wrap), margin-bottom `1.5rem`:
- **Izquierda:** eyebrow "Anuncio del grupo · Casa Lavanda" + h1 Bricolage `2.25rem` "Tu anuncio"
- **Derecha** (flex gap `0.625rem`):
  - Pill **"Visible en búsquedas"** (chip emerald: bg emerald-50, border emerald-100, color emerald-700, icono ojo) — este estado **solo aparece en la vista admin**
  - Botón **"Ver anuncio"** (secondary, icono ojo) → abre la vista pública (A)
  - Botón **"Editar información"** (primary, icono lápiz) → modo edición del anuncio

## B.4 Columna izquierda (idéntica a la pública en estructura, con extras de admin)
- **Galería** igual (foto 16:9 + 4 miniaturas + "+N"), pero en vez del corazón lleva un botón **"Editar fotos"** arriba-derecha (pill blanca translúcida, icono lápiz, Manrope `0.75rem`/600). Contador igual.
- **Card cabecera**: título (`1.875rem` aquí), dirección, mismos chips (300€/mes, 1 hab libre, 4 hab total, Planta 3, Piso, Solo chicos).
- **Descripción** y **Comodidades** iguales a la pública.

## B.5 Columna derecha — panel de gestión (sticky)
### Card "Estado del anuncio"
- Eyebrow "Estado del anuncio"
- Fila de estado (bg emerald-50, border emerald-100, radius `0.875rem`, padding `0.875rem 1rem`): dot emerald-500 + "Visible en búsquedas" (emerald-700, `0.875rem`/600) + **toggle** a la derecha (`2.5rem × 1.375rem`, pista emerald-600 cuando ON, thumb blanco `1rem` desplazado). Toggle OFF → anuncio oculto de búsquedas.
- Botones (columna, ancho completo): "Editar información" (primary) + "Ver como visitante" (secondary)

### Card "Rendimiento"
- Eyebrow "Rendimiento"
- Lista de métricas (cada fila: icono en cuadro `2.25rem` bg slate-100 + label Manrope `0.875rem` slate-500 + valor Bricolage `1.125rem` slate-900):
  - **Guardados** — `31` (icono corazón) → nº de usuarios que tienen el anuncio en Favoritos
  - **Mensajes recibidos** — `12` (icono chat) → nº de conversaciones distintas iniciadas sobre el anuncio
- ⚠️ **NO** incluir "Visualizaciones" (decisión de producto: solo guardados y mensajes).

## B.6 Permisos
- Esta vista es **solo para el rol administrador** del grupo. El resto de miembros del grupo y los solicitantes no la ven.
- Las acciones (editar info, editar fotos, toggle de visibilidad) están restringidas al admin.

## B.7 Responsive (admin)
- ≤ 64rem: main padding `1.5rem`
- ≤ 56rem: grid a 1 columna (panel de gestión baja debajo)
- ≤ 40rem: aside en modo móvil (lo gestiona el layout — no tocar)

---

## C · Datos mock (compartidos)

```js
const fotos = [ /* N fotos; placeholder = par de colores. En prod: URLs */
  {id:0}, {id:1}, {id:2}, {id:3}, {id:4}, {id:5},  // 6 fotos → miniatura 4 muestra "+2"
];

const anuncio = {
  titulo: "Piso en Gonzalo Gallas",
  direccion: "Gonzalo Gallas 37, Granada",
  precio: 300,            // €/mes
  habLibres: 1,
  habTotal: 4,
  planta: 3,
  tipo: "Piso",
  genero: "Solo chicos",
  descripcion: "Piso amueblado en Gonzalo Gallas encima del Mercadona. Somos tres estudiantes y buscamos a un cuarto para el próximo curso 26/27...",
  comodidades: ["Wifi fibra","Lavadora","Calefacción","Cocina equipada","Amueblado","Terraza"],
  visible: true,          // estado en búsquedas (toggle admin)
};

const grupo = {
  nombre: "Casa Lavanda",
  ciudad: "Granada",
  foto: null,             // foto de perfil del grupo
  miembros: 3,
  compatibilidad: 87,     // % calculado contra las preferencias del solicitante
};

const stats = { guardados: 31, mensajes: 12 };  // sin visualizaciones
```

### De dónde salen las métricas (backend)
- **Guardados** = `COUNT(favoritos WHERE anuncioId = ...)`. Sube/baja con el corazón.
- **Mensajes recibidos** = nº de **conversaciones distintas** con ese `anuncioId` (no mensajes sueltos).
- **Compatibilidad** = afinidad entre las preferencias de convivencia del solicitante y el perfil del grupo (mismos traits del perfil de convivencia).

---

## D · Tailwind cheat-sheet

| Elemento | Clases |
|---|---|
| Header marketplace | `flex items-center gap-6 px-10 py-3.5 bg-white border-b border-slate-200` |
| Brand | `font-display text-2xl font-bold -tracking-[0.02em] text-slate-900` |
| Buscador | `flex-1 max-w-[34rem] mx-auto flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-full pl-4 pr-1.5 py-1.5` |
| Botón buscar | `w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center` |
| Avatar header | `w-10 h-10 rounded-full ring-2 ring-emerald-500 ring-offset-2 ring-offset-white` |
| Card | `bg-white border border-slate-100 rounded-[1.25rem] shadow-sm` |
| Chip | `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 bg-white text-slate-700 text-[0.8125rem] font-semibold` |
| Chip precio | `… bg-emerald-50 border-emerald-100 text-emerald-700` |
| Foto principal | `aspect-video rounded-[1.25rem] overflow-hidden relative` |
| Miniatura | `aspect-[1.3] rounded-xl overflow-hidden border-2 border-transparent [&.active]:border-emerald-600` |
| Overlay +N | `absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-display text-lg` |
| Botón primary | `bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-full px-[1.125rem] py-3 inline-flex items-center gap-2` |
| Botón secondary | `bg-slate-100 hover:bg-white border border-slate-200 text-slate-900 font-semibold text-sm rounded-full px-[1.125rem] py-3` |
| Pill "Visible" | `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[0.8125rem] font-semibold` |
| Stat row valor | `font-display text-lg text-slate-900` |

### Config Tailwind
```js
theme: { extend: { fontFamily: {
  sans: ['Manrope','ui-sans-serif','system-ui'],
  display: ['"Bricolage Grotesque"','ui-serif'],
  mono: ['"Geist Mono"','ui-monospace'],
}}}
```

---

## E · Notas de implementación

- **A (pública)** vive en el marketplace con su **header propio** (Housie). **NO** lleva el aside del LayoutPerfil.
- **B (admin)** vive dentro del **grupo de convivencia** y reutiliza su **aside existente** (no modificar). Solo accesible por el rol administrador.
- El **estado "Visible en búsquedas"** solo se muestra y se controla en B (vista admin). En A nunca aparece.
- La **galería** soporta N fotos: 4 miniaturas + "+N" en la última; el contador de la principal usa el total real. Click en miniatura cambia la foto.
- En la card de contacto (A) se muestra el **grupo** (nombre + foto + ciudad), nunca el nombre del administrador.
- **Métricas (B):** solo Guardados y Mensajes recibidos. Nada de visualizaciones.
- **Accesibilidad:** iconos (corazón, chat, lupa, lápiz, toggle) con `aria-label`; el toggle de visibilidad es un control accesible (role switch).
- **Foto de perfil del grupo y fotos del anuncio:** son imágenes que sube el usuario; en el mock son placeholders con franjas.
