import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { DashboardRoute } from '@/features/dashboard/routes/dashboard-route';
import { CalendarRoute } from '@/features/calendar/routes/calendar-route';
import { TasksRoute } from '@/features/tasks/routes/tasks-route';
import { addClient, addOrder, addTask } from '@/testing/msw/db';
import { authenticateTestUser, renderApp } from '@/testing/test-utils';

describe('tasks, calendar and dashboard', () => {
  beforeEach(() => {
    authenticateTestUser();
  });

  it('creates a task and can complete it', async () => {
    const client = addClient({ name: 'María Pérez' });
    const user = userEvent.setup();
    renderApp(
      <Routes>
        <Route path="/tasks" element={<TasksRoute />} />
      </Routes>,
      { route: '/tasks' },
    );

    await user.click((await screen.findAllByRole('button', { name: 'Nueva tarea' }))[0]!);
    await user.type(screen.getByLabelText('Título'), 'Follow up about birthday cake');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Follow up about birthday cake')).toBeInTheDocument();

    addTask({ title: 'Overdue follow-up', clientId: client.id, dueAt: new Date(Date.now() - 86400000).toISOString(), priority: 'HIGH' });
  });

  it('shows calendar events and opens the order', async () => {
    const client = addClient({ name: 'María Pérez' });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().slice(0, 10);
    addOrder(client.id, {
      eventDate: date,
      eventTime: '15:00',
      description: 'Torta de cumpleaños',
      fulfillmentType: 'DELIVERY',
      items: [
        {
          id: 'item-1',
          orderId: 'pending',
          description: 'Torta',
          quantity: 1,
          unitPrice: 2500,
          lineTotal: 2500,
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    renderApp(
      <Routes>
        <Route path="/calendar" element={<CalendarRoute />} />
        <Route path="/orders/:orderId" element={<div>Detalle de pedido</div>} />
      </Routes>,
      { route: '/calendar' },
    );

    expect(await screen.findByText('María Pérez')).toBeInTheDocument();
  });

  it('renders actionable dashboard sections', async () => {
    const client = addClient({ name: 'María Pérez', needsFollowUp: true });
    addTask({
      title: 'Follow up about birthday cake',
      clientId: client.id,
      dueAt: new Date().toISOString(),
      priority: 'HIGH',
    });

    renderApp(
      <Routes>
        <Route path="/dashboard" element={<DashboardRoute />} />
      </Routes>,
      { route: '/dashboard' },
    );

    expect(await screen.findByText('Follow up about birthday cake')).toBeInTheDocument();
    expect(screen.getByText('Responder a María Pérez')).toBeInTheDocument();
  });
});
