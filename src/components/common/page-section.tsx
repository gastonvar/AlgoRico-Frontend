import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageSectionProps = {
  id?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PageSection({ id, title, description, actions, children, className }: PageSectionProps) {
  return (
    <section
      id={id}
      className={cn('min-w-0 scroll-mt-28 rounded-xl border bg-card p-4 sm:scroll-mt-32 sm:p-5', className)}
    >
      {title || actions ? (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center [&>a]:w-full [&>a]:sm:w-auto [&>button]:w-full [&>button]:sm:w-auto">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
