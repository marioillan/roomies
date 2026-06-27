# Especificación del sistema de matching — Housie

## Contexto del proyecto

Aplicación web llamada **Housie** orientada al mercado español de pisos compartidos.
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express, sin ORM, usando `pg` (node-postgres) directamente
- **Base de datos:** PostgreSQL 16
- **Auth:** JWT + refresh tokens

---

## Descripción del sistema de matching

El matching mide la compatibilidad entre un **usuario buscador de piso** y un **grupo de convivencia** que tiene una habitación libre. Se compone de dos fases secuenciales:

1. **Fase 1 — Filtros duros:** eliminación de grupos incompatibles antes de calcular nada
2. **Fase 2 — Score ponderado:** puntuación de compatibilidad (0–100%) sobre dimensiones de estilo de vida

El score **no se guarda en base de datos** — se calcula en el momento en que el usuario solicita el listado del marketplace y se devuelve junto con cada publicación.

---

## Perfiles implicados

### Perfil de convivencia del usuario (`perfiles_convivencia_usuario`)

| Campo DB | Pregunta UI | Opciones |
|---|---|---|
| `ocupacion` | ¿Cuál es tu ocupación? | `ESTUDIO` / `TRABAJO` / `ESTUDIO_Y_TRABAJO` |
| `horario` | ¿Cuál es tu horario típico? | `MADRUGADOR` / `INTERMEDIO` / `NOCTURNO` |
| `ambiente` | ¿Qué ambiente prefieres en casa? | `TRANQUILO` / `EQUILIBRADO` / `SOCIAL` |
| `frecuencia_visitas` | ¿Con qué frecuencia recibes visitas? | `CASI_NUNCA` / `A_VECES` / `FRECUENTE` |
| `tolerancia_fiestas` | ¿Con qué frecuencia haces fiestas? | `NUNCA` / `OCASIONAL` / `FRECUENTE` |
| `fumador` | ¿Fumas? | `true` / `false` |
| `acepta_fumadores` | ¿Aceptas fumadores? | `SI` / `NO` / `INDIFERENTE` |
| `tiene_mascotas` | ¿Tienes mascotas? | `true` / `false` |
| `acepta_mascotas` | ¿Aceptas mascotas? | `SI` / `NO` / `DEPENDE` |
| `lgbtq_friendly` | ¿Eres LGBTQ+ friendly? | `true` / `false` |

### Perfil de convivencia del grupo (`perfiles_convivencia_grupo`)

| Campo DB | Pregunta UI | Opciones |
|---|---|---|
| `ocupacion` | ¿Cuál es la ocupación predominante del piso? | `ESTUDIO` / `TRABAJO` / `ESTUDIO_Y_TRABAJO` |
| `horario` | ¿Cuál es el horario general del piso? | `MADRUGADOR` / `INTERMEDIO` / `NOCTURNO` |
| `ambiente` | ¿Qué ambiente tiene el piso? | `TRANQUILO` / `EQUILIBRADO` / `SOCIAL` |
| `frecuencia_visitas` | ¿Con qué frecuencia hay visitas en el piso? | `CASI_NUNCA` / `A_VECES` / `FRECUENTE` |
| `tolerancia_fiestas` | ¿Con qué frecuencia se hacen fiestas? | `NUNCA` / `OCASIONAL` / `FRECUENTE` |
| `acepta_fumadores` | ¿Se permite fumar en el piso? | `SI` / `NO` / `INDIFERENTE` |
| `acepta_mascotas` | ¿Se aceptan mascotas? | `SI` / `NO` / `DEPENDE` |
| `lgbtq_friendly` | ¿Es el piso LGBTQ+ friendly? | `true` / `false` |

> **Importante:** El perfil del grupo NO tiene `fumador` ni `tiene_mascotas`. Solo tiene preguntas de aceptación, no de descripción personal.

---

## Fase 1 — Filtros duros

Se aplican antes del cálculo del score. Si un grupo no pasa alguno de estos filtros, se excluye del listado completamente.

| Condición del usuario | Grupos excluidos |
|---|---|
| `acepta_fumadores = NO` | grupos con `acepta_fumadores = SI` |
| `acepta_mascotas = NO` | grupos con `acepta_mascotas = SI` |
| `lgbtq_friendly = true` | grupos con `lgbtq_friendly = false` |
| `fumador = true` | grupos con `acepta_fumadores = NO` |
| `tiene_mascotas = true` | grupos con `acepta_mascotas = NO` |

**Regla de indiferencia/depende:** los valores `INDIFERENTE` y `DEPENDE` en el grupo siempre pasan el filtro — no son un rechazo explícito.

---

## Fase 2 — Score ponderado

Se calcula solo para los grupos que han pasado los filtros duros. El score es un valor entre 0 y 100.

### Pesos por dimensión

| Dimensión | Campo | Peso |
|---|---|---|
| Horario | `horario` | 25% |
| Ambiente | `ambiente` | 25% |
| Visitas | `frecuencia_visitas` | 20% |
| Fiestas | `tolerancia_fiestas` | 20% |
| Ocupación | `ocupacion` | 10% |

**Total: 100%**

> Los pesos no se muestran al usuario en ningún momento.

### Cálculo del match por dimensión

Cada dimensión devuelve un valor `match_X` entre 0.0 y 1.0 que luego se multiplica por su peso.

#### Dimensiones ordinales (Visitas, Fiestas)
Escala de 3 opciones con orden de menor a mayor. La distancia entre opciones importa.

```
diferencia 0 pasos → 1.0
diferencia 1 paso  → 0.5
diferencia 2 pasos → 0.0
```

Orden de opciones:
- Visitas: `CASI_NUNCA(0)` → `A_VECES(1)` → `FRECUENTE(2)`
- Fiestas: `NUNCA(0)` → `OCASIONAL(1)` → `FRECUENTE(2)`

#### Dimensiones con extremos (Horario, Ambiente)
También ordinales — los extremos son incompatibles entre sí, el valor intermedio es compatible con ambos.

```
diferencia 0 pasos → 1.0
diferencia 1 paso  → 0.5
diferencia 2 pasos → 0.0
```

Orden de opciones:
- Horario: `MADRUGADOR(0)` → `INTERMEDIO(1)` → `NOCTURNO(2)`
- Ambiente: `TRANQUILO(0)` → `EQUILIBRADO(1)` → `SOCIAL(2)`

#### Ocupación (categórica)
No tiene orden natural de conflicto. Reglas:

```
igual → 1.0
uno de los dos es ESTUDIO_Y_TRABAJO → 0.5 (comparte algo con ambos)
ESTUDIO vs TRABAJO → 0.5 (no hay conflicto real de convivencia)
```

### Fórmula final

```
score = (match_horario × 0.25)
      + (match_ambiente × 0.25)
      + (match_visitas × 0.20)
      + (match_fiestas × 0.20)
      + (match_ocupacion × 0.10)

score_porcentaje = score × 100
```

---

## Presentación del resultado al usuario

### En la tarjeta del marketplace
- Porcentaje global visible: `87% de compatibilidad`
- Publicaciones ordenadas de mayor a menor compatibilidad

### En el detalle de la publicación
Desglose por dimensión con tres estados visuales:

| Estado | Criterio interno |
|---|---|
| ✓ Coincide | match_X = 1.0 |
| ~ Diferencia moderada | match_X = 0.5 |
| ✗ No coincide | match_X = 0.0 |

Los filtros duros no se muestran en el desglose — los pisos incompatibles simplemente no aparecen.

### Matching bidireccional
Cuando el administrador del grupo gestiona las solicitudes recibidas, también ve el % de compatibilidad de cada solicitante con su grupo. Se usa el mismo algoritmo aplicado en sentido inverso (grupo como referencia, usuario solicitante como comparado).

---

## Estados del marketplace según perfil del usuario

| Estado del usuario | Comportamiento |
|---|---|
| Sin perfil de convivencia | Ve todas las publicaciones ordenadas por fecha + banner invitándole a completar su perfil |
| Con perfil de convivencia | Filtros duros aplicados + publicaciones ordenadas por score + % visible en tarjeta |

---

## Sistema de intereses

Los intereses son **independientes del matching** — no intervienen en el score ni en los filtros duros. Son información descriptiva del usuario visible en su perfil público.

### Reglas
- Lista cerrada predefinida (no editable por el usuario)
- El usuario debe seleccionar **mínimo 3 intereses**, sin máximo
- Validación en frontend y en backend (400 si < 3)
- Visibles para los miembros del grupo cuando reciben una solicitud

### Esquema de base de datos

```sql
CREATE TABLE intereses (
  id        VARCHAR(36) PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL UNIQUE,
  categoria VARCHAR(50)
);

CREATE TABLE usuario_intereses (
  usuario_id  VARCHAR(36) REFERENCES usuarios(id) ON DELETE CASCADE,
  interes_id  VARCHAR(36) REFERENCES intereses(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, interes_id)
);
```

### Lista de intereses predefinidos

**Deporte y actividad física**
Gimnasio, Yoga, Crossfit, Senderismo, Ciclismo, Running, Escalada, Natación, Fútbol, Baloncesto, Padel, Artes marciales, Surf, Esquí

**Alimentación**
Vegano, Vegetariano, Café de especialidad, Cocina en casa, Repostería, Comida internacional, Streetfood

**Cultura y ocio**
Lectura, Cine, Series, Teatro, Música en directo, Museos, Fotografía, Videojuegos, Podcasts, Arte

**Vida social**
Salir de noche, Bares y copas, Viajes, Festivales, Voluntariado, Networking

**Bienestar**
Meditación, Pilates, Vida sostenible, Mindfulness, Bienestar mental

**Total: 46 intereses**
