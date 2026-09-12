import { ChevronRight } from 'lucide-react';
import { ItemActions } from '@/components/common/item-actions';
import { MoneyDisplay } from '@/components/common/money-display';
import type { Ingredient } from '@/types/domain';
import { ingredientUnitLabels } from '@/utils/labels';

type IngredientListItemProps = {
  ingredient: Ingredient;
  onEdit: () => void;
  onDelete: () => void;
};

export function IngredientListItem({ ingredient, onEdit, onDelete }: IngredientListItemProps) {
  return (
    <div className="flex min-h-16 items-center gap-2 overflow-hidden rounded-xl border bg-card px-3 py-3 sm:px-4">
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onEdit}>
        <p className="min-w-0 truncate font-medium leading-snug">{ingredient.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          <MoneyDisplay amount={ingredient.pricePerUnit} /> / {ingredientUnitLabels[ingredient.unit]}
        </p>
      </button>
      <ItemActions editLabel="Editar ingrediente" deleteLabel="Eliminar ingrediente" onEdit={onEdit} onDelete={onDelete} />
      <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden />
    </div>
  );
}
