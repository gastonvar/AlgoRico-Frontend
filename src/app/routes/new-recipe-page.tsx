import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { useIngredients } from '@/features/ingredients/hooks/use-ingredients';
import { RecipeForm } from '@/features/recipes/components/recipe-form';
import { useCreateRecipe } from '@/features/recipes/hooks/use-recipes';
import type { RecipeFormValues } from '@/features/recipes/schemas/recipe-schemas';
import { applyFieldErrors } from '@/lib/form-errors';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from 'sonner';

export function NewRecipePage() {
  const navigate = useNavigate();
  const ingredients = useIngredients({ pageSize: 100 });
  const create = useCreateRecipe();
  const options = useMemo(() => ingredients.data?.data ?? [], [ingredients.data]);

  async function handleSubmit(values: RecipeFormValues) {
    try {
      const recipe = await create.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        notes: values.notes || undefined,
        ingredients: values.ingredients.map((line) => ({
          ingredientId: line.ingredientId,
          quantity: Number(line.quantity),
          notes: line.notes || undefined,
        })),
      });
      toast.success('Receta creada.');
      navigate(`/recipes/${recipe.id}`);
    } catch (error) {
      applyFieldErrors(error, () => undefined);
      toast.error(getErrorMessage(error));
    }
  }

  if (ingredients.isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (ingredients.error) {
    return <ErrorState error={ingredients.error} onRetry={() => void ingredients.refetch()} />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Nueva receta"
        description="El precio se calcula con el costo de cada ingrediente."
        backTo={{ to: '/recipes', label: 'Recetas' }}
      />
      {options.length === 0 ? (
        <EmptyState
          title="Primero cargá ingredientes."
          description="La receta necesita al menos un ingrediente de la despensa."
          actionLabel="Nuevo ingrediente"
          onAction={() => navigate('/ingredients?new=1')}
        />
      ) : (
        <RecipeForm ingredients={options} onSubmit={handleSubmit} pending={create.isPending} />
      )}
    </div>
  );
}
