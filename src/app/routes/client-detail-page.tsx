import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ClientDetailBody } from '@/app/components/client-detail-body';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { ClientFormDialog } from '@/features/clients/components/client-form-dialog';
import { ClientHeader } from '@/features/clients/components/client-header';
import { useClient, useUpdateClient } from '@/features/clients/hooks/use-clients';
import type { ClientFormValues } from '@/features/clients/schemas/client-schemas';
import { InteractionFormDialog } from '@/features/interactions/components/interaction-form-dialog';
import { TaskFormDialog } from '@/features/tasks/components/task-form-dialog';
import { getErrorMessage } from '@/lib/api-error';
import { ApiError } from '@/lib/api-error';
import { toast } from 'sonner';

export function ClientDetailPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const clientQuery = useClient(clientId);
  const update = useUpdateClient(clientId ?? '');
  const [editOpen, setEditOpen] = useState(false);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  if (clientQuery.isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (clientQuery.error instanceof ApiError && clientQuery.error.status === 404) {
    return <ErrorState title="No encontramos este cliente." error={clientQuery.error} />;
  }

  if (clientQuery.error || !clientQuery.data || !clientId) {
    return <ErrorState error={clientQuery.error} onRetry={() => void clientQuery.refetch()} />;
  }

  const client = clientQuery.data;

  async function handleEdit(values: ClientFormValues) {
    try {
      await update.mutateAsync({
        name: values.name,
        phone: values.phone || null,
        instagramUsername: values.instagramUsername || null,
        email: values.email || null,
        notes: values.notes || null,
        needsFollowUp: values.needsFollowUp,
      });
      toast.success('Cliente actualizado.');
      setEditOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }

  return (
    <div className="min-w-0">
      <PageHeader backTo={{ to: '/clients', label: 'Clientes' }} />
      <div className="space-y-4 sm:space-y-6">
        <ClientHeader
          client={client}
          onEdit={() => setEditOpen(true)}
          onNewOrder={() => navigate(`/orders/new?clientId=${client.id}`)}
          onArchive={() => setArchiveOpen(true)}
          onRestore={async () => {
            try {
              await update.mutateAsync({ archived: false });
              toast.success('Cliente restaurado.');
            } catch (error) {
              toast.error(getErrorMessage(error));
            }
          }}
        />
        <ClientDetailBody
          client={client}
          onNewInteraction={() => setInteractionOpen(true)}
          onNewOrder={() => navigate(`/orders/new?clientId=${client.id}`)}
          onNewTask={() => setTaskOpen(true)}
        />
      </div>
      <ClientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
        onSubmit={handleEdit}
        pending={update.isPending}
      />
      <InteractionFormDialog open={interactionOpen} onOpenChange={setInteractionOpen} clientId={client.id} />
      <TaskFormDialog open={taskOpen} onOpenChange={setTaskOpen} defaultClientId={client.id} />
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="¿Archivar cliente?"
        description="Deja de aparecer en la lista. Los pedidos y conversaciones se conservan y podés restaurarlo después."
        confirmLabel="Sí, archivar"
        destructive
        pending={update.isPending}
        onConfirm={async () => {
          try {
            await update.mutateAsync({ archived: true });
            toast.success('Cliente archivado.');
            setArchiveOpen(false);
            navigate('/clients');
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
