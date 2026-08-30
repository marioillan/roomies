-- DropForeignKey
ALTER TABLE "asignaciones_tarea" DROP CONSTRAINT "asignaciones_tarea_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "eventos" DROP CONSTRAINT "eventos_creado_por_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_casero_id_fkey";

-- DropForeignKey
ALTER TABLE "mensajes" DROP CONSTRAINT "mensajes_remitente_id_fkey";

-- DropForeignKey
ALTER TABLE "pagos_factura" DROP CONSTRAINT "pagos_factura_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_anadido_por_id_fkey";

-- AlterTable
ALTER TABLE "asignaciones_tarea" ALTER COLUMN "usuario_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "eventos" ALTER COLUMN "creado_por_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "facturas" ALTER COLUMN "casero_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "mensajes" ALTER COLUMN "remitente_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pagos_factura" ALTER COLUMN "usuario_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "productos" ALTER COLUMN "anadido_por_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_remitente_id_fkey" FOREIGN KEY ("remitente_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_tarea" ADD CONSTRAINT "asignaciones_tarea_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_casero_id_fkey" FOREIGN KEY ("casero_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_factura" ADD CONSTRAINT "pagos_factura_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_anadido_por_id_fkey" FOREIGN KEY ("anadido_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
