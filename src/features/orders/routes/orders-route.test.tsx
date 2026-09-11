import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { NewOrderPage } from '@/app/routes/new-order-page';
import { OrderDetailPage } from '@/app/routes/order-detail-page';
import { EditOrderPage } from '@/features/orders/routes/edit-order-page';
import { addClient, addOrder } from '@/testing/msw/db';
import { authenticateTestUser, renderApp } from '@/testing/test-utils';

describe('orders and payments', () => {
  beforeEach(() => {
    authenticateTestUser();
  });

  it('creates an order, records payments and shows backend balances', async () => {
    const client = addClient({ name: 'María Pérez' });
    const user = userEvent.setup();

    renderApp(
      <Routes>
        <Route path="/orders/new" element={<NewOrderPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      </Routes>,
      { route: `/orders/new?clientId=${client.id}` },
    );

    await user.click(await screen.findByRole('button', { name: 'María Pérez' }));
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 2);
    const dateValue = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
    await user.type(screen.getByLabelText('Fecha del evento'), dateValue);
    await user.type(screen.getByLabelText('Hora'), '15:00');
    await user.type(screen.getByLabelText('Resumen'), 'Chocolate birthday cake');
    await user.type(screen.getByLabelText('Producto'), 'Chocolate birthday cake');
    await user.clear(screen.getByLabelText('Precio unitario'));
    await user.type(screen.getByLabelText('Precio unitario'), '2500');

    await user.selectOptions(screen.getByLabelText('Tipo'), 'DELIVERY');
    await user.type(screen.getByLabelText('Dirección'), 'Calle 123');
    await user.click(screen.getByRole('button', { name: 'Guardar pedido' }));

    expect((await screen.findAllByText('Chocolate birthday cake')).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Registrar pago' }));
    await user.clear(screen.getByLabelText('Monto'));
    await user.type(screen.getByLabelText('Monto'), '1000');
    await user.click(screen.getByRole('checkbox', { name: 'Comprobante de pago' }));
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect((await screen.findAllByText('Pago parcial')).length).toBeGreaterThan(0);
    expect(await screen.findByText('Con comprobante')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Registrar pago' }));
    await user.clear(screen.getByLabelText('Monto'));
    await user.type(screen.getByLabelText('Monto'), '1500');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'FINAL');
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect((await screen.findAllByText('Pagado')).length).toBeGreaterThan(0);
    expect(screen.getByText('Sin comprobante')).toBeInTheDocument();
  });

  it('records a conversation on the order timeline', async () => {
    const client = addClient({ name: 'María Pérez' });
    const order = addOrder(client.id, {
      description: 'Torta de chocolate',
      items: [
        {
          id: 'item-1',
          orderId: 'pending',
          description: 'Torta de chocolate',
          quantity: 1,
          unitPrice: 2500,
          lineTotal: 2500,
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
    const user = userEvent.setup();

    renderApp(
      <Routes>
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      </Routes>,
      { route: `/orders/${order.id}` },
    );

    await user.click(await screen.findByRole('button', { name: 'Nueva conversación' }));
    await user.selectOptions(await screen.findByLabelText('Canal'), 'WHATSAPP');
    await user.type(screen.getByLabelText('Qué hablaron'), 'Confirmó el retiro a las 15.');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Confirmó el retiro a las 15.')).toBeInTheDocument();
    expect(screen.getAllByText('WhatsApp').length).toBeGreaterThan(0);
  });

  it('edits products and deletes an order', async () => {
    const client = addClient({ name: 'María Pérez' });
    const order = addOrder(client.id, {
      description: 'Torta original',
      eventDate: '2026-09-20',
      eventTime: '15:00',
      items: [
        {
          id: 'item-1',
          orderId: 'pending',
          description: 'Torta original',
          quantity: 1,
          unitPrice: 2500,
          lineTotal: 2500,
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
    const user = userEvent.setup();

    renderApp(
      <Routes>
        <Route path="/orders" element={<p>Lista de pedidos</p>} />
        <Route path="/orders/:orderId/edit" element={<EditOrderPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      </Routes>,
      { route: `/orders/${order.id}` },
    );

    await user.click(await screen.findByRole('link', { name: 'Editar' }));
    const summary = await screen.findByLabelText('Resumen');
    await user.clear(summary);
    await user.type(summary, 'Torta actualizada');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByRole('heading', { name: 'Torta actualizada' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Eliminar pedido' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(await screen.findByText('Lista de pedidos')).toBeInTheDocument();
  });

  it('edits and deletes a payment', async () => {
    const client = addClient({ name: 'María Pérez' });
    const order = addOrder(client.id, {
      description: 'Torta de chocolate',
      totalAmount: 2500,
      items: [
        {
          id: 'item-1',
          orderId: 'pending',
          description: 'Torta de chocolate',
          quantity: 1,
          unitPrice: 2500,
          lineTotal: 2500,
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
    const user = userEvent.setup();

    renderApp(
      <Routes>
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      </Routes>,
      { route: `/orders/${order.id}` },
    );

    await user.click(await screen.findByRole('button', { name: 'Registrar pago' }));
    await user.clear(screen.getByLabelText('Monto'));
    await user.type(screen.getByLabelText('Monto'), '1000');
    await user.click(screen.getByRole('button', { name: 'Registrar' }));
    expect((await screen.findAllByText('Pago parcial')).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Editar pago' }));
    await user.clear(screen.getByLabelText('Monto'));
    await user.type(screen.getByLabelText('Monto'), '500');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(
      await screen.findByText((content) => content.replace(/\u00a0/g, ' ') === '$ 2.000'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Eliminar pago' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(await screen.findByText('Todavía no hay pagos registrados.')).toBeInTheDocument();
  });
});
