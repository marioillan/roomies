BEGIN;
CREATE TYPE "nivel_ruido_enum_new" AS ENUM ('SILENCIO_TOTAL', 'MODERADO', 'ALTO');

ALTER TABLE "perfiles_convivencia_usuario" ALTER COLUMN "nivel_ruido" TYPE "nivel_ruido_enum_new"
  USING (CASE "nivel_ruido"::text WHEN 'INDIFERENTE' THEN 'ALTO' ELSE "nivel_ruido"::text END::"nivel_ruido_enum_new");
ALTER TABLE "perfiles_convivencia_grupo" ALTER COLUMN "nivel_ruido" TYPE "nivel_ruido_enum_new"
  USING (CASE "nivel_ruido"::text WHEN 'INDIFERENTE' THEN 'ALTO' ELSE "nivel_ruido"::text END::"nivel_ruido_enum_new");
ALTER TABLE "preferencias_companero" ALTER COLUMN "nivel_ruido" TYPE "nivel_ruido_enum_new"
  USING (CASE "nivel_ruido"::text WHEN 'INDIFERENTE' THEN 'ALTO' ELSE "nivel_ruido"::text END::"nivel_ruido_enum_new");

ALTER TYPE "nivel_ruido_enum" RENAME TO "nivel_ruido_enum_old";
ALTER TYPE "nivel_ruido_enum_new" RENAME TO "nivel_ruido_enum";
DROP TYPE "nivel_ruido_enum_old";
COMMIT;