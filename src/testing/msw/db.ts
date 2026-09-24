import type {
  Attachment,
  CalendarEvent,
  Client,
  ClientDetail,
  Dashboard,
  Ingredient,
  Interaction,
  Order,
  OrderItem,
  Recipe,
  Task,
  User,
} from '@/types/domain';

type Db = {
  user: User;
  authenticated: boolean;
  clients: ClientDetail[];
  interactions: Interaction[];
  orders: Order[];
  tasks: Task[];
  ingredients: Ingredient[];
  recipes: Recipe[];
};

const isoNow = () => new Date().toISOString();

const initialUser: User = {
  id: 'user-1',
  email: 'owner@algorico.local',
  active: true,
  company: {
    id: 'company-algorico',
    name: 'Algo Rico',
    slug: 'algorico',
    subtitle: 'Santa Lucía',
    logoMarkUrl: '/images/logo.png',
    logoWordmarkUrl: '/images/logoandalgorico.png',
  },
  createdAt: isoNow(),
  updatedAt: isoNow(),
};

function createDb(): Db {
  return {
    user: initialUser,
    authenticated: false,
    clients: [],
    interactions: [],
    orders: [],
    tasks: [],
    ingredients: [],
    recipes: [],
  };
}

let db: Db = createDb();

export function resetDb() {
  db = createDb();
}

export function getDb() {
  return db;
}

export function setAuthenticated(value: boolean) {
  db.authenticated = value;
}

function emptyDashboard(): Dashboard {
  const today = new Date().toISOString().slice(0, 10);
  return {
    today: { date: today, orderCount: 0, orders: [], pickups: [], deliveries: [] },
    needsAttention: {
      overdueTasks: [],
      tasksDueToday: [],
      followUpClients: [],
      ordersMissingInformation: [],
    },
    upcoming: { orders: [], tasks: [] },
    payments: { outstandingOrderCount: 0, outstandingTotal: 0, outstandingOrders: [] },
  };
}

export function paginate<T>(items: T[], page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    meta: {
      page,
      pageSize,
      total: items.length,
      totalPages: items.length === 0 ? 0 : Math.ceil(items.length / pageSize),
    },
  };
}

export function buildDashboard(): Dashboard {
  const dashboard = emptyDashboard();
  const today = dashboard.today.date;
  dashboard.today.orders = db.orders.filter((order) => order.eventDate === today && order.status !== 'CANCELLED');
  dashboard.today.orderCount = dashboard.today.orders.length;
  dashboard.today.pickups = dashboard.today.orders.filter((order) => order.fulfillmentType === 'PICKUP');
  dashboard.today.deliveries = dashboard.today.orders.filter((order) => order.fulfillmentType === 'DELIVERY');
  dashboard.needsAttention.followUpClients = db.clients.filter((client) => client.needsFollowUp);
  dashboard.needsAttention.overdueTasks = db.tasks.filter(
    (task) => !task.completed && task.dueAt && new Date(task.dueAt) < new Date(new Date().setHours(0, 0, 0, 0)),
  );
  dashboard.needsAttention.tasksDueToday = db.tasks.filter((task) => {
    if (!task.dueAt || task.completed) return false;
    return task.dueAt.slice(0, 10) === today;
  });
  dashboard.upcoming.orders = db.orders.filter(
    (order) => order.eventDate && order.eventDate > today && order.status !== 'CANCELLED' && order.status !== 'COMPLETED',
  );
  dashboard.upcoming.tasks = db.tasks.filter((task) => !task.completed && task.dueAt && task.dueAt.slice(0, 10) > today);
  dashboard.payments.outstandingOrders = db.orders.filter((order) => order.remainingBalance > 0 && order.status !== 'CANCELLED');
  dashboard.payments.outstandingOrderCount = dashboard.payments.outstandingOrders.length;
  dashboard.payments.outstandingTotal = dashboard.payments.outstandingOrders.reduce(
    (total, order) => total + order.remainingBalance,
    0,
  );
  dashboard.needsAttention.ordersMissingInformation = db.orders
    .filter((order) => order.status !== 'COMPLETED' && order.status !== 'CANCELLED')
    .flatMap((order) => {
      const issues: string[] = [];
      if (!order.eventDate) issues.push('Missing event date');
      if (!order.eventTime) issues.push('Missing event time');
      if (order.fulfillmentType === 'DELIVERY' && !order.deliveryAddress) issues.push('Missing delivery address');
      if (issues.length === 0) return [];
      return [
        {
          id: order.id,
          clientName: order.client?.name ?? 'Cliente',
          status: order.status,
          eventDate: order.eventDate,
          issues,
        },
      ];
    });
  return dashboard;
}

export function calendarEvents(from: string, to: string): CalendarEvent[] {
  return db.orders
    .filter((order) => order.eventDate && order.eventDate >= from && order.eventDate <= to && order.status !== 'CANCELLED')
    .map((order) => ({
      id: order.id,
      clientId: order.clientId,
      clientName: order.client?.name ?? 'Cliente',
      status: order.status,
      eventDate: order.eventDate as string,
      eventTime: order.eventTime,
      fulfillmentType: order.fulfillmentType,
      description: order.description,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      remainingBalance: order.remainingBalance,
      paymentStatus: order.paymentStatus,
    }));
}

export function addClient(input: Partial<Client> & { name: string }): ClientDetail {
  const client: ClientDetail = {
    id: `client-${db.clients.length + 1}`,
    name: input.name,
    phone: input.phone ?? null,
    instagramUsername: input.instagramUsername ?? null,
    email: input.email ?? null,
    notes: input.notes ?? null,
    needsFollowUp: input.needsFollowUp ?? false,
    archivedAt: null,
    createdAt: isoNow(),
    updatedAt: isoNow(),
    interactionCount: 0,
    orderCount: 0,
    openTaskCount: 0,
  };
  db.clients.push(client);
  return client;
}

export function addInteraction(
  clientId: string,
  input: { channel: Interaction['channel']; content: string; occurredAt?: string; orderId?: string | null },
): Interaction {
  const interaction: Interaction = {
    id: `interaction-${db.interactions.length + 1}`,
    clientId,
    orderId: input.orderId ?? null,
    userId: 'user-1',
    channel: input.channel,
    content: input.content,
    occurredAt: input.occurredAt ?? isoNow(),
    createdAt: isoNow(),
    updatedAt: isoNow(),
    attachments: [],
  };
  db.interactions.unshift(interaction);
  const client = db.clients.find((item) => item.id === clientId);
  if (client) client.interactionCount += 1;
  return interaction;
}

export function addAttachment(interactionId: string, file: { name: string; type: string; size: number }): Attachment {
  const attachment: Attachment = {
    id: `attachment-${Math.random().toString(16).slice(2)}`,
    interactionId,
    paymentId: null,
    originalFilename: file.name,
    mimeType: file.type,
    fileSize: file.size,
    createdAt: isoNow(),
    updatedAt: isoNow(),
  };
  const interaction = db.interactions.find((item) => item.id === interactionId);
  if (interaction) {
    interaction.attachments.push(attachment);
  }
  return attachment;
}

export function addPaymentAttachment(paymentId: string, file: { name: string; type: string; size: number }): Attachment {
  const attachment: Attachment = {
    id: `attachment-${Math.random().toString(16).slice(2)}`,
    interactionId: null,
    paymentId,
    originalFilename: file.name,
    mimeType: file.type,
    fileSize: file.size,
    createdAt: isoNow(),
    updatedAt: isoNow(),
  };
  for (const order of db.orders) {
    const payment = order.payments.find((item) => item.id === paymentId);
    if (payment) {
      payment.attachments.push(attachment);
      break;
    }
  }
  return attachment;
}

export function findAttachment(attachmentId: string): Attachment | undefined {
  const interactionAttachment = db.interactions
    .flatMap((item) => item.attachments)
    .find((item) => item.id === attachmentId);
  if (interactionAttachment) return interactionAttachment;
  return db.orders
    .flatMap((order) => order.payments.flatMap((payment) => payment.attachments))
    .find((item) => item.id === attachmentId);
}

export function addOrder(
  clientId: string,
  input: Omit<Partial<Order>, 'items'> & {
    items?: Array<Partial<OrderItem> & Pick<OrderItem, 'description' | 'quantity' | 'unitPrice' | 'lineTotal'>>;
  },
): Order {
  const client = db.clients.find((item) => item.id === clientId) ?? null;
  const items: OrderItem[] = (input.items ?? []).map((item, index) => ({
    id: item.id ?? `item-${index + 1}`,
    orderId: item.orderId ?? 'pending',
    recipeId: item.recipeId ?? null,
    recipe: item.recipe ?? null,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
    notes: item.notes ?? null,
    createdAt: item.createdAt ?? isoNow(),
    updatedAt: item.updatedAt ?? isoNow(),
  }));
  const itemsTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalAmount = input.totalAmount ?? itemsTotal;
  const order: Order = {
    id: `order-${db.orders.length + 1}`,
    clientId,
    client,
    status: input.status ?? 'LEAD',
    eventDate: input.eventDate ?? null,
    eventTime: input.eventTime ?? null,
    description: input.description ?? null,
    fulfillmentType: input.fulfillmentType ?? 'PICKUP',
    deliveryAddress: input.deliveryAddress ?? null,
    deliveryTime: input.deliveryTime ?? null,
    notes: input.notes ?? null,
    items,
    payments: [],
    totalAmount,
    paidAmount: 0,
    remainingBalance: totalAmount,
    paymentStatus: 'UNPAID',
    createdAt: isoNow(),
    updatedAt: isoNow(),
  };
  db.orders.push(order);
  if (client) client.orderCount += 1;
  return order;
}

export function refreshOrderFinance(order: Order) {
  order.paidAmount = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
  order.remainingBalance = Number((order.totalAmount - order.paidAmount).toFixed(2));
  if (order.paidAmount <= 0) order.paymentStatus = 'UNPAID';
  else if (order.paidAmount >= order.totalAmount) order.paymentStatus = 'PAID';
  else order.paymentStatus = 'PARTIALLY_PAID';
}

export function addPayment(
  orderId: string,
  input: {
    amount: number;
    type: Order['payments'][number]['type'];
    paymentMethod: Order['payments'][number]['paymentMethod'];
    paidAt?: string;
    notes?: string | null;
    hasPaymentReceipt?: boolean;
  },
) {
  const order = db.orders.find((item) => item.id === orderId);
  if (!order) return null;
  order.payments.push({
    id: `payment-${order.payments.length + 1}`,
    orderId,
    type: input.type,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    paidAt: input.paidAt ?? isoNow(),
    notes: input.notes ?? null,
    hasPaymentReceipt: input.hasPaymentReceipt ?? false,
    attachments: [],
    createdAt: isoNow(),
    updatedAt: isoNow(),
  });
  refreshOrderFinance(order);
  if (input.type === 'DEPOSIT' && ['LEAD', 'QUOTED', 'AWAITING_DEPOSIT'].includes(order.status)) {
    order.status = 'CONFIRMED';
  }
  return order;
}

export function addTask(input: Partial<Task> & { title: string }): Task {
  const task: Task = {
    id: `task-${db.tasks.length + 1}`,
    clientId: input.clientId ?? null,
    orderId: input.orderId ?? null,
    clientName: db.clients.find((client) => client.id === input.clientId)?.name ?? null,
    orderStatus: null,
    title: input.title,
    description: input.description ?? null,
    dueAt: input.dueAt ?? null,
    priority: input.priority ?? 'MEDIUM',
    completed: false,
    completedAt: null,
    createdBy: 'user-1',
    createdAt: isoNow(),
    updatedAt: isoNow(),
  };
  db.tasks.push(task);
  return task;
}

export function addIngredient(input: Partial<Ingredient> & { name: string }): Ingredient {
  const ingredient: Ingredient = {
    id: `ingredient-${db.ingredients.length + 1}`,
    name: input.name,
    unit: input.unit ?? 'kg',
    pricePerUnit: input.pricePerUnit ?? 0,
    notes: input.notes ?? null,
    createdAt: isoNow(),
    updatedAt: isoNow(),
  };
  db.ingredients.push(ingredient);
  return ingredient;
}

function recipePrice(recipe: Pick<Recipe, 'ingredients'>): number {
  return recipe.ingredients.reduce((sum, line) => sum + line.lineCost, 0);
}

export function addRecipe(
  input: Partial<Recipe> & { name: string; ingredients?: Recipe['ingredients'] },
): Recipe {
  const ingredients = input.ingredients ?? [];
  const recipe: Recipe = {
    id: `recipe-${db.recipes.length + 1}`,
    name: input.name,
    description: input.description ?? null,
    notes: input.notes ?? null,
    ingredients,
    price: input.price ?? recipePrice({ ingredients }),
    createdAt: isoNow(),
    updatedAt: isoNow(),
  };
  recipe.ingredients = recipe.ingredients.map((line) => ({ ...line, recipeId: recipe.id }));
  db.recipes.push(recipe);
  return recipe;
}

export function buildRecipeIngredients(
  recipeId: string,
  lines: Array<{ ingredientId: string; quantity: number; notes?: string }>,
): Recipe['ingredients'] {
  return lines.map((line, index) => {
    const ingredient = db.ingredients.find((item) => item.id === line.ingredientId) ?? null;
    const quantity = line.quantity;
    const lineCost = ingredient ? quantity * ingredient.pricePerUnit : 0;
    return {
      id: `recipe-line-${recipeId}-${index + 1}`,
      recipeId,
      ingredientId: line.ingredientId,
      ingredient,
      quantity,
      lineCost,
      notes: line.notes ?? null,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };
  });
}
