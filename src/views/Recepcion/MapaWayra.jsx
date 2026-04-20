import React, { useState, useEffect, useRef } from 'react';
import imagenMapa from "../../assets/mapa-final-wayra.png"; 
const MapaWayra = ({ mesas, onMesaClick, mesaSeleccionada }) => {
  const [ahora, setAhora] = useState(new Date());
  const [dimensiones, setDimensiones] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);

  // timer de las mesas cada minuto
  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 60000);
    return () => clearInterval(timer);
  }, [ahora]);
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
  const coordenadas = {
    1: { top: 45.3, left: 3.2, width: 11.4, height: 8.4 }, 
    2: { top: 45.2, left: 19.4, width: 11.4, height: 8.5 },
    3: { top: 68.4, left: 3.2, width: 11.4, height: 8.6 },
    4: { top: 68.4, left: 19.4, width: 11.4, height: 8.6 },
    5: { top: 39, left: 37.7, width: 11.7, height: 8.6 },
    6: { top: 65.1, left: 37.7, width: 11.7, height: 9},
    7: { top: 83.8, left: 73, width: 9.9, height: 8.2 },
    8: { top: 83.8, left: 84.2, width: 9.9, height: 8.2 },
  };
  return (
    <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden p-4 custom-scrollbar bg-slate-100/50 rounded-[3rem]">
      <div className="relative inline-block w-full max-w-[1100px]">
        
        {/* IMAGEN: Cambiamos max-h para que no sea tan restrictivo y h-auto */}
        <img 
          ref={imgRef}
          src={imagenMapa} 
          alt="Wayra Plano" 
          onLoad={actualizarEscala}
          className="w-full h-auto object-contain shadow-2xl rounded-[2.5rem] border-[6px] border-white pointer-events-none" 
        />
        
        {/* CAPA DE BOTONES */}
        <div 
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: dimensiones.width, height: dimensiones.height }}
        >
          {mesas.map((mesa) => {
            const pos = coordenadas[mesa.numero_mesa];
            if (!pos) return null;

            const esOcupada = mesa.estado === 'ocupada';
            const esSeleccionada = mesaSeleccionada?.id_mesa === mesa.id_mesa;

            return (
              <button
                key={mesa.id_mesa}
                onClick={() => onMesaClick(mesa)}
                className={`absolute pointer-events-auto transition-all duration-300 border-2 flex flex-col items-center justify-center overflow-hidden
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

      {/* Estilo sutil para avisar que hay más contenido abajo si es necesario */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};
export default MapaWayra;
