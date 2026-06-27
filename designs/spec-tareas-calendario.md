# Tareas y Calendario — Especificación para handoff

Dos vistas del módulo de gestión del piso, ambas dentro del **LayoutPerfil** (aside emerald a la izquierda). Pensadas para implementar en React + Tailwind, fieles al diseño. Unidades en `rem` (base `1rem = 16px`).

> Comparten el mismo shell que el resto de la app: aside emerald de `5rem`, fondo `slate-100`, cards blancas redondeadas, tipografía Bricolage Grotesque / Manrope / Geist Mono.

---

## 0. Sistema compartido (recordatorio)

### Tipografía
```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Manrope:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```
- **Display / títulos:** Bricolage
- **Datos / eyebrow / mono:** Geist Mono 500–600

### Paleta
| Rol | Token | Hex |
|---|---|---|
| Fondo página | slate-100 | `#f1f5f9` |
| Card | white | `#fff` (borde slate-100) |
| Card dark (hero) | slate-900 | `#0f172a` |
| Card emerald | emerald-50 | `#ecfdf5` (borde emerald-100, texto emerald-700) |
| Acento | emerald-600 | `#059669` (hover emerald-700 `#047857`) |
| Texto | slate-900 / muted slate-500 / very-muted slate-400 | |
| Estado hecho/pagado | bg emerald-50, texto emerald-700 | |
| Estado pendiente | bg amber-100 `#fef3c7`, texto amber-800 `#92400e` | |

### Aside (idéntico en ambas vistas)
- Width `5rem`, bg `emerald-600`, `border-top: 0.25rem solid #10b981`
- Iconos `2.5rem × 2.5rem` radius `0.625rem`; activo: bg `rgba(255,255,255,0.18)` color white; inactivo: color `rgba(255,255,255,0.7)`, hover bg `rgba(255,255,255,0.1)`
- Orden: home · grupo · **tareas** · facturas · compra · **calendar** — abajo (margin-top auto): chat · avatar · logout
- Avatar `2.5rem` redondo con striped placeholder dark
- En Tareas el icono activo es **tareas**; en Calendario es **calendar**

### Card base
- bg white, radius `1.25rem`, padding `1.25rem`
- shadow `0 1px 0 rgba(15,23,42,0.04), 0 0.5rem 2rem rgba(15,23,42,0.06)`
- border `1px solid #f1f5f9`

### Main
- `flex: 1`, padding `2rem 2.5rem` (tablet `1.5rem`, móvil `1rem`)
- Ancho máximo del conjunto: `min(80rem, 100%)` = 1280px

### Botones
- `.btn-pri`: bg emerald-600, color white, hover emerald-700
- `.btn-sec`: bg slate-100, color slate-900, border slate-200, hover white
- Base: padding `0.75rem 1.125rem`, radius pill, Manrope `0.8125rem` / 600, icono inline 14×14 stroke 2

### Avatares de miembro
- `1.75rem × 1.75rem` redondo, color de fondo por miembro, inicial en Manrope `0.6875rem` / 600 blanco
- Colores miembros: Lucía `#ec4899` · Andrés `#3b82f6` · Mara `#10b981` · Sofía `#f59e0b`

---

# A · VISTA TAREAS — Rotación semanal de zonas

Sistema de turnos: cada semana **cada miembro tiene una zona asignada**; la rotación avanza el día siguiente al día de limpieza (limpieza domingo → turnos nuevos el lunes).

## A.1 Estructura

```
┌─[aside]─┬──────────────────────────────────────────────┐
│         │  Header — eyebrow semana + h1 "Limpieza por  │
│         │           turnos" + btn "Editar rotación"     │
│         │                                               │
│         │  HERO (grid 1.6fr / 1fr, gap 0.875rem)        │
│         │  ┌─────────────────────┬───────────────────┐ │
│         │  │ Tu turno (dark)     │ Cómo funciona     │ │
│         │  │ zona + icono grande │ la rotación       │ │
│         │  │ btn marcar hecha    │ (3 puntos info)   │ │
│         │  └─────────────────────┴───────────────────┘ │
│         │                                               │
│         │  TABLA "Quién limpia qué"                     │
│         │  Miembro · Zona · Estado · Próxima sem · ⋮    │
│         │                                               │
│         │  CARD "Espacios en rotación" (zonas chips)    │
│         └───────────────────────────────────────────────┘
```

## A.2 Datos y modelo

```js
// Zonas — lista NO cerrada (el usuario añade nuevas)
const zonas = {
  cocina:  { label: "Cocina",  color: "#f59e0b" },
  bano:    { label: "Baño",    color: "#06b6d4" },
  salon:   { label: "Salón",   color: "#3b82f6" },
  pasillo: { label: "Pasillo", color: "#8b5cf6" },
  // terraza, habitación, etc. — extensible
};

const miembros = {
  L: { nombre: "Lucía",  color: "#ec4899" },
  A: { nombre: "Andrés", color: "#3b82f6" },
  M: { nombre: "Mara",   color: "#10b981" },
  S: { nombre: "Sofía",  color: "#f59e0b" },
};

const yo = "L"; // usuario actual (login)

// Rotación: orden fijo de miembros y zonas + índice de semana
const ordenMiembros = ["L", "A", "M", "S"];
const ordenZonas    = ["cocina", "bano", "salon", "pasillo"];
const semana = 0; // índice de rotación actual (incrementa cada semana)

// Zona asignada a un miembro: su posición + desfase de semana, módulo nº zonas
function asignacion(miembroIdx, offset = 0) {
  return ordenZonas[(miembroIdx + semana + offset) % ordenZonas.length];
}

// Estado de cada miembro esta semana
const estados = { L: "pendiente", A: "hecha", M: "pendiente", S: "hecha" };
```

**Regla clave de rotación:** la asignación de la semana N+1 es `asignacion(idx, 1)`. El "cambio" ocurre el lunes (día siguiente al de limpieza, que es domingo). Si nº miembros ≠ nº zonas, el módulo se encarga de repartir (algunos miembros pueden quedar sin zona o repetir; idealmente nº miembros = nº zonas).

## A.3 Header
- Eyebrow Geist Mono `0.625rem` / 600 / UPPER / tracking `0.16em` / slate-500: `"Casa Lavanda · Semana 18–24 may"`
- h1 Bricolage Grotesque `2.25rem` / 500 / tracking `-0.02em`: **"Limpieza por turnos"**
- Botón secondary derecha: icono lápiz + "Editar rotación"
- Margin-bottom `1.5rem`, alineación `flex-end` entre título y botón

## A.4 Hero — "Esta semana te toca" (card dark)
- Grid del hero: `1.6fr 1fr`, gap `0.875rem`, margin-bottom `1.25rem`
- Card: bg slate-900, color white, padding `1.5rem`, flex column
- Arriba (space-between): eyebrow "Esta semana te toca" (slate-400) + chip de estado:
  - Hecha → bg `rgba(16,185,129,0.2)` color `#6ee7b7`
  - Pendiente → bg `rgba(245,158,11,0.2)` color `#fcd34d`
  - Formato chip: `● Hecha` / `● Pendiente` — Geist Mono `0.625rem` / 600 UPPER tracking `0.08em`
- Centro (flex align-center gap `1rem`, margin `1.25rem 0`):
  - Icono de zona en cuadro `3.5rem × 3.5rem` radius `0.875rem`, bg `${zonaColor}26`, color zonaColor, SVG 26×26
  - Nombre de zona en Bricolage Grotesque `2.25rem` / 500, color white
  - Sublabel "Tu zona asignada esta semana" Manrope `0.8125rem` slate-400
- Abajo (flex align-center gap `0.75rem`):
  - Botón "Marcar como hecha" (bg emerald-500 si pendiente, `rgba(255,255,255,0.15)` si ya hecha → "Hecha · deshacer"), icono check
  - Texto límite Geist Mono `0.75rem` color `#fcd34d`: `"LÍMITE · DOM 24"`

## A.5 Hero — "Cómo funciona la rotación" (card blanca)
- Padding `1.5rem`, flex column
- Eyebrow "Cómo funciona la rotación", mb `0.75rem`
- 2 filas info (gap `0.875rem`), cada una: icono `1.75rem` cuadrado redondeado + título + subtítulo:
  1. Icono refresh (bg emerald-50, color emerald-600) — **"Cambia cada semana"** / "Cada miembro rota a la siguiente zona"
  2. Icono calendario (bg amber-100, color amber-700) — **"Día de limpieza · domingo"** / "Los turnos nuevos empiezan el lunes"
- Footer (border-top slate-100, padding-top `1rem`): "Próximo cambio" (slate-500) + `"LUN 25 · EN 3 DÍAS"` (Geist Mono `0.8125rem` emerald-600)

## A.6 Tabla "Quién limpia qué"
Card con padding 0. Cabecera (padding `1.25rem`, border-bottom slate-100):
- Izquierda: eyebrow "Turnos · semana actual" + h2 "Quién limpia qué" (`1.125rem` Bricolage)
- Derecha: "2/4 hechas" (Manrope `0.75rem` slate-500) + barra de progreso `4rem × 0.375rem` radius pill (track slate-100, fill emerald-500)

Tabla:
- **th:** Geist Mono `0.625rem` / 600 UPPER tracking `0.12em` slate-500, padding `0.75rem 1rem`, border-bottom `1px solid slate-200`
- **td:** Manrope `0.875rem` / 500 slate-900, padding `0.875rem 1rem`, border-bottom `1px dashed slate-200`, vertical-align middle
- **tr hover:** bg slate-50
- **tr del usuario actual (`.me`):** bg `#fdf2f8` (pink-50), hover `#fce7f3`

Columnas:
1. **Miembro** — avatar `1.75rem` color del miembro + nombre `0.875rem` / 600; si es el usuario, tag "TÚ" en Geist Mono `0.625rem` color pink-700 `#be185d`
2. **Zona esta semana** — pill: icono de zona `2rem` cuadrado (bg `${color}1a`, color zona) + label `0.875rem` / 600 slate-900
3. **Estado** — chip `● Hecha` (emerald) / `● Pendiente` (amber)
4. **La próxima semana** — flecha `→` + dot del color de la próxima zona + nombre, todo en slate-400 Manrope `0.8125rem` (preview de la rotación)
5. **Kebab** — botón `1.75rem` 3 puntos, color slate-500, hover bg slate-100

## A.7 Card "Espacios en rotación"
- margin-top `1.25rem`, padding `1.25rem`
- Cabecera: eyebrow "Zonas del piso · 4" + h2 "Espacios en rotación" + botón sec pequeño "Añadir zona" (icono +)
- Lista de chips de zona (flex wrap gap `0.625rem`): cada chip bg slate-50, border slate-100, radius `0.75rem`, padding `0.625rem 0.875rem`, contiene icono de zona + label

## A.8 Iconos de zona (SVG inline, stroke 1.9, 24×24 viewBox)
- **Cocina** (sartén/utensilios): `M8 2v7M12 2v7M8 9h4v3a2 2 0 01-2 2v8M16 2c-1.5 0-2 2-2 5s.5 4 2 4v11`
- **Baño** (ducha): `M5 12V6a2 2 0 014 0M4 12h16v2a5 5 0 01-5 5H9a5 5 0 01-5-5zM6 19l-1 2M18 19l1 2`
- **Salón** (sofá): `M4 11V8a2 2 0 012-2h12a2 2 0 012 2v3M4 11a2 2 0 00-2 2v4h20v-4a2 2 0 00-2-2M5 17v3M19 17v3`
- **Pasillo** (puertas/pasaje): `M4 3v18M20 3v18M9 12h6M12 3v18`

## A.9 Responsive Tareas
- ≤ 64rem: main padding `1.5rem`
- ≤ 48rem: hero pasa a 1 columna (`grid-template-columns: 1fr`)
- ≤ 40rem: aside horizontal arriba; tabla → considerar scroll-x o cards apiladas

## A.10 Interacciones
- **Marcar como hecha:** toggle del estado del miembro actual; actualiza chip + botón + barra de progreso.
- **Editar rotación:** abre modal para reordenar miembros/zonas y fijar el día de limpieza (selector de día de la semana).
- **Añadir zona:** input de nombre + selector de color → añade a `zonas` (entra en la rotación a partir de la próxima semana).
- **Kebab por fila:** intercambiar turno con otro miembro, marcar hecha/pendiente, ver historial.

---

# B · VISTA CALENDARIO — Mes + eventos del piso

Vista propia y separada de Tareas. Los eventos los registran los usuarios (cenas, avisos, pagos, mudanzas, etc.).

## B.1 Estructura

```
┌─[aside]─┬──────────────────────────────────────────────┐
│         │  Header — eyebrow + h1 "Mayo 2026" +          │
│         │           ‹  Hoy  ›  + btn "Nuevo evento"      │
│         │                                               │
│         │  LAYOUT (grid 1fr / 18rem, gap 1.25rem)       │
│         │  ┌──────────────────────┬──────────────────┐ │
│         │  │  CALENDARIO MES      │  Sidebar:        │ │
│         │  │  (grid 7 cols)       │  · Hoy           │ │
│         │  │  + leyenda           │  · Próximos      │ │
│         │  └──────────────────────┴──────────────────┘ │
│         └───────────────────────────────────────────────┘
```

## B.2 Datos y modelo

```js
// Tipos de evento (color por categoría)
const tipos = {
  tarea:   { label: "Tarea",   color: "#10b981" },
  factura: { label: "Pago",    color: "#059669" },
  social:  { label: "Social",  color: "#ec4899" },
  aviso:   { label: "Aviso",   color: "#f59e0b" },
  mudanza: { label: "Mudanza", color: "#8b5cf6" },
};

const eventos = [
  { id: 1, dia: 22, tipo: "social",  label: "Cena con Sofía",     hora: "21:00", por: "Lucía" },
  { id: 2, dia: 25, tipo: "aviso",   label: "Visita técnica luz", hora: "10:30", por: "Andrés" },
  { id: 3, dia: 27, tipo: "factura", label: "Pago alquiler",      hora: "—",     por: "Sistema" },
  { id: 4, dia: 28, tipo: "tarea",   label: "Limpieza general",   hora: "12:00", por: "Mara" },
  { id: 5, dia: 29, tipo: "social",  label: "Noche de pelis",     hora: "22:00", por: "Andrés" },
  { id: 6, dia: 31, tipo: "mudanza", label: "Mudanza Mara",       hora: "16:00", por: "Mara" },
];

const today = 22;
const eventosHoy = eventos.filter(e => e.dia === today);
const proximos   = eventos.filter(e => e.dia > today);
```

### Construcción del grid del mes
```js
const firstOffset = 3;        // offset lunes-based del día 1 (1 may = jueves → 3)
const daysInMonth = 31;
const dayNames = ['L','M','X','J','V','S','D'];

const cells = [];
for (let i = 0; i < firstOffset; i++) cells.push(null); // huecos antes del día 1
for (let d = 1; d <= daysInMonth; d++) cells.push(d);
while (cells.length % 7 !== 0) cells.push(null);        // completar última fila

// eventos agrupados por día
const eventosPorDia = {};
eventos.forEach(e => (eventosPorDia[e.dia] ??= []).push(e));
```
> En producción, calcular `firstOffset` y `daysInMonth` con la fecha real del mes mostrado y permitir navegar meses con ‹ ›.

## B.3 Header
- Eyebrow: `"Casa Lavanda · Calendario del piso"`
- h1 Bricolage Grotesque `2.25rem` / 500: **"Mayo 2026"**
- Controles derecha (flex gap `0.5rem` align-center):
  - Botón nav `‹` — `2.25rem` cuadrado radius `0.625rem`, bg slate-100, border slate-200, color slate-600
  - Botón secondary "Hoy" (padding `0.625rem 1rem`)
  - Botón nav `›`
  - Botón primary "Nuevo evento" (icono +), margin-left `0.5rem`

## B.4 Layout
- Grid `1fr 18rem`, gap `1.25rem`, align-items start
- ≤ 56rem: pasa a 1 columna (sidebar baja debajo del calendario)

## B.5 Calendario mensual (card padding `1.25rem`)
- **Fila de nombres de día** (`.cal-grid`: grid 7 cols, gap `0.375rem`): cada uno centrado, Geist Mono `0.625rem` / 600 UPPER tracking `0.1em` slate-400
- **Grid de celdas** (mismo grid 7 cols, gap `0.375rem`):
  - **Celda** `.cal-cell`: `aspect-ratio: 1.1`, radius `0.625rem`, border `1px solid slate-100`, bg white, padding `0.4375rem`, flex column gap `0.1875rem`, overflow hidden; hover border slate-300
  - **Celda vacía** (`null`): transparent, sin borde, sin cursor
  - **Celda de hoy:** bg slate-900, border slate-900; el número del día en blanco
  - **Número de día:** Manrope `0.8125rem` / 500 slate-900 (blanco si hoy)
  - **Pastilla de evento** (`.cal-ev`): hasta 2 por celda — Manrope `0.625rem` / 600 blanco, padding `0.0625rem 0.3125rem`, radius `0.25rem`, bg = color del tipo, texto truncado con ellipsis
  - Si hay >2 eventos: `+N` en Geist Mono `0.5625rem` slate-400
- **Leyenda** (margin-top `1.25rem`, border-top slate-100, padding-top `1rem`, flex wrap gap `0.875rem`): por cada tipo, cuadradito `0.625rem` redondeado del color + label Manrope `0.75rem` slate-500

## B.6 Sidebar derecha (flex column gap `0.875rem`)
### Card "Hoy"
- Eyebrow "Hoy" + título "Jueves 22" (`1.125rem` Bricolage)
- Lista de eventos del día: cada uno fila con barra vertical de color (`0.1875rem`) + label `0.875rem` / 600 + sublabel `hora · por` (Geist Mono `0.6875rem` slate-500), fondo slate-50 radius `0.625rem` padding `0.625rem`
- Si no hay: "Sin eventos hoy" (slate-400)

### Card "Próximos"
- Cabecera: eyebrow "Próximos" + contador (Geist Mono slate-500)
- Lista (gap `0.625rem`): cada evento con
  - Caja de fecha `2.5rem` (bg slate-50, border slate-100, radius `0.5rem`): "MAY" (Geist Mono `0.5625rem` slate-400) + día (Bricolage `1rem` slate-900)
  - Barra vertical de color del tipo (`0.1875rem`)
  - Label `0.8125rem` / 600 (truncado) + sublabel `hora · por`

## B.7 Responsive Calendario
- ≤ 64rem: main padding `1.5rem`
- ≤ 56rem: layout a 1 columna
- ≤ 40rem: aside horizontal; celdas padding `0.25rem`; ocultar pastillas de evento (`.cal-ev { display: none }`) y mostrar solo un dot por día

## B.8 Interacciones
- **‹ › / Hoy:** navegar meses; "Hoy" vuelve al mes actual.
- **Click en celda:** abre el día (lista de eventos de ese día / crear evento).
- **Nuevo evento:** modal con tipo (chips de los 5 tipos), título, día, hora, asignar a / por quién.
- **Click en evento:** ver detalle / editar / borrar.

---

## C · Tailwind cheat-sheet (común)

| Elemento | Clases |
|---|---|
| Página | `flex bg-slate-100 min-h-screen w-full max-w-[80rem] mx-auto` |
| Aside | `w-20 shrink-0 bg-emerald-600 border-t-4 border-emerald-500 flex flex-col items-center py-4 gap-2` |
| Nav icon activo | `w-10 h-10 rounded-[0.625rem] bg-white/20 text-white flex items-center justify-center` |
| Main | `flex-1 p-8 lg:p-6 sm:p-4 min-w-0` |
| Card | `bg-white border border-slate-100 rounded-[1.25rem] p-5 shadow-sm` |
| Card dark | `bg-slate-900 text-white rounded-[1.25rem] p-6` |
| Eyebrow | `font-mono text-[0.625rem] font-semibold tracking-[0.16em] uppercase text-slate-500` |
| h1 | `font-display text-[2.25rem] font-medium -tracking-[0.02em] text-slate-900` |
| Chip estado hecho | `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[0.625rem] font-semibold tracking-[0.08em] uppercase bg-emerald-50 text-emerald-700` |
| Chip estado pendiente | `… bg-amber-100 text-amber-800` |
| Avatar miembro | `w-7 h-7 rounded-full text-white inline-flex items-center justify-center font-semibold text-[0.6875rem]` |
| Botón primary | `bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[0.8125rem] rounded-full px-[1.125rem] py-3 inline-flex items-center gap-1.5` |
| Botón secondary | `bg-slate-100 hover:bg-white border border-slate-200 text-slate-900 font-semibold text-[0.8125rem] rounded-full px-[1.125rem] py-3` |
| Tabla th | `font-mono text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-slate-500 px-4 py-3 text-left border-b border-slate-200` |
| Tabla td | `font-medium text-sm text-slate-900 px-4 py-3.5 border-b border-dashed border-slate-200` |

### Config Tailwind
```js
theme: { extend: { fontFamily: {
  sans: ['Manrope','ui-sans-serif','system-ui'],
  display: ['"Bricolage Grotesque"','ui-serif'],
  mono: ['"Geist Mono"','ui-monospace'],
}}}
```

---

## D · Notas de implementación

- **Rol y permisos:** ambas vistas son para inquilinos (no para el casero). El aside solo aparece en el rol inquilino.
- **Rotación de tareas:** mantener `ordenMiembros`, `ordenZonas`, `semana` y `diaLimpieza` en backend; recalcular asignaciones con la función módulo. Al pasar el día de limpieza (domingo) incrementar `semana`. Conviene que nº miembros = nº zonas para reparto limpio.
- **Estado de limpieza:** se resetea cada semana al rotar. Guardar histórico para estadísticas ("quién cumple más").
- **Calendario:** calcular `firstOffset`/`daysInMonth` con fecha real; soportar navegación de meses; los eventos de tipo `tarea`/`factura` pueden generarse automáticamente desde esos módulos (la limpieza semanal y los vencimientos de factura aparecen en el calendario sin que el usuario los cree).
- **Accesibilidad:** iconos kebab/nav con `aria-label`; celdas del calendario como botones con label de fecha.
- **Responsive móvil:** la tabla de turnos y el calendario son lo más delicado — preferir cards apiladas y un dot por día respectivamente, no scroll horizontal.
