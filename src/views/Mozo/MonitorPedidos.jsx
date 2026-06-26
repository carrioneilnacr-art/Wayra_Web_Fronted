import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { pedidoService } from '../../services/pedidoService';
// Ya no necesitamos importar ComanderoCarta aquí, porque se renderizará en ViewMesasMozo

// Se agregó onAgregarPlatos a las props
export const MonitorPedidos = ({ pedidos = [], onUpdate, userLogueado, onShowTicket, onAgregarPlatos }) => {
  const [pedidoSel, setPedidoSel] = useState(null);
  const [ahora, setAhora] = useState(new Date());
  const [nuevaObs, setNuevaObs] = useState("");
  const [proximasReservas, setProximasReservas] = useState([]);

  const misPedidos = pedidos.filter(p => String(p.id_mozo) === String(userLogueado?.id_usuario) && p.estado_pedido !== 'PAGADO');

  const cargarMisReservas = async () => {
    try {
      if (!userLogueado?.id_usuario) return;
      const data = await pedidoService.getReservasMozoHoy(userLogueado.id_usuario);
      setProximasReservas(data); 
    } catch (e) { 
      console.error("Error cargando reservas:", e); 
    }
  };

  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 10000);
    cargarMisReservas();
    return () => clearInterval(t);
  }, [userLogueado]);

  useEffect(() => {
    if (pedidoSel) setNuevaObs(pedidoSel.observacion || "");
  }, [pedidoSel]);

  const eliminarPlato = async (idDetalle) => {
    if (!window.confirm("¿Eliminar este plato del pedido?")) return;
    try {
      await pedidoService.eliminarItemDetalle(idDetalle);
      onUpdate(); 
      setPedidoSel(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 bg-slate-50 min-h-screen pb-10 px-6 pt-6">
      
      {/* RESERVAS: Estilo lista limpia */}
      <section>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Reservas Asignadas</p>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {proximasReservas.length > 0 ? proximasReservas.map(res => (
            <div key={res.id_reserva} className="min-w-[220px] bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-900 font-medium">{res.hora_reserva}</span>
                <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md font-semibold">ASIGNADA</span>
              </div>
              <p className="text-slate-600 text-sm truncate">{res.nombre_cliente}</p>
              <p className="text-slate-400 text-xs mt-1">Mesa {res.id_mesa} • {res.personas} personas</p>
            </div>
          )) : <p className="text-slate-400 text-sm">No hay reservas pendientes.</p>}
        </div>
      </section>

      {/* HEADER MESAS */}
      <header className="flex justify-between items-end border-b border-slate-200 pb-3 mt-4">
        <h2 className="text-xl font-semibold text-slate-900">Mesas Activas</h2>
        <span className="text-xs font-medium text-slate-500">{misPedidos.length} en servicio</span>
      </header>

      {/* GRID DE MESAS: Minimalista, sombras suaves, bordes 12px */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {misPedidos.map(p => {
          const minutos = Math.floor((ahora - new Date(p.fecha_pedido)) / 60000);
          const progreso = Math.min((minutos / 20) * 100, 100); 
          const algunListo = p.items?.some(i => minutos >= (i.tiempo_estimado || 15));

          return (
            <div key={p.id_pedido} onClick={() => setPedidoSel(p)} 
              className={`group bg-white rounded-xl p-5 cursor-pointer transition-all border shadow-sm hover:shadow-md flex flex-col justify-between h-40
                ${algunListo ? 'border-teal-200 ring-1 ring-teal-50' : 'border-slate-200'}`}>
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Orden #{p.id_pedido}</p>
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">Mesa {p.id_mesa}</span>
                </div>
                {algunListo 
                  ? <span className="text-[10px] bg-teal-500 text-white px-2.5 py-1 rounded-md font-semibold shadow-sm">LISTO</span> 
                  : <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">{minutos} min</span>}
              </div>

              <div className="mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm text-slate-500">{p.items?.length || 0} items</p>
                  <p className="text-lg font-semibold text-slate-900">S/ {Number.parseFloat(p.total).toFixed(2)}</p>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${progreso > 75 ? 'bg-orange-400' : 'bg-teal-500'}`} style={{ width: `${progreso}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PANEL LATERAL (DRAWER): Clean Fintech Style */}
      {pedidoSel && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[999] flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-50 border-l border-slate-200 flex flex-col h-full shadow-2xl">
            
            <div className="px-6 py-5 flex justify-between items-center bg-white border-b border-slate-200 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Mesa {pedidoSel.id_mesa}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Orden #{pedidoSel.id_pedido}</p>
              </div>
              <button onClick={() => setPedidoSel(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
                {pedidoSel.items?.map((item, index) => {
                  const transcurrido = Math.floor((ahora - new Date(pedidoSel.fecha_pedido)) / 60000);
                  const listo = transcurrido >= (item.tiempo_estimado || 15);
                  return (
                    <div key={item.id_detalle} className={`group flex justify-between items-start p-3 ${index !== pedidoSel.items.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{item.cantidad}</span>
                        <div>
                          <p className="text-sm text-slate-900 font-medium">{item.nombre}</p>
                          <p className={`text-[11px] mt-1 font-medium ${listo ? 'text-teal-600' : 'text-slate-400'}`}>{listo ? 'Listo para servir' : `${transcurrido}m en proceso`}</p>
                        </div>
                      </div>
                      <button onClick={() => eliminarPlato(item.id_detalle)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                  );
                })}
              </div>

              {nuevaObs && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 shadow-sm mt-4">
                   <p className="text-xs text-orange-800 font-medium">Nota: {nuevaObs}</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-200 shrink-0">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-sm font-medium text-slate-500">Total a pagar</span>
                 <span className="text-2xl font-bold text-slate-900">S/ {Number.parseFloat(pedidoSel.total).toFixed(2)}</span>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  {/* LÓGICA CORREGIDA: Se envía el pedidoSel completo al componente padre (ViewMesasMozo) */}
                  <button onClick={() => { onAgregarPlatos(pedidoSel); setPedidoSel(null); }} className="bg-white text-slate-700 py-3 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">Añadir Items</button>
                  <button onClick={() => { onShowTicket(pedidoSel); setPedidoSel(null); }} className="bg-teal-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all shadow-sm shadow-teal-600/20">Cobrar</button>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorPedidos;