import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { ingredientFormSchema, type IngredientFormValues } from '@/features/ingredients/schemas/ingredient-schemas';
import type { Ingredient } from '@/types/domain';
import { INGREDIENT_UNITS } from '@/types/domain';
import { ingredientUnitLabels } from '@/utils/labels';

type IngredientFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: Ingredient;
  onSubmit: (values: IngredientFormValues) => Promise<void>;
  pending?: boolean;
};

export function IngredientFormDialog({
  open,
  onOpenChange,
  ingredient,
  onSubmit,
  pending,
}: IngredientFormDialogProps) {
  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientFormSchema) as Resolver<IngredientFormValues>,
    values: {
      name: ingredient?.name ?? '',
      unit: ingredient?.unit ?? 'kg',
      pricePerUnit: ingredient?.pricePerUnit ?? 0,
      notes: ingredient?.notes ?? '',
    },
  });

  const unit = form.watch('unit');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ingredient ? 'Editar ingrediente' : 'Nuevo ingrediente'}</DialogTitle>
          <DialogDescription>
            El precio es por unidad. La cantidad se carga en la receta.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid grid-cols-1 gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
          })}
        >
          <Field>
            <Label htmlFor="ingredient-name">Nombre</Label>
            <Input id="ingredient-name" autoCapitalize="words" {...form.register('name')} />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="ingredient-unit">Unidad</Label>
            <NativeSelect id="ingredient-unit" {...form.register('unit')}>
              {INGREDIENT_UNITS.map((value) => (
                <option key={value} value={value}>
                  {ingredientUnitLabels[value]}
                </option>
              ))}
            </NativeSelect>
            <FieldError>{form.formState.errors.unit?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="ingredient-price-per-unit">Precio por unidad</Label>
            <Input
              id="ingredient-price-per-unit"
              type="number"
              min={0}
              step="0.0001"
              inputMode="decimal"
              {...form.register('pricePerUnit', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">por {ingredientUnitLabels[unit]}</p>
            <FieldError>{form.formState.errors.pricePerUnit?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="ingredient-notes">Notas</Label>
            <Textarea id="ingredient-notes" {...form.register('notes')} />
            <FieldError>{form.formState.errors.notes?.message}</FieldError>
          </Field>
          <FieldError>{form.formState.errors.root?.message}</FieldError>
          <DialogFooter>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={pending || form.formState.isSubmitting}>
              {pending || form.formState.isSubmitting ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
