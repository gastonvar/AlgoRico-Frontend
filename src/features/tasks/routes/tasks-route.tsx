import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { DateDisplay } from '@/components/common/date-display';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { ItemActions } from '@/components/common/item-actions';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { TaskPriorityBadge } from '@/components/common/status-badges';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskFormDialog } from '@/features/tasks/components/task-form-dialog';
import { useCompleteTask, useDeleteTask, useTasks } from '@/features/tasks/hooks/use-tasks';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { getErrorMessage } from '@/lib/api-error';
import { Link } from 'react-router';
import { toast } from 'sonner';
import type { Task } from '@/types/domain';

export function TasksRoute() {
  const [params, setParams] = useSearchParams();
  const due = params.get('due') ?? '';
  const completed = params.get('completed');
  const page = Number(params.get('page') ?? '1');
  const newOpen = params.get('new') === '1';
  const [formOpen, setFormOpen] = useState(newOpen);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const tasks = useTasks({
    due: due === 'overdue' || due === 'today' || due === 'upcoming' ? due : undefined,
    completed: completed === 'true' ? true : completed === 'false' ? false : undefined,
    page,
    pageSize: 30,
  });
  const complete = useCompleteTask();
  const remove = useDeleteTask();

  const grouped = useMemo(() => {
    const items = tasks.data?.data ?? [];
    return {
      overdue: items.filter((task) => isOverdue(task)),
      today: items.filter((task) => isTodayTask(task) && !task.completed),
      upcoming: items.filter((task) => !task.completed && !isOverdue(task) && !isTodayTask(task)),
      completed: items.filter((task) => task.completed),
    };
  }, [tasks.data]);

  function update(next: Record<string, string | undefined>) {
    const nextParams = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (!value) nextParams.delete(key);
      else nextParams.set(key, value);
    }
    setParams(nextParams);
  }

  return (
    <div>
      <PageHeader
        title="Tareas"
        description="Lo que hay que hacer, primero lo vencido y lo de hoy."
        actions={
          <Button
            onClick={() => {
              setEditingTask(null);
              setFormOpen(true);
            }}
          >
            Nueva tarea
          </Button>
        }
      />
      <div className="mb-4 w-full sm:max-w-xs">
        <Label htmlFor="task-filter">Filtro</Label>
        <Select
          value={due || (completed === 'true' ? 'completed' : 'open')}
          onValueChange={(value) => {
            if (value === 'completed') update({ due: undefined, completed: 'true', page: '1' });
            else if (value === 'open') update({ due: undefined, completed: 'false', page: '1' });
            else update({ due: value, completed: 'false', page: '1' });
          }}
        >
          <SelectTrigger id="task-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Abiertas</SelectItem>
            <SelectItem value="overdue">Vencidas</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="upcoming">Próximas</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {tasks.isLoading ? <LoadingSkeleton /> : null}
      {tasks.error ? <ErrorState error={tasks.error} onRetry={() => void tasks.refetch()} /> : null}
      {tasks.data && tasks.data.data.length === 0 ? (
        <EmptyState
          title="No hay tareas."
          description="Creá un seguimiento para no dejar a nadie sin respuesta."
          actionLabel="Nueva tarea"
          onAction={() => setFormOpen(true)}
        />
      ) : null}
      {tasks.data && tasks.data.data.length > 0 && !due ? (
        <div className="space-y-6">
          <TaskGroup
            title="Vencidas"
            tasks={grouped.overdue}
            onComplete={complete.mutateAsync}
            onEdit={setEditingTask}
            onDelete={setPendingDelete}
          />
          <TaskGroup title="Hoy" tasks={grouped.today} onComplete={complete.mutateAsync} onEdit={setEditingTask} onDelete={setPendingDelete} />
          <TaskGroup
            title="Próximas"
            tasks={grouped.upcoming}
            onComplete={complete.mutateAsync}
            onEdit={setEditingTask}
            onDelete={setPendingDelete}
          />
          <TaskGroup
            title="Completadas"
            tasks={grouped.completed}
            onComplete={complete.mutateAsync}
            onEdit={setEditingTask}
            onDelete={setPendingDelete}
          />
        </div>
      ) : null}
      {tasks.data && due ? (
        <TaskGroup
          title={due === 'overdue' ? 'Vencidas' : due === 'today' ? 'Hoy' : 'Próximas'}
          tasks={tasks.data.data}
          onComplete={complete.mutateAsync}
          onEdit={setEditingTask}
          onDelete={setPendingDelete}
        />
      ) : null}
      {tasks.data ? <PaginationControlsFallback meta={tasks.data.meta} onPageChange={(next) => update({ page: String(next) })} /> : null}
      <TaskFormDialog
        open={formOpen || Boolean(editingTask)}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingTask(null);
            update({ new: undefined });
          }
        }}
        task={editingTask ?? undefined}
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
    </div>
  );
}

function PaginationControlsFallback({
  meta,
  onPageChange,
}: {
  meta: { page: number; totalPages: number };
  onPageChange: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;
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

function isOverdue(task: Task) {
  if (!task.dueAt || task.completed) return false;
  return new Date(task.dueAt).getTime() < new Date().setHours(0, 0, 0, 0);
}

function isTodayTask(task: Task) {
  if (!task.dueAt) return false;
  const due = new Date(task.dueAt);
  const now = new Date();
  return due.toDateString() === now.toDateString();
}

function TaskGroup({
  title,
  tasks,
  onComplete,
  onEdit,
  onDelete,
}: {
  title: string;
  tasks: Task[];
  onComplete: (input: { taskId: string; completed: boolean }) => Promise<unknown>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className={`rounded-xl border p-4 ${task.completed ? 'opacity-60' : 'bg-card'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                {task.dueAt ? (
                  <p className="text-sm text-muted-foreground">
                    <DateDisplay value={task.dueAt} mode="relative" />
                  </p>
                ) : null}
                <div className="mt-1 flex flex-wrap gap-2">
                  <TaskPriorityBadge priority={task.priority} />
                  {task.clientId ? (
                    <Link className="text-sm text-primary" to={`/clients/${task.clientId}`}>
                      {task.clientName ?? 'Cliente'}
                    </Link>
                  ) : null}
                  {task.orderId ? (
                    <Link className="text-sm text-primary" to={`/orders/${task.orderId}`}>
                      Pedido
                    </Link>
                  ) : null}
                </div>
              </div>
              <ItemActions
                editLabel="Editar tarea"
                deleteLabel="Eliminar tarea"
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task.id)}
              />
            </div>
            <Button
              variant="outline"
              className="mt-3 w-full sm:w-auto"
              onClick={async () => {
                try {
                  await onComplete({ taskId: task.id, completed: !task.completed });
                  toast.success(task.completed ? 'Tarea reabierta.' : 'Tarea completada.');
                } catch (error) {
                  toast.error(getErrorMessage(error));
                }
              }}
            >
              {task.completed ? 'Reabrir' : 'Completar'}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
