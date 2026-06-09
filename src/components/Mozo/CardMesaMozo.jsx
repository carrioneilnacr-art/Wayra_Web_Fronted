import React from 'react';
import { reservaService } from '../../services/reservaService';

const CardMesaMozo = ({ mesa, onClick, onRefresh }) => {
  const esLimpieza = mesa.estado === 'limpieza';
  const esOcupada = mesa.estado === 'ocupada';

  const liberarMesa = async (e) => {
    e.stopPropagation(); // Evita disparar el onClick de la tarjeta contenedora
    
    if (window.confirm("¿Confirmas que la mesa ya está limpia para nuevos clientes?")) {
      try {
        // ✅ ARQUITECTURA SENIOR: Consumo abstracto desde la capa de servicios unificada
        await reservaService.liberarMesaLimpieza(mesa.id_mesa);
        
        if (onRefresh) onRefresh(); 
      } catch (error) {
        console.error("Error al liberar la mesa:", error);
        alert("No se pudo liberar la mesa. Revisa la conexión.");
      }
    }
  };

  return (
    <div 
      onClick={esLimpieza ? null : onClick}
      className={`relative p-5 rounded-[2.2rem] border transition-all flex flex-col items-center justify-center gap-2 h-32 shadow-[0_2px_8px_rgba(0,0,0,0.01)]
        ${esLimpieza 
          ? 'bg-orange-50/60 border-orange-200 text-orange-700 animate-pulse cursor-default' 
          : esOcupada 
            ? 'bg-rose-50/50 border-rose-100 text-rose-600 cursor-pointer hover:border-rose-300' 
            : 'bg-white border-slate-100 text-slate-400 hover:border-blue-500/40 cursor-pointer'}`}
    >
      {/* Indicador de número de mesa flotante y elástico */}
      <span className="absolute -top-2 -right-2 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-black italic text-[10px] shadow-md border-2 border-white not-italic font-sans">
        #{mesa.numero_mesa || mesa.id_mesa}
      </span>

      <span className="text-3xl select-none">{esLimpieza ? '🧼' : esOcupada ? '🍣' : '🪑'}</span>
      
      <p className={`text-[9px] font-black tracking-widest uppercase font-sans not-italic
        ${esLimpieza ? 'text-orange-600' : esOcupada ? 'text-rose-600' : 'text-slate-400'}`}>
        {esLimpieza ? 'LIMPIEZA' : esOcupada ? 'OCUPADA' : 'LIBRE'}
      </p>
      
      {esLimpieza && (
        <button 
          onClick={liberarMesa}
          className="mt-1 bg-orange-500 hover:bg-orange-600 text-white text-[8px] px-3 py-1.5 rounded-xl font-black transition-all shadow-sm uppercase not-italic tracking-wider font-sans active:scale-95 z-20"
        >
          LISTA ✅
        </button>
      )}
    </div>
  );
};

export default CardMesaMozo;