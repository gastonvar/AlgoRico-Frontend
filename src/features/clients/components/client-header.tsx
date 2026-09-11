import { Instagram, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientAvatar } from '@/components/common/client-avatar';
import { ItemActions } from '@/components/common/item-actions';
import { instagramUrl } from '@/utils/instagram';
import type { ClientDetail } from '@/types/domain';

type ClientHeaderProps = {
  client: ClientDetail;
  onEdit: () => void;
  onNewInteraction: () => void;
  onNewOrder: () => void;
  onNewTask: () => void;
  onArchive: () => void;
  onRestore: () => void;
};

export function ClientHeader({
  client,
  onEdit,
  onNewInteraction,
  onNewOrder,
  onNewTask,
  onArchive,
  onRestore,
}: ClientHeaderProps) {
  return (
    <section className="min-w-0 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <ClientAvatar name={client.name} className="h-12 w-12 shrink-0 text-lg sm:h-14 sm:w-14" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold leading-tight sm:text-2xl">{client.name}</h2>
              {client.needsFollowUp ? <Badge variant="warning">Hay que responder</Badge> : null}
            </div>
            <div className="mt-1 flex flex-col text-sm text-muted-foreground">
              {client.phone ? (
                <a
                  className="inline-flex min-h-11 max-w-full items-center gap-2 break-all py-1 hover:text-foreground"
                  href={`tel:${client.phone}`}
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  {client.phone}
                </a>
              ) : null}
              {client.instagramUsername ? (
                <a
                  className="inline-flex min-h-11 max-w-full items-center gap-2 break-all py-1 hover:text-foreground"
                  href={instagramUrl(client.instagramUsername)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram className="h-4 w-4 shrink-0" />
                  @{client.instagramUsername.replace(/^@/, '')}
                </a>
              ) : null}
              {client.email ? <p className="min-h-11 break-all py-2">{client.email}</p> : null}
            </div>
          </div>
        </div>
        <ItemActions editLabel="Editar cliente" onEdit={onEdit} />
      </div>
      <div className="mt-4 grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button className="w-full whitespace-normal px-2 text-center sm:w-auto sm:whitespace-nowrap sm:px-4" onClick={onNewInteraction}>
          Nueva conversación
        </Button>
        <Button
          className="w-full whitespace-normal px-2 text-center sm:w-auto sm:whitespace-nowrap sm:px-4"
          variant="secondary"
          onClick={onNewOrder}
        >
          Nuevo pedido
        </Button>
        <Button
          className="w-full whitespace-normal px-2 text-center sm:w-auto sm:whitespace-nowrap sm:px-4"
          variant="outline"
          onClick={onNewTask}
        >
          Nueva tarea
        </Button>
        {client.archivedAt ? (
          <Button
            className="w-full whitespace-normal px-2 text-center sm:w-auto sm:whitespace-nowrap sm:px-4"
            variant="secondary"
            onClick={onRestore}
          >
            Restaurar
          </Button>
        ) : (
          <Button
            className="w-full whitespace-normal px-2 text-center sm:w-auto sm:whitespace-nowrap sm:px-4"
            variant="ghost"
            onClick={onArchive}
          >
            Archivar
          </Button>
        )}
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-xs sm:gap-3 sm:text-sm">
        <div className="min-w-0">
          <dt className="leading-tight text-muted-foreground">Conversaciones</dt>
          <dd className="font-medium">{client.interactionCount}</dd>
        </div>
        <div className="min-w-0">
          <dt className="leading-tight text-muted-foreground">Pedidos</dt>
          <dd className="font-medium">{client.orderCount}</dd>
        </div>
        <div className="min-w-0">
          <dt className="leading-tight text-muted-foreground">Tareas abiertas</dt>
          <dd className="font-medium">{client.openTaskCount}</dd>
        </div>
      </dl>
    </section>
  );
}
