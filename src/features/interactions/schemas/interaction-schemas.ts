import { z } from 'zod';
import { INTERACTION_CHANNELS } from '@/types/domain';

export const interactionFormSchema = z.object({
  channel: z.enum(INTERACTION_CHANNELS),
  occurredAt: z.string().min(1, 'La fecha y hora son obligatorias.'),
  content: z.string().trim().min(1, 'Escribí de qué hablaron.'),
});

export type InteractionFormValues = z.infer<typeof interactionFormSchema>;
