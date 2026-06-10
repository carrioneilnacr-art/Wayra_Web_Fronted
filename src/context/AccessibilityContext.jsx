import { createContext, useState, useEffect } from 'react';

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
    // Al cambiar el fontSize del root (html), todo lo que use 'rem' en Tailwind crecerá proporcionalmente
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // 🔄 BOTÓN DE RESTABLECER TODO
  const resetAccessibility = () => {
    setFontSize(16);
    setIsDarkMode(false);
    setColorBlindMode('none');
  };

  return (
    <AccessibilityContext.Provider value={{ 
      fontSize, setFontSize, 
      isDarkMode, setIsDarkMode,
      colorBlindMode, setColorBlindMode,
      resetAccessibility
    }}>
      {/* Aplicamos la clase de daltonismo a un contenedor global wrapper */}
      <div className={colorBlindMode !== 'none' ? `cb-${colorBlindMode}` : ''}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};