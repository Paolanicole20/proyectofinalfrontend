import { z } from 'zod';

export const loanZodSchema = z.object({
  
  estudianteId: z
    .string({ required_error: 'Debe seleccionar un estudiante' })
    .min(1, 'El ID del estudiante es obligatorio'),

  libroId: z
    .string({ required_error: 'Debe seleccionar un libro' })
    .min(1, 'El ID del libro es obligatorio'),

  fechaPrestamo: z
    .string({ required_error: 'La fecha de préstamo es requerida' })
    .or(z.date()), // Acepta string de input date o un objeto Date

  fechaDevolucionEsperada: z
    .string({ required_error: 'La fecha de devolución esperada es requerida' })
    .or(z.date()),

  estado: z
    .enum(['activo', 'devuelto'])
    .default('activo'),

}).refine((data) => {
  // Validación lógica de los 15 días 
  const inicio = new Date(data.fechaPrestamo);
  const fin = new Date(data.fechaDevolucionEsperada);
  
  // Calculamos la diferencia en milisegundos y luego a días
  const diffTime = fin - inicio;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 1 && diffDays <= 15;
}, {
  message: "La fecha de devolución debe ser entre 1 y 15 días después del préstamo",
  path: ["fechaDevolucionEsperada"], // El error se mostrará en este campo
});