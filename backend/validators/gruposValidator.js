import { z } from 'zod';

const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

export const crearGrupoSchema = z.object({
  nombre:       z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  dia_limpieza: z.enum(DIAS_SEMANA).optional().nullable(),
});

export const editarGrupoSchema = z.object({
  nombre:           z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  dia_limpieza:     z.enum(DIAS_SEMANA).optional().nullable(),
  descripcion:      z.string().min(1, 'La descripción es obligatoria').max(500, 'Máximo 500 caracteres'),
  ciudad:           z.string().max(100).optional().nullable(),
  buscar_companero: z.boolean().optional().nullable(),
});

export const grupoConvivenciaSchema = z.object({
  horario:            z.enum(['MADRUGADOR', 'INTERMEDIO', 'NOCTURNO']),
  ambiente:           z.enum(['TRANQUILO', 'EQUILIBRADO', 'SOCIAL']),
  frecuencia_visitas: z.enum(['CASI_NUNCA', 'A_VECES', 'FRECUENTE']),
  tolerancia_fiestas: z.enum(['NUNCA', 'OCASIONAL', 'FRECUENTE']),
  ocupacion:          z.enum(['ESTUDIO', 'TRABAJO', 'ESTUDIO_Y_TRABAJO']),
  limpieza_orden:     z.enum(['DESPREOCUPADO', 'FLEXIBLE', 'ORDENADO']),
  nivel_ruido:        z.enum(['SILENCIO_TOTAL', 'MODERADO', 'INDIFERENTE']),
  frecuencia_salidas: z.enum(['NUNCA', 'OCASIONAL', 'FRECUENTE']).nullable().optional(),
  acepta_fumadores:   z.enum(['SI', 'NO', 'INDIFERENTE']).nullable().optional(),
  acepta_mascotas:    z.enum(['SI', 'NO', 'DEPENDE']).nullable().optional(),
  lgbtq_friendly:     z.boolean().nullable().optional(),
});

export const publicacionSchema = z.object({
  titulo:               z.string().min(5, 'El título debe tener al menos 5 caracteres').max(255),
  descripcion:          z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500, 'Máximo 500 caracteres'),
  ciudad:               z.string().min(2, 'La ciudad es obligatoria').max(100),
  direccion:            z.string().min(3, 'La dirección es obligatoria').max(255),
  piso_puerta:          z.string().max(50).nullable().optional(),
  precio:               z.number({ invalid_type_error: 'El precio debe ser un número' }).positive('El precio debe ser positivo'),
  habitaciones_libres:  z.number().int().min(1, 'Mínimo 1 habitación libre').default(1),
  tipo_piso:            z.string().min(1, 'El tipo de vivienda es obligatorio'),
  habitaciones_totales: z.number({ required_error: 'Las habitaciones totales son obligatorias' }).int().positive('Debe ser mayor que 0'),
  tamano_piso:          z.number({ required_error: 'El tamaño es obligatorio' }).positive('Debe ser mayor que 0'),
  planta:               z.number({ required_error: 'La planta es obligatoria' }).int().min(0, 'No puede ser negativa'),
  ascensor:             z.boolean({ required_error: 'Indica si el piso tiene ascensor' }),
  wifi:                 z.boolean().default(false),
  lavadora:             z.boolean().default(false),
  lavavajillas:         z.boolean().default(false),
  aire_acondicionado:   z.boolean().default(false),
  calefaccion:          z.boolean().default(false),
  parking:              z.boolean().default(false),
  terraza:              z.boolean().default(false),
  amueblado:            z.boolean().default(false),
  permite_fumar:        z.boolean().default(false),
  permite_mascotas:     z.boolean().default(false),
  visitas:              z.string().nullable().optional(),
  horario_silencio:     z.string().nullable().optional(),
  genero_preferido:     z.string().nullable().optional(),
  normas_adicionales:   z.string().nullable().optional(),
  modo_contacto:        z.enum(['CHAT', 'TELEFONO', 'AMBOS']).default('CHAT'),
  telefono_contacto:    z.string().max(20).nullable().optional(),
  visible:              z.boolean().default(true),
  latitud:              z.number().nullable().optional(),
  longitud:             z.number().nullable().optional(),
}).superRefine((data, ctx) => {
  if ((data.modo_contacto === 'TELEFONO' || data.modo_contacto === 'AMBOS') && !data.telefono_contacto?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El teléfono es obligatorio para este modo de contacto',
      path: ['telefono_contacto'],
    });
  }
});

export const eventoSchema = z.object({
  titulo:       z.string().min(1, 'El título es obligatorio').max(255),
  descripcion:  z.string().max(1000).nullable().optional(),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fecha_fin:    z.string().nullable().optional(),
});

export const interesesSchema = z.object({
  intereses: z.array(z.number().int().positive()).max(20),
});

export const transferirAdminSchema = z.object({
  nuevo_admin_id: z.string().uuid(),
});
