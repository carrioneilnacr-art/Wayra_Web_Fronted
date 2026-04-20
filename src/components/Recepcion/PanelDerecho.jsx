import React, { useState, useEffect } from 'react';
import wayraApi from '../../api/wayraApi';
import styles from './PanelDerecho.module.css';

export const PanelDerechoReservas = ({ 
  reservas, onTicketClick, onSearch, onEdit, fechaSeleccionada, hoyStr, onCheckIn 
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
    if (diffMins <= 30 && diffMins >= -10) return { color: 'amber', label: 'POR LLEGAR', pulse: true };
    return { color: 'slate', label: 'PROGRAMADA', pulse: false };
  };

  const handleLlegadaCliente = async (reserva) => {
    try {
      let idMozoFinal = reserva.id_mozo;
      
      // Si no tiene mozo, asignamos uno mediante Axios
      if (!idMozoFinal) {
        const resMozo = await wayraApi.get('/asignar-mozo');
        if (resMozo.data.success) idMozoFinal = resMozo.data.mozo.id_usuario;
      }

      // Realizamos el Check-in
      await wayraApi.put(`/reservas/${reserva.id_reserva}/checkin`, { 
        id_mozo: idMozoFinal 
      });
      
      onCheckIn(); // Recarga los datos en el dashboard
    } catch (e) { 
      console.error("Error en Check-in:", e); 
    }
  };

  const handleAnular = async (id) => {
    if (!window.confirm("¿CONFIRMAS QUE DESEAS ANULAR ESTA RESERVA?")) return;
    try {
      await wayraApi.put(`/reservas/${id}/anular`);
      onCheckIn();
    } catch (e) { 
      console.error("Error al anular:", e); 
    }
  };

  return (
    <div className={`${styles.panelContainer} uppercase italic font-sans`}>
      <div className="p-8 border-b bg-slate-50/80">
        <h2 className="text-2xl font-black tracking-tighter text-center italic">
          {fechaSeleccionada === hoyStr ? 'ORDEN DE HOY' : `RESERVAS: ${fechaSeleccionada}`}
        </h2>
        <input 
          type="text" 
          placeholder="BUSCAR CLIENTE..." 
          className="w-full mt-6 bg-white border-2 border-slate-100 p-4 rounded-2xl text-[10px] font-black outline-none focus:border-blue-500 shadow-sm" 
          onChange={(e) => onSearch(e.target.value)} 
        />
      </div>

      <div className={styles.scrollArea}>
        {reservas.length > 0 ? reservas.map(r => {
          const semaforo = obtenerEstadoSemaforo(r.hora_reserva, r.estado_reserva);
          const esCancelada = r.estado_reserva === 'cancelada';
          
          // Mapeo de estilos del CSS Module
          const styleMap = { 
            emerald: styles.cardEmerald, 
            amber: styles.cardAmber, 
            rose: styles.cardRose, 
            slate: styles.cardSlate 
          };

          return (
            <div key={r.id_reserva} className={`p-6 rounded-[2.8rem] border-2 transition-all shadow-sm mb-4 ${esCancelada ? 'opacity-40 grayscale border-dashed' : styleMap[semaforo.color]}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="cursor-pointer flex-1" onClick={() => !esCancelada && onTicketClick(r)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full bg-${semaforo.color}-500 ${semaforo.pulse ? 'animate-ping' : ''}`}></span>
                    <p className="text-[8px] font-black">{semaforo.label}</p>
                  </div>
                  <p className="font-black text-slate-900 text-[12px]">{r.nombre_cliente} {r.apellido_cliente}</p>
                  <p className="text-[10px] font-bold text-blue-600">MESA {r.id_mesa} • {r.hora_reserva}</p>
                  <p className="text-[7px] text-slate-400 mt-2 font-black">MOZO: {r.nombre_mozo || 'PENDIENTE'}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                   {!esCancelada && <button onClick={() => onEdit(r)} className="p-3 bg-white/50 rounded-2xl border hover:border-slate-200 transition-all">⚙️</button>}
                   {r.estado_reserva === 'pendiente' && (
                     <button onClick={() => handleAnular(r.id_reserva)} className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">✕</button>
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
          <div className="py-20 text-center opacity-20 italic font-black text-xs px-10 tracking-[0.3em]">
            SIN ACTIVIDAD REGISTRADA
          </div>
        )}
      </div>
    </div>
  );
};