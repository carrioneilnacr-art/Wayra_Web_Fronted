import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ViewUsuarios } from '../src/views/Admin/ViewUsuarios';
import { authService } from '../src/services/authService';

// Mock de authService
vi.mock('../src/services/authService', () => ({
  authService: {
    getUsuarios: vi.fn(),
    createUsuario: vi.fn(),
    updateUsuario: vi.fn(),
    deleteUsuario: vi.fn(),
  },
}));

describe('🧪 Tests para ViewUsuarios', () => {
  const mockUsuarios = [
    { id_usuario: 1, nombre: 'CARLOS PEREZ', usuario: 'carlos1', rol: 'mozo', estado_sesion: 'activo', mesas_asignadas: 2, ultima_accion: 'Comanda Mesa 2' },
    { id_usuario: 2, nombre: 'MARIA GOMEZ', usuario: 'maria2', rol: 'recepcionista', estado_sesion: 'break', checkins_hoy: 5, ultima_accion: 'Check-In' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería cargar y mostrar la lista de usuarios con sus roles y estados', async () => {
    authService.getUsuarios.mockResolvedValue(mockUsuarios);

    render(<ViewUsuarios />);

    await waitFor(() => {
      expect(authService.getUsuarios).toHaveBeenCalled();
    });

    expect(screen.getByText('CARLOS PEREZ')).toBeInTheDocument();
    expect(screen.getByText('MARIA GOMEZ')).toBeInTheDocument();
    expect(screen.getByText('2 Mesas Activas')).toBeInTheDocument();
    expect(screen.getByText('5 Check-Ins Hoy')).toBeInTheDocument();
  });

  it('Debería poder crear un nuevo perfil de staff', async () => {
    authService.getUsuarios.mockResolvedValue(mockUsuarios);
    authService.createUsuario.mockResolvedValue({ success: true });

    render(<ViewUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('+ Registrar Personal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Registrar Personal'));

    // Rellenar formulario
    fireEvent.change(screen.getByPlaceholderText('NOMBRE COMPLETO'), { target: { value: 'PEDRO LUNA' } });
    fireEvent.change(screen.getByPlaceholderText('USUARIO DE ACCESO'), { target: { value: 'pedro3' } });
    fireEvent.change(screen.getByPlaceholderText('CONTRASEÑA'), { target: { value: 'pass123' } });

    // Guardar
    fireEvent.submit(screen.getByRole('button', { name: 'GUARDAR' }));

    await waitFor(() => {
      expect(authService.createUsuario).toHaveBeenCalledWith({
        nombre: 'PEDRO LUNA',
        usuario: 'pedro3',
        password: 'pass123',
        rol: 'mozo'
      });
    });
  });

  it('Debería poder editar un usuario existente', async () => {
    authService.getUsuarios.mockResolvedValue(mockUsuarios);
    authService.updateUsuario.mockResolvedValue({ success: true });

    const { container } = render(<ViewUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('CARLOS PEREZ')).toBeInTheDocument();
    });

    // Clic en editar (primer botón de icono de lápiz)
    const editButtons = screen.getAllByRole('button');
    // Buscamos el botón de editar que es el que contiene el svg
    const editCarlosBtn = editButtons.find(b => b.innerHTML.includes('M15.232 5.232l3.536 3.536'));
    fireEvent.click(editCarlosBtn);

    // Modificar nombre
    fireEvent.change(container.querySelector('#editar-staff-nombre'), { target: { value: 'CARLOS PEREZ JR' } });

    // Actualizar
    fireEvent.submit(screen.getByRole('button', { name: 'ACTUALIZAR' }));

    await waitFor(() => {
      expect(authService.updateUsuario).toHaveBeenCalledWith(1, expect.objectContaining({
        nombre: 'CARLOS PEREZ JR',
        usuario: 'carlos1',
        rol: 'mozo'
      }));
    });
  });

  it('Debería eliminar un usuario tras confirmación', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    authService.getUsuarios.mockResolvedValue(mockUsuarios);
    authService.deleteUsuario.mockResolvedValue({ success: true });

    render(<ViewUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('CARLOS PEREZ')).toBeInTheDocument();
    });

    // Clic en eliminar (primer botón de icono de tacho)
    const buttons = screen.getAllByRole('button');
    const deleteCarlosBtn = buttons.find(b => b.innerHTML.includes('M19 7l-.867 12.142A2 2 0 0116.138 21'));
    fireEvent.click(deleteCarlosBtn);

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(authService.deleteUsuario).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });

  it('Debería cerrar el formulario de creación al presionar Cancelar', async () => {
    authService.getUsuarios.mockResolvedValue(mockUsuarios);
    render(<ViewUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('+ Registrar Personal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Registrar Personal'));
    expect(screen.getByText('Nuevo Perfil')).toBeInTheDocument();

    // Rellenar con select de rol para cubrir esa parte
    const roleSelect = screen.getByRole('combobox');
    fireEvent.change(roleSelect, { target: { value: 'recepcionista' } });

    fireEvent.click(screen.getByText('CANCELAR'));
    expect(screen.queryByText('Nuevo Perfil')).not.toBeInTheDocument();
  });

  it('Debería cerrar el formulario de edición al presionar Cancelar', async () => {
    authService.getUsuarios.mockResolvedValue(mockUsuarios);
    const { container } = render(<ViewUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('CARLOS PEREZ')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button');
    const editCarlosBtn = editButtons.find(b => b.innerHTML.includes('M15.232 5.232l3.536 3.536'));
    fireEvent.click(editCarlosBtn);

    expect(screen.getByText('Editar Perfil')).toBeInTheDocument();

    // Rellenar inputs de edición para cubrir esas líneas
    fireEvent.change(container.querySelector('#editar-staff-usuario'), { target: { value: 'carlos_new' } });
    fireEvent.change(container.querySelector('#editar-staff-password'), { target: { value: 'carlos_pass' } });
    fireEvent.change(container.querySelector('#editar-staff-rol'), { target: { value: 'admin' } });

    fireEvent.click(screen.getByText('CANCELAR'));
    expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument();
  });

  it('Debería alertar y registrar errores al fallar registrar personal', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => { });
    authService.getUsuarios.mockResolvedValue(mockUsuarios);
    authService.createUsuario.mockImplementation(() => {
      console.log("=== MOCK CREATE USUARIO CALLED ===");
      return Promise.reject(new Error('Create User Error'));
    });

    render(<ViewUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('+ Registrar Personal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Registrar Personal'));
    fireEvent.change(screen.getByPlaceholderText('NOMBRE COMPLETO'), { target: { value: 'TEST USER' } });
    fireEvent.change(screen.getByPlaceholderText('USUARIO DE ACCESO'), { target: { value: 'test' } });
    fireEvent.change(screen.getByPlaceholderText('CONTRASEÑA'), { target: { value: 'test' } });
    fireEvent.submit(screen.getByRole('button', { name: 'GUARDAR' }));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Error al registrar: Revisa si el usuario ya existe.');
    });

    errorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('Debería alertar y registrar errores al fallar actualizar perfil', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => { });
    authService.getUsuarios.mockResolvedValue(mockUsuarios);
    authService.updateUsuario.mockImplementation(() => Promise.reject(new Error('Update User Error')));

    render(<ViewUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('CARLOS PEREZ')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button');
    const editCarlosBtn = editButtons.find(b => b.innerHTML.includes('M15.232 5.232l3.536 3.536'));
    fireEvent.click(editCarlosBtn);

    fireEvent.submit(screen.getByRole('button', { name: 'ACTUALIZAR' }));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Error al actualizar el perfil.');
    });

    errorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('Debería alertar y registrar errores al fallar eliminar usuario', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => { });
    authService.getUsuarios.mockResolvedValue(mockUsuarios);
    authService.deleteUsuario.mockImplementation(() => Promise.reject(new Error('Delete User Error')));

    render(<ViewUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('CARLOS PEREZ')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const deleteCarlosBtn = buttons.find(b => b.innerHTML.includes('M19 7l-.867 12.142A2 2 0 0116.138 21'));
    fireEvent.click(deleteCarlosBtn);

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Error al eliminar usuario.');
    });

    confirmSpy.mockRestore();
    errorSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
