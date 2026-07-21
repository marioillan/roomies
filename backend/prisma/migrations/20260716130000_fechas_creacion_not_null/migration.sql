-- Ninguno de estos campos se pone a NULL en el código (siempre DEFAULT NOW() al crear
-- y `updated_at: new Date()` explícito en cada UPDATE), así que se fuerza NOT NULL.

ALTER TABLE "usuarios"
  ALTER COLUMN "fecha_registro" SET NOT NULL,
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "grupos"
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "miembros_grupo"
  ALTER COLUMN "fecha_union" SET NOT NULL;

ALTER TABLE "solicitudes_union"
  ALTER COLUMN "fecha_solicitud" SET NOT NULL;

ALTER TABLE "perfiles_convivencia_usuario"
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "preferencias_companero"
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "perfiles_convivencia_grupo"
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "publicaciones"
  ALTER COLUMN "fecha_publicacion" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "favoritos"
  ALTER COLUMN "fecha_guardado" SET NOT NULL;

ALTER TABLE "solicitudes_contacto"
  ALTER COLUMN "fecha_envio" SET NOT NULL;

ALTER TABLE "chats"
  ALTER COLUMN "created_at" SET NOT NULL;

ALTER TABLE "mensajes"
  ALTER COLUMN "enviado_en" SET NOT NULL;

ALTER TABLE "tareas"
  ALTER COLUMN "created_at" SET NOT NULL;

ALTER TABLE "facturas"
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "eventos"
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "productos"
  ALTER COLUMN "created_at" SET NOT NULL;
