import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  updateRecipe,
  type CreateRecipeInput,
  type UpdateRecipeInput,
} from '@/features/recipes/api/recipes-api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import type { ListRecipesParams } from '@/types/api';

export function useRecipes(params: ListRecipesParams) {
  return useQuery({
    queryKey: queryKeys.recipes.list(params),
    queryFn: () => listRecipes(params),
  });
}

export function useRecipe(recipeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.recipes.detail(recipeId ?? ''),
    queryFn: () => getRecipe(recipeId as string),
    enabled: Boolean(recipeId),
  });
}

function invalidateRecipeQueries(recipeId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  if (recipeId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.recipes.detail(recipeId) });
  }
}

export function useCreateRecipe() {
  return useMutation({
    mutationFn: (input: CreateRecipeInput) => createRecipe(input),
    onSuccess: (recipe) => {
      invalidateRecipeQueries(recipe.id);
    },
  });
}

export function useUpdateRecipe(recipeId: string) {
  return useMutation({
    mutationFn: (input: UpdateRecipeInput) => updateRecipe(recipeId, input),
    onSuccess: () => {
      invalidateRecipeQueries(recipeId);
    },
  });
}

export function useDeleteRecipe(recipeId?: string) {
  return useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      invalidateRecipeQueries(recipeId);
    },
  });
}
