import { z } from 'zod';

export const añadirSchema = z.object({
  nombre:    z.string().min(1, 'El nombre es obligatorio').max(255).trim(),
  categoria: z.enum(['comida', 'hogar', 'limpieza', 'otros']).optional(),
});

export const editarSchema = z.object({
  nombre:    z.string().min(1, 'El nombre es obligatorio').max(255).trim().optional(),
  categoria: z.enum(['comida', 'hogar', 'limpieza', 'otros']).optional(),
});
