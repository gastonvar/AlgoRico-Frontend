import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { PageSection } from '@/components/common/page-section';
import { AttentionClientCard } from '@/features/dashboard/components/attention-client-card';
import { AttentionGroup } from '@/features/dashboard/components/attention-group';
import { AttentionOrderCard } from '@/features/dashboard/components/attention-order-card';
import { AttentionTaskCard } from '@/features/dashboard/components/attention-task-card';
import { OutstandingOrderCard } from '@/features/dashboard/components/outstanding-order-card';
import { TodayStat } from '@/features/dashboard/components/today-stat';
import { UpcomingOrderCard } from '@/features/dashboard/components/upcoming-order-card';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { formatDateOnlyLocal } from '@/utils/dates';

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
  const attentionTasks = [
    ...data.needsAttention.overdueTasks.map((task) => ({ task, subtitle: 'Vencida' })),
    ...data.needsAttention.tasksDueToday.map((task) => ({ task, subtitle: 'Vence hoy' })),
    ...data.upcoming.tasks.map((task) => ({ task, subtitle: 'Próxima' })),
  ];
  const followUpClients = data.needsAttention.followUpClients;
  const missingInfoOrders = data.needsAttention.ordersMissingInformation;
  const attentionEmpty =
    attentionTasks.length === 0 && followUpClients.length === 0 && missingInfoOrders.length === 0;

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <PageHeader title="Hoy" description="Lo que hay que atender ahora." />
      <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <TodayStat label="Pedidos" value={data.today.orderCount} to={`/orders?from=${today}&to=${today}`} />
        <TodayStat label="Retiros" value={data.today.pickups.length} to={`/orders?from=${today}&to=${today}&fulfillmentType=PICKUP`} />
        <TodayStat label="Entregas" value={data.today.deliveries.length} to={`/orders?from=${today}&to=${today}&fulfillmentType=DELIVERY`} />
        <TodayStat label="Tareas" value={data.needsAttention.tasksDueToday.length} to="/tasks?due=today" />
      </section>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2 lg:items-start">
        <PageSection title="Necesita atención" className="bg-muted/30">
          {attentionEmpty ? (
            <EmptyState title="Nada urgente por ahora." description="Cuando haya seguimientos o datos faltantes, van a aparecer acá." />
          ) : (
            <div className="space-y-4">
              {attentionTasks.length > 0 ? (
                <AttentionGroup title="Tareas">
                  {attentionTasks.map(({ task, subtitle }) => (
                    <AttentionTaskCard key={task.id} task={task} subtitle={subtitle} />
                  ))}
                </AttentionGroup>
              ) : null}
              {followUpClients.length > 0 ? (
                <AttentionGroup title="Clientes">
                  {followUpClients.map((client) => (
                    <AttentionClientCard key={client.id} client={client} />
                  ))}
                </AttentionGroup>
              ) : null}
              {missingInfoOrders.length > 0 ? (
                <AttentionGroup title="Pedidos">
                  {missingInfoOrders.map((order) => (
                    <AttentionOrderCard key={order.id} order={order} />
                  ))}
                </AttentionGroup>
              ) : null}
            </div>
          )}
        </PageSection>

        <div className="space-y-5 sm:space-y-6">
          <PageSection title="Próximos pedidos" className="bg-muted/30">
            {data.upcoming.orders.length === 0 ? (
              <EmptyState title="No hay pedidos próximos." description="Van a aparecer acá cuando tengan fecha." />
            ) : (
              <div className="space-y-2">
                {data.upcoming.orders.map((order) => (
                  <UpcomingOrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </PageSection>

          <PageSection title="Pagos pendientes" className="bg-muted/30">
            {data.payments.outstandingOrders.length === 0 ? (
              <EmptyState title="No hay saldos pendientes." />
            ) : (
              <div className="space-y-2">
                {data.payments.outstandingOrders.map((order) => (
                  <OutstandingOrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </PageSection>
        </div>
      </div>
    </div>
  );
}
