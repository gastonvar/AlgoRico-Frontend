import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PaginationControls } from '@/components/common/pagination-controls';
import { TimelineItem } from '@/features/interactions/components/timeline-item';
import { useInteractions, useOrderInteractions } from '@/features/interactions/hooks/use-interactions';
import { useState } from 'react';

export function ClientTimeline({
  clientId,
  orderId,
  onCreate,
  showTitle = true,
}: {
  clientId?: string;
  orderId?: string;
  onCreate?: () => void;
  showTitle?: boolean;
}) {
  const [page, setPage] = useState(1);
  const clientInteractions = useInteractions(orderId ? undefined : clientId, { page, pageSize: 20 });
  const orderInteractions = useOrderInteractions(orderId, { page, pageSize: 20 });
  const interactions = orderId ? orderInteractions : clientInteractions;

  return (
    <section className="min-w-0">
      {showTitle ? <h2 className="mb-2 text-lg font-semibold sm:mb-3">Conversaciones</h2> : null}
      {interactions.isLoading ? <LoadingSkeleton rows={3} /> : null}
      {interactions.error ? <ErrorState error={interactions.error} onRetry={() => void interactions.refetch()} /> : null}
      {interactions.data && interactions.data.data.length === 0 ? (
        <EmptyState
          title="Todavía no hay conversaciones."
          description="Registrá lo que hablaron por WhatsApp, Instagram o teléfono."
          actionLabel={onCreate ? 'Nueva conversación' : undefined}
          onAction={onCreate}
        />
      ) : null}
      {interactions.data ? (
        <>
          <div className="space-y-2 sm:space-y-3">
            {interactions.data.data.map((interaction) => (
              <TimelineItem
                key={interaction.id}
                interaction={interaction}
                showOrderLink={!orderId}
              />
            ))}
          </div>
          <PaginationControls meta={interactions.data.meta} onPageChange={setPage} />
        </>
      ) : null}
    </section>
  );
}
