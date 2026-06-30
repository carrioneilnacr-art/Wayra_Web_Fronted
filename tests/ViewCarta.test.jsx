import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ViewCarta } from '../src/views/Admin/ViewCarta';
import { productoService } from '../src/services/productoService';

// Mock de productoService
vi.mock('../src/services/productoService', () => ({
  productoService: {
    getTodos: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
}));

describe('🧪 Tests para ViewCarta', () => {
  const mockProductos = [
    { id_producto: 1, nombre: 'MAKI ACEVICHADO', precio: 30, categoria: 'Makis', estado: 1, tiempo_estimado: 15 },
    { id_producto: 2, nombre: 'CEVICHE CLASICO', precio: 45, categoria: 'Entradas', estado: 0, tiempo_estimado: 10 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería cargar y mostrar la lista de productos', async () => {
    productoService.getTodos.mockResolvedValue(mockProductos);

    render(<ViewCarta />);

    await waitFor(() => {
      expect(productoService.getTodos).toHaveBeenCalled();
    });

    expect(screen.getByText('MAKI ACEVICHADO')).toBeInTheDocument();
    expect(screen.getByText('CEVICHE CLASICO')).toBeInTheDocument();
    expect(screen.getByText('DISPONIBLE')).toBeInTheDocument();
    expect(screen.getByText('AGOTADO')).toBeInTheDocument();
  });

  it('Debería alternar disponibilidad de un producto', async () => {
    productoService.getTodos.mockResolvedValue(mockProductos);
    productoService.update.mockResolvedValue({ success: true });

    render(<ViewCarta />);

    await waitFor(() => {
      expect(screen.getByText('DISPONIBLE')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('DISPONIBLE'));
    expect(productoService.update).toHaveBeenCalledWith(1, { estado: 0 });
  });

  it('Debería poder crear un nuevo producto', async () => {
    productoService.getTodos.mockResolvedValue(mockProductos);
    productoService.create.mockResolvedValue({ success: true });

    const { container } = render(<ViewCarta />);

    await waitFor(() => {
      expect(screen.getByText('+ Agregar Producto')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Agregar Producto'));

    // Completar formulario
    fireEvent.change(container.querySelector('#nuevo-nombre'), { target: { value: 'TIRADITO NIKKEI' } });
    fireEvent.change(container.querySelector('#nuevo-precio'), { target: { value: '38.50' } });
    fireEvent.change(container.querySelector('#nuevo-categoria'), { target: { value: 'Entradas' } });
    fireEvent.change(container.querySelector('#nuevo-tiempo'), { target: { value: '12' } });

    // Guardar
    fireEvent.submit(screen.getByRole('button', { name: 'GUARDAR' }));

    await waitFor(() => {
      expect(productoService.create).toHaveBeenCalledWith({
        nombre: 'TIRADITO NIKKEI',
        precio: '38.50',
        categoria: 'Entradas',
        tiempo_estimado: '12'
      });
    });
  });

  it('Debería poder editar un producto existente', async () => {
    productoService.getTodos.mockResolvedValue(mockProductos);
    productoService.update.mockResolvedValue({ success: true });

    const { container } = render(<ViewCarta />);

    await waitFor(() => {
      expect(screen.getByText('MAKI ACEVICHADO')).toBeInTheDocument();
    });

    // Abrir modal de edición (botón de configuración con svg en la tarjeta)
    const settingsBtn = container.querySelector('button[onClick*="setModalEditar"]'); // o el segundo botón
    // El botón tiene el svg de tuerca, busquemos todos los botones y seleccionamos el de configuración
    const buttons = screen.getAllByRole('button');
    const editBtn = buttons.find(b => b.className.includes('bg-slate-50'));
    fireEvent.click(editBtn);

    // Modificar datos
    fireEvent.change(container.querySelector('#editar-nombre'), { target: { value: 'MAKI ACEVICHADO PREMIUM' } });
    fireEvent.change(container.querySelector('#editar-precio'), { target: { value: '35.00' } });

    // Guardar cambios
    fireEvent.submit(screen.getByRole('button', { name: 'ACTUALIZAR' }));

    await waitFor(() => {
      expect(productoService.update).toHaveBeenCalledWith(1, {
        nombre: 'MAKI ACEVICHADO PREMIUM',
        precio: '35.00',
        categoria: 'Makis',
        tiempo_estimado: 15
      });
    });
  });

  it('Debería cerrar el formulario de creación al presionar Cancelar', async () => {
    productoService.getTodos.mockResolvedValue(mockProductos);
    render(<ViewCarta />);

    await waitFor(() => {
      expect(screen.getByText('+ Agregar Producto')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Agregar Producto'));
    expect(screen.getByText('Nuevo Producto')).toBeInTheDocument();

    fireEvent.click(screen.getByText('CANCELAR'));
    expect(screen.queryByText('Nuevo Producto')).not.toBeInTheDocument();
  });

  it('Debería cerrar el formulario de edición al presionar Cancelar', async () => {
    productoService.getTodos.mockResolvedValue(mockProductos);
    const { container } = render(<ViewCarta />);

    await waitFor(() => {
      expect(screen.getByText('MAKI ACEVICHADO')).toBeInTheDocument();
    });

    const editBtn = screen.getAllByRole('button').find(b => b.className.includes('bg-slate-50'));
    fireEvent.click(editBtn);
    expect(screen.getByText('Editar Producto')).toBeInTheDocument();

    // Cambiar la categoría y el tiempo estimado para cubrir esas líneas
    fireEvent.change(container.querySelector('#editar-categoria'), { target: { value: 'Entradas' } });
    fireEvent.change(container.querySelector('#editar-tiempo'), { target: { value: '25' } });

    fireEvent.click(screen.getByText('CANCELAR'));
    expect(screen.queryByText('Editar Producto')).not.toBeInTheDocument();
  });

  it('Debería alertar y registrar errores al fallar actualizar estado', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => { });
    productoService.getTodos.mockResolvedValue(mockProductos);
    productoService.update.mockRejectedValue(new Error('Update State Error'));

    render(<ViewCarta />);

    await waitFor(() => {
      expect(screen.getByText('DISPONIBLE')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('DISPONIBLE'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Error al actualizar el estado del producto.');
    });

    errorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('Debería alertar y registrar errores al fallar guardar plato nuevo', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => { });
    productoService.getTodos.mockResolvedValue(mockProductos);
    productoService.create.mockRejectedValue(new Error('Create Error'));

    const { container } = render(<ViewCarta />);

    await waitFor(() => {
      expect(screen.getByText('+ Agregar Producto')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Agregar Producto'));
    fireEvent.change(container.querySelector('#nuevo-nombre'), { target: { value: 'TIRADITO' } });
    fireEvent.change(container.querySelector('#nuevo-precio'), { target: { value: '38' } });
    fireEvent.change(container.querySelector('#nuevo-tiempo'), { target: { value: '10' } });
    fireEvent.submit(screen.getByRole('button', { name: 'GUARDAR' }));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Error al guardar el plato.');
    });

    errorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('Debería alertar y registrar errores al fallar actualización completa', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => { });
    productoService.getTodos.mockResolvedValue(mockProductos);
    productoService.update.mockRejectedValue(new Error('Update Full Error'));

    const { container } = render(<ViewCarta />);

    await waitFor(() => {
      expect(screen.getByText('MAKI ACEVICHADO')).toBeInTheDocument();
    });

    const editBtn = screen.getAllByRole('button').find(b => b.className.includes('bg-slate-50'));
    fireEvent.click(editBtn);

    fireEvent.submit(screen.getByRole('button', { name: 'ACTUALIZAR' }));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Error al actualizar los datos del plato.');
    });

    errorSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
