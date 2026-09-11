import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/types/domain';

type PaginationControlsProps = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

export function PaginationControls({ meta, onPageChange }: PaginationControlsProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-sm text-muted-foreground sm:text-left">
        Página {meta.page} de {meta.totalPages}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button variant="outline" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          Anterior
        </Button>
        <Button variant="outline" disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
