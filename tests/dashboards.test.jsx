import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import DashboardAdmin from '../src/pages/DashboardAdmin';
import DashboardMozo from '../src/pages/DashboardMozo';
import DashboardRecepcion from '../src/pages/DashboardRecepcion';

// Mock de las vistas hijas para aislar las pruebas de los contenedores Dashboard
vi.mock('../src/views/Admin/ViewStats', () => ({
  ViewStats: () => <div data-testid="view-stats">Mocked ViewStats</div>
}));
vi.mock('../src/views/Admin/ViewCarta', () => ({
  ViewCarta: () => <div data-testid="view-carta">Mocked ViewCarta</div>
}));
vi.mock('../src/views/Admin/ViewUsuarios', () => ({
  ViewUsuarios: () => <div data-testid="view-usuarios">Mocked ViewUsuarios</div>
}));
vi.mock('../src/views/Admin/ViewHistorial', () => ({
  ViewHistorial: () => <div data-testid="view-historial">Mocked ViewHistorial</div>
}));
vi.mock('../src/views/Mozo/ViewMesasMozo', () => ({
  ViewMesasMozo: ({ user, onLogout }) => (
    <div data-testid="view-mesas-mozo">
      Mocked ViewMesasMozo - Mozo: {user?.nombre}
      <button onClick={onLogout}>Cerrar Sesión Mozo</button>
    </div>
  )
}));
vi.mock('../src/views/Recepcion/ViewRecepcion', () => ({
  ViewRecepcion: ({ user, onLogout }) => (
    <div data-testid="view-recepcion">
      Mocked ViewRecepcion - Recepcionista: {user?.nombre}
      <button onClick={onLogout}>Cerrar Sesión Recepcion</button>
    </div>
  )
}));

describe('🧪 Tests para DashboardAdmin', () => {
  const mockUser = { id_usuario: 1, nombre: 'Admin Master' };
  const onLogout = vi.fn();

  it('Debería renderizar la sección inicial de estadísticas', () => {
    render(<DashboardAdmin user={mockUser} onLogout={onLogout} />);
    expect(screen.getByTestId('view-stats')).toBeInTheDocument();
  });

  it('Debería cambiar de vista al interactuar con el menú lateral', () => {
    render(<DashboardAdmin user={mockUser} onLogout={onLogout} />);

    // Click en menú Carta
    fireEvent.click(screen.getByRole('button', { name: /carta/i }));
    expect(screen.getByTestId('view-carta')).toBeInTheDocument();

    // Click en menú Historial
    fireEvent.click(screen.getByRole('button', { name: /historial/i }));
    expect(screen.getByTestId('view-historial')).toBeInTheDocument();

    // Click en menú Usuarios
    fireEvent.click(screen.getByRole('button', { name: /usuarios/i }));
    expect(screen.getByTestId('view-usuarios')).toBeInTheDocument();
  });
});

describe('🧪 Tests para DashboardMozo', () => {
  const mockUser = { id_usuario: 5, nombre: 'Juan Mozo' };
  const onLogout = vi.fn();

  it('Debería renderizar la vista de mesas de mozo y permitir logout', () => {
    render(<DashboardMozo user={mockUser} onLogout={onLogout} />);

    expect(screen.getByTestId('view-mesas-mozo')).toBeInTheDocument();
    expect(screen.getByText(/Juan Mozo/i)).toBeInTheDocument();

    // Disparar logout
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión Mozo/i }));
    expect(onLogout).toHaveBeenCalled();
  });
});

describe('🧪 Tests para DashboardRecepcion', () => {
  const mockUser = { id_usuario: 6, nombre: 'Maria Recepción' };
  const onLogout = vi.fn();

  it('Debería renderizar la vista de recepción y permitir logout', () => {
    render(<DashboardRecepcion user={mockUser} onLogout={onLogout} />);

    expect(screen.getByTestId('view-recepcion')).toBeInTheDocument();
    expect(screen.getByText(/Maria Recepción/i)).toBeInTheDocument();

    // Disparar logout
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión Recepcion/i }));
    expect(onLogout).toHaveBeenCalled();
  });
});
