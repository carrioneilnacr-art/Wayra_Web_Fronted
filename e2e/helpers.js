import { expect } from '@playwright/test';

// Función ayudante para no repetir código de login
export async function loginAs(page, usuario, password) {
  await page.goto('/');
  // Esperar a que cargue el form
  await expect(page.getByRole('heading', { name: 'Wayra' })).toBeVisible();
  
  await page.getByPlaceholder('USUARIO').fill(usuario);
  await page.getByPlaceholder('CONTRASEÑA').fill(password);
  await page.getByRole('button', { name: 'Iniciar Experiencia' }).click();
}
