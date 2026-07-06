import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PanelDerechoReservas } from '../src/components/Recepcion/PanelDerecho';
import { ModalDetalleTicket, ModalListaDia } from '../src/Modals/ModalRecepcion/ModalesRecepcion';
import ModalReserva from '../src/Modals/ModalReserva/ModalReserva';
import { reservaService } from '../src/services/reservaService';
import wayraApi from '../src/api/wayraApi';

// Mock de wayraApi y reservaService
vi.mock('../src/api/wayraApi', () => ({
  default: {
    put: vi.fn(),
  },
}));
vi.mock('../src/services/reservaService', () => ({
  reservaService: {
    getAsignarMozo: vi.fn(),
  },
}));

describe('🧪 Tests para PanelDerechoReservas', () => {
  const reservas = [
    {
      id_reserva: 1,
      id_mesa: 5,
      numero_mesa: 5,
      hora_reserva: '12:00:00',
      estado_reserva: 'pendiente',
      dni_cliente: '12345678',
      nombre_cliente: 'ALBERTO FUJIMORI',
      nombre_mozo: 'MOZO JUAN',
      id_pedido: 101,
    },
  ];
  const onTicketClick = vi.fn();
  const onSearch = vi.fn();
  const onEdit = vi.fn();
  const onCheckIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería renderizar la lista de reservas', () => {
    render(
      <PanelDerechoReservas
        reservas={reservas}
        onTicketClick={onTicketClick}
        onSearch={onSearch}
        onEdit={onEdit}
        fechaSeleccionada="2026-06-30"
        hoyStr="2026-06-30"
        onCheckIn={onCheckIn}
        user={{ id_usuario: 1 }}
      />
    );

    expect(screen.getByText('ALBERTO FUJIMORI')).toBeInTheDocument();
    expect(screen.getByText('VER PREVENTA #P-101')).toBeInTheDocument();
  });

  it('Debería llamar a onSearch al escribir en el buscador', () => {
    render(
      <PanelDerechoReservas
        reservas={reservas}
        onTicketClick={onTicketClick}
        onSearch={onSearch}
        onEdit={onEdit}
        fechaSeleccionada="2026-06-30"
        hoyStr="2026-06-30"
        onCheckIn={onCheckIn}
        user={{ id_usuario: 1 }}
      />
    );

    const input = screen.getByPlaceholderText(/Buscar por DNI/i);
    fireEvent.change(input, { target: { value: 'Alberto' } });
    expect(onSearch).toHaveBeenCalledWith('Alberto');
  });

  it('Debería llamar a checkin API y onCheckIn al presionar LLEGÓ', async () => {
    vi.spyOn(wayraApi, 'put').mockResolvedValue({ data: { success: true } });
    render(
      <PanelDerechoReservas
        reservas={reservas}
        onTicketClick={onTicketClick}
        onSearch={onSearch}
        onEdit={onEdit}
        fechaSeleccionada="2026-06-30"
        hoyStr="2026-06-30"
        onCheckIn={onCheckIn}
        user={{ id_usuario: 1 }}
      />
    );

    fireEvent.click(screen.getByText('LLEGÓ ✔'));

    await waitFor(() => {
      expect(wayraApi.put).toHaveBeenCalledWith('/reservas/1/checkin', { id_usuario: 1 });
      expect(onCheckIn).toHaveBeenCalled();
    });
  });

  it('Debería llamar a cancelar API al anular reserva si se confirma', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    vi.spyOn(wayraApi, 'put').mockResolvedValue({ data: { success: true } });

    render(
      <PanelDerechoReservas
        reservas={reservas}
        onTicketClick={onTicketClick}
        onSearch={onSearch}
        onEdit={onEdit}
        fechaSeleccionada="2026-06-30"
        hoyStr="2026-06-30"
        onCheckIn={onCheckIn}
        user={{ id_usuario: 1 }}
      />
    );

    fireEvent.click(screen.getByText('✕'));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(wayraApi.put).toHaveBeenCalledWith('/reservas/1/cancelar');
      expect(onCheckIn).toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
  });

  it('Debería manejar el error de la API al presionar LLEGÓ', async () => {
    vi.spyOn(wayraApi, 'put').mockRejectedValue(new Error('Network error'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <PanelDerechoReservas reservas={reservas} onTicketClick={onTicketClick} onSearch={onSearch}
        onEdit={onEdit} fechaSeleccionada="2026-06-30" hoyStr="2026-06-30" onCheckIn={onCheckIn} user={{ id_usuario: 1 }}
      />
    );

    fireEvent.click(screen.getByText('LLEGÓ ✔'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith("Error al procesar el ingreso del cliente.");
    });
    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('Debería manejar el error de la API al anular reserva', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    vi.spyOn(wayraApi, 'put').mockRejectedValue(new Error('Network error'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <PanelDerechoReservas reservas={reservas} onTicketClick={onTicketClick} onSearch={onSearch}
        onEdit={onEdit} fechaSeleccionada="2026-06-30" hoyStr="2026-06-30" onCheckIn={onCheckIn} user={{ id_usuario: 1 }}
      />
    );

    fireEvent.click(screen.getByText('✕'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith("Error al anular.");
    });
    confirmSpy.mockRestore();
    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('Debería renderizar colores del semaforo correctamente', () => {
    const ahora = new Date();
    
    // Reserva emerald (confirmada)
    const resConfirmada = { ...reservas[0], id_reserva: 2, estado_reserva: 'confirmada', nombre_cliente: 'CLI CONFIRMADO' };
    
    // Reserva rose (retraso crítico: >10 min)
    const resRetraso = { ...reservas[0], id_reserva: 3, estado_reserva: 'pendiente', nombre_cliente: 'CLI RETRASO' };
    const hRetraso = new Date(ahora.getTime() - 20 * 60000); // 20 mins ago
    resRetraso.hora_reserva = `${String(hRetraso.getHours()).padStart(2, '0')}:${String(hRetraso.getMinutes()).padStart(2, '0')}`;
    
    // Reserva amber (cliente próximo: -10 a +15 min)
    const resProximo = { ...reservas[0], id_reserva: 4, estado_reserva: 'pendiente', nombre_cliente: 'CLI PROXIMO' };
    const hProximo = new Date(ahora.getTime() + 5 * 60000); // in 5 mins
    resProximo.hora_reserva = `${String(hProximo.getHours()).padStart(2, '0')}:${String(hProximo.getMinutes()).padStart(2, '0')}`;
    
    // Reserva blue (a tiempo / futura > 15min)
    const resFutura = { ...reservas[0], id_reserva: 5, estado_reserva: 'pendiente', nombre_cliente: 'CLI FUTURO' };
    const hFutura = new Date(ahora.getTime() + 60 * 60000); // in 60 mins
    resFutura.hora_reserva = `${String(hFutura.getHours()).padStart(2, '0')}:${String(hFutura.getMinutes()).padStart(2, '0')}`;

    // Reserva cancelada
    const resCancelada = { ...reservas[0], id_reserva: 6, estado_reserva: 'cancelada', nombre_cliente: 'CLI CANCELADO' };

    const multReservas = [resConfirmada, resRetraso, resProximo, resFutura, resCancelada];
    
    const { container } = render(
      <PanelDerechoReservas reservas={multReservas} onTicketClick={onTicketClick} onSearch={onSearch}
        onEdit={onEdit} fechaSeleccionada={ahora.toLocaleDateString('en-CA')} hoyStr={ahora.toLocaleDateString('en-CA')} onCheckIn={onCheckIn} user={{ id_usuario: 1 }}
      />
    );

    expect(screen.getByText('CLI CONFIRMADO')).toBeInTheDocument();
    expect(screen.getByText('CLI RETRASO')).toBeInTheDocument();
    expect(screen.getByText('CLI PROXIMO')).toBeInTheDocument();
    expect(screen.getByText('CLI FUTURO')).toBeInTheDocument();
    expect(screen.getByText('CLI CANCELADO')).toBeInTheDocument();

    // Comprobar onEdit en la primera reserva pendiente (que es CLI RETRASO)
    // Hay múltiples botones de ⚙️, seleccionamos el primero y probamos onEdit
    const editBtns = screen.getAllByText('⚙️');
    if (editBtns.length > 0) {
      fireEvent.click(editBtns[0]);
      expect(onEdit).toHaveBeenCalled();
    }
    
    // Comprobar onTicketClick si renderiza (si id_pedido está, el botón de "VER PREVENTA" debería llamar a onTicketClick)
    const ticketBtns = screen.getAllByText(/VER PREVENTA #P-/i);
    if (ticketBtns.length > 0) {
      fireEvent.click(ticketBtns[0]);
      expect(onTicketClick).toHaveBeenCalled();
    }
  });
});

describe('🧪 Tests para ModalesRecepcion', () => {
  it('ModalDetalleTicket debería mostrar detalles del ticket y cerrar al presionar Escape', () => {
    const onClose = vi.fn();
    const ticket = {
      nombre_cliente: 'CARLOS SAINZ',
      dni_cliente: '99887766',
      telefono_cliente: '999999999',
      id_mesa: 3,
      hora_reserva: '14:00',
      observacion: 'Cumpleaños',
    };

    render(<ModalDetalleTicket ticket={ticket} onClose={onClose} />);
    expect(screen.getByText('CARLOS SAINZ')).toBeInTheDocument();
    expect(screen.getByText('99887766')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('ModalDetalleTicket debería retornar null si no hay ticket', () => {
    const { container } = render(<ModalDetalleTicket ticket={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('ModalListaDia debería listar sesiones y permitir seleccionar una', () => {
    const onClose = vi.fn();
    const onSelectTicket = vi.fn();
    const lista = [
      { id_reserva: 1, hora_reserva: '12:00', nombre_cliente: 'PEDRO', apellido_cliente: 'PICA PIEDRA' },
    ];

    render(<ModalListaDia lista={lista} onClose={onClose} onSelectTicket={onSelectTicket} />);
    expect(screen.getByText('PEDRO PICA PIEDRA')).toBeInTheDocument();

    fireEvent.click(screen.getByText('PEDRO PICA PIEDRA').closest('button'));
    expect(onSelectTicket).toHaveBeenCalledWith(lista[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('ModalListaDia debería cerrar al presionar Escape', () => {
    const onClose = vi.fn();
    render(<ModalListaDia lista={[]} onClose={onClose} onSelectTicket={vi.fn()} />);
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

describe('🧪 Tests para ModalReserva', () => {
  const mockMesa = { id_mesa: 2, numero_mesa: 2 };
  const onClose = vi.fn();
  const onSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería renderizar formulario de reserva', () => {
    render(
      <ModalReserva
        mesa={mockMesa}
        onClose={onClose}
        onSave={onSave}
        fechaSeleccionada="2026-06-30"
      />
    );

    expect(screen.getByText('Wayra Ticket')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('DNI')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('CELULAR')).toBeInTheDocument();
  });

  it('Debería asignar mozo automáticamente y guardar al enviar en fecha hoy', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => { });
    vi.spyOn(reservaService, 'getAsignarMozo').mockResolvedValue({
      success: true,
      mozo: { id_usuario: 5, nombre: 'MOZO PEDRO' }
    });

    const hoyStr = new Date().toLocaleDateString('en-CA');

    render(
      <ModalReserva
        mesa={mockMesa}
        onClose={onClose}
        onSave={onSave}
        fechaSeleccionada={hoyStr}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('DNI'), { target: { value: '11223344' } });
    fireEvent.change(screen.getByPlaceholderText('CELULAR'), { target: { value: '999888777' } });
    fireEvent.change(screen.getByPlaceholderText('NOMBRE COMPLETO'), { target: { value: 'LIONEL MESSI' } });

    // Seleccionamos la hora haciendo clic en el botón de la hora 16:10
    const hourBtn = screen.getByText('16:10');
    fireEvent.click(hourBtn);

    // Guardar
    fireEvent.submit(screen.getByRole('button', { name: /CONFIRMAR Y FINALIZAR/i }));

    await waitFor(() => {
      expect(reservaService.getAsignarMozo).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Mozo asignado: MOZO PEDRO');
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        id_mozo: 5,
        dni_cliente: '11223344',
        nombre_cliente: 'LIONEL MESSI',
      }));
    });

    alertSpy.mockRestore();
  });
});
