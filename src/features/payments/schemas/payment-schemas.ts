import { z } from 'zod';
import { PAYMENT_METHODS, PAYMENT_TYPES } from '@/types/domain';

export const paymentFormSchema = z.object({
  amount: z.coerce.number().positive('El monto debe ser mayor a 0.'),
  type: z.enum(PAYMENT_TYPES),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paidAt: z.string().min(1, 'La fecha es obligatoria.'),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
