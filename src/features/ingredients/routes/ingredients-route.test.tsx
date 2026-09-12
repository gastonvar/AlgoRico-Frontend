import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { IngredientsRoute } from '@/features/ingredients/routes/ingredients-route';
import { addIngredient } from '@/testing/msw/db';
import { authenticateTestUser, renderApp } from '@/testing/test-utils';

function IngredientsApp() {
  return (
    <Routes>
      <Route path="/ingredients" element={<IngredientsRoute />} />
    </Routes>
  );
}

describe('ingredients', () => {
  beforeEach(() => {
    authenticateTestUser();
  });

  it('creates an ingredient and shows price per unit', async () => {
    const user = userEvent.setup();
    renderApp(<IngredientsApp />, { route: '/ingredients' });

    await user.click(await screen.findByRole('button', { name: 'Nuevo ingrediente' }));
    await user.type(screen.getByLabelText('Nombre'), 'Harina 000');
    await user.selectOptions(screen.getByLabelText('Unidad'), 'kg');
    await user.clear(screen.getByLabelText('Precio por unidad'));
    await user.type(screen.getByLabelText('Precio por unidad'), '100');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Harina 000')).toBeInTheDocument();
    expect(screen.getByText(/\/ kg/)).toBeInTheDocument();
    expect(screen.queryByText(/envase/i)).not.toBeInTheDocument();
  });

  it('searches ingredients by name', async () => {
    const user = userEvent.setup();
    addIngredient({ name: 'Harina 000', unit: 'kg', pricePerUnit: 100 });
    addIngredient({ name: 'Azúcar', unit: 'kg', pricePerUnit: 180 });

    renderApp(<IngredientsApp />, { route: '/ingredients' });
    await user.type(await screen.findByPlaceholderText('Buscar ingredientes...'), 'Harina');
    expect(await screen.findByText('Harina 000')).toBeInTheDocument();
  });
});
