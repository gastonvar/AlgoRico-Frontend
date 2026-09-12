import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { useIngredients } from '@/features/ingredients/hooks/use-ingredients';
import { RecipeForm } from '@/features/recipes/components/recipe-form';
import { useRecipe, useUpdateRecipe } from '@/features/recipes/hooks/use-recipes';
import type { RecipeFormValues } from '@/features/recipes/schemas/recipe-schemas';
import { applyFieldErrors } from '@/lib/form-errors';
import { ApiError, getErrorMessage } from '@/lib/api-error';
import type { Recipe } from '@/types/domain';
import { toast } from 'sonner';

function valuesFromRecipe(recipe: Recipe): Partial<RecipeFormValues> {
  return {
    name: recipe.name,
    description: recipe.description ?? '',
    notes: recipe.notes ?? '',
    ingredients:
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((line) => ({
            lineId: line.id,
            ingredientId: line.ingredientId,
            quantity: line.quantity,
            notes: line.notes ?? '',
          }))
        : [{ lineId: undefined, ingredientId: '', quantity: 1, notes: '' }],
  };
}

export function EditRecipePage() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const recipeQuery = useRecipe(recipeId);
  const ingredients = useIngredients({ pageSize: 100 });
  const update = useUpdateRecipe(recipeId ?? '');
  const options = useMemo(() => ingredients.data?.data ?? [], [ingredients.data]);

  if (recipeQuery.isLoading || ingredients.isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (recipeQuery.error instanceof ApiError && recipeQuery.error.status === 404) {
    return <ErrorState title="No encontramos esta receta." error={recipeQuery.error} />;
  }

  if (recipeQuery.error || !recipeQuery.data || !recipeId) {
    return <ErrorState error={recipeQuery.error} onRetry={() => void recipeQuery.refetch()} />;
  }

  if (ingredients.error) {
    return <ErrorState error={ingredients.error} onRetry={() => void ingredients.refetch()} />;
  }

  const recipe = recipeQuery.data;

  async function handleSubmit(values: RecipeFormValues) {
    try {
      await update.mutateAsync({
        name: values.name,
        description: values.description || null,
        notes: values.notes || null,
        ingredients: values.ingredients.map((line) => ({
          ingredientId: line.ingredientId,
          quantity: Number(line.quantity),
          notes: line.notes || undefined,
        })),
      });
      toast.success('Receta actualizada.');
      navigate(`/recipes/${recipeId}`);
    } catch (error) {
      applyFieldErrors(error, () => undefined);
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Editar receta"
        description="Cambiá ingredientes o cantidades. El precio se recalcula solo."
        backTo={{ to: `/recipes/${recipeId}`, label: 'Receta' }}
      />
      <RecipeForm
        ingredients={options}
        initialValues={valuesFromRecipe(recipe)}
        onSubmit={handleSubmit}
        pending={update.isPending}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
