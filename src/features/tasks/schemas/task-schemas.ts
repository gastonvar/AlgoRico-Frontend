import { z } from 'zod';
import { TASK_PRIORITIES } from '@/types/domain';

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio.'),
  description: z.string().optional(),
  dueAt: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES),
  clientId: z.string().optional(),
  orderId: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
