-- ============================================================
-- DROP (orden inverso a las FKs)
-- ============================================================
DROP TABLE IF EXISTS grupo_intereses CASCADE;
DROP TABLE IF EXISTS usuario_intereses CASCADE;
DROP TABLE IF EXISTS intereses CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;
DROP TABLE IF EXISTS pagos_factura CASCADE;
DROP TABLE IF EXISTS facturas CASCADE;
DROP TABLE IF EXISTS asignaciones_tarea CASCADE;
DROP TABLE IF EXISTS tareas CASCADE;
DROP TABLE IF EXISTS mensajes CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS solicitudes_contacto CASCADE;
DROP TABLE IF EXISTS favoritos CASCADE;
DROP TABLE IF EXISTS fotos_publicacion CASCADE;
DROP TABLE IF EXISTS publicaciones CASCADE;
DROP TABLE IF EXISTS preferencias_companero CASCADE;
DROP TABLE IF EXISTS perfiles_convivencia_grupo CASCADE;
DROP TABLE IF EXISTS perfiles_convivencia_usuario CASCADE;
DROP TABLE IF EXISTS miembros_grupo CASCADE;
DROP TABLE IF EXISTS grupos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS rol_grupo CASCADE;
DROP TYPE IF EXISTS ocupacion_enum CASCADE;
DROP TYPE IF EXISTS horario_enum CASCADE;
DROP TYPE IF EXISTS frecuencia_visitas_enum CASCADE;
DROP TYPE IF EXISTS ambiente_enum CASCADE;
DROP TYPE IF EXISTS frecuencia_fiestas_enum CASCADE;
DROP TYPE IF EXISTS acepta_fumadores_enum CASCADE;
DROP TYPE IF EXISTS acepta_mascotas_enum CASCADE;
DROP TYPE IF EXISTS dia_semana_enum CASCADE;
DROP TYPE IF EXISTS estado_tarea_enum CASCADE;
DROP TYPE IF EXISTS tipo_division_enum CASCADE;
DROP TYPE IF EXISTS tipo_factura_enum CASCADE;
DROP TYPE IF EXISTS estado_solicitud_enum CASCADE;
DROP TYPE IF EXISTS estado_chat_enum CASCADE;

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE rol_grupo AS ENUM ('ADMIN', 'MEMBER');
CREATE TYPE ocupacion_enum AS ENUM ('ESTUDIO', 'TRABAJO', 'ESTUDIO_Y_TRABAJO');
CREATE TYPE horario_enum AS ENUM ('MADRUGADOR', 'INTERMEDIO', 'NOCTURNO');
CREATE TYPE frecuencia_visitas_enum AS ENUM ('CASI_NUNCA', 'A_VECES', 'FRECUENTE');
CREATE TYPE ambiente_enum AS ENUM ('TRANQUILO', 'EQUILIBRADO', 'SOCIAL');
CREATE TYPE frecuencia_fiestas_enum AS ENUM ('NUNCA', 'OCASIONAL', 'FRECUENTE');
CREATE TYPE acepta_fumadores_enum AS ENUM ('SI', 'NO', 'INDIFERENTE');
CREATE TYPE acepta_mascotas_enum AS ENUM ('SI', 'NO', 'DEPENDE');
CREATE TYPE dia_semana_enum AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');
CREATE TYPE estado_tarea_enum AS ENUM ('PENDIENTE', 'COMPLETADA', 'VALIDADA', 'RECHAZADA', 'CANCELADA');
CREATE TYPE tipo_division_enum AS ENUM ('EQUITATIVA', 'PERSONALIZADA');
CREATE TYPE tipo_factura_enum AS ENUM ('AGUA', 'LUZ', 'INTERNET', 'ALQUILER', 'OTRO');
CREATE TYPE estado_solicitud_enum AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');
CREATE TYPE estado_chat_enum AS ENUM ('ACTIVO', 'CERRADO');

-- ============================================================
-- USUARIOS
-- ============================================================
CREATE TABLE usuarios (
  id            VARCHAR(36)  PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password      TEXT,                          -- NULL para usuarios de Google
  foto_perfil   TEXT,
  google_id     VARCHAR(255) UNIQUE,
  google_refresh_token TEXT,
  google_calendar_token TEXT,
  fecha_registro TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GRUPOS
-- ============================================================
CREATE TABLE grupos (
  id                      VARCHAR(36)  PRIMARY KEY,
  nombre                  VARCHAR(100) NOT NULL,
  codigo_acceso           VARCHAR(6)   UNIQUE NOT NULL,
  codigo_casero           VARCHAR(6)   UNIQUE,
  foto_perfil             TEXT,
  descripcion             TEXT         NOT NULL,
  ciudad                  VARCHAR(100),
  buscar_companero        BOOLEAN      DEFAULT FALSE,
  dia_limpieza            dia_semana_enum,
  semana_rotacion         INT          DEFAULT 0,
  rotacion_semana_actual  DATE,
  created_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MIEMBROS_GRUPO  (relación usuario ↔ grupo)
-- ============================================================
CREATE TABLE miembros_grupo (
  id          VARCHAR(36) PRIMARY KEY,
  usuario_id  VARCHAR(36) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  grupo_id    VARCHAR(36) NOT NULL REFERENCES grupos(id)   ON DELETE CASCADE,
  rol         rol_grupo   NOT NULL DEFAULT 'MEMBER',
  es_casero   BOOLEAN     DEFAULT FALSE,
  activo      BOOLEAN     DEFAULT TRUE,
  fecha_union TIMESTAMP   NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, grupo_id)
);

-- ============================================================
-- PERFIL CONVIVENCIA USUARIO
-- ============================================================
CREATE TABLE perfiles_convivencia_usuario (
  id                  VARCHAR(36) PRIMARY KEY,
  usuario_id          VARCHAR(36) UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  pais                VARCHAR(100) DEFAULT 'España',
  genero              VARCHAR(50),
  fecha_nacimiento    DATE,
  ocupacion           ocupacion_enum,
  horario             horario_enum,qui
  frecuencia_visitas  frecuencia_visitas_enum,
  ambiente            ambiente_enum,
  tolerancia_fiestas  frecuencia_fiestas_enum,
  fumador             BOOLEAN,
  acepta_fumadores    acepta_fumadores_enum,
  tiene_mascotas      BOOLEAN,
  acepta_mascotas     acepta_mascotas_enum,
  lgbtq_friendly      BOOLEAN,
  sobre_mi            TEXT         NOT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PREFERENCIAS DE COMPAÑERO (lo que busco en otros)
-- ============================================================
CREATE TABLE preferencias_companero (
  id                       VARCHAR(36) PRIMARY KEY,
  usuario_id               VARCHAR(36) UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  ocupacion                ocupacion_enum,
  ocupacion_req            BOOLEAN DEFAULT FALSE,
  horario                  horario_enum,
  horario_req              BOOLEAN DEFAULT FALSE,
  frecuencia_visitas       frecuencia_visitas_enum,
  frecuencia_visitas_req   BOOLEAN DEFAULT FALSE,
  ambiente                 ambiente_enum,
  ambiente_req             BOOLEAN DEFAULT FALSE,
  tolerancia_fiestas       frecuencia_fiestas_enum,
  tolerancia_fiestas_req   BOOLEAN DEFAULT FALSE,
  acepta_fumadores         acepta_fumadores_enum,
  acepta_fumadores_req     BOOLEAN DEFAULT FALSE,
  acepta_mascotas          acepta_mascotas_enum,
  acepta_mascotas_req      BOOLEAN DEFAULT FALSE,
  lgbtq_friendly           BOOLEAN,
  lgbtq_friendly_req       BOOLEAN DEFAULT FALSE,
  created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PERFIL CONVIVENCIA GRUPO
-- ============================================================
CREATE TABLE perfiles_convivencia_grupo (
  id                  VARCHAR(36) PRIMARY KEY,
  grupo_id            VARCHAR(36) UNIQUE NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  ocupacion           ocupacion_enum,
  horario             horario_enum,
  frecuencia_visitas  frecuencia_visitas_enum,
  ambiente            ambiente_enum,
  tolerancia_fiestas  frecuencia_fiestas_enum,
  acepta_fumadores    acepta_fumadores_enum,
  acepta_mascotas     acepta_mascotas_enum,
  lgbtq_friendly      BOOLEAN,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PUBLICACIONES
-- ============================================================
CREATE TABLE publicaciones (
  id                     VARCHAR(36)     PRIMARY KEY,
  grupo_id               VARCHAR(36)     UNIQUE NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  -- Paso 1: Información general
  titulo                 VARCHAR(255)    NOT NULL,
  descripcion            TEXT            NOT NULL,
  ciudad                 VARCHAR(100)    NOT NULL,
  direccion              VARCHAR(255),
  piso_puerta            VARCHAR(50),
  precio                 DECIMAL(10,2)   NOT NULL,
  habitaciones_libres    INT             DEFAULT 1,
  -- Paso 2: Características
  tipo_piso              VARCHAR(50),
  habitaciones_totales   INT,
  tamano_piso            DECIMAL(10,2),
  planta                 INT,
  ascensor               BOOLEAN         DEFAULT FALSE,
  -- Paso 3: Comodidades
  wifi                   BOOLEAN         DEFAULT FALSE,
  lavadora               BOOLEAN         DEFAULT FALSE,
  lavavajillas           BOOLEAN         DEFAULT FALSE,
  aire_acondicionado     BOOLEAN         DEFAULT FALSE,
  calefaccion            BOOLEAN         DEFAULT FALSE,
  parking                BOOLEAN         DEFAULT FALSE,
  terraza                BOOLEAN         DEFAULT FALSE,
  amueblado              BOOLEAN         DEFAULT FALSE,
  -- Paso 4: Normas de la casa
  permite_fumar          BOOLEAN         DEFAULT FALSE,
  permite_mascotas       BOOLEAN         DEFAULT FALSE,
  genero_preferido       VARCHAR(50),
  normas_adicionales     TEXT,
  -- Contacto
  telefono_contacto      VARCHAR(20),
  modo_contacto          VARCHAR(20)     DEFAULT 'CHAT',
  -- Meta
  visible                BOOLEAN         DEFAULT TRUE,
  latitud                DECIMAL(10,7),
  longitud               DECIMAL(10,7),
  fecha_publicacion      TIMESTAMP       NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FOTOS_PUBLICACION
-- ============================================================
CREATE TABLE fotos_publicacion (
  id             VARCHAR(36) PRIMARY KEY,
  publicacion_id VARCHAR(36) NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  url            TEXT        NOT NULL,
  orden          INT         DEFAULT 0
);

-- ============================================================
-- FAVORITOS
-- ============================================================
CREATE TABLE favoritos (
  id             VARCHAR(36) PRIMARY KEY,
  usuario_id     VARCHAR(36) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  publicacion_id VARCHAR(36) NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  fecha_guardado TIMESTAMP   NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, publicacion_id)
);

-- ============================================================
-- SOLICITUDES_CONTACTO
-- ============================================================
CREATE TABLE solicitudes_contacto (
  id              VARCHAR(36)          PRIMARY KEY,
  usuario_id      VARCHAR(36)          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  grupo_id        VARCHAR(36)          NOT NULL REFERENCES grupos(id)   ON DELETE CASCADE,
  estado          estado_solicitud_enum NOT NULL DEFAULT 'PENDIENTE',
  fecha_envio     TIMESTAMP            NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, grupo_id)
);

-- ============================================================
-- CHATS
-- ============================================================
CREATE TABLE chats (
  id             VARCHAR(36)      PRIMARY KEY,
  solicitud_id   VARCHAR(36)      UNIQUE NOT NULL REFERENCES solicitudes_contacto(id) ON DELETE CASCADE,
  estado         estado_chat_enum DEFAULT 'ACTIVO',
  created_at     TIMESTAMP        NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MENSAJES
-- ============================================================
CREATE TABLE mensajes (
  id           VARCHAR(36) PRIMARY KEY,
  chat_id      VARCHAR(36) NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  remitente_id VARCHAR(36) NOT NULL REFERENCES usuarios(id),
  contenido    TEXT        NOT NULL,
  enviado_en   TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mensajes_chat_id ON mensajes(chat_id, enviado_en DESC);

-- ============================================================
-- TAREAS
-- ============================================================
CREATE TABLE tareas (
  id           VARCHAR(36) PRIMARY KEY,
  grupo_id     VARCHAR(36) NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  nombre       VARCHAR(255) NOT NULL,
  descripcion  TEXT,
  es_recurrente BOOLEAN    DEFAULT FALSE,
  created_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ASIGNACIONES_TAREA
-- ============================================================
CREATE TABLE asignaciones_tarea (
  id              VARCHAR(36)        PRIMARY KEY,
  tarea_id        VARCHAR(36)        NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
  usuario_id      VARCHAR(36)        NOT NULL REFERENCES usuarios(id),
  semana          DATE               NOT NULL,  -- lunes de la semana
  estado          estado_tarea_enum  DEFAULT 'PENDIENTE',
  fecha_completada TIMESTAMP,
  UNIQUE (tarea_id, usuario_id, semana)
);

-- ============================================================
-- FACTURAS
-- ============================================================
CREATE TABLE facturas (
  id                VARCHAR(36)       PRIMARY KEY,
  grupo_id          VARCHAR(36)       NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  casero_id         VARCHAR(36)       NOT NULL REFERENCES usuarios(id),
  tipo              tipo_factura_enum NOT NULL,
  descripcion       TEXT,
  importe_total     DECIMAL(10,2)     NOT NULL,
  tipo_division     tipo_division_enum DEFAULT 'EQUITATIVA',
  fecha_emision     DATE              NOT NULL,
  fecha_vencimiento DATE          NOT NULL,
  url_documento     TEXT,
  created_at        TIMESTAMP         NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP         NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAGOS_FACTURA
-- ============================================================
CREATE TABLE pagos_factura (
  id               VARCHAR(36) PRIMARY KEY,
  factura_id       VARCHAR(36) NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  usuario_id       VARCHAR(36) NOT NULL REFERENCES usuarios(id),
  importe_asignado DECIMAL(10,2) NOT NULL,
  pagado           BOOLEAN      DEFAULT FALSE,
  fecha_pago       TIMESTAMP,
  UNIQUE(factura_id, usuario_id)
);

-- ============================================================
-- EVENTOS
-- ============================================================
CREATE TABLE eventos (
  id            VARCHAR(36) PRIMARY KEY,
  grupo_id      VARCHAR(36) NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  creado_por_id VARCHAR(36) NOT NULL REFERENCES usuarios(id),
  titulo        VARCHAR(255) NOT NULL,
  descripcion   TEXT,
  fecha_inicio             TIMESTAMP   NOT NULL,
  fecha_fin                TIMESTAMP,
  google_calendar_event_id TEXT,
  created_at               TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTOS (lista de la compra)
-- ============================================================
CREATE TABLE productos (
  id              VARCHAR(36) PRIMARY KEY,
  grupo_id        VARCHAR(36) NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  anadido_por_id  VARCHAR(36) NOT NULL REFERENCES usuarios(id),
  nombre          VARCHAR(255) NOT NULL,
  cantidad        DECIMAL(10,2) NOT NULL DEFAULT 1,
  unidad_medida   VARCHAR(50),
  categoria       VARCHAR(20)  NOT NULL DEFAULT 'otros',
  comprado        BOOLEAN      DEFAULT FALSE,
  comprado_por_id VARCHAR(36)  REFERENCES usuarios(id),
  fecha_compra    TIMESTAMP,
  created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INTERESES
-- ============================================================
CREATE TABLE intereses (
  id        SERIAL       PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  categoria VARCHAR(100) NOT NULL
);

CREATE TABLE usuario_intereses (
  usuario_id VARCHAR(36) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  interes_id INT         NOT NULL REFERENCES intereses(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, interes_id)
);

CREATE TABLE grupo_intereses (
  grupo_id   VARCHAR(36) NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  interes_id INT         NOT NULL REFERENCES intereses(id) ON DELETE CASCADE,
  PRIMARY KEY (grupo_id, interes_id)
);

INSERT INTO intereses (nombre, categoria) VALUES
  ('Gimnasio',              'Deporte y actividad física'),
  ('Yoga',                  'Deporte y actividad física'),
  ('Crossfit',              'Deporte y actividad física'),
  ('Senderismo',            'Deporte y actividad física'),
  ('Dar paseos',            'Deporte y actividad física'),
  ('Ciclismo',              'Deporte y actividad física'),
  ('Running',               'Deporte y actividad física'),
  ('Escalada',              'Deporte y actividad física'),
  ('Natación',              'Deporte y actividad física'),
  ('Fútbol',                'Deporte y actividad física'),
  ('Baloncesto',            'Deporte y actividad física'),
  ('Padel',                 'Deporte y actividad física'),
  ('Artes marciales',       'Deporte y actividad física'),
  ('Surf',                  'Deporte y actividad física'),
  ('Esquí',                 'Deporte y actividad física'),
  ('Vegano',                'Alimentación'),
  ('Vegetariano',           'Alimentación'),
  ('Café de especialidad',  'Alimentación'),
  ('Cocina en casa',        'Alimentación'),
  ('Repostería',            'Alimentación'),
  ('Comida internacional',  'Alimentación'),
  ('Streetfood',            'Alimentación'),
  ('Lectura',               'Cultura y ocio'),
  ('Cine',                  'Cultura y ocio'),
  ('Series',                'Cultura y ocio'),
  ('Teatro',                'Cultura y ocio'),
  ('Música en directo',     'Cultura y ocio'),
  ('Museos',                'Cultura y ocio'),
  ('Fotografía',            'Cultura y ocio'),
  ('Videojuegos',           'Cultura y ocio'),
  ('Podcasts',              'Cultura y ocio'),
  ('Arte',                  'Cultura y ocio'),
  ('Salir de noche',        'Vida social'),
  ('Bares y copas',         'Vida social'),
  ('Viajes',                'Vida social'),
  ('Festivales',            'Vida social'),
  ('Voluntariado',          'Vida social'),
  ('Networking',            'Vida social'),
  ('Salir de tiendas',      'Vida social'),
  ('Miradores',             'Vida social'),
  ('Cafeterías',            'Vida social'),
  ('Meditación',            'Bienestar'),
  ('Pilates',               'Bienestar'),
  ('Vida sostenible',       'Bienestar'),
  ('Mindfulness',           'Bienestar'),
  ('Bienestar mental',      'Bienestar');

