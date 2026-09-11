import { Instagram, Phone } from 'lucide-react';
import { Link } from 'react-router';
import { ClientAvatar } from '@/components/common/client-avatar';
import { Badge } from '@/components/ui/badge';
import type { Client } from '@/types/domain';

export function ClientListItem({ client }: { client: Client }) {
  return (
    <Link
      to={`/clients/${client.id}`}
      className="flex min-h-16 items-start gap-3 overflow-hidden rounded-xl border bg-card p-4 active:bg-accent/60 hover:bg-accent/40"
    >
      <ClientAvatar name={client.name} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="min-w-0 break-words font-medium leading-snug">{client.name}</p>
          {client.needsFollowUp ? (
            <Badge variant="warning" className="max-w-full whitespace-normal">
              Hay que responder
            </Badge>
          ) : null}
        </div>
        <div className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4">
          {client.phone ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 break-all">{client.phone}</span>
            </span>
          ) : null}
          {client.instagramUsername ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Instagram className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 break-all">@{client.instagramUsername.replace(/^@/, '')}</span>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
