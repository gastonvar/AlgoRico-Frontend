import { Link } from 'react-router';
import { DateDisplay } from '@/components/common/date-display';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { MoneyDisplay } from '@/components/common/money-display';
import { PageHeader } from '@/components/common/page-header';
import { FulfillmentBadge, OrderStatusBadge, PaymentStatusBadge, TaskPriorityBadge } from '@/components/common/status-badges';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { formatDateOnlyLocal } from '@/utils/dates';
import { labelForMissingIssue } from '@/utils/labels';
import type { Client, MissingInfoOrder, Order, Task } from '@/types/domain';

const cardLinkClassName = 'block min-w-0 rounded-xl border bg-card p-3 hover:bg-accent/40 sm:p-4';
const attentionLinkClassName = 'block min-w-0 rounded-xl border border-warning/40 bg-card p-3 hover:bg-accent/40 sm:p-4';

export function DashboardRoute() {
  const dashboard = useDashboard();

  if (dashboard.isLoading) {
    return <LoadingSkeleton rows={6} />;
  }
  if (dashboard.error || !dashboard.data) {
    return <ErrorState error={dashboard.error} onRetry={() => void dashboard.refetch()} />;
  }

  const data = dashboard.data;
  const today = data.today.date || formatDateOnlyLocal(new Date());

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <PageHeader title="Hoy" description="Lo que hay que atender ahora." />
      <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <TodayStat label="Pedidos" value={data.today.orderCount} to={`/orders?from=${today}&to=${today}`} />
        <TodayStat label="Retiros" value={data.today.pickups.length} to={`/orders?from=${today}&to=${today}&fulfillmentType=PICKUP`} />
        <TodayStat label="Entregas" value={data.today.deliveries.length} to={`/orders?from=${today}&to=${today}&fulfillmentType=DELIVERY`} />
        <TodayStat label="Tareas" value={data.needsAttention.tasksDueToday.length} to="/tasks?due=today" />
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold sm:mb-3 sm:text-lg">Necesita atención</h2>
        <div className="space-y-2">
          {data.needsAttention.overdueTasks.map((task) => (
            <AttentionTask key={task.id} task={task} subtitle="Vencida" />
          ))}
          {data.needsAttention.tasksDueToday.map((task) => (
            <AttentionTask key={task.id} task={task} subtitle="Vence hoy" />
          ))}
          {data.upcoming.tasks.map((task) => (
            <AttentionTask key={task.id} task={task} subtitle="Próxima" />
          ))}
          {data.needsAttention.followUpClients.map((client) => (
            <AttentionClient key={client.id} client={client} />
          ))}
          {data.needsAttention.ordersMissingInformation.map((order) => (
            <AttentionOrder key={order.id} order={order} />
          ))}
          {isAttentionEmpty(data.needsAttention, data.upcoming.tasks) ? (
            <EmptyState title="Nada urgente por ahora." description="Cuando haya seguimientos o datos faltantes, van a aparecer acá." />
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold sm:mb-3 sm:text-lg">Próximos pedidos</h2>
        {data.upcoming.orders.length === 0 ? (
          <EmptyState title="No hay pedidos próximos." description="Van a aparecer acá cuando tengan fecha." />
        ) : (
          <div className="space-y-2">
            {data.upcoming.orders.map((order) => (
              <UpcomingOrder key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold sm:mb-3 sm:text-lg">Pagos pendientes</h2>
        {data.payments.outstandingOrders.length === 0 ? (
          <EmptyState title="No hay saldos pendientes." />
        ) : (
          <div className="space-y-2">
            {data.payments.outstandingOrders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className={cardLinkClassName}>
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TodayStat({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-16 min-w-0 flex-col justify-center rounded-xl border bg-card px-3 py-3 hover:bg-accent/40 sm:min-h-[4.5rem] sm:p-4"
    >
      <p className="truncate text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums sm:mt-1 sm:text-3xl">{value}</p>
    </Link>
  );
}

function AttentionTask({ task, subtitle }: { task: Task; subtitle: string }) {
  const to = task.orderId ? `/orders/${task.orderId}` : task.clientId ? `/clients/${task.clientId}` : '/tasks';
  return (
    <Link to={to} className={attentionLinkClassName}>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-medium">{task.title}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-1.5">
          <TaskPriorityBadge priority={task.priority} />
        </div>
      </div>
    </Link>
  );
}

function AttentionClient({ client }: { client: Client }) {
  return (
    <Link to={`/clients/${client.id}`} className={attentionLinkClassName}>
      <p className="truncate font-medium">Responder a {client.name}</p>
      <p className="text-sm text-muted-foreground">Hay que hacer seguimiento</p>
    </Link>
  );
}

function AttentionOrder({ order }: { order: MissingInfoOrder }) {
  return (
    <Link to={`/orders/${order.id}`} className={attentionLinkClassName}>
      <p className="truncate font-medium">{order.clientName}</p>
      <p className="break-words text-sm text-muted-foreground">{order.issues.map(labelForMissingIssue).join(' · ')}</p>
    </Link>
  );
}

function UpcomingOrder({ order }: { order: Order }) {
  return (
    <Link to={`/orders/${order.id}`} className={cardLinkClassName}>
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

function isAttentionEmpty(
  value: {
    overdueTasks: unknown[];
    tasksDueToday: Task[];
    followUpClients: Client[];
    ordersMissingInformation: MissingInfoOrder[];
  },
  upcomingTasks: Task[],
) {
  return (
    value.overdueTasks.length === 0 &&
    value.tasksDueToday.length === 0 &&
    value.followUpClients.length === 0 &&
    value.ordersMissingInformation.length === 0 &&
    upcomingTasks.length === 0
  );
}
