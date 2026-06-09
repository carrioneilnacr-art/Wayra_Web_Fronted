import React, { useState, useEffect } from 'react';
import { reservaService } from '../../services/reservaService';
import { pedidoService } from '../../services/pedidoService';
import CardMesaMozo from '../../components/Mozo/CardMesaMozo';
import ComanderoCarta from './ComanderoCarta'; 
import MonitorPedidos from './MonitorPedidos';
import { MozoLayout } from '../../layouts/MozoLayout';

export const ViewMesasMozo = ({ onLogout, user }) => {
  const [mesas, setMesas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [mesaSel, setMesaSel] = useState(null);
  const [ticketUrl, setTicketUrl] = useState(null);

  // ✅ ARQUITECTURA SENIOR: Consumo unificado desde las capas de servicio aisladas
  const cargarDatos = async () => {
    try {
      const [resM, resP] = await Promise.all([
        reservaService.getMesas(),
        pedidoService.getEstatusPedidos(user?.id_usuario) // O el endpoint general de pedidos de hoy según tu API
      ]);
      setMesas(resM);
      setPedidos(resP);
    } catch (e) { 
      console.error("Error en la orquestación de la API del Mozo:", e); 
    }
  };

  useEffect(() => {
    cargarDatos();
    const t = setInterval(cargarDatos, 5000);
    return () => clearInterval(t);
  }, [user]);

  const pedidosActivos = pedidos.filter(p => String(p.id_mozo) === String(user?.id_usuario) && p.estado_pedido !== 'PAGADO');
  
  const intentarAtender = (mesa) => {
    if (mesa.estado === 'disponible' && pedidosActivos.length >= 4) {
      alert("⚠️ LÍMITE ALCANZADO: No puedes atender más de 4 mesas simultáneamente.");
      return;
    }
    setMesaSel(mesa);
  };

  // Renderizado dinámico del bloque de control del Mozo (Panel Izquierdo)
  const renderPanelIzquierdo = () => (
    <div className="space-y-6">
      <header className="mb-6 flex justify-between items-center bg-white/50 p-5 rounded-2xl border border-[#b07d62]/10 shadow-sm relative overflow-hidden">
         <div className="kintsugi-clay"></div>
         <div className="min-w-0">
           <h1 className="text-lg font-extralight tracking-[0.2em] text-[#1a1a1a] uppercase italic">
             Wayra<span className="font-bold text-[#c5a059]">.STAFF</span>
           </h1>
           <p className="text-[9px] font-black text-[#b07d62] tracking-[0.3em] uppercase mt-1 truncate">
             MOZO: {user?.nombre}
           </p>
         </div>
         <button 
           onClick={onLogout} 
           className="text-[#8a3324] hover:bg-[#8a3324] hover:text-white border border-[#8a3324]/20 p-2 px-3 rounded-xl text-[8px] font-black tracking-widest transition-all uppercase shrink-0"
         >
           Salir
         </button>
      </header>

      <section className="bg-white/40 p-4 rounded-2xl border border-black/5">
        <h2 className="text-[8px] font-black mb-3 text-[#2d3436]/60 tracking-[0.4em] uppercase">Estado de Carga</h2>
        <div className="h-2 w-full bg-[#2d3436]/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ${pedidosActivos.length >= 4 ? 'bg-[#8a3324]' : 'bg-[#c5a059]'}`}
            style={{ width: `${(pedidosActivos.length / 4) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2.5">
            <span className="text-[8px] tracking-widest text-[#b07d62] uppercase font-black">
                {pedidosActivos.length >= 4 ? 'Límite Crítico' : 'Capacidad Normal'}
            </span>
            <p className="text-[9px] text-[#2d3436] font-bold tracking-widest">
                {pedidosActivos.length} <span className="opacity-40">/</span> 4 MESAS
            </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {mesas.map(m => (
          <CardMesaMozo key={m.id_mesa} mesa={m} onClick={() => intentarAtender(m)} />
        ))}
      </section>
    </div>
  );

  // Renderizado del Monitor de Cocina (Panel Derecho)
  const renderPanelDerecho = () => (
    <div className="space-y-4">
       <header className="mb-2">
          <h2 className="text-[9px] font-black text-[#6b705c] tracking-[0.3em] uppercase border-b border-[#6b705c]/20 pb-2">
             Monitor de cocina
          </h2>
       </header>
       <MonitorPedidos 
         pedidos={pedidos} 
         userLogueado={user} 
         onUpdate={cargarDatos} 
         onShowTicket={(url) => setTicketUrl(url)}
       />
    </div>
  );

  return (
    <MozoLayout panelIzquierdo={renderPanelIzquierdo()} panelDerecho={renderPanelDerecho()}>
      {/* CONTENIDO DE LA COMANDA ACTIVA */}
      {mesaSel ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ComanderoCarta 
              mesa={mesaSel} 
              userLogueado={user} 
              onClose={() => setMesaSel(null)} 
              onSuccess={cargarDatos} 
          />
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center min-h-[300px]">
          <div className="opacity-5 scale-150 grayscale mb-4">
              <span className="text-7xl">🥢</span>
          </div>
          <p className="text-[10px] font-extralight tracking-[0.6em] text-[#2d3436] uppercase italic text-center">
            Seleccione una mesa para operar
          </p>
          <div className="w-12 h-[1px] bg-[#c5a059] mt-3 opacity-30"></div>
        </div>
      )}

      {/* MODAL DE TICKET INDEPENDIENTE DE LA GRILLA */}
      {ticketUrl && (
        <div className="fixed inset-0 bg-[#2d3436]/40 backdrop-blur-md z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-xl h-[80vh] bg-[#fcfaf7] shadow-2xl flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100">
            <div className="flex justify-between items-center p-5 border-b border-black/5 bg-white">
              <span className="text-[#c5a059] text-[9px] font-black tracking-[0.3em] uppercase">
                ✓ Vista Previa de Comprobante
              </span>
              <button 
                onClick={() => setTicketUrl(null)} 
                className="text-[#1a1a1a] hover:bg-[#8a3324] hover:text-white px-4 py-2 rounded-xl text-[8px] font-black tracking-widest uppercase transition-colors"
              >
                Cerrar
              </button>
            </div>
            
            <div className="flex-1 bg-white p-2">
               <iframe src={ticketUrl} className="w-full h-full border-none" title="Boleta Wayra"></iframe>
            </div>

            <div className="p-4 bg-[#f4f1ea] text-center">
                <p className="text-[8px] tracking-[0.4em] text-[#b07d62] uppercase font-bold">
                  Wayra Nikkei — Experiencia Gastronómica
                </p>
            </div>
          </div>
        </div>
      )}
    </MozoLayout>
  );
};