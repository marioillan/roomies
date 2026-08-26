-- =================================================================
-- HOUSIE - Carga completa de datos de demostracion
--
-- Uso:   psql "$URL" -f seed_completo.sql
-- Antes: npx prisma migrate deploy  (el esquema debe existir)
--
-- Contiene, en una sola transaccion:
--   1. Catalogo de intereses (46 filas, necesario para el matching)
--   2. Datos de demostracion (23 usuarios, 15 grupos, 15 publicaciones)
--   3. Fechas desplazadas al dia de ejecucion
--   4. Coordenadas de las publicaciones para el mapa
--
-- Idempotente: puede ejecutarse varias veces sin duplicar nada.
-- Contrasena de todos los usuarios: housie123
-- =================================================================

BEGIN;

-- ===== 1. CATALOGO DE INTERESES ==================================
INSERT INTO intereses (nombre, categoria)
SELECT v.nombre, v.categoria
FROM (VALUES
    ('Gimnasio', 'Deporte y actividad física'),
    ('Yoga', 'Deporte y actividad física'),
    ('Crossfit', 'Deporte y actividad física'),
    ('Senderismo', 'Deporte y actividad física'),
    ('Dar paseos', 'Deporte y actividad física'),
    ('Ciclismo', 'Deporte y actividad física'),
    ('Running', 'Deporte y actividad física'),
    ('Escalada', 'Deporte y actividad física'),
    ('Natación', 'Deporte y actividad física'),
    ('Fútbol', 'Deporte y actividad física'),
    ('Baloncesto', 'Deporte y actividad física'),
    ('Padel', 'Deporte y actividad física'),
    ('Artes marciales', 'Deporte y actividad física'),
    ('Surf', 'Deporte y actividad física'),
    ('Esquí', 'Deporte y actividad física'),
    ('Vegano', 'Alimentación'),
    ('Vegetariano', 'Alimentación'),
    ('Café de especialidad', 'Alimentación'),
    ('Cocina en casa', 'Alimentación'),
    ('Repostería', 'Alimentación'),
    ('Comida internacional', 'Alimentación'),
    ('Streetfood', 'Alimentación'),
    ('Lectura', 'Cultura y ocio'),
    ('Cine', 'Cultura y ocio'),
    ('Series', 'Cultura y ocio'),
    ('Teatro', 'Cultura y ocio'),
    ('Música en directo', 'Cultura y ocio'),
    ('Museos', 'Cultura y ocio'),
    ('Fotografía', 'Cultura y ocio'),
    ('Videojuegos', 'Cultura y ocio'),
    ('Podcasts', 'Cultura y ocio'),
    ('Arte', 'Cultura y ocio'),
    ('Salir de noche', 'Vida social'),
    ('Bares y copas', 'Vida social'),
    ('Viajes', 'Vida social'),
    ('Festivales', 'Vida social'),
    ('Voluntariado', 'Vida social'),
    ('Networking', 'Vida social'),
    ('Salir de tiendas', 'Vida social'),
    ('Miradores', 'Vida social'),
    ('Cafeterías', 'Vida social'),
    ('Meditación', 'Bienestar'),
    ('Pilates', 'Bienestar'),
    ('Vida sostenible', 'Bienestar'),
    ('Mindfulness', 'Bienestar'),
    ('Bienestar mental', 'Bienestar')
) AS v(nombre, categoria)
WHERE NOT EXISTS (SELECT 1 FROM intereses i WHERE i.nombre = v.nombre);

-- ===== 2. DATOS DE DEMOSTRACION ==================================
-- =================================================================
-- HOUSIE — Datos de demostración
-- Contraseña para TODOS los usuarios nuevos: housie123
-- =================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =================================================================
-- USUARIOS
-- =================================================================

INSERT INTO usuarios (id, nombre, email, password) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5', 'María García',    'maria@housie.com',   crypt('housie123', gen_salt('bf', 10))),
  ('b2c3d4e5-f6a7-4b8c-9d0e-f1a2b3c4d5e6', 'Carlos López',    'carlos@housie.com',  crypt('housie123', gen_salt('bf', 10))),
  ('c3d4e5f6-a7b8-4c9d-0e1f-a2b3c4d5e6f7', 'Ana Martínez',    'ana@housie.com',     crypt('housie123', gen_salt('bf', 10))),
  ('d4e5f6a7-b8c9-4d0e-1f2a-b3c4d5e6f7a8', 'David Ruiz',      'david@housie.com',   crypt('housie123', gen_salt('bf', 10))),
  ('e5f6a7b8-c9d0-4e1f-2a3b-c4d5e6f7a8b9', 'Laura Sánchez',   'laura@housie.com',   crypt('housie123', gen_salt('bf', 10))),
  ('f6a7b8c9-d0e1-4f2a-3b4c-d5e6f7a8b9c0', 'Javier Torres',   'javier@housie.com',  crypt('housie123', gen_salt('bf', 10))),
  ('a7b8c9d0-e1f2-4a3b-4c5d-e6f7a8b9c0d1', 'Sofía Chen',      'sofia@housie.com',   crypt('housie123', gen_salt('bf', 10))),
  ('b8c9d0e1-f2a3-4b4c-5d6e-f7a8b9c0d1e2', 'Pablo Fernández', 'pablo@housie.com',   crypt('housie123', gen_salt('bf', 10))),
  ('c9d0e1f2-a3b4-4c5d-6e7f-a8b9c0d1e2f3', 'Isabel Mora',     'isabel@housie.com',  crypt('housie123', gen_salt('bf', 10))),
  ('d0e1f2a3-b4c5-4d6e-7f8a-b9c0d1e2f3a4', 'Roberto Casas',   'roberto@housie.com', crypt('housie123', gen_salt('bf', 10))),
  ('e1f2a3b4-c5d6-4e7f-8a9b-c0d1e2f3a4b5', 'Elena Prop',      'elena@housie.com',   crypt('housie123', gen_salt('bf', 10)))
ON CONFLICT (email) DO NOTHING;

-- =================================================================
-- GRUPOS
-- =================================================================

INSERT INTO grupos (id, nombre, codigo_acceso, codigo_casero, descripcion, ciudad,
                   buscar_companero, dia_limpieza, semana_rotacion, rotacion_semana_actual)
VALUES
  ('11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5',
   'Piso Granada Sol', 'GRA001', 'GRC001',
   'Somos tres estudiantes de la UGR que buscamos un cuarto compañero para el curso 26/27. Piso céntrico, tranquilo y muy bien comunicado.',
   'Granada', TRUE, 'SABADO', 2, '2026-06-08'),

  ('22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6',
   'Loft Madrid Centro', 'MAD002', 'MDC002',
   'Dos profesionales con trabajo estable buscamos un tercer compañero para compartir un loft reformado en Malasaña.',
   'Madrid', TRUE, 'LUNES', 1, '2026-06-08'),

  ('33c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7',
   'Flat Barcelona Gràcia', 'BCN003', 'BCC003',
   'Buscamos una persona organizada y tranquila para compartir un piso luminoso en el barrio de Gràcia.',
   'Barcelona', TRUE, 'MIERCOLES', 0, '2026-06-08')
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- MIEMBROS_GRUPO
-- =================================================================

INSERT INTO miembros_grupo (id, usuario_id, grupo_id, rol) VALUES
  ('m1a2b3c4-d5e6-4f7a-8b9c-000000000001', (SELECT id FROM usuarios WHERE email='maria@housie.com'),   '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', 'ADMIN'),
  ('m1a2b3c4-d5e6-4f7a-8b9c-000000000002', (SELECT id FROM usuarios WHERE email='carlos@housie.com'),  '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', 'MIEMBRO'),
  ('m1a2b3c4-d5e6-4f7a-8b9c-000000000003', (SELECT id FROM usuarios WHERE email='ana@housie.com'),     '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', 'MIEMBRO'),
  ('m1a2b3c4-d5e6-4f7a-8b9c-000000000004', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', 'CASERO'),
  ('m2b3c4d5-e6f7-4a8b-9c0d-000000000005', (SELECT id FROM usuarios WHERE email='david@housie.com'),   '22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6', 'ADMIN'),
  ('m2b3c4d5-e6f7-4a8b-9c0d-000000000006', (SELECT id FROM usuarios WHERE email='laura@housie.com'),   '22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6', 'MIEMBRO'),
  ('m2b3c4d5-e6f7-4a8b-9c0d-000000000007', (SELECT id FROM usuarios WHERE email='elena@housie.com'),   '22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6', 'CASERO'),
  ('m3c4d5e6-f7a8-4b9c-0d1e-000000000008', (SELECT id FROM usuarios WHERE email='javier@housie.com'),  '33c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7', 'ADMIN'),
  ('m3c4d5e6-f7a8-4b9c-0d1e-000000000009', (SELECT id FROM usuarios WHERE email='sofia@housie.com'),   '33c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7', 'MIEMBRO')
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- PERFILES CONVIVENCIA USUARIOS
-- =================================================================

INSERT INTO perfiles_convivencia_usuario
  (id, usuario_id, pais, genero, fecha_nacimiento, ocupacion, horario, frecuencia_visitas,
   ambiente, tolerancia_fiestas, fumador, acepta_fumadores,
   tiene_mascotas, acepta_mascotas, lgbtq_friendly, limpieza_orden, nivel_ruido, sobre_mi)
VALUES
  ('pc000001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='maria@housie.com'),
   'España','Mujer','2002-03-15','ESTUDIO','INTERMEDIO','A_VECES','EQUILIBRADO','OCASIONAL',
   FALSE,'NO',FALSE,'DEPENDE',TRUE,'ORDENADO','MODERADO',
   'Soy estudiante de Arquitectura en la UGR. Soy ordenada y me gusta mantener el piso limpio. Busco compañeros responsables y tranquilos.'),
  ('pc000001-0000-4000-8000-000000000002', (SELECT id FROM usuarios WHERE email='carlos@housie.com'),
   'España','Hombre','2001-07-22','ESTUDIO','MADRUGADOR','CASI_NUNCA','TRANQUILO','NUNCA',
   FALSE,'INDIFERENTE',FALSE,'SI',TRUE,'FLEXIBLE','SILENCIO_TOTAL',
   'Estudio Informática. Soy tranquilo y respeto el espacio de los demás. Me gusta cocinar y suelo hacer cenas para el piso los fines de semana.'),
  ('pc000001-0000-4000-8000-000000000003', (SELECT id FROM usuarios WHERE email='ana@housie.com'),
   'España','Mujer','2002-11-08','ESTUDIO','INTERMEDIO','A_VECES','SOCIAL','OCASIONAL',
   FALSE,'NO',FALSE,'NO',TRUE,'FLEXIBLE','ALTO',
   'Estudiante de Medicina. Sé separar el tiempo de estudio del ocio. Salgo a correr casi cada mañana.'),
  ('pc000001-0000-4000-8000-000000000004', (SELECT id FROM usuarios WHERE email='david@housie.com'),
   'España','Hombre','1995-04-30','TRABAJO','MADRUGADOR','CASI_NUNCA','TRANQUILO','NUNCA',
   FALSE,'NO',FALSE,'NO',TRUE,'ORDENADO','SILENCIO_TOTAL',
   'Trabajo en una consultora tecnológica. Soy muy ordenado y puntual con los pagos.'),
  ('pc000001-0000-4000-8000-000000000005', (SELECT id FROM usuarios WHERE email='laura@housie.com'),
   'España','Mujer','1997-09-12','TRABAJO','INTERMEDIO','A_VECES','EQUILIBRADO','OCASIONAL',
   FALSE,'INDIFERENTE',FALSE,'DEPENDE',TRUE,'FLEXIBLE','SILENCIO_TOTAL',
   'Diseñadora gráfica freelance. Valoro un ambiente tranquilo durante el día.'),
  ('pc000001-0000-4000-8000-000000000006', (SELECT id FROM usuarios WHERE email='javier@housie.com'),
   'España','Hombre','1999-02-18','ESTUDIO_Y_TRABAJO','INTERMEDIO','A_VECES','EQUILIBRADO','OCASIONAL',
   FALSE,'INDIFERENTE',FALSE,'DEPENDE',TRUE,'FLEXIBLE','MODERADO',
   'Máster de Marketing digital mientras trabajo media jornada. Me gusta el cine y explorar Gràcia.'),
  ('pc000001-0000-4000-8000-000000000007', (SELECT id FROM usuarios WHERE email='sofia@housie.com'),
   'China','Mujer','2000-06-25','ESTUDIO','MADRUGADOR','CASI_NUNCA','TRANQUILO','NUNCA',
   FALSE,'NO',FALSE,'NO',TRUE,'ORDENADO','SILENCIO_TOTAL',
   'Intercambio en la UB, estudio Económicas. Muy limpia y ordenada. Me gusta cocinar comida asiática.'),
  ('pc000001-0000-4000-8000-000000000008', (SELECT id FROM usuarios WHERE email='pablo@housie.com'),
   'España','Hombre','2001-12-03','ESTUDIO','INTERMEDIO','A_VECES','EQUILIBRADO','OCASIONAL',
   FALSE,'INDIFERENTE',FALSE,'DEPENDE',TRUE,'FLEXIBLE','ALTO',
   'Estudiante de Derecho que empieza en Granada en septiembre. Soy sociable y nunca me he retrasado en los pagos.'),
  ('pc000001-0000-4000-8000-000000000009', (SELECT id FROM usuarios WHERE email='isabel@housie.com'),
   'España','Mujer','2000-08-19','ESTUDIO','NOCTURNO','A_VECES','SOCIAL','FRECUENTE',
   FALSE,'INDIFERENTE',FALSE,'SI',TRUE,'DESPREOCUPADO','ALTO',
   'Estudiante de Bellas Artes con horarios atípicos. Me encantan el arte, la música y la cultura.'),
  ('pc000001-0000-4000-8000-000000000010', (SELECT id FROM usuarios WHERE email='roberto@housie.com'),
   'España','Hombre','1972-06-10','TRABAJO','MADRUGADOR','CASI_NUNCA','TRANQUILO','NUNCA',
   FALSE,'NO',FALSE,'NO',FALSE,'ORDENADO','SILENCIO_TOTAL',
   'Propietario de varios pisos en Granada. Llevo más de 20 años en el sector inmobiliario.'),
  ('pc000001-0000-4000-8000-000000000011', (SELECT id FROM usuarios WHERE email='elena@housie.com'),
   'España','Mujer','1975-09-23','TRABAJO','MADRUGADOR','CASI_NUNCA','TRANQUILO','NUNCA',
   FALSE,'NO',FALSE,'NO',FALSE,'ORDENADO','SILENCIO_TOTAL',
   'Propietaria y gestora de inmuebles en Madrid. Busco inquilinos responsables y comprometidos.')
ON CONFLICT (usuario_id) DO NOTHING;

-- =================================================================
-- PERFILES CONVIVENCIA GRUPOS
-- =================================================================

INSERT INTO perfiles_convivencia_grupo
  (id, grupo_id, ocupacion, horario, frecuencia_visitas, ambiente, tolerancia_fiestas,
   acepta_fumadores, acepta_mascotas, lgbtq_friendly, limpieza_orden, nivel_ruido)
VALUES
  ('pg000001-0000-4000-8000-000000000001', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', 'ESTUDIO',          'INTERMEDIO', 'A_VECES',    'EQUILIBRADO', 'OCASIONAL',  'NO',          'DEPENDE', TRUE, 'ORDENADO',  'MODERADO'),
  ('pg000001-0000-4000-8000-000000000002', '22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6', 'TRABAJO',           'MADRUGADOR', 'CASI_NUNCA', 'TRANQUILO',   'NUNCA',      'NO',          'NO',      TRUE, 'ORDENADO',  'SILENCIO_TOTAL'),
  ('pg000001-0000-4000-8000-000000000003', '33c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7', 'ESTUDIO_Y_TRABAJO', 'INTERMEDIO', 'A_VECES',    'EQUILIBRADO', 'OCASIONAL',  'INDIFERENTE', 'DEPENDE', TRUE, 'FLEXIBLE',  'MODERADO')
ON CONFLICT (grupo_id) DO NOTHING;

-- =================================================================
-- PUBLICACIONES
-- =================================================================

INSERT INTO publicaciones
  (id, grupo_id, titulo, descripcion, ciudad, direccion, precio, habitaciones_libres,
   tipo_piso, habitaciones_totales, tamano_piso, planta, ascensor,
   wifi, lavadora, aire_acondicionado, calefaccion, amueblado, parking, terraza,
   permite_fumar, permite_mascotas, genero_preferido,
   normas_adicionales, telefono_contacto, modo_contacto, visible)
VALUES
  ('44d5e6f7-a8b9-4c0d-1e2f-a3b4c5d6e7f8',
   '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5',
   'Habitación en piso universitario - Granada Sol',
   'Piso luminoso y reformado a 5 minutos de la Facultad de Ciencias y de Medicina. Somos tres estudiantes tranquilos que buscamos un cuarto compañero. Doble ventana en todas las habitaciones. Incluye gastos de comunidad.',
   'Granada','Calle Recogidas, 14',350.00,1,'PISO',4,90.00,3,FALSE,
   TRUE,TRUE,FALSE,TRUE,TRUE,FALSE,FALSE,FALSE,FALSE,'INDIFERENTE',
   'No se puede fumar en el interior. Rotación de limpieza semanal.','958123456','CHAT',TRUE),

  ('55e6f7a8-b9c0-4d1e-2f3a-b4c5d6e7f8a9',
   '22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6',
   'Habitación en loft reformado - Malasaña',
   'Loft completamente reformado en el corazón de Malasaña. Techos altos, mucha luz natural y diseño industrial. Somos dos profesionales con trabajo estable. Habitación de 12m² con armario empotrado. Metro a 3 minutos.',
   'Madrid','Calle Fuencarral, 89',650.00,1,'ESTUDIO',3,110.00,4,TRUE,
   TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,FALSE,FALSE,FALSE,'INDIFERENTE',
   'Perfil profesional preferiblemente. Sin fiestas. Puntualidad con los pagos.','912345678','CHAT',TRUE),

  ('66f7a8b9-c0d1-4e2f-3a4b-c5d6e7f8a9b0',
   '33c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7',
   'Habitación en piso Gràcia - Barcelona',
   'Piso moderno y luminoso en el barrio de Gràcia. Habitación de 10m², armario y ventana al patio. Terraza comunitaria con vistas. Metro Fontana a 5 min.',
   'Barcelona','Carrer Gran de Gràcia, 45',520.00,1,'PISO',3,80.00,2,FALSE,
   TRUE,TRUE,FALSE,FALSE,TRUE,FALSE,TRUE,FALSE,TRUE,'INDIFERENTE',
   'Ambiente tranquilo entre semana. Mascotas pequeñas previo acuerdo.',NULL,'CHAT',TRUE)
ON CONFLICT (grupo_id) DO NOTHING;

-- =================================================================
-- FOTOS
-- =================================================================

INSERT INTO fotos_publicacion (id, publicacion_id, url, orden) VALUES
  -- Granada Sol (habitacion1, cocina1, baño1)
  ('cl000001-0000-4000-8000-000000000001','44d5e6f7-a8b9-4c0d-1e2f-a3b4c5d6e7f8','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130043/habitacion1_gvz5pv.jpg',0),
  ('cl000001-0000-4000-8000-000000000002','44d5e6f7-a8b9-4c0d-1e2f-a3b4c5d6e7f8','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130042/cocina1_eogf7e.jpg',1),
  ('cl000001-0000-4000-8000-000000000003','44d5e6f7-a8b9-4c0d-1e2f-a3b4c5d6e7f8','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130038/ba%C3%B1o1_gomfyu.jpg',2),
  -- Malasaña Madrid (salon1, habitacion2, cocina2)
  ('cl000001-0000-4000-8000-000000000004','55e6f7a8-b9c0-4d1e-2f3a-b4c5d6e7f8a9','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130048/salon1_cos9xd.jpg',0),
  ('cl000001-0000-4000-8000-000000000005','55e6f7a8-b9c0-4d1e-2f3a-b4c5d6e7f8a9','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130043/habitacion2_c2x0zm.jpg',1),
  ('cl000001-0000-4000-8000-000000000006','55e6f7a8-b9c0-4d1e-2f3a-b4c5d6e7f8a9','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130042/cocina2_l0ynzl.jpg',2),
  -- Gràcia Barcelona (baño2, habitacion3, salon2)
  ('cl000001-0000-4000-8000-000000000007','66f7a8b9-c0d1-4e2f-3a4b-c5d6e7f8a9b0','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130038/ba%C3%B1o2_oxdo2n.jpg',0),
  ('cl000001-0000-4000-8000-000000000008','66f7a8b9-c0d1-4e2f-3a4b-c5d6e7f8a9b0','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130044/habitacion3_clztfk.jpg',1),
  ('cl000001-0000-4000-8000-000000000009','66f7a8b9-c0d1-4e2f-3a4b-c5d6e7f8a9b0','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130049/salon2_xgsefd.jpg',2)
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- INTERESES
-- Se referencian por nombre (no por id) porque los ids de la tabla
-- intereses son SERIAL y su orden ha cambiado con el catálogo.
-- =================================================================

INSERT INTO grupo_intereses (grupo_id, interes_id) VALUES
  ('11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM intereses WHERE nombre='Running')),
  ('11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM intereses WHERE nombre='Cocina en casa')),
  ('11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM intereses WHERE nombre='Cine')),
  ('11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM intereses WHERE nombre='Viajes')),
  ('11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM intereses WHERE nombre='Festivales')),
  ('22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6', (SELECT id FROM intereses WHERE nombre='Gimnasio')),
  ('22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6', (SELECT id FROM intereses WHERE nombre='Running')),
  ('22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6', (SELECT id FROM intereses WHERE nombre='Videojuegos')),
  ('22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6', (SELECT id FROM intereses WHERE nombre='Networking')),
  ('33c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7', (SELECT id FROM intereses WHERE nombre='Cine')),
  ('33c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7', (SELECT id FROM intereses WHERE nombre='Música en directo')),
  ('33c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7', (SELECT id FROM intereses WHERE nombre='Viajes')),
  ('33c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7', (SELECT id FROM intereses WHERE nombre='Festivales'))
ON CONFLICT DO NOTHING;

-- =================================================================
-- TAREAS (grupo Granada)
-- =================================================================

INSERT INTO tareas (id, grupo_id, nombre, descripcion, es_recurrente) VALUES
  ('ta100001-0000-4000-8000-000000000001', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', 'Cocina',  'Fregar, encimera, microondas y suelo', TRUE),
  ('ta100001-0000-4000-8000-000000000002', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', 'Baño',    'WC, ducha, lavabo y suelo',            TRUE),
  ('ta100001-0000-4000-8000-000000000003', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', 'Salón',   'Polvo, aspirar y fregar suelo',        TRUE),
  ('ta100001-0000-4000-8000-000000000004', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', 'Pasillo', 'Barrer y fregar suelo, espejos',       TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO asignaciones_tarea (id, tarea_id, usuario_id, semana, estado) VALUES
  ('at100001-0000-4000-8000-000000000001', 'ta100001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='ana@housie.com'),    '2026-06-08', 'PENDIENTE'),
  ('at100001-0000-4000-8000-000000000002', 'ta100001-0000-4000-8000-000000000002', (SELECT id FROM usuarios WHERE email='maria@housie.com'),  '2026-06-08', 'COMPLETADA'),
  ('at100001-0000-4000-8000-000000000003', 'ta100001-0000-4000-8000-000000000003', (SELECT id FROM usuarios WHERE email='carlos@housie.com'), '2026-06-08', 'PENDIENTE'),
  ('at100001-0000-4000-8000-000000000004', 'ta100001-0000-4000-8000-000000000004', (SELECT id FROM usuarios WHERE email='ana@housie.com'),    '2026-06-08', 'PENDIENTE')
ON CONFLICT (id) DO NOTHING;  -- clave primaria: estable aunque cambie la semana

-- =================================================================
-- FACTURAS GRANADA — 6 meses (alquiler 1200€ ÷ 3 = 400€/persona)
-- =================================================================

INSERT INTO facturas (id, grupo_id, casero_id, tipo, descripcion, importe_total, fecha_emision, fecha_vencimiento) VALUES
  ('fa100001-0000-4000-8000-000000000001', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'ALQUILER', 'Alquiler enero 2026',   1200.00, '2026-01-01', '2026-01-05'),
  ('fa100001-0000-4000-8000-000000000002', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'ALQUILER', 'Alquiler febrero 2026', 1200.00, '2026-02-01', '2026-02-05'),
  ('fa100001-0000-4000-8000-000000000003', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'ALQUILER', 'Alquiler marzo 2026',   1200.00, '2026-03-01', '2026-03-05'),
  ('fa100001-0000-4000-8000-000000000004', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'ALQUILER', 'Alquiler abril 2026',   1200.00, '2026-04-01', '2026-04-05'),
  ('fa100001-0000-4000-8000-000000000005', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'ALQUILER', 'Alquiler mayo 2026',    1200.00, '2026-05-01', '2026-05-05'),
  ('fa100001-0000-4000-8000-000000000006', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'ALQUILER', 'Alquiler junio 2026',   1200.00, '2026-06-01', '2026-06-05'),
  ('fa100001-0000-4000-8000-000000000007', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'LUZ',      'Electricidad ene-feb',    96.00, '2026-02-10', '2026-02-20'),
  ('fa100001-0000-4000-8000-000000000008', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'LUZ',      'Electricidad mar-abr',    84.00, '2026-04-10', '2026-04-20'),
  ('fa100001-0000-4000-8000-000000000009', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'LUZ',      'Electricidad may-jun',    90.00, '2026-06-10', '2026-06-20'),
  ('fa100001-0000-4000-8000-000000000010', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'AGUA',     'Agua 1er trimestre',      75.00, '2026-03-15', '2026-03-25'),
  ('fa100001-0000-4000-8000-000000000011', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'AGUA',     'Agua 2º trimestre',       72.00, '2026-06-15', '2026-06-25'),
  ('fa100001-0000-4000-8000-000000000012', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'INTERNET', 'Fibra óptica may 2026',   45.00, '2026-05-01', '2026-05-10'),
  ('fa100001-0000-4000-8000-000000000013', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='roberto@housie.com'), 'INTERNET', 'Fibra óptica jun 2026',   45.00, '2026-06-01', '2026-06-10')
ON CONFLICT (id) DO NOTHING;

-- Pagos PAGADOS
INSERT INTO pagos_factura (id, factura_id, usuario_id, importe_asignado, pagado, fecha_pago) VALUES
  ('pf100001-0000-4000-8000-000000000001', 'fa100001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='maria@housie.com'),  400.00, TRUE, '2026-01-03 10:00:00'),
  ('pf100001-0000-4000-8000-000000000002', 'fa100001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='carlos@housie.com'), 400.00, TRUE, '2026-01-04 11:00:00'),
  ('pf100001-0000-4000-8000-000000000003', 'fa100001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='ana@housie.com'),    400.00, TRUE, '2026-01-03 09:00:00'),
  ('pf100001-0000-4000-8000-000000000004', 'fa100001-0000-4000-8000-000000000002', (SELECT id FROM usuarios WHERE email='maria@housie.com'),  400.00, TRUE, '2026-02-03 10:00:00'),
  ('pf100001-0000-4000-8000-000000000005', 'fa100001-0000-4000-8000-000000000002', (SELECT id FROM usuarios WHERE email='carlos@housie.com'), 400.00, TRUE, '2026-02-04 12:00:00'),
  ('pf100001-0000-4000-8000-000000000006', 'fa100001-0000-4000-8000-000000000002', (SELECT id FROM usuarios WHERE email='ana@housie.com'),    400.00, TRUE, '2026-02-02 09:00:00'),
  ('pf100001-0000-4000-8000-000000000007', 'fa100001-0000-4000-8000-000000000003', (SELECT id FROM usuarios WHERE email='maria@housie.com'),  400.00, TRUE, '2026-03-03 10:00:00'),
  ('pf100001-0000-4000-8000-000000000008', 'fa100001-0000-4000-8000-000000000003', (SELECT id FROM usuarios WHERE email='carlos@housie.com'), 400.00, TRUE, '2026-03-05 17:00:00'),
  ('pf100001-0000-4000-8000-000000000009', 'fa100001-0000-4000-8000-000000000003', (SELECT id FROM usuarios WHERE email='ana@housie.com'),    400.00, TRUE, '2026-03-04 11:00:00'),
  ('pf100001-0000-4000-8000-000000000010', 'fa100001-0000-4000-8000-000000000004', (SELECT id FROM usuarios WHERE email='maria@housie.com'),  400.00, TRUE, '2026-04-02 10:00:00'),
  ('pf100001-0000-4000-8000-000000000011', 'fa100001-0000-4000-8000-000000000004', (SELECT id FROM usuarios WHERE email='carlos@housie.com'), 400.00, TRUE, '2026-04-03 14:00:00'),
  ('pf100001-0000-4000-8000-000000000012', 'fa100001-0000-4000-8000-000000000004', (SELECT id FROM usuarios WHERE email='ana@housie.com'),    400.00, TRUE, '2026-04-04 09:00:00'),
  ('pf100001-0000-4000-8000-000000000013', 'fa100001-0000-4000-8000-000000000005', (SELECT id FROM usuarios WHERE email='maria@housie.com'),  400.00, TRUE, '2026-05-02 10:00:00'),
  ('pf100001-0000-4000-8000-000000000014', 'fa100001-0000-4000-8000-000000000005', (SELECT id FROM usuarios WHERE email='carlos@housie.com'), 400.00, TRUE, '2026-05-03 11:00:00'),
  ('pf100001-0000-4000-8000-000000000015', 'fa100001-0000-4000-8000-000000000005', (SELECT id FROM usuarios WHERE email='ana@housie.com'),    400.00, TRUE, '2026-05-04 16:00:00'),
  ('pf100001-0000-4000-8000-000000000016', 'fa100001-0000-4000-8000-000000000007', (SELECT id FROM usuarios WHERE email='maria@housie.com'),   32.00, TRUE, '2026-02-12 10:00:00'),
  ('pf100001-0000-4000-8000-000000000017', 'fa100001-0000-4000-8000-000000000007', (SELECT id FROM usuarios WHERE email='carlos@housie.com'),  32.00, TRUE, '2026-02-14 11:00:00'),
  ('pf100001-0000-4000-8000-000000000018', 'fa100001-0000-4000-8000-000000000007', (SELECT id FROM usuarios WHERE email='ana@housie.com'),     32.00, TRUE, '2026-02-13 09:00:00'),
  ('pf100001-0000-4000-8000-000000000019', 'fa100001-0000-4000-8000-000000000008', (SELECT id FROM usuarios WHERE email='maria@housie.com'),   28.00, TRUE, '2026-04-12 10:00:00'),
  ('pf100001-0000-4000-8000-000000000020', 'fa100001-0000-4000-8000-000000000008', (SELECT id FROM usuarios WHERE email='carlos@housie.com'),  28.00, TRUE, '2026-04-15 11:00:00'),
  ('pf100001-0000-4000-8000-000000000021', 'fa100001-0000-4000-8000-000000000008', (SELECT id FROM usuarios WHERE email='ana@housie.com'),     28.00, TRUE, '2026-04-13 09:00:00'),
  ('pf100001-0000-4000-8000-000000000022', 'fa100001-0000-4000-8000-000000000010', (SELECT id FROM usuarios WHERE email='maria@housie.com'),   25.00, TRUE, '2026-03-17 10:00:00'),
  ('pf100001-0000-4000-8000-000000000023', 'fa100001-0000-4000-8000-000000000010', (SELECT id FROM usuarios WHERE email='carlos@housie.com'),  25.00, TRUE, '2026-03-18 11:00:00'),
  ('pf100001-0000-4000-8000-000000000024', 'fa100001-0000-4000-8000-000000000010', (SELECT id FROM usuarios WHERE email='ana@housie.com'),     25.00, TRUE, '2026-03-17 09:00:00'),
  ('pf100001-0000-4000-8000-000000000025', 'fa100001-0000-4000-8000-000000000012', (SELECT id FROM usuarios WHERE email='maria@housie.com'),   15.00, TRUE, '2026-05-04 10:00:00'),
  ('pf100001-0000-4000-8000-000000000026', 'fa100001-0000-4000-8000-000000000012', (SELECT id FROM usuarios WHERE email='carlos@housie.com'),  15.00, TRUE, '2026-05-05 11:00:00'),
  ('pf100001-0000-4000-8000-000000000027', 'fa100001-0000-4000-8000-000000000012', (SELECT id FROM usuarios WHERE email='ana@housie.com'),     15.00, TRUE, '2026-05-04 09:00:00')
ON CONFLICT (factura_id, usuario_id) DO NOTHING;

-- Pagos PENDIENTES
INSERT INTO pagos_factura (id, factura_id, usuario_id, importe_asignado, pagado) VALUES
  ('pf100002-0000-4000-8000-000000000001', 'fa100001-0000-4000-8000-000000000006', (SELECT id FROM usuarios WHERE email='maria@housie.com'),  400.00, FALSE),
  ('pf100002-0000-4000-8000-000000000002', 'fa100001-0000-4000-8000-000000000006', (SELECT id FROM usuarios WHERE email='carlos@housie.com'), 400.00, FALSE),
  ('pf100002-0000-4000-8000-000000000003', 'fa100001-0000-4000-8000-000000000006', (SELECT id FROM usuarios WHERE email='ana@housie.com'),    400.00, FALSE),
  ('pf100002-0000-4000-8000-000000000004', 'fa100001-0000-4000-8000-000000000009', (SELECT id FROM usuarios WHERE email='maria@housie.com'),   30.00, FALSE),
  ('pf100002-0000-4000-8000-000000000005', 'fa100001-0000-4000-8000-000000000009', (SELECT id FROM usuarios WHERE email='carlos@housie.com'),  30.00, FALSE),
  ('pf100002-0000-4000-8000-000000000006', 'fa100001-0000-4000-8000-000000000009', (SELECT id FROM usuarios WHERE email='ana@housie.com'),     30.00, FALSE),
  ('pf100002-0000-4000-8000-000000000007', 'fa100001-0000-4000-8000-000000000011', (SELECT id FROM usuarios WHERE email='maria@housie.com'),   24.00, FALSE),
  ('pf100002-0000-4000-8000-000000000008', 'fa100001-0000-4000-8000-000000000011', (SELECT id FROM usuarios WHERE email='carlos@housie.com'),  24.00, FALSE),
  ('pf100002-0000-4000-8000-000000000009', 'fa100001-0000-4000-8000-000000000011', (SELECT id FROM usuarios WHERE email='ana@housie.com'),     24.00, FALSE),
  ('pf100002-0000-4000-8000-000000000010', 'fa100001-0000-4000-8000-000000000013', (SELECT id FROM usuarios WHERE email='maria@housie.com'),   15.00, FALSE),
  ('pf100002-0000-4000-8000-000000000011', 'fa100001-0000-4000-8000-000000000013', (SELECT id FROM usuarios WHERE email='carlos@housie.com'),  15.00, FALSE),
  ('pf100002-0000-4000-8000-000000000012', 'fa100001-0000-4000-8000-000000000013', (SELECT id FROM usuarios WHERE email='ana@housie.com'),     15.00, FALSE)
ON CONFLICT (factura_id, usuario_id) DO NOTHING;

-- =================================================================
-- FACTURAS MADRID
-- =================================================================

INSERT INTO facturas (id, grupo_id, casero_id, tipo, descripcion, importe_total, fecha_emision, fecha_vencimiento) VALUES
  ('fa200001-0000-4000-8000-000000000001', '22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6', (SELECT id FROM usuarios WHERE email='elena@housie.com'), 'ALQUILER', 'Alquiler mayo 2026',  1300.00, '2026-05-01', '2026-05-05'),
  ('fa200001-0000-4000-8000-000000000002', '22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6', (SELECT id FROM usuarios WHERE email='elena@housie.com'), 'ALQUILER', 'Alquiler junio 2026', 1300.00, '2026-06-01', '2026-06-05'),
  ('fa200001-0000-4000-8000-000000000003', '22b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6', (SELECT id FROM usuarios WHERE email='elena@housie.com'), 'LUZ',      'Electricidad may',      60.00, '2026-05-10', '2026-05-20')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pagos_factura (id, factura_id, usuario_id, importe_asignado, pagado, fecha_pago) VALUES
  ('pf200001-0000-4000-8000-000000000001', 'fa200001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='david@housie.com'), 650.00, TRUE, '2026-05-03 10:00:00'),
  ('pf200001-0000-4000-8000-000000000002', 'fa200001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='laura@housie.com'), 650.00, TRUE, '2026-05-04 11:00:00'),
  ('pf200001-0000-4000-8000-000000000003', 'fa200001-0000-4000-8000-000000000003', (SELECT id FROM usuarios WHERE email='david@housie.com'),  30.00, TRUE, '2026-05-12 10:00:00'),
  ('pf200001-0000-4000-8000-000000000004', 'fa200001-0000-4000-8000-000000000003', (SELECT id FROM usuarios WHERE email='laura@housie.com'),  30.00, TRUE, '2026-05-13 11:00:00')
ON CONFLICT (factura_id, usuario_id) DO NOTHING;

INSERT INTO pagos_factura (id, factura_id, usuario_id, importe_asignado, pagado) VALUES
  ('pf200001-0000-4000-8000-000000000005', 'fa200001-0000-4000-8000-000000000002', (SELECT id FROM usuarios WHERE email='david@housie.com'), 650.00, FALSE),
  ('pf200001-0000-4000-8000-000000000006', 'fa200001-0000-4000-8000-000000000002', (SELECT id FROM usuarios WHERE email='laura@housie.com'), 650.00, FALSE)
ON CONFLICT (factura_id, usuario_id) DO NOTHING;

-- =================================================================
-- EVENTOS (grupo Granada)
-- =================================================================

INSERT INTO eventos (id, grupo_id, creado_por_id, titulo, descripcion, fecha_inicio, fecha_fin) VALUES
  ('ev100001-0000-4000-8000-000000000001', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='maria@housie.com'),
   'Cena de bienvenida al piso', 'Celebramos el primer mes juntos. Cada uno trae algo.',
   '2026-05-15 21:00:00', '2026-05-15 23:30:00'),
  ('ev100001-0000-4000-8000-000000000002', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='carlos@housie.com'),
   'Visita técnico internet', 'Revisión del router y mejora de la señal en las habitaciones.',
   '2026-06-11 10:00:00', '2026-06-11 11:30:00'),
  ('ev100001-0000-4000-8000-000000000003', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='maria@housie.com'),
   'Reunión de piso — junio', 'Revisamos gastos, turnos de limpieza y planificamos julio.',
   '2026-06-14 20:00:00', '2026-06-14 21:00:00'),
  ('ev100001-0000-4000-8000-000000000004', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='ana@housie.com'),
   'Limpieza general de verano', 'Limpieza profunda antes de las vacaciones: ventanas, nevera y trastero.',
   '2026-06-21 11:00:00', '2026-06-21 14:00:00'),
  ('ev100001-0000-4000-8000-000000000005', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='carlos@housie.com'),
   'Barbacoa fin de curso', 'Celebramos el fin de los exámenes con barbacoa en la terraza.',
   '2026-07-03 19:30:00', '2026-07-03 23:00:00')
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- LISTA DE LA COMPRA (grupo Granada)
-- =================================================================

INSERT INTO productos (id, grupo_id, anadido_por_id, nombre, categoria, comprado) VALUES
  ('pr100001-0000-4000-8000-000000000001', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='maria@housie.com'),  'Leche entera',        'comida',   FALSE),
  ('pr100001-0000-4000-8000-000000000002', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='maria@housie.com'),  'Pan de molde',        'comida',   FALSE),
  ('pr100001-0000-4000-8000-000000000003', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='carlos@housie.com'), 'Pasta (espaguetis)',  'comida',   FALSE),
  ('pr100001-0000-4000-8000-000000000004', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='carlos@housie.com'), 'Detergente lavadora', 'limpieza', FALSE),
  ('pr100001-0000-4000-8000-000000000005', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='ana@housie.com'),    'Limpiahogar',         'limpieza', FALSE),
  ('pr100001-0000-4000-8000-000000000006', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='ana@housie.com'),    'Aceite de oliva',     'comida',   TRUE),
  ('pr100001-0000-4000-8000-000000000007', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='maria@housie.com'),  'Papel higiénico',     'hogar',    TRUE),
  ('pr100001-0000-4000-8000-000000000008', '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', (SELECT id FROM usuarios WHERE email='carlos@housie.com'), 'Tomate frito',        'comida',   TRUE)
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- CHAT: Pablo → grupo Granada
-- =================================================================

INSERT INTO solicitudes_contacto (id, usuario_id, grupo_id, estado, fecha_envio) VALUES
  ('sc100001-0000-4000-8000-000000000001',
   (SELECT id FROM usuarios WHERE email='pablo@housie.com'),
   '11a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5',
   'ACEPTADA', '2026-06-05 16:30:00')
ON CONFLICT (usuario_id, grupo_id) DO NOTHING;

INSERT INTO chats (id, solicitud_id, estado, created_at) VALUES
  ('ch100001-0000-4000-8000-000000000001', 'sc100001-0000-4000-8000-000000000001', 'ACTIVO', '2026-06-05 17:00:00')
ON CONFLICT (solicitud_id) DO NOTHING;

INSERT INTO mensajes (id, chat_id, remitente_id, contenido, enviado_en) VALUES
  ('ms100001-0000-4000-8000-000000000001', 'ch100001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='pablo@housie.com'),
   '¡Hola! Vi vuestro anuncio en Housie y me interesa mucho la habitación. Soy estudiante de Derecho y empiezo en Granada en septiembre. ¿Podríamos hablar?',
   '2026-06-05 17:05:00'),
  ('ms100001-0000-4000-8000-000000000002', 'ch100001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='maria@housie.com'),
   '¡Hola Pablo! Encantados de conocerte. La habitación sigue disponible para septiembre. ¿Cuándo podrías venir a verla?',
   '2026-06-05 18:20:00'),
  ('ms100001-0000-4000-8000-000000000003', 'ch100001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='pablo@housie.com'),
   'Perfecto, estaré en Granada del 20 al 25 de junio. ¿Os va bien algún día de esa semana por la tarde?',
   '2026-06-05 18:45:00'),
  ('ms100001-0000-4000-8000-000000000004', 'ch100001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='maria@housie.com'),
   'El miércoles 24 a las 18:00 nos viene perfecto. Te mandamos la dirección exacta cuando confirmes.',
   '2026-06-05 19:10:00'),
  ('ms100001-0000-4000-8000-000000000005', 'ch100001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='pablo@housie.com'),
   'Genial! El miércoles 24 a las 18:00 lo apunto. Muchas gracias :)',
   '2026-06-05 19:15:00')
ON CONFLICT (id) DO NOTHING;

-- Isabel → grupo Barcelona (pendiente)
INSERT INTO solicitudes_contacto (id, usuario_id, grupo_id, estado, fecha_envio) VALUES
  ('sc300001-0000-4000-8000-000000000001',
   (SELECT id FROM usuarios WHERE email='isabel@housie.com'),
   '33c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7',
   'PENDIENTE', '2026-06-09 12:00:00')
ON CONFLICT (usuario_id, grupo_id) DO NOTHING;

-- =================================================================
-- FAVORITOS
-- =================================================================

INSERT INTO favoritos (id, usuario_id, publicacion_id, fecha_guardado) VALUES
  ('fv100001-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='pablo@housie.com'), '55e6f7a8-b9c0-4d1e-2f3a-b4c5d6e7f8a9', '2026-06-04 10:00:00'),
  ('fv100001-0000-4000-8000-000000000002', (SELECT id FROM usuarios WHERE email='pablo@housie.com'), '66f7a8b9-c0d1-4e2f-3a4b-c5d6e7f8a9b0', '2026-06-04 10:05:00')
ON CONFLICT (usuario_id, publicacion_id) DO NOTHING;

-- =================================================================
-- GRUPOS EXTRA (para paginación — 12 publicaciones adicionales)
-- =================================================================

-- Usuarios admin de los nuevos pisos
INSERT INTO usuarios (id, nombre, email, password) VALUES
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111101', 'Lucía Vega',      'lucia@housie.com',    crypt('housie123', gen_salt('bf', 10))),
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111102', 'Miguel Ortega',   'miguel@housie.com',   crypt('housie123', gen_salt('bf', 10))),
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111103', 'Natalia Prieto',  'natalia@housie.com',  crypt('housie123', gen_salt('bf', 10))),
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111104', 'Sergio Gil',      'sergio@housie.com',   crypt('housie123', gen_salt('bf', 10))),
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111105', 'Cristina Blanco', 'cristina@housie.com', crypt('housie123', gen_salt('bf', 10))),
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111106', 'Álvaro Romero',   'alvaro@housie.com',   crypt('housie123', gen_salt('bf', 10))),
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111107', 'Marta Iglesias',  'marta@housie.com',    crypt('housie123', gen_salt('bf', 10))),
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111108', 'Diego Herrera',   'diego@housie.com',    crypt('housie123', gen_salt('bf', 10))),
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111109', 'Valeria Núñez',   'valeria@housie.com',  crypt('housie123', gen_salt('bf', 10))),
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111110', 'Hugo Molina',     'hugo@housie.com',     crypt('housie123', gen_salt('bf', 10))),
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111111', 'Irene Castillo',  'irene@housie.com',    crypt('housie123', gen_salt('bf', 10))),
  ('f1a2b3c4-d5e6-4f7a-8b9c-111111111112', 'Rubén Navarro',   'ruben@housie.com',    crypt('housie123', gen_salt('bf', 10)))
ON CONFLICT (email) DO NOTHING;

-- Perfiles convivencia usuarios extra
INSERT INTO perfiles_convivencia_usuario
  (id, usuario_id, pais, genero, fecha_nacimiento, ocupacion, horario, frecuencia_visitas,
   ambiente, tolerancia_fiestas, fumador, acepta_fumadores,
   tiene_mascotas, acepta_mascotas, lgbtq_friendly, limpieza_orden, nivel_ruido, sobre_mi)
VALUES
  ('pc000002-0000-4000-8000-000000000001', (SELECT id FROM usuarios WHERE email='lucia@housie.com'),
   'España','Mujer','2001-05-14','ESTUDIO','INTERMEDIO','A_VECES','SOCIAL','FRECUENTE',
   FALSE,'INDIFERENTE',FALSE,'DEPENDE',TRUE,'DESPREOCUPADO','ALTO',
   'Estudiante de Comunicación. Me encantan los conciertos y los festivales de música. Busco piso animado.'),
  ('pc000002-0000-4000-8000-000000000002', (SELECT id FROM usuarios WHERE email='miguel@housie.com'),
   'España','Hombre','1998-11-20','TRABAJO','MADRUGADOR','CASI_NUNCA','TRANQUILO','NUNCA',
   FALSE,'NO',FALSE,'NO',TRUE,'ORDENADO','SILENCIO_TOTAL',
   'Ingeniero de software. Muy ordenado y tranquilo. Madrugo para el gimnasio y me gusta la tecnología.'),
  ('pc000002-0000-4000-8000-000000000003', (SELECT id FROM usuarios WHERE email='natalia@housie.com'),
   'España','Mujer','2000-03-07','ESTUDIO','INTERMEDIO','CASI_NUNCA','EQUILIBRADO','NUNCA',
   FALSE,'NO',FALSE,'NO',TRUE,'ORDENADO','MODERADO',
   'Estudiante de Psicología. Practico yoga y meditación. Busco un piso tranquilo y con buen rollo.'),
  ('pc000002-0000-4000-8000-000000000004', (SELECT id FROM usuarios WHERE email='sergio@housie.com'),
   'España','Hombre','1999-08-15','TRABAJO','MADRUGADOR','CASI_NUNCA','TRANQUILO','NUNCA',
   FALSE,'NO',FALSE,'NO',TRUE,'ORDENADO','SILENCIO_TOTAL',
   'Trabajo en marketing digital. Muy madrugador y ordenado. Salgo a correr cada mañana antes de trabajar.'),
  ('pc000002-0000-4000-8000-000000000005', (SELECT id FROM usuarios WHERE email='cristina@housie.com'),
   'España','Mujer','2001-01-28','ESTUDIO','INTERMEDIO','A_VECES','EQUILIBRADO','OCASIONAL',
   FALSE,'NO',FALSE,'DEPENDE',TRUE,'FLEXIBLE','MODERADO',
   'Estudiante de Nutrición. Cocino mucho y cuido la alimentación. Prefiero un ambiente tranquilo.'),
  ('pc000002-0000-4000-8000-000000000006', (SELECT id FROM usuarios WHERE email='alvaro@housie.com'),
   'España','Hombre','2000-09-03','ESTUDIO','NOCTURNO','A_VECES','EQUILIBRADO','OCASIONAL',
   FALSE,'INDIFERENTE',FALSE,'DEPENDE',TRUE,'DESPREOCUPADO','MODERADO',
   'Estudiante de Ingeniería. Me gustan los videojuegos y el cine. Suelo acostarme tarde pero soy tranquilo.'),
  ('pc000002-0000-4000-8000-000000000007', (SELECT id FROM usuarios WHERE email='marta@housie.com'),
   'España','Mujer','1999-04-22','TRABAJO','INTERMEDIO','A_VECES','EQUILIBRADO','OCASIONAL',
   FALSE,'NO',FALSE,'DEPENDE',TRUE,'ORDENADO','MODERADO',
   'Fotógrafa profesional. Suelo volver tarde por eventos y reportajes. Muy limpia y organizada en casa.'),
  ('pc000002-0000-4000-8000-000000000008', (SELECT id FROM usuarios WHERE email='diego@housie.com'),
   'España','Hombre','2002-07-11','ESTUDIO','INTERMEDIO','A_VECES','SOCIAL','OCASIONAL',
   FALSE,'INDIFERENTE',FALSE,'SI',TRUE,'FLEXIBLE','ALTO',
   'Estudiante de Ciencias del Mar. Surfeo los fines de semana. Muy sociable y activo, me gusta el deporte.'),
  ('pc000002-0000-4000-8000-000000000009', (SELECT id FROM usuarios WHERE email='valeria@housie.com'),
   'Argentina','Mujer','2001-10-18','ESTUDIO','INTERMEDIO','CASI_NUNCA','TRANQUILO','NUNCA',
   FALSE,'NO',FALSE,'SI',TRUE,'ORDENADO','SILENCIO_TOTAL',
   'Intercambio desde Buenos Aires, estudio Biología. Vegana y muy respetuosa con el espacio compartido.'),
  ('pc000002-0000-4000-8000-000000000010', (SELECT id FROM usuarios WHERE email='hugo@housie.com'),
   'España','Hombre','1997-12-05','TRABAJO','MADRUGADOR','CASI_NUNCA','TRANQUILO','NUNCA',
   FALSE,'NO',FALSE,'NO',TRUE,'ORDENADO','SILENCIO_TOTAL',
   'Fisioterapeuta deportivo. Voy al gimnasio cada mañana y cuido mucho mi rutina. Busco compañeros activos.'),
  ('pc000002-0000-4000-8000-000000000011', (SELECT id FROM usuarios WHERE email='irene@housie.com'),
   'España','Mujer','2001-06-30','ESTUDIO','NOCTURNO','A_VECES','SOCIAL','OCASIONAL',
   FALSE,'INDIFERENTE',FALSE,'SI',TRUE,'FLEXIBLE','ALTO',
   'Estudiante de Arte Dramático. Tengo ensayos hasta tarde algunos días pero respeto los horarios del piso.'),
  ('pc000002-0000-4000-8000-000000000012', (SELECT id FROM usuarios WHERE email='ruben@housie.com'),
   'España','Hombre','1998-02-14','ESTUDIO_Y_TRABAJO','INTERMEDIO','A_VECES','EQUILIBRADO','FRECUENTE',
   FALSE,'INDIFERENTE',FALSE,'DEPENDE',TRUE,'FLEXIBLE','MODERADO',
   'Músico y estudiante de composición. Toco en varios grupos. Respeto siempre el horario de silencio.')
ON CONFLICT (usuario_id) DO NOTHING;

-- Grupos extra
INSERT INTO grupos (id, nombre, codigo_acceso, codigo_casero, descripcion, ciudad, buscar_companero, dia_limpieza, semana_rotacion, rotacion_semana_actual) VALUES
  ('aa000001-0000-4000-8000-000000000001', 'Piso Sevilla Centro',    'SEV001', 'SVC001', 'Piso amplio en el barrio de Triana. Buscamos perfil tranquilo.', 'Sevilla',     TRUE, 'LUNES',     0, NULL),
  ('aa000001-0000-4000-8000-000000000002', 'Apartamento Valencia',   'VAL002', 'VLC002', 'Apartamento luminoso cerca de la Ciudad de las Artes.',         'Valencia',    TRUE, 'MIERCOLES', 0, NULL),
  ('aa000001-0000-4000-8000-000000000003', 'Piso Bilbao Casco Viejo','BIL003', 'BLC003', 'Piso reformado en el Casco Viejo, a 10 min del metro.',         'Bilbao',      TRUE, 'VIERNES',   0, NULL),
  ('aa000001-0000-4000-8000-000000000004', 'Flat Málaga Playa',      'MAL004', 'MLC004', 'A 5 minutos de la playa de la Malagueta. Terraza incluida.',     'Málaga',      TRUE, 'SABADO',    0, NULL),
  ('aa000001-0000-4000-8000-000000000005', 'Piso Zaragoza',          'ZAR005', 'ZRC005', 'Piso de 90m² en el centro histórico de Zaragoza.',              'Zaragoza',    TRUE, 'LUNES',     0, NULL),
  ('aa000001-0000-4000-8000-000000000006', 'Piso Valladolid',        'VLL006', 'VLV006', 'Piso universitario cerca del campus Miguel Delibes.',           'Valladolid',  TRUE, 'MARTES',    0, NULL),
  ('aa000001-0000-4000-8000-000000000007', 'Piso Salamanca',         'SAL007', 'SLC007', 'A 3 minutos de la Plaza Mayor. Piso histórico reformado.',      'Salamanca',   TRUE, 'MIERCOLES', 0, NULL),
  ('aa000001-0000-4000-8000-000000000008', 'Apartamento Alicante',   'ALI008', 'ALC008', 'Vista al mar desde el salón. Muy soleado todo el año.',         'Alicante',    TRUE, 'JUEVES',    0, NULL),
  ('aa000001-0000-4000-8000-000000000009', 'Piso Murcia',            'MUR009', 'MRC009', 'Piso tranquilo en el barrio de La Flota, muy bien comunicado.', 'Murcia',      TRUE, 'VIERNES',   0, NULL),
  ('aa000001-0000-4000-8000-000000000010', 'Apartamento Palma',      'PAL010', 'PLC010', 'Piso moderno en el centro de Palma, cerca de la Catedral.',     'Palma',       TRUE, 'SABADO',    0, NULL),
  ('aa000001-0000-4000-8000-000000000011', 'Piso Córdoba',           'COR011', 'CRC011', 'Piso en el casco histórico, a 5 min de la Mezquita.',           'Córdoba',     TRUE, 'LUNES',     0, NULL),
  ('aa000001-0000-4000-8000-000000000012', 'Granada Albaicín',       'GRA012', 'GRC012', 'Vistas a la Alhambra. Piso auténtico en el Albaicín.',          'Granada',     TRUE, 'MARTES',    0, NULL)
ON CONFLICT (id) DO NOTHING;

-- Intereses grupos extra (referenciados por nombre, ver nota anterior)
INSERT INTO grupo_intereses (grupo_id, interes_id) VALUES
  ('aa000001-0000-4000-8000-000000000001', (SELECT id FROM intereses WHERE nombre='Cocina en casa')),
  ('aa000001-0000-4000-8000-000000000001', (SELECT id FROM intereses WHERE nombre='Festivales')),
  ('aa000001-0000-4000-8000-000000000001', (SELECT id FROM intereses WHERE nombre='Música en directo')),
  ('aa000001-0000-4000-8000-000000000002', (SELECT id FROM intereses WHERE nombre='Gimnasio')),
  ('aa000001-0000-4000-8000-000000000002', (SELECT id FROM intereses WHERE nombre='Networking')),
  ('aa000001-0000-4000-8000-000000000002', (SELECT id FROM intereses WHERE nombre='Videojuegos')),
  ('aa000001-0000-4000-8000-000000000003', (SELECT id FROM intereses WHERE nombre='Running')),
  ('aa000001-0000-4000-8000-000000000003', (SELECT id FROM intereses WHERE nombre='Viajes')),
  ('aa000001-0000-4000-8000-000000000003', (SELECT id FROM intereses WHERE nombre='Cine')),
  ('aa000001-0000-4000-8000-000000000004', (SELECT id FROM intereses WHERE nombre='Surf')),
  ('aa000001-0000-4000-8000-000000000004', (SELECT id FROM intereses WHERE nombre='Festivales')),
  ('aa000001-0000-4000-8000-000000000004', (SELECT id FROM intereses WHERE nombre='Música en directo')),
  ('aa000001-0000-4000-8000-000000000005', (SELECT id FROM intereses WHERE nombre='Cine')),
  ('aa000001-0000-4000-8000-000000000005', (SELECT id FROM intereses WHERE nombre='Cocina en casa')),
  ('aa000001-0000-4000-8000-000000000005', (SELECT id FROM intereses WHERE nombre='Viajes')),
  ('aa000001-0000-4000-8000-000000000006', (SELECT id FROM intereses WHERE nombre='Running')),
  ('aa000001-0000-4000-8000-000000000006', (SELECT id FROM intereses WHERE nombre='Cine')),
  ('aa000001-0000-4000-8000-000000000006', (SELECT id FROM intereses WHERE nombre='Videojuegos')),
  ('aa000001-0000-4000-8000-000000000007', (SELECT id FROM intereses WHERE nombre='Teatro')),
  ('aa000001-0000-4000-8000-000000000007', (SELECT id FROM intereses WHERE nombre='Fotografía')),
  ('aa000001-0000-4000-8000-000000000007', (SELECT id FROM intereses WHERE nombre='Música en directo')),
  ('aa000001-0000-4000-8000-000000000008', (SELECT id FROM intereses WHERE nombre='Gimnasio')),
  ('aa000001-0000-4000-8000-000000000008', (SELECT id FROM intereses WHERE nombre='Yoga')),
  ('aa000001-0000-4000-8000-000000000008', (SELECT id FROM intereses WHERE nombre='Meditación')),
  ('aa000001-0000-4000-8000-000000000009', (SELECT id FROM intereses WHERE nombre='Cocina en casa')),
  ('aa000001-0000-4000-8000-000000000009', (SELECT id FROM intereses WHERE nombre='Vegano')),
  ('aa000001-0000-4000-8000-000000000009', (SELECT id FROM intereses WHERE nombre='Viajes')),
  ('aa000001-0000-4000-8000-000000000010', (SELECT id FROM intereses WHERE nombre='Viajes')),
  ('aa000001-0000-4000-8000-000000000010', (SELECT id FROM intereses WHERE nombre='Festivales')),
  ('aa000001-0000-4000-8000-000000000010', (SELECT id FROM intereses WHERE nombre='Surf')),
  ('aa000001-0000-4000-8000-000000000011', (SELECT id FROM intereses WHERE nombre='Cine')),
  ('aa000001-0000-4000-8000-000000000011', (SELECT id FROM intereses WHERE nombre='Teatro')),
  ('aa000001-0000-4000-8000-000000000011', (SELECT id FROM intereses WHERE nombre='Fotografía')),
  ('aa000001-0000-4000-8000-000000000012', (SELECT id FROM intereses WHERE nombre='Música en directo')),
  ('aa000001-0000-4000-8000-000000000012', (SELECT id FROM intereses WHERE nombre='Festivales')),
  ('aa000001-0000-4000-8000-000000000012', (SELECT id FROM intereses WHERE nombre='Viajes'))
ON CONFLICT DO NOTHING;

-- Perfiles convivencia grupos extra
INSERT INTO perfiles_convivencia_grupo
  (id, grupo_id, ocupacion, horario, frecuencia_visitas, ambiente, tolerancia_fiestas,
   acepta_fumadores, acepta_mascotas, lgbtq_friendly, limpieza_orden, nivel_ruido)
VALUES
  ('pg000002-0000-4000-8000-000000000001', 'aa000001-0000-4000-8000-000000000001', 'ESTUDIO',          'INTERMEDIO', 'A_VECES',    'SOCIAL',      'OCASIONAL',  'INDIFERENTE', 'DEPENDE', TRUE, 'DESPREOCUPADO', 'ALTO'),
  ('pg000002-0000-4000-8000-000000000002', 'aa000001-0000-4000-8000-000000000002', 'TRABAJO',           'MADRUGADOR', 'CASI_NUNCA', 'TRANQUILO',   'NUNCA',      'NO',          'NO',      TRUE, 'ORDENADO',       'SILENCIO_TOTAL'),
  ('pg000002-0000-4000-8000-000000000003', 'aa000001-0000-4000-8000-000000000003', 'ESTUDIO_Y_TRABAJO', 'INTERMEDIO', 'A_VECES',    'EQUILIBRADO', 'OCASIONAL',  'INDIFERENTE', 'DEPENDE', TRUE, 'FLEXIBLE',       'MODERADO'),
  ('pg000002-0000-4000-8000-000000000004', 'aa000001-0000-4000-8000-000000000004', 'TRABAJO',           'INTERMEDIO', 'FRECUENTE',  'SOCIAL',      'OCASIONAL',  'INDIFERENTE', 'SI',      TRUE, 'DESPREOCUPADO', 'ALTO'),
  ('pg000002-0000-4000-8000-000000000005', 'aa000001-0000-4000-8000-000000000005', 'ESTUDIO',          'MADRUGADOR', 'CASI_NUNCA', 'TRANQUILO',   'NUNCA',      'NO',          'NO',      TRUE, 'ORDENADO',       'SILENCIO_TOTAL'),
  ('pg000002-0000-4000-8000-000000000006', 'aa000001-0000-4000-8000-000000000006', 'ESTUDIO',          'INTERMEDIO', 'A_VECES',    'EQUILIBRADO', 'OCASIONAL',  'NO',          'DEPENDE', TRUE, 'FLEXIBLE',       'MODERADO'),
  ('pg000002-0000-4000-8000-000000000007', 'aa000001-0000-4000-8000-000000000007', 'ESTUDIO',          'NOCTURNO',   'A_VECES',    'SOCIAL',      'OCASIONAL',  'INDIFERENTE', 'DEPENDE', TRUE, 'FLEXIBLE',       'ALTO'),
  ('pg000002-0000-4000-8000-000000000008', 'aa000001-0000-4000-8000-000000000008', 'TRABAJO',           'MADRUGADOR', 'CASI_NUNCA', 'TRANQUILO',   'NUNCA',      'NO',          'NO',      TRUE, 'ORDENADO',       'SILENCIO_TOTAL'),
  ('pg000002-0000-4000-8000-000000000009', 'aa000001-0000-4000-8000-000000000009', 'ESTUDIO_Y_TRABAJO', 'INTERMEDIO', 'A_VECES',    'EQUILIBRADO', 'OCASIONAL',  'INDIFERENTE', 'DEPENDE', TRUE, 'FLEXIBLE',       'MODERADO'),
  ('pg000002-0000-4000-8000-000000000010', 'aa000001-0000-4000-8000-000000000010', 'TRABAJO',           'MADRUGADOR', 'CASI_NUNCA', 'TRANQUILO',   'NUNCA',      'NO',          'NO',      TRUE, 'ORDENADO',       'SILENCIO_TOTAL'),
  ('pg000002-0000-4000-8000-000000000011', 'aa000001-0000-4000-8000-000000000011', 'ESTUDIO',          'INTERMEDIO', 'A_VECES',    'EQUILIBRADO', 'OCASIONAL',  'NO',          'DEPENDE', TRUE, 'FLEXIBLE',       'MODERADO'),
  ('pg000002-0000-4000-8000-000000000012', 'aa000001-0000-4000-8000-000000000012', 'ESTUDIO',          'NOCTURNO',   'FRECUENTE',  'SOCIAL',      'FRECUENTE',  'INDIFERENTE', 'SI',      TRUE, 'DESPREOCUPADO', 'ALTO')
ON CONFLICT (grupo_id) DO NOTHING;

-- Miembros admin de los grupos extra
INSERT INTO miembros_grupo (id, usuario_id, grupo_id, rol) VALUES
  ('mx000001-0000-4000-8000-000000000001', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111101', 'aa000001-0000-4000-8000-000000000001', 'ADMIN'),
  ('mx000001-0000-4000-8000-000000000002', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111102', 'aa000001-0000-4000-8000-000000000002', 'ADMIN'),
  ('mx000001-0000-4000-8000-000000000003', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111103', 'aa000001-0000-4000-8000-000000000003', 'ADMIN'),
  ('mx000001-0000-4000-8000-000000000004', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111104', 'aa000001-0000-4000-8000-000000000004', 'ADMIN'),
  ('mx000001-0000-4000-8000-000000000005', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111105', 'aa000001-0000-4000-8000-000000000005', 'ADMIN'),
  ('mx000001-0000-4000-8000-000000000006', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111106', 'aa000001-0000-4000-8000-000000000006', 'ADMIN'),
  ('mx000001-0000-4000-8000-000000000007', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111107', 'aa000001-0000-4000-8000-000000000007', 'ADMIN'),
  ('mx000001-0000-4000-8000-000000000008', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111108', 'aa000001-0000-4000-8000-000000000008', 'ADMIN'),
  ('mx000001-0000-4000-8000-000000000009', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111109', 'aa000001-0000-4000-8000-000000000009', 'ADMIN'),
  ('mx000001-0000-4000-8000-000000000010', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111110', 'aa000001-0000-4000-8000-000000000010', 'ADMIN'),
  ('mx000001-0000-4000-8000-000000000011', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111111', 'aa000001-0000-4000-8000-000000000011', 'ADMIN'),
  ('mx000001-0000-4000-8000-000000000012', 'f1a2b3c4-d5e6-4f7a-8b9c-111111111112', 'aa000001-0000-4000-8000-000000000012', 'ADMIN')
ON CONFLICT (id) DO NOTHING;

-- Publicaciones extra
INSERT INTO publicaciones
  (id, grupo_id, titulo, descripcion, ciudad, direccion, precio, habitaciones_libres,
   tipo_piso, habitaciones_totales, tamano_piso, planta, ascensor,
   wifi, lavadora, aire_acondicionado, calefaccion, amueblado, parking, terraza,
   permite_fumar, permite_mascotas, genero_preferido,
   normas_adicionales, modo_contacto, visible)
VALUES
  ('pp000001-0000-4000-8000-000000000001',
   'aa000001-0000-4000-8000-000000000001',
   'Habitación en Triana — Sevilla',
   'Piso amplio con terraza en el barrio más animado de Sevilla. A 10 min andando del centro.',
   'Sevilla','Calle Betis, 22',380.00,1,'PISO',3,85.00,1,FALSE,
   TRUE,TRUE,TRUE,FALSE,TRUE,FALSE,TRUE,FALSE,FALSE,'INDIFERENTE',NULL,'CHAT',TRUE),

  ('pp000001-0000-4000-8000-000000000002',
   'aa000001-0000-4000-8000-000000000002',
   'Apartamento moderno — Valencia',
   'Apartamento recién reformado cerca de la Ciudad de las Artes y las Ciencias. Muy luminoso.',
   'Valencia','Avenida Francia, 15',490.00,1,'PISO',2,65.00,5,TRUE,
   TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,FALSE,FALSE,'INDIFERENTE',NULL,'CHAT',TRUE),

  ('pp000001-0000-4000-8000-000000000003',
   'aa000001-0000-4000-8000-000000000003',
   'Piso en el Casco Viejo — Bilbao',
   'Habitación en piso reformado en el corazón del Casco Viejo. Todos los servicios a pie de calle.',
   'Bilbao','Calle Somera, 8',420.00,1,'PISO',4,100.00,2,FALSE,
   TRUE,TRUE,FALSE,TRUE,TRUE,FALSE,FALSE,FALSE,FALSE,'INDIFERENTE',NULL,'CHAT',TRUE),

  ('pp000001-0000-4000-8000-000000000004',
   'aa000001-0000-4000-8000-000000000004',
   'Piso con terraza — Málaga Playa',
   'Piso a 5 min a pie de la playa. Terraza compartida con vistas al Mediterráneo.',
   'Málaga','Paseo Marítimo, 34',560.00,2,'PISO',4,110.00,3,TRUE,
   TRUE,TRUE,TRUE,FALSE,TRUE,FALSE,TRUE,FALSE,TRUE,'INDIFERENTE',NULL,'CHAT',TRUE),

  ('pp000001-0000-4000-8000-000000000005',
   'aa000001-0000-4000-8000-000000000005',
   'Piso céntrico — Zaragoza',
   'Piso de 90m² en el centro histórico. Zona tranquila, ideal para estudiantes o trabajadores.',
   'Zaragoza','Calle Alfonso I, 12',310.00,1,'PISO',3,90.00,4,TRUE,
   TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,FALSE,FALSE,FALSE,'INDIFERENTE',NULL,'CHAT',TRUE),

  ('pp000001-0000-4000-8000-000000000006',
   'aa000001-0000-4000-8000-000000000006',
   'Piso universitario — Valladolid',
   'Ideal para estudiantes. Cerca de la UVa y del campus Miguel Delibes. Muy bien comunicado.',
   'Valladolid','Calle Real de Burgos, 5',280.00,1,'PISO',3,75.00,2,FALSE,
   TRUE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,'INDIFERENTE',NULL,'CHAT',TRUE),

  ('pp000001-0000-4000-8000-000000000007',
   'aa000001-0000-4000-8000-000000000007',
   'A 3 min de la Plaza Mayor — Salamanca',
   'Piso histórico completamente reformado. La ubicación más céntrica de Salamanca.',
   'Salamanca','Calle Compañía, 3',340.00,1,'PISO',3,80.00,1,FALSE,
   TRUE,TRUE,FALSE,TRUE,TRUE,FALSE,FALSE,FALSE,FALSE,'INDIFERENTE',NULL,'CHAT',TRUE),

  ('pp000001-0000-4000-8000-000000000008',
   'aa000001-0000-4000-8000-000000000008',
   'Vista al mar — Alicante',
   'Apartamento con vistas al Mediterráneo. Soleado los 365 días del año.',
   'Alicante','Avenida del Mar, 7',450.00,1,'PISO',2,60.00,6,TRUE,
   TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,FALSE,TRUE,'INDIFERENTE',NULL,'CHAT',TRUE),

  ('pp000001-0000-4000-8000-000000000009',
   'aa000001-0000-4000-8000-000000000009',
   'Piso tranquilo — Murcia',
   'Piso amplio y muy tranquilo en La Flota. A 15 min del centro en bici.',
   'Murcia','Calle Mayor, 18',295.00,2,'PISO',4,95.00,1,FALSE,
   TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,FALSE,FALSE,FALSE,'INDIFERENTE',NULL,'CHAT',TRUE),

  ('pp000001-0000-4000-8000-000000000010',
   'aa000001-0000-4000-8000-000000000010',
   'Piso moderno — Palma de Mallorca',
   'Piso reformado en el centro de Palma. Arquitectura mallorquina con toque moderno.',
   'Palma','Carrer dels Oms, 9',580.00,1,'PISO',3,85.00,3,TRUE,
   TRUE,TRUE,TRUE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,'INDIFERENTE',NULL,'CHAT',TRUE),

  ('pp000001-0000-4000-8000-000000000011',
   'aa000001-0000-4000-8000-000000000011',
   'Junto a la Mezquita — Córdoba',
   'Piso en el casco histórico a 5 min de la Mezquita-Catedral. Arquitectura mudéjar original.',
   'Córdoba','Calle Judería, 6',320.00,1,'PISO',2,70.00,1,FALSE,
   TRUE,TRUE,TRUE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,'INDIFERENTE',NULL,'CHAT',TRUE),

  ('pp000001-0000-4000-8000-000000000012',
   'aa000001-0000-4000-8000-000000000012',
   'Vistas a la Alhambra — Albaicín',
   'Piso típico granadino con vistas privilegiadas a la Alhambra. Zona monumental UNESCO.',
   'Granada','Calle Calderería Nueva, 4',410.00,1,'PISO',3,75.00,2,FALSE,
   TRUE,FALSE,FALSE,FALSE,TRUE,FALSE,TRUE,FALSE,FALSE,'INDIFERENTE',NULL,'CHAT',TRUE)
ON CONFLICT (grupo_id) DO NOTHING;

-- Fotos para los nuevos anuncios
INSERT INTO fotos_publicacion (id, publicacion_id, url, orden) VALUES
  -- Sevilla Triana (habitacion4, cocina3, salon3)
  ('cl000001-0000-4000-8000-000000000010','pp000001-0000-4000-8000-000000000001','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130044/habitacion4_brpyzj.jpg',0),
  ('cl000001-0000-4000-8000-000000000011','pp000001-0000-4000-8000-000000000001','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130043/cocina3_prmshf.jpg',1),
  ('cl000001-0000-4000-8000-000000000012','pp000001-0000-4000-8000-000000000001','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130049/salon3_tmfch5.jpg',2),
  -- Valencia (baño3, habitacion5, cocina4)
  ('cl000001-0000-4000-8000-000000000013','pp000001-0000-4000-8000-000000000002','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130039/ba%C3%B1o3_udmvwd.jpg',0),
  ('cl000001-0000-4000-8000-000000000014','pp000001-0000-4000-8000-000000000002','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130044/habitacion5_fppn0l.jpg',1),
  ('cl000001-0000-4000-8000-000000000015','pp000001-0000-4000-8000-000000000002','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130040/cocina4_qtvdob.jpg',2),
  -- Bilbao (salon4, habitacion6, baño4)
  ('cl000001-0000-4000-8000-000000000016','pp000001-0000-4000-8000-000000000003','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130054/salon4_jf8kly.jpg',0),
  ('cl000001-0000-4000-8000-000000000017','pp000001-0000-4000-8000-000000000003','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130044/habitacion6_vwd5hk.jpg',1),
  ('cl000001-0000-4000-8000-000000000018','pp000001-0000-4000-8000-000000000003','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130042/ba%C3%B1o4_jcxgn2.jpg',2),
  -- Málaga Playa (habitacion7, cocina5, salon5)
  ('cl000001-0000-4000-8000-000000000019','pp000001-0000-4000-8000-000000000004','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130047/habitacion7_gpgylc.jpg',0),
  ('cl000001-0000-4000-8000-000000000020','pp000001-0000-4000-8000-000000000004','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130040/cocina5_qclxly.jpg',1),
  ('cl000001-0000-4000-8000-000000000021','pp000001-0000-4000-8000-000000000004','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130052/salon5_xr7phs.jpg',2),
  -- Zaragoza (habitacion8, salon6, cocina6)
  ('cl000001-0000-4000-8000-000000000022','pp000001-0000-4000-8000-000000000005','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130046/habitacion8_tjh8jt.jpg',0),
  ('cl000001-0000-4000-8000-000000000023','pp000001-0000-4000-8000-000000000005','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130051/salon6_mdoel9.jpg',1),
  ('cl000001-0000-4000-8000-000000000024','pp000001-0000-4000-8000-000000000005','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130042/cocina6_kkqztn.jpg',2),
  -- Valladolid (habitacion9, salon7)
  ('cl000001-0000-4000-8000-000000000025','pp000001-0000-4000-8000-000000000006','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130047/habitacion9_hq9edl.jpg',0),
  ('cl000001-0000-4000-8000-000000000026','pp000001-0000-4000-8000-000000000006','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130054/salon7_bxdet8.jpg',1),
  -- Salamanca (habitacion10, salon8)
  ('cl000001-0000-4000-8000-000000000027','pp000001-0000-4000-8000-000000000007','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130047/habitacion10_hcj2pj.jpg',0),
  ('cl000001-0000-4000-8000-000000000028','pp000001-0000-4000-8000-000000000007','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130053/salon8_umbu3q.jpg',1),
  -- Alicante (habitacion11, salon9)
  ('cl000001-0000-4000-8000-000000000029','pp000001-0000-4000-8000-000000000008','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130046/habitacion11_sddh89.jpg',0),
  ('cl000001-0000-4000-8000-000000000030','pp000001-0000-4000-8000-000000000008','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130054/salon9_ct9yzt.jpg',1),
  -- Murcia (habitacion12, salon10)
  ('cl000001-0000-4000-8000-000000000031','pp000001-0000-4000-8000-000000000009','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130049/habitacion12_ulov7j.jpg',0),
  ('cl000001-0000-4000-8000-000000000032','pp000001-0000-4000-8000-000000000009','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130054/salon10_ii1a7i.jpg',1),
  -- Palma (habitacion13, salon11)
  ('cl000001-0000-4000-8000-000000000033','pp000001-0000-4000-8000-000000000010','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130048/habitacion13_nqs9wu.jpg',0),
  ('cl000001-0000-4000-8000-000000000034','pp000001-0000-4000-8000-000000000010','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130055/salon11_kuidwu.jpg',1),
  -- Córdoba (habitacion14, salon12)
  ('cl000001-0000-4000-8000-000000000035','pp000001-0000-4000-8000-000000000011','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130052/habitacion14_usptzf.jpg',0),
  ('cl000001-0000-4000-8000-000000000036','pp000001-0000-4000-8000-000000000011','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130054/salon12_yvo3ij.jpg',1),
  -- Granada Albaicín (habitacion15, habitacion16, salon13, salon14)
  ('cl000001-0000-4000-8000-000000000037','pp000001-0000-4000-8000-000000000012','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130050/habitacion15_yralc4.jpg',0),
  ('cl000001-0000-4000-8000-000000000038','pp000001-0000-4000-8000-000000000012','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130050/habitacion16_scvzkh.jpg',1),
  ('cl000001-0000-4000-8000-000000000039','pp000001-0000-4000-8000-000000000012','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130078/salon13_uqexge.jpg',2),
  ('cl000001-0000-4000-8000-000000000040','pp000001-0000-4000-8000-000000000012','https://res.cloudinary.com/dnjxewpp9/image/upload/v1781130041/salon14_tdxltc.jpg',3)
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- INTERESES USUARIOS (referenciados por nombre, ver nota anterior)
-- =================================================================

INSERT INTO usuario_intereses (usuario_id, interes_id) VALUES
  -- maria: running, cine, viajes
  ((SELECT id FROM usuarios WHERE email='maria@housie.com'), (SELECT id FROM intereses WHERE nombre='Running')),
  ((SELECT id FROM usuarios WHERE email='maria@housie.com'), (SELECT id FROM intereses WHERE nombre='Cine')),
  ((SELECT id FROM usuarios WHERE email='maria@housie.com'), (SELECT id FROM intereses WHERE nombre='Viajes')),
  -- carlos: gimnasio, videojuegos, cocina en casa
  ((SELECT id FROM usuarios WHERE email='carlos@housie.com'), (SELECT id FROM intereses WHERE nombre='Gimnasio')),
  ((SELECT id FROM usuarios WHERE email='carlos@housie.com'), (SELECT id FROM intereses WHERE nombre='Cocina en casa')),
  ((SELECT id FROM usuarios WHERE email='carlos@housie.com'), (SELECT id FROM intereses WHERE nombre='Videojuegos')),
  -- ana: running, yoga, fotografía
  ((SELECT id FROM usuarios WHERE email='ana@housie.com'), (SELECT id FROM intereses WHERE nombre='Running')),
  ((SELECT id FROM usuarios WHERE email='ana@housie.com'), (SELECT id FROM intereses WHERE nombre='Yoga')),
  ((SELECT id FROM usuarios WHERE email='ana@housie.com'), (SELECT id FROM intereses WHERE nombre='Fotografía')),
  -- david: gimnasio, networking, viajes
  ((SELECT id FROM usuarios WHERE email='david@housie.com'), (SELECT id FROM intereses WHERE nombre='Gimnasio')),
  ((SELECT id FROM usuarios WHERE email='david@housie.com'), (SELECT id FROM intereses WHERE nombre='Viajes')),
  ((SELECT id FROM usuarios WHERE email='david@housie.com'), (SELECT id FROM intereses WHERE nombre='Networking')),
  -- laura: yoga, fotografía, meditación
  ((SELECT id FROM usuarios WHERE email='laura@housie.com'), (SELECT id FROM intereses WHERE nombre='Yoga')),
  ((SELECT id FROM usuarios WHERE email='laura@housie.com'), (SELECT id FROM intereses WHERE nombre='Fotografía')),
  ((SELECT id FROM usuarios WHERE email='laura@housie.com'), (SELECT id FROM intereses WHERE nombre='Meditación')),
  -- javier: cine, música en directo, viajes
  ((SELECT id FROM usuarios WHERE email='javier@housie.com'), (SELECT id FROM intereses WHERE nombre='Cine')),
  ((SELECT id FROM usuarios WHERE email='javier@housie.com'), (SELECT id FROM intereses WHERE nombre='Música en directo')),
  ((SELECT id FROM usuarios WHERE email='javier@housie.com'), (SELECT id FROM intereses WHERE nombre='Viajes')),
  -- sofia: cocina en casa, fotografía, meditación
  ((SELECT id FROM usuarios WHERE email='sofia@housie.com'), (SELECT id FROM intereses WHERE nombre='Cocina en casa')),
  ((SELECT id FROM usuarios WHERE email='sofia@housie.com'), (SELECT id FROM intereses WHERE nombre='Fotografía')),
  ((SELECT id FROM usuarios WHERE email='sofia@housie.com'), (SELECT id FROM intereses WHERE nombre='Meditación')),
  -- pablo: cine, videojuegos, festivales
  ((SELECT id FROM usuarios WHERE email='pablo@housie.com'), (SELECT id FROM intereses WHERE nombre='Cine')),
  ((SELECT id FROM usuarios WHERE email='pablo@housie.com'), (SELECT id FROM intereses WHERE nombre='Videojuegos')),
  ((SELECT id FROM usuarios WHERE email='pablo@housie.com'), (SELECT id FROM intereses WHERE nombre='Festivales')),
  -- isabel: teatro, fotografía, música en directo
  ((SELECT id FROM usuarios WHERE email='isabel@housie.com'), (SELECT id FROM intereses WHERE nombre='Teatro')),
  ((SELECT id FROM usuarios WHERE email='isabel@housie.com'), (SELECT id FROM intereses WHERE nombre='Música en directo')),
  ((SELECT id FROM usuarios WHERE email='isabel@housie.com'), (SELECT id FROM intereses WHERE nombre='Fotografía')),
  -- lucia: festivales, música en directo, running
  ((SELECT id FROM usuarios WHERE email='lucia@housie.com'), (SELECT id FROM intereses WHERE nombre='Running')),
  ((SELECT id FROM usuarios WHERE email='lucia@housie.com'), (SELECT id FROM intereses WHERE nombre='Música en directo')),
  ((SELECT id FROM usuarios WHERE email='lucia@housie.com'), (SELECT id FROM intereses WHERE nombre='Festivales')),
  -- miguel: gimnasio, networking, videojuegos
  ((SELECT id FROM usuarios WHERE email='miguel@housie.com'), (SELECT id FROM intereses WHERE nombre='Gimnasio')),
  ((SELECT id FROM usuarios WHERE email='miguel@housie.com'), (SELECT id FROM intereses WHERE nombre='Videojuegos')),
  ((SELECT id FROM usuarios WHERE email='miguel@housie.com'), (SELECT id FROM intereses WHERE nombre='Networking')),
  -- natalia: yoga, meditación, viajes
  ((SELECT id FROM usuarios WHERE email='natalia@housie.com'), (SELECT id FROM intereses WHERE nombre='Yoga')),
  ((SELECT id FROM usuarios WHERE email='natalia@housie.com'), (SELECT id FROM intereses WHERE nombre='Viajes')),
  ((SELECT id FROM usuarios WHERE email='natalia@housie.com'), (SELECT id FROM intereses WHERE nombre='Meditación')),
  -- sergio: running, gimnasio, networking
  ((SELECT id FROM usuarios WHERE email='sergio@housie.com'), (SELECT id FROM intereses WHERE nombre='Gimnasio')),
  ((SELECT id FROM usuarios WHERE email='sergio@housie.com'), (SELECT id FROM intereses WHERE nombre='Running')),
  ((SELECT id FROM usuarios WHERE email='sergio@housie.com'), (SELECT id FROM intereses WHERE nombre='Networking')),
  -- cristina: yoga, cocina en casa, meditación
  ((SELECT id FROM usuarios WHERE email='cristina@housie.com'), (SELECT id FROM intereses WHERE nombre='Yoga')),
  ((SELECT id FROM usuarios WHERE email='cristina@housie.com'), (SELECT id FROM intereses WHERE nombre='Cocina en casa')),
  ((SELECT id FROM usuarios WHERE email='cristina@housie.com'), (SELECT id FROM intereses WHERE nombre='Meditación')),
  -- alvaro: videojuegos, cine, festivales
  ((SELECT id FROM usuarios WHERE email='alvaro@housie.com'), (SELECT id FROM intereses WHERE nombre='Cine')),
  ((SELECT id FROM usuarios WHERE email='alvaro@housie.com'), (SELECT id FROM intereses WHERE nombre='Videojuegos')),
  ((SELECT id FROM usuarios WHERE email='alvaro@housie.com'), (SELECT id FROM intereses WHERE nombre='Festivales')),
  -- marta: fotografía, teatro, música en directo
  ((SELECT id FROM usuarios WHERE email='marta@housie.com'), (SELECT id FROM intereses WHERE nombre='Teatro')),
  ((SELECT id FROM usuarios WHERE email='marta@housie.com'), (SELECT id FROM intereses WHERE nombre='Música en directo')),
  ((SELECT id FROM usuarios WHERE email='marta@housie.com'), (SELECT id FROM intereses WHERE nombre='Fotografía')),
  -- diego: surf, running, viajes
  ((SELECT id FROM usuarios WHERE email='diego@housie.com'), (SELECT id FROM intereses WHERE nombre='Running')),
  ((SELECT id FROM usuarios WHERE email='diego@housie.com'), (SELECT id FROM intereses WHERE nombre='Viajes')),
  ((SELECT id FROM usuarios WHERE email='diego@housie.com'), (SELECT id FROM intereses WHERE nombre='Surf')),
  -- valeria: yoga, vegano, meditación
  ((SELECT id FROM usuarios WHERE email='valeria@housie.com'), (SELECT id FROM intereses WHERE nombre='Yoga')),
  ((SELECT id FROM usuarios WHERE email='valeria@housie.com'), (SELECT id FROM intereses WHERE nombre='Vegano')),
  ((SELECT id FROM usuarios WHERE email='valeria@housie.com'), (SELECT id FROM intereses WHERE nombre='Meditación')),
  -- hugo: gimnasio, surf, networking
  ((SELECT id FROM usuarios WHERE email='hugo@housie.com'), (SELECT id FROM intereses WHERE nombre='Gimnasio')),
  ((SELECT id FROM usuarios WHERE email='hugo@housie.com'), (SELECT id FROM intereses WHERE nombre='Networking')),
  ((SELECT id FROM usuarios WHERE email='hugo@housie.com'), (SELECT id FROM intereses WHERE nombre='Surf')),
  -- irene: teatro, cine, fotografía
  ((SELECT id FROM usuarios WHERE email='irene@housie.com'), (SELECT id FROM intereses WHERE nombre='Cine')),
  ((SELECT id FROM usuarios WHERE email='irene@housie.com'), (SELECT id FROM intereses WHERE nombre='Teatro')),
  ((SELECT id FROM usuarios WHERE email='irene@housie.com'), (SELECT id FROM intereses WHERE nombre='Fotografía')),
  -- ruben: festivales, música en directo, surf
  ((SELECT id FROM usuarios WHERE email='ruben@housie.com'), (SELECT id FROM intereses WHERE nombre='Música en directo')),
  ((SELECT id FROM usuarios WHERE email='ruben@housie.com'), (SELECT id FROM intereses WHERE nombre='Festivales')),
  ((SELECT id FROM usuarios WHERE email='ruben@housie.com'), (SELECT id FROM intereses WHERE nombre='Surf'))
ON CONFLICT (usuario_id, interes_id) DO NOTHING;

-- =================================================================
-- ACCESO — contraseña de todos: housie123
--
-- GRANADA  (miembro: GRA001 | casero: GRC001)
--   maria@housie.com   → ADMIN
--   carlos@housie.com  → MEMBER
--   ana@housie.com     → MEMBER
--   roberto@housie.com → Casero (/casero/facturas con 6 meses de historial)
--
-- MADRID   (miembro: MAD002 | casero: MDC002)
--   david@housie.com   → ADMIN
--   laura@housie.com   → MEMBER
--   elena@housie.com   → Casero
--
-- BARCELONA (miembro: BCN003 | casero: BCC003)
--   javier@housie.com  → ADMIN
--   sofia@housie.com   → MEMBER
--
-- SIN GRUPO
--   pablo@housie.com   → chat activo con Granada, favoritos guardados
--   isabel@housie.com  → solicitud pendiente en Barcelona
-- =================================================================

-- ===== 3. FECHAS AJUSTADAS AL DIA DE EJECUCION ===================
DO $$
DECLARE d INT;
BEGIN
  SELECT CURRENT_DATE - MAX(fecha_emision) INTO d FROM facturas;
  UPDATE facturas SET fecha_emision = fecha_emision + d, fecha_vencimiento = fecha_vencimiento + d;
  UPDATE pagos_factura SET fecha_pago = fecha_pago + (d || ' days')::interval WHERE fecha_pago IS NOT NULL;
  UPDATE eventos SET fecha_inicio = fecha_inicio + (d || ' days')::interval,
                     fecha_fin    = fecha_fin    + (d || ' days')::interval;
END $$;
UPDATE asignaciones_tarea SET semana = date_trunc('week', CURRENT_DATE)::date;
UPDATE grupos SET rotacion_semana_actual = date_trunc('week', CURRENT_DATE)::date
  WHERE rotacion_semana_actual IS NOT NULL;

-- ===== 4. COORDENADAS PARA EL MAPA ===============================
UPDATE publicaciones p SET
  latitud  = c.lat + (random() - 0.5) * 0.012,
  longitud = c.lng + (random() - 0.5) * 0.012
FROM (VALUES
  ('Granada',37.1773,-3.5986), ('Madrid',40.4168,-3.7038),
  ('Barcelona',41.3874,2.1686), ('Valencia',39.4699,-0.3763),
  ('Sevilla',37.3891,-5.9845),  ('Málaga',36.7213,-4.4214),
  ('Zaragoza',41.6488,-0.8891), ('Bilbao',43.2630,-2.9350),
  ('Alicante',38.3452,-0.4810), ('Murcia',37.9922,-1.1307),
  ('Córdoba',37.8882,-4.7794),  ('Valladolid',41.6523,-4.7245),
  ('Salamanca',40.9701,-5.6635),('Palma',39.5696,2.6502)
) AS c(ciudad,lat,lng)
WHERE p.ciudad = c.ciudad AND p.latitud IS NULL;

COMMIT;
