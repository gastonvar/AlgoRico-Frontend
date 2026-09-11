import { Link } from 'react-router';
import { DateDisplay } from '@/components/common/date-display';
import { MoneyDisplay } from '@/components/common/money-display';
import { FulfillmentBadge, OrderStatusBadge } from '@/components/common/status-badges';
import { dashboardCardLinkClassName } from '@/features/dashboard/components/dashboard-card-classes';
import type { Order } from '@/types/domain';

export function UpcomingOrderCard({ order }: { order: Order }) {
  return (
    <Link to={`/orders/${order.id}`} className={dashboardCardLinkClassName}>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {order.eventDate ? (
            <p className="truncate font-medium">
              <DateDisplay value={order.eventDate} mode="event" time={order.eventTime} />
            </p>
          ) : null}
          <p className="truncate">{order.client?.name ?? 'Cliente'}</p>
          <p className="truncate text-sm text-muted-foreground">{order.description || 'Pedido'}</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:max-w-[50%] sm:justify-end">
          <FulfillmentBadge type={order.fulfillmentType} />
          <OrderStatusBadge status={order.status} />
          {order.remainingBalance > 0 ? <MoneyDisplay amount={order.remainingBalance} emphasize /> : null}
        </div>
      </div>
    </Link>
  );
}
