import React from 'react';
import PropTypes from 'prop-types';

const CardMesaMozo = ({ mesa, isSelected, onClick }) => {
  const isOcupada = mesa.estado === 'ocupada';
  const isReservada = mesa.estado === 'reservada';

  return (
    // ✅ Convertimos el div a button: nativo, accesible y robusto
    <button
      type="button"
      onClick={onClick}
      className={`h-[140px] w-full p-6 rounded-xl flex flex-col justify-between border-2 transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isSelected ? 'border-[#1a1a1a] bg-white ring-2 ring-black' : 
        isOcupada ? 'border-[#1a1a1a] bg-[#1a1a1a]' : 
        isReservada ? 'border-[#b07d62] bg-[#fcfaf7]' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
      aria-pressed={isSelected}
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOcupada ? 'bg-rose-500' : isReservada ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${isOcupada ? 'text-rose-400' : isReservada ? 'text-orange-400' : 'text-slate-400'}`}>
            {isOcupada ? 'Uso' : isReservada ? 'Reserva' : 'Libre'}
          </span>
        </div>
        <div className="flex gap-1">
          {[...Array(mesa.capacidad || 4)].map((_, i) => (
            <div key={i} className={`w-1 h-3 rounded-sm ${isOcupada ? 'bg-white/20' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
      <h3 className={`text-4xl tracking-tighter ${isOcupada ? 'text-white font-medium' : isReservada ? 'text-[#1a1a1a] italic' : 'text-slate-300 font-extralight'}`}>
        {mesa.numero_mesa || mesa.id_mesa}
      </h3>
    </button>
  );
};

// ✅ Validación de Props para Reliability (SonarQube A+)
CardMesaMozo.propTypes = {
  mesa: PropTypes.shape({
    estado: PropTypes.string,
    capacidad: PropTypes.number,
    numero_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default CardMesaMozo;