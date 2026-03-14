-- ENUMS
CREATE TYPE role AS ENUM ('ADMIN', 'MEMBER', 'LANDLORD');
CREATE TYPE horario AS ENUM ('MANANA', 'TARDE', 'NOCHE');
CREATE TYPE ambiente AS ENUM ('TRANQUILO', 'ANIMADO');
CREATE TYPE frecuencia_visitas AS ENUM ('NUNCA', 'OCASIONALMENTE', 'FRECUENTEMENTE', 'MUY_FRECUENTEMENTE');
CREATE TYPE frecuencia_fiestas AS ENUM ('NUNCA', 'RARAMENTE', 'OCASIONALMENTE', 'FRECUENTEMENTE');
CREATE TYPE ocupacion AS ENUM ('ESTUDIANTE', 'TRABAJADOR', 'ESTUDIANTE_Y_TRABAJADOR', 'OTRO');
CREATE TYPE frecuencia_salidas AS ENUM ('NUNCA', 'FINES_DE_SEMANA', 'VARIOS_DIAS', 'CASI_TODOS_LOS_DIAS');
CREATE TYPE dia_semana AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');
CREATE TYPE tipo_tarea AS ENUM ('PUNTUAL', 'RECURRENTE');
CREATE TYPE estado_tarea AS ENUM ('PENDIENTE', 'COMPLETADA', 'VALIDADA', 'RECHAZADA', 'CANCELADA');
CREATE TYPE tipo_division AS ENUM ('EQUITATIVA', 'PERSONALIZADA');
CREATE TYPE tipo_factura AS ENUM ('AGUA', 'LUZ', 'INTERNET', 'ALQUILER', 'OTRO');
CREATE TYPE estado_factura AS ENUM ('PENDIENTE', 'PAGADA');
CREATE TYPE estado_chat AS ENUM ('PENDIENTE', 'ACTIVO', 'RECHAZADO');
CREATE TYPE estado_publicacion AS ENUM ('ACTIVA', 'INACTIVA');

-- GRUPOS (antes que usuarios por la FK)
CREATE TABLE grupos (
  id VARCHAR(30) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  direccion TEXT,
  codigo_acceso VARCHAR(6) UNIQUE NOT NULL,
  codigo_qr TEXT,
  admin_id VARCHAR(30) NOT NULL,
  dia_limpieza dia_semana,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- USUARIOS
CREATE TABLE usuarios (
  id VARCHAR(30) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  foto_perfil TEXT,
  grupo_id VARCHAR(30) REFERENCES grupos(id) ON DELETE SET NULL,
  rol_en_grupo role,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- FK de grupos.admin_id ahora que existe usuarios
ALTER TABLE grupos ADD CONSTRAINT fk_grupos_admin FOREIGN KEY (admin_id) REFERENCES usuarios(id);

-- PERFIL CONVIVENCIA USUARIO
CREATE TABLE perfiles_convivencia_usuario (
  id VARCHAR(30) PRIMARY KEY,
  usuario_id VARCHAR(30) UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fumador BOOLEAN NOT NULL,
  tiene_mascotas BOOLEAN NOT NULL,
  lgbtq_friendly BOOLEAN NOT NULL,
  horario horario NOT NULL,
  ambiente ambiente NOT NULL,
  frecuencia_visitas frecuencia_visitas NOT NULL,
  tolerancia_fiestas frecuencia_fiestas NOT NULL,
  ocupacion ocupacion NOT NULL,
  frecuencia_salidas frecuencia_salidas NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PERFIL CONVIVENCIA GRUPO
CREATE TABLE perfiles_convivencia_grupo (
  id VARCHAR(30) PRIMARY KEY,
  grupo_id VARCHAR(30) UNIQUE NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  fumador BOOLEAN NOT NULL,
  tiene_mascotas BOOLEAN NOT NULL,
  lgbtq_friendly BOOLEAN NOT NULL,
  horario horario NOT NULL,
  ambiente ambiente NOT NULL,
  frecuencia_visitas frecuencia_visitas NOT NULL,
  tolerancia_fiestas frecuencia_fiestas NOT NULL,
  ocupacion ocupacion NOT NULL,
  frecuencia_salidas frecuencia_salidas NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PUBLICACIONES
CREATE TABLE publicaciones (
  id VARCHAR(30) PRIMARY KEY,
  grupo_id VARCHAR(30) UNIQUE NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  precio_mensual DECIMAL(10,2) NOT NULL,
  tamano_habitacion DECIMAL(10,2),
  num_habitaciones_libres INT DEFAULT 1,
  fotografias TEXT[],
  genero_preferido VARCHAR(50),
  admite_mascotas BOOLEAN DEFAULT FALSE,
  estado estado_publicacion DEFAULT 'ACTIVA',
  fecha_publicacion TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CHATS
CREATE TABLE chats (
  id VARCHAR(30) PRIMARY KEY,
  publicacion_id VARCHAR(30) NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  solicitante_id VARCHAR(30) NOT NULL REFERENCES usuarios(id),
  admin_id VARCHAR(30) NOT NULL REFERENCES usuarios(id),
  estado estado_chat DEFAULT 'PENDIENTE',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(publicacion_id, solicitante_id)
);

-- MENSAJES
CREATE TABLE mensajes (
  id VARCHAR(30) PRIMARY KEY,
  chat_id VARCHAR(30) NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  remitente_id VARCHAR(30) NOT NULL REFERENCES usuarios(id),
  contenido TEXT NOT NULL,
  enviado_en TIMESTAMP DEFAULT NOW()
);

-- TAREAS
CREATE TABLE tareas (
  id VARCHAR(30) PRIMARY KEY,
  grupo_id VARCHAR(30) NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo tipo_tarea DEFAULT 'PUNTUAL',
  creado_por_id VARCHAR(30) NOT NULL REFERENCES usuarios(id),
  asignado_a_id VARCHAR(30) REFERENCES usuarios(id),
  estado estado_tarea DEFAULT 'PENDIENTE',
  fecha_asignacion TIMESTAMP,
  fecha_completado TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- GASTOS
CREATE TABLE gastos (
  id VARCHAR(30) PRIMARY KEY,
  grupo_id VARCHAR(30) NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  pagado_por_id VARCHAR(30) NOT NULL REFERENCES usuarios(id),
  descripcion TEXT NOT NULL,
  importe_total DECIMAL(10,2) NOT NULL,
  tipo_division tipo_division DEFAULT 'EQUITATIVA',
  fecha_registro TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PARTICIPANTES GASTO
CREATE TABLE participantes_gasto (
  id VARCHAR(30) PRIMARY KEY,
  gasto_id VARCHAR(30) NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  usuario_id VARCHAR(30) NOT NULL REFERENCES usuarios(id),
  importe DECIMAL(10,2) NOT NULL,
  reembolsado BOOLEAN DEFAULT FALSE,
  fecha_reembolso TIMESTAMP,
  UNIQUE(gasto_id, usuario_id)
);

-- FACTURAS
CREATE TABLE facturas (
  id VARCHAR(30) PRIMARY KEY,
  grupo_id VARCHAR(30) NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  casero_id VARCHAR(30) NOT NULL REFERENCES usuarios(id),
  tipo tipo_factura NOT NULL,
  importe DECIMAL(10,2) NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE,
  archivo_adjunto TEXT,
  estado estado_factura DEFAULT 'PENDIENTE',
  pagada_por_id VARCHAR(30) REFERENCES usuarios(id),
  fecha_confirmacion TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- EVENTOS
CREATE TABLE eventos (
  id VARCHAR(30) PRIMARY KEY,
  grupo_id VARCHAR(30) NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  creado_por_id VARCHAR(30) NOT NULL REFERENCES usuarios(id),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP,
  recordatorio BOOLEAN DEFAULT FALSE,
  antelacion_min INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PRODUCTOS
CREATE TABLE productos (
  id VARCHAR(30) PRIMARY KEY,
  grupo_id VARCHAR(30) NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  anadido_por_id VARCHAR(30) NOT NULL REFERENCES usuarios(id),
  nombre VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  unidad_medida VARCHAR(50),
  comprado BOOLEAN DEFAULT FALSE,
  comprado_por_id VARCHAR(30) REFERENCES usuarios(id),
  fecha_compra TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);