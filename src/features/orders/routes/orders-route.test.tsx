import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { EditOrderPage } from '@/app/routes/edit-order-page';
import { NewOrderPage } from '@/app/routes/new-order-page';
import { OrderDetailPage } from '@/app/routes/order-detail-page';
import { addClient, addIngredient, addOrder, addRecipe } from '@/testing/msw/db';
import { authenticateTestUser, renderApp } from '@/testing/test-utils';

function seedCakeRecipe() {
  addIngredient({ name: 'Harina', unit: 'kg', pricePerUnit: 2500 });
  return addRecipe({ name: 'Chocolate birthday cake', price: 2500 });
}

function seedCatalog() {
  addIngredient({ name: 'Harina', unit: 'kg', pricePerUnit: 2500 });
  const cake = addRecipe({ name: 'Torta de chocolate', price: 2500 });
  const cupcakes = addRecipe({ name: 'Cupcakes de vainilla', price: 500 });
  return { cake, cupcakes };
}

describe('orders and payments', () => {
  beforeEach(() => {
    authenticateTestUser();
  });

  it('creates an order, records payments and shows backend balances', async () => {
    const client = addClient({ name: 'María Pérez' });
    seedCakeRecipe();
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
    await user.type(screen.getByLabelText(/Fecha del evento/), dateValue);
    await user.type(screen.getByLabelText('Hora del evento'), '15:00');
    await user.type(screen.getByLabelText('Resumen'), 'Chocolate birthday cake');
    await user.click(screen.getByRole('button', { name: 'Agregar receta' }));
    await user.selectOptions(await screen.findByLabelText('Receta 1'), 'Chocolate birthday cake');

    await user.selectOptions(screen.getByLabelText('Tipo'), 'DELIVERY');
    await user.type(screen.getByLabelText('Dirección'), 'Calle 123');
    await user.click(screen.getByRole('button', { name: 'Guardar pedido' }));

    expect(await screen.findByRole('button', { name: 'Registrar pago' })).toBeInTheDocument();
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

  it('creates an order with several recipes and quantities', async () => {
    const client = addClient({ name: 'María Pérez' });
    seedCatalog();
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
    await user.type(screen.getByLabelText(/Fecha del evento/), dateValue);
    await user.click(screen.getByRole('button', { name: 'Agregar receta' }));
    await user.selectOptions(await screen.findByLabelText('Receta 1'), 'Torta de chocolate');
    await user.click(screen.getByRole('button', { name: 'Agregar receta' }));
    await user.selectOptions(screen.getByLabelText('Receta 2'), 'Cupcakes de vainilla');
    await user.click(screen.getByRole('button', { name: 'Guardar pedido' }));

    expect(await screen.findByText('2 recetas')).toBeInTheDocument();
    expect(screen.getByText('Torta de chocolate')).toBeInTheDocument();
    expect(screen.getByText('Cupcakes de vainilla')).toBeInTheDocument();
  });

  it('creates an order without recipes when the final price is set', async () => {
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
    await user.clear(screen.getByLabelText('Precio final'));
    await user.type(screen.getByLabelText('Precio final'), '18000');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'DELIVERY');
    await user.type(screen.getByLabelText('Dirección'), 'Calle 123');
    await user.click(screen.getByRole('button', { name: 'Guardar pedido' }));

    expect(await screen.findByRole('button', { name: 'Registrar pago' })).toBeInTheDocument();
    expect(screen.getByText('Sin fecha de evento')).toBeInTheDocument();
  });

  it('records a conversation on the order timeline', async () => {
    const client = addClient({ name: 'María Pérez' });
    const recipe = seedCakeRecipe();
    const order = addOrder(client.id, {
      description: 'Torta de chocolate',
      items: [
        {
          id: 'item-1',
          orderId: 'pending',
          recipeId: recipe.id,
          recipe: { id: recipe.id, name: recipe.name },
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
    const recipe = seedCakeRecipe();
    const order = addOrder(client.id, {
      description: 'Torta original',
      eventDate: '2026-09-20',
      eventTime: '15:00',
      items: [
        {
          id: 'item-1',
          orderId: 'pending',
          recipeId: recipe.id,
          recipe: { id: recipe.id, name: recipe.name },
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
