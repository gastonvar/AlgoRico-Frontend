import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { OrderForm } from '@/features/orders/components/order-form';
import { useOrder, useUpdateOrder } from '@/features/orders/hooks/use-orders';
import type { OrderFormValues } from '@/features/orders/schemas/order-schemas';
import { useRecipes } from '@/features/recipes/hooks/use-recipes';
import { toUpdateOrderInput } from '@/features/orders/utils/order-form-payload';
import { applyFieldErrors } from '@/lib/form-errors';
import { ApiError, getErrorMessage } from '@/lib/api-error';
import type { Order } from '@/types/domain';
import { toast } from 'sonner';

function valuesFromOrder(order: Order): Partial<OrderFormValues> {
  return {
    clientId: order.clientId,
    eventDate: order.eventDate ?? '',
    eventTime: order.eventTime ?? '',
    status: order.status,
    fulfillmentType: order.fulfillmentType,
    deliveryDate: order.deliveryDate ?? '',
    deliveryAddress: order.deliveryAddress ?? '',
    deliveryTime: order.deliveryTime ?? '',
    notes: order.notes ?? '',
    description: order.description ?? '',
    totalAmount: order.totalAmount,
    items: order.items.map((item) => ({
      itemId: item.id,
      recipeId: item.recipeId ?? '',
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      notes: item.notes ?? '',
    })),
  };
}

export function EditOrderPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const orderQuery = useOrder(orderId);
  const recipes = useRecipes({ pageSize: 100 });
  const update = useUpdateOrder(orderId ?? '');
  const recipeOptions = useMemo(() => recipes.data?.data ?? [], [recipes.data]);

  if (orderQuery.isLoading || recipes.isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (orderQuery.error instanceof ApiError && orderQuery.error.status === 404) {
    return <ErrorState title="No encontramos este pedido." error={orderQuery.error} />;
  }

  if (orderQuery.error || !orderQuery.data || !orderId) {
    return <ErrorState error={orderQuery.error} onRetry={() => void orderQuery.refetch()} />;
  }

  const order = orderQuery.data;

  async function handleSubmit(values: OrderFormValues) {
    try {
      await update.mutateAsync(toUpdateOrderInput(values));
      toast.success('Pedido actualizado.');
      navigate(`/orders/${orderId}`);
    } catch (error) {
      applyFieldErrors(error, () => undefined);
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Editar pedido"
        description="Cambiá recetas, fecha, entrega o el precio final."
        backTo={{ to: `/orders/${orderId}`, label: 'Pedido' }}
      />
      <OrderForm
        lockClient
        clientName={order.client?.name ?? undefined}
        defaultClientId={order.clientId}
        recipes={recipeOptions}
        initialValues={valuesFromOrder(order)}
        onSubmit={handleSubmit}
        pending={update.isPending}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
