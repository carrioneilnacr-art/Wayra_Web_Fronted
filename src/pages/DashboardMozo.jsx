import React, { useState, useEffect } from "react";
import wayraApi from "../api/wayraApi"; 
import CardMesaMozo from "../components/Mozo/CardMesaMozo";
import ComanderoCarta from "../views/Mozo/ComanderoCarta"; 
import MonitorPedidos from "../views/Mozo/MonitorPedidos";

const DashboardMozo = ({ onLogout, user }) => {
  const [mesas, setMesas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [mesaSel, setMesaSel] = useState(null);
  const [ticketUrl, setTicketUrl] = useState(null);

  // 2. Carga de datos optimizada con Axios
  const cargarDatos = async () => {
    try {
      // Axios ya sabe que la base es 'https://wayra-web-backend.onrender.com/api'
      const [resM, resP] = await Promise.all([
        wayraApi.get('/mesas'),
        wayraApi.get('/pedidos/hoy')
      ]);
      
      // Con Axios, la info llega directo en .data (sin res.json())
      setMesas(resM.data);
      setPedidos(resP.data);
    } catch (e) { 
      console.error("Error en Wayra API:", e); 
    }
  };

  useEffect(() => {
    cargarDatos();
    const t = setInterval(cargarDatos, 5000);
    return () => clearInterval(t);
  }, []);

  const pedidosActivos = pedidos.filter(p => String(p.id_mozo) === String(user?.id_usuario) && p.estado_pedido !== 'PAGADO');
  
  const intentarAtender = (mesa) => {
    if (mesa.estado === 'disponible' && pedidosActivos.length >= 4) {
      alert("⚠️ LÍMITE ALCANZADO: No puedes atender más de 4 mesas simultáneamente.");
      return;
    }
    setMesaSel(mesa);
  };

  return (
    <div className="flex h-screen bg-wayra text-[#1a1a1a] overflow-hidden relative font-sans">
      <div className="nazca-spirit"></div>

      {/* PANEL IZQUIERDO: SELECCIÓN DE MESAS */}
      <aside className="w-[28%] border-r border-black/5 p-6 overflow-y-auto backdrop-blur-sm bg-white/20">
        <header className="mb-10 flex justify-between items-center bg-white/40 p-5 rounded-sm border border-[#b07d62]/10 shadow-sm relative">
           <div className="kintsugi-clay"></div>
           <div>
             <h1 className="text-xl font-extralight tracking-[0.3em] text-[#1a1a1a] uppercase italic">
               Wayra<span className="font-bold text-[#c5a059]">.STAFF</span>
             </h1>
             <p className="text-[9px] font-medium text-[#b07d62] tracking-[0.4em] uppercase mt-1">
               Mozo: {user?.nombre}
             </p>
           </div>
           <button 
             onClick={onLogout} 
             className="text-[#8a3324] hover:bg-[#8a3324] hover:text-white border border-[#8a3324]/20 p-2 px-3 rounded-sm text-[8px] font-bold tracking-widest transition-all uppercase"
           >
             Salir
           </button>
        </header>

        <div className="space-y-8">
          <section>
            <h2 className="text-[8px] font-black mb-4 text-[#2d3436]/60 tracking-[0.5em] uppercase">Estado de Carga</h2>
            <div className="h-1 w-full bg-[#2d3436]/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ${pedidosActivos.length >= 4 ? 'bg-[#8a3324]' : 'bg-[#c5a059]'}`}
                style={{ width: `${(pedidosActivos.length / 4) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-[7px] tracking-widest text-[#b07d62] uppercase font-bold">
                    {pedidosActivos.length >= 4 ? 'Límite Crítico' : 'Capacidad Normal'}
                </span>
                <p className="text-[9px] text-[#2d3436] font-light tracking-widest">
                    {pedidosActivos.length} <span className="opacity-40">/</span> 4 MESAS
                </p>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            {mesas.map(m => (
              <CardMesaMozo key={m.id_mesa} mesa={m} onClick={() => intentarAtender(m)} />
            ))}
          </section>
        </div>
      </aside>

      {/* PANEL CENTRAL: COMANDERO */}
      <main className="flex-1 bg-[#f4f1ea]/30 p-8 overflow-y-auto relative border-r border-black/5">
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
          <div className="h-full flex flex-col items-center justify-center">
            <div className="opacity-5 scale-150 grayscale mb-6">
                <span className="text-9xl">🥢</span>
            </div>
            <p className="text-[10px] font-extralight tracking-[0.8em] text-[#2d3436] uppercase italic">
              Seleccione una mesa para operar
            </p>
            <div className="w-12 h-[1px] bg-[#c5a059] mt-4 opacity-30"></div>
          </div>
        )}
      </main>

      {/* PANEL DERECHO: MONITOR */}
      <aside className="w-[32%] p-6 overflow-y-auto bg-white/40 backdrop-blur-sm">
         <header className="mb-6">
            <h2 className="text-[9px] font-black text-[#6b705c] tracking-[0.4em] uppercase border-b border-[#6b705c]/20 pb-2">
                Monitor de cocina
            </h2>
         </header>
         <MonitorPedidos 
           pedidos={pedidos} 
           userLogueado={user} 
           onUpdate={cargarDatos} 
           onShowTicket={(url) => setTicketUrl(url)}
         />
      </aside>

      {/* MODAL DE TICKET */}
      {ticketUrl && (
        <div className="fixed inset-0 bg-[#2d3436]/40 backdrop-blur-md z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="main-card w-full max-w-xl h-[85vh] bg-[#fcfaf7] shadow-2xl flex flex-col overflow-hidden">
            <div className="kintsugi-accent !opacity-40"></div>
            
            <div className="flex justify-between items-center p-6 border-b border-black/5">
              <span className="text-[#c5a059] text-[9px] font-bold tracking-[0.4em] uppercase">
                ✓ Vista Previa de Comprobante
              </span>
              <button 
                onClick={() => setTicketUrl(null)} 
                className="text-[#1a1a1a] hover:bg-[#8a3324] hover:text-white px-4 py-2 rounded-sm text-[8px] font-bold tracking-widest uppercase transition-colors"
              >
                Cerrar
              </button>
            </div>
            
            <div className="flex-1 bg-white p-4">
               <iframe src={ticketUrl} className="w-full h-full border-none" title="Boleta Wayra"></iframe>
            </div>

            <div className="p-4 bg-[#f4f1ea] text-center">
                <p className="text-[7px] tracking-[0.5em] text-[#b07d62] uppercase">
                    Wayra Nikkei — Experiencia Gastronómica
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMozo;