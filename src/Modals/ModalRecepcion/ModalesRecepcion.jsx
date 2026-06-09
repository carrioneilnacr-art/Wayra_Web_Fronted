import React from 'react';

// 🎟️ MODAL 1: DETALLE COMPLETO DEL TICKET DE ADMISIÓN
export const ModalDetalleTicket = ({ ticket, onClose }) => (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 md:p-10 text-center border border-slate-100 animate-in zoom-in duration-300">
      
      <h2 className="text-2xl font-black uppercase italic mb-6 border-b border-slate-100 pb-3 tracking-tighter text-slate-800">
        {ticket.nombre_cliente}
      </h2>
      
      <div className="space-y-3.5 text-left mb-8">
        <div className="flex justify-between border-b border-slate-50 pb-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest not-italic">DNI</span>
          <span className="font-bold text-xs text-slate-800 font-sans not-italic">{ticket.dni_cliente || '---'}</span>
        </div>
        
        <div className="flex justify-between border-b border-slate-50 pb-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest not-italic">Teléfono</span>
          <span className="font-bold text-xs text-slate-800 font-sans not-italic">{ticket.telefono_cliente || '---'}</span>
        </div>
        
        <div className="flex justify-between border-b border-slate-50 pb-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest not-italic">Mesa / Hora</span>
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">#{ticket.id_mesa} • {ticket.hora_reserva}</span>
        </div>
        
        {/* Caja de Observación estilizada */}
        <div className="bg-blue-50/60 border border-blue-100/50 p-4 rounded-2xl text-[11px] font-medium text-blue-700 italic shadow-inner">
          "{ticket.observacion || 'Sin observaciones adicionales'}"
        </div>
      </div>
      
      <button 
        onClick={onClose} 
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-black shadow-md hover:bg-blue-600 transition-all uppercase not-italic text-[10px] tracking-widest active:scale-95"
      >
        Entendido
      </button>
    </div>
  </div>
);

// 📅 MODAL 2: SELECTOR DE SESIONES DEL CALENDARIO MENSUAL
export const ModalListaDia = ({ lista, onClose, onSelectTicket }) => (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 md:p-8 text-center border border-slate-100 animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
      
      <h2 className="text-xl font-black mb-5 text-center border-b border-slate-100 pb-3 uppercase italic tracking-tight text-slate-800 shrink-0">
        Sesiones del Día
      </h2>
      
      {/* Listado con scroll sutil táctil */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
        {lista.map(r => (
          <div 
            key={r.id_reserva} 
            onClick={() => { onSelectTicket(r); onClose(); }} 
            className="flex items-center gap-3 bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100/70 hover:border-blue-500/30 hover:bg-white cursor-pointer transition-all hover:scale-[1.01] shadow-[0_2px_4px_rgba(0,0,0,0.01)]"
          >
            <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shrink-0 font-sans not-italic">
              {r.hora_reserva}
            </span>
            <p className="font-black text-slate-800 text-xs uppercase italic truncate text-left flex-1 tracking-wide">
              {r.nombre_cliente} {r.apellido_cliente}
            </p>
          </div>
        ))}
      </div>
      
      <button 
        onClick={onClose} 
        className="w-full mt-5 text-slate-400 font-bold text-[9px] uppercase tracking-widest hover:text-rose-600 transition-colors shrink-0 pt-2 border-t border-slate-50 not-italic"
      >
        Cerrar Calendario
      </button>
    </div>
  </div>
);