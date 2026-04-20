import React from 'react';
import imagenMapa from '../assets/mapa-final-wayra.png';

const MapaInteractivo = ({ mesas, onMesaClick }) => {
  
  // Coordenadas aproximadas por mesa (Ajustar según la imagen)
  const coordenadas = {
    1: { top: '42%', left: '3%', width: '11%', height: '12%' },
    2: { top: '42%', left: '19%', width: '11%', height: '12%' },
    3: { top: '65%', left: '3%', width: '11%', height: '12%' },
    4: { top: '65%', left: '19%', width: '11%', height: '12%' },
    5: { top: '35%', left: '38%', width: '11%', height: '12%' },
    6: { top: '60%', left: '38%', width: '11%', height: '12%' },
    7: { top: '80%', left: '72%', width: '10%', height: '14%' },
    8: { top: '80%', left: '84%', width: '10%', height: '14%' },
  };

  return (
    <div className="relative inline-block w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
      {/* Imagen Base */}
      <img src={imagenMapa} alt="Mapa Wayra" className="w-full h-auto block" />

      {/* Capa de Hotspots */}
      <div className="absolute inset-0">
        {mesas.map((mesa) => {
          const pos = coordenadas[mesa.numero_mesa];
          if (!pos) return null;

          return (
            <button
              key={mesa.id_mesa}
              onClick={() => onMesaClick(mesa)}
              className={`absolute transition-all duration-300 border-2 rounded-lg
                ${mesa.estado === 'disponible' ? 'bg-green-500/20 border-green-500 hover:bg-green-500/40' : 
                  mesa.estado === 'ocupada' ? 'bg-red-500/40 border-red-500 hover:bg-red-500/60' : 
                  'bg-yellow-500/30 border-yellow-500'}`}
              style={{ ...pos }}
              title={`Mesa ${mesa.numero_mesa} - ${mesa.estado}`}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                #{mesa.numero_mesa}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MapaInteractivo;