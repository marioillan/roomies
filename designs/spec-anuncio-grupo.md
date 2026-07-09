# Anuncio del grupo — Especificación

Vista del anuncio de piso accesible desde el aside del grupo de convivencia (icono activo: anuncio). Hay tres estados posibles según si el grupo tiene anuncio publicado y el rol del usuario.

---

## Estructura general

La vista mantiene el **aside del grupo** (barra lateral izquierda emerald, 5rem de ancho) en todas las situaciones. El contenido principal ocupa el resto del ancho (max-width 1280px).

```
┌─ aside (5rem) ─┬─────────────────── main ───────────────────┐
│  home           │  h1 "Tu anuncio" / "Publica tu piso"       │
│  grupo          │  [chip visible — solo admin si hay anuncio] │
│  anuncio ●      │                                             │
│  tareas         │  Contenido según estado (ver abajo)         │
│  facturas       │                                             │
│  compra         │                                             │
│  calendario     │                                             │
│  ─────          │                                             │
│  chat           │                                             │
│  avatar         │                                             │
│  logout         │                                             │
└─────────────────┴─────────────────────────────────────────────┘
```

---

## Estado 1 — Sin anuncio

Se muestra cuando el grupo todavía no ha creado ningún anuncio.

**Contenido (centrado vertical y horizontal):**

- Icono grande en cuadro redondeado (emerald-50, borde emerald-100) — icono de imagen/anuncio
- Título: `"Todavía no tenéis anuncio"` — Bricolage Grotesque 2rem
- Párrafo explicativo (~2 líneas): qué es el anuncio y para qué sirve (encontrar compañeros compatibles en el marketplace según el perfil de convivencia)
- Botón primario grande `"Crear anuncio"` con icono `+` — ancho máximo 20rem, centrado
- Texto de ayuda bajo el botón: `"Solo el administrador puede crear y editar el anuncio"` — gris, pequeño

**Permisos:** todos los miembros ven este estado. Solo el admin puede pulsar "Crear anuncio".

---

## Estado 2 — Con anuncio (vista administrador)

Layout de dos columnas (`1fr 19rem`, gap `1.5rem`, align-items start).

### Header
- H1: `"Tu anuncio"` — Bricolage Grotesque 2.25rem
- Chip de estado a la derecha: badge verde `"Visible en búsquedas"` (icono ojo, bg emerald-50, borde emerald-100, color emerald-700) o badge gris `"No visible"` según el toggle

### Columna izquierda

#### Carrusel de fotos
Card con padding 1.25rem:
- **Foto principal** `aspect-ratio: 16/9`, border-radius 0.875rem
  - Badge arriba-izquierda: `"Público"` (verde) o `"No visible"` (gris) según visibilidad
  - Flechas de navegación izquierda/derecha sobre la foto (círculos blancos translúcidos, opacidad reducida en los extremos)
  - Contador abajo-derecha: `"1 / 5"` — Geist Mono, pill oscuro
- **Thumbnails**: grid 4 columnas, `aspect-ratio: 1.3`, border-radius 0.75rem, borde 2px (activa → emerald-600). Si hay más de 4 fotos, la 4ª muestra overlay oscuro con `"+N"`.

#### Información del anuncio
Card con tabla de filas (label izquierda en Geist Mono caps, valor derecha), separadas por línea discontinua:
- **Título** — tipografía display 1.125rem
- **Ciudad**
- **Precio** — `"300 € / persona al mes"` en verde (emerald-700, semibold)
- **Hab. libres**
- **Tamaño** — en m²

### Columna derecha (sticky)

#### Card Visibilidad *(solo admin)*
- Fila de estado con dot de color + texto (`"Público"` / `"No visible"`) + **toggle** a la derecha
  - Toggle ON: pista emerald-500, thumb blanco desplazado a la derecha
  - Toggle OFF: pista slate-300, thumb a la izquierda
- Fondo de la fila: emerald-50 (ON) / slate-50 (OFF)

#### Card Acciones
Lista de botones tipo fila con icono en cuadro coloreado + título + subtítulo:

| Acción | Icono | Color icono | Quién lo ve |
|---|---|---|---|
| **Ver anuncio público** | ojo | emerald | todos los miembros |
| **Editar anuncio** | lápiz | slate | solo admin |
| **Mensajes** | chat | azul (blue-500) | solo admin |
| **Eliminar anuncio** | papelera | rojo | solo admin |

- "Mensajes" muestra un badge numérico azul con el número de conversaciones
- "Eliminar anuncio" tiene fondo rojo suave (red-50, borde red-200, texto red-600)

#### Modal de confirmación (eliminar)
Se abre al pulsar "Eliminar anuncio". Overlay con blur, card centrada:
- Icono papelera en cuadro rojo
- Título: `"¿Eliminar el anuncio?"`
- Descripción del riesgo (irreversible, desaparece del marketplace, se pierden estadísticas)
- Dos botones: `"Cancelar"` (secondary) + `"Sí, eliminar"` (rojo sólido)
- Click fuera del modal → cierra sin acción

---

## Estado 3 — Con anuncio (vista miembro)

Igual que el estado 2 pero con las siguientes diferencias:

- **No** se muestra la card de Visibilidad
- **No** aparecen las acciones: Editar anuncio, Mensajes, Eliminar anuncio
- **Sí** aparece el botón "Ver anuncio público" (visible para todos)
- El chip de estado del header **no** aparece (solo lo ve el admin)

---

## Datos del anuncio (mock)

```js
const anuncio = {
  titulo: 'Piso en Gonzalo Gallas',
  ciudad: 'Granada',
  precio: 300,       // € por persona al mes
  habLibres: 1,
  m2: 85,
  visible: true,     // controla badge y toggle
};

const fotos = [      // N fotos; placeholder = gradiente diagonal
  { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 },
];

const stats = {
  mensajes: 12,      // conversaciones sobre el anuncio
};
```

---

## Paleta y tipografía

| Rol | Valor |
|---|---|
| Fondo página | `#f1f5f9` (slate-100) |
| Card | `#fff`, borde `#f1f5f9`, radius `1.25rem` |
| Acento principal | `#059669` emerald-600 (hover `#047857`) |
| Acento claro | `#ecfdf5` / `#d1fae5` / `#10b981` |
| Texto | `#0f172a` / muted `#64748b` / muy muted `#94a3b8` |
| Borde | `#e2e8f0` |
| Rojo acciones destructivas | `#dc2626` / bg `#fef2f2` / borde `#fecaca` |

- **Display / títulos:** Bricolage Grotesque 400–600
- **Body / UI:** Manrope 400–600
- **Labels / mono:** Geist Mono 500–600

---

## Notas

- El aside nunca cambia entre los tres estados.
- El toggle de visibilidad solo afecta a si el anuncio aparece en el marketplace; no elimina el anuncio.
- Al confirmar el borrado en el modal, la vista vuelve al Estado 1 (sin anuncio).
- Las fotos del anuncio son imágenes subidas por el usuario; los placeholders usan gradientes diagonales de colores.
