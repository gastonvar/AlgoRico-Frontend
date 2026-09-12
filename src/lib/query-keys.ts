export const queryKeys = {
  currentUser: ['current-user'] as const,
  dashboard: ['dashboard'] as const,
  clients: {
    all: ['clients'] as const,
    list: (filters: unknown) => ['clients', filters] as const,
    detail: (clientId: string) => ['client', clientId] as const,
  },
  interactions: {
    all: ['interactions'] as const,
    list: (clientId: string, filters?: unknown) =>
      ['client', clientId, 'interactions', filters] as const,
    forOrder: (orderId: string, filters?: unknown) =>
      ['order', orderId, 'interactions', filters] as const,
    detail: (interactionId: string) => ['interaction', interactionId] as const,
  },
  attachments: {
    detail: (attachmentId: string) => ['attachment', attachmentId] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (filters: unknown) => ['orders', filters] as const,
    detail: (orderId: string) => ['order', orderId] as const,
    payments: (orderId: string) => ['order', orderId, 'payments'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (filters: unknown) => ['tasks', filters] as const,
    detail: (taskId: string) => ['task', taskId] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    range: (from: string, to: string) => ['calendar', from, to] as const,
  },
  ingredients: {
    all: ['ingredients'] as const,
    list: (filters: unknown) => ['ingredients', filters] as const,
    detail: (ingredientId: string) => ['ingredient', ingredientId] as const,
  },
  recipes: {
    all: ['recipes'] as const,
    list: (filters: unknown) => ['recipes', filters] as const,
    detail: (recipeId: string) => ['recipe', recipeId] as const,
  },
};
