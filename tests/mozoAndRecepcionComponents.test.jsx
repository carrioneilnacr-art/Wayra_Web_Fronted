import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import CardMesaMozo from '../src/components/Mozo/CardMesaMozo';
import { ReporteTurnos } from '../src/components/Recepcion/ReporteTurnos';
import { GridMesas } from '../src/components/Recepcion/GridMesas';
import ModalBoleta from '../src/Modals/ModalBoleta/ModalBoleta';
import { pedidoService } from '../src/services/pedidoService';

// Mock de pedidoService
vi.mock('../src/services/pedidoService', () => ({
  pedidoService: {
    getHistorial: vi.fn(),
  },
}));

describe('🧪 Tests para CardMesaMozo', () => {
  const mockMesa = {
    id_mesa: 5,
    numero_mesa: 5,
    estado: 'ocupada',
    capacidad: 4,
  };
  const onClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería renderizar la mesa en estado ocupada', () => {
    render(<CardMesaMozo mesa={mockMesa} isSelected={false} onClick={onClick} />);
    expect(screen.getByText('Uso')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('Debería renderizar la mesa en estado reservada', () => {
    const reservadaMesa = { ...mockMesa, estado: 'reservada' };
    render(<CardMesaMozo mesa={reservadaMesa} isSelected={false} onClick={onClick} />);
    expect(screen.getByText('Reserva')).toBeInTheDocument();
  });

  it('Debería renderizar la mesa en estado libre', () => {
    const libreMesa = { ...mockMesa, estado: 'libre' };
    render(<CardMesaMozo mesa={libreMesa} isSelected={false} onClick={onClick} />);
    expect(screen.getByText('Libre')).toBeInTheDocument();
  });

  it('Debería invocar onClick al hacer clic', () => {
    render(<CardMesaMozo mesa={mockMesa} isSelected={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('🧪 Tests para ReporteTurnos', () => {
  const reservas = [
    { hora_reserva: '12:30:00', estado_reserva: 'confirmada' },
    { hora_reserva: '12:45:00', estado_reserva: 'confirmada' },
    { hora_reserva: '14:15:00', estado_reserva: 'confirmada' },
    { hora_reserva: '19:00:00', estado_reserva: 'cancelada' }, // cancelada no cuenta
  ];

  it('Debería calcular y renderizar estadísticas de turnos', () => {
    render(<ReporteTurnos reservas={reservas} totalMesas={10} />);

    // Turno almuerzo 1 (12:00) debería tener 2 reservas activas
    expect(screen.getByText('2')).toBeInTheDocument();
    // Turno almuerzo 2 (14:00) debería tener 1 reserva activa
    expect(screen.getByText('1')).toBeInTheDocument();
    // Turno cena 1 (19:00) debería tener 0 reservas activas (1 cancelada)
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });
});

describe('🧪 Tests para GridMesas', () => {
  const mesas = [
    { id_mesa: 1, numero_mesa: 1, estado: 'ocupada', hora_ocupada: new Date(Date.now() - 30 * 60000).toISOString() },
    { id_mesa: 2, numero_mesa: 2, estado: 'libre', hora_ocupada: null },
  ];
  const onMesaClick = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Debería renderizar las mesas en el mapa', () => {
    render(<GridMesas mesas={mesas} onMesaClick={onMesaClick} mesaSeleccionada={null} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    // Debe mostrar los minutos de ocupación
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('Debería invocar onMesaClick al hacer clic en una mesa', () => {
    render(<GridMesas mesas={mesas} onMesaClick={onMesaClick} mesaSeleccionada={null} />);
    fireEvent.click(screen.getByText('2').closest('button'));
    expect(onMesaClick).toHaveBeenCalledWith(mesas[1]);
  });
});

describe('🧪 Tests para ModalBoleta', () => {
  const mockBoletaData = {
    pedido: {
      id_pedido: 45,
      nombre_cliente: 'JUAN PEREZ',
      dni_cliente: '77665544',
      fecha_pedido: '2026-06-30T10:00:00Z',
      total: 75.50,
    },
    items: [
      { producto: 'MAKI ACEVICHADO', cantidad: 2, subtotal: 50.00 },
      { producto: 'INCA KOLA', cantidad: 1, subtotal: 25.50 },
    ],
  };
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería mostrar pantalla de carga inicialmente', () => {
    vi.spyOn(pedidoService, 'getHistorial').mockReturnValue(new Promise(() => { }));
    render(<ModalBoleta idPedido={45} onClose={onClose} />);
    expect(screen.getByText('Generando Documento...')).toBeInTheDocument();
  });

  it('Debería renderizar la boleta después de cargar la data', async () => {
    vi.spyOn(pedidoService, 'getHistorial').mockResolvedValue(mockBoletaData);
    render(<ModalBoleta idPedido={45} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('JUAN PEREZ')).toBeInTheDocument();
    });

    expect(screen.getByText('#0045')).toBeInTheDocument();
    expect(screen.getByText('77665544')).toBeInTheDocument();
    expect(screen.getByText('MAKI ACEVICHADO')).toBeInTheDocument();
    expect(screen.getByText('S/ 75.50')).toBeInTheDocument();
  });

  it('Debería invocar onClose al presionar Cerrar', async () => {
    vi.spyOn(pedidoService, 'getHistorial').mockResolvedValue(mockBoletaData);
    render(<ModalBoleta idPedido={45} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('✕ Cerrar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('✕ Cerrar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('Debería invocar globalThis.print al presionar Imprimir', async () => {
    const printSpy = vi.spyOn(globalThis, 'print').mockImplementation(() => { });
    vi.spyOn(pedidoService, 'getHistorial').mockResolvedValue(mockBoletaData);
    render(<ModalBoleta idPedido={45} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('🖨️ Imprimir')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🖨️ Imprimir'));
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
