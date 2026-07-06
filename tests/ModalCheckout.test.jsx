import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ModalCheckout from '../src/components/Mozo/ModalCheckout';
import { pedidoService } from '../src/services/pedidoService';

// Mock de pedidoService
vi.mock('../../src/services/pedidoService', () => ({
  pedidoService: {
    procesarCheckout: vi.fn(),
  },
}));

describe('🧪 Tests para ModalCheckout', () => {
  const mockPedido = {
    id_pedido: 77,
    id_mesa: 3,
    total: 150.00,
    items: [
      { id_producto: 1, cantidad: 2, nombre: 'Maki Acevichado', subtotal: 60.00 },
      { id_producto: 2, cantidad: 1, nombre: 'Tiradito', subtotal: 90.00 },
    ],
  };
  const mockReservas = [
    { id_mesa: 3, dni_cliente: '99887766', nombre_cliente: 'ELIAS CARRION' }
  ];
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería autocompletar datos si coincide con una reserva en el paso 1', () => {
    render(<ModalCheckout pedido={mockPedido} reservas={mockReservas} onClose={onClose} onSuccess={onSuccess} />);

    // Debería cargar el DNI y Nombre de la reserva
    expect(screen.getByLabelText('DNI (8 dígitos)')).toHaveValue('99887766');
    expect(screen.getByLabelText('Nombres Completos')).toHaveValue('ELIAS CARRION');
  });

  it('Debería avanzar al paso 2 al completar datos en el paso 1', async () => {
    render(<ModalCheckout pedido={mockPedido} reservas={[]} onClose={onClose} onSuccess={onSuccess} />);

    // Rellenar DNI (8 dígitos)
    fireEvent.change(screen.getByLabelText('DNI (8 dígitos)'), { target: { value: '11223344' } });
    // Nombres (mínimo 3 caracteres)
    fireEvent.change(screen.getByLabelText('Nombres Completos'), { target: { value: 'LEONARDO' } });

    const continueBtn = screen.getByRole('button', { name: 'Continuar al Pago' });
    expect(continueBtn).not.toBeDisabled();
    fireEvent.click(continueBtn);

    // Ahora deberíamos ver el paso 2 con Niubiz
    expect(screen.getByText('Pago Link')).toBeInTheDocument();
  });

  it('Debería procesar el pago correctamente y avanzar al paso 3', async () => {
    vi.spyOn(pedidoService, 'procesarCheckout').mockResolvedValue({ success: true });

    render(<ModalCheckout pedido={mockPedido} reservas={mockReservas} onClose={onClose} onSuccess={onSuccess} />);

    // Avanzar a paso 2 (los datos ya se autocompletaron de la reserva)
    fireEvent.click(screen.getByRole('button', { name: 'Continuar al Pago' }));

    // Seleccionar método de pago Yape
    fireEvent.click(screen.getByText('Yape'));

    // Pagar
    fireEvent.click(screen.getByRole('button', { name: /PAGAR S\// }));

    await waitFor(() => {
      expect(pedidoService.procesarCheckout).toHaveBeenCalledWith(77, {
        metodo_pago: 'YAPE',
        dni_cliente: '99887766',
        nombre_cliente: 'ELIAS CARRION',
        tipo_doc: 'BOLETA'
      });
      expect(onSuccess).toHaveBeenCalled();
    });

    // Debería estar en el paso 3 (Comprobante)
    expect(screen.getByText('Comprobante')).toBeInTheDocument();
    expect(screen.getByText('Maki Acevichado')).toBeInTheDocument();
  });

  it('Debería permitir imprimir y liberar la mesa en el paso 3', async () => {
    vi.spyOn(pedidoService, 'procesarCheckout').mockResolvedValue({ success: true });
    const printSpy = vi.spyOn(globalThis, 'print').mockImplementation(() => { });

    render(<ModalCheckout pedido={mockPedido} reservas={mockReservas} onClose={onClose} onSuccess={onSuccess} />);

    // Avanzar a paso 2
    fireEvent.click(screen.getByRole('button', { name: 'Continuar al Pago' }));
    // Pagar
    fireEvent.click(screen.getByRole('button', { name: /PAGAR S\// }));

    await waitFor(() => {
      expect(screen.getByText('🖨️ Imprimir')).toBeInTheDocument();
    });

    // Probar botón Imprimir
    fireEvent.click(screen.getByText('🖨️ Imprimir'));
    expect(printSpy).toHaveBeenCalled();

    // Probar botón Liberar Mesa
    fireEvent.click(screen.getByText('✕ Liberar Mesa'));
    expect(onClose).toHaveBeenCalled();

    printSpy.mockRestore();
  });

  it('Debería permitir seleccionar Tarjeta, Efectivo y Plin, y mostrar campos de tarjeta si es Tarjeta', () => {
    render(<ModalCheckout pedido={mockPedido} reservas={mockReservas} onClose={onClose} onSuccess={onSuccess} />);

    // Avanzar a paso 2
    fireEvent.click(screen.getByRole('button', { name: 'Continuar al Pago' }));

    // Seleccionar Tarjeta (debería mostrar los inputs deshabilitados)
    fireEvent.click(screen.getByText('Tarjeta'));
    expect(screen.getByPlaceholderText('0000 0000 0000 0000')).toBeInTheDocument();

    // Seleccionar Efectivo
    fireEvent.click(screen.getByText('Efectivo'));
    expect(screen.queryByPlaceholderText('0000 0000 0000 0000')).not.toBeInTheDocument();

    // Seleccionar Plin
    fireEvent.click(screen.getByText('Plin'));
    expect(screen.queryByPlaceholderText('0000 0000 0000 0000')).not.toBeInTheDocument();
  });

  it('Debería permitir regresar al paso 1 al presionar Volver en el paso 2', () => {
    render(<ModalCheckout pedido={mockPedido} reservas={mockReservas} onClose={onClose} onSuccess={onSuccess} />);

    // Avanzar a paso 2
    fireEvent.click(screen.getByRole('button', { name: 'Continuar al Pago' }));

    // Presionar Volver
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));

    // Debería estar de vuelta en el paso 1 (visualizando el botón Continuar al Pago)
    expect(screen.getByRole('button', { name: 'Continuar al Pago' })).toBeInTheDocument();
  });

  it('Debería manejar el flujo completo con FACTURA', async () => {
    render(<ModalCheckout pedido={mockPedido} reservas={[]} onClose={onClose} onSuccess={onSuccess} />);

    // Cambiar a FACTURA
    fireEvent.click(screen.getByRole('button', { name: /Factura/i }));
    
    // Rellenar datos
    fireEvent.change(screen.getByPlaceholderText('Ingrese RUC'), { target: { value: '12345678901' } });
    fireEvent.change(screen.getByPlaceholderText('Nombre de la empresa'), { target: { value: 'Mi Empresa 123' } });
    fireEvent.change(screen.getByPlaceholderText('Dirección completa'), { target: { value: 'Av Principal 123' } });

    // Botón Continuar debe estar habilitado
    const continueBtn = screen.getByRole('button', { name: 'Continuar al Pago' });
    expect(continueBtn).not.toBeDisabled();
    
    // Y luego cambiar a Boleta para ver que se limpian los campos
    fireEvent.click(screen.getByRole('button', { name: /Boleta/i }));
    expect(screen.getByPlaceholderText('Ingrese DNI')).toHaveValue('');
  });

  it('Debería manejar el error al procesar el pago', async () => {
    vi.spyOn(pedidoService, 'procesarCheckout').mockRejectedValue(new Error('Network error'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ModalCheckout pedido={mockPedido} reservas={mockReservas} onClose={onClose} onSuccess={onSuccess} />);

    // Avanzar a paso 2
    fireEvent.click(screen.getByRole('button', { name: 'Continuar al Pago' }));

    // Pagar
    fireEvent.click(screen.getByRole('button', { name: /PAGAR S\// }));

    await waitFor(() => {
      expect(pedidoService.procesarCheckout).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith("Error al procesar el pago. Verifica la conexión.");
    });

    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
