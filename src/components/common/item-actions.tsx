import { Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ItemActionsProps = {
  editLabel?: string;
  deleteLabel?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  editTo?: string;
  className?: string;
};

export function ItemActions({
  editLabel = 'Editar',
  deleteLabel = 'Eliminar',
  onEdit,
  onDelete,
  editTo,
  className,
}: ItemActionsProps) {
  if (!editTo && !onEdit && !onDelete) {
    return null;
  }

  return (
    <div className={cn('-mr-2 -mt-1 flex shrink-0 items-center', className)}>
      {editTo ? (
        <Button asChild variant="ghost" size="icon" aria-label={editLabel}>
          <Link to={editTo}>
            <Pencil />
          </Link>
        </Button>
      ) : onEdit ? (
        <Button type="button" variant="ghost" size="icon" aria-label={editLabel} onClick={onEdit}>
          <Pencil />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={deleteLabel}
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      ) : null}
    </div>
  );
}
