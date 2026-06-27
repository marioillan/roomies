# Plan — Últimas 2 semanas (19–31 mayo)

## Estado actual

### ✅ Completado
- Auth completa: JWT httpOnly, Google OAuth, modales registro/login
- Perfil usuario: datos, foto Cloudinary, perfil de convivencia
- Grupos: crear, acceder con código, dashboard, editar, foto
- Publicación: formulario 4 pasos, vista lectura, edición admin
- Buscador: aside de filtros, ordenar, cards con carrusel de fotos
- Favoritos: página, toggle corazón, API completa
- Chat: solicitudes contacto, aceptar/rechazar, mensajes con polling

---

## Semana 1 — 19–25 mayo (funcionalidad)

### Prioridad alta

#### Matching de compatibilidad
El diferenciador del TFG. Sin esto el proyecto es un buscador normal.

**Backend:**
- `GET /api/publicaciones/compatibles` — igual que el buscador pero ordena por score
- Algoritmo: comparar `perfiles_convivencia_usuario` del solicitante con `perfiles_convivencia_grupo` del anuncio
- Campos a comparar: horario, ambiente, acepta_fumadores/fumador, acepta_mascotas/tiene_mascotas, tolerancia_fiestas, frecuencia_visitas
- Score 0–100 (cada campo que coincide suma puntos)

**Frontend:**
- En `BuscarPage`: botón/toggle "Ordenar por compatibilidad" (solo si hay sesión y perfil de convivencia relleno)
- Badge de porcentaje en la card: "85% compatible" en verde
- Si no tiene perfil de convivencia: banner que invita a rellenarlo

#### Bugs conocidos
- Tab activo en `LayoutPerfil` usa `===` en lugar de `startsWith` → arreglar
- URL backend hardcodeada `http://localhost:3000` en todos los fetch → mover a `VITE_API_URL` en `.env` del frontend

### Prioridad media

#### Tareas del hogar (`/grupo/tareas`)
Suficiente con una versión básica para la defensa.
- Listar tareas del grupo (nombre, responsable, estado)
- Crear tarea (nombre, asignar a miembro)
- Marcar como completada

#### Gastos compartidos (`/grupo/gastos`)
- Listar facturas del grupo con importe y tipo
- Crear factura (tipo, importe, división equitativa)
- Ver quién ha pagado y quién debe

---

## Semana 2 — 26–31 mayo (pulido y despliegue)

### Prioridad alta

#### Lista de la compra (`/grupo/compra`)
La más sencilla de las tres secciones pendientes.
- Añadir producto (nombre, cantidad)
- Marcar como comprado
- Limpiar comprados

#### Despliegue
Para la defensa conviene tener una URL pública o al menos todo documentado.

**Opción recomendada (gratuita):**
- **Backend:** Railway o Render (Node + PostgreSQL incluido)
- **Frontend:** Vercel (Vite/React, despliegue automático desde GitHub)
- **Imágenes:** Cloudinary ya está configurado ✓

**Pasos:**
1. Subir todo a un repositorio GitHub (si no está)
2. Crear proyecto en Railway → añadir servicio PostgreSQL → importar variables de entorno del `.env`
3. Ejecutar el `database.sql` en la BD de producción
4. Desplegar el frontend en Vercel → configurar `VITE_API_URL` y `VITE_GOOGLE_PLACES_KEY`
5. Actualizar `FRONTEND_URL`, `GOOGLE_REDIRECT_URI` y `CORS` en el backend con las URLs de producción

#### Variables de entorno — cambios necesarios para producción

**Backend:**
```
DATABASE_URL=       # URL de Railway/Render
JWT_SECRET=         # string aleatorio largo
FRONTEND_URL=       # URL de Vercel (ej. https://housie.vercel.app)
GOOGLE_REDIRECT_URI=# https://<backend>/api/auth/google/callback
```

**Frontend:**
```
VITE_API_URL=       # URL del backend (ej. https://housie-api.railway.app)
VITE_GOOGLE_PLACES_KEY=
```

### Prioridad baja (si sobra tiempo)

- Middleware auth centralizado (quitar verificación manual en cada ruta)
- Paginación en la lista de mensajes del chat
- Página de detalle del anuncio `/anuncio/:id`
- Notificación en el header cuando hay solicitudes pendientes (badge rojo)

---

## Flujo de demo para la defensa

1. Registro de dos usuarios (solicitante + futuro compañero)
2. Usuario A crea grupo → publica habitación con fotos
3. Usuario B rellena perfil de convivencia → busca en la ciudad → ve badge de compatibilidad
4. Usuario B guarda en favoritos → pulsa Contactar → solicitud enviada
5. Usuario A (admin) ve solicitud en `/grupo/mensajes` → acepta → chat abierto
6. Intercambio de mensajes en tiempo real (polling)
7. Vista del dashboard del grupo: tareas, gastos, lista de la compra

---

## Resumen de archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `frontend/.env` | Añadir `VITE_API_URL`, reemplazar `http://localhost:3000` |
| `frontend/src/pages/BuscarPage.jsx` | Badge compatibilidad + ordenar por score |
| `backend/routes/publicaciones.js` | Endpoint `/compatibles` con scoring |
| `frontend/src/pages/LayoutPerfil.jsx` | Fix bug tab activo (`startsWith`) |
| `frontend/src/pages/GrupoDashboard.jsx` | Enlazar secciones tareas/gastos/compra |
| `backend/routes/tareas.js` | Nuevo — CRUD básico de tareas |
| `backend/routes/gastos.js` | Nuevo — CRUD básico de facturas |
| `frontend/src/pages/tareas.jsx` | Nueva — lista + crear + completar |
| `frontend/src/pages/gastos.jsx` | Nueva — lista facturas + crear |
| `frontend/src/pages/listacompra.jsx` | Nueva — productos + marcar comprado |
