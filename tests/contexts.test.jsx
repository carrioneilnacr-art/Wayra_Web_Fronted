import React, { useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AccessibilityContext, AccessibilityProvider } from '../src/context/AccessibilityContext';
import { AuthContext, AuthProvider } from '../src/context/AuthContext';
import wayraApi from '../src/api/wayraApi';

describe('🧪 Tests para AccessibilityContext', () => {
  const TestComponent = () => {
    const { fontSize, setFontSize, isDarkMode, setIsDarkMode, colorBlindMode, setColorBlindMode, resetAccessibility } = useContext(AccessibilityContext);
    return (
      <div>
        <span data-testid="size">{fontSize}</span>
        <span data-testid="mode">{isDarkMode ? 'dark' : 'light'}</span>
        <span data-testid="cb">{colorBlindMode}</span>
        <button onClick={() => setFontSize(20)}>Grow</button>
        <button onClick={() => setIsDarkMode(true)}>DarkOn</button>
        <button onClick={() => setColorBlindMode('protanopia')}>Dalton</button>
        <button onClick={resetAccessibility}>Reset</button>
      </div>
    );
  };

  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.fontSize = '';
  });

  it('Debería cargar valores iniciales y aplicarlos al HTML', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('size').textContent).toBe('16');
    expect(screen.getByTestId('mode').textContent).toBe('light');
    expect(screen.getByTestId('cb').textContent).toBe('none');
    expect(document.documentElement.style.fontSize).toBe('16px');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('Debería actualizar fontSize y propagarlo al html style', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    fireEvent.click(screen.getByText('Grow'));
    expect(screen.getByTestId('size').textContent).toBe('20');
    expect(document.documentElement.style.fontSize).toBe('20px');
  });

  it('Debería alternar modo oscuro y daltonismo', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    fireEvent.click(screen.getByText('DarkOn'));
    expect(screen.getByTestId('mode').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(screen.getByText('Dalton'));
    expect(screen.getByTestId('cb').textContent).toBe('protanopia');
  });

  it('Debería resetear la accesibilidad a valores por defecto', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    fireEvent.click(screen.getByText('Grow'));
    fireEvent.click(screen.getByText('DarkOn'));
    fireEvent.click(screen.getByText('Dalton'));

    expect(screen.getByTestId('size').textContent).toBe('20');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByTestId('size').textContent).toBe('16');
    expect(screen.getByTestId('mode').textContent).toBe('light');
    expect(screen.getByTestId('cb').textContent).toBe('none');
  });
});

describe('🧪 Tests para AuthContext', () => {
  const TestAuthComponent = () => {
    const { user, isAuth, login, logout } = useContext(AuthContext);
    return (
      <div>
        <span data-testid="auth">{isAuth ? 'YES' : 'NO'}</span>
        <span data-testid="user">{user ? user.nombre : 'GUEST'}</span>
        <button onClick={() => login({ nombre: 'Leo', rol: 'mozo' }, 'token-abc')}>LogIn</button>
        <button onClick={logout}>LogOut</button>
      </div>
    );
  };

  beforeEach(() => {
    localStorage.clear();
    delete wayraApi.defaults.headers.common['Authorization'];
  });

  it('Debería inicializar como desautenticado por defecto', () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth').textContent).toBe('NO');
    expect(screen.getByTestId('user').textContent).toBe('GUEST');
  });

  it('Debería restaurar sesión si existen datos en localStorage', () => {
    localStorage.setItem('wayra_token', 'jwt-123');
    localStorage.setItem('wayra_user', JSON.stringify({ nombre: 'Juan', rol: 'admin' }));

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth').textContent).toBe('YES');
    expect(screen.getByTestId('user').textContent).toBe('Juan');
    expect(wayraApi.defaults.headers.common['Authorization']).toBe('Bearer jwt-123');
  });

  it('Debería loguear usuario y guardar datos', () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('LogIn'));

    expect(screen.getByTestId('auth').textContent).toBe('YES');
    expect(screen.getByTestId('user').textContent).toBe('Leo');
    expect(localStorage.getItem('wayra_token')).toBe('token-abc');
    expect(JSON.parse(localStorage.getItem('wayra_user'))).toEqual({ nombre: 'Leo', rol: 'mozo' });
    expect(wayraApi.defaults.headers.common['Authorization']).toBe('Bearer token-abc');
  });

  it('Debería desloguear y remover datos', () => {
    localStorage.setItem('wayra_token', 'jwt-123');
    localStorage.setItem('wayra_user', JSON.stringify({ nombre: 'Juan', rol: 'admin' }));

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth').textContent).toBe('YES');

    fireEvent.click(screen.getByText('LogOut'));

    expect(screen.getByTestId('auth').textContent).toBe('NO');
    expect(screen.getByTestId('user').textContent).toBe('GUEST');
    expect(localStorage.getItem('wayra_token')).toBeNull();
    expect(localStorage.getItem('wayra_user')).toBeNull();
    expect(wayraApi.defaults.headers.common['Authorization']).toBeUndefined();
  });
});
