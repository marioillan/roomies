-- CreateTable
CREATE TABLE "solicitudes_union" (
    "id" VARCHAR(36) NOT NULL,
    "usuario_id" VARCHAR(36) NOT NULL,
    "grupo_id" VARCHAR(36) NOT NULL,
    "estado" "estado_solicitud_enum" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_solicitud" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_union_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_union_usuario_id_grupo_id_key" ON "solicitudes_union"("usuario_id", "grupo_id");

-- AddForeignKey
ALTER TABLE "solicitudes_union" ADD CONSTRAINT "solicitudes_union_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_union" ADD CONSTRAINT "solicitudes_union_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
