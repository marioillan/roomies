/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `intereses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "intereses_nombre_key" ON "intereses"("nombre");
