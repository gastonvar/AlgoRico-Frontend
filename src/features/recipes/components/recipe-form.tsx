import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { ItemActions } from '@/components/common/item-actions';
import { recipeFormSchema, type RecipeFormValues } from '@/features/recipes/schemas/recipe-schemas';
import { suggestedRecipePrice } from '@/features/recipes/utils/suggested-recipe-price';
import type { Ingredient } from '@/types/domain';
import { ingredientUnitLabels } from '@/utils/labels';
import { formatMoney } from '@/utils/money';

type RecipeFormProps = {
  ingredients: Ingredient[];
  onSubmit: (values: RecipeFormValues) => Promise<void>;
  pending?: boolean;
  initialValues?: Partial<RecipeFormValues>;
  submitLabel?: string;
};

function createEmptyLine(): RecipeFormValues['ingredients'][number] {
  return { lineId: undefined, ingredientId: '', quantity: 1, notes: '' };
}

export function RecipeForm({
  ingredients,
  onSubmit,
  pending,
  initialValues,
  submitLabel = 'Guardar receta',
}: RecipeFormProps) {
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema) as Resolver<RecipeFormValues>,
    defaultValues: {
      name: '',
      description: '',
      notes: '',
      ingredients: [createEmptyLine()],
      ...initialValues,
    },
  });

  const lines = useFieldArray({ control: form.control, name: 'ingredients' });
  const watchedLines = form.watch('ingredients');
  const priceByIngredientId = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const recipePrice = suggestedRecipePrice(
    watchedLines.map((line) => ({
      quantity: Number(line.quantity) || 0,
      pricePerUnit: priceByIngredientId.get(line.ingredientId)?.pricePerUnit ?? 0,
    })),
  );

  return (
    <form className="space-y-4 lg:space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <section className="space-y-4 rounded-xl border bg-card p-4 lg:p-5">
        <div>
          <h2 className="text-base font-semibold lg:text-lg">Receta</h2>
          <p className="mt-1 text-sm text-muted-foreground">Nombre y una descripción corta.</p>
        </div>
        <Field>
          <Label htmlFor="recipe-name">Nombre</Label>
          <Input id="recipe-name" autoCapitalize="sentences" {...form.register('name')} />
          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </Field>
        <Field>
          <Label htmlFor="recipe-description">Descripción</Label>
          <Input id="recipe-description" {...form.register('description')} />
        </Field>
        <Field>
          <Label htmlFor="recipe-notes">Notas</Label>
          <Textarea id="recipe-notes" {...form.register('notes')} />
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4 lg:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold lg:text-lg">Ingredientes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Cantidad de cada ingrediente. El precio de la receta sale de ahí.</p>
          </div>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => lines.append(createEmptyLine())}>
            Agregar ingrediente
          </Button>
        </div>
        {lines.fields.map((field, index) => {
          const selected = priceByIngredientId.get(watchedLines[index]?.ingredientId ?? '');
          return (
            <div key={field.id} className="space-y-3 rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <Field className="min-w-0 flex-1">
                  <Label htmlFor={`recipe-ingredient-${index}`}>Ingrediente</Label>
                  <NativeSelect id={`recipe-ingredient-${index}`} {...form.register(`ingredients.${index}.ingredientId`)}>
                    <option value="">Elegí un ingrediente</option>
                    {ingredients.map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name}
                      </option>
                    ))}
                  </NativeSelect>
                  <FieldError>{form.formState.errors.ingredients?.[index]?.ingredientId?.message}</FieldError>
                </Field>
                {lines.fields.length > 1 ? (
                  <ItemActions deleteLabel="Quitar ingrediente" onDelete={() => lines.remove(index)} />
                ) : null}
              </div>
              <Field>
                <Label htmlFor={`recipe-qty-${index}`}>
                  Cantidad{selected ? ` (${ingredientUnitLabels[selected.unit]})` : ''}
                </Label>
                <Input
                  id={`recipe-qty-${index}`}
                  type="number"
                  min={0.0001}
                  step="any"
                  inputMode="decimal"
                  {...form.register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                />
                <FieldError>{form.formState.errors.ingredients?.[index]?.quantity?.message}</FieldError>
              </Field>
              {selected ? (
                <p className="text-sm text-muted-foreground">
                  {formatMoney(selected.pricePerUnit)} / {ingredientUnitLabels[selected.unit]} · línea{' '}
                  {formatMoney((Number(watchedLines[index]?.quantity) || 0) * selected.pricePerUnit)}
                </p>
              ) : null}
            </div>
          );
        })}
        <p className="text-sm font-medium">Precio de la receta: {formatMoney(recipePrice)}</p>
        <FieldError>{form.formState.errors.ingredients?.message}</FieldError>
      </section>

      <FieldError>{form.formState.errors.root?.message}</FieldError>
      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 -mx-3 border-t bg-background/95 p-3 backdrop-blur sm:-mx-4 lg:static lg:z-auto lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <Button type="submit" className="w-full lg:w-auto" disabled={pending || form.formState.isSubmitting}>
          {pending || form.formState.isSubmitting ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
