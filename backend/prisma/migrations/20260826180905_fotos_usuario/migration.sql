-- CreateTable
CREATE TABLE "fotos_usuario" (
    "id" VARCHAR(36) NOT NULL,
    "usuario_id" VARCHAR(36) NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fotos_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fotos_usuario_usuario_id_orden_key" ON "fotos_usuario"("usuario_id", "orden");

-- AddForeignKey
ALTER TABLE "fotos_usuario" ADD CONSTRAINT "fotos_usuario_usuario_id_fkey"
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Traslada las fotos que hoy viven en columnas de usuarios a la tabla nueva.
-- La foto de perfil pasa a ser la de orden 0 (principal).
-- gen_random_uuid()::text porque el id es VarChar(36) y lo genera la aplicación.
INSERT INTO "fotos_usuario" ("id", "usuario_id", "url", "orden")
SELECT gen_random_uuid()::text, "id", "foto_perfil", 0 FROM "usuarios" WHERE "foto_perfil" IS NOT NULL
UNION ALL
SELECT gen_random_uuid()::text, "id", "foto_1", 1 FROM "usuarios" WHERE "foto_1" IS NOT NULL
UNION ALL
SELECT gen_random_uuid()::text, "id", "foto_2", 2 FROM "usuarios" WHERE "foto_2" IS NOT NULL;