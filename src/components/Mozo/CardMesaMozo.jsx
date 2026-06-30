import React from 'react';
import PropTypes from 'prop-types';

const CardMesaMozo = ({ mesa, isSelected, onClick }) => {
  const isOcupada = mesa.estado === 'ocupada';
  const isReservada = mesa.estado === 'reservada';

  // 1. Resolvemos clases de borde y fondo (evitamos ternarios anidados)
  let buttonClass = 'border-slate-200 bg-white hover:border-slate-300';
  if (isSelected) {
    buttonClass = 'border-[#1a1a1a] bg-white ring-2 ring-black';
  } else if (isOcupada) {
    buttonClass = 'border-[#1a1a1a] bg-[#1a1a1a]';
  } else if (isReservada) {
    buttonClass = 'border-[#b07d62] bg-[#fcfaf7]';
  }

  // 2. Resolvemos clases para el indicador de estado
  let indicatorColorClass = 'bg-emerald-500';
  let textStatusColorClass = 'text-slate-400';
  let statusLabel = 'Libre';
  if (isOcupada) {
    indicatorColorClass = 'bg-rose-500';
    textStatusColorClass = 'text-rose-400';
    statusLabel = 'Uso';
  } else if (isReservada) {
    indicatorColorClass = 'bg-orange-500';
    textStatusColorClass = 'text-orange-400';
    statusLabel = 'Reserva';
  }

  // 3. Resolvemos clases para el texto del número de mesa
  let tableLabelClass = 'text-slate-300 font-extralight';
  if (isOcupada) {
    tableLabelClass = 'text-white font-medium';
  } else if (isReservada) {
    tableLabelClass = 'text-[#1a1a1a] italic';
  }

  const capacidad = mesa.capacidad || 4;
  const mesaId = mesa.id_mesa || mesa.numero_mesa || 'unknown';

  return (
    // ✅ Convertimos el div a button: nativo, accesible y robusto
    <button
      type="button"
      onClick={onClick}
      className={`h-[140px] w-full p-6 rounded-xl flex flex-col justify-between border-2 transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonClass}`}
      aria-pressed={isSelected}
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${indicatorColorClass}`}></div>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${textStatusColorClass}`}>
            {statusLabel}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: capacidad }).map((_, i) => (
            <div
              key={`cap-${mesaId}-${i}`}
              className={`w-1 h-3 rounded-sm ${isOcupada ? 'bg-white/20' : 'bg-slate-200'}`}
            ></div>
          ))}
        </div>
      </div>
      <h3 className={`text-4xl tracking-tighter ${tableLabelClass}`}>
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