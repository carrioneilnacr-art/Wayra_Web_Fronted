import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import wayraApi from '../../api/wayraApi';

export default function ModalTicketHistorial({ idPedido, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoleta = async () => {
      try {
        setLoading(true);
        const res = await wayraApi.get(`/admin/boleta/${idPedido}`);
        setData(res.data);
      } catch (error) {
        console.error("Error al cargar la boleta", error);
      } finally {
        setLoading(false);
      }
    };
    if (idPedido) {
      fetchBoleta();
    }
  }, [idPedido]);

  if (!idPedido) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0">
      <div className="max-w-md w-full bg-[#fcfaf7] rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-100 print:shadow-none print:border-none animate-in zoom-in-95 duration-300">
        <div className="kintsugi-accent !opacity-40 print:hidden"></div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-200/50 text-slate-500 rounded-full hover:bg-slate-300 transition-colors z-10 print:hidden"
        >
          ✕
        </button>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-[#c5a059]/30 border-t-[#c5a059] rounded-full animate-spin"></div>
            <p className="text-[10px] uppercase tracking-widest text-[#b07d62] font-black">Cargando Comprobante...</p>
          </div>
        ) : data && data.pedido ? (
          <div className="p-8 md:p-10">
            <header className="text-center mb-6">
              <div className="border border-slate-900 text-slate-900 p-2 w-max mx-auto mb-4 text-[8px] font-black leading-none tracking-widest">
                WAYRA<br />NKK
              </div>
              <h1 className="text-2xl font-extralight tracking-[0.4em] uppercase text-[#c5a059] italic">Comprobante</h1>
              <div className="h-[1px] w-12 bg-[#c5a059] mx-auto mt-2 opacity-50"></div>
            </header>

            <div className="space-y-3 mb-6 text-[9px] tracking-[0.2em] uppercase text-slate-500 font-medium">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Nº {data.pago?.tipo_comprobante || 'BOLETA'}</span>
                <span className="text-slate-900 font-bold">#00{data.pedido.id_pedido}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Cliente</span>
                <span className="text-slate-900 font-bold truncate max-w-[150px] text-right">{data.pedido.nombre_cliente || 'CLIENTE GENERAL'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>DNI / RUC</span>
                <span className="text-slate-900 font-bold">{data.pedido.dni_cliente || '---'}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Método</span>
                <span className="text-slate-900 font-bold">{data.pago?.metodo_pago || 'EFECTIVO'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Mozo</span>
                <span className="text-slate-900 font-bold truncate max-w-[150px] text-right">{data.pedido.nombre_mozo || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha</span>
                <span className="text-slate-900 font-bold">
                  {new Date(data.pedido.fecha_pedido).toLocaleDateString()} {new Date(data.pedido.fecha_pedido).toLocaleTimeString().substring(0, 5)}
                </span>
              </div>
            </div>

            <table className="w-full mb-6">
              <thead>
                <tr className="text-[8px] tracking-[0.3em] uppercase text-[#b07d62] border-b border-[#b07d62]/20">
                  <th className="text-left py-2 font-black italic">Cant.</th>
                  <th className="text-left py-2 font-black italic">Producto</th>
                  <th className="text-right py-2 font-black italic">Subtotal</th>
                </tr>
              </thead>
              <tbody className="text-[10px] tracking-widest text-slate-700">
                {data.items?.map((item, index) => (
                  <tr key={`item-${index}`} className="border-b border-slate-100/60">
                    <td className="py-3 font-bold text-[#b07d62]">{item.cantidad}</td>
                    <td className="py-3 font-medium uppercase truncate max-w-[180px]">{item.nombre || item.producto}</td>
                    <td className="py-3 text-right font-bold font-mono text-slate-800">S/ {Number.parseFloat(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mb-6 border-t border-slate-100 pt-4">
              <span className="text-[8px] tracking-[0.5em] uppercase text-[#b07d62] font-black italic">Total</span>
              <span className="text-2xl font-black tracking-tighter text-slate-900 font-sans">
                S/ {Number.parseFloat(data.pedido.total).toFixed(2)}
              </span>
            </div>
            
            <div className="text-center pt-4 print:hidden">
              <button 
                onClick={() => window.print()} 
                className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 py-2 px-4 rounded-xl"
              >
                🖨️ Imprimir Ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-red-500 font-bold">
            No se pudo cargar la información del ticket.
          </div>
        )}
      </div>
    </div>
  );
}

ModalTicketHistorial.propTypes = {
  idPedido: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};
