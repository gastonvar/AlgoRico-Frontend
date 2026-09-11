import { Link } from 'react-router';
import { DateDisplay } from '@/components/common/date-display';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { MoneyDisplay } from '@/components/common/money-display';
import { FulfillmentBadge, OrderStatusBadge, PaymentStatusBadge } from '@/components/common/status-badges';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { formatDateOnlyLocal } from '@/utils/dates';
import type { Order } from '@/types/domain';

function OrderRow({ order }: { order: Order }) {
  const today = formatDateOnlyLocal(new Date());
  const upcoming = Boolean(order.eventDate && order.eventDate >= today && order.status !== 'COMPLETED' && order.status !== 'CANCELLED');

  return (
    <Link
      to={`/orders/${order.id}`}
      className={`block min-w-0 rounded-xl border p-3 hover:bg-accent/40 sm:p-4 ${upcoming ? 'border-primary/30 bg-primary/5' : 'bg-card'}`}
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words font-medium">{order.description || 'Pedido'}</p>
          {order.eventDate ? (
            <p className="text-sm text-muted-foreground">
              <DateDisplay value={order.eventDate} mode="event" time={order.eventTime} />
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Sin fecha</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <FulfillmentBadge type={order.fulfillmentType} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>
      <p className="mt-2 min-w-0 break-words text-sm">
        Pagado <MoneyDisplay amount={order.paidAmount} /> · Resta <MoneyDisplay amount={order.remainingBalance} emphasize={order.remainingBalance > 0} />
      </p>
    </Link>
  );
}

export function ClientOrders({
  clientId,
  onCreate,
  showTitle = true,
}: {
  clientId: string;
  onCreate: () => void;
  showTitle?: boolean;
}) {
  const orders = useOrders({ clientId, pageSize: 50 });

  return (
    <section className="min-w-0">
      {showTitle ? <h2 className="mb-2 text-lg font-semibold sm:mb-3">Pedidos</h2> : null}
      {orders.isLoading ? <LoadingSkeleton rows={2} /> : null}
      {orders.error ? <ErrorState error={orders.error} onRetry={() => void orders.refetch()} /> : null}
      {orders.data && orders.data.data.length === 0 ? (
        <EmptyState
          title="Todavía no hay pedidos."
          description="Cuando esta cliente confirme un trabajo, crealo acá."
          actionLabel="Nuevo pedido"
          onAction={onCreate}
        />
      ) : null}
      {orders.data ? (
        <div className="space-y-2">
          {orders.data.data.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
