import { z } from 'zod';

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.'),
  phone: z.string().trim().optional(),
  instagramUsername: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Ingresá un correo válido.'),
  notes: z.string().optional(),
  needsFollowUp: z.boolean().optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
