import { z } from 'zod';
import { INGREDIENT_UNITS } from '@/types/domain';

export const ingredientFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.'),
  unit: z.enum(INGREDIENT_UNITS),
  pricePerUnit: z.coerce.number().nonnegative('El precio por unidad no puede ser negativo.'),
  notes: z.string().optional(),
});

export type IngredientFormValues = z.infer<typeof ingredientFormSchema>;
