import { z } from 'zod';
import { FULFILLMENT_TYPES, ORDER_STATUSES } from '@/types/domain';

const orderItemSchema = z.object({
  itemId: z.string().optional(),
  recipeId: z.string().min(1, 'Elegí una receta.'),
  description: z.string().optional(),
  quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a 0.'),
  unitPrice: z.coerce.number().nonnegative('El precio no puede ser negativo.'),
  notes: z.string().optional(),
});

const optionalDate = z
  .string()
  .optional()
  .transform((value) => (value?.trim() ? value : undefined));

export const orderFormSchema = z
  .object({
    clientId: z.string().min(1, 'Elegí un cliente.'),
    eventDate: optionalDate,
    eventTime: optionalDate,
    status: z.enum(ORDER_STATUSES).optional(),
    fulfillmentType: z.enum(FULFILLMENT_TYPES),
    deliveryDate: optionalDate,
    deliveryAddress: z.string().optional(),
    deliveryTime: optionalDate,
    notes: z.string().optional(),
    description: z.string().optional(),
    totalAmount: z.coerce.number().nonnegative('El precio final es obligatorio.'),
    items: z.array(orderItemSchema),
  })
  .superRefine((value, ctx) => {
    if (value.fulfillmentType === 'DELIVERY' && !value.deliveryAddress?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['deliveryAddress'],
        message: 'La dirección es obligatoria para envíos.',
      });
    }
  });

export type OrderFormValues = z.infer<typeof orderFormSchema>;
