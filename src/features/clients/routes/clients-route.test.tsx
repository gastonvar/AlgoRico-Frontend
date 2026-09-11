import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { ClientDetailPage } from '@/app/routes/client-detail-page';
import { ClientsRoute } from '@/features/clients/routes/clients-route';
import { authenticateTestUser, renderApp } from '@/testing/test-utils';

function ClientsApp() {
  return (
    <Routes>
      <Route path="/clients" element={<ClientsRoute />} />
      <Route path="/clients/:clientId" element={<ClientDetailPage />} />
    </Routes>
  );
}

describe('clients', () => {
  beforeEach(() => {
    authenticateTestUser();
  });

  it('creates a client and opens the detail page', async () => {
    const user = userEvent.setup();
    renderApp(<ClientsApp />, { route: '/clients' });

    await user.click(await screen.findByRole('button', { name: 'Nuevo cliente' }));
    await user.type(screen.getByLabelText('Nombre'), 'María Pérez');
    await user.type(screen.getByLabelText('Teléfono'), '099123456');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByRole('heading', { name: 'María Pérez' })).toBeInTheDocument();
  });

  it('searches clients by name', async () => {
    const user = userEvent.setup();
    const { addClient } = await import('@/testing/msw/db');
    addClient({ name: 'María Pérez' });
    addClient({ name: 'Juan Gómez' });

    renderApp(<ClientsApp />, { route: '/clients' });
    await user.type(await screen.findByPlaceholderText('Buscar clientes...'), 'María');
    expect(await screen.findByText('María Pérez')).toBeInTheDocument();
    await screen.findByText('María Pérez');
  });

  it('archives a client from the detail page', async () => {
    const user = userEvent.setup();
    const { addClient } = await import('@/testing/msw/db');
    addClient({ name: 'María Pérez' });

    renderApp(<ClientsApp />, { route: '/clients' });
    await user.click(await screen.findByText('María Pérez'));
    await user.click(await screen.findByRole('button', { name: 'Archivar' }));
    await user.click(screen.getByRole('button', { name: 'Sí, archivar' }));
    expect(await screen.findByText('Todavía no hay clientes.')).toBeInTheDocument();
  });
});
