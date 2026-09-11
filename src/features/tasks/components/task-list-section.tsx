import { useState } from 'react';
import { Link } from 'react-router';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DateDisplay } from '@/components/common/date-display';
import { EmptyState } from '@/components/common/empty-state';
import { ItemActions } from '@/components/common/item-actions';
import { TaskPriorityBadge } from '@/components/common/status-badges';
import { Button } from '@/components/ui/button';
import { TaskFormDialog } from '@/features/tasks/components/task-form-dialog';
import { useCompleteTask, useDeleteTask, useTasks } from '@/features/tasks/hooks/use-tasks';
import { getErrorMessage } from '@/lib/api-error';
import type { Task } from '@/types/domain';
import { toast } from 'sonner';

export function TaskListSection({
  clientId,
  orderId,
  onCreate,
}: {
  clientId?: string;
  orderId?: string;
  onCreate?: () => void;
}) {
  const tasks = useTasks({ clientId, orderId, pageSize: 50 });
  const complete = useCompleteTask();
  const remove = useDeleteTask();
  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  if (tasks.isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando tareas…</p>;
  }

  if (!tasks.data || tasks.data.data.length === 0) {
    return (
      <EmptyState
        title="No hay tareas."
        description="Usá una tarea para no olvidarte de responder o preparar algo."
        actionLabel={onCreate ? 'Nueva tarea' : undefined}
        onAction={onCreate}
      />
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {tasks.data.data.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={() => void toggle(task, complete.mutateAsync)}
            onEdit={() => setEditing(task)}
            onDelete={() => setPendingDelete(task.id)}
          />
        ))}
      </ul>
      <TaskFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        task={editing ?? undefined}
        defaultClientId={clientId}
        defaultOrderId={orderId}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="¿Eliminar tarea?"
        description="Se va a borrar y no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        pending={remove.isPending}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await remove.mutateAsync(pendingDelete);
            toast.success('Tarea eliminada.');
            setPendingDelete(null);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />
    </>
  );
}

async function toggle(task: Task, mutate: (input: { taskId: string; completed: boolean }) => Promise<unknown>) {
  try {
    await mutate({ taskId: task.id, completed: !task.completed });
    toast.success(task.completed ? 'Tarea reabierta.' : 'Tarea completada.');
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
}

function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className={`rounded-xl border p-4 ${task.completed ? 'opacity-60' : 'bg-card'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
          {task.dueAt ? (
            <p className="text-sm text-muted-foreground">
              <DateDisplay value={task.dueAt} mode="relative" />
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-2 text-sm">
            <TaskPriorityBadge priority={task.priority} />
            {task.clientId ? (
              <Link className="text-primary" to={`/clients/${task.clientId}`}>
                {task.clientName ?? 'Cliente'}
              </Link>
            ) : null}
            {task.orderId ? (
              <Link className="text-primary" to={`/orders/${task.orderId}`}>
                Pedido
              </Link>
            ) : null}
          </div>
        </div>
        <ItemActions editLabel="Editar tarea" deleteLabel="Eliminar tarea" onEdit={onEdit} onDelete={onDelete} />
      </div>
      <Button variant="outline" className="mt-3 w-full sm:w-auto" onClick={onToggle}>
        {task.completed ? 'Reabrir' : 'Completar'}
      </Button>
    </li>
  );
}
