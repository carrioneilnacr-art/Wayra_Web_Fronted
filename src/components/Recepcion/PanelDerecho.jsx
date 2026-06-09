import React, { useState, useEffect } from 'react';
import wayraApi from '../../api/wayraApi';

export const PanelDerechoReservas = ({ 
  reservas, onTicketClick, onSearch, onEdit, fechaSeleccionada, hoyStr, onCheckIn, user 
}) => {
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const obtenerEstadoSemaforo = (horaReserva, estadoActual) => {
    if (estadoActual === 'confirmada') return { color: 'emerald', label: 'EN MESA', pulse: false };
    if (estadoActual === 'cancelada') return { color: 'slate', label: 'ANULADA', pulse: false };
    if (fechaSeleccionada !== hoyStr) return { color: 'slate', label: 'PROGRAMADA', pulse: false };
    
    const [horas, minutos] = horaReserva.split(':');
    const fechaRes = new Date();
    fechaRes.setHours(parseInt(horas), parseInt(minutos), 0);
    const diffMins = Math.floor((fechaRes - ahora) / 60000);

    if (diffMins < -10) return { color: 'rose', label: 'RETRASO CRÍTICO', pulse: true };
    if (diffMins >= -10 && diffMins <= 15) return { color: 'amber', label: 'CLIENTE PRÓXIMO', pulse: true };
    return { color: 'blue', label: 'A TIEMPO', pulse: false };
  };

  const handleLlegadaCliente = async (reserva) => {
    try {
      await wayraApi.put(`/reservas/${reserva.id_reserva}/checkin`, { id_usuario: user?.id_usuario });
      onCheckIn();
    } catch (e) {
      alert("Error al procesar el ingreso del cliente.");
    }
  };

  const handleAnular = async (id) => {
    if (!window.confirm("¿Seguro de cancelar esta reserva?")) return;
    try {
      await wayraApi.put(`/reservas/${id}/cancelar`);
      onCheckIn();
    } catch (e) {
      alert("Error al anular.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* BUSCADOR TÁCTIL */}
      <div className="p-6 border-b border-slate-100 shrink-0">
        <label className="text-[9px] font-black tracking-[0.3em] text-slate-400 block mb-3">Panel de control de acceso</label>
        <div className="relative">
          <input 
            type="text" 
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por DNI o Nombre de Cliente..." 
            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 pl-12 text-[11px] font-black tracking-tight focus:bg-white focus:border-slate-900 transition-all text-slate-800 placeholder-slate-300"
          />
          <span className="absolute left-4 top-4 opacity-30 text-xs">🔍</span>
        </div>
      </div>

      {/* LISTADO DE TICKETS DE RESERVA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
        {reservas.length > 0 ? reservas.map((r) => {
          const semaforo = obtenerEstadoSemaforo(r.hora_reserva, r.estado_reserva);
          const esCancelada = r.estado_reserva === 'cancelada';

          return (
            <div 
              key={r.id_reserva} 
              className={`p-4 rounded-3xl border-2 transition-all bg-white flex flex-col gap-4 shadow-sm ${
                semaforo.color === 'rose' ? 'border-rose-100 hover:border-rose-300' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[7px] font-black px-2 py-0.5 rounded-md text-white tracking-widest leading-none ${
                      semaforo.color === 'emerald' ? 'bg-emerald-500' :
                      semaforo.color === 'rose' ? 'bg-rose-500 animate-pulse' :
                      semaforo.color === 'amber' ? 'bg-amber-500 animate-pulse' :
                      semaforo.color === 'blue' ? 'bg-blue-600' : 'bg-slate-400'
                    }`}>
                      {semaforo.label}
                    </span>
                    {r.id_pedido && (
                      <button 
                        onClick={() => onTicketClick(r.id_pedido)}
                        className="text-[7px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all leading-none"
                      >
                        VER PREVENTA #P-{r.id_pedido}
                      </button>
                    )}
                  </div>

                  <h3 className="font-black text-xs text-slate-800 tracking-tight truncate uppercase">{r.nombre_cliente}</h3>
                  <p className="text-[9px] font-black text-slate-400 tracking-wide mt-1">MESA {r.numero_mesa || r.id_mesa} • {r.hora_reserva}</p>
                  <p className="text-[7px] text-slate-400 mt-2 font-black">MOZO: {r.nombre_mozo || 'PENDIENTE'}</p>
                </div>
                
                <div className="flex flex-col gap-2 shrink-0">
                   {!esCancelada && <button onClick={() => onEdit(r)} className="p-3 bg-white/50 rounded-2xl border hover:border-slate-200 transition-all text-xs">⚙️</button>}
                   {r.estado_reserva === 'pendiente' && (
                     <button onClick={() => handleAnular(r.id_reserva)} className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all text-xs">✕</button>
                   )}
                </div>
              </div>

              {fechaSeleccionada === hoyStr && r.estado_reserva === 'pendiente' && (
                <button 
                  onClick={() => handleLlegadaCliente(r)} 
                  className={`w-full py-4 rounded-2xl text-[10px] font-black text-white shadow-lg transition-all ${
                    semaforo.color === 'rose' ? styles.btnLlegoRose : 'bg-slate-900 hover:bg-blue-600'
                  }`}
                >
                  LLEGÓ ✔
                </button>
              )}
            </div>
          );
        }) : (
          <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
            <span className="text-4xl mb-2">🎟️</span>
            <p className="text-[9px] font-black tracking-widest uppercase">Sin registros cargados</p>
          </div>
        )}
      </div>
    </div>
  );
};