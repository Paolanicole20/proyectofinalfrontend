import { z } from 'zod';

export const studentZodSchema = z.object({
  matricula: z
    .string({ required_error: 'La matrícula es requerida' })
    .regex(/^EST-\d{4}-\d{3}$/, 'Formato inválido. Use: EST-YYYY-###'),

  nombres: z
    .string({ required_error: 'Los nombres son requeridos' })
    .min(3, 'Mínimo 3 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),

  apellidos: z
    .string({ required_error: 'Los apellidos son requeridos' })
    .min(3, 'Mínimo 3 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),

  correo: z
    .string({ required_error: 'El correo es requerido' })
    .email('Formato de correo inválido'),

  telefono: z
    .string({ required_error: 'El teléfono es requerido' })
    .regex(/^\d{4}-\d{4}$/, 'Formato inválido (####-####)'), // Eliminado el optional para que coincida con el backend

  grado: z
    .string({ required_error: 'El grado es requerido' })
    .refine((val) => val !== '', 'Debe seleccionar un grado'),

  seccion: z
    .string({ required_error: 'La sección es requerida' })
    .refine((val) => val !== '', 'Debe seleccionar una sección'),

  estado: z
    .enum(['activo', 'inactivo'])
    .default('activo')
});