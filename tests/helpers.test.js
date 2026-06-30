import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dateFormatter } from '../src/helpers/dateFormatter';
import { ejecutarCierreSesionGlobal } from '../src/helpers/logoutHelper';
import wayraApi from '../src/api/wayraApi';

// Mock de wayraApi para evitar llamadas reales a la API
vi.mock('../src/api/wayraApi', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('🧪 Tests para dateFormatter helper', () => {
  // Test para formatToLocalDate
  it('Debería formatear correctamente una fecha a formato local PE', () => {
    const inputDate = '2026-06-30T10:00:00Z';
    const formatted = dateFormatter.formatToLocalDate(inputDate);
    // En es-PE el formato esperado es DD/MM/YYYY
    expect(formatted).toBe('30/06/2026');
  });

  it('Debería retornar --- si no se provee fecha en formatToLocalDate', () => {
    expect(dateFormatter.formatToLocalDate(null)).toBe('---');
    expect(dateFormatter.formatToLocalDate(undefined)).toBe('---');
  });

  // Test para formatToLocalTime
  it('Debería formatear correctamente un timestamp a hora local HH:MM', () => {
    const inputDate = '2026-06-30T10:30:00Z';
    const formatted = dateFormatter.formatToLocalTime(inputDate);
    // 10:30 (es-PE formato 24 horas, o según huso horario de test)
    // El test compara si extrae correctamente los dígitos correspondientes de toLocaleTimeString
    const dateObj = new Date(inputDate);
    const expectedTime = dateObj.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    expect(formatted).toBe(expectedTime);
  });

  it('Debería retornar 00:00 si no se provee fecha en formatToLocalTime', () => {
    expect(dateFormatter.formatToLocalTime(null)).toBe('00:00');
  });

  it('Debería recortar y retornar HH:MM si es una hora cruda de la DB', () => {
    expect(dateFormatter.formatToLocalTime('14:45:30')).toBe('14:45');
  });

  // Test para getSQLDateStr
  it('Debería retornar el string de fecha SQL en-CA', () => {
    const testDate = new Date(2026, 5, 30); // 30 de Junio 2026
    const sqlStr = dateFormatter.getSQLDateStr(testDate);
    expect(sqlStr).toBe('2026-06-30');
  });
});

describe('🧪 Tests para logoutHelper', () => {
  const originalLocation = globalThis.location;

  beforeEach(() => {
    // Mock de localStorage y sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('wayra_token', 'test-token');
    sessionStorage.setItem('temp_data', 'some-value');

    // Mock de location.href
    delete globalThis.location;
    globalThis.location = { href: '' };
  });

  afterEach(() => {
    globalThis.location = originalLocation;
    vi.restoreAllMocks();
  });

  it('Debería llamar a la API de logout si el usuario está logueado, limpiar almacenes y redireccionar', async () => {
    const mockPost = vi.spyOn(wayraApi, 'post').mockResolvedValue({ data: { success: true } });
    const logoutCallback = vi.fn();
    const mockUser = { id_usuario: 12, nombre: 'Leonardo' };

    await ejecutarCierreSesionGlobal(mockUser, logoutCallback);

    expect(mockPost).toHaveBeenCalledWith('/logout', { id_usuario: 12 });
    expect(localStorage.getItem('wayra_token')).toBeNull();
    expect(sessionStorage.getItem('temp_data')).toBeNull();
    expect(logoutCallback).toHaveBeenCalled();
    expect(globalThis.location.href).toBe('/login');
  });

  it('Debería limpiar almacenes y redireccionar incluso si la API de logout falla', async () => {
    vi.spyOn(wayraApi, 'post').mockRejectedValue(new Error('Network Error'));
    const logoutCallback = vi.fn();
    const mockUser = { id_usuario: 12 };

    await ejecutarCierreSesionGlobal(mockUser, logoutCallback);

    expect(localStorage.getItem('wayra_token')).toBeNull();
    expect(logoutCallback).toHaveBeenCalled();
    expect(globalThis.location.href).toBe('/login');
  });

  it('Debería limpiar almacenes incluso si no se provee usuario o callback', async () => {
    await ejecutarCierreSesionGlobal(null, null);

    expect(localStorage.getItem('wayra_token')).toBeNull();
    expect(globalThis.location.href).toBe('/login');
  });
});
