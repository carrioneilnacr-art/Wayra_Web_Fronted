import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupTests.js', // Crearemos este archivo ahora
    coverage: {
      reporter: ['lcov', 'text'], // Formato que SonarCloud necesita
    },
  },
}); 