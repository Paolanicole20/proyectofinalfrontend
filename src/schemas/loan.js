import { z } from 'zod';

export const loanZodSchema = z.object({
  // Aceptamos ambos nombres como opcionales, pero validamos que al menos uno tenga datos
  estudiante: z.string().optional(),
  estudianteId: z.string().optional(),
  libro: z.string().optional(),
  libroId: z.string().optional(),
  
  fechaPrestamo: z.string().min(1, 'La fecha es requerida'),
  fechaDevolucionEsperada: z.string().min(1, 'La fecha es requerida'),
  estado: z.enum(['activo', 'devuelto']).default('activo'),
}).refine(data => data.estudiante || data.estudianteId, {
  message: "Debe seleccionar un estudiante",
  path: ["estudiante"]
}).refine(data => data.libro || data.libroId, {
  message: "Debe seleccionar un libro",
  path: ["libro"]
});