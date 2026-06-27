-- =================================================================
-- SEED DEMO CONVIVENCIA — grupo 074301e3-0cb1-4b0f-bd23-d994a0bfc0d8
-- Datos de demostración para presentación TFG
-- Módulos: Tareas · Lista de la compra · Eventos · Facturas · Chats
-- Idempotente: ON CONFLICT ... DO NOTHING en todos los bloques
--
-- Miembros existentes (NO se crean aquí):
--   ADMIN   → 2bb30d66-6677-4189-adf4-85d9efef9751  (marioiv)
--   CASERO  → 49286992-a831-4d26-ae39-ae6974bf0d05
-- Se crean 2 inquilinos de demo nuevos.
-- =================================================================

-- =================================================================
-- USUARIOS DE DEMO (2 inquilinos nuevos)
-- =================================================================

INSERT INTO usuarios (id, nombre, email, password) VALUES
  ('dd000001-0000-4000-8000-000000000002', 'Javier López', 'javier_demo@housie.com', crypt('housie123', gen_salt('bf', 10))),
  ('dd000001-0000-4000-8000-000000000003', 'Sofía Ruiz',   'sofia_demo@housie.com',  crypt('housie123', gen_salt('bf', 10))),
  ('dd000001-0000-4000-8000-000000000004', 'Ana García',   'ana_demo@housie.com',    crypt('housie123', gen_salt('bf', 10)))
ON CONFLICT (email) DO NOTHING;

-- =================================================================
-- PERFILES CONVIVENCIA USUARIOS DEMO
-- =================================================================

INSERT INTO perfiles_convivencia_usuario
  (id, usuario_id, pais, genero, fecha_nacimiento, ocupacion, horario,
   frecuencia_visitas, ambiente, tolerancia_fiestas, frecuencia_salidas,
   fumador, acepta_fumadores, tiene_mascotas, acepta_mascotas, lgbtq_friendly, sobre_mi)
VALUES
  ('dp000001-0000-4000-8000-000000000002',
   'dd000001-0000-4000-8000-000000000002',
   'España','Hombre','1999-07-22','ESTUDIO','INTERMEDIO','CASI_NUNCA','TRANQUILO',
   'NUNCA','OCASIONAL',FALSE,'NO',FALSE,'NO',TRUE,
   'Estudiante de Ingeniería Informática. Tranquilo y ordenado. Me gusta cocinar los fines de semana.'),

  ('dp000001-0000-4000-8000-000000000003',
   'dd000001-0000-4000-8000-000000000003',
   'España','Mujer','2001-11-08','ESTUDIO','NOCTURNO','A_VECES','SOCIAL',
   'OCASIONAL','FRECUENTE',FALSE,'INDIFERENTE',FALSE,'SI',TRUE,
   'Estudiante de Bellas Artes. Creativa y sociable. Respeto siempre el horario de silencio.'),

  ('dp000001-0000-4000-8000-000000000004',
   'dd000001-0000-4000-8000-000000000004',
   'España','Mujer','2000-05-30','TRABAJO','MADRUGADOR','A_VECES','EQUILIBRADO',
   'OCASIONAL','OCASIONAL',FALSE,'NO',FALSE,'DEPENDE',TRUE,
   'Trabajo en diseño gráfico. Me gusta tener el piso limpio y organizado. Tranquila y respetuosa.')
ON CONFLICT (usuario_id) DO NOTHING;

-- =================================================================
-- MIEMBROS DEL GRUPO (solo los nuevos — marioiv y el casero ya están)
-- =================================================================

INSERT INTO miembros_grupo (id, usuario_id, grupo_id, rol, es_casero) VALUES
  ('dm000001-0000-4000-8000-000000000002',
   'dd000001-0000-4000-8000-000000000002',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8', 'MEMBER', FALSE),
  ('dm000001-0000-4000-8000-000000000003',
   'dd000001-0000-4000-8000-000000000003',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8', 'MEMBER', FALSE),
  ('dm000001-0000-4000-8000-000000000004',
   'dd000001-0000-4000-8000-000000000004',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8', 'MEMBER', FALSE)
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- ROTACIÓN DE TAREAS — activar el sistema en el grupo
-- =================================================================

UPDATE grupos
SET semana_rotacion = 2, rotacion_semana_actual = '2026-06-08'
WHERE id = '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8';

-- =================================================================
-- ZONAS DE LIMPIEZA
-- Limpiamos primero para evitar duplicados si el grupo ya tenía zonas creadas
-- =================================================================

DELETE FROM asignaciones_tarea
WHERE tarea_id IN (
  SELECT id FROM tareas
  WHERE grupo_id = '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8' AND es_recurrente = TRUE
);

DELETE FROM tareas
WHERE grupo_id = '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8' AND es_recurrente = TRUE;

INSERT INTO tareas (id, grupo_id, nombre, descripcion, es_recurrente) VALUES
  ('td000001-0000-4000-8000-000000000001',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'Cocina',  'Fregar, encimera, microondas y suelo', TRUE),
  ('td000001-0000-4000-8000-000000000002',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'Baño',    'WC, ducha, lavabo y suelo',            TRUE),
  ('td000001-0000-4000-8000-000000000003',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'Salón',   'Polvo, aspirar y fregar suelo',        TRUE),
  ('td000001-0000-4000-8000-000000000004',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'Pasillo', 'Barrer y fregar suelo, espejos',       TRUE)
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- ASIGNACIONES SEMANA ACTUAL (lunes 2026-06-08, semana_rotacion=2)
-- marioiv → Salón   (idx 0, zona (0+2)%4=2) COMPLETADA
-- Javier  → Pasillo (idx 1, zona (1+2)%4=3) PENDIENTE
-- Sofía   → Cocina  (idx 2, zona (2+2)%4=0) COMPLETADA
-- Ana     → Baño    (idx 3, zona (3+2)%4=1) PENDIENTE
-- =================================================================

INSERT INTO asignaciones_tarea (id, tarea_id, usuario_id, semana, estado) VALUES
  ('ta000002-0000-4000-8000-000000000001',
   'td000001-0000-4000-8000-000000000003',
   '2bb30d66-6677-4189-adf4-85d9efef9751', '2026-06-08', 'COMPLETADA'),
  ('ta000002-0000-4000-8000-000000000002',
   'td000001-0000-4000-8000-000000000004',
   'dd000001-0000-4000-8000-000000000002', '2026-06-08', 'PENDIENTE'),
  ('ta000002-0000-4000-8000-000000000003',
   'td000001-0000-4000-8000-000000000001',
   'dd000001-0000-4000-8000-000000000003', '2026-06-08', 'COMPLETADA'),
  ('ta000002-0000-4000-8000-000000000009',
   'td000001-0000-4000-8000-000000000002',
   'dd000001-0000-4000-8000-000000000004', '2026-06-08', 'PENDIENTE')
ON CONFLICT (tarea_id, usuario_id, semana) DO NOTHING;

-- Semana anterior (2026-06-01, semana_rotacion=1) — todas completadas
-- marioiv → Baño    (idx 0, zona (0+1)%4=1)
-- Javier  → Salón   (idx 1, zona (1+1)%4=2)
-- Sofía   → Pasillo (idx 2, zona (2+1)%4=3)
-- Ana     → Cocina  (idx 3, zona (3+1)%4=0)
INSERT INTO asignaciones_tarea (id, tarea_id, usuario_id, semana, estado) VALUES
  ('ta000002-0000-4000-8000-000000000004',
   'td000001-0000-4000-8000-000000000002',
   '2bb30d66-6677-4189-adf4-85d9efef9751', '2026-06-01', 'COMPLETADA'),
  ('ta000002-0000-4000-8000-000000000005',
   'td000001-0000-4000-8000-000000000003',
   'dd000001-0000-4000-8000-000000000002', '2026-06-01', 'COMPLETADA'),
  ('ta000002-0000-4000-8000-000000000006',
   'td000001-0000-4000-8000-000000000004',
   'dd000001-0000-4000-8000-000000000003', '2026-06-01', 'COMPLETADA'),
  ('ta000002-0000-4000-8000-000000000010',
   'td000001-0000-4000-8000-000000000001',
   'dd000001-0000-4000-8000-000000000004', '2026-06-01', 'COMPLETADA')
ON CONFLICT (tarea_id, usuario_id, semana) DO NOTHING;

-- =================================================================
-- LISTA DE LA COMPRA
-- =================================================================

INSERT INTO productos (id, grupo_id, anadido_por_id, nombre, cantidad, unidad_medida, categoria, comprado) VALUES
  ('pr000002-0000-4000-8000-000000000001',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   '2bb30d66-6677-4189-adf4-85d9efef9751',
   'Leche entera',        2,   'litros',   'comida',   FALSE),
  ('pr000002-0000-4000-8000-000000000002',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   '2bb30d66-6677-4189-adf4-85d9efef9751',
   'Pasta (espaguetis)',  500, 'gramos',   'comida',   FALSE),
  ('pr000002-0000-4000-8000-000000000003',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'dd000001-0000-4000-8000-000000000002',
   'Detergente lavadora', 1,   'bote',     'limpieza', FALSE),
  ('pr000002-0000-4000-8000-000000000004',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'dd000001-0000-4000-8000-000000000002',
   'Papel higiénico',    12,   'rollos',   'hogar',    FALSE),
  ('pr000002-0000-4000-8000-000000000005',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'dd000001-0000-4000-8000-000000000003',
   'Tomates',             1,   'kg',       'comida',   FALSE),
  ('pr000002-0000-4000-8000-000000000006',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'dd000001-0000-4000-8000-000000000003',
   'Aceite de oliva',     1,   'litro',    'comida',   TRUE),
  ('pr000002-0000-4000-8000-000000000007',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   '2bb30d66-6677-4189-adf4-85d9efef9751',
   'Jabón friegaplatos',  2,   'botes',    'limpieza', TRUE),
  ('pr000002-0000-4000-8000-000000000008',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'dd000001-0000-4000-8000-000000000002',
   'Esponjas',            4,   'unidades', 'limpieza', TRUE)
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- EVENTOS DEL GRUPO
-- =================================================================

INSERT INTO eventos (id, grupo_id, creado_por_id, titulo, descripcion, fecha_inicio, fecha_fin) VALUES
  ('ev000002-0000-4000-8000-000000000001',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   '2bb30d66-6677-4189-adf4-85d9efef9751',
   'Reunión mensual de piso',
   'Revisamos gastos de mayo, turnos de limpieza y decidimos el día de la barbacoa.',
   '2026-05-28 20:00:00', '2026-05-28 21:30:00'),

  ('ev000002-0000-4000-8000-000000000002',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'dd000001-0000-4000-8000-000000000002',
   'Visita técnico calefacción',
   'Revisión anual de la caldera. Hay que estar en casa entre las 10 y las 12.',
   '2026-06-03 10:00:00', '2026-06-03 12:00:00'),

  ('ev000002-0000-4000-8000-000000000003',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   '2bb30d66-6677-4189-adf4-85d9efef9751',
   'Pago del alquiler — junio',
   'Recordatorio: transferir la parte del alquiler antes del día 15.',
   '2026-06-15 09:00:00', '2026-06-15 09:30:00'),

  ('ev000002-0000-4000-8000-000000000004',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'dd000001-0000-4000-8000-000000000003',
   'Limpieza general de verano',
   'Limpieza profunda antes de las vacaciones: ventanas, nevera, trastero y balcón.',
   '2026-06-21 11:00:00', '2026-06-21 14:00:00'),

  ('ev000002-0000-4000-8000-000000000005',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   'dd000001-0000-4000-8000-000000000002',
   'Barbacoa de verano',
   'Celebramos el fin de los exámenes. Cada uno trae algo para picar y bebida.',
   '2026-07-05 19:00:00', '2026-07-05 23:30:00')
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- FACTURAS (creadas por el casero existente)
-- Alquiler 900€ ÷ 4 inquilinos = 225€/persona
-- =================================================================

INSERT INTO facturas (id, grupo_id, casero_id, tipo, descripcion, importe_total, fecha_emision, fecha_vencimiento) VALUES
  ('fa000002-0000-4000-8000-000000000001',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   '49286992-a831-4d26-ae39-ae6974bf0d05',
   'ALQUILER', 'Alquiler abril 2026', 900.00, '2026-04-01', '2026-04-05'),

  ('fa000002-0000-4000-8000-000000000002',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   '49286992-a831-4d26-ae39-ae6974bf0d05',
   'ALQUILER', 'Alquiler mayo 2026', 900.00, '2026-05-01', '2026-05-05'),

  ('fa000002-0000-4000-8000-000000000003',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   '49286992-a831-4d26-ae39-ae6974bf0d05',
   'LUZ', 'Electricidad mar-abr 2026', 87.60, '2026-04-10', '2026-04-20'),

  ('fa000002-0000-4000-8000-000000000004',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   '49286992-a831-4d26-ae39-ae6974bf0d05',
   'ALQUILER', 'Alquiler junio 2026', 900.00, '2026-06-01', '2026-06-05'),

  ('fa000002-0000-4000-8000-000000000005',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8',
   '49286992-a831-4d26-ae39-ae6974bf0d05',
   'INTERNET', 'Fibra óptica junio 2026', 45.00, '2026-06-01', '2026-06-10')
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- PAGOS — alquiler abril (todos pagados, 225€/persona)
-- =================================================================

INSERT INTO pagos_factura (id, factura_id, usuario_id, importe_asignado, pagado, fecha_pago) VALUES
  ('pf000002-0000-4000-8000-000000000001',
   'fa000002-0000-4000-8000-000000000001',
   '2bb30d66-6677-4189-adf4-85d9efef9751', 225.00, TRUE, '2026-04-03 10:00:00'),
  ('pf000002-0000-4000-8000-000000000002',
   'fa000002-0000-4000-8000-000000000001',
   'dd000001-0000-4000-8000-000000000002', 225.00, TRUE, '2026-04-04 11:00:00'),
  ('pf000002-0000-4000-8000-000000000003',
   'fa000002-0000-4000-8000-000000000001',
   'dd000001-0000-4000-8000-000000000003', 225.00, TRUE, '2026-04-03 09:30:00'),
  ('pf000002-0000-4000-8000-000000000016',
   'fa000002-0000-4000-8000-000000000001',
   'dd000001-0000-4000-8000-000000000004', 225.00, TRUE, '2026-04-05 08:00:00')
ON CONFLICT (factura_id, usuario_id) DO NOTHING;

-- =================================================================
-- PAGOS — alquiler mayo (todos pagados, 225€/persona)
-- =================================================================

INSERT INTO pagos_factura (id, factura_id, usuario_id, importe_asignado, pagado, fecha_pago) VALUES
  ('pf000002-0000-4000-8000-000000000004',
   'fa000002-0000-4000-8000-000000000002',
   '2bb30d66-6677-4189-adf4-85d9efef9751', 225.00, TRUE, '2026-05-02 10:00:00'),
  ('pf000002-0000-4000-8000-000000000005',
   'fa000002-0000-4000-8000-000000000002',
   'dd000001-0000-4000-8000-000000000002', 225.00, TRUE, '2026-05-03 14:00:00'),
  ('pf000002-0000-4000-8000-000000000006',
   'fa000002-0000-4000-8000-000000000002',
   'dd000001-0000-4000-8000-000000000003', 225.00, TRUE, '2026-05-04 09:00:00'),
  ('pf000002-0000-4000-8000-000000000017',
   'fa000002-0000-4000-8000-000000000002',
   'dd000001-0000-4000-8000-000000000004', 225.00, TRUE, '2026-05-02 18:00:00')
ON CONFLICT (factura_id, usuario_id) DO NOTHING;

-- =================================================================
-- PAGOS — luz mar-abr (todos pagados, 21.90€/persona)
-- =================================================================

INSERT INTO pagos_factura (id, factura_id, usuario_id, importe_asignado, pagado, fecha_pago) VALUES
  ('pf000002-0000-4000-8000-000000000007',
   'fa000002-0000-4000-8000-000000000003',
   '2bb30d66-6677-4189-adf4-85d9efef9751', 21.90, TRUE, '2026-04-12 10:00:00'),
  ('pf000002-0000-4000-8000-000000000008',
   'fa000002-0000-4000-8000-000000000003',
   'dd000001-0000-4000-8000-000000000002', 21.90, TRUE, '2026-04-14 11:00:00'),
  ('pf000002-0000-4000-8000-000000000009',
   'fa000002-0000-4000-8000-000000000003',
   'dd000001-0000-4000-8000-000000000003', 21.90, TRUE, '2026-04-13 09:00:00'),
  ('pf000002-0000-4000-8000-000000000018',
   'fa000002-0000-4000-8000-000000000003',
   'dd000001-0000-4000-8000-000000000004', 21.90, TRUE, '2026-04-15 12:00:00')
ON CONFLICT (factura_id, usuario_id) DO NOTHING;

-- =================================================================
-- PAGOS — alquiler junio (marioiv y Ana pagaron, Javier y Sofía pendientes)
-- =================================================================

INSERT INTO pagos_factura (id, factura_id, usuario_id, importe_asignado, pagado, fecha_pago) VALUES
  ('pf000002-0000-4000-8000-000000000010',
   'fa000002-0000-4000-8000-000000000004',
   '2bb30d66-6677-4189-adf4-85d9efef9751', 225.00, TRUE, '2026-06-02 10:00:00'),
  ('pf000002-0000-4000-8000-000000000019',
   'fa000002-0000-4000-8000-000000000004',
   'dd000001-0000-4000-8000-000000000004', 225.00, TRUE, '2026-06-03 09:00:00')
ON CONFLICT (factura_id, usuario_id) DO NOTHING;

INSERT INTO pagos_factura (id, factura_id, usuario_id, importe_asignado, pagado) VALUES
  ('pf000002-0000-4000-8000-000000000011',
   'fa000002-0000-4000-8000-000000000004',
   'dd000001-0000-4000-8000-000000000002', 225.00, FALSE),
  ('pf000002-0000-4000-8000-000000000012',
   'fa000002-0000-4000-8000-000000000004',
   'dd000001-0000-4000-8000-000000000003', 225.00, FALSE)
ON CONFLICT (factura_id, usuario_id) DO NOTHING;

-- =================================================================
-- PAGOS — internet junio (todos pendientes, 11.25€/persona)
-- =================================================================

INSERT INTO pagos_factura (id, factura_id, usuario_id, importe_asignado, pagado) VALUES
  ('pf000002-0000-4000-8000-000000000013',
   'fa000002-0000-4000-8000-000000000005',
   '2bb30d66-6677-4189-adf4-85d9efef9751', 11.25, FALSE),
  ('pf000002-0000-4000-8000-000000000014',
   'fa000002-0000-4000-8000-000000000005',
   'dd000001-0000-4000-8000-000000000002', 11.25, FALSE),
  ('pf000002-0000-4000-8000-000000000015',
   'fa000002-0000-4000-8000-000000000005',
   'dd000001-0000-4000-8000-000000000003', 11.25, FALSE),
  ('pf000002-0000-4000-8000-000000000020',
   'fa000002-0000-4000-8000-000000000005',
   'dd000001-0000-4000-8000-000000000004', 11.25, FALSE)
ON CONFLICT (factura_id, usuario_id) DO NOTHING;

-- =================================================================
-- MÓDULO DE CHATS
-- 3 solicitantes externos + solicitudes en distintos estados + chats con mensajes
-- =================================================================

-- Usuarios solicitantes (externos, no pertenecen al grupo)
INSERT INTO usuarios (id, nombre, email, password) VALUES
  ('so000001-0000-4000-8000-000000000001', 'Laura Sánchez', 'laura_sol@housie.com',  crypt('housie123', gen_salt('bf', 10))),
  ('so000001-0000-4000-8000-000000000002', 'Marcos Vega',   'marcos_sol@housie.com', crypt('housie123', gen_salt('bf', 10))),
  ('so000001-0000-4000-8000-000000000003', 'Elena Torres',  'elena_sol@housie.com',  crypt('housie123', gen_salt('bf', 10)))
ON CONFLICT (email) DO NOTHING;

-- =================================================================
-- SOLICITUDES DE CONTACTO
-- Laura → ACEPTADA (chat activo)
-- Marcos → ACEPTADA (chat activo)
-- Elena → PENDIENTE (aún sin respuesta)
-- =================================================================

INSERT INTO solicitudes_contacto (id, usuario_id, grupo_id, estado, fecha_envio) VALUES
  ('sc000001-0000-4000-8000-000000000001',
   'so000001-0000-4000-8000-000000000001',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8', 'ACEPTADA',  '2026-05-20 10:15:00'),
  ('sc000001-0000-4000-8000-000000000002',
   'so000001-0000-4000-8000-000000000002',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8', 'ACEPTADA',  '2026-05-25 16:30:00'),
  ('sc000001-0000-4000-8000-000000000003',
   'so000001-0000-4000-8000-000000000003',
   '074301e3-0cb1-4b0f-bd23-d994a0bfc0d8', 'PENDIENTE', '2026-06-09 09:00:00')
ON CONFLICT (usuario_id, grupo_id) DO NOTHING;

-- =================================================================
-- CHATS (uno por solicitud aceptada)
-- =================================================================

INSERT INTO chats (id, solicitud_id, estado) VALUES
  ('ch000001-0000-4000-8000-000000000001',
   'sc000001-0000-4000-8000-000000000001', 'ACTIVO'),
  ('ch000001-0000-4000-8000-000000000002',
   'sc000001-0000-4000-8000-000000000002', 'ACTIVO')
ON CONFLICT (solicitud_id) DO NOTHING;

-- =================================================================
-- MENSAJES — chat con Laura
-- =================================================================

INSERT INTO mensajes (id, chat_id, remitente_id, contenido, enviado_en) VALUES
  ('ms000001-0000-4000-8000-000000000001',
   'ch000001-0000-4000-8000-000000000001',
   'so000001-0000-4000-8000-000000000001',
   '¡Hola! Vi vuestro anuncio y me encantó el piso. ¿Seguís buscando compañero/a?',
   '2026-05-20 10:20:00'),
  ('ms000001-0000-4000-8000-000000000002',
   'ch000001-0000-4000-8000-000000000001',
   '2bb30d66-6677-4189-adf4-85d9efef9751',
   '¡Hola Laura! Sí, todavía estamos buscando. ¿Cuándo te vendría bien venir a verlo?',
   '2026-05-20 11:05:00'),
  ('ms000001-0000-4000-8000-000000000003',
   'ch000001-0000-4000-8000-000000000001',
   'so000001-0000-4000-8000-000000000001',
   'Perfecto, ¿os va bien el sábado por la mañana? Sobre las 11h.',
   '2026-05-20 11:30:00'),
  ('ms000001-0000-4000-8000-000000000004',
   'ch000001-0000-4000-8000-000000000001',
   '2bb30d66-6677-4189-adf4-85d9efef9751',
   'El sábado nos va genial. Te mandamos la dirección por aquí. ¡Hasta el sábado!',
   '2026-05-20 12:00:00'),
  ('ms000001-0000-4000-8000-000000000005',
   'ch000001-0000-4000-8000-000000000001',
   'so000001-0000-4000-8000-000000000001',
   'Estuve viendo el piso y me pareció muy bien. ¿Cuándo necesitáis una respuesta definitiva?',
   '2026-05-24 18:45:00'),
  ('ms000001-0000-4000-8000-000000000006',
   'ch000001-0000-4000-8000-000000000001',
   '2bb30d66-6677-4189-adf4-85d9efef9751',
   'Nos alegramos de que te gustara. Tenemos otra visita esta semana, así que idealmente antes del viernes.',
   '2026-05-24 19:20:00')
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- MENSAJES — chat con Marcos
-- =================================================================

INSERT INTO mensajes (id, chat_id, remitente_id, contenido, enviado_en) VALUES
  ('ms000001-0000-4000-8000-000000000007',
   'ch000001-0000-4000-8000-000000000002',
   'so000001-0000-4000-8000-000000000002',
   'Buenas, me interesa mucho el piso. Soy estudiante de último año, tranquilo y ordenado.',
   '2026-05-25 16:35:00'),
  ('ms000001-0000-4000-8000-000000000008',
   'ch000001-0000-4000-8000-000000000002',
   '2bb30d66-6677-4189-adf4-85d9efef9751',
   '¡Hola Marcos! Encantados. ¿Tienes disponibilidad esta semana para una visita?',
   '2026-05-25 17:10:00'),
  ('ms000001-0000-4000-8000-000000000009',
   'ch000001-0000-4000-8000-000000000002',
   'so000001-0000-4000-8000-000000000002',
   'Sí, el miércoles o jueves me viene bien por las tardes.',
   '2026-05-25 17:25:00'),
  ('ms000001-0000-4000-8000-000000000010',
   'ch000001-0000-4000-8000-000000000002',
   '2bb30d66-6677-4189-adf4-85d9efef9751',
   'Quedamos el jueves a las 18h entonces. ¡Hasta entonces!',
   '2026-05-25 18:00:00'),
  ('ms000001-0000-4000-8000-000000000011',
   'ch000001-0000-4000-8000-000000000002',
   'so000001-0000-4000-8000-000000000002',
   'Una pregunta: ¿el precio incluye los suministros o va aparte?',
   '2026-06-01 10:00:00'),
  ('ms000001-0000-4000-8000-000000000012',
   'ch000001-0000-4000-8000-000000000002',
   '2bb30d66-6677-4189-adf4-85d9efef9751',
   'Va aparte, pero los dividimos entre todos equitativamente. Suelen salir unos 50-60€/mes extra.',
   '2026-06-01 10:30:00')
ON CONFLICT (id) DO NOTHING;
