import React from 'react';
import wayraApi from '../../api/wayraApi'; 

const ListaPedidos = ({ pedidos = [], onUpdate }) => {
  const handlePagar = async (idPedido) => {
    if (!window.confirm("¿Confirmas el cobro de esta mesa?")) return;
    try {
      const res = await wayraApi.put(`/pedidos/${idPedido}/pagar`);
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
      <div className="text-center opacity-30 mt-10 italic text-[10px] tracking-[0.3em] uppercase">
        Sin pedidos registrados hoy
      </div>
    );
  }
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {pedidos.map(pedido => (
        <div key={pedido.id_pedido} className="bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-700 shadow-xl transition-all hover:border-blue-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xl font-black italic text-white tracking-tighter">MESA #{pedido.id_mesa}</span>
            <span className={`text-[7px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
              pedido.estado_pedido === 'PAGADO' ? 'bg-emerald-500 text-black' : 'bg-blue-600 text-white'
            }`}>
              {pedido.estado_pedido}
            </span>
          </div>
          
          <p className="text-[10px] text-blue-400 font-black mb-4 italic">
            TOTAL: S/ {parseFloat(pedido.total).toFixed(2)}
          </p>
          
          {pedido.estado_pedido !== 'PAGADO' && (
            <button 
              onClick={() => handlePagar(pedido.id_pedido)} 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl text-[9px] font-black uppercase italic tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              💳 COBRAR IZIPAY
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
export default ListaPedidos;
