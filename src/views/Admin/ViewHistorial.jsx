import React, { useState, useEffect } from 'react';
import { pedidoService } from '../../services/pedidoService';
import wayraApi from '../../api/wayraApi'; // Se mantiene solo para acceder a la baseURL de las boletas impresas

export const ViewHistorial = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState(new Date().toLocaleDateString('en-CA'));

  const cargarHistorial = async () => {
    try {
      // ✅ ARQUITECTURA SENIOR: Consumo del servicio centralizado pasándole la fecha filtrada
      const data = await pedidoService.getHistorial(filtroFecha);
      setPedidos(data);
    } catch (e) { 
      console.error("Error al cargar historial desde el servicio:", e); 
    }
  };

  useEffect(() => { 
    cargarHistorial(); 
  }, [filtroFecha]);

  return (
    <div className="animate-in fade-in zoom-in-98 duration-500 space-y-6">
      
      {/* 📄 CABECERA ADAPTATIVA */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 italic tracking-tighter uppercase">Historial de Ventas</h2>
          <p className="text-[10px] text-[#b07d62] font-black mt-2 tracking-widest uppercase font-sans">Auditoría de pedidos finalizados</p>
        </div>
        
        {/* FILTRADO DE FECHAS ESTILIZADO */}
        <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
          <p className="text-[8px] text-slate-400 font-black mb-2 uppercase tracking-widest font-sans">Filtrar por fecha</p>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="bg-white border border-slate-200/60 p-3 rounded-2xl text-slate-800 text-xs font-black outline-none focus:border-[#b07d62] focus:ring-1 focus:ring-[#b07d62]/20 shadow-sm transition-all cursor-pointer font-sans w-full sm:w-auto"
          />
        </div>
      </header>

      {/* 🏛️ CONTENEDOR ELÁSTICO CON SCROLL DIAGONAL/TÁCTIL PROTEGIDO */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.02)] overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-slate-50/60 text-[9px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100 font-sans">
            <tr>
              <th className="py-5 px-8">ID TICKET</th>
              <th className="py-5 px-6">HORA</th>
              <th className="py-5 px-6">MOZO</th>
              <th className="py-5 px-6 text-center">MESA</th>
              <th className="py-5 px-6">TOTAL</th>
              <th className="py-5 px-6 text-center">ACCIONES</th>
              <th className="py-5 px-8 text-right">ESTADO</th>
            </tr>
          </thead>
          
          <tbody className="text-[11px] font-bold italic text-slate-700">
            {pedidos.length > 0 ? pedidos.map(p => (
              <tr key={p.id_pedido} className="border-b border-slate-50 hover:bg-slate-50/40 transition-all group">
                {/* ID TICKET EN AZUL MINIMAL */}
                <td className="py-5 px-8 font-mono text-blue-600 font-black not-italic text-[12px]">
                  #TK-{p.id_pedido.toString().padStart(4, '0')}
                </td>
                
                {/* HORA */}
                <td className="py-5 px-6 text-slate-400 font-medium font-sans not-italic">{p.hora}</td>
                
                {/* MOZO */}
                <td className="py-5 px-6 text-slate-800 uppercase tracking-tight">{p.nombre_mozo}</td>
                
                {/* MESA */}
                <td className="py-5 px-6 text-center text-slate-800 not-italic font-black">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-[10px]">
                    {p.id_mesa}
                  </span>
                </td>
                
                {/* TOTAL COMPENSADO */}
                <td className="py-5 px-6 text-slate-900 font-black text-xs not-italic font-sans">
                  S/ {Number.parseFloat(p.total).toFixed(2)}
                </td>
                
                {/* ACCIONES: BOTÓN MINIMALISTA */}
                <td className="py-5 px-6 text-center">
                  <button          
                    onClick={() => window.open(`${wayraApi.defaults.baseURL}/admin/boleta/${p.id_pedido}`, '_blank')}
                    className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 py-2 px-4 rounded-xl border border-slate-200/40 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-[9px] font-black uppercase tracking-widest font-sans shadow-sm"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Boleta
                  </button>
                </td>

                {/* ESTADO CON SUTIL BADGE ESMERALDA */}
                <td className="py-5 px-8 text-right">
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[8px] font-black tracking-widest uppercase border border-emerald-200/30 font-sans not-italic">
                    PAGADO
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="py-24 text-center text-slate-400 font-black tracking-[0.3em] uppercase text-[10px] font-sans bg-slate-50/20">
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