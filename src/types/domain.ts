export const INTERACTION_CHANNELS = [
  'WHATSAPP',
  'INSTAGRAM',
  'PHONE',
  'IN_PERSON',
  'OTHER',
] as const;

export type InteractionChannel = (typeof INTERACTION_CHANNELS)[number];

export const ORDER_STATUSES = [
  'LEAD',
  'QUOTED',
  'AWAITING_DEPOSIT',
  'CONFIRMED',
  'IN_PRODUCTION',
  'READY',
  'DELIVERED',
  'PICKED_UP',
  'COMPLETED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const FULFILLMENT_TYPES = ['PICKUP', 'DELIVERY'] as const;
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];

export const PAYMENT_TYPES = ['DEPOSIT', 'FINAL', 'OTHER'] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'CARD', 'OTHER'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ['UNPAID', 'PARTIALLY_PAID', 'PAID'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const CSRF_COOKIE_NAME = 'algorico.csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export type User = {
  id: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Client = {
  id: string;
  name: string;
  phone: string | null;
  instagramUsername: string | null;
  email: string | null;
  notes: string | null;
  needsFollowUp: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClientDetail = Client & {
  interactionCount: number;
  orderCount: number;
  openTaskCount: number;
};

export type Attachment = {
  id: string;
  interactionId: string | null;
  paymentId: string | null;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
};

export type AttachmentDownload = Attachment & {
  downloadUrl: string;
  expiresInSeconds: number;
};

export type Interaction = {
  id: string;
  clientId: string;
  orderId: string | null;
  userId: string;
  channel: InteractionChannel;
  content: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
};

export type OrderItem = {
  id: string;
  orderId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  orderId: string;
  type: PaymentType;
  amount: number;
  paymentMethod: PaymentMethod;
  paidAt: string;
  notes: string | null;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  clientId: string;
  client: Client | null;
  status: OrderStatus;
  eventDate: string | null;
  eventTime: string | null;
  description: string | null;
  fulfillmentType: FulfillmentType;
  deliveryAddress: string | null;
  deliveryTime: string | null;
  notes: string | null;
  items: OrderItem[];
  payments: Payment[];
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  clientId: string | null;
  orderId: string | null;
  clientName: string | null;
  orderStatus: string | null;
  title: string;
  description: string | null;
  dueAt: string | null;
  priority: TaskPriority;
  completed: boolean;
  completedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MissingInfoOrder = {
  id: string;
  clientName: string;
  status: string;
  eventDate: string | null;
  issues: string[];
};

export type Dashboard = {
  today: {
    date: string;
    orderCount: number;
    orders: Order[];
    pickups: Order[];
    deliveries: Order[];
  };
  needsAttention: {
    overdueTasks: Task[];
    tasksDueToday: Task[];
    followUpClients: Client[];
    ordersMissingInformation: MissingInfoOrder[];
  };
  upcoming: {
    orders: Order[];
    tasks: Task[];
  };
  payments: {
    outstandingOrderCount: number;
    outstandingTotal: number;
    outstandingOrders: Order[];
  };
};

export type CalendarEvent = {
  id: string;
  clientId: string;
  clientName: string;
  status: string;
  eventDate: string;
  eventTime: string | null;
  fulfillmentType: string;
  description: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  paymentStatus: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};
