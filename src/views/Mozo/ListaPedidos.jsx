import React from 'react';
import { pedidoService } from '../../services/pedidoService';

const ListaPedidos = ({ pedidos = [], onUpdate }) => {
  
  const handlePagar = async (idPedido) => {
    if (!window.confirm("¿Confirmas el cobro de esta mesa?")) return;
    try {
      // ✅ ARQUITECTURA SENIOR: Llamada a través de la capa de infraestructura aislada
      const res = await pedidoService.pagarPedido(idPedido);
      if (res.status === 200) {
        onUpdate();
      }
    } catch (e) { 
      console.error("Error al cobrar por IZIPAY:", e);
      alert("Hubo un problema al procesar el pago. Verifica la conexión.");
    }
  };

  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    return (
      <div className="text-center opacity-40 mt-10 italic text-[10px] tracking-[0.3em] uppercase font-bold text-slate-400">
        Sin pedidos registrados hoy
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500 w-full">
      {pedidos.map(pedido => {
        const esPagado = pedido.estado_pedido === 'PAGADO';

        return (
          <div 
            key={pedido.id_pedido} 
            className={`bg-white p-5 rounded-[2rem] border transition-all flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] h-44
              ${esPagado ? 'border-emerald-200/50 bg-emerald-50/10' : 'border-slate-100'}`}
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-black italic text-slate-800 tracking-tighter">MESA #{pedido.id_mesa}</span>
                <span className={`text-[8px] px-2.5 py-1 rounded-xl font-black uppercase tracking-widest border not-italic font-sans
                  ${esPagado 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200/40' 
                    : 'bg-blue-50 text-blue-600 border-blue-100'}`}
                >
                  {pedido.estado_pedido}
                </span>
              </div>
              
              <p className="text-[11px] text-slate-400 font-bold italic tracking-wide">
                TICKET: <span className="font-mono not-italic text-slate-600 font-black">#TK-{pedido.id_pedido.toString().padStart(4, '0')}</span>
              </p>
              
              <p className="text-[12px] text-slate-800 font-black mt-2 font-sans not-italic">
                TOTAL: <span className="text-emerald-600 font-extrabold font-sans">S/ {Number.parseFloat(pedido.total).toFixed(2)}</span>
              </p>
            </div>
            
            {!esPagado && (
              <button 
                onClick={() => handlePagar(pedido.id_pedido)} 
                className="w-full bg-[#0a0913] hover:bg-blue-600 text-white py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm not-italic flex items-center justify-center gap-2"
              >
                <span>💳 COBRAR IZIPAY</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ListaPedidos;