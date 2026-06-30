import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AccessibilityWidget } from '../src/components/ui/AccessibilityWidget';
import { CardProducto } from '../src/components/ui/CardProducto';
import { ScrollCategorias } from '../src/components/ui/ScrollCategorias';
import { TableResponsiva } from '../src/components/ui/TableResponsiva';
import { AccessibilityContext } from '../src/context/AccessibilityContext';

describe('🧪 Tests para AccessibilityWidget', () => {
  const mockContext = {
    fontSize: 16,
    setFontSize: vi.fn(),
    isDarkMode: false,
    setIsDarkMode: vi.fn(),
    colorBlindMode: 'none',
    setColorBlindMode: vi.fn(),
    resetAccessibility: vi.fn()
  };

  it('Debería renderizar solo el botón flotante inicialmente', () => {
    render(
      <AccessibilityContext.Provider value={mockContext}>
        <AccessibilityWidget />
      </AccessibilityContext.Provider>
    );

    // Botón flotante
    expect(screen.getByLabelText('Menú de accesibilidad')).toBeInTheDocument();
    // El panel de accesibilidad no debe estar presente
    expect(screen.queryByText('Filtros Visuales')).not.toBeInTheDocument();
  });

  it('Debería abrir y cerrar el menú desplegable al hacer clic en el botón flotante', () => {
    render(
      <AccessibilityContext.Provider value={mockContext}>
        <AccessibilityWidget />
      </AccessibilityContext.Provider>
    );

    const mainBtn = screen.getByLabelText('Menú de accesibilidad');
    fireEvent.click(mainBtn);

    // Ahora el panel está visible
    expect(screen.getByText('Accesibilidad')).toBeInTheDocument();
    expect(screen.getByText('Filtros Visuales')).toBeInTheDocument();

    // Hacemos clic otra vez
    fireEvent.click(mainBtn);
    expect(screen.queryByText('Accesibilidad')).not.toBeInTheDocument();
  });

  it('Debería invocar las funciones del contexto al interactuar', () => {
    render(
      <AccessibilityContext.Provider value={mockContext}>
        <AccessibilityWidget />
      </AccessibilityContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('Menú de accesibilidad'));

    // Cambiar a modo oscuro
    fireEvent.click(screen.getByText('Modo Oscuro'));
    expect(mockContext.setIsDarkMode).toHaveBeenCalledWith(true);

    // Cambiar tamaño de letra
    const slider = screen.getByRole('slider', { name: /tamaño de pantalla/i });
    fireEvent.change(slider, { target: { value: '20' } });
    expect(mockContext.setFontSize).toHaveBeenCalledWith(20);

    // Cambiar daltonismo
    const select = screen.getByRole('combobox', { name: /filtros visuales/i });
    fireEvent.change(select, { target: { value: 'protanopia' } });
    expect(mockContext.setColorBlindMode).toHaveBeenCalledWith('protanopia');

    // Restablecer
    fireEvent.click(screen.getByText('Restablecer Configuración'));
    expect(mockContext.resetAccessibility).toHaveBeenCalled();
  });
});

describe('🧪 Tests para CardProducto', () => {
  const mockProducto = {
    nombre: 'ACEVICHADO MAKI',
    precio: 28.00,
    categoria: 'Makis',
    estado: 1
  };

  it('Debería renderizar la información del producto', () => {
    render(<CardProducto producto={mockProducto} />);

    expect(screen.getByText('ACEVICHADO MAKI')).toBeInTheDocument();
    expect(screen.getByText('Makis')).toBeInTheDocument();
    expect(screen.getByText('S/ 28.00')).toBeInTheDocument();
  });

  it('Debería invocar onAction cuando el producto está disponible y se presiona el botón', () => {
    const handleAction = vi.fn();
    render(<CardProducto producto={mockProducto} onAction={handleAction} actionLabel="Agregar" />);

    const btn = screen.getByText('Agregar');
    fireEvent.click(btn);
    expect(handleAction).toHaveBeenCalledWith(mockProducto);
  });

  it('Debería renderizar AGOTADO si el producto no está disponible', () => {
    const agotadoProducto = { ...mockProducto, estado: 0 };
    render(<CardProducto producto={agotadoProducto} showStock={true} />);

    expect(screen.getByText('AGOTADO')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('🧪 Tests para ScrollCategorias', () => {
  const categorias = ['ENTRADAS', 'MAKIS', 'FONDOS'];

  it('Debería renderizar la lista de categorías', () => {
    render(<ScrollCategorias categorias={categorias} categoriaActiva="MAKIS" onSelect={() => { }} />);

    expect(screen.getByText('ENTRADAS')).toBeInTheDocument();
    expect(screen.getByText('MAKIS')).toBeInTheDocument();
    expect(screen.getByText('FONDOS')).toBeInTheDocument();
  });

  it('Debería destacar el botón activo', () => {
    render(<ScrollCategorias categorias={categorias} categoriaActiva="MAKIS" onSelect={() => { }} />);

    const activeBtn = screen.getByText('MAKIS');
    expect(activeBtn.className).toContain('bg-slate-900');
  });

  it('Debería invocar onSelect al hacer clic en una categoría', () => {
    const onSelect = vi.fn();
    render(<ScrollCategorias categorias={categorias} categoriaActiva="MAKIS" onSelect={onSelect} />);

    fireEvent.click(screen.getByText('FONDOS'));
    expect(onSelect).toHaveBeenCalledWith('FONDOS');
  });
});

describe('🧪 Tests para TableResponsiva', () => {
  const columnas = ['ID', 'Nombre', 'Precio'];
  const datos = [
    { id: 1, nombre: 'Plato A', precio: 10.0 },
    { id: 2, nombre: 'Plato B', precio: 15.0 }
  ];
  const renderFila = (item) => (
    <>
      <td>{item.id}</td>
      <td>{item.nombre}</td>
      <td>{item.precio}</td>
    </>
  );

  it('Debería renderizar mensaje de vacío si no hay datos', () => {
    render(<TableResponsiva columnas={columnas} datos={[]} renderFila={renderFila} />);

    expect(screen.getByText('No se encontraron registros en el sistema')).toBeInTheDocument();
  });

  it('Debería renderizar cabeceras y filas con datos', () => {
    render(<TableResponsiva columnas={columnas} datos={datos} renderFila={renderFila} />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Plato A')).toBeInTheDocument();
    expect(screen.getByText('Plato B')).toBeInTheDocument();
  });
});
