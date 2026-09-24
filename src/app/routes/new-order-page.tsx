import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/common/page-header';
import { useClients } from '@/features/clients/hooks/use-clients';
import { OrderForm } from '@/features/orders/components/order-form';
import { useCreateOrder } from '@/features/orders/hooks/use-orders';
import type { OrderFormValues } from '@/features/orders/schemas/order-schemas';
import { toCreateOrderInput } from '@/features/orders/utils/order-form-payload';
import { useRecipes } from '@/features/recipes/hooks/use-recipes';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { applyFieldErrors } from '@/lib/form-errors';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from 'sonner';

export function NewOrderPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultClientId = params.get('clientId') ?? undefined;
  const [clientQuery, setClientQuery] = useState('');
  const debounced = useDebouncedValue(clientQuery, 300);
  const clients = useClients({ q: debounced, pageSize: 10 });
  const recipes = useRecipes({ pageSize: 100 });
  const create = useCreateOrder();

  const clientOptions = useMemo(() => clients.data?.data ?? [], [clients.data]);
  const recipeOptions = useMemo(() => recipes.data?.data ?? [], [recipes.data]);

  async function handleSubmit(values: OrderFormValues) {
    try {
      const order = await create.mutateAsync({
        clientId: values.clientId,
        input: toCreateOrderInput(values),
      });
      toast.success('Pedido creado.');
      navigate(`/orders/${order.id}`);
    } catch (error) {
      applyFieldErrors(error, () => undefined);
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Nuevo pedido"
        description="El pedido siempre queda asociado a un cliente."
        backTo={{ to: '/orders', label: 'Pedidos' }}
      />
      <OrderForm
        defaultClientId={defaultClientId}
        clientQuery={clientQuery}
        onClientQueryChange={setClientQuery}
        clients={clientOptions}
        recipes={recipeOptions}
        onSubmit={handleSubmit}
        pending={create.isPending}
      />
    </div>
  );
}

