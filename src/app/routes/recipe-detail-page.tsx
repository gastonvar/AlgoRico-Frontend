import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { MoneyDisplay } from '@/components/common/money-display';
import { PageHeader } from '@/components/common/page-header';
import { PageSection } from '@/components/common/page-section';
import { Button } from '@/components/ui/button';
import { useDeleteRecipe, useRecipe } from '@/features/recipes/hooks/use-recipes';
import { ApiError, getErrorMessage } from '@/lib/api-error';
import { ingredientUnitLabels } from '@/utils/labels';
import { toast } from 'sonner';

export function RecipeDetailPage() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const recipeQuery = useRecipe(recipeId);
  const remove = useDeleteRecipe(recipeId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (recipeQuery.isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (recipeQuery.error instanceof ApiError && recipeQuery.error.status === 404) {
    return <ErrorState title="No encontramos esta receta." error={recipeQuery.error} />;
  }

  if (recipeQuery.error || !recipeQuery.data || !recipeId) {
    return <ErrorState error={recipeQuery.error} onRetry={() => void recipeQuery.refetch()} />;
  }

  const recipe = recipeQuery.data;
  const countLabel =
    recipe.ingredients.length === 1 ? '1 ingrediente' : `${recipe.ingredients.length} ingredientes`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <PageHeader
        title={recipe.name}
        description={recipe.description ?? 'Costo calculado con los ingredientes.'}
        backTo={{ to: '/recipes', label: 'Recetas' }}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={`/recipes/${recipe.id}/edit`}>Editar</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              Eliminar receta
            </Button>
          </>
        }
      />
      <PageSection title="Precio" description="Suma de cada ingrediente × cantidad.">
        <p className="text-2xl font-semibold">
          <MoneyDisplay amount={recipe.price} />
        </p>
      </PageSection>
      <PageSection title="Ingredientes" description={countLabel}>
        {recipe.ingredients.length === 0 ? (
          <p className="text-sm text-muted-foreground">Esta receta no tiene ingredientes.</p>
        ) : (
          <ul className="-mt-1 divide-y">
            {recipe.ingredients.map((line) => (
              <li key={line.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium">{line.ingredient?.name ?? 'Ingrediente'}</p>
                  <p className="text-sm text-muted-foreground">
                    {line.quantity} {line.ingredient ? ingredientUnitLabels[line.ingredient.unit] : ''}
                    {line.ingredient ? (
                      <>
                        {' '}
                        · <MoneyDisplay amount={line.ingredient.pricePerUnit} /> c/u
                      </>
                    ) : null}
                  </p>
                </div>
                <MoneyDisplay amount={line.lineCost} className="shrink-0 font-medium" />
              </li>
            ))}
          </ul>
        )}
      </PageSection>
      {recipe.notes ? (
        <PageSection title="Notas">
          <p className="whitespace-pre-wrap break-words text-sm">{recipe.notes}</p>
        </PageSection>
      ) : null}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar receta"
        description="No se puede eliminar si algún pedido la usa."
        confirmLabel="Eliminar"
        destructive
        pending={remove.isPending}
        onConfirm={async () => {
          try {
            await remove.mutateAsync(recipe.id);
            toast.success('Receta eliminada.');
            navigate('/recipes');
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
