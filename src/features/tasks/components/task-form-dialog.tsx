import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTask, useUpdateTask } from '@/features/tasks/hooks/use-tasks';
import { taskFormSchema, type TaskFormValues } from '@/features/tasks/schemas/task-schemas';
import { applyFieldErrors } from '@/lib/form-errors';
import { getErrorMessage } from '@/lib/api-error';
import { TASK_PRIORITIES, type Task } from '@/types/domain';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/utils/dates';
import { taskPriorityLabels } from '@/utils/labels';
import { toast } from 'sonner';

function defaultValues(
  task: Task | undefined,
  defaultClientId?: string,
  defaultOrderId?: string,
): TaskFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    dueAt: task?.dueAt ? toDateTimeLocalValue(task.dueAt) : '',
    priority: task?.priority ?? 'MEDIUM',
    clientId: task?.clientId ?? defaultClientId ?? '',
    orderId: task?.orderId ?? defaultOrderId ?? '',
  };
}

export function TaskFormDialog({
  open,
  onOpenChange,
  defaultClientId,
  defaultOrderId,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultClientId?: string;
  defaultOrderId?: string;
  task?: Task;
}) {
  const create = useCreateTask();
  const update = useUpdateTask();
  const isEdit = Boolean(task);
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultValues(task, defaultClientId, defaultOrderId),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues(task, defaultClientId, defaultOrderId));
  }, [defaultClientId, defaultOrderId, form, open, task]);

  async function onSubmit(values: TaskFormValues) {
    try {
      if (isEdit && task) {
        await update.mutateAsync({
          taskId: task.id,
          input: {
            title: values.title,
            description: values.description || null,
            dueAt: values.dueAt ? fromDateTimeLocalValue(values.dueAt) : null,
            priority: values.priority,
            clientId: values.clientId || defaultClientId || null,
            orderId: values.orderId || defaultOrderId || null,
          },
        });
        toast.success('Tarea actualizada.');
      } else {
        await create.mutateAsync({
          title: values.title,
          description: values.description || undefined,
          dueAt: values.dueAt ? fromDateTimeLocalValue(values.dueAt) : undefined,
          priority: values.priority,
          clientId: values.clientId || defaultClientId || null,
          orderId: values.orderId || defaultOrderId || null,
        });
        toast.success('Tarea creada.');
      }
      onOpenChange(false);
    } catch (error) {
      applyFieldErrors(error, form.setError);
      form.setError('root', { message: getErrorMessage(error) });
    }
  }

  const pending = create.isPending || update.isPending || form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Field>
            <Label htmlFor="task-title">Título</Label>
            <Input id="task-title" {...form.register('title')} />
            <FieldError>{form.formState.errors.title?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="task-description">Descripción</Label>
            <Textarea id="task-description" {...form.register('description')} />
          </Field>
          <Field>
            <Label htmlFor="task-due">Vence</Label>
            <Input id="task-due" type="datetime-local" className="max-w-full text-base" {...form.register('dueAt')} />
          </Field>
          <Field>
            <Label htmlFor="task-priority">Prioridad</Label>
            <NativeSelect id="task-priority" {...form.register('priority')}>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {taskPriorityLabels[priority]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <FieldError>{form.formState.errors.root?.message}</FieldError>
          <DialogFooter>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
