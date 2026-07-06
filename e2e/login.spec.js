import { test, expect } from '@playwright/test';

test.describe('Validaciones Generales y Seguridad', () => {
  test('Debería mostrar error visual con credenciales incorrectas', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Wayra' })).toBeVisible();

    await page.getByPlaceholder('USUARIO').fill('test_invalido');
    await page.getByPlaceholder('CONTRASEÑA').fill('clave123');
    await page.getByRole('button', { name: 'Iniciar Experiencia' }).click();

    const errorMsg = page.locator('.bg-red-50 p');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Usuario o clave incorrecta');
  });

  test('Debería redirigir al login si se intenta entrar a admin sin token (Seguridad)', async ({ page }) => {
    await page.goto('/admin');
    // React Router debe redirigir al login
    await expect(page.getByRole('heading', { name: 'Wayra' })).toBeVisible();
    await expect(page).toHaveURL('http://localhost:5173/');
  });
});
