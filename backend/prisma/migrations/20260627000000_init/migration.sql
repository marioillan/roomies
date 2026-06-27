-- CreateEnum
CREATE TYPE "rol_grupo" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ocupacion_enum" AS ENUM ('ESTUDIO', 'TRABAJO', 'ESTUDIO_Y_TRABAJO');

-- CreateEnum
CREATE TYPE "horario_enum" AS ENUM ('MADRUGADOR', 'INTERMEDIO', 'NOCTURNO');

-- CreateEnum
CREATE TYPE "frecuencia_visitas_enum" AS ENUM ('CASI_NUNCA', 'A_VECES', 'FRECUENTE');

-- CreateEnum
CREATE TYPE "ambiente_enum" AS ENUM ('TRANQUILO', 'EQUILIBRADO', 'SOCIAL');

-- CreateEnum
CREATE TYPE "frecuencia_fiestas_enum" AS ENUM ('NUNCA', 'OCASIONAL', 'FRECUENTE');

-- CreateEnum
CREATE TYPE "frecuencia_salidas_enum" AS ENUM ('NUNCA', 'OCASIONAL', 'FRECUENTE');

-- CreateEnum
CREATE TYPE "acepta_fumadores_enum" AS ENUM ('SI', 'NO', 'INDIFERENTE');

-- CreateEnum
CREATE TYPE "acepta_mascotas_enum" AS ENUM ('SI', 'NO', 'DEPENDE');

-- CreateEnum
CREATE TYPE "dia_semana_enum" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "estado_tarea_enum" AS ENUM ('PENDIENTE', 'COMPLETADA', 'VALIDADA', 'RECHAZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "tipo_division_enum" AS ENUM ('EQUITATIVA', 'PERSONALIZADA');

-- CreateEnum
CREATE TYPE "tipo_factura_enum" AS ENUM ('AGUA', 'LUZ', 'INTERNET', 'ALQUILER', 'OTRO');

-- CreateEnum
CREATE TYPE "estado_solicitud_enum" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "estado_chat_enum" AS ENUM ('ACTIVO', 'CERRADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" VARCHAR(36) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT,
    "foto_perfil" TEXT,
    "google_id" VARCHAR(255),
    "google_refresh_token" TEXT,
    "google_calendar_token" TEXT,
    "fecha_registro" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" VARCHAR(36) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo_acceso" VARCHAR(6) NOT NULL,
    "codigo_casero" VARCHAR(6),
    "foto_perfil" TEXT,
    "descripcion" TEXT NOT NULL,
    "ciudad" VARCHAR(100),
    "buscar_companero" BOOLEAN DEFAULT false,
    "activo" BOOLEAN DEFAULT true,
    "dia_limpieza" "dia_semana_enum",
    "semana_rotacion" INTEGER DEFAULT 0,
    "rotacion_semana_actual" DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "miembros_grupo" (
    "id" VARCHAR(36) NOT NULL,
    "usuario_id" VARCHAR(36) NOT NULL,
    "grupo_id" VARCHAR(36) NOT NULL,
    "rol" "rol_grupo" NOT NULL DEFAULT 'MEMBER',
    "es_casero" BOOLEAN DEFAULT false,
    "activo" BOOLEAN DEFAULT true,
    "fecha_union" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "miembros_grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfiles_convivencia_usuario" (
    "id" VARCHAR(36) NOT NULL,
    "usuario_id" VARCHAR(36) NOT NULL,
    "pais" VARCHAR(100) DEFAULT 'Espa├▒a',
    "genero" VARCHAR(50),
    "fecha_nacimiento" DATE,
    "ocupacion" "ocupacion_enum",
    "horario" "horario_enum",
    "frecuencia_visitas" "frecuencia_visitas_enum",
    "ambiente" "ambiente_enum",
    "tolerancia_fiestas" "frecuencia_fiestas_enum",
    "frecuencia_salidas" "frecuencia_salidas_enum",
    "fumador" BOOLEAN,
    "acepta_fumadores" "acepta_fumadores_enum",
    "tiene_mascotas" BOOLEAN,
    "acepta_mascotas" "acepta_mascotas_enum",
    "lgbtq_friendly" BOOLEAN,
    "sobre_mi" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfiles_convivencia_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferencias_companero" (
    "id" VARCHAR(36) NOT NULL,
    "usuario_id" VARCHAR(36) NOT NULL,
    "ocupacion" "ocupacion_enum",
    "ocupacion_req" BOOLEAN DEFAULT false,
    "horario" "horario_enum",
    "horario_req" BOOLEAN DEFAULT false,
    "frecuencia_visitas" "frecuencia_visitas_enum",
    "frecuencia_visitas_req" BOOLEAN DEFAULT false,
    "ambiente" "ambiente_enum",
    "ambiente_req" BOOLEAN DEFAULT false,
    "tolerancia_fiestas" "frecuencia_fiestas_enum",
    "tolerancia_fiestas_req" BOOLEAN DEFAULT false,
    "frecuencia_salidas" "frecuencia_salidas_enum",
    "frecuencia_salidas_req" BOOLEAN DEFAULT false,
    "fumador" BOOLEAN,
    "fumador_req" BOOLEAN DEFAULT false,
    "acepta_fumadores" "acepta_fumadores_enum",
    "acepta_fumadores_req" BOOLEAN DEFAULT false,
    "tiene_mascotas" BOOLEAN,
    "tiene_mascotas_req" BOOLEAN DEFAULT false,
    "acepta_mascotas" "acepta_mascotas_enum",
    "acepta_mascotas_req" BOOLEAN DEFAULT false,
    "lgbtq_friendly" BOOLEAN,
    "lgbtq_friendly_req" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preferencias_companero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfiles_convivencia_grupo" (
    "id" VARCHAR(36) NOT NULL,
    "grupo_id" VARCHAR(36) NOT NULL,
    "ocupacion" "ocupacion_enum",
    "horario" "horario_enum",
    "frecuencia_visitas" "frecuencia_visitas_enum",
    "ambiente" "ambiente_enum",
    "tolerancia_fiestas" "frecuencia_fiestas_enum",
    "frecuencia_salidas" "frecuencia_salidas_enum",
    "acepta_fumadores" "acepta_fumadores_enum",
    "acepta_mascotas" "acepta_mascotas_enum",
    "lgbtq_friendly" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfiles_convivencia_grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicaciones" (
    "id" VARCHAR(36) NOT NULL,
    "grupo_id" VARCHAR(36) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "ciudad" VARCHAR(100) NOT NULL,
    "direccion" VARCHAR(255),
    "piso_puerta" VARCHAR(50),
    "precio" DECIMAL(10,2) NOT NULL,
    "habitaciones_libres" INTEGER DEFAULT 1,
    "tipo_piso" VARCHAR(50),
    "habitaciones_totales" INTEGER,
    "tamano_piso" DECIMAL(10,2),
    "planta" INTEGER,
    "ascensor" BOOLEAN DEFAULT false,
    "wifi" BOOLEAN DEFAULT false,
    "lavadora" BOOLEAN DEFAULT false,
    "lavavajillas" BOOLEAN DEFAULT false,
    "aire_acondicionado" BOOLEAN DEFAULT false,
    "calefaccion" BOOLEAN DEFAULT false,
    "parking" BOOLEAN DEFAULT false,
    "terraza" BOOLEAN DEFAULT false,
    "amueblado" BOOLEAN DEFAULT false,
    "permite_fumar" BOOLEAN DEFAULT false,
    "permite_mascotas" BOOLEAN DEFAULT false,
    "visitas" VARCHAR(50),
    "horario_silencio" VARCHAR(50),
    "genero_preferido" VARCHAR(50),
    "normas_adicionales" TEXT,
    "telefono_contacto" VARCHAR(20),
    "modo_contacto" VARCHAR(20) DEFAULT 'CHAT',
    "visible" BOOLEAN DEFAULT true,
    "latitud" DECIMAL(10,7),
    "longitud" DECIMAL(10,7),
    "fecha_publicacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_publicacion" (
    "id" VARCHAR(36) NOT NULL,
    "publicacion_id" VARCHAR(36) NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER DEFAULT 0,

    CONSTRAINT "fotos_publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "id" VARCHAR(36) NOT NULL,
    "usuario_id" VARCHAR(36) NOT NULL,
    "publicacion_id" VARCHAR(36) NOT NULL,
    "fecha_guardado" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_contacto" (
    "id" VARCHAR(36) NOT NULL,
    "usuario_id" VARCHAR(36) NOT NULL,
    "grupo_id" VARCHAR(36) NOT NULL,
    "estado" "estado_solicitud_enum" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_envio" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_contacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" VARCHAR(36) NOT NULL,
    "solicitud_id" VARCHAR(36) NOT NULL,
    "estado" "estado_chat_enum" NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" VARCHAR(36) NOT NULL,
    "chat_id" VARCHAR(36) NOT NULL,
    "remitente_id" VARCHAR(36) NOT NULL,
    "contenido" TEXT NOT NULL,
    "enviado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas" (
    "id" VARCHAR(36) NOT NULL,
    "grupo_id" VARCHAR(36) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "es_recurrente" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_tarea" (
    "id" VARCHAR(36) NOT NULL,
    "tarea_id" VARCHAR(36) NOT NULL,
    "usuario_id" VARCHAR(36) NOT NULL,
    "semana" DATE NOT NULL,
    "estado" "estado_tarea_enum" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_completada" TIMESTAMP(6),

    CONSTRAINT "asignaciones_tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" VARCHAR(36) NOT NULL,
    "grupo_id" VARCHAR(36) NOT NULL,
    "casero_id" VARCHAR(36) NOT NULL,
    "tipo" "tipo_factura_enum" NOT NULL,
    "descripcion" TEXT,
    "importe_total" DECIMAL(10,2) NOT NULL,
    "tipo_division" "tipo_division_enum" NOT NULL DEFAULT 'EQUITATIVA',
    "fecha_emision" DATE NOT NULL,
    "fecha_vencimiento" DATE NOT NULL,
    "url_documento" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_factura" (
    "id" VARCHAR(36) NOT NULL,
    "factura_id" VARCHAR(36) NOT NULL,
    "usuario_id" VARCHAR(36) NOT NULL,
    "importe_asignado" DECIMAL(10,2) NOT NULL,
    "pagado" BOOLEAN DEFAULT false,
    "fecha_pago" TIMESTAMP(6),

    CONSTRAINT "pagos_factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" VARCHAR(36) NOT NULL,
    "grupo_id" VARCHAR(36) NOT NULL,
    "creado_por_id" VARCHAR(36) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio" TIMESTAMP(6) NOT NULL,
    "fecha_fin" TIMESTAMP(6),
    "google_calendar_event_id" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" VARCHAR(36) NOT NULL,
    "grupo_id" VARCHAR(36) NOT NULL,
    "anadido_por_id" VARCHAR(36) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unidad_medida" VARCHAR(50),
    "categoria" VARCHAR(20) NOT NULL DEFAULT 'otros',
    "comprado" BOOLEAN DEFAULT false,
    "comprado_por_id" VARCHAR(36),
    "fecha_compra" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intereses" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,

    CONSTRAINT "intereses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_intereses" (
    "usuario_id" VARCHAR(36) NOT NULL,
    "interes_id" INTEGER NOT NULL,

    CONSTRAINT "usuario_intereses_pkey" PRIMARY KEY ("usuario_id","interes_id")
);

-- CreateTable
CREATE TABLE "grupo_intereses" (
    "grupo_id" VARCHAR(36) NOT NULL,
    "interes_id" INTEGER NOT NULL,

    CONSTRAINT "grupo_intereses_pkey" PRIMARY KEY ("grupo_id","interes_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_google_id_key" ON "usuarios"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_codigo_acceso_key" ON "grupos"("codigo_acceso");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_codigo_casero_key" ON "grupos"("codigo_casero");

-- CreateIndex
CREATE UNIQUE INDEX "miembros_grupo_usuario_id_grupo_id_key" ON "miembros_grupo"("usuario_id", "grupo_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_convivencia_usuario_usuario_id_key" ON "perfiles_convivencia_usuario"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "preferencias_companero_usuario_id_key" ON "preferencias_companero"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_convivencia_grupo_grupo_id_key" ON "perfiles_convivencia_grupo"("grupo_id");

-- CreateIndex
CREATE UNIQUE INDEX "publicaciones_grupo_id_key" ON "publicaciones"("grupo_id");

-- CreateIndex
CREATE UNIQUE INDEX "favoritos_usuario_id_publicacion_id_key" ON "favoritos"("usuario_id", "publicacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_contacto_usuario_id_grupo_id_key" ON "solicitudes_contacto"("usuario_id", "grupo_id");

-- CreateIndex
CREATE UNIQUE INDEX "chats_solicitud_id_key" ON "chats"("solicitud_id");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_tarea_tarea_id_usuario_id_semana_key" ON "asignaciones_tarea"("tarea_id", "usuario_id", "semana");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_factura_factura_id_usuario_id_key" ON "pagos_factura"("factura_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "miembros_grupo" ADD CONSTRAINT "miembros_grupo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miembros_grupo" ADD CONSTRAINT "miembros_grupo_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfiles_convivencia_usuario" ADD CONSTRAINT "perfiles_convivencia_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferencias_companero" ADD CONSTRAINT "preferencias_companero_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfiles_convivencia_grupo" ADD CONSTRAINT "perfiles_convivencia_grupo_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_publicacion" ADD CONSTRAINT "fotos_publicacion_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes_contacto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_remitente_id_fkey" FOREIGN KEY ("remitente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_tarea" ADD CONSTRAINT "asignaciones_tarea_tarea_id_fkey" FOREIGN KEY ("tarea_id") REFERENCES "tareas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_tarea" ADD CONSTRAINT "asignaciones_tarea_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_casero_id_fkey" FOREIGN KEY ("casero_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_factura" ADD CONSTRAINT "pagos_factura_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_factura" ADD CONSTRAINT "pagos_factura_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_anadido_por_id_fkey" FOREIGN KEY ("anadido_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_comprado_por_id_fkey" FOREIGN KEY ("comprado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_intereses" ADD CONSTRAINT "usuario_intereses_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_intereses" ADD CONSTRAINT "usuario_intereses_interes_id_fkey" FOREIGN KEY ("interes_id") REFERENCES "intereses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_intereses" ADD CONSTRAINT "grupo_intereses_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_intereses" ADD CONSTRAINT "grupo_intereses_interes_id_fkey" FOREIGN KEY ("interes_id") REFERENCES "intereses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

