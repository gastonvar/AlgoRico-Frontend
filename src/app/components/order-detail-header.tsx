import { Link } from 'react-router';
import { DateDisplay } from '@/components/common/date-display';
import { FulfillmentBadge, OrderStatusBadge, PaymentStatusBadge } from '@/components/common/status-badges';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types/domain';
import { fulfillmentLabels } from '@/utils/labels';

type OrderDetailHeaderProps = {
  order: Order;
  onDelete: () => void;
};

export function OrderDetailHeader({ order, onDelete }: OrderDetailHeaderProps) {
  return (
    <header className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-2xl font-semibold tracking-tight">{order.description || 'Pedido'}</h2>
          {order.client ? (
            <Link
              className="mt-1 inline-block break-words font-medium text-primary hover:underline"
              to={`/clients/${order.clientId}`}
            >
              {order.client.name}
            </Link>
          ) : null}
          <p className="mt-1 text-muted-foreground">
            {order.eventDate ? (
              <DateDisplay value={order.eventDate} mode="event" time={order.eventTime} />
            ) : (
              'Sin fecha de evento'
            )}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to={`/orders/${order.id}/edit`}>Editar</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
            onClick={onDelete}
          >
            Eliminar pedido
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <OrderStatusBadge status={order.status} />
        <FulfillmentBadge type={order.fulfillmentType} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>
      {order.fulfillmentType === 'DELIVERY' ? (
        <p className="mt-3 break-words text-sm text-muted-foreground">
          {fulfillmentLabels.DELIVERY}
          {order.deliveryAddress ? ` · ${order.deliveryAddress}` : ' · falta dirección'}
          {order.deliveryTime ? ` · ${order.deliveryTime}` : ''}
        </p>
      ) : null}
    </header>
  );
}
