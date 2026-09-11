import { ChevronRight, Instagram, Phone } from 'lucide-react';
import { Link } from 'react-router';
import { ClientAvatar } from '@/components/common/client-avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Client } from '@/types/domain';

export function ClientListItem({ client }: { client: Client }) {
  const instagram = client.instagramUsername?.replace(/^@/, '');

  return (
    <Link
      to={`/clients/${client.id}`}
      className={cn(
        'flex min-h-16 items-center gap-3 overflow-hidden rounded-xl border bg-card px-3 py-3 active:bg-accent/60 hover:bg-accent/40 sm:px-4',
        client.needsFollowUp && 'border-warning/40',
      )}
    >
      <ClientAvatar name={client.name} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 truncate font-medium leading-snug">{client.name}</p>
          {client.needsFollowUp ? (
            <Badge variant="warning" className="shrink-0">
              Hay que responder
            </Badge>
          ) : null}
        </div>
        {client.phone || instagram ? (
          <div className="mt-0.5 flex min-w-0 items-center gap-x-3 text-xs text-muted-foreground">
            {client.phone ? (
              <span className="inline-flex min-w-0 items-center gap-1">
                <Phone className="h-3 w-3 shrink-0" />
                <span className="truncate">{client.phone}</span>
              </span>
            ) : null}
            {instagram ? (
              <span className="inline-flex min-w-0 items-center gap-1">
                <Instagram className="h-3 w-3 shrink-0" />
                <span className="truncate">@{instagram}</span>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
