import React from 'react';
import PropTypes from 'prop-types';

export const ReporteTurnos = ({ reservas, totalMesas }) => {
  const turnosConfig = [
    { id: '12:00', etiqueta: '12:00 PM', turno: 'ALMUERZO 1' },
    { id: '14:00', etiqueta: '02:00 PM', turno: 'ALMUERZO 2' },
    { id: '19:00', etiqueta: '07:00 PM', turno: 'CENA 1' },
    { id: '21:00', etiqueta: '09:00 PM', turno: 'CENA 2' }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 w-full max-w-5xl animate-in fade-in slide-in-from-left duration-700 px-2">
      {turnosConfig.map((t) => {
        const ocupadas = reservas.filter(r =>
          r.hora_reserva?.startsWith(t.id.substring(0, 2)) && r.estado_reserva !== 'cancelada'
        ).length;

        const porcentaje = totalMesas > 0 ? (ocupadas / totalMesas) * 100 : 0;

        let colorClass = 'bg-blue-600';
        if (porcentaje > 80) {
          colorClass = 'bg-rose-500';
        } else if (porcentaje > 40) {
          colorClass = 'bg-amber-500';
        }

        return (
          <div key={t.id} className="bg-white p-3 rounded-[1.8rem] shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-[7px] font-black text-slate-400 tracking-widest">{t.turno} ({t.etiqueta})</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-xl font-black tracking-tighter text-slate-800">{ocupadas}</span>
              <span className="text-[9px] font-bold text-slate-400">/ {totalMesas} M</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-500 ${colorClass}`}
                style={{ width: `${Math.min(porcentaje, 100)}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

ReporteTurnos.propTypes = {
  reservas: PropTypes.arrayOf(
    PropTypes.shape({
      hora_reserva: PropTypes.string,
      estado_reserva: PropTypes.string,
    })
  ).isRequired,
  totalMesas: PropTypes.number.isRequired,
};