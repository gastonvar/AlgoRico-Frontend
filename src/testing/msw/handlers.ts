import { http, HttpResponse } from 'msw';
import {
  addAttachment,
  addClient,
  addInteraction,
  addOrder,
  addPayment,
  addPaymentAttachment,
  addTask,
  buildDashboard,
  calendarEvents,
  findAttachment,
  getDb,
  paginate,
  refreshOrderFinance,
  setAuthenticated,
} from '@/testing/msw/db';
import type { Interaction } from '@/types/domain';

const API = 'http://localhost:3000';

function json<T>(data: T, status = 200) {
  return HttpResponse.json({ data }, { status });
}

export const handlers = [
  http.post(`${API}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email !== 'owner@algorico.local' || body.password !== 'AlgoRicoDev1!') {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } },
        { status: 401 },
      );
    }
    const user = getDb().user;
    setAuthenticated(true);
    return json({ user, csrfToken: 'test-csrf' });
  }),
  http.get(`${API}/api/auth/me`, () => {
    const db = getDb();
    if (!db.authenticated) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }
    return json({ user: db.user, csrfToken: 'test-csrf' });
  }),
  http.post(`${API}/api/auth/logout`, () => {
    setAuthenticated(false);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/api/clients`, ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const includeArchived = url.searchParams.get('includeArchived') === 'true';
    const filtered = getDb().clients.filter((client) => {
      if (!includeArchived && client.archivedAt) return false;
      if (!q) return true;
      return (
        client.name.toLowerCase().includes(q) ||
        (client.phone ?? '').toLowerCase().includes(q) ||
        (client.instagramUsername ?? '').toLowerCase().includes(q)
      );
    });
    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),
  http.post(`${API}/api/clients`, async ({ request }) => {
    const body = (await request.json()) as { name: string; phone?: string; instagramUsername?: string; email?: string; notes?: string };
    return json(addClient(body), 201);
  }),
  http.get(`${API}/api/clients/:clientId`, ({ params }) => {
    const client = getDb().clients.find((item) => item.id === params.clientId);
    if (!client) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Client not found' } }, { status: 404 });
    }
    return json(client);
  }),
  http.patch(`${API}/api/clients/:clientId`, async ({ params, request }) => {
    const client = getDb().clients.find((item) => item.id === params.clientId);
    if (!client) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Client not found' } }, { status: 404 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    if (body.archived === true) {
      client.archivedAt = new Date().toISOString();
    } else if (body.archived === false) {
      client.archivedAt = null;
    }
    delete body.archived;
    Object.assign(client, body);
    return json(client);
  }),

  http.get(`${API}/api/clients/:clientId/interactions`, ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const items = getDb().interactions.filter((item) => item.clientId === params.clientId);
    return HttpResponse.json(paginate(items, page, 20));
  }),
  http.post(`${API}/api/clients/:clientId/interactions`, async ({ params, request }) => {
    const body = (await request.json()) as { channel: 'INSTAGRAM'; content: string; occurredAt?: string };
    return json(addInteraction(String(params.clientId), body), 201);
  }),
  http.patch(`${API}/api/interactions/:interactionId`, async ({ params, request }) => {
    const interaction = getDb().interactions.find((item) => item.id === params.interactionId);
    if (!interaction) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Interaction not found' } }, { status: 404 });
    }
    Object.assign(interaction, await request.json());
    return json(interaction);
  }),
  http.delete(`${API}/api/interactions/:interactionId`, ({ params }) => {
    const db = getDb();
    const interaction = db.interactions.find((item) => item.id === params.interactionId);
    if (!interaction) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Interaction not found' } }, { status: 404 });
    }
    db.interactions = db.interactions.filter((item) => item.id !== params.interactionId);
    const client = db.clients.find((item) => item.id === interaction.clientId);
    if (client) client.interactionCount = Math.max(0, client.interactionCount - 1);
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${API}/api/interactions/:interactionId/attachments`, async ({ params, request }) => {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const created = files.map((file) =>
      addAttachment(String(params.interactionId), { name: file.name, type: file.type, size: file.size }),
    );
    return json(created, 201);
  }),
  http.get(`${API}/api/attachments/:attachmentId`, ({ params }) => {
    const attachment = findAttachment(String(params.attachmentId));
    if (!attachment) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Attachment not found' } }, { status: 404 });
    }
    return json({
      ...attachment,
      downloadUrl: `https://files.test/${attachment.id}`,
      expiresInSeconds: 300,
    });
  }),

  http.get(`${API}/api/orders`, ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const clientId = url.searchParams.get('clientId');
    const filtered = getDb().orders.filter((order) => {
      if (clientId && order.clientId !== clientId) return false;
      if (q && !order.client?.name.toLowerCase().includes(q)) return false;
      return true;
    });
    return HttpResponse.json(paginate(filtered, Number(url.searchParams.get('page') ?? '1'), 20));
  }),
  http.post(`${API}/api/clients/:clientId/orders`, async ({ params, request }) => {
    const body = (await request.json()) as {
      eventDate?: string;
      eventTime?: string;
      description?: string;
      fulfillmentType?: 'DELIVERY' | 'PICKUP';
      deliveryAddress?: string;
      deliveryTime?: string;
      items?: Array<{ description: string; quantity: number; unitPrice: number; notes?: string }>;
      totalAmount?: number;
    };
    const items = (body.items ?? []).map((item, index) => ({
      id: `item-${index + 1}`,
      orderId: 'pending',
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.quantity * item.unitPrice,
      notes: item.notes ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const order = addOrder(String(params.clientId), {
      ...body,
      items: items.map((item) => ({ ...item, orderId: 'pending' })),
      totalAmount: body.totalAmount,
    });
    order.items = order.items.map((item) => ({ ...item, orderId: order.id }));
    return json(order, 201);
  }),
  http.get(`${API}/api/orders/:orderId`, ({ params }) => {
    const order = getDb().orders.find((item) => item.id === params.orderId);
    if (!order) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }
    return json(order);
  }),
  http.get(`${API}/api/orders/:orderId/interactions`, ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const order = getDb().orders.find((item) => item.id === params.orderId);
    if (!order) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }
    const items = getDb().interactions.filter((item) => item.orderId === params.orderId);
    return HttpResponse.json(paginate(items, page, 20));
  }),
  http.post(`${API}/api/orders/:orderId/interactions`, async ({ params, request }) => {
    const order = getDb().orders.find((item) => item.id === params.orderId);
    if (!order) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }
    const body = (await request.json()) as { channel: Interaction['channel']; content: string; occurredAt?: string };
    return json(addInteraction(order.clientId, { ...body, orderId: order.id }), 201);
  }),
  http.patch(`${API}/api/orders/:orderId`, async ({ params, request }) => {
    const order = getDb().orders.find((item) => item.id === params.orderId);
    if (!order) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }
    const body = (await request.json()) as Partial<typeof order> & {
      items?: Array<{ id?: string; description: string; quantity: number; unitPrice: number; notes?: string }>;
    };
    const { items, ...fields } = body;
    Object.assign(order, fields);
    if (items) {
      order.items = items.map((item, index) => ({
        id: item.id ?? `item-${order.id}-${index + 1}`,
        orderId: order.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice,
        notes: item.notes ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
    refreshOrderFinance(order);
    return json(order);
  }),
  http.delete(`${API}/api/orders/:orderId`, ({ params }) => {
    const db = getDb();
    const order = db.orders.find((item) => item.id === params.orderId);
    if (!order) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }
    db.orders = db.orders.filter((item) => item.id !== params.orderId);
    db.interactions = db.interactions.map((item) =>
      item.orderId === params.orderId ? { ...item, orderId: null } : item,
    );
    db.tasks = db.tasks.map((item) => (item.orderId === params.orderId ? { ...item, orderId: null } : item));
    const client = db.clients.find((item) => item.id === order.clientId);
    if (client) client.orderCount = Math.max(0, client.orderCount - 1);
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(`${API}/api/orders/:orderId/payments`, ({ params }) => {
    const order = getDb().orders.find((item) => item.id === params.orderId);
    return json(order?.payments ?? []);
  }),
  http.post(`${API}/api/orders/:orderId/payments`, async ({ params, request }) => {
    const body = (await request.json()) as {
      amount: number;
      type: 'DEPOSIT' | 'FINAL' | 'OTHER';
      paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
      notes?: string;
      paidAt?: string;
      hasPaymentReceipt?: boolean;
    };
    const order = addPayment(String(params.orderId), body);
    return json(order, 201);
  }),
  http.post(`${API}/api/payments/:paymentId/attachments`, async ({ params, request }) => {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const created = files.map((file) =>
      addPaymentAttachment(String(params.paymentId), { name: file.name, type: file.type, size: file.size }),
    );
    return json(created, 201);
  }),
  http.patch(`${API}/api/payments/:paymentId`, async ({ params, request }) => {
    const order = getDb().orders.find((item) => item.payments.some((payment) => payment.id === params.paymentId));
    const payment = order?.payments.find((item) => item.id === params.paymentId);
    if (!order || !payment) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Payment not found' } }, { status: 404 });
    }
    Object.assign(payment, await request.json());
    refreshOrderFinance(order);
    return json(order);
  }),
  http.delete(`${API}/api/payments/:paymentId`, ({ params }) => {
    const order = getDb().orders.find((item) => item.payments.some((payment) => payment.id === params.paymentId));
    if (!order) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Payment not found' } }, { status: 404 });
    }
    order.payments = order.payments.filter((payment) => payment.id !== params.paymentId);
    refreshOrderFinance(order);
    return json(order);
  }),

  http.get(`${API}/api/tasks`, ({ request }) => {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    const orderId = url.searchParams.get('orderId');
    const completed = url.searchParams.get('completed');
    const filtered = getDb().tasks.filter((task) => {
      if (clientId && task.clientId !== clientId) return false;
      if (orderId && task.orderId !== orderId) return false;
      if (completed === 'true' && !task.completed) return false;
      if (completed === 'false' && task.completed) return false;
      return true;
    });
    return HttpResponse.json(paginate(filtered));
  }),
  http.post(`${API}/api/tasks`, async ({ request }) => {
    const body = (await request.json()) as { title: string; clientId?: string; dueAt?: string; priority?: 'LOW' | 'MEDIUM' | 'HIGH' };
    return json(addTask(body), 201);
  }),
  http.patch(`${API}/api/tasks/:taskId`, async ({ params, request }) => {
    const task = getDb().tasks.find((item) => item.id === params.taskId);
    if (!task) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 });
    }
    Object.assign(task, await request.json());
    if (task.completed) task.completedAt = new Date().toISOString();
    return json(task);
  }),
  http.delete(`${API}/api/tasks/:taskId`, ({ params }) => {
    const db = getDb();
    db.tasks = db.tasks.filter((task) => task.id !== params.taskId);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/api/dashboard`, () => json(buildDashboard())),
  http.get(`${API}/api/calendar`, ({ request }) => {
    const url = new URL(request.url);
    return json(calendarEvents(url.searchParams.get('from') ?? '', url.searchParams.get('to') ?? ''));
  }),
];
