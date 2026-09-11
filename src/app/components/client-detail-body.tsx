import { PageSection } from '@/components/common/page-section';
import { SectionNav } from '@/components/common/section-nav';
import { Button } from '@/components/ui/button';
import { ClientNotes } from '@/features/clients/components/client-notes';
import { ClientTimeline } from '@/features/interactions/components/client-timeline';
import { ClientOrders } from '@/features/orders/components/client-orders';
import { TaskListSection } from '@/features/tasks/components/task-list-section';
import type { Client } from '@/types/domain';

const CLIENT_DETAIL_NAV = [
  { href: '#conversaciones', label: 'Conversaciones' },
  { href: '#pedidos', label: 'Pedidos' },
  { href: '#tareas', label: 'Tareas' },
  { href: '#notas', label: 'Notas' },
];

type ClientDetailBodyProps = {
  client: Client;
  onNewInteraction: () => void;
  onNewOrder: () => void;
  onNewTask: () => void;
};

export function ClientDetailBody({ client, onNewInteraction, onNewOrder, onNewTask }: ClientDetailBodyProps) {
  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <SectionNav items={CLIENT_DETAIL_NAV} />
      <div className="grid gap-4 lg:grid-cols-3 lg:items-start lg:gap-6">
        <div className="min-w-0 lg:col-span-2">
          <PageSection
            id="conversaciones"
            title="Conversaciones"
            actions={
              <Button variant="outline" onClick={onNewInteraction}>
                Nueva conversación
              </Button>
            }
          >
            <ClientTimeline clientId={client.id} showTitle={false} />
          </PageSection>
        </div>
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <PageSection
            id="pedidos"
            title="Pedidos"
            actions={
              <Button variant="outline" onClick={onNewOrder}>
                Nuevo pedido
              </Button>
            }
          >
            <ClientOrders clientId={client.id} showTitle={false} />
          </PageSection>
          <PageSection
            id="tareas"
            title="Tareas"
            actions={
              <Button variant="outline" onClick={onNewTask}>
                Nueva tarea
              </Button>
            }
          >
            <TaskListSection clientId={client.id} />
          </PageSection>
          <PageSection
            id="notas"
            title="Notas del cliente"
            description="Preferencias, alergias u otros datos que no cambian con cada chat."
          >
            <ClientNotes client={client} />
          </PageSection>
        </div>
      </div>
    </div>
  );
}
