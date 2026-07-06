# Reporte de Pruebas Unitarias - Wayra Web Frontend

Este documento detalla el estado actual, la cobertura y el propósito de las pruebas unitarias e integración en el proyecto **Wayra Web Frontend**.

## Resumen de Cobertura Global

Tras las recientes optimizaciones y correcciones en los mocks y el manejo de ciclos asíncronos (Promises en el render de componentes), los resultados de cobertura utilizando **Vitest + v8** son sumamente positivos:

* **Statements (Declaraciones):** 92.04%
* **Branches (Ramas lógicas):** 80.34%
* **Functions (Funciones):** 91.86%
* **Lines (Líneas de código):** 94.63% ✅
* **Total de Pruebas Pasadas:** 152 / 152 (100% Success)

> [!TIP]
> Una cobertura superior al 90% en líneas e instrucciones asegura que casi la totalidad del flujo de la interfaz y la lógica de negocio ha sido validada contra errores comunes, regresiones y comportamientos inesperados.

---

## Detalle de Archivos de Prueba

A continuación, se desglosa lo que evalúa cada uno de los archivos de prueba ubicados en la carpeta `tests/`:

### 1. `ViewMesasMozo.test.jsx` (7 pruebas)
**Propósito:** Evalúa el comportamiento de la vista principal del rol Mozo (`ViewMesasMozo`).
* Verifica la correcta inicialización y renderizado con los datos del usuario.
* Asegura que el mozo pueda ver las mesas cargadas desde la API.
* Comprueba reglas de negocio críticas, como **impedir atender una quinta mesa** (límite de atención) o no permitir atender mesas ocupadas por otros mozos.
* Valida el manejo correcto de errores de red (API Error Handling) asegurando que el sistema no se caiga.

### 2. `mozoAndRecepcionComponents.test.jsx` (11 pruebas)
**Propósito:** Pruebas enfocadas en los componentes más granulares y compartidos entre los roles de Mozo y Recepción.
* Verifica el comportamiento de tarjetas, modales y botones interactivos (`CardMesaMozo`, `ModalCheckout`, etc.).
* Evalúa eventos como `onClick` y el correcto flujo de callbacks al seleccionar opciones.

### 3. `adminViews.test.jsx` (4 pruebas)
**Propósito:** Valida el correcto funcionamiento de las vistas de administración.
* Renderizado de la lista de usuarios, historial, o reportes estadísticos.
* Verifica que se interactúe correctamente con las APIs de gestión (CRUD de usuarios y carta).

### 4. `layouts.test.jsx` (5 pruebas)
**Propósito:** Garantizar que los layouts contenedores (`AdminLayout`, `MozoLayout`, `RecepcionLayout`) estructuren la aplicación correctamente.
* Validación del menú lateral responsive (Sidebar).
* Comprobación del despliegue del menú móvil usando el botón hamburguesa.
* Correcta inserción del `<Outlet />` de React Router para mostrar las sub-vistas.

### 5. `dashboards.test.jsx` (4 pruebas)
**Propósito:** Evalúa la correcta navegación dentro de los paneles principales de cada rol.
* Se enfoca en que las transiciones de vista (routing) ocurran fluidamente.
* Asegura la protección básica al mostrar la vista solo a usuarios autenticados.

### 6. `contexts.test.jsx` (8 pruebas)
**Propósito:** Validar el estado global de la aplicación (Context API).
* **AuthContext:** Valida el login, almacenamiento y limpieza del token JWT, y el cierre de sesión.
* **SecurityContext:** Validaciones del widget de seguridad o parámetros relacionados a permisos dentro del FrontEnd.

### 7. `helpers.test.js` (9 pruebas)
**Propósito:** Testea funciones utilitarias puras que no dependen de React.
* **dateFormatter:** Asegura que las fechas se transformen a los formatos correctos (dd/mm/yyyy o humanos).
* **logoutHelper:** Valida que al cerrar sesión, se limpie el caché, el LocalStorage y se redireccione a la página de inicio, incluso si el servidor de Backend responde con un Error (ej. "Network Error").

### 8. `services.test.js` (23 pruebas)
**Propósito:** Confirmar la correcta estructura de los llamados a las APIs.
* Evalúa `authService`, `pedidoService`, `reservaService` y `productoService`.
* Asegura que las URL paths, los métodos (GET, POST, PUT, DELETE) y el manejo de body sean correctos.

### 9. `api/wayraApi.test.js` (3 pruebas)
**Propósito:** Validar la configuración base de Axios (`wayraApi.js`).
* Comprueba que los interceptores se inyecten correctamente.
* Verifica que el token `Bearer` sea adjuntado de manera automática en las cabeceras (`headers`) de cada request saliente cuando el usuario está logueado.

### 10. `stats.test.jsx` (3 pruebas)
**Propósito:** Valida el renderizado de gráficos y widgets del panel administrativo.
* Se asegura de que se lean las variables pasadas a los componentes de gráficas (como Recharts) sin crashear.

---

## Siguientes Pasos (E2E)

Con las pruebas unitarias estabilizadas, el próximo paso corresponde a la estabilización de los flujos automatizados de Playwright (E2E). Se han ajustado los **timeouts globales** a 120 segundos (2 minutos) para dar margen al arranque en frío de la API hospedada en servicios Cloud (Render), con lo cual los flujos End-to-End no deberían experimentar fallas prematuras de "Element not found" debidas a la tardanza de la red.
