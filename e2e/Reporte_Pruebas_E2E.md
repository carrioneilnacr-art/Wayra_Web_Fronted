# Reporte de Pruebas E2E (End-to-End) - Wayra Web Frontend

Este documento detalla el estado actual y el propósito de las pruebas E2E automatizadas usando **Playwright** en el proyecto **Wayra Web Frontend**.

## Resumen de la Suite E2E

Gracias al ajuste de los tiempos de espera (timeouts) en la configuración de Playwright para tolerar la latencia de red y el arranque en frío del Backend (Render), los tests de flujos de usuario se completan correctamente.

* **Total de Pruebas Ejecutadas:** 8
* **Estado:** 100% Pasadas (Success) ✅
* **Herramienta:** Playwright
* **Navegadores:** Chromium (por defecto)

---

## Detalle de Archivos de Prueba (E2E)

A continuación, se detalla qué flujo interactivo comprueba cada archivo dentro de la carpeta `e2e/`:

### 1. `login.spec.js` (2 Pruebas)
**Categoría:** Validaciones Generales y Seguridad
* **Error visual de credenciales:** Intenta iniciar sesión con credenciales inválidas y verifica que aparezca la caja roja con el mensaje "Usuario o clave incorrecta".
* **Redirección de Seguridad:** Intenta acceder directamente a la ruta protegida `/admin` sin tener un token válido. Comprueba que React Router actúe correctamente interceptando el acceso y redirigiendo de vuelta a la pantalla de login (`/`).

### 2. `roles.spec.js` (3 Pruebas)
**Categoría:** Flujos de Autenticación por Roles
* **Inicio de Sesión y Enrutamiento:** Verifica de forma parametrizada que cada uno de los 3 roles principales de la aplicación sea redirigido a su respectivo Dashboard.
  * Inicia sesión como **Admin** y verifica redirección a `/admin`.
  * Inicia sesión como **Recepcionista** y verifica redirección a `/recepcion`.
  * Inicia sesión como **Mozo** y verifica redirección a `/mozo`.

### 3. `admin_usuarios.spec.js` (1 Prueba)
**Categoría:** Flujo de Administrador - Gestión de Personal
* **Creación de Empleado:** Simula paso a paso la creación de un nuevo empleado desde la vista del Administrador. Inicia sesión, navega al menú de usuarios, abre el modal de registro, rellena el formulario con datos aleatorios de un empleado "Mozo", guarda y finalmente verifica que el nuevo trabajador aparezca inmediatamente en el Grid de usuarios.

### 4. `admin_carta.spec.js` (1 Prueba)
**Categoría:** Flujo de Administrador - Gestión de Carta
* **Creación de Producto:** Verifica que el Administrador puede dar de alta un nuevo plato o producto en el menú del restaurante. Abre el modal correspondiente, rellena los detalles (nombre, categoría, precio, descripción), guarda, el modal se cierra y usa la barra de búsqueda para verificar visualmente que el sistema renderiza el nuevo ítem creado.

### 5. `recepcion.spec.js` (1 Prueba)
**Categoría:** Flujo de Recepción - Creación de Reservas
* **Emisión de Ticket:** Evalúa el flujo principal del recepcionista. Entra al dashboard de recepción, selecciona una mesa libre del mapa interactivo, especifica el nombre del cliente y el número de asistentes en el modal y finaliza la reserva comprobando que se genera un comprobante o ticket visual antes de cerrarse.

---

## Comandos Útiles

* **Ejecutar pruebas en la consola (Headless):**
  ```bash
  npm run test:e2e
  ```
* **Ver el reporte HTML generado:**
  ```bash
  npx playwright show-report
  ```
* **Correr pruebas con la UI (Robot visible en el navegador):**
  ```bash
  npx playwright test --ui
  ```
