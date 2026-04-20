import React from 'react';
import styles from './EstacionMesas.module.css';

const EstacionMesas = ({ mesas, reservas, onAtender }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-[10px] font-black text-slate-500 tracking-[0.4em] mb-6 px-2">
        MESAS DISPONIBLES / POR ATENDER
      </h2>
      
      <div className={styles.gridContainer}>
        {mesas.map(m => {
          // Lógica de Check-in: ¿Hay una reserva confirmada para esta mesa hoy?
          const checkInLlego = reservas.some(
            r => parseInt(r.id_mesa) === parseInt(m.id_mesa) && r.estado_reserva === 'confirmada'
          );
          
          const esOcupada = m.estado === 'ocupada';

          return (
            <div 
              key={m.id_mesa}
              onClick={() => onAtender(m)}
              className={`
                ${styles.mesaBase}
                ${esOcupada ? styles.mesaOcupada : checkInLlego ? styles.mesaLlego : styles.mesaVacia}
              `}
            >
              <span className="text-5xl font-black tracking-tighter">#{m.numero_mesa}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-center">
                {esOcupada ? 'COMIENDO' : checkInLlego ? '¡LLEGÓ! ATENDER' : 'VACÍA'}
              </span>
              
              {/* Notificación visual de llegada */}
              {checkInLlego && !esOcupada && (
                <div className={styles.notificacionCheck}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EstacionMesas;