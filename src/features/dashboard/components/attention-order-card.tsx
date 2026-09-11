import { Link } from 'react-router';
import { attentionCardLinkClassName } from '@/features/dashboard/components/dashboard-card-classes';
import type { MissingInfoOrder } from '@/types/domain';
import { labelForMissingIssue } from '@/utils/labels';

export function AttentionOrderCard({ order }: { order: MissingInfoOrder }) {
  return (
    <Link to={`/orders/${order.id}`} className={attentionCardLinkClassName}>
      <p className="truncate font-medium">{order.clientName}</p>
      <p className="break-words text-sm text-muted-foreground">{order.issues.map(labelForMissingIssue).join(' · ')}</p>
    </Link>
  );
}
