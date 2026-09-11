import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { ClientDetailPage } from '@/app/routes/client-detail-page';
import { addClient } from '@/testing/msw/db';
import { authenticateTestUser, renderApp } from '@/testing/test-utils';

describe('interactions', () => {
  beforeEach(() => {
    authenticateTestUser();
  });

  it('creates an Instagram interaction with screenshots', async () => {
    const client = addClient({ name: 'María Pérez' });
    const user = userEvent.setup();
    renderApp(
      <Routes>
        <Route path="/clients/:clientId" element={<ClientDetailPage />} />
      </Routes>,
      { route: `/clients/${client.id}` },
    );

    await user.click(await screen.findByRole('button', { name: 'Nueva conversación' }));
    await user.selectOptions(await screen.findByLabelText('Canal'), 'INSTAGRAM');
    await user.type(screen.getByLabelText('Qué hablaron'), 'Preguntó por una torta de cumpleaños.');

    const file = new File(['image-one'], 'shot-1.png', { type: 'image/png' });
    const fileTwo = new File(['image-two'], 'shot-2.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText('Capturas'), [file, fileTwo]);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Preguntó por una torta de cumpleaños.')).toBeInTheDocument();
    expect(screen.getAllByText('Instagram').length).toBeGreaterThan(0);
  });

  it('edits and deletes a conversation', async () => {
    const client = addClient({ name: 'María Pérez' });
    const user = userEvent.setup();
    renderApp(
      <Routes>
        <Route path="/clients/:clientId" element={<ClientDetailPage />} />
      </Routes>,
      { route: `/clients/${client.id}` },
    );

    await user.click(await screen.findByRole('button', { name: 'Nueva conversación' }));
    await user.type(screen.getByLabelText('Qué hablaron'), 'Confirmó la fecha.');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Confirmó la fecha.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Editar conversación' }));
    const content = screen.getByLabelText('Qué hablaron');
    await user.clear(content);
    await user.type(content, 'Cambió la fecha al sábado.');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Cambió la fecha al sábado.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Eliminar conversación' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(await screen.findByText('Todavía no hay conversaciones.')).toBeInTheDocument();
  });
});
