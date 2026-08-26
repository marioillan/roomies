-- =================================================================
-- HOUSIE - Datos de prueba: bloqueo de publicacion sin perfil de grupo
--
-- Uso:   psql "$URL" -f seed_test_bloqueo.sql
-- Antes: cargar seed_completo.sql (necesita el catalogo de intereses)
--
-- Crea dos escenarios que NO existen en el seed principal:
--   A) Grupo SIN perfil de convivencia         -> admin: sinperfil@housie.com
--   B) Grupo con perfil PARCIAL (2 dims null)  -> admin: parcial@housie.com
--   C) Grupo con perfil COMPLETO y sin anuncio -> admin: completo@housie.com
--
-- Ninguno de los tres tiene publicacion, asi que los tres van al
-- formulario de creacion. A y B deben ver la pantalla de aviso; C debe
-- ver el formulario de tres pasos (control de que no se bloquea de mas).
--
-- Contrasena de los tres usuarios: housie123
-- Idempotente: puede ejecutarse varias veces.
-- Limpieza al terminar: ver el bloque comentado del final.
-- =================================================================

BEGIN;

-- ===== 1. USUARIOS ADMINISTRADORES ===============================
INSERT INTO usuarios (id, nombre, email, password) VALUES
  ('11110000-0000-4000-8000-000000000001', 'Test Sin Perfil', 'sinperfil@housie.com', crypt('housie123', gen_salt('bf', 10))),
  ('11110000-0000-4000-8000-000000000002', 'Test Parcial',    'parcial@housie.com',   crypt('housie123', gen_salt('bf', 10))),
  ('11110000-0000-4000-8000-000000000003', 'Test Completo',   'completo@housie.com',  crypt('housie123', gen_salt('bf', 10)))
ON CONFLICT (email) DO NOTHING;

-- Perfil de convivencia de usuario COMPLETO en los tres: el bloqueo que
-- probamos es el del grupo, no el del usuario. Si estuviese incompleto,
-- la aplicacion los mandaria a rellenar su propio perfil y no llegariamos
-- al formulario de publicacion.
INSERT INTO perfiles_convivencia_usuario
  (id, usuario_id, pais, genero, fecha_nacimiento, ocupacion, horario,
   frecuencia_visitas, ambiente, tolerancia_fiestas, fumador, tiene_mascotas,
   lgbtq_friendly, limpieza_orden, nivel_ruido, sobre_mi)
VALUES
  ('11111000-0000-4000-8000-000000000001', '11110000-0000-4000-8000-000000000001',
   'España','Otro','1998-01-01','TRABAJO','INTERMEDIO','A_VECES','EQUILIBRADO','OCASIONAL',
   FALSE, FALSE, TRUE, 'FLEXIBLE', 'MODERADO',
   'Cuenta de prueba para verificar el bloqueo de publicacion sin perfil de grupo.'),
  ('11111000-0000-4000-8000-000000000002', '11110000-0000-4000-8000-000000000002',
   'España','Otro','1998-01-01','TRABAJO','INTERMEDIO','A_VECES','EQUILIBRADO','OCASIONAL',
   FALSE, FALSE, TRUE, 'FLEXIBLE', 'MODERADO',
   'Cuenta de prueba para verificar el bloqueo con perfil de grupo parcial.'),
  ('11111000-0000-4000-8000-000000000003', '11110000-0000-4000-8000-000000000003',
   'España','Otro','1998-01-01','TRABAJO','INTERMEDIO','A_VECES','EQUILIBRADO','OCASIONAL',
   FALSE, FALSE, TRUE, 'FLEXIBLE', 'MODERADO',
   'Cuenta de prueba de control: el grupo si tiene el perfil completo.')
ON CONFLICT (usuario_id) DO NOTHING;

-- ===== 2. GRUPOS =================================================
INSERT INTO grupos (id, nombre, codigo_acceso, codigo_casero, descripcion, ciudad,
                    buscar_companero, dia_limpieza, semana_rotacion, rotacion_semana_actual)
VALUES
  ('22220000-0000-4000-8000-000000000001', 'Test — Sin perfil',   'TST001', 'TSC001',
   'Grupo de prueba sin perfil de convivencia.', 'Granada', TRUE, 'LUNES', 0, NULL),
  ('22220000-0000-4000-8000-000000000002', 'Test — Perfil parcial','TST002', 'TSC002',
   'Grupo de prueba con el perfil de convivencia a medias.', 'Granada', TRUE, 'LUNES', 0, NULL),
  ('22220000-0000-4000-8000-000000000003', 'Test — Perfil completo','TST003', 'TSC003',
   'Grupo de prueba de control, con el perfil completo y sin anuncio.', 'Granada', TRUE, 'LUNES', 0, NULL)
ON CONFLICT (id) DO NOTHING;

-- ===== 3. MEMBRESIAS (rol ADMIN: solo el admin puede publicar) ===
INSERT INTO miembros_grupo (id, usuario_id, grupo_id, rol, activo) VALUES
  ('33330000-0000-4000-8000-000000000001', '11110000-0000-4000-8000-000000000001', '22220000-0000-4000-8000-000000000001', 'ADMIN', TRUE),
  ('33330000-0000-4000-8000-000000000002', '11110000-0000-4000-8000-000000000002', '22220000-0000-4000-8000-000000000002', 'ADMIN', TRUE),
  ('33330000-0000-4000-8000-000000000003', '11110000-0000-4000-8000-000000000003', '22220000-0000-4000-8000-000000000003', 'ADMIN', TRUE)
ON CONFLICT (usuario_id, grupo_id) DO NOTHING;

-- ===== 4. PERFILES DE CONVIVENCIA DE GRUPO =======================
-- Grupo A: ninguna fila a proposito.

-- Grupo B: fila creada pero con limpieza_orden y nivel_ruido a NULL.
-- Reproduce el caso de un perfil guardado antes de que esos campos
-- fuesen obligatorios: la fila existe, asi que un simple "existe perfil"
-- lo dejaria pasar; solo lo detecta comprobar dimension a dimension.
INSERT INTO perfiles_convivencia_grupo
  (id, grupo_id, ocupacion, horario, frecuencia_visitas, ambiente, tolerancia_fiestas,
   acepta_fumadores, acepta_mascotas, lgbtq_friendly, limpieza_orden, nivel_ruido)
VALUES
  ('44440000-0000-4000-8000-000000000002', '22220000-0000-4000-8000-000000000002',
   'TRABAJO','INTERMEDIO','A_VECES','EQUILIBRADO','OCASIONAL',
   'NO','DEPENDE', TRUE, NULL, NULL)
ON CONFLICT (grupo_id) DO NOTHING;

-- Grupo C: perfil completo (control).
INSERT INTO perfiles_convivencia_grupo
  (id, grupo_id, ocupacion, horario, frecuencia_visitas, ambiente, tolerancia_fiestas,
   acepta_fumadores, acepta_mascotas, lgbtq_friendly, limpieza_orden, nivel_ruido)
VALUES
  ('44440000-0000-4000-8000-000000000003', '22220000-0000-4000-8000-000000000003',
   'TRABAJO','INTERMEDIO','A_VECES','EQUILIBRADO','OCASIONAL',
   'NO','DEPENDE', TRUE, 'FLEXIBLE', 'MODERADO')
ON CONFLICT (grupo_id) DO NOTHING;

COMMIT;

-- =================================================================
-- LIMPIEZA (ejecutar cuando termines de probar)
-- Los grupos van con DELETE CASCADE, asi que se llevan membresias,
-- perfiles y cualquier publicacion que hayas creado durante la prueba.
-- Los usuarios se borran despues, ya sin membresias que los aten.
-- =================================================================
-- DELETE FROM grupos   WHERE id    LIKE '22220000-%';
-- DELETE FROM usuarios WHERE email IN ('sinperfil@housie.com','parcial@housie.com','completo@housie.com');
