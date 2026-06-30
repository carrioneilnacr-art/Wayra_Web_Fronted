import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AdminLayout } from '../src/layouts/AdminLayout';
import { MozoLayout } from '../src/layouts/MozoLayout';
import { RecepcionLayout } from '../src/layouts/RecepcionLayout';

describe('🧪 Tests para AdminLayout', () => {
  const setSeccion = vi.fn();
  const onLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería renderizar sidebar con opciones y el contenido', () => {
    render(
      <AdminLayout seccion="stats" setSeccion={setSeccion} onLogout={onLogout} user={{ rol: 'admin' }}>
        <div data-testid="child">Contenido Admin</div>
      </AdminLayout>
    );

    expect(screen.getByText('Contenido Admin')).toBeInTheDocument();
    expect(screen.getByText('Gestión Carta')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Historial')).toBeInTheDocument();
  });

  it('Debería llamar a setSeccion al hacer clic en las opciones del menú', () => {
    render(
      <AdminLayout seccion="stats" setSeccion={setSeccion} onLogout={onLogout} user={{ rol: 'admin' }}>
        <div>Contenido</div>
      </AdminLayout>
    );

    fireEvent.click(screen.getByText('Gestión Carta'));
    expect(setSeccion).toHaveBeenCalledWith('carta');
  });

  it('Debería abrir y cerrar el menú móvil al presionar el botón hamburguesa', () => {
    render(
      <AdminLayout seccion="stats" setSeccion={setSeccion} onLogout={onLogout} user={{ rol: 'admin' }}>
        <div>Contenido</div>
      </AdminLayout>
    );

    // Botón hamburguesa (botón sin texto, buscamos por tag button)
    const buttons = screen.getAllByRole('button');
    const burgerBtn = buttons[0]; // primer botón es hamburguesa móvil

    fireEvent.click(burgerBtn);
    // Debe renderizar el blur overlay
    const overlay = screen.getByLabelText('Cerrar menú');
    expect(overlay).toBeInTheDocument();

    // Hacemos clic en el overlay para cerrarlo
    fireEvent.click(overlay);
    expect(screen.queryByLabelText('Cerrar menú')).not.toBeInTheDocument();
  });
});

describe('🧪 Tests para MozoLayout', () => {
  it('Debería renderizar panel izquierdo y panel derecho', () => {
    render(
      <MozoLayout
        panelIzquierdo={<div data-testid="izq">Izquierdo</div>}
        panelDerecho={<div data-testid="der">Derecho</div>}
      />
    );

    expect(screen.getByTestId('izq').textContent).toBe('Izquierdo');
    expect(screen.getByTestId('der').textContent).toBe('Derecho');
  });
});

describe('🧪 Tests para RecepcionLayout', () => {
  it('Debería renderizar contenido principal y panel derecho', () => {
    render(
      <RecepcionLayout panelDerecho={<div data-testid="der-rec">Derecho Rec</div>}>
        <div data-testid="main-rec">Main Rec</div>
      </RecepcionLayout>
    );

    expect(screen.getByTestId('main-rec').textContent).toBe('Main Rec');
    expect(screen.getByTestId('der-rec').textContent).toBe('Derecho Rec');
  });
});
