import React, { useEffect, useState } from 'react';
import wayraApi from '../../api/wayraApi'; 
import styles from './ModalBoleta.module.css'; 

const ModalBoleta = ({ idPedido, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBoleta = async () => {
      try {
        const res = await wayraApi.get(`/admin/boleta/${idPedido}`);
        setData(res.data);
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
      <div className="fixed inset-0 bg-white/40 backdrop-blur-md z-50 flex items-center justify-center uppercase tracking-[0.5em] text-[10px]">
        Generando Documento...
      </div>
    );
  }
  if (!data) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${styles.overlay}`}>
      <div className={`max-w-md w-full animate-in fade-in zoom-in-95 duration-500 ${styles.ticketContainer}`}>
        {/* Detalle Kintsugi (Clase global de tu index.css) */}
        <div className="kintsugi-accent !opacity-40"></div>
        <div className="p-10">
          <header className="text-center mb-10">
            <div className={styles.hankoStatus}>
              WAYRA<br/>NKK
            </div>
            <h1 className="text-3xl font-extralight tracking-[0.4em] uppercase gold-shimmer italic">Comprobante</h1>
            <div className="h-[1px] w-12 bg-[#c5a059] mx-auto mt-2 opacity-50"></div>
          </header>
          <div className="space-y-4 mb-10 text-[9px] tracking-[0.2em] uppercase text-[#555] font-medium">
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span>Nº Pedido</span>
              <span className="text-[#121212]">#00{data.pedido.id_pedido}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span>Cliente</span>
              <span className="text-[#121212]">{data.pedido.nombre_cliente}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span>Documento</span>
              <span className="text-[#121212]">{data.pedido.dni_cliente}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha</span>
              <span className="text-[#121212]">{new Date(data.pedido.fecha_pedido).toLocaleDateString()}</span>
            </div>
          </div>
          <table className="w-full mb-10">
            <thead>
              <tr className="text-[8px] tracking-[0.3em] uppercase text-[#b07d62] border-b border-[#b07d62]/20">
                <th className="text-left py-2 font-black italic">Cant.</th>
                <th className="text-left py-2 font-black italic">Producto</th>
                <th className="text-right py-2 font-black italic">Subtotal</th>
              </tr>
            </thead>
            <tbody className="text-[10px] tracking-widest text-[#2d3436]">
              {data.items.map((item, index) => (
                <tr key={index} className="border-b border-black/5">
                  <td className="py-4 font-light text-[#b07d62]">{item.cantidad}</td>
                  <td className="py-4 font-light uppercase">{item.producto}</td>
                  <td className="py-4 text-right font-light">S/ {item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mb-10">
            <span className="text-[8px] tracking-[0.5em] uppercase text-[#b07d62] font-black italic">Total General</span>
            <span className="text-3xl font-extralight tracking-tighter text-[#121212]">
              S/ {data.pedido.total}
            </span>
          </div>
          <footer className="text-center opacity-40 text-[7px] tracking-[0.3em] uppercase leading-loose">
            Gracias por compartir la experiencia<br/>
            Wayra Nikkei · Lima — Tokyo<br/>
            <span className="text-[#c5a059]">Patrimonio & Tradición</span>
          </footer>
        </div>
        {/* ACCIONES - Ocultas en impresión */}
        <div className={`flex border-t border-black/5 ${styles.noPrint}`}>
          <button 
            onClick={() => window.print()}
            className="flex-1 py-5 text-[9px] tracking-[0.4em] uppercase font-bold hover:bg-[#b07d62] hover:text-white transition-all duration-500 border-r border-black/5"
          >
            Imprimir
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-5 text-[9px] tracking-[0.4em] uppercase font-bold hover:bg-[#8a3324] hover:text-white transition-all duration-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
export default ModalBoleta;
