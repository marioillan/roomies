/*
  Warnings:

  - You are about to drop the column `frecuencia_salidas` on the `perfiles_convivencia_grupo` table. All the data in the column will be lost.
  - You are about to drop the column `frecuencia_salidas` on the `perfiles_convivencia_usuario` table. All the data in the column will be lost.
  - You are about to drop the column `frecuencia_salidas` on the `preferencias_companero` table. All the data in the column will be lost.
  - You are about to drop the column `frecuencia_salidas_req` on the `preferencias_companero` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "perfiles_convivencia_grupo" DROP COLUMN "frecuencia_salidas";

-- AlterTable
ALTER TABLE "perfiles_convivencia_usuario" DROP COLUMN "frecuencia_salidas";

-- AlterTable
ALTER TABLE "preferencias_companero" DROP COLUMN "frecuencia_salidas",
DROP COLUMN "frecuencia_salidas_req";

-- DropEnum
DROP TYPE "frecuencia_salidas_enum";
