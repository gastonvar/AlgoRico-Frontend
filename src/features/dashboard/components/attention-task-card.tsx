import { Link } from 'react-router';
import { TaskPriorityBadge } from '@/components/common/status-badges';
import { attentionCardLinkClassName } from '@/features/dashboard/components/dashboard-card-classes';
import type { Task } from '@/types/domain';

export function AttentionTaskCard({ task, subtitle }: { task: Task; subtitle: string }) {
  const to = task.orderId ? `/orders/${task.orderId}` : task.clientId ? `/clients/${task.clientId}` : '/tasks';
  return (
    <Link to={to} className={attentionCardLinkClassName}>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-medium">{task.title}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-1.5">
          <TaskPriorityBadge priority={task.priority} />
        </div>
      </div>
    </Link>
  );
}
