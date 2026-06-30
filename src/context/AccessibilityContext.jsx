import { createContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  // Estados iniciales normales
  const [fontSize, setFontSize] = useState(16); // 16px es el tamaño estándar
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState('none'); // none, protanopia, etc.

  // Efecto para Modo Oscuro
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Efecto para Barra de Arrastre (Zoom de pantalla)
  useEffect(() => {
    // Al cambiar el fontSize del root (html), cualquier elemento que use 'rem' en Tailwind crecerá proporcionalmente
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // 🔄 BOTÓN DE RESTABLECER CONFIGURACIÓN
  const resetAccessibility = () => {
    setFontSize(16);
    setIsDarkMode(false);
    setColorBlindMode('none');
  };

  // Memorizamos el objeto del contexto para evitar renderizaciones innecesarias
  const contextValue = useMemo(() => ({
    fontSize, setFontSize,
    isDarkMode, setIsDarkMode,
    colorBlindMode, setColorBlindMode,
    resetAccessibility
  }), [fontSize, isDarkMode, colorBlindMode]);

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Aplicamos la clase de daltonismo a un contenedor global wrapper */}
      <div className={colorBlindMode === 'none' ? '' : `cb-${colorBlindMode}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

AccessibilityProvider.propTypes = {
  children: PropTypes.node.isRequired,
};