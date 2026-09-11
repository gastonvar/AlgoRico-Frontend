import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '@/features/tasks/api/tasks-api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import type { ListTasksParams } from '@/types/api';
import type { Task } from '@/types/domain';

export function useTasks(params: ListTasksParams) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => listTasks(params),
  });
}

function invalidateTaskQueries(task?: Task) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  void queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
  void queryClient.invalidateQueries({ queryKey: ['client'] });
  if (task?.clientId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(task.clientId) });
  }
  if (task?.orderId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(task.orderId) });
  }
}

export function useCreateTask() {
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: (task) => {
      invalidateTaskQueries(task);
    },
  });
}

export function useUpdateTask() {
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) => updateTask(taskId, input),
    onSuccess: (task) => {
      invalidateTaskQueries(task);
    },
  });
}

export function useCompleteTask() {
  return useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      updateTask(taskId, { completed }),
    onMutate: async ({ taskId, completed }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });
      const snapshots = queryClient.getQueriesData({ queryKey: queryKeys.tasks.all });
      queryClient.setQueriesData({ queryKey: queryKeys.tasks.all }, (current) => {
        if (!current || typeof current !== 'object' || !('data' in current)) {
          return current;
        }
        const page = current as { data: Task[] };
        return {
          ...page,
          data: page.data.map((task) => (task.id === taskId ? { ...task, completed } : task)),
        };
      });
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      for (const [key, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: (task) => {
      invalidateTaskQueries(task);
    },
  });
}

export function useDeleteTask() {
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      invalidateTaskQueries();
    },
  });
}
