import { z } from 'zod';

export const fineZodSchema = z.object({
  // Acepta 'estudiante' que es el nombre en tu <select>
  estudiante: z
    .string({ required_error: 'Debe seleccionar un estudiante' })
    .min(1, 'El estudiante es obligatorio'),
    
  monto: z
    .number({ required_error: 'El monto es obligatorio' })
    .positive('El monto debe ser mayor a 0'),
    
  motivo: z
    .string({ required_error: 'El motivo es obligatorio' })
    .min(5, 'El motivo debe tener al menos 5 caracteres'),
    
  fecha: z
    .string({ required_error: 'La fecha es obligatoria' })
    .min(1, 'Seleccione una fecha válida'),
    
  estado: z
    .enum(['pendiente', 'pagada'])
    .default('pendiente')
});