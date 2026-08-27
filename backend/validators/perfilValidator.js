import { z } from 'zod';

export const editarPerfilSchema = z.object({
  nombre:              z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  genero:              z.string().min(1, 'Selecciona tu género'),
  fecha_nacimiento:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  pais:                z.string().min(1, 'Selecciona tu país'),
  ocupacion:           z.enum(['ESTUDIO', 'TRABAJO', 'ESTUDIO_Y_TRABAJO']),
  horario:             z.enum(['MADRUGADOR', 'INTERMEDIO', 'NOCTURNO']),
  frecuencia_visitas:  z.enum(['CASI_NUNCA', 'A_VECES', 'FRECUENTE']),
  ambiente:            z.enum(['TRANQUILO', 'EQUILIBRADO', 'SOCIAL']),
  tolerancia_fiestas:  z.enum(['NUNCA', 'OCASIONAL', 'FRECUENTE']),
  limpieza_orden:      z.enum(['DESPREOCUPADO', 'FLEXIBLE', 'ORDENADO']),
  nivel_ruido:         z.enum(['SILENCIO_TOTAL', 'MODERADO', 'ALTO']),
  fumador:             z.boolean(),
  tiene_mascotas:      z.boolean(),
  lgbtq_friendly:      z.boolean(),
  sobre_mi:            z.string().min(1, 'La descripción es obligatoria').max(500, 'Máximo 500 caracteres'),
});

export const interesesSchema = z.object({
  intereses: z.array(z.number().int().positive()).min(3, 'Selecciona al menos 3 intereses').max(20),
});

export const preferenciasSchema = z.object({
  ocupacion:               z.enum(['ESTUDIO', 'TRABAJO', 'ESTUDIO_Y_TRABAJO']).nullable().optional(),
  ocupacion_req:           z.boolean().nullable().optional(),
  horario:                 z.enum(['MADRUGADOR', 'INTERMEDIO', 'NOCTURNO']).nullable().optional(),
  horario_req:             z.boolean().nullable().optional(),
  frecuencia_visitas:      z.enum(['CASI_NUNCA', 'A_VECES', 'FRECUENTE']).nullable().optional(),
  frecuencia_visitas_req:  z.boolean().nullable().optional(),
  ambiente:                z.enum(['TRANQUILO', 'EQUILIBRADO', 'SOCIAL']).nullable().optional(),
  ambiente_req:            z.boolean().nullable().optional(),
  tolerancia_fiestas:      z.enum(['NUNCA', 'OCASIONAL', 'FRECUENTE']).nullable().optional(),
  tolerancia_fiestas_req:  z.boolean().nullable().optional(),
  acepta_fumadores:        z.enum(['SI', 'NO', 'INDIFERENTE']).nullable().optional(),
  acepta_fumadores_req:    z.boolean().nullable().optional(),
  acepta_mascotas:         z.enum(['SI', 'NO', 'DEPENDE']).nullable().optional(),
  acepta_mascotas_req:     z.boolean().nullable().optional(),
  lgbtq_friendly:          z.boolean().nullable().optional(),
  lgbtq_friendly_req:      z.boolean().nullable().optional(),
  limpieza_orden:          z.enum(['DESPREOCUPADO', 'FLEXIBLE', 'ORDENADO']).nullable().optional(),
  limpieza_orden_req:      z.boolean().nullable().optional(),
  nivel_ruido:             z.enum(['SILENCIO_TOTAL', 'MODERADO', 'ALTO']).nullable().optional(),
  nivel_ruido_req:         z.boolean().nullable().optional(),
});
