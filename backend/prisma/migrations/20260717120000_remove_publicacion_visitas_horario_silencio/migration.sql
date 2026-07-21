-- Campos sin uso: nunca se muestran ni se editan desde el frontend.
ALTER TABLE "publicaciones"
  DROP COLUMN "visitas",
  DROP COLUMN "horario_silencio";
