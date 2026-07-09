import { z } from 'zod';

const importePersonalizadoSchema = z.object({
  usuario_id: z.string().uuid('usuario_id inválido'),
  importe:    z.coerce.number({ invalid_type_error: 'El importe debe ser un número' }).positive('El importe debe ser positivo'),
});

export const facturaSchema = z.object({
  tipo:              z.enum(['AGUA', 'LUZ', 'INTERNET', 'ALQUILER', 'OTRO']),
  descripcion:       z.string().max(500, 'Máximo 500 caracteres').nullable().optional(),
  importe_total:     z.coerce.number({ invalid_type_error: 'El importe debe ser un número' }).positive('El importe debe ser positivo'),
  fecha_emision:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de emisión inválida'),
  fecha_vencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de vencimiento inválida'),
  tipo_division:     z.enum(['EQUITATIVA', 'PERSONALIZADA']).default('EQUITATIVA'),
  importes_personalizados: z.preprocess((val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  }, z.array(importePersonalizadoSchema)).optional(),
}).superRefine((data, ctx) => {
  if (data.tipo_division !== 'PERSONALIZADA') return;

  if (!data.importes_personalizados || data.importes_personalizados.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Debes indicar el importe de cada miembro',
      path: ['importes_personalizados'],
    });
    return;
  }

  const suma = data.importes_personalizados.reduce((acc, i) => acc + i.importe, 0);
  const diferencia = Math.round((suma - data.importe_total) * 100) / 100;
  if (Math.abs(diferencia) > 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `La suma de los importes (${suma.toFixed(2)}) no coincide con el importe total (${data.importe_total.toFixed(2)})`,
      path: ['importes_personalizados'],
    });
  }
});
