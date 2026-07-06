import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { reservaService } from '../../services/reservaService';
import { pedidoService } from '../../services/pedidoService';
import { productoService } from '../../services/productoService';
import CardMesaMozo from '../../components/Mozo/CardMesaMozo';
import ComanderoCarta from './ComanderoCarta'; 
import MonitorPedidos from './MonitorPedidos';
import ModalCheckout from "../../components/Mozo/ModalCheckout";
import { MozoLayout } from '../../layouts/MozoLayout';

export const ViewMesasMozo = ({ onLogout, user }) => {
  const [mesas, setMesas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cartaCache, setCartaCache] = useState([]);
  const [mesaSel, setMesaSel] = useState(null);
  const [checkoutPedido, setCheckoutPedido] = useState(null);
  
  const [horaLocal, setHoraLocal] = useState(new Date());

  const cargarDatos = async () => {
    try {
      console.log("DEBUG CARGARDATOS: isMock?", !!reservaService.getMesas.mock);
      const [resM, resP, resR, resC] = await Promise.all([
        reservaService.getMesas(),
        pedidoService.getEstatusPedidos(user?.id_usuario),
        pedidoService.getReservasMozoHoy(user?.id_usuario),
        productoService.getTodos()
      ]);
      setMesas(resM?.data || resM || []);
      setPedidos(resP?.data || resP || []);
      setReservas(resR?.data || resR || []);
      setCartaCache(resC || []);
    } catch (e) { 
      console.error("Error en la API:", e); 
    }
  };

  useEffect(() => {
    cargarDatos();
    const t = setInterval(cargarDatos, 5000);
    const intervalHora = setInterval(() => setHoraLocal(new Date()), 60000);
    return () => { clearInterval(t); clearInterval(intervalHora); };
  }, [user]);

  const misPedidosActivos = pedidos.filter(p => p.estado_pedido !== 'PAGADO' && String(p.id_mozo) === String(user?.id_usuario));
  const misIdsMesas = misPedidosActivos.map(p => p.id_mesa);
  const misMesasOcupadasCount = new Set(misIdsMesas).size;
  
  const intentarAtender = (mesa) => {
    const esMia = misIdsMesas.includes(mesa.id_mesa);
    if (mesa.estado === 'ocupada' && !esMia) {
      alert("⛔ MESA PROTEGIDA: Esta mesa está siendo atendida por otro compañero.");
      return;
    }
    if (mesa.estado === 'disponible' && misMesasOcupadasCount >= 4) {
      alert("⚠️ LÍMITE ALCANZADO: No puedes atender más de 4 mesas simultáneamente.");
      return;
    }
    setMesaSel(mesa);
  };

  const obtenerPedidoExistente = () => {
    if (!mesaSel) return null;
    if (mesaSel.id_pedido) return mesaSel; 
    return pedidos.find(p => p.id_mesa === mesaSel.id_mesa && p.estado_pedido !== 'PAGADO');
  };

  let colorCapacidad = 'bg-rose-500';
  if (misMesasOcupadasCount <= 2) {
    colorCapacidad = 'bg-emerald-500';
  } else if (misMesasOcupadasCount === 3) {
    colorCapacidad = 'bg-amber-400';
  }

  const renderPanelIzquierdo = () => (
    <div className="relative w-full min-h-full flex flex-col">
      <div className="max-w-7xl mx-auto w-full relative z-10 flex-1 flex flex-col">
        
        {/* HEADER PREMIUM */}
        <header className="flex justify-between items-center pb-6 mb-8 border-b border-slate-200/80">
           
           <div className="flex items-center gap-4">
              {/* TU LOGO KINTSUGI/ZEN VECTORIAL */}
              <div className="w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm hover:scale-105 transition-transform">
                  <path d="M80 50 C 80 25, 55 20, 40 25 C 20 35, 20 70, 45 80 C 70 90, 85 75, 80 45" fill="none" stroke="#c5a059" strokeWidth="6" strokeLinecap="round"></path>
                  <circle cx="50" cy="50" r="6" fill="#121212"></circle>
                </svg>
              </div>
              <div>
                 <h1 className="text-lg font-bold text-slate-900 tracking-tight uppercase leading-none">Wayra <span className="font-light text-slate-500">Nikkei</span></h1>
                 <p className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">Mozo: {user?.nombre}</p>
              </div>
           </div>

           <div className="hidden md:flex flex-col items-center justify-center px-8 border-x border-slate-200/80">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                Atención Activa ({misMesasOcupadasCount}/4)
              </span>
              <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                 <div className={`h-full transition-all duration-700 ease-out ${colorCapacidad}`} style={{ width: `${(misMesasOcupadasCount / 4) * 100}%` }}></div>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="text-right">
                 <p className="text-xl font-medium text-slate-800 tracking-tighter leading-none">
                   {horaLocal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                   {horaLocal.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                 </p>
              </div>
              
              <button 
                onClick={onLogout} 
                title="Cerrar Sesión"
                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"
              >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
           </div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
          {mesas.map(m => (
            <CardMesaMozo key={m.id_mesa} mesa={m} isSelected={mesaSel?.id_mesa === m.id_mesa} onClick={() => intentarAtender(m)} />
          ))}
        </section>

      </div>
    </div>
  );

  const renderPanelDerecho = () => (
    <div className="h-full bg-white">
       <MonitorPedidos 
         pedidos={pedidos} 
         reservas={reservas} 
         mesas={mesas} 
         userLogueado={user} 
         onUpdate={cargarDatos} 
         onShowTicket={(pedidoObj) => setCheckoutPedido(pedidoObj)} 
         onAgregarPlatos={(pedidoObj) => setMesaSel(pedidoObj)} 
       />
    </div>
  );

  return (
    <MozoLayout panelIzquierdo={renderPanelIzquierdo()} panelDerecho={renderPanelDerecho()}>
      {mesaSel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-200">
          <div className="bg-slate-50 w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            <ComanderoCarta 
                mesa={mesaSel} 
                pedidoExistente={obtenerPedidoExistente()}
                userLogueado={user} 
                productosCache={cartaCache} 
                onClose={() => setMesaSel(null)} 
                onSuccess={() => { cargarDatos(); setMesaSel(null); }} 
            />
          </div>
        </div>
      )}

      {checkoutPedido && (
        <ModalCheckout
          pedido={checkoutPedido}
          reservas={reservas}
          onClose={() => setCheckoutPedido(null)}
          onSuccess={() => cargarDatos()}
        />
      )}
    </MozoLayout>
  );
};

ViewMesasMozo.propTypes = {
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombre: PropTypes.string,
  }).isRequired,
};