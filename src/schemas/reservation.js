import { z } from 'zod';

export const reservationZodSchema = z.object({
  
  estudianteId: z
    .string({ required_error: 'Debe seleccionar un estudiante' })
    .min(1, 'El ID del estudiante es obligatorio'),

  libroId: z
    .string({ required_error: 'Debe seleccionar un libro' })
    .min(1, 'El ID del libro es obligatorio'),

  fechaReservacion: z
    .string({ required_error: 'La fecha de reservación es requerida' })
    .or(z.date()),

  fechaVencimiento: z
    .string({ required_error: 'La fecha de vencimiento es requerida' })
    .or(z.date()),

  
  estado: z
    .enum(['pendiente', 'disponible', 'completada', 'cancelada'])
    .default('pendiente'),

}).refine((data) => {
  
  const inicio = new Date(data.fechaReservacion);
  const fin = new Date(data.fechaVencimiento);
  
  const diffTime = fin - inicio;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 1 && diffDays <= 7;
}, {
  message: "La reservación debe durar entre 1 y 7 días",
  path: ["fechaVencimiento"], 
});