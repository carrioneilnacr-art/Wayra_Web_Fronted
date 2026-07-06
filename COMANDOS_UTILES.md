# 🛠️ Guía Rápida de Comandos Útiles (Wayra Nikkei)

Este archivo es tu "acordeón" o guía rápida personal para que nunca te olvides de los comandos clave del proyecto, especialmente para las pruebas (QA) y el análisis de calidad.

---

## 🤖 1. Pruebas E2E (Playwright)

Los "Robots" de Playwright te permiten simular usuarios reales haciendo clics y escribiendo.

* **Ejecutar en modo silencioso (Rápido, ideal para la nube):**
  ```bash
  npm run test:e2e
  ```

* **Ejecutar con el navegador visible (Para que la profesora vea al robot trabajar):**
  ```bash
  npx playwright test --headed
  ```

* **Ejecutar en MODO LENTO (Slow motion):**
  Si el robot va muy rápido y quieres que la profesora vea el proceso paso a paso claramente, puedes reducir la velocidad en la configuración.
  Entra al archivo `playwright.config.js` y en la sección `use: { ... }` agrega:
  `launchOptions: { slowMo: 1000 }` 
  *(Esto hará que el robot haga una pausa de 1 segundo antes de cada acción. Recuerda borrarlo cuando termines tu presentación).*

* **Ejecutar con la Interfaz de Usuario (UI Mode - ¡El mejor para debugear!):**
  Te abrirá un panel interactivo donde puedes ver una línea de tiempo, darle play a pruebas específicas y ver el paso a paso detallado de forma muy visual.
  ```bash
  npx playwright test --ui
  ```

* **Ver el último reporte generado en HTML:**
  ```bash
  npx playwright show-report
  ```

---

## 🧪 2. Pruebas Unitarias (Vitest)

Verifican matemáticamente que tu código funciona sin necesidad de abrir un navegador web.

* **Ejecutar todas las pruebas unitarias (Te dará el cuadro de porcentajes):**
  ```bash
  npm run test
  ```

* **Ejecutar las pruebas en Modo Observador (Watch Mode):**
  Se queda escuchando y cada vez que guardas un archivo, vuelve a correr solo las pruebas de ese archivo.
  ```bash
  npx vitest
  ```

* **Ejecutar con Interfaz Web (Vitest UI):**
  ¡Este es el que buscabas! Abre una hermosa página HTML interactiva en tu navegador donde puedes ver todos los tests unitarios, gráficos, y el código detallado.
  ```bash
  npx vitest --ui
  ```

---

## 📊 3. Análisis de Calidad y Deuda Técnica (SonarQube)

Para escanear tu código, buscar bugs de seguridad, código duplicado o malas prácticas, y enviar el reporte a SonarCloud / SonarQube.

* **Ejecutar el Escáner de Sonar (Asegúrate de estar en la carpeta donde está `sonar-project.properties`):**
  ```bash
  npx sonarqube-scanner
  ```

---

## 🌐 4. Servidores (Local)

* **Levantar el Frontend para desarrollo:**
  ```bash
  npm run dev
  ```
* **Instalar todas las dependencias (obligatorio si abres el proyecto en una PC nueva):**
  ```bash
  npm install
  ```
