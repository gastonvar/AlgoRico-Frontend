import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  backTo?: { to: string; label: string };
};

export function PageHeader({ title, description, actions, backTo }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {backTo ? (
          <Link
            to={backTo.to}
            className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            {backTo.label}
          </Link>
        ) : null}
        <h1 className="hidden text-2xl font-semibold tracking-tight lg:block">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground lg:mt-1">{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto [&>a]:w-full [&>a]:sm:w-auto [&>button]:w-full [&>button]:sm:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
