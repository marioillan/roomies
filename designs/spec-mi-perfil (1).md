# Mi Perfil — Especificación para handoff

Página de perfil de usuario (vista propia / "owner") para una app de búsqueda de compañeros de piso para universitarios. Diseño responsive, paleta del proyecto (Emerald + Slate + acentos), todas las medidas en **`rem`** (base `1rem = 16px`).

---

## 1. Tipografía

Familias: **Bricolage Grotesque** (display), **Manrope** (body/UI), **Geist Mono** (datos, eyebrows).

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Manrope:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

| Rol | Font | Tamaño | Weight | Line-height | Tracking |
|---|---|---|---|---|---|
| **Título página** (Mi perfil) | Bricolage Grotesque | `2.25rem` (36px) | 500 | 1.0 | −0.02em |
| **Nombre usuario** (Lucía Vargas, 27) | Bricolage Grotesque | `2.75rem` (44px) | 500 | 1.0 | −0.02em |
| **Título sección** (¿Cómo soy en casa?) | Bricolage Grotesque | `2rem` (32px) | 400 | 1.0 | 0 |
| **KPI grande** (92) | Bricolage Grotesque | `2.625rem` (42px) | 400 | 1.0 | 0 |
| **Bio** | Bricolage Grotesque | `1.0625rem` (17px) | 400 | 1.4 | 0 |
| **Eyebrow** (IDENTIDAD, DATOS PERSONALES) | Geist Mono | `0.625rem` (10px) | 600 | 1.0 | 0.16em, UPPER |
| **Etiqueta dato** (Email, Género…) | Geist Mono | `0.6875rem` (11px) | 600 | — | 0.10em, UPPER |
| **Valor dato** | Manrope | `0.9375rem` (15px) | 500 | — | 0 |
| **Email mono** | Geist Mono | `0.75rem` (12px) | 400 | — | 0 |
| **Chip / interés** | Manrope | `0.8125rem` (13px) | 500 | — | 0 |
| **Botón** | Manrope | `0.75rem` (12px) | 600 | — | 0 |
| **Texto dial** | Manrope | `0.8125rem` (13px) | 600 | 1.15 | 0 |
| **Etiqueta debajo dial** | Manrope | `0.8125rem` (13px) | 500 | — | 0 |
| **Status pill** (VISIBLE) | Geist Mono | `0.6875rem` (11px) | 600 | — | 0.08em, UPPER |

---

## 2. Paleta de colores (igual al proyecto Tailwind)

### Tokens base
| Rol | Token | Hex |
|---|---|---|
| Fondo página | slate-100 | `#f1f5f9` |
| Fondo tarjeta clara | white | `#ffffff` |
| Borde tarjeta clara | slate-100 | `#f1f5f9` |
| Fondo tarjeta oscura (Intereses) | slate-900 | `#0f172a` |
| Fondo bio | slate-50 | `#f8fafc` |
| Texto principal | slate-900 | `#0f172a` |
| Texto bio | slate-700 | `#334155` |
| Texto muted | slate-500 | `#64748b` |
| Texto muy muted | slate-400 | `#94a3b8` |
| Texto sobre dark | slate-200 | `#e2e8f0` |
| Border bottom dashed (filas) | slate-200 | `#e2e8f0` |
| Botón primario | emerald-600 | `#059669` |
| Botón primario hover | emerald-700 | `#047857` |
| Píldora VISIBLE bg | emerald-500 | `#10b981` |
| Píldora VISIBLE dot | emerald-200 | `#a7f3d0` |
| KPI 92% | emerald-600 | `#059669` |
| Botón Match (visitor) | pink-500 | `#ec4899` |

### Trait colors (anillo del dial)
| Trait | Token | Hex |
|---|---|---|
| social (Sociable) | pink-500 | `#ec4899` |
| party (Fiestera) | violet-500 | `#8b5cf6` |
| visits (Visitas) | cyan-500 | `#06b6d4` |
| tidy (Orden) | emerald-500 | `#10b981` |
| early (Madrugadora) | amber-500 | `#f59e0b` |
| cook (Cocina) | blue-500 | `#3b82f6` |
| pets (Mascotas) | orange-500 | `#f97316` |
| smoke (Fuma) | slate-500 | `#64748b` |

### Chips de identidad
| Chip | Bg | Texto | Dot |
|---|---|---|---|
| Género | pink-50 `#fdf2f8` | pink-700 `#be185d` | pink-500 `#ec4899` |
| País | amber-50 `#fffbeb` | amber-700 `#b45309` | amber-500 `#f59e0b` |
| Afinidad (visitor) | emerald-50 `#ecfdf5` | emerald-700 `#047857` | emerald-500 `#10b981` |

### Chips de interés (sobre tarjeta dark)
- Bg `slate-700 #334155` · Texto `slate-100 #f1f5f9` (todos iguales para coherencia)

---

## 3. Estructura general

```
┌────────────────────────────────────────────────────────┐
│ Página · width: min(55rem, 100%) · padding 2rem        │
│ bg slate-100                                            │
│ ┌──────────────────────────────────────────────────┐ │
│ │  Header (justify-between, mb 1.25rem)              │ │
│ │  ├ "Mi perfil" (2.25rem display)                   │ │
│ │  └ [Compartir] [Editar perfil]    (gap 0.5rem)     │ │
│ └──────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────┐ │
│ │  Hero card · padding 1.75rem · radius 1.5rem        │ │
│ │  grid: [21.25rem | 1fr] gap 1.25rem · mb 1.25rem    │ │
│ │  ├ Foto 17.75rem (284px) circular + píldora        │ │
│ │  └ Identidad: eyebrow / nombre / chips / bio       │ │
│ └──────────────────────────────────────────────────┘ │
│ ┌────────────────────┬──────────────────────────────┐ │
│ │  Datos personales   │  Intereses (dark)            │ │
│ │  padding 1.75rem    │  padding 1.75rem             │ │
│ │  radius 1.5rem      │  radius 1.5rem               │ │
│ └────────────────────┴──────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────┐ │
│ │  Compatibilidad · padding 1.75rem · radius 1.5rem   │ │
│ │  header [titulo | KPI 92% emerald-600]             │ │
│ │  grid 4 × diales (gap 1.5rem)                      │ │
│ └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Medidas globales
| Elemento | rem | (px equivalente) |
|---|---|---|
| Ancho de página (desktop) | `min(55rem, 100%)`, `max-width: 55rem` | 880 px |
| Padding interior de página | `2rem` (todos lados) | 32 px |
| Gap vertical entre cards | `1.25rem` margin-bottom | 20 px |
| Box-sizing | `border-box` global | — |

### Card (genérico claro)
| Propiedad | Valor |
|---|---|
| Background | `#fff` |
| Border | `1px solid #f1f5f9` |
| Border-radius | `1.5rem` (24 px) |
| Padding | `1.75rem` (28 px) |
| Box-shadow | `0 1px 0 rgba(15,23,42,0.04), 0 0.5rem 2rem rgba(15,23,42,0.06)` |

### Card oscura (Intereses)
| Propiedad | Valor |
|---|---|
| Background | slate-900 `#0f172a` |
| Color texto | slate-200 `#e2e8f0` |
| Padding | `1.75rem` |
| Radius | `1.5rem` |

---

## 4. Breakpoints responsivos

```css
/* Tablet ≤ 48rem (768px) */
@media (max-width: 48rem) {
  .page { padding: 1.25rem; }
  .hero-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .cards-2 { grid-template-columns: 1fr; }
  .name { font-size: 2.25rem; }
}
/* Móvil ≤ 30rem (480px) */
@media (max-width: 30rem) {
  .page { padding: 1rem; }
  .card { padding: 1.25rem; border-radius: 1.25rem; }
  .name { font-size: 2rem; }
  .dial-grid { grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
}
```

**Resumen del comportamiento:**
- En **desktop** (> 48rem): hero en 2 col (foto/identidad), datos+intereses en 2 col, diales en 4 col.
- En **tablet** (≤ 48rem): todas las cuadrículas pasan a 1 columna excepto el grid de diales que sigue 4 col (a esa anchura aún caben).
- En **móvil** (≤ 30rem): grid de diales pasa a 2 columnas; padding y border-radius se reducen ligeramente; el nombre baja a `2rem`.

---

## 5. Header

| Propiedad | Valor |
|---|---|
| Display | `flex` justify `space-between` align `center` |
| Margin-bottom | `1.25rem` |
| Lado izquierdo | Título "Mi perfil" 2.25rem Bricolage Grotesque (sin botón back en owner) |
| Lado derecho | Dos botones, gap `0.5rem` |
| Botón "Compartir" | `secondary` con icono share 14×14 + texto |
| Botón "Editar perfil" | `primary` (emerald-600 / white) |

---

## 6. Hero card (foto + identidad)

| Propiedad | Valor |
|---|---|
| Grid | `21.25rem 1fr` gap `1.25rem` |
| Padding | `1.75rem` |
| Radius | `1.5rem` |
| Margin-bottom | `1.25rem` |

### Columna izquierda — Foto (21.25rem ancho)
- Contenedor `position: relative`
- Foto **`17.75rem × 17.75rem`** (≈ 284 px), `border-radius: 50%`, centrada
- Píldora **VISIBLE** absoluta:
  - `bottom: 0.25rem` / `right: 0.75rem`
  - Padding `0.4375rem 0.75rem`, radius pill
  - Background emerald-500 `#10b981`, color `#fff`
  - Texto Geist Mono `0.6875rem` / 600 / tracking 0.08em
  - Punto interior `0.375rem × 0.375rem` circular emerald-200 `#a7f3d0` con glow
  - Box-shadow `0 0.25rem 0.875rem rgba(16,185,129,0.25)`

### Columna derecha — Identidad
1. Eyebrow "IDENTIDAD" — slate-500, margin-bottom `0.75rem`
2. `<h1>` Nombre + edad ("Lucía Vargas, 27") — `2.75rem` Bricolage Grotesque, slate-900
3. Fila de chips (flex wrap, gap `0.5rem`) — margin-top `1rem`:
   - Chip **género** (pink)
   - Chip **país** (amber)
4. Bio container — margin-top `1.25rem`:
   - Background slate-50 `#f8fafc`, radius `0.875rem`, padding `1rem`
   - Texto Bricolage Grotesque `1.0625rem`, line-height 1.4, color slate-700

---

## 7. Fila de tarjetas (Datos + Intereses)

| Propiedad | Valor |
|---|---|
| Grid | `1fr 1fr` gap `1.25rem` |
| Margin-bottom | `1.25rem` |

### 7a. Datos personales (clara)
- Eyebrow "DATOS PERSONALES" — slate-500, margin-bottom `1rem`
- Filas:
  - `display: flex` justify `space-between` align `center`
  - Padding vertical `0.875rem`
  - Border-bottom `1px dashed slate-200` (excepto última)
  - Etiqueta izquierda Geist Mono `0.6875rem` / 600 / tracking 0.10em UPPER
  - Valor derecha Manrope `0.9375rem` / 500
- Filas owner: **Email · Género · País · Edad**
- Email en Geist Mono `0.75rem`

### 7b. Intereses (dark)
- Background slate-900, color slate-200
- Eyebrow "INTERESES" slate-400, margin-bottom `1rem`
- Chips (flex wrap, gap `0.5rem`):
  - Padding `0.4375rem 0.75rem`, radius pill
  - Bg slate-700 `#334155`, color slate-100 `#f1f5f9`
  - Manrope `0.8125rem` / 500
- Lista: Cerámica · Café de especialidad · Senderismo · Cine de autor · Vinilos · Yoga · Lectura · Viajar lento

---

## 8. Tarjeta de Compatibilidad

| Propiedad | Valor |
|---|---|
| Padding | `1.75rem` |
| Radius | `1.5rem` |
| Background | white |

### Header de la tarjeta (flex space-between)
**Izquierda:**
- Eyebrow "COMPATIBILIDAD" (mb `0.375rem`)
- `<h2>` "¿Cómo soy en casa?" — `2rem` Bricolage Grotesque

**Derecha (KPI):**
- Número grande **92** — `2.625rem` Bricolage Grotesque color emerald-600
- `%` — `1.125rem` slate-400
- Sublabel "COMPLETADO" — `0.6875rem` Geist Mono slate-400 (block, tracking 0.08em)

### Grid de diales
- `grid-template-columns: repeat(4, 1fr)` gap `1.5rem`
- 8 diales (4 cols × 2 filas)
- Cada celda: `text-align: center`
  - Dial cuadrado (`aspect-ratio: 1`)
  - Etiqueta debajo: margin-top `0.75rem`, Manrope `0.8125rem` / 500

### Dial (donut)
- SVG `viewBox 0 0 100 100`, ancho 100% (escala con la celda)
- Anillo bg: `<circle cx=50 cy=50 r=36 stroke="#f1f5f9" stroke-width=10>`
- Anillo progress: `<circle stroke-width=10>` con `stroke-dasharray` y `stroke-dashoffset`
  - `strokeLinecap: butt` cuando vacío, `round` cuando >0
  - Rotación `-90deg` (start arriba)
  - Color del trait (ver tabla)
- Texto centrado dentro:
  - Manrope `0.8125rem` / 600 / line-height 1.15
  - Color slate-400 si vacío, slate-900 si >0
  - Padding horizontal `0.375rem`
- 3 estados (0% / 50% / 100%) para 6 traits, **2 estados (0% / 100%)** para Mascotas y Fumar
- Owner: cursor pointer + hover `scale(1.03)`

### Traits (orden + niveles)
| # | id | Label | Color | Niveles |
|---|---|---|---|---|
| 1 | social | Sociable | pink-500 | Reservada / Equilibrada / Sociable |
| 2 | party | Fiestera | violet-500 | Tranquila / A veces / Fiestera |
| 3 | visits | Visitas ocasionales | cyan-500 | Solo yo / A veces / Open house |
| 4 | tidy | Orden | emerald-500 | Caótica / Ordenada / Impecable |
| 5 | early | Madrugadora | amber-500 | Búho / Flexible / Alondra |
| 6 | cook | Cocina en casa | blue-500 | Delivery / A veces / Chef |
| 7 | pets | Mascotas | orange-500 | **Mejor no / Amo animales** (binario) |
| 8 | smoke | Fuma | slate-500 | **Nunca / A diario** (binario) |

---

## 9. Botones

### Base
- Padding `0.75rem 1.125rem`
- Border-radius pill (`9999px`)
- Manrope `0.75rem` / 600
- Border `none` (excepto secondary)
- Transition 0.15s

### Variantes
| Variante | Bg | Color | Border | Hover |
|---|---|---|---|---|
| **primary** (Editar perfil) | emerald-600 `#059669` | white | none | bg emerald-700 `#047857` |
| **secondary** (Compartir) | slate-100 `#f1f5f9` | slate-900 | `1px solid slate-200` | bg white, border slate-300 |
| **match** (visitor) | pink-500 `#ec4899` | white | none | bg pink-600 `#db2777` |

Icono SVG: 14×14 stroke 2, `vertical-align: -2`, margin-right `0.375rem`.

---

## 10. Chip (uso general)

| Propiedad | Valor |
|---|---|
| Display | `inline-flex` align center gap `0.5rem` |
| Padding | `0.4375rem 0.875rem` |
| Border-radius | pill |
| Font | Manrope `0.8125rem` / 500 |
| Dot interno | `0.375rem × 0.375rem` circular |

---

## 11. Datos de ejemplo (mock)

```js
const user = {
  nombre: "Lucía Vargas",
  edad: 27,
  genero: "Mujer",
  pais: "México · CDMX",
  email: "lucia.vargas@correo.com",
  bio: "Diseñadora de producto, ceramista los domingos. Busco a alguien con quien compartir cafés largos y caminatas sin rumbo.",
};

const traits = [
  { id: "social", label: "Sociable",            value: 100, levels: ["Reservada", "Equilibrada", "Sociable"] },
  { id: "party",  label: "Fiestera",            value: 50,  levels: ["Tranquila", "A veces", "Fiestera"] },
  { id: "visits", label: "Visitas ocasionales", value: 50,  levels: ["Solo yo", "A veces", "Open house"] },
  { id: "tidy",   label: "Orden",               value: 100, levels: ["Caótica", "Ordenada", "Impecable"] },
  { id: "early",  label: "Madrugadora",         value: 50,  levels: ["Búho", "Flexible", "Alondra"] },
  { id: "cook",   label: "Cocina en casa",      value: 100, levels: ["Delivery", "A veces", "Chef"] },
  { id: "pets",   label: "Mascotas",            value: 100, levels: ["Mejor no", "Amo animales"] },
  { id: "smoke",  label: "Fuma",                value: 0,   levels: ["Nunca", "A diario"] },
];
```

---

## 12. Comportamiento de los diales

```js
// 3 niveles
const level = value >= 75 ? 2 : value >= 25 ? 1 : 0;
const fillRatio = [0, 0.5, 1][level];
const newValue = [0, 50, 100][(level + 1) % 3];

// 2 niveles (pets, smoke)
const level = value >= 50 ? 1 : 0;
const fillRatio = [0, 1][level];
const newValue = [0, 100][(level + 1) % 2];
```

---

## 13. Tailwind cheat-sheet

| Elemento | Clases |
|---|---|
| Página | `bg-slate-100 min-h-screen w-full max-w-[55rem] mx-auto p-8 md:p-5 sm:p-4` |
| Card claro | `bg-white border border-slate-100 rounded-3xl p-7 shadow-sm` |
| Card dark | `bg-slate-900 text-slate-200 rounded-3xl p-7` |
| Hero grid | `grid grid-cols-[21.25rem_1fr] md:grid-cols-1 gap-5 md:gap-6` |
| Cards 2-col | `grid grid-cols-2 md:grid-cols-1 gap-5 mb-5` |
| Dial grid | `grid grid-cols-4 sm:grid-cols-2 gap-6 sm:gap-5` |
| Eyebrow | `font-mono text-[0.625rem] font-semibold tracking-[0.16em] uppercase text-slate-500` |
| Título página | `font-display text-4xl font-medium -tracking-[0.02em] text-slate-900` |
| Nombre | `font-display text-[2.75rem] leading-none -tracking-[0.02em] text-slate-900` |
| Bio | `font-display text-[1.0625rem] leading-relaxed text-slate-700 bg-slate-50 rounded-2xl p-4` |
| Botón primary | `bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-full px-[1.125rem] py-3 transition` |
| Botón secondary | `bg-slate-100 hover:bg-white text-slate-900 border border-slate-200 hover:border-slate-300 font-semibold text-xs rounded-full px-[1.125rem] py-3 transition` |
| Botón match | `bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs rounded-full px-7 py-3.5 transition` |
| Chip género | `inline-flex items-center gap-2 bg-pink-50 text-pink-700 rounded-full text-[0.8125rem] font-medium px-3.5 py-1.5` |
| Chip país | `inline-flex items-center gap-2 bg-amber-50 text-amber-700 rounded-full text-[0.8125rem] font-medium px-3.5 py-1.5` |
| Chip afinidad | `inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full text-[0.8125rem] font-medium px-3.5 py-1.5` |
| Chip interés | `bg-slate-700 text-slate-100 rounded-full text-[0.8125rem] font-medium px-3 py-1.5` |
| Píldora VISIBLE | `bg-emerald-500 text-white text-[0.6875rem] font-mono font-semibold tracking-wider rounded-full px-3 py-1.5 inline-flex items-center gap-1.5 shadow` |

### Configuración Tailwind sugerida (`tailwind.config`)

```js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui'],
        display: ['"Bricolage Grotesque"', 'ui-serif'],
        mono: ['"Geist Mono"', 'ui-monospace'],
      },
    },
  },
};
```

---

## 14. Notas para la implementación

- **Mobile-first:** el código de ejemplo está escrito desktop-first, pero podéis invertir el enfoque con `min-width:`. Lo importante es que el comportamiento descrito en breakpoints se cumpla.
- **Photo placeholder:** click → input file. Mientras no haya foto, mostrar las franjas diagonales en cream/slate y silueta gris.
- **Bio editable:** en la vista de edición (no esta), todo en el hero + datos personales debería ser editable inline.
- **Hover en diales:** solo en vista propia. Visitante = solo lectura.
- **Iconos SVG:** todos inline, `width=14 height=14 stroke=2`, sin librerías externas (Lucide o Heroicons sirven igual).
- **Accesibilidad:** usar `rem` permite que el usuario escale el tamaño base desde su navegador y todo el layout escale proporcionalmente.

### Vista visitante (deltas respecto a owner)
- Header: añade botón back + eyebrow "Perfil" + "Activa hace 2 horas"
- Botones top: `secondary` Guardar + `secondary` kebab
- Chips: añade afinidad emerald
- Datos personales: oculta Email, añade Idiomas
- KPI: **87% AFINIDAD** (sigue emerald-600), sublabel "Vs. tus preferencias"
- Diales: read-only
- Bottom action bar: `secondary` Pasar / `secondary` Mensaje / `match` Match
