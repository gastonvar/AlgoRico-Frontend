import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { OrderDetailHeader } from '@/app/components/order-detail-header';
import { OrderDetailProducts } from '@/app/components/order-detail-products';
import { OrderDetailSummary } from '@/app/components/order-detail-summary';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { PageSection } from '@/components/common/page-section';
import { SectionNav, type SectionNavItem } from '@/components/common/section-nav';
import { Button } from '@/components/ui/button';
import { ClientTimeline } from '@/features/interactions/components/client-timeline';
import { InteractionFormDialog } from '@/features/interactions/components/interaction-form-dialog';
import { useDeleteOrder, useOrder } from '@/features/orders/hooks/use-orders';
import { PaymentFormDialog } from '@/features/payments/components/payment-form-dialog';
import { PaymentHistory } from '@/features/payments/components/payment-history';
import { TaskFormDialog } from '@/features/tasks/components/task-form-dialog';
import { TaskListSection } from '@/features/tasks/components/task-list-section';
import { ApiError, getErrorMessage } from '@/lib/api-error';
import { toast } from 'sonner';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const orderQuery = useOrder(orderId);
  const remove = useDeleteOrder(orderId ?? '', orderQuery.data?.clientId);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (orderQuery.isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (orderQuery.error instanceof ApiError && orderQuery.error.status === 404) {
    return <ErrorState title="No encontramos este pedido." error={orderQuery.error} />;
  }

  if (orderQuery.error || !orderQuery.data || !orderId) {
    return <ErrorState error={orderQuery.error} onRetry={() => void orderQuery.refetch()} />;
  }

  const order = orderQuery.data;
  const sectionNavItems: SectionNavItem[] = [
    { href: '#resumen', label: 'Resumen' },
    { href: '#productos', label: 'Productos' },
    { href: '#pagos', label: 'Pagos' },
    { href: '#conversaciones', label: 'Conversaciones' },
    { href: '#tareas', label: 'Tareas' },
    ...(order.notes ? [{ href: '#notas', label: 'Notas' }] : []),
  ];

  return (
    <div>
      <PageHeader title="Pedido" backTo={{ to: '/orders', label: 'Pedidos' }} />
      <OrderDetailHeader order={order} onDelete={() => setDeleteOpen(true)} />

      <div className="mt-4 flex flex-col gap-4 lg:mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-x-6 lg:gap-y-4">
        <SectionNav className="order-2 lg:order-1 lg:col-span-2" items={sectionNavItems} />

        <aside className="order-1 lg:order-3 lg:col-start-2 lg:row-start-2 lg:sticky lg:top-[8rem]">
          <OrderDetailSummary order={order} onRegisterPayment={() => setPaymentOpen(true)} />
        </aside>

        <div className="order-3 space-y-4 lg:order-2 lg:col-start-1 lg:row-start-2 lg:space-y-6">
          <OrderDetailProducts items={order.items} />

          <PageSection id="pagos" title="Pagos">
            <PaymentHistory payments={order.payments} orderId={order.id} />
          </PageSection>

          <PageSection
            id="conversaciones"
            title="Conversaciones"
            actions={
              <Button variant="outline" onClick={() => setInteractionOpen(true)}>
                Nueva conversación
              </Button>
            }
          >
            <ClientTimeline clientId={order.clientId} orderId={order.id} showTitle={false} />
          </PageSection>

          <PageSection
            id="tareas"
            title="Tareas"
            actions={
              <Button variant="outline" onClick={() => setTaskOpen(true)}>
                Nueva tarea
              </Button>
            }
          >
            <TaskListSection orderId={order.id} clientId={order.clientId} />
          </PageSection>

          {order.notes ? (
            <PageSection id="notas" title="Notas">
              <p className="whitespace-pre-wrap break-words text-sm">{order.notes}</p>
            </PageSection>
          ) : null}
        </div>
      </div>

      <PaymentFormDialog open={paymentOpen} onOpenChange={setPaymentOpen} orderId={order.id} />
      <InteractionFormDialog
        open={interactionOpen}
        onOpenChange={setInteractionOpen}
        clientId={order.clientId}
        orderId={order.id}
      />
      <TaskFormDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        defaultClientId={order.clientId}
        defaultOrderId={order.id}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar pedido?"
        description="Se van a borrar el pedido, sus productos y los pagos. Las conversaciones del cliente se conservan."
        confirmLabel="Eliminar"
        destructive
        pending={remove.isPending}
        onConfirm={async () => {
          try {
            await remove.mutateAsync();
            toast.success('Pedido eliminado.');
            navigate('/orders');
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
