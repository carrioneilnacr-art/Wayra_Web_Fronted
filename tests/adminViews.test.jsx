import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ViewHistorial } from '../src/views/Admin/ViewHistorial';
import { pedidoService } from '../src/services/pedidoService';

// Mock de pedidoService
vi.mock('../../src/services/pedidoService', () => ({
  pedidoService: {
    getHistorial: vi.fn(),
  },
}));

describe('🧪 Tests para ViewHistorial', () => {
  const mockPedidos = [
    {
      id_pedido: 200,
      hora: '14:30',
      nombre_mozo: 'MOZO CARLOS',
      id_mesa: 4,
      total: 85.00,
      estado_pedido: 'PAGADO'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería cargar y mostrar el historial de ventas', async () => {
    vi.spyOn(pedidoService, 'getHistorial').mockResolvedValue(mockPedidos);

    render(<ViewHistorial />);

    await waitFor(() => {
      expect(pedidoService.getHistorial).toHaveBeenCalled();
    });

    expect(screen.getByText('MOZO CARLOS')).toBeInTheDocument();
    expect(screen.getByText('#TK-0200')).toBeInTheDocument();
    expect(screen.getByText('S/ 85.00')).toBeInTheDocument();
    expect(screen.getByText('PAGADO')).toBeInTheDocument();
  });

  it('Debería actualizar historial al cambiar la fecha del filtro', async () => {
    vi.spyOn(pedidoService, 'getHistorial').mockResolvedValue([]);

    const { container } = render(<ViewHistorial />);

    await waitFor(() => {
      expect(pedidoService.getHistorial).toHaveBeenCalled();
    });

    // Cambiar input de fecha
    const dateInput = container.querySelector('input[type="date"]');
    fireEvent.change(dateInput, { target: { value: '2026-07-01' } });

    await waitFor(() => {
      expect(pedidoService.getHistorial).toHaveBeenCalledWith('2026-07-01');
    });
  });

  it('Debería abrir la boleta en otra pestaña al presionar Boleta', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => { });
    vi.spyOn(pedidoService, 'getHistorial').mockResolvedValue(mockPedidos);

    render(<ViewHistorial />);

    await waitFor(() => {
      expect(screen.getByText('Boleta')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Boleta'));
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('Debería manejar errores al cargar historial', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(pedidoService, 'getHistorial').mockRejectedValue(new Error('Historial Error'));

    render(<ViewHistorial />);

    await waitFor(() => {
      expect(pedidoService.getHistorial).toHaveBeenCalled();
    });

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
