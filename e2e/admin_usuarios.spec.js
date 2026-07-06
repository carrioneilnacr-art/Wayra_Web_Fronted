import { test, expect } from '@playwright/test';
import { loginAs } from './helpers.js';

test.describe('Flujo de Administrador - Gestión de Personal', () => {
  test('Debería permitir al administrador crear un nuevo empleado (Mozo)', async ({ page }) => {
    // 1. Iniciar sesión como Admin
    await loginAs(page, 'N00NEIL', '213');
    
    // Verificar que estamos en la vista admin
    await expect(page).toHaveURL(/.*localhost:5173\/admin/);
    await expect(page.getByText('WAYRA NIKKEI')).toBeVisible();

    // 2. Navegar a la sección "Usuarios"
    await page.getByRole('button', { name: 'Usuarios' }).click();

    // Esperar a que cargue la vista
    await expect(page.getByRole('heading', { name: 'Control de Personal' })).toBeVisible();

    // 3. Abrir modal de Registro
    await page.getByRole('button', { name: '+ Registrar Personal' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo Perfil' })).toBeVisible();

    // 4. Llenar el formulario
    const randomSuffix = Math.floor(Math.random() * 1000);
    const nombreEmpleado = `BOT QA MOZO ${randomSuffix}`;
    const userEmpleado = `QA${randomSuffix}`;
    
    await page.getByPlaceholder('NOMBRE COMPLETO').fill(nombreEmpleado);
    await page.getByPlaceholder('USUARIO DE ACCESO').fill(userEmpleado);
    await page.getByPlaceholder('CONTRASEÑA').fill('123456');
    
    // El rol por defecto es MOZO, podemos dejarlo así o forzarlo
    await page.locator('select').selectOption('mozo');

    // 5. Guardar
    await page.getByRole('button', { name: 'GUARDAR' }).click();

    // 6. Verificar que el modal desapareció
    await expect(page.getByRole('heading', { name: 'Nuevo Perfil' })).toBeHidden();

    // 7. Verificar que la tarjeta del nuevo empleado se renderice en el grid
    // Usaremos expect.poll o simplemente toBeVisible con un timeout, 
    // asumiendo que la lista se recarga sola o por la llamada de carga.
    await expect(page.getByText(nombreEmpleado)).toBeVisible();
  });
});
