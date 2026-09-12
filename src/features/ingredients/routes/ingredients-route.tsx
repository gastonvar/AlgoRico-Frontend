import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { PaginationControls } from '@/components/common/pagination-controls';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { IngredientFormDialog } from '@/features/ingredients/components/ingredient-form-dialog';
import { IngredientListItem } from '@/features/ingredients/components/ingredient-list-item';
import {
  useCreateIngredient,
  useDeleteIngredient,
  useIngredients,
  useUpdateIngredient,
} from '@/features/ingredients/hooks/use-ingredients';
import type { IngredientFormValues } from '@/features/ingredients/schemas/ingredient-schemas';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { applyFieldErrors } from '@/lib/form-errors';
import { getErrorMessage } from '@/lib/api-error';
import type { Ingredient } from '@/types/domain';
import { toast } from 'sonner';

export function IngredientsRoute() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const page = Number(params.get('page') ?? '1');
  const newOpen = params.get('new') === '1';
  const debouncedSearch = useDebouncedValue(search, 300);
  const [formOpen, setFormOpen] = useState(newOpen);
  const [editing, setEditing] = useState<Ingredient | undefined>();
  const [deleting, setDeleting] = useState<Ingredient | undefined>();
  const ingredients = useIngredients({ q: debouncedSearch, page, pageSize: 20 });
  const create = useCreateIngredient();
  const update = useUpdateIngredient(editing?.id ?? '');
  const remove = useDeleteIngredient();
  const rows = ingredients.data?.data ?? [];

  function updateParams(next: Record<string, string | undefined>) {
    const nextParams = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    }
    setParams(nextParams);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(undefined);
    updateParams({ new: undefined });
  }

  async function handleSubmit(values: IngredientFormValues) {
    try {
      if (editing) {
        await update.mutateAsync({
          name: values.name,
          unit: values.unit,
          pricePerUnit: Number(values.pricePerUnit),
          notes: values.notes || null,
        });
        toast.success('Ingrediente actualizado.');
      } else {
        await create.mutateAsync({
          name: values.name,
          unit: values.unit,
          pricePerUnit: Number(values.pricePerUnit),
          notes: values.notes || undefined,
        });
        toast.success('Ingrediente creado.');
      }
      closeForm();
    } catch (error) {
      applyFieldErrors(error, () => undefined);
      toast.error(getErrorMessage(error));
      throw error;
    }
  }

  return (
    <div className="min-w-0">
      <PageHeader
        title="Ingredientes"
        description="Precio por unidad para costear recetas. La cantidad va en cada receta."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus />
            Nuevo ingrediente
          </Button>
        }
      />
      <div className="mb-4 sm:max-w-md">
        <SearchInput
          placeholder="Buscar ingredientes..."
          value={search}
          onChange={(event) => updateParams({ q: event.target.value, page: '1' })}
        />
      </div>
      {ingredients.isLoading ? <LoadingSkeleton /> : null}
      {ingredients.error ? <ErrorState error={ingredients.error} onRetry={() => void ingredients.refetch()} /> : null}
      {ingredients.data && rows.length === 0 ? (
        <EmptyState
          title="Todavía no hay ingredientes."
          description="Cargá harina, azúcar y el resto de la despensa para costear recetas."
        />
      ) : null}
      {ingredients.data && rows.length > 0 ? (
        <>
          <ul className="space-y-2">
            {rows.map((ingredient) => (
              <li key={ingredient.id}>
                <IngredientListItem
                  ingredient={ingredient}
                  onEdit={() => {
                    setEditing(ingredient);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeleting(ingredient)}
                />
              </li>
            ))}
          </ul>
          <PaginationControls meta={ingredients.data.meta} onPageChange={(nextPage) => updateParams({ page: String(nextPage) })} />
        </>
      ) : null}
      <IngredientFormDialog
        open={formOpen}
        ingredient={editing}
        onOpenChange={(open) => {
          if (!open) {
            closeForm();
          } else {
            setFormOpen(true);
          }
        }}
        onSubmit={handleSubmit}
        pending={create.isPending || update.isPending}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined);
        }}
        title="Eliminar ingrediente"
        description={`¿Eliminar ${deleting?.name ?? 'este ingrediente'}? No se puede si está en una receta.`}
        confirmLabel="Eliminar"
        destructive
        pending={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove.mutateAsync(deleting.id);
            toast.success('Ingrediente eliminado.');
            setDeleting(undefined);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
