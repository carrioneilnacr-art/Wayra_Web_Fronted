# 🥢 Wayra Nikkei - Frontend Web
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)


Interfaz de usuario (UI) para la gestión operativa y administrativa del restaurante Wayra Nikkei. Aplicación web diseñada con un enfoque modular, rápido y reactivo para conectar al personal (recepción, salón y administración) con las operaciones en tiempo real.

## 🚀 Tecnologías Utilizadas

* **Librería Principal:** React.js
* **Estilos y UI:** Tailwind CSS
* **Cliente HTTP:** Axios
* **Gestión de Estado y Lógica:** Custom Hooks
* **Infraestructura Cloud:** Vercel (Frontend) y Railway (Backend)

## 🏗️ Estructura del Proyecto

La arquitectura del frontend está diseñada en espejo con el backend, garantizando una separación limpia entre las vistas y la lógica de datos:

* **`/api`**: Instancia centralizada de configuración de Axios y variables globales.
* **`/services`**: Funciones aisladas que realizan las llamadas HTTP a los endpoints del servidor (`mesaService`, `pedidoService`, etc.).
* **`/hooks`**: Custom Hooks que manejan los estados de la aplicación y encapsulan la lógica de negocio de la UI.
* **`/components`**: Componentes visuales estilizados con Tailwind CSS, reutilizables y modulares (Tarjetas de Mesas, Modales, Botones).
* **`/pages`** *(o `/views`)*: Vistas principales que agrupan componentes según el rol (Dashboard Admin, Interfaz Mozo, Recepción).

## ⚙️ Instalación y Configuración Local

1. Clona este repositorio:
   \`\`\`bash
   git clone https://github.com/TU-USUARIO/Wayra_Web_Frontend.git
   \`\`\`
2. Instala las dependencias:
   \`\`\`bash
   npm install
   \`\`\`
3. Configura las variables de entorno. Crea un archivo \`.env\` en la raíz y agrega la URL de tu backend local y de producción:
   \`\`\`env
   # En local usarás localhost, en producción apuntará a Railway
   VITE_API_URL=http://localhost:3000/api 
   \`\`\`
   *(Nota: Usa `REACT_APP_API_URL` si tu proyecto usa Create React App en lugar de Vite).*

4. Inicia el servidor de desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`

## ☁️ Despliegue en Producción

El proyecto está desplegado de forma continua (CI/CD) utilizando **Vercel**. Cualquier integración de código en la rama principal actualiza automáticamente la aplicación en vivo, garantizando alta disponibilidad y tiempos de carga óptimos para el equipo del restaurante.

## 🧪 Aseguramiento de Calidad (QA) y Pruebas

Para garantizar la estabilidad operativa del restaurante, implementamos un robusto sistema de pruebas y análisis de calidad continuo:

### 1. Pruebas Unitarias (Vitest + React Testing Library)
Hemos alcanzado una cobertura sobresaliente que asegura que la lógica de negocio funcione sin fallos:
- **Statements (Declaraciones):** 92.04%
- **Lines (Líneas de Código):** 94.63%
- **Functions (Funciones):** 91.86%
- **Pruebas Totales:** 152 / 152 pasadas (100% de Éxito)

*Comando útil:* `npm run test` para ejecutar la suite completa.

### 2. Pruebas End-to-End (E2E con Playwright)
Contamos con robots automatizados que simulan el comportamiento real del personal directamente en el navegador, cubriendo los flujos críticos:
- **Login y Enrutamiento de Roles:** (Mozo, Recepción, Administrador).
- **Creación de Reservas:** Emisión de comprobantes desde recepción.
- **Gestión Administrativa:** Creación de nuevos usuarios (Mozos) y platos para la carta.
- **Estado actual:** 100% de los flujos completados exitosamente en entornos con latencia (simulando nube real).

*Comando útil:* `npm run test:e2e` o `npx playwright test --ui` para ver al robot en acción.

### 3. Análisis Estático (SonarQube)
Mantenemos la deuda técnica bajo control y analizamos vulnerabilidades, duplicidad de código (CPD) y seguridad a través de escaneos automáticos de **SonarScanner**. Esto nos permite asegurar que el código Javascript / React mantenga estándares empresariales de arquitectura y mantenimiento.
