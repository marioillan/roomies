import { z } from 'zod';

export const facturaSchema = z.object({
  tipo:              z.enum(['AGUA', 'LUZ', 'INTERNET', 'ALQUILER', 'OTRO']),
  descripcion:       z.string().max(500, 'Máximo 500 caracteres').nullable().optional(),
  importe_total:     z.coerce.number({ invalid_type_error: 'El importe debe ser un número' }).positive('El importe debe ser positivo'),
  fecha_emision:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de emisión inválida'),
  fecha_vencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de vencimiento inválida'),
});
