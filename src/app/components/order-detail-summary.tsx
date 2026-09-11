import { MoneyDisplay } from '@/components/common/money-display';
import { PageSection } from '@/components/common/page-section';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderTotalEditor } from '@/features/orders/components/order-total-editor';
import { useUpdateOrder } from '@/features/orders/hooks/use-orders';
import { getErrorMessage } from '@/lib/api-error';
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/types/domain';
import { orderStatusLabels } from '@/utils/labels';
import { toast } from 'sonner';

type OrderDetailSummaryProps = {
  order: Order;
  onRegisterPayment: () => void;
};

export function OrderDetailSummary({ order, onRegisterPayment }: OrderDetailSummaryProps) {
  const update = useUpdateOrder(order.id);

  return (
    <PageSection id="resumen" title="Resumen" description="Montos y estado de este pedido.">
      <dl className="space-y-2 rounded-lg bg-muted/60 p-3">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-sm text-muted-foreground">Precio final</dt>
          <dd>
            <MoneyDisplay amount={order.totalAmount} className="text-base font-medium" />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-sm text-muted-foreground">Pagado</dt>
          <dd>
            <MoneyDisplay amount={order.paidAmount} className="text-base font-medium" />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t pt-2">
          <dt className="text-sm font-medium">Resta</dt>
          <dd>
            <MoneyDisplay amount={order.remainingBalance} emphasize />
          </dd>
        </div>
      </dl>

      <Button className="mt-4 w-full" onClick={onRegisterPayment}>
        Registrar pago
      </Button>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="order-status">Cambiar estado</Label>
        <Select
          value={order.status}
          onValueChange={async (value) => {
            try {
              await update.mutateAsync({ status: value as OrderStatus });
              toast.success('Estado actualizado.');
            } catch (error) {
              toast.error(getErrorMessage(error));
            }
          }}
        >
          <SelectTrigger id="order-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {orderStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Si el cambio no es válido, el sistema lo va a rechazar.</p>
      </div>

      <div className="mt-4 border-t pt-4">
        <OrderTotalEditor order={order} />
      </div>
    </PageSection>
  );
}
