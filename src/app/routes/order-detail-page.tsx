import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DateDisplay } from '@/components/common/date-display';
import { ErrorState } from '@/components/common/error-state';
import { ItemActions } from '@/components/common/item-actions';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { MoneyDisplay } from '@/components/common/money-display';
import { FulfillmentBadge, OrderStatusBadge, PaymentStatusBadge } from '@/components/common/status-badges';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientTimeline } from '@/features/interactions/components/client-timeline';
import { InteractionFormDialog } from '@/features/interactions/components/interaction-form-dialog';
import { OrderTotalEditor } from '@/features/orders/components/order-total-editor';
import { useDeleteOrder, useOrder, useUpdateOrder } from '@/features/orders/hooks/use-orders';
import { PaymentFormDialog } from '@/features/payments/components/payment-form-dialog';
import { PaymentHistory } from '@/features/payments/components/payment-history';
import { TaskFormDialog } from '@/features/tasks/components/task-form-dialog';
import { TaskListSection } from '@/features/tasks/components/task-list-section';
import { ApiError, getErrorMessage } from '@/lib/api-error';
import { ORDER_STATUSES, type OrderStatus } from '@/types/domain';
import { fulfillmentLabels, orderStatusLabels } from '@/utils/labels';
import { toast } from 'sonner';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const orderQuery = useOrder(orderId);
  const update = useUpdateOrder(orderId ?? '');
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

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="min-w-0 flex-1 break-words text-2xl font-semibold">{order.description || 'Pedido'}</h2>
          <ItemActions
            editTo={`/orders/${order.id}/edit`}
            editLabel="Editar"
            deleteLabel="Eliminar pedido"
            onDelete={() => setDeleteOpen(true)}
          />
        </div>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            {order.client ? (
              <Link className="inline-block break-words text-primary" to={`/clients/${order.clientId}`}>
                {order.client.name}
              </Link>
            ) : null}
            <p className="mt-2 text-lg">
              {order.eventDate ? (
                <DateDisplay value={order.eventDate} mode="event" time={order.eventTime} />
              ) : (
                'Sin fecha de evento'
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <OrderStatusBadge status={order.status} />
              <FulfillmentBadge type={order.fulfillmentType} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            {order.fulfillmentType === 'DELIVERY' ? (
              <p className="mt-2 break-words text-sm text-muted-foreground">
                {fulfillmentLabels.DELIVERY}
                {order.deliveryAddress ? ` · ${order.deliveryAddress}` : ' · falta dirección'}
                {order.deliveryTime ? ` · ${order.deliveryTime}` : ''}
              </p>
            ) : null}
          </div>
          <div className="w-full space-y-2 rounded-lg bg-muted/60 p-4 lg:w-auto lg:min-w-[14rem]">
            <p className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">Precio final</span>
              <MoneyDisplay amount={order.totalAmount} className="text-base font-medium" />
            </p>
            <p className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">Pagado</span>
              <MoneyDisplay amount={order.paidAmount} className="text-base font-medium" />
            </p>
            <p className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">Resta</span>
              <MoneyDisplay amount={order.remainingBalance} emphasize />
            </p>
          </div>
        </div>
        <div className="mt-4 w-full sm:max-w-sm">
          <Label>Cambiar estado</Label>
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
            <SelectTrigger>
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
          <p className="mt-1 text-xs text-muted-foreground">Si el cambio no es válido, el sistema lo va a rechazar.</p>
        </div>
        <div className="mt-4 w-full sm:max-w-sm">
          <OrderTotalEditor order={order} />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Productos</h2>
        <ul className="mt-3 divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="break-words font-medium">{item.description}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}
                  {item.unitPrice > 0 ? (
                    <>
                      {' '}
                      · <MoneyDisplay amount={item.unitPrice} /> c/u
                    </>
                  ) : null}
                </p>
                {item.notes ? <p className="break-words text-sm">{item.notes}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Conversaciones</h2>
          <Button className="w-full sm:w-auto" variant="outline" onClick={() => setInteractionOpen(true)}>
            Nueva conversación
          </Button>
        </div>
        <ClientTimeline clientId={order.clientId} orderId={order.id} showTitle={false} />
      </section>

      <section className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Pagos</h2>
          <Button className="w-full sm:w-auto" onClick={() => setPaymentOpen(true)}>
            Registrar pago
          </Button>
        </div>
        <PaymentHistory payments={order.payments} orderId={order.id} />
      </section>

      <section className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Tareas</h2>
          <Button className="w-full sm:w-auto" variant="outline" onClick={() => setTaskOpen(true)}>
            Nueva tarea
          </Button>
        </div>
        <TaskListSection orderId={order.id} clientId={order.clientId} onCreate={() => setTaskOpen(true)} />
      </section>

      {order.notes ? (
        <section className="rounded-xl border bg-card p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Notas</h2>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm">{order.notes}</p>
        </section>
      ) : null}

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
