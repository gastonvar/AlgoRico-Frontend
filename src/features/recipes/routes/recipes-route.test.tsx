import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { NewRecipePage } from '@/app/routes/new-recipe-page';
import { RecipeDetailPage } from '@/app/routes/recipe-detail-page';
import { RecipesRoute } from '@/features/recipes/routes/recipes-route';
import { addIngredient } from '@/testing/msw/db';
import { authenticateTestUser, renderApp } from '@/testing/test-utils';

describe('recipes', () => {
  beforeEach(() => {
    authenticateTestUser();
  });

  it('creates a recipe from ingredients and shows the computed price', async () => {
    addIngredient({ name: 'Harina', unit: 'kg', pricePerUnit: 100 });
    addIngredient({ name: 'Huevos', unit: 'un', pricePerUnit: 20 });
    const user = userEvent.setup();

    renderApp(
      <Routes>
        <Route path="/recipes" element={<RecipesRoute />} />
        <Route path="/recipes/new" element={<NewRecipePage />} />
        <Route path="/recipes/:recipeId" element={<RecipeDetailPage />} />
      </Routes>,
      { route: '/recipes/new' },
    );

    await user.type(await screen.findByLabelText('Nombre'), 'Torta simple');
    await user.selectOptions(screen.getByLabelText('Ingrediente'), 'Harina');
    await user.clear(screen.getByLabelText(/Cantidad/));
    await user.type(screen.getByLabelText(/Cantidad/), '0.5');
    await user.click(screen.getByRole('button', { name: 'Agregar ingrediente' }));
    await user.selectOptions(screen.getAllByLabelText('Ingrediente')[1] as HTMLElement, 'Huevos');
    await user.clear(screen.getAllByLabelText(/Cantidad/)[1] as HTMLElement);
    await user.type(screen.getAllByLabelText(/Cantidad/)[1] as HTMLElement, '4');
    await user.click(screen.getByRole('button', { name: 'Guardar receta' }));

    expect(await screen.findByRole('heading', { name: 'Torta simple' })).toBeInTheDocument();
    expect(screen.getByText('Harina')).toBeInTheDocument();
    expect(screen.getByText('Huevos')).toBeInTheDocument();
  });
});
