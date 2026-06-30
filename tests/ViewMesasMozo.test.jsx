import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ViewMesasMozo } from '../src/views/Mozo/ViewMesasMozo';
import { reservaService } from '../src/services/reservaService';
import { pedidoService } from '../src/services/pedidoService';
import { productoService } from '../src/services/productoService';

// Mock de servicios
vi.mock('../src/services/reservaService', () => ({
  reservaService: {
    getMesas: vi.fn(),
  },
}));
vi.mock('../src/services/pedidoService', () => ({
  pedidoService: {
    getEstatusPedidos: vi.fn(),
    getReservasMozoHoy: vi.fn(),
    crearPedido: vi.fn(),
  },
}));
vi.mock('../src/services/productoService', () => ({
  productoService: {
    getTodos: vi.fn(),
  },
}));

describe('🧪 Tests para ViewMesasMozo', () => {
  const mockUser = { id_usuario: 5, nombre: 'Pedro Mozo' };
  const mockMesas = [
    { id_mesa: 1, numero_mesa: 1, estado: 'libre', capacidad: 4 },
    { id_mesa: 2, numero_mesa: 2, estado: 'ocupada', capacidad: 2 },
  ];
  const mockPedidos = [
    { id_pedido: 10, id_mesa: 2, estado_pedido: 'PREPARACION', total: 60, id_mozo: 8 } // Atendido por mozo 8
  ];
  const onLogout = vi.fn();
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

  it('Debería cargar mesas y pedidos del mozo', async () => {
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mockMesas);
    vi.spyOn(pedidoService, 'getEstatusPedidos').mockResolvedValue(mockPedidos);
    vi.spyOn(pedidoService, 'getReservasMozoHoy').mockResolvedValue([]);
    vi.spyOn(productoService, 'getTodos').mockResolvedValue([]);

    render(<ViewMesasMozo user={mockUser} onLogout={onLogout} />);

    await waitFor(() => {
      expect(reservaService.getMesas).toHaveBeenCalled();
      expect(pedidoService.getEstatusPedidos).toHaveBeenCalledWith(5);
    });

    // Debería renderizar la información de las mesas en el panel
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('Debería disparar alert si se intenta atender mesa ocupada por otro mozo', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => { });
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mockMesas);
    vi.spyOn(pedidoService, 'getEstatusPedidos').mockResolvedValue(mockPedidos);
    vi.spyOn(pedidoService, 'getReservasMozoHoy').mockResolvedValue([]);
    vi.spyOn(productoService, 'getTodos').mockResolvedValue([]);

    render(<ViewMesasMozo user={mockUser} onLogout={onLogout} />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Intentar atender mesa 2
    fireEvent.click(screen.getByText('2').closest('button'));

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('MESA PROTEGIDA'));
    alertSpy.mockRestore();
  });

  it('Debería llamar a onLogout al presionar el botón de salir', async () => {
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mockMesas);
    vi.spyOn(pedidoService, 'getEstatusPedidos').mockResolvedValue([]);
    vi.spyOn(pedidoService, 'getReservasMozoHoy').mockResolvedValue([]);
    vi.spyOn(productoService, 'getTodos').mockResolvedValue([]);

    render(<ViewMesasMozo user={mockUser} onLogout={onLogout} />);

    await waitFor(() => {
      expect(reservaService.getMesas).toHaveBeenCalled();
    });

    // Clic logout
    fireEvent.click(screen.getByTitle('Cerrar Sesión'));
    expect(onLogout).toHaveBeenCalled();
  });
});
