# Resumen del schema.prisma — Housie

Resumen de todos los modelos definidos en `backend/prisma/schema.prisma`, con sus columnas, tipo y si son obligatorias (NOT NULL) o nullable en la base de datos. Los campos de relación (navegación entre modelos, no son columnas reales) se omiten de las tablas y se indican como nota al final de cada modelo.

---

## Usuario (usuarios)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| nombre | String (VarChar 100) | Sí |
| email | String (VarChar 255, único) | Sí |
| password | String? | No |
| foto_perfil | String? | No |
| foto_1 | String? | No |
| foto_2 | String? | No |
| google_id | String? (VarChar 255, único) | No |
| google_refresh_token | String? | No |
| google_calendar_token | String? | No |
| fecha_registro | DateTime? (Timestamp, default now()) | No |
| created_at | DateTime? (Timestamp, default now()) | No |
| updated_at | DateTime? (Timestamp, default now()) | No |

**Relaciones:** `miembros_grupo`, `perfil_convivencia`, `preferencias_companero`, `favoritos`, `solicitudes_contacto`, `mensajes`, `facturas_casero`, `pagos_factura`, `eventos`, `productos_anadidos`, `productos_comprados`, `intereses`, `asignaciones`, `refresh_tokens`.

---

## Grupo (grupos)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| nombre | String (VarChar 100) | Sí |
| codigo_acceso | String (VarChar 6, único) | Sí |
| codigo_casero | String? (VarChar 6, único) | No |
| foto_perfil | String? | No |
| descripcion | String | Sí |
| ciudad | String? (VarChar 100) | No |
| buscar_companero | Boolean? (default false) | No |
| activo | Boolean? (default true) | No |
| dia_limpieza | DiaSemana? (enum) | No |
| semana_rotacion | Int? (default 0) | No |
| rotacion_semana_actual | DateTime? (Date) | No |
| created_at | DateTime? (Timestamp, default now()) | No |
| updated_at | DateTime? (Timestamp, default now()) | No |

**Relaciones:** `miembros`, `perfil_convivencia`, `publicacion`, `solicitudes_contacto`, `tareas`, `facturas`, `eventos`, `productos`, `intereses`.

---

## MiembroGrupo (miembros_grupo)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| usuario_id | String (VarChar 36) | Sí |
| grupo_id | String (VarChar 36) | Sí |
| rol | RolGrupo (enum, default MEMBER) | Sí |
| es_casero | Boolean? (default false) | No |
| activo | Boolean? (default true) | No |
| fecha_union | DateTime? (Timestamp, default now()) | No |

**Notas:** clave única compuesta `(usuario_id, grupo_id)`. FK a `Usuario` y `Grupo` con `onDelete: Cascade`.

---

## PerfilConvivenciaUsuario (perfiles_convivencia_usuario)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| usuario_id | String (VarChar 36, único) | Sí |
| pais | String? (VarChar 100, default "España") | No |
| genero | String? (VarChar 50) | No |
| fecha_nacimiento | DateTime? (Date) | No |
| ocupacion | Ocupacion? (enum) | No |
| horario | Horario? (enum) | No |
| frecuencia_visitas | FrecuenciaVisitas? (enum) | No |
| ambiente | Ambiente? (enum) | No |
| tolerancia_fiestas | FrecuenciaFiestas? (enum) | No |
| frecuencia_salidas | FrecuenciaSalidas? (enum) | No |
| fumador | Boolean? | No |
| acepta_fumadores | AceptaFumadores? (enum) | No |
| tiene_mascotas | Boolean? | No |
| acepta_mascotas | AceptaMascotas? (enum) | No |
| lgbtq_friendly | Boolean? | No |
| limpieza_orden | LimpiezaOrden? (enum) | No |
| nivel_ruido | NivelRuido? (enum) | No |
| sobre_mi | String | Sí |
| created_at | DateTime? (Timestamp, default now()) | No |
| updated_at | DateTime? (Timestamp, default now()) | No |

**Notas:** relación 1:1 con `Usuario` (`onDelete: Cascade`).

---

## PreferenciasCompanero (preferencias_companero)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| usuario_id | String (VarChar 36, único) | Sí |
| ocupacion | Ocupacion? (enum) | No |
| ocupacion_req | Boolean? (default false) | No |
| horario | Horario? (enum) | No |
| horario_req | Boolean? (default false) | No |
| frecuencia_visitas | FrecuenciaVisitas? (enum) | No |
| frecuencia_visitas_req | Boolean? (default false) | No |
| ambiente | Ambiente? (enum) | No |
| ambiente_req | Boolean? (default false) | No |
| tolerancia_fiestas | FrecuenciaFiestas? (enum) | No |
| tolerancia_fiestas_req | Boolean? (default false) | No |
| frecuencia_salidas | FrecuenciaSalidas? (enum) | No |
| frecuencia_salidas_req | Boolean? (default false) | No |
| acepta_fumadores | AceptaFumadores? (enum) | No |
| acepta_fumadores_req | Boolean? (default false) | No |
| acepta_mascotas | AceptaMascotas? (enum) | No |
| acepta_mascotas_req | Boolean? (default false) | No |
| lgbtq_friendly | Boolean? | No |
| lgbtq_friendly_req | Boolean? (default false) | No |
| limpieza_orden | LimpiezaOrden? (enum) | No |
| limpieza_orden_req | Boolean? (default false) | No |
| nivel_ruido | NivelRuido? (enum) | No |
| nivel_ruido_req | Boolean? (default false) | No |
| created_at | DateTime? (Timestamp, default now()) | No |
| updated_at | DateTime? (Timestamp, default now()) | No |

**Notas:** relación 1:1 con `Usuario` (`onDelete: Cascade`). Cada campo `*_req` indica si esa preferencia es obligatoria (filtro estricto) o solo preferente.

---

## PerfilConvivenciaGrupo (perfiles_convivencia_grupo)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| grupo_id | String (VarChar 36, único) | Sí |
| ocupacion | Ocupacion? (enum) | No |
| horario | Horario? (enum) | No |
| frecuencia_visitas | FrecuenciaVisitas? (enum) | No |
| ambiente | Ambiente? (enum) | No |
| tolerancia_fiestas | FrecuenciaFiestas? (enum) | No |
| frecuencia_salidas | FrecuenciaSalidas? (enum) | No |
| acepta_fumadores | AceptaFumadores? (enum) | No |
| acepta_mascotas | AceptaMascotas? (enum) | No |
| lgbtq_friendly | Boolean? | No |
| limpieza_orden | LimpiezaOrden? (enum) | No |
| nivel_ruido | NivelRuido? (enum) | No |
| created_at | DateTime? (Timestamp, default now()) | No |
| updated_at | DateTime? (Timestamp, default now()) | No |

**Notas:** relación 1:1 con `Grupo` (`onDelete: Cascade`).

---

## Publicacion (publicaciones)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| grupo_id | String (VarChar 36, único) | Sí |
| titulo | String (VarChar 255) | Sí |
| descripcion | String | Sí |
| ciudad | String (VarChar 100) | Sí |
| direccion | String? (VarChar 255) | No |
| piso_puerta | String? (VarChar 50) | No |
| precio | Decimal (10,2) | Sí |
| habitaciones_libres | Int? (default 1) | No |
| tipo_piso | String? (VarChar 50) | No |
| habitaciones_totales | Int? | No |
| tamano_piso | Decimal? (10,2) | No |
| planta | Int? | No |
| ascensor | Boolean? (default false) | No |
| wifi | Boolean? (default false) | No |
| lavadora | Boolean? (default false) | No |
| lavavajillas | Boolean? (default false) | No |
| aire_acondicionado | Boolean? (default false) | No |
| calefaccion | Boolean? (default false) | No |
| parking | Boolean? (default false) | No |
| terraza | Boolean? (default false) | No |
| amueblado | Boolean? (default false) | No |
| permite_fumar | Boolean? (default false) | No |
| permite_mascotas | Boolean? (default false) | No |
| visitas | String? (VarChar 50) | No |
| horario_silencio | String? (VarChar 50) | No |
| genero_preferido | String? (VarChar 50) | No |
| normas_adicionales | String? | No |
| telefono_contacto | String? (VarChar 20) | No |
| modo_contacto | String? (VarChar 20, default "CHAT") | No |
| visible | Boolean? (default true) | No |
| latitud | Decimal? (10,7) | No |
| longitud | Decimal? (10,7) | No |
| fecha_publicacion | DateTime? (Timestamp, default now()) | No |
| updated_at | DateTime? (Timestamp, default now()) | No |

**Notas:** relación 1:1 con `Grupo` (`onDelete: Cascade`, `UNIQUE` en `grupo_id`). Tiene `fotos` (`FotoPublicacion[]`) y `favoritos` (`Favorito[]`).

---

## FotoPublicacion (fotos_publicacion)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| publicacion_id | String (VarChar 36) | Sí |
| url | String | Sí |
| orden | Int? (default 0) | No |

**Notas:** FK a `Publicacion` (`onDelete: Cascade`). No tiene columna `cloudinary_id`.

---

## Favorito (favoritos)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| usuario_id | String (VarChar 36) | Sí |
| publicacion_id | String (VarChar 36) | Sí |
| fecha_guardado | DateTime? (Timestamp, default now()) | No |

**Notas:** clave única compuesta `(usuario_id, publicacion_id)`. FKs con `onDelete: Cascade`.

---

## SolicitudContacto (solicitudes_contacto)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| usuario_id | String (VarChar 36) | Sí |
| grupo_id | String (VarChar 36) | Sí |
| estado | EstadoSolicitud (enum, default PENDIENTE) | Sí |
| fecha_envio | DateTime? (Timestamp, default now()) | No |

**Notas:** clave única compuesta `(usuario_id, grupo_id)`. Relación 1:1 opcional con `Chat`.

---

## Chat (chats)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| solicitud_id | String (VarChar 36, único) | Sí |
| estado | EstadoChat (enum, default ACTIVO) | Sí |
| created_at | DateTime? (Timestamp, default now()) | No |

**Notas:** relación 1:1 con `SolicitudContacto` (`onDelete: Cascade`). Tiene `mensajes` (`Mensaje[]`).

---

## Mensaje (mensajes)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| chat_id | String (VarChar 36) | Sí |
| remitente_id | String (VarChar 36) | Sí |
| contenido | String | Sí |
| enviado_en | DateTime? (Timestamp, default now()) | No |

**Notas:** FK a `Chat` (`onDelete: Cascade`) y a `Usuario` (remitente, sin cascade).

---

## Tarea (tareas)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| grupo_id | String (VarChar 36) | Sí |
| nombre | String (VarChar 255) | Sí |
| descripcion | String? | No |
| es_recurrente | Boolean? (default false) | No |
| created_at | DateTime? (Timestamp, default now()) | No |

**Notas:** reutilizada como contenedor de "zonas" de limpieza (`es_recurrente = TRUE`). FK a `Grupo` (`onDelete: Cascade`). Tiene `asignaciones` (`AsignacionTarea[]`).

---

## AsignacionTarea (asignaciones_tarea)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| tarea_id | String (VarChar 36) | Sí |
| usuario_id | String (VarChar 36) | Sí |
| semana | DateTime (Date) | Sí |
| estado | EstadoTarea (enum, default PENDIENTE) | Sí |
| fecha_completada | DateTime? (Timestamp) | No |

**Notas:** clave única compuesta `(tarea_id, usuario_id, semana)`. FK a `Tarea` (`onDelete: Cascade`) y `Usuario`.

---

## Factura (facturas)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| grupo_id | String (VarChar 36) | Sí |
| casero_id | String (VarChar 36) | Sí |
| tipo | TipoFactura (enum) | Sí |
| descripcion | String? | No |
| importe_total | Decimal (10,2) | Sí |
| tipo_division | TipoDivision (enum, default EQUITATIVA) | Sí |
| fecha_emision | DateTime (Date) | Sí |
| fecha_vencimiento | DateTime (Date) | Sí |
| url_documento | String? | No |
| created_at | DateTime? (Timestamp, default now()) | No |
| updated_at | DateTime? (Timestamp, default now()) | No |

**Notas:** FK a `Grupo` (`onDelete: Cascade`) y `Usuario` (casero, relación nombrada `CaseroFacturas`). Tiene `pagos` (`PagoFactura[]`).

---

## PagoFactura (pagos_factura)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| factura_id | String (VarChar 36) | Sí |
| usuario_id | String (VarChar 36) | Sí |
| importe_asignado | Decimal (10,2) | Sí |
| pagado | Boolean? (default false) | No |
| fecha_pago | DateTime? (Timestamp) | No |

**Notas:** clave única compuesta `(factura_id, usuario_id)`. FK a `Factura` (`onDelete: Cascade`) y `Usuario`.

---

## Evento (eventos)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| grupo_id | String (VarChar 36) | Sí |
| creado_por_id | String (VarChar 36) | Sí |
| titulo | String (VarChar 255) | Sí |
| descripcion | String? | No |
| fecha_inicio | DateTime (Timestamp) | Sí |
| fecha_fin | DateTime? (Timestamp) | No |
| google_calendar_event_id | String? | No |
| created_at | DateTime? (Timestamp, default now()) | No |
| updated_at | DateTime? (Timestamp, default now()) | No |

**Notas:** FK a `Grupo` (`onDelete: Cascade`) y `Usuario` (creador).

---

## Producto (productos)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (VarChar 36) | Sí |
| grupo_id | String (VarChar 36) | Sí |
| anadido_por_id | String (VarChar 36) | Sí |
| nombre | String (VarChar 255) | Sí |
| categoria | String (VarChar 20, default "otros") | Sí |
| comprado | Boolean? (default false) | No |
| comprado_por_id | String? (VarChar 36) | No |
| fecha_compra | DateTime? (Timestamp) | No |
| created_at | DateTime? (Timestamp, default now()) | No |

**Notas:** lista de la compra del grupo. FK a `Grupo` (`onDelete: Cascade`), `Usuario` (añadido_por) y `Usuario` opcional (comprado_por). No tiene columnas `cantidad` ni `unidad_medida` (eliminadas del modelo).

---

## Interes (intereses)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | Int (autoincrement) | Sí |
| nombre | String (VarChar 100) | Sí |
| categoria | String (VarChar 100) | Sí |

**Notas:** catálogo global de intereses (no está asociado a `Grupo` ni `Usuario` directamente). Relacionado vía `UsuarioInteres` y `GrupoInteres`.

---

## UsuarioInteres (usuario_intereses)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| usuario_id | String (VarChar 36) | Sí |
| interes_id | Int | Sí |

**Notas:** clave primaria compuesta `(usuario_id, interes_id)`, no tiene columna `id` propia. FK a `Usuario` e `Interes`, ambas `onDelete: Cascade`.

---

## GrupoInteres (grupo_intereses)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| grupo_id | String (VarChar 36) | Sí |
| interes_id | Int | Sí |

**Notas:** clave primaria compuesta `(grupo_id, interes_id)`, no tiene columna `id` propia. FK a `Grupo` e `Interes`, ambas `onDelete: Cascade`.

---

## RefreshToken (refresh_tokens)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| id | String (uuid, default uuid()) | Sí |
| token | String (único) | Sí |
| usuario_id | String | Sí |
| expires_at | DateTime | Sí |
| creado_at | DateTime (default now()) | Sí |

**Notas:** FK a `Usuario` (`onDelete: Cascade`). Usado para la rotación de tokens de refresco de sesión.

---

## Apéndice — Enums definidos en el schema

| Enum | Valores | Mapeo BD |
|------|---------|----------|
| RolGrupo | ADMIN, MEMBER | rol_grupo |
| Ocupacion | ESTUDIO, TRABAJO, ESTUDIO_Y_TRABAJO | ocupacion_enum |
| Horario | MADRUGADOR, INTERMEDIO, NOCTURNO | horario_enum |
| FrecuenciaVisitas | CASI_NUNCA, A_VECES, FRECUENTE | frecuencia_visitas_enum |
| Ambiente | TRANQUILO, EQUILIBRADO, SOCIAL | ambiente_enum |
| FrecuenciaFiestas | NUNCA, OCASIONAL, FRECUENTE | frecuencia_fiestas_enum |
| FrecuenciaSalidas | NUNCA, OCASIONAL, FRECUENTE | frecuencia_salidas_enum |
| AceptaFumadores | SI, NO, INDIFERENTE | acepta_fumadores_enum |
| AceptaMascotas | SI, NO, DEPENDE | acepta_mascotas_enum |
| DiaSemana | LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO | dia_semana_enum |
| EstadoTarea | PENDIENTE, COMPLETADA, VALIDADA, RECHAZADA, CANCELADA | estado_tarea_enum |
| TipoDivision | EQUITATIVA, PERSONALIZADA | tipo_division_enum |
| TipoFactura | AGUA, LUZ, INTERNET, ALQUILER, OTRO | tipo_factura_enum |
| EstadoSolicitud | PENDIENTE, ACEPTADA, RECHAZADA | estado_solicitud_enum |
| EstadoChat | ACTIVO, CERRADO | estado_chat_enum |
| LimpiezaOrden | DESPREOCUPADO, FLEXIBLE, ORDENADO | limpieza_orden_enum |
| NivelRuido | SILENCIO_TOTAL, MODERADO, INDIFERENTE | nivel_ruido_enum |
