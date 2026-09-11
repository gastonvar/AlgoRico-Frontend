import { Link } from 'react-router';
import { attentionCardLinkClassName } from '@/features/dashboard/components/dashboard-card-classes';
import type { Client } from '@/types/domain';

export function AttentionClientCard({ client }: { client: Client }) {
  return (
    <Link to={`/clients/${client.id}`} className={attentionCardLinkClassName}>
      <p className="truncate font-medium">Responder a {client.name}</p>
      <p className="text-sm text-muted-foreground">Hay que hacer seguimiento</p>
    </Link>
  );
}
