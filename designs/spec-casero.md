# Vista del Casero — Especificación para handoff

Vista limitada del rol **Casero** dentro de la app. El casero accede al grupo mediante un código de acceso y solo tiene acceso a la gestión de **facturas** (alquiler, luz, agua, wifi, parking). No tiene aside ni navegación entre módulos: la página entera es una única sección.

> Stack asumido: React + Tailwind. Paleta y tipografía heredadas del proyecto.
> Unidades en `rem` (base `1rem = 16px`).

---

## 1. Tipografía y paleta (recordatorio)

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Manrope:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

| Rol | Fuente |
|---|---|
| Display / títulos | Bricolage Grotesque (500) |
| Body / UI | Manrope (400-600) |
| Datos / eyebrow / mono | Geist Mono (500-600) |

Paleta:
- Fondo página: `slate-100 #f1f5f9`
- Fondo cards: `white #fff` con borde `slate-100`
- Card hero dark: `slate-900 #0f172a`
- Card hero emerald: `bg-emerald-50` / `border-emerald-100` / texto `emerald-700`
- Acento principal: `emerald-600 #059669` / hover `emerald-700`
- Texto: `slate-900` / muted `slate-500` / very-muted `slate-400`
- Estado pagado: `bg-emerald-50` + `text-emerald-700` + dot emerald-600
- Estado pendiente: `bg-amber-100` + `text-amber-800` + dot amber-600

Colores por tipo de factura (icon container `${color}15` bg, color full):
| Tipo | Color |
|---|---|
| alquiler | emerald-600 `#059669` |
| luz | amber-500 `#f59e0b` |
| agua | cyan-500 `#06b6d4` |
| wifi | blue-500 `#3b82f6` |
| parking | violet-500 `#8b5cf6` |

---

## 2. Estructura general

```
┌────────────────────────────────────────────────────────┐
│  TOP BAR (1rem 2.5rem, white, border-b slate-200)      │
│  ├ logo emerald + "Gestión de facturas"                │
│  └ chip user (avatar + nombre + rol) + logout          │
├────────────────────────────────────────────────────────┤
│  MAIN (padding 2rem 2.5rem)                            │
│  ├ Header — eyebrow fecha + h1 "Tus facturas"          │
│  ├ Selector de grupos (chips horizontales wrap)        │
│  ├ KPIs (grid 3 cols, gap 0.875rem)                    │
│  │   ├ Por cobrar (dark slate-900)                     │
│  │   ├ Cobrado este mes (emerald)                      │
│  │   └ Subir nueva factura (CTA card)                  │
│  └ Tabla de facturas (card con filtros + tabla)        │
└────────────────────────────────────────────────────────┘
```

Ancho máximo del contenedor: `min(80rem, 100%)` (1280 px desktop), centrado.

---

## 3. Top bar

| Propiedad | Valor |
|---|---|
| Display | flex space-between center |
| Padding | `1rem 2.5rem` |
| Background | white |
| Border-bottom | `1px solid slate-200` |

### Izquierda — Brand
- Logo: cuadrado `2.25rem × 2.25rem` con `border-radius: 0.625rem`, bg `emerald-600`, color white, icono **factura** (`<rect x=3 y=5 w=18 h=14 rx=2>` + `<path d="M3 10h18 M7 15h4">`)
- Nombre: "Gestión de facturas" — Bricolage Grotesque `1.125rem` / 500, color slate-900

### Derecha — User chip + logout
- **User chip:**
  - Display: `inline-flex` align-center gap `0.625rem`
  - Padding `0.375rem 0.75rem 0.375rem 0.375rem`, radius pill
  - Background slate-50, border `1px solid slate-200`
  - Hover: bg white
  - Avatar `2rem × 2rem` redondo (con striped placeholder dark)
  - Texto:
    - Nombre: Manrope `0.8125rem` / 600 color slate-900
    - Rol: Geist Mono `0.625rem` / 500 UPPER tracking `0.06em` color slate-500, marginTop `0.1875rem`
- **Logout button:**
  - `2.25rem × 2.25rem`, radius `0.5rem`, bg transparent
  - Icono logout 18×18, color slate-500
  - Hover: bg slate-100, color slate-900

---

## 4. Header de página

- Eyebrow (Geist Mono `0.625rem` / 600 / UPPER / tracking `0.16em` / slate-500): la **fecha** del día (ej. *"Viernes 22 de mayo"*)
- Título h1: Bricolage Grotesque `2.25rem` / 500 / tracking `-0.02em` / slate-900 — *"Tus facturas"*
- Margin-bottom: `1.5rem`

---

## 5. Selector de grupos (chips)

Display: `flex` wrap gap `0.625rem`. Margin-bottom: `1.5rem`.

Cada chip `.cs-grupo`:
- Padding `0.75rem 1rem`, border-radius `0.75rem`
- Border `1px solid slate-200`, bg white
- Hover: bg slate-50
- Display: `flex` align center gap `0.625rem`

**Contenido del chip:**
1. **Dot** `0.5rem × 0.5rem` circular: emerald-600 si activo, slate-300 si no
2. Bloque texto:
   - Línea 1 (dirección): Manrope `0.875rem` / 600 — color emerald-700 si activo, slate-900 si no
   - Línea 2 (ciudad · nº inquilinos): Geist Mono `0.6875rem` / 500 / tracking `0.04em`, slate-500, marginTop `0.125rem`

**Chip activo (un solo grupo activo a la vez):**
- Border-color `emerald-600`
- Background `emerald-50`

**Chip "Vincular grupo con código"** (último del row):
- Mismo padding y radius
- Border `1px dashed slate-300`
- Color slate-500, Manrope `0.8125rem` / 600
- Icono `+` 14×14 a la izquierda
- Al click → modal de input de 6 dígitos para vincular grupo nuevo

---

## 6. KPIs (3 cards en grid)

Grid 3 columnas iguales, gap `0.875rem`, margin-bottom `1.25rem`.

Card base:
- Padding `1.25rem`, radius `1.25rem`
- Box-shadow `0 1px 0 rgba(15,23,42,0.04), 0 0.5rem 2rem rgba(15,23,42,0.06)`
- Border `1px solid slate-100`
- Display flex column

### KPI 1 · "Por cobrar este mes" (dark)
- Background slate-900, color white
- Eyebrow "Por cobrar este mes" — color slate-400, mb `0.5rem`
- Display: `2.5rem` Bricolage Grotesque / 500 color white — `"{porCobrar} €"`
- Sub: Manrope `0.75rem` / 500 color slate-400, mt `0.5rem` — `"{n} facturas pendientes"`

### KPI 2 · "Cobrado este mes" (emerald)
- Background emerald-50 (`#ecfdf5`), border emerald-100
- Eyebrow color emerald-700, mb `0.5rem`
- Display: `2.5rem` Bricolage Grotesque color emerald-700 — `"{cobrado} €"`
- Sub: Manrope `0.75rem` color emerald-600 — `"{n} pagadas"`

### KPI 3 · "Subir nueva factura" (CTA)
- Card blanca normal
- Eyebrow "Subir nueva factura" slate-500, mb `0.5rem`
- Descripción: Manrope `0.875rem` / 500 / line-height 1.4 / color slate-500 — *"Tipo, monto, fecha límite y adjuntar PDF"* (margin-bottom auto para empujar el botón abajo)
- Botón emerald (ver §8), align-self flex-start, mt `0.75rem`:
  - Icono `+` 14×14
  - Texto "Subir factura"
  - Al click → abre modal/drawer de subida de factura

---

## 7. Tabla de facturas

Card contenedora con **padding 0** (la tabla ocupa todo).

### Cabecera de la card
- Display flex justify-between center
- Padding `1.25rem`, border-bottom `1px solid slate-100`

**Izquierda:**
- Eyebrow `{direccion} · {ciudad}` — slate-500, mb `0.375rem`
- h2 Bricolage Grotesque `1.125rem` / 500 — *"Historial de facturas"*

**Derecha — filtros:**
- 3 botones secondary pequeños: `padding 0.5rem 0.875rem`, `fontSize 0.75rem`
- Etiquetas: "Todas", "Pendientes", "Pagadas"
- El filtro activo: bg white, border slate-300 (resaltado sutil)

### Tabla
- `width: 100%; border-collapse: collapse`
- **Thead:** Geist Mono `0.625rem` / 600 / UPPER / tracking `0.12em` / color slate-500
  - Padding `0.75rem 1rem`, text-align left
  - Border-bottom `1px solid slate-200`
- **Tbody td:** Manrope `0.875rem` / 500 / slate-900
  - Padding `0.875rem 1rem`
  - Border-bottom `1px dashed slate-200` (excepto última fila)
  - Hover: `tr:hover td { background: slate-50 }`

### Columnas (de izquierda a derecha)
1. **Tipo (icon)** — `2rem × 2rem` rounded `0.5rem`, bg `{color}15`, color `{color}`, icono 16×16 según el tipo
2. **Concepto** — dos líneas:
   - Manrope `0.875rem` / 600 / slate-900 — label de la factura
   - Si pagada: Geist Mono `0.6875rem` / 500 / tracking `0.04em` / slate-500 — *"Pagado por {nombre} · {fecha}"*
3. **Subida** — Geist Mono `0.8125rem` / 500 / slate-500
4. **Vence** — Geist Mono `0.8125rem` / 500 / slate-500
5. **Monto** — Bricolage Grotesque `0.9375rem` / 600, color slate-900 si pendiente, slate-400 si pagada, **text-align right**
6. **Estado** — chip:
   - Display inline-flex align-center gap `0.375rem`
   - Padding `0.1875rem 0.5rem`, radius pill
   - Geist Mono `0.625rem` / 600 / tracking `0.08em` / UPPER
   - Pagada: bg emerald-50, color emerald-700, dot `●`
   - Pendiente: bg amber-100, color amber-800, dot `●`
7. **Acciones** — botón kebab (3 puntos verticales):
   - `1.75rem × 1.75rem`, radius `0.5rem`, bg transparent, color slate-500
   - Hover: bg slate-100, color slate-900
   - Al click → dropdown con: **Ver PDF · Editar · Eliminar** (solo eliminar para facturas pendientes; deshabilitado para pagadas)

---

## 8. Botones

Heredan del sistema general. Recordatorio:

```
.btn-primary   { bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-[1.125rem] py-3 text-xs font-semibold }
.btn-secondary { bg-slate-100 hover:bg-white border border-slate-200 text-slate-900 rounded-full px-[1.125rem] py-3 text-xs font-semibold }
```

Cualquier botón con icono SVG inline 14×14, stroke 2, `vertical-align: -2`, margin-right `0.375rem`.

---

## 9. Mock data

```js
const grupos = [
  { id: 1, direccion: "C/ San Antonio, 12 · 3º B", ciudad: "Granada", miembros: 3, activo: true },
  { id: 2, direccion: "C/ Recogidas, 14 · 1º A",   ciudad: "Granada", miembros: 4, activo: false },
];

const facturas = [
  { id: 1, tipo: "alquiler", label: "Alquiler · mayo",  monto: 595, fechaSubida: "01 may", fechaLimite: "27 may", estado: "pagado",    pagadoPor: "Lucía",  pagadoFecha: "26 may" },
  { id: 2, tipo: "luz",      label: "Luz · Iberdrola",  monto: 78,  fechaSubida: "12 may", fechaLimite: "30 may", estado: "pendiente", pagadoPor: null,     pagadoFecha: null },
  { id: 3, tipo: "agua",     label: "Agua · Emasagra",  monto: 42,  fechaSubida: "10 may", fechaLimite: "15 may", estado: "pagado",    pagadoPor: "Andrés", pagadoFecha: "14 may" },
  { id: 4, tipo: "wifi",     label: "Wifi · Movistar",  monto: 35,  fechaSubida: "18 may", fechaLimite: "01 jun", estado: "pendiente", pagadoPor: null,     pagadoFecha: null },
  { id: 5, tipo: "parking",  label: "Parking",          monto: 60,  fechaSubida: "20 may", fechaLimite: "05 jun", estado: "pendiente", pagadoPor: null,     pagadoFecha: null },
  { id: 6, tipo: "alquiler", label: "Alquiler · abril", monto: 595, fechaSubida: "01 abr", fechaLimite: "27 abr", estado: "pagado",    pagadoPor: "Lucía",  pagadoFecha: "25 abr" },
];

// KPIs derivados
const pendientes = facturas.filter(f => f.estado === 'pendiente');
const cobrado    = facturas.filter(f => f.estado === 'pagado').reduce((a, b) => a + b.monto, 0);
const porCobrar  = pendientes.reduce((a, b) => a + b.monto, 0);
```

---

## 10. Breakpoints

```css
/* ≤ 64rem (1024 px) */
@media (max-width: 64rem) {
  .topbar { padding: 1rem 1.5rem; }
  .main   { padding: 1.5rem; }
  /* KPIs siguen en 3 cols */
}

/* ≤ 48rem (768 px) */
@media (max-width: 48rem) {
  .kpis { grid-template-columns: 1fr; }
  /* tabla: scroll horizontal o esconder columnas "Subida" y "Vence" */
}

/* ≤ 40rem (640 px) */
@media (max-width: 40rem) {
  .topbar { padding: 0.875rem 1rem; }
  .main   { padding: 1rem; }
  .user-chip span /* el bloque de texto */ { display: none; }  /* solo avatar */
  /* tabla → cards por fila */
}
```

En móvil, la tabla pasa a ser una lista de cards (una por factura) con la información apilada verticalmente. Las acciones siguen siendo el kebab.

---

## 11. Flujos (no implementados aún, recomendación)

### A. Subir factura (modal/drawer)
Al pulsar "Subir factura" se abre un modal centrado, `max-width: 32rem`, padding `1.5rem 1.75rem`, radius `1.25rem`, bg white, overlay slate-900/50 con backdrop-blur.

**Campos:**
1. **Tipo** — fila de chips seleccionables (alquiler / luz / agua / wifi / parking), cada uno con su icono coloreado
2. **Concepto** — input de texto: "Luz · Iberdrola — mayo"
3. **Monto** — input numérico con sufijo "€"
4. **Fecha límite** — date picker
5. **Adjuntar PDF** — drop zone con dashed border
6. **Asignar a grupo** — preseleccionado con el grupo activo

**Footer del modal:**
- Botón secondary "Cancelar"
- Botón primary "Subir factura"

### B. Eliminar factura
- Click kebab → dropdown
- Click "Eliminar" → mini-modal de confirmación con título + descripción + dos botones (Cancelar / Eliminar en rojo)
- Solo permitido para facturas en estado `pendiente`. Las pagadas tienen ese item del dropdown deshabilitado (texto slate-300) con tooltip explicando por qué.

### C. Vincular grupo con código
- Click chip dashed → modal con un input de 6 dígitos (estilo OTP, 6 cajas separadas)
- Al completar → validación
- Si OK → cierra modal y agrega el grupo a la lista de chips, lo selecciona automáticamente
- Si error → mensaje rojo bajo el input

---

## 12. Tailwind cheat-sheet

```jsx
// Top bar
<header className="flex items-center justify-between px-10 py-4 bg-white border-b border-slate-200">
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-[0.625rem] bg-emerald-600 text-white flex items-center justify-center">
      <Icon name="receipt" size={18}/>
    </div>
    <span className="font-display text-lg font-medium text-slate-900 -tracking-[0.015em]">
      Gestión de facturas
    </span>
  </div>
  {/* user + logout */}
</header>

// Group chip
<button className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition
  ${activo ? 'bg-emerald-50 border-emerald-600' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
  <div className={`w-2 h-2 rounded-full ${activo ? 'bg-emerald-600' : 'bg-slate-300'}`}/>
  <div className="text-left">
    <div className={`font-semibold text-sm ${activo ? 'text-emerald-700' : 'text-slate-900'}`}>
      {g.direccion}
    </div>
    <div className="font-mono text-[0.6875rem] font-medium tracking-[0.04em] text-slate-500 mt-0.5">
      {g.ciudad} · {g.miembros} inquilinos
    </div>
  </div>
</button>

// KPI dark
<div className="rounded-[1.25rem] bg-slate-900 text-white p-5 shadow-sm border border-slate-900">
  <div className="font-mono text-[0.625rem] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-2">
    Por cobrar este mes
  </div>
  <div className="font-display text-[2.5rem] font-medium -tracking-[0.02em] leading-none">
    {porCobrar} €
  </div>
  <div className="text-xs font-medium text-slate-400 mt-2">
    {pendientes.length} facturas pendientes
  </div>
</div>

// Estado chip
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
  font-mono text-[0.625rem] font-semibold tracking-[0.08em] uppercase
  bg-emerald-50 text-emerald-700">
  ● Pagada
</span>
```

---

## 13. Notas de implementación

- **Sin aside:** la página no tiene navegación lateral. El casero no tiene módulos a los que ir (solo factúras). Cualquier login/logout pasa por el botón en el top bar.
- **Rol único:** este componente es solo para usuarios con `role: 'casero'`. El backend debería redirigir a esta vista directamente tras el login si el usuario tiene ese rol.
- **Persistencia:** el último grupo seleccionado debería guardarse en `localStorage` o en sesión para que al volver al casero le abra ya en el mismo grupo.
- **PDFs:** las facturas tendrán un `pdfUrl` para abrir/descargar. El kebab debería tener "Ver PDF" como primera acción.
- **Permisos sobre acciones:** una vez una factura pasa a `pagado`, el casero no puede editarla ni eliminarla (solo verla). Esto se traduce visualmente con los items del kebab disabled.
- **Accesibilidad:** todos los iconos kebab/logout deben tener `aria-label` o `title`.
- **Responsive:** la tabla en móvil debería convertirse en cards verticales (no scroll horizontal, mala UX).
