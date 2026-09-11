import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api-error';

type ErrorStateProps = {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
};

export function ErrorState({
  error,
  title = 'No pudimos cargar esta información',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border px-6 py-12 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-destructive" />
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      {onRetry ? (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
