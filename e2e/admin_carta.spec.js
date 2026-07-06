import { test, expect } from '@playwright/test';
import { loginAs } from './helpers.js';

test.describe('Flujo de Administrador - Gestión de Carta', () => {
  test('Debería permitir al administrador agregar un plato nuevo al menú', async ({ page }) => {
    // 1. Iniciar sesión como Admin
    await loginAs(page, 'N00NEIL', '213');
    
    // 2. Navegar a la sección "Gestión Carta"
    await page.getByRole('button', { name: 'Gestión Carta' }).click();

    // 3. Abrir modal de Registro
    await page.getByRole('button', { name: '+ Agregar Producto' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo Producto' })).toBeVisible();

    // 4. Llenar el formulario
    const randomSuffix = Math.floor(Math.random() * 1000);
    const nombrePlato = `PLATO QA AUTOMATIZADO ${randomSuffix}`;
    
    await page.getByPlaceholder('INGRESE NOMBRE').fill(nombrePlato);
    await page.getByPlaceholder('PRECIO').fill('45.50');
    await page.getByPlaceholder('TIEMPO').fill('15');
    
    // Seleccionar categoría FONDOS
    await page.locator('select').selectOption('Fondos');

    // 5. Guardar
    await page.getByRole('button', { name: 'GUARDAR' }).click();

    // 6. Verificar que el modal desapareció
    await expect(page.getByRole('heading', { name: 'Nuevo Producto' })).toBeHidden();

    // 7. Buscar el producto en la lista. Podemos usar el buscador
    await page.getByPlaceholder('BUSCAR ELEMENTO EN LA CARTA...').fill(nombrePlato);

    // 8. Verificar que el plato aparezca en el DOM
    await expect(page.getByText(nombrePlato)).toBeVisible();
  });
});
