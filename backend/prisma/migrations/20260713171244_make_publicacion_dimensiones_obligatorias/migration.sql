-- Backfill de seguridad: si alguna publicación tiene estos campos vacíos,
-- se rellenan con valores por defecto razonables antes de forzar NOT NULL.
UPDATE "publicaciones" SET "tipo_piso" = 'PISO' WHERE "tipo_piso" IS NULL;
UPDATE "publicaciones" SET "habitaciones_totales" = GREATEST("habitaciones_libres", 1) WHERE "habitaciones_totales" IS NULL;
UPDATE "publicaciones" SET "tamano_piso" = 70 WHERE "tamano_piso" IS NULL;
UPDATE "publicaciones" SET "planta" = 0 WHERE "planta" IS NULL;
UPDATE "publicaciones" SET "ascensor" = FALSE WHERE "ascensor" IS NULL;

-- AlterTable
ALTER TABLE "publicaciones" ALTER COLUMN "tipo_piso" SET NOT NULL,
ALTER COLUMN "habitaciones_totales" SET NOT NULL,
ALTER COLUMN "tamano_piso" SET NOT NULL,
ALTER COLUMN "planta" SET NOT NULL,
ALTER COLUMN "ascensor" SET NOT NULL;
