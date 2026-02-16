import { z } from 'zod';

// 1. Esquema base
export const userZodSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .min(1, 'El nombre no puede estar vacío'),

  apellido: z
    .string({ required_error: 'El apellido es obligatorio' })
    .min(1, 'El apellido no puede estar vacío'),

  email: z
    .string({ required_error: 'El email es obligatorio' })
    .email('El formato del email no es válido'),

  telefono: z
    .string()
    .optional()
    .nullable(),

  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),

  rol: z
    .enum(['ADMIN_ROLE', 'INVENTORY_ROLE', 'SALES_ROLE', 'USER_ROLE'], {
      errorMap: (issue, ctx) => ({
        message: `${ctx.data} no es un rol válido`,
      }),
    })
    .default('USER_ROLE'),

  status: z
    .enum(['active', 'inactive'], {
      errorMap: (issue, ctx) => ({
        message: `${ctx.data} no es un estado válido`,
      }),
    })
    .default('active'),
});

// 2. Login (Solo email y password)
export const loginSchema = userZodSchema.pick({
  email: true,
  password: true,
});

// 3. Editar (Sin password)
export const userWithoutPasswordSchema = userZodSchema.omit({ 
  password: true 
});

// 4. Cambio de Contraseña
export const changePasswordSchema = z.object({
  oldPassword: z
    .string({ required_error: 'La contraseña actual es obligatoria' }),
  newPassword: z
    .string({ required_error: 'La nueva contraseña es obligatoria' })
    .min(6, 'Debe tener al menos 6 caracteres'),
});