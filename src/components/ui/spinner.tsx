import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SpinnerProps = {
  className?: string;
  label?: string;
};

function Spinner({ className, label = 'Cargando' }: SpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2" role="status" aria-label={label}>
      <Loader2 className={cn('h-4 w-4 animate-spin', className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function PageSpinner({ children = 'Cargando…' }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p>{children}</p>
    </div>
  );
}

export { Spinner, PageSpinner };
