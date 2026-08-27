/*
  Warnings:

  - You are about to drop the column `foto_1` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `foto_2` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `foto_perfil` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "foto_1",
DROP COLUMN "foto_2",
DROP COLUMN "foto_perfil";
