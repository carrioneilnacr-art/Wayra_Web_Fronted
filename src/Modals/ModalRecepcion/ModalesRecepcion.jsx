import React, { useEffect } from 'react';
import PropTypes from 'prop-types'; // ✅ Importación necesaria para las validaciones

// 🎟️ MODAL 1: DETALLE COMPLETO DEL TICKET
export const ModalDetalleTicket = ({ ticket, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    globalThis.addEventListener('keydown', handleEsc);
    return () => globalThis.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!ticket) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md border-0 m-0 w-screen h-screen max-w-none max-h-none"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 md:p-10 text-center border border-slate-100">
        <h2 id="modal-title" className="text-2xl font-black uppercase italic mb-6 border-b border-slate-100 pb-3 tracking-tighter text-slate-800">
          {ticket.nombre_cliente || 'Sin nombre'}
        </h2>

        <div className="space-y-3.5 text-left mb-8">
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DNI</span>
            <span className="font-bold text-xs text-slate-800 font-sans">{ticket.dni_cliente || '---'}</span>
          </div>

          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Teléfono</span>
            <span className="font-bold text-xs text-slate-800 font-sans">{ticket.telefono_cliente || '---'}</span>
          </div>

          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mesa / Hora</span>
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">#{ticket.id_mesa} • {ticket.hora_reserva}</span>
          </div>

          <div className="bg-blue-50/60 border border-blue-100/50 p-4 rounded-2xl text-[11px] font-medium text-blue-700 italic shadow-inner">
            "{ticket.observacion || 'Sin observaciones adicionales'}"
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-black shadow-md hover:bg-blue-600 transition-all uppercase text-[10px] tracking-widest active:scale-95"
        >
          Entendido
        </button>
      </div>
    </dialog>
  );
};

// ✅ Validación estricta para ModalDetalleTicket
ModalDetalleTicket.propTypes = {
  ticket: PropTypes.shape({
    nombre_cliente: PropTypes.string,
    dni_cliente: PropTypes.string,
    telefono_cliente: PropTypes.string,
    id_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hora_reserva: PropTypes.string,
    observacion: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

// 📅 MODAL 2: SELECTOR DE SESIONES
export const ModalListaDia = ({ lista = [], onClose, onSelectTicket }) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    globalThis.addEventListener('keydown', handleEsc);
    return () => globalThis.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <dialog
      open
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md border-0 m-0 w-screen h-screen max-w-none max-h-none"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 md:p-8 text-center border border-slate-100 flex flex-col max-h-[85vh]">
        <h2 className="text-xl font-black mb-5 text-center border-b border-slate-100 pb-3 uppercase italic tracking-tight text-slate-800 shrink-0">
          Sesiones del Día
        </h2>

        {/* ✅ Se eliminó role="list" porque <ul> ya es una lista nativa */}
        <ul className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          {lista.map(r => (
            <li key={r.id_reserva}>
              <button
                type="button"
                onClick={() => { onSelectTicket(r); onClose(); }}
                className="w-full flex items-center gap-3 bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100/70 hover:border-blue-500/30 hover:bg-white cursor-pointer transition-all hover:scale-[1.01] shadow-[0_2px_4px_rgba(0,0,0,0.01)] text-left"
              >
                <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shrink-0 font-sans">
                  {r.hora_reserva}
                </span>
                <span className="font-black text-slate-800 text-xs uppercase italic truncate flex-1 tracking-wide">
                  {r.nombre_cliente} {r.apellido_cliente}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="w-full mt-5 text-slate-400 font-bold text-[9px] uppercase tracking-widest hover:text-rose-600 transition-colors shrink-0 pt-2 border-t border-slate-50"
        >
          Cerrar Calendario
        </button>
      </div>
    </dialog>
  );
};

// ✅ Validación estricta para ModalListaDia
ModalListaDia.propTypes = {
  lista: PropTypes.arrayOf(
    PropTypes.shape({
      id_reserva: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      hora_reserva: PropTypes.string,
      nombre_cliente: PropTypes.string,
      apellido_cliente: PropTypes.string,
    })
  ),
  onClose: PropTypes.func.isRequired,
  onSelectTicket: PropTypes.func.isRequired,
};