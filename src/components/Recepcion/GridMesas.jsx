import React, { useState, useEffect, useRef } from 'react';
import imagenMapa from "../../assets/mapa-final-wayra.png"; 

export const GridMesas = ({ mesas, onMesaClick, mesaSeleccionada }) => {
  const [ahora, setAhora] = useState(new Date());
  const [dimensiones, setDimensiones] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const actualizarEscala = () => {
    if (imgRef.current) {
      setDimensiones({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', actualizarEscala);
    setTimeout(actualizarEscala, 100);
    return () => window.removeEventListener('resize', actualizarEscala);
  }, []);

  const calcularMinutos = (horaInicio) => {
    if (!horaInicio) return "0 min";
    const inicio = new Date(horaInicio);
    const diffMs = ahora - inicio;
    const mins = Math.floor(diffMs / 60000);
    return `${mins >= 0 ? mins : 0} min`;
  };

  // Coordenadas fijas para la superposición exacta sobre el PNG de Wayra Nikkei
  const posicionesOriginales = {
    1: { top: 44.4, left: 2.7 , width: 11.7, height: 9 },
    2: { top: 44.4, left: 18.9, width: 11.7, height: 9 },
    3: { top: 38, left: 37, width: 12.1, height: 9 },
    4: { top: 68, left: 2.6, width: 11.8, height: 9.5 },
    5: { top: 68, left: 18.9, width: 11.7, height: 9.5 },
    6: { top: 65  , left: 37.1, width: 11.9, height: 9.5 },
    7: { top: 83.8, left: 72.5, width: 10.3, height: 9.2 },
    8: { top: 83.8, left: 83.5, width: 10.5, height: 9.2 },
    9: { top: 79, left: 53, width: 9, height: 11 },
    10: { top: 79, left: 66, width: 10, height: 11 },
    11: { top: 6, left: 81, width: 14, height: 10 },
    12: { top: 21, left: 81, width: 14, height: 10 },
    13: { top: 36, left: 81, width: 14, height: 10 },
    14: { top: 52, left: 81, width: 14, height: 10 },
    15: { top: 68, left: 81, width: 14, height: 10 },
    16: { top: 84, left: 81, width: 14, height: 10 }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 p-2 md:p-6 select-none overflow-hidden">
      <div className="relative w-full max-w-4xl aspect-[1043/727] bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-100">
        <img 
          ref={imgRef}
          src={imagenMapa} 
          alt="Mapa Salón Wayra" 
          className="w-full h-full object-cover"
          onLoad={actualizarEscala}
        />
        
        {mesas.map((mesa) => {
          const pos = posicionesOriginales[mesa.numero_mesa] || { top: 0, left: 0, width: 5, height: 5 };
          const esOcupada = mesa.estado === 'ocupada';
          const esSeleccionada = mesaSeleccionada?.id_mesa === mesa.id_mesa;

          return (
            <button
              key={mesa.id_mesa}
              onClick={() => onMesaClick(mesa)}
              className={`absolute cursor-pointer select-none mx-auto my-auto transition-all duration-300 border-2 flex flex-col items-center justify-center overflow-hidden rounded-xl
                ${esOcupada 
                  ? 'bg-rose-500/40 border-rose-600 shadow-[0_4px_12px_rgba(225,29,72,0.2)]' 
                  : 'bg-emerald-400/20 border-emerald-500 hover:bg-emerald-400/40'}
                ${esSeleccionada ? 'ring-4 ring-blue-500 z-50 scale-110 shadow-2xl' : 'z-10'}
              `}
              style={{ 
                top: `${pos.top}%`, 
                left: `${pos.left}%`, 
                width: `${pos.width}%`, 
                height: `${pos.height}%` 
              }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[min(1.4vw,11px)] font-black px-1.5 py-0.5 rounded-md bg-white text-slate-900 border border-slate-200 shadow-sm leading-none">
                  {mesa.numero_mesa}
                </span>

                {esOcupada && (
                  <div className="bg-white/95 px-1 py-0.5 rounded-md border border-rose-200 animate-pulse">
                    <p className="text-[min(1.1vw,8px)] font-mono font-black text-rose-700">
                      {calcularMinutos(mesa.hora_ocupada)}
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};