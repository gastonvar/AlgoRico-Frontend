import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { MoneyDisplay } from '@/components/common/money-display';
import type { Recipe } from '@/types/domain';

export function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const count = recipe.ingredients.length;
  const countLabel = count === 1 ? '1 ingrediente' : `${count} ingredientes`;

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="flex min-h-16 items-center gap-3 overflow-hidden rounded-xl border bg-card px-3 py-3 active:bg-accent/60 hover:bg-accent/40 sm:px-4"
    >
      <div className="min-w-0 flex-1">
        <p className="min-w-0 truncate font-medium leading-snug">{recipe.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {countLabel} · <MoneyDisplay amount={recipe.price} />
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
