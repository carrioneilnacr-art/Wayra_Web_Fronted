import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { pedidoService } from '../../services/pedidoService';
import ComanderoCarta from './ComanderoCarta';

export const MonitorPedidos = ({ pedidos = [], onUpdate, userLogueado, onShowTicket }) => {
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
      // ✅ ARQUITECTURA SENIOR: Consumo desde el servicio unificado de pedidos
      const data = await pedidoService.getReservasMozoHoy(userLogueado.id_usuario);
      setProximasReservas(data); 
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
      // ✅ ARQUITECTURA SENIOR: Eliminación abstracta mediante el servicio
      await pedidoService.eliminarItemDetalle(idDetalle);
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
      // ✅ ARQUITECTURA SENIOR: Checkout centralizado
      await pedidoService.procesarCheckout(pedidoSel.id_pedido, {
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
    <div className="space-y-6 animate-in fade-in duration-700 text-[#2C3E50] uppercase italic">
      
      {/* SECCIÓN RESERVAS HOY CON CARDS ESTILIZADAS */}
      <section>
        <p className="text-[10px] text-emerald-600 mb-3 tracking-[0.3em] font-black italic not-italic">📅 MIS PRÓXIMAS RESERVAS</p>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {proximasReservas.length > 0 ? proximasReservas.map(res => (
            <div key={res.id_reserva} className="min-w-[240px] bg-emerald-50/50 border border-emerald-100 p-4 rounded-[2rem] shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-800 text-xs font-black not-italic font-sans">{res.hora_reserva}</span>
                <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-md font-black not-italic font-sans">ASIGNADA</span>
              </div>
              <p className="text-slate-700 text-[11px] font-bold tracking-wide truncate">{res.nombre_cliente}</p>
              <p className="text-slate-400 text-[9px] mt-1 font-bold not-italic font-sans">MESA {res.id_mesa} • {res.personas} PERSONAS</p>
            </div>
          )) : <p className="text-slate-400 text-[9px] py-2 lowercase italic tracking-widest font-bold">No tienes reservas asignadas hoy...</p>}
        </div>
      </section>

      {/* HEADER DE MESAS EN SERVICIO */}
      <header className="flex justify-between items-center border-b border-slate-100 pb-3 mt-4">
        <p className="text-[10px] font-black text-blue-600 tracking-[0.3em] not-italic">MESAS EN SERVICIO</p>
        <span className="text-[10px] font-black text-slate-400 not-italic font-sans">{misPedidos.length} ACTIVAS</span>
      </header>

      {/* GRID RESPONSIVO DE MONITOR DE MESAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {misPedidos.map(p => {
          const minutos = Math.floor((ahora - new Date(p.fecha_pedido)) / 60000);
          const progreso = Math.min((minutos / 20) * 100, 100); 
          const algunListo = p.items?.some(i => minutos >= (i.tiempo_estimado || 15));

          return (
            <div key={p.id_pedido} onClick={() => setPedidoSel(p)} 
              className={`bg-white border rounded-[2rem] p-5 cursor-pointer transition-all hover:border-blue-500/40 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] h-36
                ${algunListo ? 'border-emerald-200 bg-emerald-50/10 shadow-[0_4px_16px_rgba(16,185,129,0.04)]' : 'border-slate-100'}`}>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-black text-slate-800 italic tracking-tighter">MESA #{p.id_mesa}</span>
                {algunListo 
                  ? <span className="text-[8px] bg-emerald-500 text-white px-2.5 py-1 rounded-xl font-black italic tracking-wider animate-pulse">🛎️ ¡LISTO!</span> 
                  : <span className="text-[8px] font-black px-2.5 py-1 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 italic tracking-wide">{minutos} MIN</span>}
              </div>

              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden my-3">
                <div className={`h-full transition-all duration-1000 ${progreso > 75 ? 'bg-rose-500' : 'bg-blue-600'}`} style={{ width: `${progreso}%` }}></div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <p className="text-[9px] text-slate-400 font-bold not-italic font-sans uppercase tracking-widest">{p.items?.length || 0} PLATILLOS</p>
                <p className="text-sm font-black text-slate-800 not-italic font-sans">S/ {parseFloat(p.total).toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETALLE LATERAL O PASARELA EN MODAL ELEGANTE */}
      {pedidoSel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[999] flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white border-l border-slate-100 p-8 flex flex-col h-full shadow-2xl">
            {fase === 'detalle' ? (
              <>
                <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                  <h3 className="text-2xl font-black text-slate-800 italic underline decoration-blue-600 decoration-4 tracking-tighter">MESA #{pedidoSel.id_mesa}</h3>
                  <button onClick={() => setPedidoSel(null)} className="text-rose-500 text-[10px] font-black tracking-widest uppercase not-italic">CERRAR</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {pedidoSel.items?.map(item => {
                    const transcurrido = Math.floor((ahora - new Date(pedidoSel.fecha_pedido)) / 60000);
                    const listo = transcurrido >= (item.tiempo_estimado || 15);
                    return (
                      <div key={item.id_detalle} className="bg-slate-50/60 p-4 rounded-2xl flex justify-between items-center border border-slate-100/50">
                        <div>
                          <p className="text-xs text-slate-800 font-black italic">{item.cantidad}x {item.nombre}</p>
                          <p className={`text-[8px] font-black mt-1 not-italic font-sans tracking-wide ${listo ? 'text-emerald-600' : 'text-blue-500'}`}>{listo ? '🛎️ ¡LLEVAR AHORA!' : `PROGRESO: ${transcurrido}/${item.tiempo_estimado || 15} MIN`}</p>
                        </div>
                        <button onClick={() => eliminarPlato(item.id_detalle)} className="text-rose-400 p-2 hover:bg-rose-50 rounded-xl transition-all font-bold">✕</button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-4 bg-slate-50/60 rounded-2xl border border-slate-100/70">
                   <p className="text-[8px] text-slate-400 mb-1.5 font-black not-italic tracking-wider">NOTA PARA COCINA:</p>
                   <textarea value={nuevaObs} readOnly className="w-full bg-transparent text-[11px] text-slate-600 outline-none h-12 resize-none italic font-medium" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 shrink-0">
                   <button onClick={() => setShowAdd(true)} className="bg-slate-100 text-slate-700 py-4 rounded-xl text-[10px] font-black tracking-widest hover:bg-slate-200 border border-slate-200/30 uppercase not-italic">AÑADIR ITEMS</button>
                   <button onClick={() => setFase('pago')} className="bg-[#0a0913] text-white py-4 rounded-xl text-[10px] font-black tracking-widest hover:bg-blue-600 transition-all uppercase not-italic shadow-md">COBRAR CUENTA</button>
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full items-center justify-center animate-in zoom-in-95 p-2">
                 <h4 className="text-[10px] text-blue-600 tracking-[0.4em] mb-6 font-black not-italic">PASARELA DE PAGO</h4>
                 <div className="text-5xl font-black text-slate-800 italic mb-8 tracking-tighter">S/ {parseFloat(pedidoSel.total).toFixed(2)}</div>
                 
                 <div className="grid grid-cols-2 gap-2 w-full mb-6">
                    {['YAPE', 'EFECTIVO', 'TARJETA', 'IZIPAY'].map(m => (
                      <button key={m} onClick={() => setMetodoPago(m)} className={`py-3 rounded-xl text-[9px] font-black border transition-all uppercase not-italic font-sans ${metodoPago === m ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}>{m}</button>
                    ))}
                 </div>
                 
                 <div className="w-full space-y-3 mb-8">
                    <input type="text" placeholder="DNI (8 DÍGITOS) O RUC (11 DÍGITOS)" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-800 outline-none uppercase font-bold text-[11px] focus:bg-white focus:border-blue-500/30 transition-all" value={clienteExtra.documento} onChange={e => setClienteExtra({...clienteExtra, documento: e.target.value.replace(/\D/g,'')})} maxLength={11} />
                    <input type="text" placeholder="NOMBRE / RAZÓN SOCIAL" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-800 outline-none uppercase font-bold text-[11px] focus:bg-white focus:border-blue-500/30 transition-all" value={clienteExtra.nombre} onChange={e => setClienteExtra({...clienteExtra, nombre: e.target.value})} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 w-full shrink-0">
                    <button onClick={() => finalizarPago('BOLETA')} className="bg-emerald-600 text-white py-4 rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-emerald-700 transition-all">Generar Boleta</button>
                    <button onClick={() => finalizarPago('FACTURA')} className="bg-emerald-600 text-white py-4 rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-emerald-700 transition-all">Generar Factura</button>
                 </div>
                 <button onClick={() => setFase('detalle')} className="mt-6 text-slate-400 text-[10px] font-black uppercase underline tracking-widest not-italic">Atrás</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE ADICIÓN COMPLETA */}
      {showAdd && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[1000] p-6 flex items-center justify-center animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-xl h-full max-h-[85vh] bg-white rounded-[3rem] border border-slate-100 p-6 md:p-8 shadow-2xl overflow-y-auto">
            <ComanderoCarta mesa={pedidoSel} isEditing={true} userLogueado={userLogueado} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); onUpdate(); setPedidoSel(null); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorPedidos;