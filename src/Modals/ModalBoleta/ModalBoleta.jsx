import React, { useEffect, useState } from 'react';
import { pedidoService } from '../../services/pedidoService';

const ModalBoleta = ({ idPedido, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoleta = async () => {
      try {
        // ✅ ARQUITECTURA SENIOR: Consumo desde el servicio unificado (reemplaza wayraApi directo)
        const res = await pedidoService.getHistorial(idPedido); // O tu endpoint específico de boleta mapeado
        // Si tu backend responde directo la data, usa res, de lo contrario res.data según el mapeo anterior
        setData(res);
      } catch (error) {
        console.error("Error al generar boleta:", error);
      } finally {
        setLoading(false);
      }
    };
    if (idPedido) fetchBoleta();
  }, [idPedido]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/40 backdrop-blur-md z-50 flex items-center justify-center uppercase tracking-[0.5em] text-[10px] font-black text-slate-400">
        Generando Documento...
      </div>
    );
  }

  if (!data) return null;

  return (
    // ✅ overlay purificado: Soporta fondo blanco nativo al imprimir con 'print:bg-white print:backdrop-filter-none'
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-700/20 backdrop-blur-md print:bg-white print:backdrop-blur-none">
      
      {/* ✅ ticketContainer purificado: fondo tradicional kintsugi #fcfaf7 sin shadow en impresión */}
      <div className="max-w-md w-full bg-[#fcfaf7] rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-100 print:shadow-none print:border-none animate-in fade-in zoom-in-95 duration-500">
        
        {/* Detalle Kintsugi (Clase global de tu index.css) */}
        <div className="kintsugi-accent !opacity-40 print:hidden"></div>
        
        <div className="p-8 md:p-10">
          <header className="text-center mb-8">
            {/* ✅ hankoStatus purificado a Tailwind nativo */}
            <div className="border border-slate-900 text-slate-900 p-2 w-max mx-auto mb-4 text-[8px] font-black leading-none tracking-widest">
              WAYRA<br/>NKK
            </div>
            <h1 className="text-2xl font-extralight tracking-[0.4em] uppercase gold-shimmer italic">Comprobante</h1>
            <div className="h-[1px] w-12 bg-[#c5a059] mx-auto mt-2 opacity-50"></div>
          </header>

          {/* DATOS DEL CLIENTE */}
          <div className="space-y-3 mb-8 text-[9px] tracking-[0.2em] uppercase text-slate-500 font-medium">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span>Nº Pedido</span>
              <span className="text-slate-900 font-bold">#00{data.pedido?.id_pedido}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span>Cliente</span>
              <span className="text-slate-900 font-bold">{data.pedido?.nombre_cliente}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span>Documento</span>
              <span className="text-slate-900 font-bold">{data.pedido?.dni_cliente || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha</span>
              <span className="text-slate-900 font-bold">{new Date(data.pedido?.fecha_pedido).toLocaleDateString()}</span>
            </div>
          </div>

          {/* TABLA DE ITEMS */}
          <table className="w-full mb-8">
            <thead>
              <tr className="text-[8px] tracking-[0.3em] uppercase text-[#b07d62] border-b border-[#b07d62]/20">
                <th className="text-left py-2 font-black italic">Cant.</th>
                <th className="text-left py-2 font-black italic">Producto</th>
                <th className="text-right py-2 font-black italic">Subtotal</th>
              </tr>
            </thead>
            <tbody className="text-[10px] tracking-widest text-slate-700">
              {data.items?.map((item, index) => (
                <tr key={index} className="border-b border-slate-100/60">
                  <td className="py-3.5 font-bold text-[#b07d62]">{item.cantidad}</td>
                  <td className="py-3.5 font-medium uppercase truncate max-w-[180px]">{item.producto}</td>
                  <td className="py-3.5 text-right font-bold font-mono text-slate-800">S/ {parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTAL GENERAL */}
          <div className="flex justify-between items-center mb-8 border-t border-slate-100 pt-4">
            <span className="text-[8px] tracking-[0.5em] uppercase text-[#b07d62] font-black italic">Total General</span>
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-sans">
              S/ {parseFloat(data.pedido?.total).toFixed(2)}
            </span>
          </div>

          <footer className="text-center opacity-50 text-[7px] tracking-[0.3em] uppercase leading-loose text-slate-400">
            Gracias por compartir la experiencia<br/>
            Wayra Nikkei · Lima — Tokyo<br/>
            <span className="text-[#c5a059] font-bold">Patrimonio & Tradición</span>
          </footer>
        </div>

        {/* ACCIONES - Ocultas nativamente en impresión con 'print:hidden' */}
        <div className="flex border-t border-slate-100 print:hidden shrink-0">
          <button 
            onClick={() => window.print()}
            className="flex-1 py-4.5 bg-slate-50 text-slate-700 text-[9px] tracking-[0.3em] uppercase font-black hover:bg-[#b07d62] hover:text-white transition-all duration-300 border-r border-slate-100 flex items-center justify-center gap-1"
          >
            🖨️ Imprimir
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-4.5 bg-slate-50 text-rose-600 text-[9px] tracking-[0.3em] uppercase font-black hover:bg-rose-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-1"
          >
            ✕ Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalBoleta;