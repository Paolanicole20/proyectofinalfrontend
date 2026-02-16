import { z } from 'zod';

export const fineZodSchema = z.object({
  
  estudianteId: z
    .string({ required_error: 'Debe seleccionar un estudiante' })
    .min(1, 'El ID del estudiante es obligatorio'),

  // Agregamos prestamoId 
  prestamoId: z
    .string({ required_error: 'La multa debe estar vinculada a un préstamo' })
    .min(1, 'El ID del préstamo es obligatorio'),

  monto: z
    .number({ 
      required_error: 'El monto es requerido',
      invalid_type_error: 'El monto debe ser un número' 
    })
    .positive('El monto debe ser mayor a cero'),

  
  motivo: z
    .string()
    .optional(),

  estado: z
    .enum(['pendiente', 'pagado'])
    .default('pendiente'),
});