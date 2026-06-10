import { useContext, useState } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { Accessibility, Moon, Sun, Type, RefreshCw, Eye } from 'lucide-react';

export const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    fontSize, setFontSize, 
    isDarkMode, setIsDarkMode, 
    colorBlindMode, setColorBlindMode,
    resetAccessibility 
  } = useContext(AccessibilityContext);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans text-left">
      {/* 📂 MENÚ DESPLEGABLE */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-2xl rounded-2xl p-5 mb-3 w-72 border border-gray-200 dark:border-gray-700 transition-all">
          <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Accessibility size={20} className="text-blue-600" /> Accesibilidad
            </h3>
          </div>
          
          {/* 🌓 1. MODO OSCURO */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Apariencia</label>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center justify-between w-full p-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors"
            >
              <span className="text-sm font-medium flex items-center gap-2">
                {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
                {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </span>
              <div className={`w-8 h-4 bg-gray-300 dark:bg-blue-600 rounded-full relative p-0.5 transition-colors`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>

          {/* 🔎 2. BARRA DE ARRASTRE (ZOOM TEXTO) */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Type size={14} /> Tamaño de Pantalla
              </label>
              <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded-md">
                {Math.round((fontSize / 16) * 100)}%
              </span>
            </div>
            <input 
              type="range" 
              min="13" 
              max="24" 
              value={fontSize} 
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
              <span>Pequeño</span>
              <span>Normal</span>
              <span>Grande</span>
            </div>
          </div>

          {/* 🎨 3. MODOS DE COLOR / DALTONISMO */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Eye size={14} /> Filtros Visuales
            </label>
            <select 
              value={colorBlindMode} 
              onChange={(e) => setColorBlindMode(e.target.value)}
              className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
            >
              <option value="none">Normal (Sin Filtro)</option>
              <option value="high-contrast">Alto Contraste</option>
              <option value="protanopia">Daltonismo: Protanopia (Rojo)</option>
              <option value="deuteranopia">Daltonismo: Deuteranopia (Verde)</option>
              <option value="tritanopia">Daltonismo: Tritanopia (Azul)</option>
            </select>
          </div>

          {/* 🔄 4. BOTÓN RESTABLECER */}
          <button 
            onClick={resetAccessibility}
            className="flex items-center justify-center gap-2 w-full p-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors border border-red-200/40 dark:border-red-900/30"
          >
            <RefreshCw size={14} /> Restablecer Configuración
          </button>
        </div>
      )}

      {/* 🔘 BOTÓN PRINCIPAL FLOTANTE */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
        aria-label="Menú de accesibilidad"
      >
        <Accessibility size={26} className="group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};