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

  it('Debería manejar errores de API en cargarDatos', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(reservaService.getMesas).mockRejectedValueOnce(new Error('Network error'));
    vi.spyOn(pedidoService, 'getEstatusPedidos').mockResolvedValue([]);
    vi.spyOn(pedidoService, 'getReservasMozoHoy').mockResolvedValue([]);
    vi.spyOn(productoService, 'getTodos').mockResolvedValue([]);
    
    console.log("DEBUG TEST: isMock?", !!reservaService.getMesas.mock);
    render(<ViewMesasMozo user={mockUser} onLogout={onLogout} />);
    console.log("DEBUG TEST: render finished");
    
    await new Promise(r => setTimeout(r, 0));
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error en la API:", expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });

  it('Debería impedir atender una quinta mesa', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => { });
    
    // Crear 4 pedidos activos para el mozo actual
    const cuatroPedidos = [
      { id_pedido: 1, id_mesa: 1, estado_pedido: 'PREPARACION', id_mozo: mockUser.id_usuario },
      { id_pedido: 2, id_mesa: 2, estado_pedido: 'PREPARACION', id_mozo: mockUser.id_usuario },
      { id_pedido: 3, id_mesa: 3, estado_pedido: 'PREPARACION', id_mozo: mockUser.id_usuario },
      { id_pedido: 4, id_mesa: 4, estado_pedido: 'PREPARACION', id_mozo: mockUser.id_usuario },
    ];
    // Y una 5ta mesa libre
    const mesasCinco = [
      { id_mesa: 1, numero_mesa: 1, estado: 'ocupada' },
      { id_mesa: 2, numero_mesa: 2, estado: 'ocupada' },
      { id_mesa: 3, numero_mesa: 3, estado: 'ocupada' },
      { id_mesa: 4, numero_mesa: 4, estado: 'ocupada' },
      { id_mesa: 5, numero_mesa: 5, estado: 'disponible' },
    ];

    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mesasCinco);
    vi.spyOn(pedidoService, 'getEstatusPedidos').mockResolvedValue(cuatroPedidos);
    
    render(<ViewMesasMozo user={mockUser} onLogout={onLogout} />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    // Intentar atender mesa 5 que está disponible
    fireEvent.click(screen.getByText('5').closest('button'));

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('LÍMITE ALCANZADO'));
    alertSpy.mockRestore();
  });

  it('Debería probar la funcionalidad de ModalCheckout y ComanderoCarta callbacks', async () => {
    const mesasMock = [{ id_mesa: 10, numero_mesa: 10, estado: 'disponible' }];
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mesasMock);
    vi.spyOn(pedidoService, 'getEstatusPedidos').mockResolvedValue([]);
    
    render(<ViewMesasMozo user={mockUser} onLogout={onLogout} />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    // Abrir ComanderoCarta (click en mesa libre)
    fireEvent.click(screen.getByText('10').closest('button'));

    // Debe mostrar botón de cerrar mesa (onClose de ComanderoCarta) en algún lugar,
    // pero para probar callbacks necesitamos saber si renderiza el Modal o hacer un mock.
    // Dado que ComanderoCarta renderiza, si hacemos "Volver", deberíamos poder cerrarlo.
    const btnVolver = screen.getByRole('button', { name: /^Cerrar$/i });
    expect(btnVolver).toBeInTheDocument();
    fireEvent.click(btnVolver);
    
    // El modal debería desaparecer
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /^Cerrar$/i })).not.toBeInTheDocument();
    });
  });

  it('Debería manejar exactamente 3 mesas (color ambar)', async () => {
    const tresPedidos = [
      { id_pedido: 1, id_mesa: 1, estado_pedido: 'PREPARACION', id_mozo: mockUser.id_usuario },
      { id_pedido: 2, id_mesa: 2, estado_pedido: 'PREPARACION', id_mozo: mockUser.id_usuario },
      { id_pedido: 3, id_mesa: 3, estado_pedido: 'PREPARACION', id_mozo: mockUser.id_usuario },
    ];
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue([]);
    vi.spyOn(pedidoService, 'getEstatusPedidos').mockResolvedValue(tresPedidos);
    
    const { container } = render(<ViewMesasMozo user={mockUser} onLogout={onLogout} />);
    
    await waitFor(() => {
      expect(pedidoService.getEstatusPedidos).toHaveBeenCalled();
    });
    
    // Verificamos si existe un elemento con la clase bg-amber-400
    const amberElement = container.querySelector('.bg-amber-400');
    expect(amberElement).toBeInTheDocument();
  });
});
