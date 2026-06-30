import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ListaPedidos from '../src/views/Mozo/ListaPedidos';
import ComanderoCarta from '../src/views/Mozo/ComanderoCarta';
import { MonitorPedidos } from '../src/views/Mozo/MonitorPedidos';
import { pedidoService } from '../src/services/pedidoService';

// Mock de pedidoService
vi.mock('../../src/services/pedidoService', () => ({
  pedidoService: {
    pagarPedido: vi.fn(),
    crearPedido: vi.fn(),
    actualizarObservacion: vi.fn(),
    getReservasMozoHoy: vi.fn(() => Promise.resolve([])),
    eliminarItemDetalle: vi.fn(),
  },
}));

describe('🧪 Tests para ListaPedidos', () => {
  const mockPedidos = [
    { id_pedido: 10, id_mesa: 4, estado_pedido: 'PENDIENTE', total: 120.00 },
  ];
  const onUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería renderizar un mensaje de vacío si no hay pedidos', () => {
    render(<ListaPedidos pedidos={[]} onUpdate={onUpdate} />);
    expect(screen.getByText('Sin pedidos registrados hoy')).toBeInTheDocument();
  });

  it('Debería renderizar la lista de pedidos', () => {
    render(<ListaPedidos pedidos={mockPedidos} onUpdate={onUpdate} />);
    expect(screen.getByText('MESA #4')).toBeInTheDocument();
    expect(screen.getByText('PENDIENTE')).toBeInTheDocument();
    expect(screen.getByText('S/ 120.00')).toBeInTheDocument();
  });

  it('Debería solicitar confirmación y cobrar a través de IZIPAY', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    vi.spyOn(pedidoService, 'pagarPedido').mockResolvedValue({ status: 200 });

    render(<ListaPedidos pedidos={mockPedidos} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText(/COBRAR IZIPAY/i));

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(pedidoService.pagarPedido).toHaveBeenCalledWith(10);
      expect(onUpdate).toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
  });

  it('Debería manejar errores al pagar pedido con IZIPAY', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => { });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(pedidoService, 'pagarPedido').mockRejectedValue(new Error('Payment Error'));

    render(<ListaPedidos pedidos={mockPedidos} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText(/COBRAR IZIPAY/i));

    await waitFor(() => {
      expect(pedidoService.pagarPedido).toHaveBeenCalledWith(10);
    });

    expect(errorSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("Hubo un problema al procesar el pago. Verifica la conexión.");

    confirmSpy.mockRestore();
    alertSpy.mockRestore();
    errorSpy.mockRestore();
  });
});

describe('🧪 Tests para ComanderoCarta', () => {
  const mockMesa = { id_mesa: 2, numero_mesa: 2 };
  const mockProductos = [
    { id_producto: 1, nombre: 'MAKI ACEVICHADO', precio: 30, categoria: 'MAKIS', estado: 1 },
    { id_producto: 2, nombre: 'LOMO SALTADO', precio: 45, categoria: 'FONDOS', estado: 1 },
  ];
  const mockUser = { id_usuario: 5 };
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería renderizar pestañas de categorías y productos filtrados', () => {
    render(
      <ComanderoCarta
        mesa={mockMesa}
        onClose={onClose}
        onSuccess={onSuccess}
        userLogueado={mockUser}
        productosCache={mockProductos}
      />
    );

    // Activa por defecto es MAKIS
    expect(screen.getByText('MAKI ACEVICHADO')).toBeInTheDocument();
    expect(screen.queryByText('LOMO SALTADO')).not.toBeInTheDocument();

    // Clic en FONDOS
    fireEvent.click(screen.getByText('FONDOS'));
    expect(screen.getByText('LOMO SALTADO')).toBeInTheDocument();
  });

  it('Debería permitir agregar productos al carrito e incrementar/decrementar cantidades', () => {
    render(
      <ComanderoCarta
        mesa={mockMesa}
        onClose={onClose}
        onSuccess={onSuccess}
        userLogueado={mockUser}
        productosCache={mockProductos}
      />
    );

    // Agregar plato
    fireEvent.click(screen.getByText('MAKI ACEVICHADO').closest('button'));
    expect(screen.getByText('Resumen a enviar')).toBeInTheDocument();
    expect(screen.getAllByText('MAKI ACEVICHADO').length).toBe(2);

    // Sumar uno (los del catálogo son divs, los del carrito son buttons)
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    // Restar uno
    fireEvent.click(screen.getByRole('button', { name: '-' }));
  });

  it('Debería enviar nueva comanda a cocina', async () => {
    vi.spyOn(pedidoService, 'crearPedido').mockResolvedValue({ success: true });

    render(
      <ComanderoCarta
        mesa={mockMesa}
        onClose={onClose}
        onSuccess={onSuccess}
        userLogueado={mockUser}
        productosCache={mockProductos}
      />
    );

    // Agregar plato
    fireEvent.click(screen.getByText('MAKI ACEVICHADO').closest('button'));

    // Cambiar nota
    const textarea = screen.getByPlaceholderText(/Ej. Sin picante/i);
    fireEvent.change(textarea, { target: { value: 'Sin wasabi' } });

    // Enviar
    fireEvent.click(screen.getByText('ENVIAR A COCINA'));

    await waitFor(() => {
      expect(pedidoService.crearPedido).toHaveBeenCalledWith(expect.objectContaining({
        id_mesa: 2,
        id_mozo: 5,
        observacion: 'Sin wasabi',
        items: expect.any(Array),
      }));
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('Debería actualizar comanda existente al editar', async () => {
    const pedidoExistente = { id_pedido: 100, observacion: 'Con picante' };
    vi.spyOn(pedidoService, 'crearPedido').mockResolvedValue({ success: true });
    vi.spyOn(pedidoService, 'actualizarObservacion').mockResolvedValue({ success: true });

    render(
      <ComanderoCarta
        mesa={mockMesa}
        onClose={onClose}
        onSuccess={onSuccess}
        userLogueado={mockUser}
        productosCache={mockProductos}
        pedidoExistente={pedidoExistente}
      />
    );

    // Agregar plato al editar
    fireEvent.click(screen.getByText('MAKI ACEVICHADO').closest('button'));

    // Editar nota
    const textarea = screen.getByPlaceholderText(/Ej. Sin picante/i);
    fireEvent.change(textarea, { target: { value: 'Nota editada' } });

    // Guardar
    fireEvent.click(screen.getByText('ACTUALIZAR COMANDA'));

    await waitFor(() => {
      expect(pedidoService.crearPedido).toHaveBeenCalledWith(expect.objectContaining({
        id_pedido_existente: 100,
        modo: 'agregar',
      }));
      expect(pedidoService.actualizarObservacion).toHaveBeenCalledWith(100, 'Nota editada');
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});

describe('🧪 Tests para MonitorPedidos', () => {
  const mockUser = { id_usuario: 5 };
  const mockPedidos = [
    {
      id_pedido: 10,
      id_mozo: 5,
      id_mesa: 2,
      estado_pedido: 'PREPARACION',
      fecha_pedido: new Date().toISOString(),
      total: 50.00,
      observacion: 'Sin cebolla',
      items: [
        { id_detalle: 1, cantidad: 1, nombre: 'MAKI ACEVICHADO', tiempo_estimado: 15 }
      ]
    }
  ];
  const mockReservas = [
    { id_reserva: 1, hora_reserva: '12:00', nombre_cliente: 'GABRIELA', id_mesa: 2, personas: 4 }
  ];
  const onUpdate = vi.fn();
  const onShowTicket = vi.fn();
  const onAgregarPlatos = vi.fn();

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

  it('Debería cargar reservas asignadas y mostrarlas', async () => {
    vi.spyOn(pedidoService, 'getReservasMozoHoy').mockResolvedValue(mockReservas);

    render(
      <MonitorPedidos
        pedidos={mockPedidos}
        onUpdate={onUpdate}
        userLogueado={mockUser}
        onShowTicket={onShowTicket}
        onAgregarPlatos={onAgregarPlatos}
      />
    );

    await waitFor(() => {
      expect(pedidoService.getReservasMozoHoy).toHaveBeenCalledWith(5);
    });
    expect(screen.getByText('GABRIELA')).toBeInTheDocument();
    expect(screen.getByText('Mesa 2 • 4 personas')).toBeInTheDocument();
  });

  it('Debería abrir el panel lateral al hacer clic en una mesa activa y permitir interactuar con los botones', async () => {
    vi.spyOn(pedidoService, 'getReservasMozoHoy').mockResolvedValue([]);

    render(
      <MonitorPedidos
        pedidos={mockPedidos}
        onUpdate={onUpdate}
        userLogueado={mockUser}
        onShowTicket={onShowTicket}
        onAgregarPlatos={onAgregarPlatos}
      />
    );

    await waitFor(() => {
      expect(pedidoService.getReservasMozoHoy).toHaveBeenCalled();
    });

    // Clic en la mesa activa
    const mesaBtn = screen.getByText('Mesa 2').closest('button');
    fireEvent.click(mesaBtn);

    // Debería abrirse el panel lateral
    expect(screen.getByText(/Sin cebolla/i)).toBeInTheDocument();

    // Click en "Añadir Items"
    fireEvent.click(screen.getByText('Añadir Items'));
    expect(onAgregarPlatos).toHaveBeenCalledWith(mockPedidos[0]);

    // Reabrir
    fireEvent.click(mesaBtn);

    // Click en "Cobrar"
    fireEvent.click(screen.getByText('Cobrar'));
    expect(onShowTicket).toHaveBeenCalledWith(mockPedidos[0]);
  });

  it('Debería eliminar un item del comensal si se confirma', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    vi.spyOn(pedidoService, 'eliminarItemDetalle').mockResolvedValue({ success: true });
    vi.spyOn(pedidoService, 'getReservasMozoHoy').mockResolvedValue([]);

    render(
      <MonitorPedidos
        pedidos={mockPedidos}
        onUpdate={onUpdate}
        userLogueado={mockUser}
        onShowTicket={onShowTicket}
        onAgregarPlatos={onAgregarPlatos}
      />
    );

    await waitFor(() => {
      expect(pedidoService.getReservasMozoHoy).toHaveBeenCalled();
    });

    // Abrir panel lateral
    fireEvent.click(screen.getByText('Mesa 2').closest('button'));

    // Click botón eliminar (botón con svg de tacho)
    const deleteButtons = screen.getAllByRole('button');
    const deleteItemBtn = deleteButtons.find(b => b.className.includes('text-slate-300'));
    fireEvent.click(deleteItemBtn);

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(pedidoService.eliminarItemDetalle).toHaveBeenCalledWith(1);
      expect(onUpdate).toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
  });
});
