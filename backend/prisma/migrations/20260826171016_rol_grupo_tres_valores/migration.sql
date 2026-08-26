BEGIN;
CREATE TYPE "rol_grupo_new" AS ENUM ('ADMIN', 'MIEMBRO', 'CASERO');

-- El DEFAULT usa el tipo antiguo: hay que retirarlo antes de convertir
ALTER TABLE "miembros_grupo" ALTER COLUMN "rol" DROP DEFAULT;

-- El orden del CASE importa: el casero se evalúa primero porque hoy
-- se representa como MEMBER + es_casero = true
ALTER TABLE "miembros_grupo" ALTER COLUMN "rol" TYPE "rol_grupo_new"
  USING (CASE
           WHEN "es_casero" IS TRUE   THEN 'CASERO'
           WHEN "rol"::text = 'ADMIN' THEN 'ADMIN'
           ELSE                            'MIEMBRO'
         END::"rol_grupo_new");

ALTER TABLE "miembros_grupo" ALTER COLUMN "rol" SET DEFAULT 'MIEMBRO';

ALTER TYPE "rol_grupo"     RENAME TO "rol_grupo_old";
ALTER TYPE "rol_grupo_new" RENAME TO "rol_grupo";
DROP TYPE "rol_grupo_old";

ALTER TABLE "miembros_grupo" DROP COLUMN "es_casero";
COMMIT;