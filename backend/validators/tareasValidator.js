import { z } from 'zod';

export const zonaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
});
