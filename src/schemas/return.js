import { z } from 'zod';

export const returnZodSchema = z.object({
  
  prestamoId: z
    .string({ required_error: 'Debe seleccionar un préstamo' })
    .min(1, 'El ID del préstamo es obligatorio'),

  fechaDevolucionReal: z
    .string({ required_error: 'La fecha de devolución es requerida' })
    .or(z.date()),

  
  estadoLibro: z
    .enum(['excelente', 'bueno', 'regular', 'dañado'], {
      errorMap: () => ({ message: 'Seleccione un estado de libro válido' }),
    }),

  
  observaciones: z
    .string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),

  
  diasRetraso: z
    .number()
    .min(0, 'Los días de retraso no pueden ser negativos')
    .default(0)
    .optional(),
});