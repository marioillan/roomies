-- CreateEnum
CREATE TYPE "limpieza_orden_enum" AS ENUM ('DESPREOCUPADO', 'FLEXIBLE', 'ORDENADO');

-- CreateEnum
CREATE TYPE "nivel_ruido_enum" AS ENUM ('SILENCIO_TOTAL', 'MODERADO', 'INDIFERENTE');

-- AlterEnum
-- Normaliza cualquier valor fuera de PENDIENTE/COMPLETADA antes de reducir el enum,
-- para que el CAST no falle si en producción quedó algún estado antiguo (VALIDADA, RECHAZADA, CANCELADA...).
UPDATE "asignaciones_tarea" SET "estado" = 'PENDIENTE' WHERE "estado"::text NOT IN ('PENDIENTE', 'COMPLETADA');

BEGIN;
CREATE TYPE "estado_tarea_enum_new" AS ENUM ('PENDIENTE', 'COMPLETADA');
ALTER TABLE "asignaciones_tarea" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "asignaciones_tarea" ALTER COLUMN "estado" TYPE "estado_tarea_enum_new" USING ("estado"::text::"estado_tarea_enum_new");
ALTER TYPE "estado_tarea_enum" RENAME TO "estado_tarea_enum_old";
ALTER TYPE "estado_tarea_enum_new" RENAME TO "estado_tarea_enum";
DROP TYPE "estado_tarea_enum_old";
ALTER TABLE "asignaciones_tarea" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';
COMMIT;

-- AlterTable
ALTER TABLE "perfiles_convivencia_grupo" ADD COLUMN     "limpieza_orden" "limpieza_orden_enum",
ADD COLUMN     "nivel_ruido" "nivel_ruido_enum";

-- AlterTable
ALTER TABLE "perfiles_convivencia_usuario" ADD COLUMN     "limpieza_orden" "limpieza_orden_enum",
ADD COLUMN     "nivel_ruido" "nivel_ruido_enum",
ALTER COLUMN "pais" SET DEFAULT 'España';

-- AlterTable
ALTER TABLE "preferencias_companero" ADD COLUMN     "limpieza_orden" "limpieza_orden_enum",
ADD COLUMN     "limpieza_orden_req" BOOLEAN DEFAULT false,
ADD COLUMN     "nivel_ruido" "nivel_ruido_enum",
ADD COLUMN     "nivel_ruido_req" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "productos" DROP COLUMN "cantidad",
DROP COLUMN "unidad_medida";

-- AlterTable
-- Backfill de seguridad: si en producción quedó alguna publicación sin dirección,
-- se rellena con la ciudad como placeholder antes de forzar NOT NULL.
UPDATE "publicaciones" SET "direccion" = "ciudad" WHERE "direccion" IS NULL;
ALTER TABLE "publicaciones" ALTER COLUMN "direccion" SET NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "foto_1" TEXT,
ADD COLUMN     "foto_2" TEXT;
