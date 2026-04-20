import React, { useState, useEffect } from 'react';
import wayraApi from '../../api/wayraApi'; // Instancia maestra

export const ViewHistorial = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState(new Date().toLocaleDateString('en-CA'));

  // 1. Cargar Historial con Axios
  const cargarHistorial = async () => {
    try {
      // Usamos la instancia centralizada. Axios maneja el query param automáticamente.
      const res = await wayraApi.get(`/admin/historial?fecha=${filtroFecha}`);
      setPedidos(res.data);
    } catch (e) { 
      console.error("Error al cargar historial de Render:", e); 
    }
  };

  useEffect(() => { 
    cargarHistorial(); 
  }, [filtroFecha]);

  return (
    <div className="animate-in fade-in duration-700">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Historial de Ventas</h2>
          <p className="text-[10px] text-emerald-500 font-black mt-2 tracking-widest uppercase">Auditoría de pedidos finalizados</p>
        </div>
        
        <div className="flex flex-col items-end">
          <p className="text-[8px] text-slate-500 font-black mb-2 uppercase">Filtrar por fecha</p>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="bg-[#161B22] border border-white/10 p-3 rounded-xl text-white text-xs font-black outline-none focus:border-blue-600 transition-all cursor-pointer"
          />
        </div>
      </header>

      <div className="bg-[#161B22] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[9px] text-slate-500 uppercase font-black">
            <tr>
              <th className="p-6">ID TICKET</th>
              <th className="p-6">HORA</th>
              <th className="p-6">MOZO</th>
              <th className="p-6 text-center">MESA</th>
              <th className="p-6">TOTAL</th>
              <th className="p-6">ACCIONES</th>
              <th className="p-6 text-right">ESTADO</th>
            </tr>
          </thead>
          
          <tbody className="text-[11px] font-bold italic">
            {pedidos.length > 0 ? pedidos.map(p => (
              <tr key={p.id_pedido} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                <td className="p-6 text-blue-500">#TK-{p.id_pedido.toString().padStart(4, '0')}</td>
                <td className="p-6 text-slate-400">{p.hora}</td>
                <td className="p-6 text-white uppercase">{p.nombre_mozo}</td>
                <td className="p-6 text-center text-white">{p.id_mesa}</td>
                <td className="p-6 text-emerald-500 font-black text-xs">S/ {parseFloat(p.total).toFixed(2)}</td>
                
                <td className="p-6">
                  <button
                    // Usamos la URL base de la instancia para mantener la coherencia
                    onClick={() => window.open(`${wayraApi.defaults.baseURL}/admin/boleta/${p.id_pedido}`, '_blank')}
                    className="bg-white/5 text-white p-3 rounded-xl hover:bg-white hover:text-black transition-all text-[9px] font-black uppercase tracking-tighter"
                  >
                    📄 Ver Boleta
                  </button>
                </td>

                <td className="p-6 text-right">
                  <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase">
                    PAGADO
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="p-20 text-center text-slate-600 font-black tracking-[0.5em] uppercase">
                  No hay registros para esta fecha
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};