import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
import Login from '../src/pages/Login';
import wayraApi from '../src/api/wayraApi';

// Mock de wayraApi
vi.mock('../src/api/wayraApi', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('🧪 Tests para Login Page', () => {
  const onLogin = vi.fn();

  beforeAll(() => {
    // Mock de crypto.getRandomValues para el generador de partículas de polvo
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: (arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 0xFFFFFFFF);
          }
          return arr;
        }
      },
      writable: true,
      configurable: true
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería renderizar inputs de usuario y contraseña', () => {
    render(<Login onLogin={onLogin} />);
    expect(screen.getByPlaceholderText('USUARIO')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('CONTRASEÑA')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Experiencia/i })).toBeInTheDocument();
  });

  it('Debería llamar a onLogin al ingresar credenciales válidas', async () => {
    const mockUser = { id_usuario: 1, nombre: 'Mozo Pedro', rol: 'mozo' };
    vi.spyOn(wayraApi, 'post').mockResolvedValue({
      data: { success: true, usuario: mockUser, token: 'jwt-token-123' }
    });

    render(<Login onLogin={onLogin} />);

    fireEvent.change(screen.getByPlaceholderText('USUARIO'), { target: { value: 'pedro' } });
    fireEvent.change(screen.getByPlaceholderText('CONTRASEÑA'), { target: { value: 'password' } });
    fireEvent.submit(screen.getByRole('button', { name: /Iniciar Experiencia/i }));

    await waitFor(() => {
      expect(wayraApi.post).toHaveBeenCalledWith('/login', { user: 'pedro', pass: 'password' });
      expect(onLogin).toHaveBeenCalledWith(mockUser, 'jwt-token-123');
    });
  });

  it('Debería mostrar mensaje de error con credenciales incorrectas', async () => {
    vi.spyOn(wayraApi, 'post').mockResolvedValue({
      data: { success: false, message: 'Usuario no existe' }
    });

    render(<Login onLogin={onLogin} />);

    fireEvent.change(screen.getByPlaceholderText('USUARIO'), { target: { value: 'incorrecto' } });
    fireEvent.change(screen.getByPlaceholderText('CONTRASEÑA'), { target: { value: 'clave' } });
    fireEvent.submit(screen.getByRole('button', { name: /Iniciar Experiencia/i }));

    await waitFor(() => {
      expect(screen.getByText(/usuario no existe/i)).toBeInTheDocument();
    });
  });

  it('Debería manejar errores de red del servidor', async () => {
    vi.spyOn(wayraApi, 'post').mockRejectedValue({
      response: { data: { message: 'Servidor fuera de servicio' } }
    });

    render(<Login onLogin={onLogin} />);

    fireEvent.change(screen.getByPlaceholderText('USUARIO'), { target: { value: 'error' } });
    fireEvent.change(screen.getByPlaceholderText('CONTRASEÑA'), { target: { value: 'error' } });
    fireEvent.submit(screen.getByRole('button', { name: /Iniciar Experiencia/i }));

    await waitFor(() => {
      expect(screen.getByText(/servidor fuera de servicio/i)).toBeInTheDocument();
    });
  });

  it('Debería mostrar error general si el servidor no responde', async () => {
    vi.spyOn(wayraApi, 'post').mockRejectedValue(new Error('Network error'));

    render(<Login onLogin={onLogin} />);

    fireEvent.change(screen.getByPlaceholderText('USUARIO'), { target: { value: 'error' } });
    fireEvent.change(screen.getByPlaceholderText('CONTRASEÑA'), { target: { value: 'error' } });
    fireEvent.submit(screen.getByRole('button', { name: /Iniciar Experiencia/i }));

    await waitFor(() => {
      expect(screen.getByText(/el servidor no responde/i)).toBeInTheDocument();
    });
  });
});
