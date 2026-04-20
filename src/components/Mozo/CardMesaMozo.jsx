import React from 'react';
import wayraApi from '../../api/wayraApi'; // Importamos la instancia maestra

const CardMesaMozo = ({ mesa, onClick, onRefresh }) => {
  const esLimpieza = mesa.estado === 'limpieza';
  const esOcupada = mesa.estado === 'ocupada';

  const liberarMesa = async (e) => {
    e.stopPropagation(); // Evita que se abra el comandero al hacer clic en el botón
    
    if(window.confirm("¿Confirmas que la mesa ya está limpia para nuevos clientes?")) {
      try {
        // Usamos Axios para el PUT
        await wayraApi.put(`/mesas/${mesa.id_mesa}/liberar`);
        
        // 💡 CONSEJO SENIOR: En lugar de recargar la página,
        // llamamos a la función de refresco que viene del Dashboard.
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
      className={`relative p-5 rounded-[2.5rem] border-2 transition-all shadow-xl cursor-pointer active:scale-95 ${
        esLimpieza ? 'bg-orange-500/20 border-orange-500 animate-pulse' : 
        esOcupada ? 'bg-rose-600/20 border-rose-600 shadow-rose-900/20' : 
        'bg-slate-900 border-white/5 opacity-40 hover:opacity-100'
      }`}
    >
      <span className="absolute -top-2 -right-2 bg-white text-black w-8 h-8 rounded-full flex items-center justify-center font-black italic text-[10px] shadow-lg">
        #{mesa.numero_mesa || mesa.id_mesa}
      </span>

      <div className="flex flex-col items-center gap-2">
        <span className="text-2xl">{esLimpieza ? '🧼' : esOcupada ? '🍣' : '🪑'}</span>
        <p className="text-[8px] font-black uppercase italic text-white tracking-widest">
          {esLimpieza ? 'LIMPIEZA' : esOcupada ? 'OCUPADA' : 'LIBRE'}
        </p>
        
        {esLimpieza && (
          <button 
            onClick={liberarMesa}
            className="mt-2 bg-orange-500 text-white text-[7px] px-3 py-1 rounded-full font-black hover:bg-white hover:text-orange-500 transition-all shadow-lg uppercase"
          >
            LISTA ✅
          </button>
        )}
      </div>
    </div>
  );
};

export default CardMesaMozo;