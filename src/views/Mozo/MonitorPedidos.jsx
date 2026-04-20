import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import wayraApi from '../../api/wayraApi'; 
import ComanderoCarta from './ComanderoCarta';

const MonitorPedidos = ({ pedidos = [], onUpdate, userLogueado, onShowTicket }) => {
  const [pedidoSel, setPedidoSel] = useState(null);
  const [fase, setFase] = useState('detalle'); 
  const [metodoPago, setMetodoPago] = useState('YAPE');
  const [clienteExtra, setClienteExtra] = useState({ documento: '', nombre: '' });
  const [ahora, setAhora] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [nuevaObs, setNuevaObs] = useState("");
  const [proximasReservas, setProximasReservas] = useState([]);
  const misPedidos = pedidos.filter(p => String(p.id_mozo) === String(userLogueado?.id_usuario) && p.estado_pedido !== 'PAGADO');

  const cargarMisReservas = async () => {
    try {
      if (!userLogueado?.id_usuario) return;
      const res = await wayraApi.get(`/reservas/hoy?id_mozo=${userLogueado.id_usuario}`);
      setProximasReservas(res.data); 
    } catch (e) { 
      console.error("Error cargando reservas del mozo:", e); 
    }
  };
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 10000);
    cargarMisReservas();
    return () => clearInterval(t);
  }, [userLogueado]);
  useEffect(() => {
    if (pedidoSel) setNuevaObs(pedidoSel.observacion || "");
  }, [pedidoSel]);

  const eliminarPlato = async (idDetalle) => {
    if (!window.confirm("¿Eliminar este plato del pedido?")) return;
    try {
      await wayraApi.delete(`/pedidos/detalle/${idDetalle}`);
      onUpdate(); 
      setPedidoSel(null);
    } catch (e) { 
      console.error("No se pudo eliminar el plato:", e); 
    }
  };
  const generarTicketPDF = (pedido, tipoDoc) => {
    const doc = new jsPDF({ format: [80, 180] });
    const ancho = 80;
    doc.setFont("courier", "bold"); doc.setFontSize(10);
    doc.text("WAYRA NIKKEI S.A.C.", ancho/2, 10, {align:'center'});
    doc.setFontSize(7);
    doc.text("R.U.C. 20612345678", ancho/2, 14, {align:'center'});
    doc.text("AV. CARLOS IZAGUIRRE 123", ancho/2, 17, {align:'center'});
    doc.text("--------------------------------", ancho/2, 22, {align:'center'});
    doc.text(`${tipoDoc} ELECTRÓNICA`, ancho/2, 26, {align:'center'});
    doc.text(`F001-${String(pedido.id_pedido).padStart(6, '0')}`, ancho/2, 30, {align:'center'});
    doc.text("--------------------------------", ancho/2, 34, {align:'center'});
    doc.text(`FECHA: ${new Date().toLocaleDateString()}`, 5, 39);
    doc.text(`CLIENTE: ${clienteExtra.nombre}`, 5, 43);
    doc.text(`DOC: ${clienteExtra.documento}`, 5, 47);    
    const body = pedido.items.map(i => [i.cantidad, i.nombre.substring(0,18), `S/${parseFloat(i.subtotal).toFixed(2)}`]);
    autoTable(doc, {
      startY: 52, body: body, head: [['CANT', 'DESC', 'SUB']],
      styles: { fontSize: 6, font: 'courier' }, theme: 'plain', margin: { left: 5, right: 5 }
    });

    const finalY = doc.lastAutoTable.finalY + 5;
    doc.text(`TOTAL: S/ ${parseFloat(pedido.total).toFixed(2)}`, 75, finalY, {align: 'right'});
    doc.text(`MEDIO PAGO: ${metodoPago}`, 5, finalY + 5);
    doc.text("¡GRACIAS POR SU PREFERENCIA!", ancho/2, finalY + 15, {align:'center'});
    onShowTicket(doc.output('bloburl'));
  };

  const finalizarPago = async (tipoDoc) => {
    const docLen = clienteExtra.documento.length;
    if (tipoDoc === 'BOLETA' && docLen !== 8) return alert("❌ DNI INVÁLIDO (8 DÍGITOS)");
    if (tipoDoc === 'FACTURA' && docLen !== 11) return alert("❌ RUC INVÁLIDO (11 DÍGITOS)");

    try {
      await wayraApi.put(`/pedidos/${pedidoSel.id_pedido}/checkout`, {
        metodo_pago: metodoPago, 
        tipo_doc: tipoDoc, 
        dni_cliente: clienteExtra.documento, 
        nombre_cliente: clienteExtra.nombre 
      });
      
      generarTicketPDF(pedidoSel, tipoDoc); 
      onUpdate(); 
      setPedidoSel(null); 
      setFase('detalle');
    } catch (e) { 
      console.error("Error en el checkout:", e); 
      alert("Error al procesar el pago.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* SECCIÓN RESERVAS HOY */}
      <section>
        <p className="text-[10px] text-emerald-500 mb-4 tracking-[0.3em] font-black italic">📅 MIS PRÓXIMAS RESERVAS</p>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {proximasReservas.length > 0 ? proximasReservas.map(res => (
            <div key={res.id_reserva} className="min-w-[240px] bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[2rem]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-xs font-black">{res.hora_reserva}</span>
                <span className="text-[7px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold">ASIGNADA</span>
              </div>
              <p className="text-white text-[11px] lowercase first-letter:uppercase">{res.nombre_cliente}</p>
              <p className="text-slate-500 text-[8px] mt-1">MESA {res.id_mesa} • {res.personas} PERS.</p>
            </div>
          )) : <p className="text-slate-600 text-[9px] py-4 lowercase italic tracking-widest">No tienes reservas próximas...</p>}
        </div>
      </section>

      <header className="flex justify-between items-center">
        <p className="text-[10px] font-black text-blue-500 tracking-[0.3em]">MESAS EN SERVICIO</p>
        <span className="text-[9px] text-slate-500">{misPedidos.length} / 4 ACTIVAS</span>
      </header>

      <div className="space-y-4">
        {misPedidos.map(p => {
          const minutos = Math.floor((ahora - new Date(p.fecha_pedido)) / 60000);
          const progreso = Math.min((minutos / 20) * 100, 100); 
          const algunListo = p.items?.some(i => minutos >= (i.tiempo_estimado || 15));

          return (
            <div key={p.id_pedido} onClick={() => setPedidoSel(p)} 
              className={`bg-[#161B22] border border-white/5 rounded-[2.5rem] p-6 cursor-pointer hover:border-blue-500/50 transition-all ${algunListo ? 'shadow-[0_0_30px_rgba(16,185,129,0.1)] border-emerald-500/30' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-black text-white italic tracking-tighter">MESA {p.id_mesa}</span>
                {algunListo ? <span className="text-[8px] bg-emerald-500 text-black px-3 py-1 rounded-full font-black animate-bounce italic">🛎️ ¡LISTO!</span> : <span className="text-[8px] font-black px-3 py-1 rounded-full bg-blue-600 text-white italic">{minutos} MIN</span>}
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
                <div className={`h-full transition-all duration-1000 ${progreso > 75 ? 'bg-rose-500' : 'bg-blue-600'}`} style={{ width: `${progreso}%` }}></div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[9px] text-slate-500">{p.items?.length || 0} ITEMS</p>
                <p className="text-sm font-black text-white italic">S/ {parseFloat(p.total).toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {pedidoSel && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[999] flex justify-end">
          <div className="w-full max-w-xl bg-[#0A0C10] border-l border-white/10 p-10 flex flex-col">
            {fase === 'detalle' ? (
              <>
                <div className="flex justify-between mb-10">
                  <h3 className="text-4xl font-black text-white italic underline decoration-blue-600 tracking-tighter">MESA {pedidoSel.id_mesa}</h3>
                  <button onClick={() => setPedidoSel(null)} className="text-rose-500 text-[10px] font-black tracking-widest uppercase">Cerrar</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                  {pedidoSel.items?.map(item => {
                    const transcurrido = Math.floor((ahora - new Date(pedidoSel.fecha_pedido)) / 60000);
                    const listo = transcurrido >= (item.tiempo_estimado || 15);
                    return (
                      <div key={item.id_detalle} className="bg-white/5 p-5 rounded-3xl flex justify-between items-center border border-white/5">
                        <div>
                          <p className="text-xs text-white font-black italic">{item.cantidad}x {item.nombre}</p>
                          <p className={`text-[8px] font-black mt-1 ${listo ? 'text-emerald-500 animate-pulse' : 'text-blue-500'}`}>{listo ? '🛎️ ¡LLEVAR AHORA!' : `PROGRESO: ${transcurrido}/${item.tiempo_estimado || 15} MIN`}</p>
                        </div>
                        <button onClick={() => eliminarPlato(item.id_detalle)} className="text-rose-500 p-2 hover:bg-rose-500/10 rounded-xl transition-all">✕</button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                   <p className="text-[8px] text-slate-500 mb-2 font-black">NOTA PARA COCINA:</p>
                   <textarea value={nuevaObs} readOnly className="w-full bg-transparent text-[11px] text-white outline-none h-16 resize-none italic" />
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                   <button onClick={() => setShowAdd(true)} className="bg-white/5 text-white py-6 rounded-[2rem] text-[10px] font-black border border-white/5 hover:bg-white/10">AÑADIR</button>
                   <button onClick={() => setFase('pago')} className="bg-blue-600 text-white py-6 rounded-[2rem] text-[10px] font-black shadow-xl shadow-blue-900/20">COBRAR CUENTA</button>
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full items-center justify-center animate-in zoom-in-95">
                 <h4 className="text-[10px] text-blue-500 tracking-[0.5em] mb-10 font-black">PASARELA DE PAGO</h4>
                 <div className="text-6xl font-black text-white italic mb-10 tracking-tighter">S/ {parseFloat(pedidoSel.total).toFixed(2)}</div>
                 <div className="grid grid-cols-2 gap-2 w-full mb-8">
                    {['YAPE', 'EFECTIVO', 'TARJETA', 'IZIPAY'].map(m => (
                      <button key={m} onClick={() => setMetodoPago(m)} className={`py-4 rounded-2xl text-[10px] font-black border transition-all ${metodoPago === m ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`}>{m}</button>
                    ))}
                 </div>
                 <div className="w-full space-y-4 mb-10">
                    <input type="text" placeholder="DNI (8 DÍGITOS) O RUC (11 DÍGITOS)" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none italic font-black text-xs" value={clienteExtra.documento} onChange={e => setClienteExtra({...clienteExtra, documento: e.target.value.replace(/\D/g,'')})} maxLength={11} />
                    <input type="text" placeholder="NOMBRE / RAZÓN SOCIAL" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none uppercase italic font-black text-xs" value={clienteExtra.nombre} onChange={e => setClienteExtra({...clienteExtra, nombre: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4 w-full">
                    <button onClick={() => finalizarPago('BOLETA')} className="bg-emerald-600 text-white py-6 rounded-3xl text-[10px] font-black uppercase shadow-lg shadow-emerald-900/20">Boleta</button>
                    <button onClick={() => finalizarPago('FACTURA')} className="bg-emerald-600 text-white py-6 rounded-3xl text-[10px] font-black uppercase shadow-lg shadow-emerald-900/20">Factura</button>
                 </div>
                 <button onClick={() => setFase('detalle')} className="mt-8 text-slate-500 text-[10px] font-black uppercase underline tracking-widest">Atrás</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/98 z-[1000] p-10 flex items-center justify-center">
            <ComanderoCarta mesa={pedidoSel} isEditing={true} userLogueado={userLogueado} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); onUpdate(); setPedidoSel(null); }} />
        </div>
      )}
    </div>
  );
};
export default MonitorPedidos;
