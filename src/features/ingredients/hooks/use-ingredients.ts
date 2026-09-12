import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createIngredient,
  deleteIngredient,
  getIngredient,
  listIngredients,
  updateIngredient,
  type CreateIngredientInput,
  type UpdateIngredientInput,
} from '@/features/ingredients/api/ingredients-api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import type { ListIngredientsParams } from '@/types/api';

export function useIngredients(params: ListIngredientsParams) {
  return useQuery({
    queryKey: queryKeys.ingredients.list(params),
    queryFn: () => listIngredients(params),
  });
}

export function useIngredient(ingredientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.ingredients.detail(ingredientId ?? ''),
    queryFn: () => getIngredient(ingredientId as string),
    enabled: Boolean(ingredientId),
  });
}

function invalidateIngredientQueries(ingredientId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
  if (ingredientId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.detail(ingredientId) });
  }
}

export function useCreateIngredient() {
  return useMutation({
    mutationFn: (input: CreateIngredientInput) => createIngredient(input),
    onSuccess: (ingredient) => {
      invalidateIngredientQueries(ingredient.id);
    },
  });
}

export function useUpdateIngredient(ingredientId: string) {
  return useMutation({
    mutationFn: (input: UpdateIngredientInput) => updateIngredient(ingredientId, input),
    onSuccess: () => {
      invalidateIngredientQueries(ingredientId);
    },
  });
}

export function useDeleteIngredient() {
  return useMutation({
    mutationFn: (ingredientId: string) => deleteIngredient(ingredientId),
    onSuccess: () => {
      invalidateIngredientQueries();
    },
  });
}
