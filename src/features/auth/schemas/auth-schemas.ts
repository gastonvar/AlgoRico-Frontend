import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Ingresá un correo válido.'),
  password: z.string().min(1, 'Ingresá la contraseña.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
