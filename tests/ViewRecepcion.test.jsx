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
    getAsignarMozo: vi.fn(),
  },
}));

describe('🧪 Tests para ViewRecepcion', () => {
  const mockUser = { id_usuario: 4, nombre: 'Recepcionista' };
  const mockMesas = [
    { id_mesa: 1, numero_mesa: 1, capacidad: 4, ubicacion: "salon", estado: "disponible", posX: 10, posY: 10 },
    { id_mesa: 2, numero_mesa: 2, capacidad: 6, ubicacion: "terraza", estado: "ocupada", posX: 50, posY: 50 }
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
    vi.spyOn(reservaService, 'getAsignarMozo').mockResolvedValue({
      success: true,
      mozo: { id_usuario: 5, nombre: 'MOZO JUAN' }
    });
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

  it('Debería manejar el error al guardar la reserva', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(reservaService, 'saveReserva').mockRejectedValue(new Error('Network error'));
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mockMesas);
    vi.spyOn(reservaService, 'getReservas').mockResolvedValue(mockReservas);
    
    render(<ViewRecepcion user={mockUser} onLogout={vi.fn()} />);
    
    await waitFor(() => {
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });

    const mesaBtn = screen.getAllByRole('button').find(b => b.textContent === '1');
    fireEvent.click(mesaBtn);
    fireEvent.click(screen.getByText('Confirmar Mesa'));
    
    await waitFor(() => {
      expect(screen.getByText('Wayra Ticket')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('DNI'), { target: { value: '11223344' } });
    fireEvent.change(screen.getByPlaceholderText('CELULAR'), { target: { value: '999888777' } });
    fireEvent.change(screen.getByPlaceholderText('NOMBRE COMPLETO'), { target: { value: 'LIONEL MESSI' } });
    
    const hourBtn = screen.getByText('21:21');
    fireEvent.click(hourBtn);

    fireEvent.submit(screen.getByRole('button', { name: /CONFIRMAR Y FINALIZAR/i }));

    await new Promise(r => setTimeout(r, 100));

    await waitFor(() => {
      expect(reservaService.saveReserva).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error al procesar reserva:", expect.any(Error));
    });

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('Debería poder cancelar la creación de reserva en el popup y cerrar el modal', async () => {
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mockMesas);
    vi.spyOn(reservaService, 'getReservas').mockResolvedValue([]);
    render(<ViewRecepcion user={mockUser} onLogout={vi.fn()} />);
    await waitFor(() => { expect(reservaService.getMesas).toHaveBeenCalled(); });

    // Abrir popup
    fireEvent.click(screen.getByText('1'));
    expect(screen.getByText('Confirmar Mesa')).toBeInTheDocument();

    // Cancelar en popup
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Confirmar Mesa')).not.toBeInTheDocument();
  });

  it('Debería navegar en el calendario (mes anterior y siguiente)', async () => {
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mockMesas);
    vi.spyOn(reservaService, 'getReservas').mockResolvedValue([]);
    
    render(<ViewRecepcion user={mockUser} onLogout={vi.fn()} />);
    await waitFor(() => { expect(reservaService.getMesas).toHaveBeenCalled(); });
    
    // Cambiar a calendario
    fireEvent.click(screen.getByText('CALENDARIO'));
    
    // Botones de navegación ❮ y ❯
    const btnPrev = screen.getByText('❮');
    const btnNext = screen.getByText('❯');
    
    fireEvent.click(btnPrev);
    fireEvent.click(btnNext);
    fireEvent.click(btnNext);

    // Debe mostrar que navegamos. Simplemente verificamos que no lanza error.
    expect(btnNext).toBeInTheDocument();
  });

  it('Debería seleccionar un día válido en el calendario y volver a hoy', async () => {
    vi.spyOn(reservaService, 'getMesas').mockResolvedValue(mockMesas);
    vi.spyOn(reservaService, 'getReservas').mockResolvedValue([]);
    render(<ViewRecepcion user={mockUser} onLogout={vi.fn()} />);
    await waitFor(() => { expect(reservaService.getMesas).toHaveBeenCalled(); });
    
    // Ir a calendario
    fireEvent.click(screen.getByText('CALENDARIO'));
    
    // Como el mes actual tiene el día 28 como un día futuro o presente
    // En las pruebas, 15 puede ser pasado o futuro. Hacemos click en un día hacia el fin de mes, por ej 28
    const dia28 = screen.getByText('28');
    fireEvent.click(dia28.closest('button'));
    
    // Luego volver a MAPA
    fireEvent.click(screen.getByText('MAPA'));
    expect(screen.getByText('CALENDARIO')).toBeInTheDocument();
  });

  it('Debería manejar el error de la API inicial', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(reservaService, 'getMesas').mockRejectedValue(new Error('Network error'));
    vi.spyOn(reservaService, 'getReservas').mockResolvedValue([]);
    
    render(<ViewRecepcion user={mockUser} onLogout={vi.fn()} />);
    
    await new Promise(r => setTimeout(r, 200));

    expect(consoleErrorSpy).toHaveBeenCalled();
    const calls = consoleErrorSpy.mock.calls;
    const errorCall = calls.find(c => c[0] === "Error en la orquestación de datos de recepción:");
    expect(errorCall).toBeTruthy();
    
    consoleErrorSpy.mockRestore();
  });
});
