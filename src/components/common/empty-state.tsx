import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, actionLabel, onAction, icon, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center sm:px-6 sm:py-12', className)}>
      {icon ? <div className="mb-3 text-muted-foreground">{icon}</div> : null}
      <h2 className="text-lg font-medium">{title}</h2>
      {description ? <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-4 w-full sm:w-auto" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
