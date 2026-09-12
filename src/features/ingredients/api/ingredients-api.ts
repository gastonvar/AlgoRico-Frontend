import { apiClient, unwrapData, unwrapList, type ApiEnvelope } from '@/lib/api-client';
import type { ListIngredientsParams } from '@/types/api';
import type { Ingredient, Paginated } from '@/types/domain';

export type CreateIngredientInput = {
  name: string;
  unit: Ingredient['unit'];
  pricePerUnit: number;
  notes?: string;
};

export type UpdateIngredientInput = {
  name?: string;
  unit?: Ingredient['unit'];
  pricePerUnit?: number;
  notes?: string | null;
};

export async function listIngredients(params: ListIngredientsParams): Promise<Paginated<Ingredient>> {
  const response = await apiClient.get('/api/ingredients', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      q: params.q || undefined,
    },
  });
  return unwrapList<Ingredient>(response);
}

export async function getIngredient(ingredientId: string): Promise<Ingredient> {
  const response = await apiClient.get<ApiEnvelope<Ingredient>>(`/api/ingredients/${ingredientId}`);
  return unwrapData(response);
}

export async function createIngredient(input: CreateIngredientInput): Promise<Ingredient> {
  const response = await apiClient.post<ApiEnvelope<Ingredient>>('/api/ingredients', input);
  return unwrapData(response);
}

export async function updateIngredient(ingredientId: string, input: UpdateIngredientInput): Promise<Ingredient> {
  const response = await apiClient.patch<ApiEnvelope<Ingredient>>(`/api/ingredients/${ingredientId}`, input);
  return unwrapData(response);
}

export async function deleteIngredient(ingredientId: string): Promise<void> {
  await apiClient.delete(`/api/ingredients/${ingredientId}`);
}
