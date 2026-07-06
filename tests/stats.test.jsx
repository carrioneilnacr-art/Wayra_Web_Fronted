import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ViewStats } from '../src/views/Admin/ViewStats';
import wayraApi from '../src/api/wayraApi';

// Mock de wayraApi
vi.mock('../src/api/wayraApi', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock de ResponsiveContainer de recharts para evitar problemas de dimensiones en JSDOM
vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  };
});

describe('🧪 Tests para ViewStats', () => {
  const mockMetrics = {
    kpis: {
      totalPedidosHistoricos: 150,
      ticketPromedio: 45.80,
    },
    topProductos: [
      { nombre: 'ACEVICHADO MAKI', cantidad: 80 },
      { nombre: 'LOMO SALTADO', cantidad: 50 },
    ],
    ventasSemana: [
      { fecha: '2026-06-24', total: 500 },
      { fecha: '2026-06-25', total: 600 },
    ],
    notificaciones: {},
    rendimientoMozos: [
      { nombre: 'MOZO CARLOS', total_vendido: '450.00', mesas: 8 }
    ]
  };

  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.setInterval = vi.fn(() => 999);
    globalThis.clearInterval = vi.fn();
  });

  afterEach(() => {
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
  });

  it('Debería mostrar pantalla de carga inicialmente', () => {
    vi.spyOn(wayraApi, 'get').mockReturnValue(new Promise(() => { }));
    render(<ViewStats />);
    expect(screen.getByClassName ? screen.getByClassName('animate-spin') : document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('Debería cargar métricas y mostrar los KPIs, insights y tabla de desempeño', async () => {
    vi.spyOn(wayraApi, 'get').mockResolvedValue({ data: mockMetrics });

    render(<ViewStats />);

    await waitFor(() => {
      expect(wayraApi.get).toHaveBeenCalledWith('/admin/metrics');
    });

    // KPIs
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('S/ 45.80')).toBeInTheDocument();

    // Pestañas (Tabs)
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Operaciones')).toBeInTheDocument();
    expect(screen.getByText('Finanzas')).toBeInTheDocument();
    
    // Rotación de mesas
    expect(screen.getByText('Rotación de Mesas')).toBeInTheDocument();
  });

  it('Debería manejar errores de API en cargarMetricas', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(wayraApi, 'get').mockRejectedValue(new Error('Render Error'));

    render(<ViewStats />);

    await waitFor(() => {
      expect(wayraApi.get).toHaveBeenCalled();
    });

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
