import { apiClient, unwrapData, unwrapList, type ApiEnvelope } from '@/lib/api-client';
import type { ListRecipesParams } from '@/types/api';
import type { Paginated, Recipe } from '@/types/domain';

export type RecipeIngredientInput = {
  ingredientId: string;
  quantity: number;
  notes?: string;
};

export type CreateRecipeInput = {
  name: string;
  description?: string;
  notes?: string;
  ingredients: RecipeIngredientInput[];
};

export type UpdateRecipeInput = {
  name?: string;
  description?: string | null;
  notes?: string | null;
  ingredients?: RecipeIngredientInput[];
};

export async function listRecipes(params: ListRecipesParams): Promise<Paginated<Recipe>> {
  const response = await apiClient.get('/api/recipes', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      q: params.q || undefined,
    },
  });
  return unwrapList<Recipe>(response);
}

export async function getRecipe(recipeId: string): Promise<Recipe> {
  const response = await apiClient.get<ApiEnvelope<Recipe>>(`/api/recipes/${recipeId}`);
  return unwrapData(response);
}

export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
  const response = await apiClient.post<ApiEnvelope<Recipe>>('/api/recipes', input);
  return unwrapData(response);
}

export async function updateRecipe(recipeId: string, input: UpdateRecipeInput): Promise<Recipe> {
  const response = await apiClient.patch<ApiEnvelope<Recipe>>(`/api/recipes/${recipeId}`, input);
  return unwrapData(response);
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  await apiClient.delete(`/api/recipes/${recipeId}`);
}
