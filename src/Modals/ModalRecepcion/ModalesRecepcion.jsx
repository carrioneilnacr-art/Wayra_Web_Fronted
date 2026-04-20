import React from 'react';
import styles from './ModalRecepcion.module.css';

export const ModalDetalleTicket = ({ ticket, onClose }) => (
  <div className={`${styles.overlay} ${styles.overlayDark}`}>
    <div className={`${styles.card} animate-in zoom-in duration-300`}>
      <h2 className="text-3xl font-black uppercase italic mb-8 border-b pb-4 tracking-tighter text-slate-800">
        {ticket.nombre_cliente}
      </h2>
      
      <div className="space-y-4 text-left mb-10">
        <div className="flex justify-between border-b pb-1">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">DNI</span>
          <span className="font-black text-sm">{ticket.dni_cliente}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Teléfono</span>
          <span className="font-black text-sm">{ticket.telefono_cliente}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Mesa / Hora</span>
          <span className="font-black text-sm">#{ticket.id_mesa} a las {ticket.hora_reserva}</span>
        </div>
        <div className={styles.observacionBox}>
          "{ticket.observacion || 'Sin observaciones adicionales'}"
        </div>
      </div>

      <button 
        onClick={onClose} 
        className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-blue-600 transition-all uppercase italic tracking-widest"
      >
        Entendido
      </button>
    </div>
  </div>
);

export const ModalListaDia = ({ lista, onClose, onSelectTicket }) => (
  <div className={`${styles.overlay} ${styles.overlaySlate}`}>
    <div className={`${styles.card} animate-in zoom-in duration-300`}>
      <h2 className="text-xl font-black mb-6 text-center border-b pb-4 uppercase italic">
        Sesiones del Día
      </h2>
      
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {lista.map(r => (
          <div 
            key={r.id_reserva} 
            onClick={() => { onSelectTicket(r); onClose(); }} 
            className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-500 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
              {r.hora_reserva}
            </span>
            <p className="font-black text-slate-800 text-xs uppercase italic">
              {r.nombre_cliente} {r.apellido_cliente}
            </p>
          </div>
        ))}
      </div>

      <button 
        onClick={onClose} 
        className="w-full mt-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
      >
        Cerrar Calendario
      </button>
    </div>
  </div>
);