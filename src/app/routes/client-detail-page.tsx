import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { Button } from '@/components/ui/button';
import { ClientFormDialog } from '@/features/clients/components/client-form-dialog';
import { ClientHeader } from '@/features/clients/components/client-header';
import { ClientNotes } from '@/features/clients/components/client-notes';
import { useClient, useUpdateClient } from '@/features/clients/hooks/use-clients';
import type { ClientFormValues } from '@/features/clients/schemas/client-schemas';
import { ClientTimeline } from '@/features/interactions/components/client-timeline';
import { InteractionFormDialog } from '@/features/interactions/components/interaction-form-dialog';
import { ClientOrders } from '@/features/orders/components/client-orders';
import { TaskFormDialog } from '@/features/tasks/components/task-form-dialog';
import { TaskListSection } from '@/features/tasks/components/task-list-section';
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
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <ClientHeader
        client={client}
        onEdit={() => setEditOpen(true)}
        onNewInteraction={() => setInteractionOpen(true)}
        onNewOrder={() => navigate(`/orders/new?clientId=${client.id}`)}
        onNewTask={() => setTaskOpen(true)}
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
      <ClientTimeline clientId={client.id} onCreate={() => setInteractionOpen(true)} />
      <ClientOrders clientId={client.id} onCreate={() => navigate(`/orders/new?clientId=${client.id}`)} />
      <section className="min-w-0 rounded-xl border bg-card p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Tareas</h2>
          <Button className="w-full sm:w-auto" variant="outline" onClick={() => setTaskOpen(true)}>
            Nueva tarea
          </Button>
        </div>
        <TaskListSection clientId={client.id} onCreate={() => setTaskOpen(true)} />
      </section>
      <ClientNotes client={client} />
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
