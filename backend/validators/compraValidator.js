import { z } from 'zod';

export const añadirSchema = z.object({
  nombre:        z.string().min(1, 'El nombre es obligatorio').max(255).trim(),
  cantidad:      z.number().positive().optional(),
  unidad_medida: z.string().max(50).trim().optional(),
  categoria:     z.enum(['comida', 'hogar', 'limpieza', 'otros']).optional(),
});

export const editarSchema = z.object({
  nombre:        z.string().min(1, 'El nombre es obligatorio').max(255).trim().optional(),
  cantidad:      z.number().positive().optional(),
  unidad_medida: z.string().max(50).trim().nullable().optional(),
  categoria:     z.enum(['comida', 'hogar', 'limpieza', 'otros']).optional(),
});
