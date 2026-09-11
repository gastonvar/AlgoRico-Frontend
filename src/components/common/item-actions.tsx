import { Check, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ItemActionsProps = {
  completeLabel?: string;
  reopenLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  completed?: boolean;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  editTo?: string;
  className?: string;
};

const iconButtonClassName = 'shrink-0 border-input';

export function ItemActions({
  completeLabel = 'Completar',
  reopenLabel = 'Reabrir',
  editLabel = 'Editar',
  deleteLabel = 'Eliminar',
  completed = false,
  onComplete,
  onEdit,
  onDelete,
  editTo,
  className,
}: ItemActionsProps) {
  if (!onComplete && !editTo && !onEdit && !onDelete) {
    return null;
  }

  return (
    <div className={cn('flex shrink-0 items-start gap-1.5', className)}>
      {onComplete ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={iconButtonClassName}
          aria-label={completed ? reopenLabel : completeLabel}
          onClick={onComplete}
        >
          {completed ? <RotateCcw /> : <Check />}
        </Button>
      ) : null}
      {editTo ? (
        <Button asChild variant="outline" size="icon" className={iconButtonClassName} aria-label={editLabel}>
          <Link to={editTo}>
            <Pencil />
          </Link>
        </Button>
      ) : onEdit ? (
        <Button type="button" variant="outline" size="icon" className={iconButtonClassName} aria-label={editLabel} onClick={onEdit}>
          <Pencil />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(iconButtonClassName, 'text-destructive hover:bg-destructive/10 hover:text-destructive')}
          aria-label={deleteLabel}
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      ) : null}
    </div>
  );
}
