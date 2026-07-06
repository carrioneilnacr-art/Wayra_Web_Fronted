import { test, expect } from '@playwright/test';
import { loginAs } from './helpers.js';

test.describe('Flujo de Recepción - Creación de Reserva', () => {
  test('Debería permitir a la recepcionista crear un ticket de reserva', async ({ page }) => {
    // 1. Iniciar sesión como recepcionista
    await loginAs(page, 'N00SHARLYN', '123');
    
    // Verificar que estamos en la vista de recepción
    await expect(page).toHaveURL(/.*localhost:5173\/recepcion/);
    await expect(page.getByRole('heading', { name: /Wayra Reception/i })).toBeVisible();

    // 2. Seleccionar la primera mesa disponible del mapa (ej. Mesa 1)
    // El mapa tiene un span con el número de la mesa. Buscamos el botón que contenga el texto '1'.
    const botonMesa1 = page.locator('button').filter({ hasText: /^1$/ }).first();
    await botonMesa1.click();

    // 3. Confirmar la selección de la mesa (Abre el Modal)
    await page.getByRole('button', { name: /Confirmar Mesa/i }).click();

    // 4. Esperar a que el Modal cargue
    await expect(page.getByRole('heading', { name: /Wayra Ticket/i })).toBeVisible();

    // 5. Llenar el formulario del ticket
    await page.getByPlaceholder('DNI', { exact: true }).fill('70000000');
    await page.getByPlaceholder('CELULAR').fill('987654321');
    await page.getByPlaceholder('NOMBRE COMPLETO').fill('BOT RECEPCION QA');
    
    // Seleccionar el turno T1 (que asume un texto de '03:47' o al menos el botón)
    // Buscamos cualquier botón disponible de turno (que no esté disabled)
    // Como los botones de turno tienen font-mono y la hora, buscamos el primer botón que no esté deshabilitado.
    const turnosDisponibles = page.locator('button').filter({ hasText: 'DISPONIBLE' });
    const cuentaTurnos = await turnosDisponibles.count();
    
    // Si hay turnos disponibles, hacemos clic en el primero
    if (cuentaTurnos > 0) {
      await turnosDisponibles.first().click();
    }

    // Llenar observaciones
    await page.getByPlaceholder('NOTAS (EJ: CUMPLEAÑOS, ALERGIAS...)').fill('Test automatizado E2E');

    // 6. Confirmar y finalizar
    await page.getByRole('button', { name: /CONFIRMAR Y FINALIZAR/i }).click();

    // 7. Verificar que el ticket se generó y se cerró el modal
    await expect(page.getByRole('heading', { name: /Wayra Ticket/i })).toBeHidden();
  });
});
