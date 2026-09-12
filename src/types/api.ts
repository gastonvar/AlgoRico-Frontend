export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type ListClientsParams = PaginationParams & {
  q?: string;
  needsFollowUp?: boolean;
  includeArchived?: boolean;
};

export type ListOrdersParams = PaginationParams & {
  status?: string;
  paymentStatus?: string;
  fulfillmentType?: string;
  clientId?: string;
  q?: string;
  from?: string;
  to?: string;
};

export type ListTasksParams = PaginationParams & {
  completed?: boolean;
  due?: 'overdue' | 'today' | 'upcoming';
  clientId?: string;
  orderId?: string;
  priority?: string;
};

export type ListInteractionsParams = PaginationParams;

export type ListIngredientsParams = PaginationParams & {
  q?: string;
};

export type ListRecipesParams = PaginationParams & {
  q?: string;
};
