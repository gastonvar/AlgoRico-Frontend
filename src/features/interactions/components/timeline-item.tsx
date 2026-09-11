import { Instagram, MessageCircle, Phone, Store, Users } from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { Link } from 'react-router';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DateDisplay } from '@/components/common/date-display';
import { ItemActions } from '@/components/common/item-actions';
import { AttachmentGallery } from '@/features/attachments/components/attachment-gallery';
import { InteractionFormDialog } from '@/features/interactions/components/interaction-form-dialog';
import { useDeleteInteraction } from '@/features/interactions/hooks/use-interactions';
import { getErrorMessage } from '@/lib/api-error';
import type { Interaction, InteractionChannel } from '@/types/domain';
import { interactionChannelLabels } from '@/utils/labels';
import { toast } from 'sonner';

const channelIcons: Record<InteractionChannel, ComponentType<{ className?: string }>> = {
  WHATSAPP: MessageCircle,
  INSTAGRAM: Instagram,
  PHONE: Phone,
  IN_PERSON: Users,
  OTHER: Store,
};

export function TimelineItem({
  interaction,
  showOrderLink = false,
}: {
  interaction: Interaction;
  showOrderLink?: boolean;
}) {
  const Icon = channelIcons[interaction.channel] ?? Store;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const remove = useDeleteInteraction(interaction.clientId, interaction.orderId ?? undefined);

  return (
    <article className="min-w-0 rounded-xl border bg-card p-3 sm:p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 break-words">{interactionChannelLabels[interaction.channel] ?? interaction.channel}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <DateDisplay value={interaction.occurredAt} mode="relative" />
          </p>
          {showOrderLink && interaction.orderId ? (
            <p className="mt-1 text-sm">
              <Link className="text-primary" to={`/orders/${interaction.orderId}`}>
                Pedido
              </Link>
            </p>
          ) : null}
        </div>
        <ItemActions
          editLabel="Editar conversación"
          deleteLabel="Eliminar conversación"
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
      </div>
      <p className="mt-3 min-w-0 whitespace-pre-wrap break-words text-sm">{interaction.content}</p>
      <div className="mt-3 min-w-0">
        <AttachmentGallery
          attachments={interaction.attachments}
          clientId={interaction.clientId}
          orderId={interaction.orderId ?? undefined}
        />
      </div>
      <InteractionFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        clientId={interaction.clientId}
        orderId={interaction.orderId ?? undefined}
        interaction={interaction}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar conversación?"
        description="Se va a borrar esta conversación y sus capturas. No se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        pending={remove.isPending}
        onConfirm={async () => {
          try {
            await remove.mutateAsync(interaction.id);
            toast.success('Conversación eliminada.');
            setDeleteOpen(false);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />
    </article>
  );
}
