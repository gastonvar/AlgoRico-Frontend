import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateOrder } from '@/features/orders/hooks/use-orders';
import { getErrorMessage } from '@/lib/api-error';
import type { Order } from '@/types/domain';
import { toast } from 'sonner';

export function OrderTotalEditor({ order }: { order: Order }) {
  const update = useUpdateOrder(order.id);
  const [value, setValue] = useState(String(order.totalAmount));
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setValue(String(order.totalAmount));
  }, [order.totalAmount]);

  async function save() {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) {
      setError('El precio no puede ser negativo.');
      return;
    }
    setError(undefined);
    try {
      await update.mutateAsync({ totalAmount: amount });
      toast.success('Precio final actualizado.');
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    }
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <Field>
        <Label htmlFor="order-total-amount">Precio final</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="order-total-amount"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <Button type="submit" variant="outline" className="w-full sm:w-auto" disabled={update.isPending}>
            {update.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
        <FieldError>{error}</FieldError>
      </Field>
    </form>
  );
}
