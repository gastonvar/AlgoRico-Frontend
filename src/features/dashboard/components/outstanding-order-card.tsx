import { Link } from 'react-router';
import { DateDisplay } from '@/components/common/date-display';
import { MoneyDisplay } from '@/components/common/money-display';
import { PaymentStatusBadge } from '@/components/common/status-badges';
import { dashboardCardLinkClassName } from '@/features/dashboard/components/dashboard-card-classes';
import type { Order } from '@/types/domain';

export function OutstandingOrderCard({ order }: { order: Order }) {
  return (
    <Link to={`/orders/${order.id}`} className={dashboardCardLinkClassName}>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-medium">{order.client?.name ?? 'Cliente'}</p>
          <p className="truncate text-sm text-muted-foreground">{order.description || 'Pedido'}</p>
          {order.eventDate ? (
            <p className="truncate text-sm">
              <DateDisplay value={order.eventDate} mode="event" time={order.eventTime} />
            </p>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5 sm:items-end sm:text-right">
          <p className="text-sm text-muted-foreground">
            Total <MoneyDisplay amount={order.totalAmount} />
          </p>
          <p className="text-sm text-muted-foreground">
            Pagado <MoneyDisplay amount={order.paidAmount} />
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
            <MoneyDisplay amount={order.remainingBalance} emphasize />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>
    </Link>
  );
}
