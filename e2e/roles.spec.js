import { test, expect } from '@playwright/test';
import { loginAs } from './helpers.js';


const roles = [
  { nombre: 'Admin', user: 'N00NEIL', pass: '213', expectedPath: '/admin' },
  { nombre: 'Recepcionista', user: 'N00SHARLYN', pass: '123', expectedPath: '/recepcion' },
  { nombre: 'Mozo', user: 'N00GIAN', pass: '321', expectedPath: '/mozo' },
];

test.describe('Flujos por Roles', () => {
  // Bucle para parametrizar las pruebas (se ejecuta una prueba por cada rol)
  for (const rol of roles) {
    test(`Debería iniciar sesión correctamente como ${rol.nombre} y acceder a su dashboard`, async ({ page }) => {
      // Usamos el helper de login
      await loginAs(page, rol.user, rol.pass);
      
      // Verificamos que el router de React nos redirija al path correcto
      // Usamos regex para asegurar que el path final sea el esperado
      await expect(page).toHaveURL(new RegExp(`.*localhost:5173${rol.expectedPath}`));
    });
  }
});
