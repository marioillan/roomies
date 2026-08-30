/*
  Warnings:

  - Made the column `ocupacion` on table `perfiles_convivencia_grupo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `horario` on table `perfiles_convivencia_grupo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `frecuencia_visitas` on table `perfiles_convivencia_grupo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ambiente` on table `perfiles_convivencia_grupo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tolerancia_fiestas` on table `perfiles_convivencia_grupo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `acepta_fumadores` on table `perfiles_convivencia_grupo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `acepta_mascotas` on table `perfiles_convivencia_grupo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lgbtq_friendly` on table `perfiles_convivencia_grupo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `limpieza_orden` on table `perfiles_convivencia_grupo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nivel_ruido` on table `perfiles_convivencia_grupo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pais` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `genero` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fecha_nacimiento` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ocupacion` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `horario` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `frecuencia_visitas` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ambiente` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tolerancia_fiestas` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fumador` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tiene_mascotas` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lgbtq_friendly` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `limpieza_orden` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nivel_ruido` on table `perfiles_convivencia_usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "perfiles_convivencia_grupo" ALTER COLUMN "ocupacion" SET NOT NULL,
ALTER COLUMN "horario" SET NOT NULL,
ALTER COLUMN "frecuencia_visitas" SET NOT NULL,
ALTER COLUMN "ambiente" SET NOT NULL,
ALTER COLUMN "tolerancia_fiestas" SET NOT NULL,
ALTER COLUMN "acepta_fumadores" SET NOT NULL,
ALTER COLUMN "acepta_mascotas" SET NOT NULL,
ALTER COLUMN "lgbtq_friendly" SET NOT NULL,
ALTER COLUMN "limpieza_orden" SET NOT NULL,
ALTER COLUMN "nivel_ruido" SET NOT NULL;

-- AlterTable
ALTER TABLE "perfiles_convivencia_usuario" ALTER COLUMN "pais" SET NOT NULL,
ALTER COLUMN "genero" SET NOT NULL,
ALTER COLUMN "fecha_nacimiento" SET NOT NULL,
ALTER COLUMN "ocupacion" SET NOT NULL,
ALTER COLUMN "horario" SET NOT NULL,
ALTER COLUMN "frecuencia_visitas" SET NOT NULL,
ALTER COLUMN "ambiente" SET NOT NULL,
ALTER COLUMN "tolerancia_fiestas" SET NOT NULL,
ALTER COLUMN "fumador" SET NOT NULL,
ALTER COLUMN "tiene_mascotas" SET NOT NULL,
ALTER COLUMN "lgbtq_friendly" SET NOT NULL,
ALTER COLUMN "limpieza_orden" SET NOT NULL,
ALTER COLUMN "nivel_ruido" SET NOT NULL;
