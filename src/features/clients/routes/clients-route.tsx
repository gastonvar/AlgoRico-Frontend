import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { PaginationControls } from '@/components/common/pagination-controls';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { ClientFormDialog } from '@/features/clients/components/client-form-dialog';
import { ClientListItem } from '@/features/clients/components/client-list-item';
import { useClients, useCreateClient } from '@/features/clients/hooks/use-clients';
import type { ClientFormValues } from '@/features/clients/schemas/client-schemas';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { applyFieldErrors } from '@/lib/form-errors';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from 'sonner';

export function ClientsRoute() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const page = Number(params.get('page') ?? '1');
  const newOpen = params.get('new') === '1';
  const debouncedSearch = useDebouncedValue(search, 300);
  const [formOpen, setFormOpen] = useState(newOpen);
  const clients = useClients({ q: debouncedSearch, page, pageSize: 20 });
  const create = useCreateClient();
  const rows = clients.data?.data ?? [];

  function updateParams(next: Record<string, string | undefined>) {
    const nextParams = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    }
    setParams(nextParams);
  }

  async function handleCreate(values: ClientFormValues) {
    try {
      const client = await create.mutateAsync({
        name: values.name,
        phone: values.phone || undefined,
        instagramUsername: values.instagramUsername || undefined,
        email: values.email || undefined,
        notes: values.notes || undefined,
        needsFollowUp: values.needsFollowUp,
      });
      toast.success('Cliente creado.');
      setFormOpen(false);
      updateParams({ new: undefined });
      navigate(`/clients/${client.id}`);
    } catch (error) {
      applyFieldErrors(error, () => undefined);
      toast.error(getErrorMessage(error));
      throw error;
    }
  }

  return (
    <div className="min-w-0">
      <PageHeader
        title="Clientes"
        description="Buscá por nombre, teléfono o Instagram."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus />
            Nuevo cliente
          </Button>
        }
      />
      <div className="mb-4 sm:max-w-md">
        <SearchInput
          placeholder="Buscar clientes..."
          value={search}
          onChange={(event) => updateParams({ q: event.target.value, page: '1' })}
        />
      </div>
      {clients.isLoading ? <LoadingSkeleton /> : null}
      {clients.error ? <ErrorState error={clients.error} onRetry={() => void clients.refetch()} /> : null}
      {clients.data && rows.length === 0 ? (
        <EmptyState
          title="Todavía no hay clientes."
          description="Creá el primero para empezar a registrar conversaciones y pedidos."
        />
      ) : null}
      {clients.data && rows.length > 0 ? (
        <>
          <ul className="space-y-2">
            {rows.map((client) => (
              <li key={client.id}>
                <ClientListItem client={client} />
              </li>
            ))}
          </ul>
          <PaginationControls meta={clients.data.meta} onPageChange={(nextPage) => updateParams({ page: String(nextPage) })} />
        </>
      ) : null}
      <ClientFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            updateParams({ new: undefined });
          }
        }}
        onSubmit={handleCreate}
        pending={create.isPending}
      />
    </div>
  );
}
