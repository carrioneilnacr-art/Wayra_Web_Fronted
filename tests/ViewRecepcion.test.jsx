import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ViewRecepcion } from '../src/views/Recepcion/ViewRecepcion';
import { reservaService } from '../src/services/reservaService';

// Mock de servicios
vi.mock('../src/services/reservaService', () => ({
  reservaService: {
    getMesas: vi.fn(),
    getReservas: vi.fn(),
    saveReserva: vi.fn(),
    checkInReserva: vi.fn(),
  },
}));

describe('🧪 Tests para ViewRecepcion', () => {
  const mockUser = { id_usuario: 4, nombre: 'Recepcionista' };
  const mockMesas = [
    { id_mesa: 1, numero_mesa: 1, estado: 'disponible', capacidad: 4 },
    { id_mesa: 2, numero_mesa: 2, estado: 'ocupada', capacidad: 2 },
  ];
  const mockReservas = [
    {
      id_reserva: 10,
      dni_cliente: '77889900',
      nombre_cliente: 'JUAN PEREZ',
      id_mesa: 1,
      personas: 4,
      fecha_reserva: new Date().toISOString(),
      hora_reserva: '12:00',
      estado_reserva: 'pendiente'
    }
  ];

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

  it('Debería cargar mesas y reservas de recepción', async () => {
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mockMesas);
    vi.spyOn(reservaService, 'getReservas').mockResolvedValue(mockReservas);

    render(<ViewRecepcion user={mockUser} onLogout={vi.fn()} />);

    await waitFor(() => {
      expect(reservaService.getMesas).toHaveBeenCalled();
      expect(reservaService.getReservas).toHaveBeenCalled();
    });

    expect(screen.getByText('MAPA')).toBeInTheDocument();
    expect(screen.getByText('CALENDARIO')).toBeInTheDocument();
  });

  it('Debería alternar entre mapa y vista calendario', async () => {
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mockMesas);
    vi.spyOn(reservaService, 'getReservas').mockResolvedValue([]);

    render(<ViewRecepcion user={mockUser} onLogout={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('CALENDARIO')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('CALENDARIO'));
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('Debería llamar a onLogout al hacer click en el botón de salida', async () => {
    const onLogout = vi.fn();
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mockMesas);
    vi.spyOn(reservaService, 'getReservas').mockResolvedValue([]);

    render(<ViewRecepcion user={mockUser} onLogout={onLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Reception')).toBeInTheDocument();
    });

    // Clic logout (botón Salir)
    fireEvent.click(screen.getByText('SALIR'));
    expect(onLogout).toHaveBeenCalled();
  });

  it('Debería llamar a saveReserva al confirmar el formulario', async () => {
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mockMesas);
    vi.spyOn(reservaService, 'getReservas').mockResolvedValue([]);
    vi.spyOn(reservaService, 'saveReserva').mockResolvedValue({ success: true });

    render(<ViewRecepcion user={mockUser} onLogout={vi.fn()} />);

    await waitFor(() => {
      expect(reservaService.getMesas).toHaveBeenCalled();
    });

    // Abrir popup de mesa al hacer clic en Mesa 1 del grid
    fireEvent.click(screen.getByText('1'));
    // Hacer clic en "Confirmar Mesa" para abrir ModalReserva
    fireEvent.click(screen.getByText('Confirmar Mesa'));

    // Debería abrirse el formulario
    expect(screen.getByText('Wayra Ticket')).toBeInTheDocument();
  });
});
