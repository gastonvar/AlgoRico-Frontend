import { z } from 'zod';

const recipeIngredientSchema = z.object({
  lineId: z.string().optional(),
  ingredientId: z.string().min(1, 'Elegí un ingrediente.'),
  quantity: z.coerce.number().positive('La cantidad debe ser mayor a 0.'),
  notes: z.string().optional(),
});

export const recipeFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.'),
  description: z.string().optional(),
  notes: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema).min(1, 'Agregá al menos un ingrediente.'),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;
