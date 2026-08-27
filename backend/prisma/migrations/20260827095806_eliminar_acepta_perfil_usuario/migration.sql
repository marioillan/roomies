/*
  Warnings:

  - You are about to drop the column `acepta_fumadores` on the `perfiles_convivencia_usuario` table. All the data in the column will be lost.
  - You are about to drop the column `acepta_mascotas` on the `perfiles_convivencia_usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "perfiles_convivencia_usuario" DROP COLUMN "acepta_fumadores",
DROP COLUMN "acepta_mascotas";
