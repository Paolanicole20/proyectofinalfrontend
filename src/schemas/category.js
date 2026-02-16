import { z } from 'zod';

export const categoryZodSchema = z.object({
  // Validación de código con el formato CAT-###
  codigo: z
    .string({ required_error: 'El código es requerido' })
    .trim()
    .toUpperCase()
    .regex(/^CAT-\d{3}$/, 'Formato inválido. Use: CAT-###'),

  nombre: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres'),

  
  descripcion: z
    .string()
    .max(300, 'La descripción no puede exceder 300 caracteres')
    .optional()
    .or(z.literal('')), // Esto permite que el campo se envíe vacío sin dar error
});