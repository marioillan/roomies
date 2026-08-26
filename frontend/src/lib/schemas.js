import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export const editarPerfilSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  genero: z.string().min(1, 'El género es obligatorio'),
  pais: z.string().min(1, 'El país es obligatorio'),
  fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  sobre_mi: z.string().max(399, 'Máximo 399 caracteres').optional(),
})

export const editarGrupoSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  dia_limpieza: z.string().optional(),
  descripcion: z.string().max(500, 'Máximo 500 caracteres').optional(),
  ciudad: z.string().max(100).optional(),
  buscar_companero: z.boolean().optional().nullable(),
})

export const crearGrupoSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  dia_limpieza: z.string().optional(),
})

export const convivenciaSchema = z.object({
  ocupacion: z.string().optional(),
  horario: z.string().optional(),
  frecuencia_visitas: z.string().optional(),
  ambiente: z.string().optional(),
  tolerancia_fiestas: z.string().optional(),
  fumador: z.boolean().optional(),
  acepta_fumadores: z.string().optional(),
  tiene_mascotas: z.boolean().optional(),
  acepta_mascotas: z.string().optional(),
  lgbtq_friendly: z.boolean().optional(),
}).superRefine((data, ctx) => {
  const rellenos = Object.values(data).filter(v => v !== '' && v !== undefined && v !== null).length
  if (rellenos < 3) {
    ctx.addIssue({ code: 'custom', message: 'Debes rellenar al menos 3 campos para guardar el perfil', path: ['_form'] })
  }
})

export const publicacionSchema = z.object({
  titulo: z.string().min(5, 'Mínimo 5 caracteres').max(255, 'Máximo 255 caracteres'),
  descripcion: z.string().min(10, 'Mínimo 10 caracteres'),
  precio: z.coerce.number({ invalid_type_error: 'Introduce un precio válido' }).positive('El precio debe ser positivo'),
  ciudad: z.string().min(2, 'La ciudad es obligatoria').max(100),
  habitaciones_libres: z.coerce.number().int().min(1, 'Mínimo 1').default(1),
  tamano_piso: z.union([z.coerce.number().positive(), z.literal('')]).optional(),
  genero_preferido: z.string().optional(),
  visible: z.boolean().default(true),
})

export const registroSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/\d/, 'Debe contener al menos un número'),
})
