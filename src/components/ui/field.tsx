import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5', className)} {...props} />;
}

function FieldError({ children }: { children?: string }) {
  if (!children) {
    return null;
  }
  return (
    <p className="text-sm text-destructive" role="alert">
      {children}
    </p>
  );
}

export { Field, FieldError };
