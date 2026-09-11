import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { ProtectedRoute } from '@/app/protected-route';
import { LoginRoute } from '@/features/auth/routes/login-route';
import { renderApp } from '@/testing/test-utils';

function AuthApp() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<div>Panel principal</div>} />
      </Route>
    </Routes>
  );
}

describe('authentication', () => {
  it('shows the brand wordmark on the login screen', async () => {
    renderApp(<AuthApp />, { route: '/login' });

    expect(await screen.findByRole('img', { name: 'Algo Rico' })).toHaveAttribute(
      'src',
      '/images/logoandalgorico.png',
    );
  });

  it('logs in with valid credentials', async () => {
    const user = userEvent.setup();
    renderApp(<AuthApp />, { route: '/login' });

    await user.type(await screen.findByLabelText('Correo'), 'owner@algorico.local');
    await user.type(screen.getByLabelText('Contraseña'), 'AlgoRicoDev1!');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('Panel principal')).toBeInTheDocument();
  });

  it('shows an error when credentials are invalid', async () => {
    const user = userEvent.setup();
    renderApp(<AuthApp />, { route: '/login' });

    await user.type(await screen.findByLabelText('Correo'), 'owner@algorico.local');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('El correo o la contraseña no son correctos.')).toBeInTheDocument();
  });

  it('redirects protected routes to login', async () => {
    renderApp(<AuthApp />, { route: '/dashboard' });
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('logs out and blocks protected routes', async () => {
    const user = userEvent.setup();
    renderApp(<AuthApp />, { route: '/login' });
    await user.type(await screen.findByLabelText('Correo'), 'owner@algorico.local');
    await user.type(screen.getByLabelText('Contraseña'), 'AlgoRicoDev1!');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Panel principal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    });
  });
});
