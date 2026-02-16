import { z } from 'zod';

export const bookZodSchema = z.object({
  isbn: z
    .string({ required_error: 'El ISBN es requerido' })
    .trim()
    .min(1, 'El ISBN no puede estar vacío'),

  titulo: z
    .string({ required_error: 'El título es requerido' })
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres'),

  autor: z
    .string({ required_error: 'El autor es requerido' })
    .trim()
    .min(1, 'El nombre del autor es obligatorio'),

  editorial: z
    .string({ required_error: 'La editorial es requerida' })
    .trim(),

  
  anioPublicacion: z
    .number({ 
      required_error: 'El año es requerido',
      invalid_type_error: 'Debe ser un número' 
    })
    .min(1900, 'El año debe ser mayor a 1900')
    .max(2026, 'El año no puede ser mayor a 2026'),

  
  categoryId: z
    .string({ required_error: 'La categoría es requerida' })
    .min(1, 'Debe seleccionar una categoría'),

  cantidadDisponible: z
    .number({ 
      required_error: 'La cantidad es requerida',
      invalid_type_error: 'Debe ser un número' 
    })
    .min(0, 'La cantidad no puede ser negativa'),

  ubicacion: z
    .string({ required_error: 'La ubicación es requerida' })
    .trim(),

  descripcion: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')), // Permite que esté vacío
});