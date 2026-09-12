import { Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { PaginationControls } from '@/components/common/pagination-controls';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { RecipeListItem } from '@/features/recipes/components/recipe-list-item';
import { useRecipes } from '@/features/recipes/hooks/use-recipes';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export function RecipesRoute() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const page = Number(params.get('page') ?? '1');
  const debouncedSearch = useDebouncedValue(search, 300);
  const recipes = useRecipes({ q: debouncedSearch, page, pageSize: 20 });
  const rows = recipes.data?.data ?? [];

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

  return (
    <div className="min-w-0">
      <PageHeader
        title="Recetas"
        description="Cada receta suma el costo de sus ingredientes."
        actions={
          <Button asChild>
            <Link to="/recipes/new">
              <Plus />
              Nueva receta
            </Link>
          </Button>
        }
      />
      <div className="mb-4 sm:max-w-md">
        <SearchInput
          placeholder="Buscar recetas..."
          value={search}
          onChange={(event) => updateParams({ q: event.target.value, page: '1' })}
        />
      </div>
      {recipes.isLoading ? <LoadingSkeleton /> : null}
      {recipes.error ? <ErrorState error={recipes.error} onRetry={() => void recipes.refetch()} /> : null}
      {recipes.data && rows.length === 0 ? (
        <EmptyState
          title="Todavía no hay recetas."
          description="Creá la primera con los ingredientes de la despensa."
        />
      ) : null}
      {recipes.data && rows.length > 0 ? (
        <>
          <ul className="space-y-2">
            {rows.map((recipe) => (
              <li key={recipe.id}>
                <RecipeListItem recipe={recipe} />
              </li>
            ))}
          </ul>
          <PaginationControls meta={recipes.data.meta} onPageChange={(nextPage) => updateParams({ page: String(nextPage) })} />
        </>
      ) : null}
    </div>
  );
}
