import wayraApi from '../../src/api/wayraApi';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('🧪 Test de Capa de API (wayraApi)', () => {
    
    beforeEach(() => {
        // Limpiamos el localStorage antes de cada test
        localStorage.clear();
    });

    it('Debería configurar la baseURL correctamente', () => {
        expect(wayraApi.defaults.baseURL).toBeDefined();
        // Verifica que la URL contenga el endpoint de tu backend
        expect(wayraApi.defaults.baseURL).toContain('wayra-web-backend');
    });

    it('Debería inyectar el token en las cabeceras si existe en localStorage', async () => {
        const token = 'fake-jwt-token';
        localStorage.setItem('wayra_token', token);

        // Simulamos la configuración de una petición
        const config = { headers: {} };
        
        // Ejecutamos el interceptor manualmente para probar la lógica
        const resultConfig = await wayraApi.interceptors.request.handlers[0].fulfilled(config);
        
        expect(resultConfig.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('No debería inyectar token si no existe en localStorage', async () => {
        const config = { headers: {} };
        const resultConfig = await wayraApi.interceptors.request.handlers[0].fulfilled(config);
        
        expect(resultConfig.headers.Authorization).toBeUndefined();
    });
});