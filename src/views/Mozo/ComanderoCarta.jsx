import React, { useState, useEffect } from 'react';
import { productoService } from '../../services/productoService';
import { pedidoService } from '../../services/pedidoService';

export const ComanderoCarta = ({ mesa, onClose, onSuccess, isEditing = false, userLogueado }) => {
  const [productos, setProductos] = useState([]);
  const [cat, setCat] = useState('MAKIS');
  const [carrito, setCarrito] = useState([]);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  
  const categorias = ['ENTRADAS', 'FONDOS', 'MAKIS', 'POSTRES', 'BEBIDAS'];

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        // ✅ ARQUITECTURA SENIOR: Consumo del servicio de productos aislado
        const data = await productoService.getTodos();
        setProductos(data);
      } catch (e) {
        console.error("Error al cargar carta en comandero:", e);
      }
    };
    cargarProductos();
  }, []);

  const agregar = (p) => {
    const existe = carrito.find(i => i.id_producto === p.id_producto);
    if (existe) {
      setCarrito(carrito.map(i => i.id_producto === p.id_producto ? 
        { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * p.precio } : i));
    } else {
      setCarrito([...carrito, { ...p, cantidad: 1, subtotal: p.precio }]);
    }
  };

  const quitarUno = (id) => {
    const item = carrito.find(i => i.id_producto === id);
    if (item.cantidad > 1) {
      setCarrito(carrito.map(i => i.id_producto === id ? 
        { ...i, cantidad: i.cantidad - 1, subtotal: (i.cantidad - 1) * i.precio } : i));
    } else {
      setCarrito(carrito.filter(i => i.id_producto !== id));
    }
  };

  const enviar = async () => {
    if (carrito.length === 0) return alert("Selecciona al menos un plato");
    setEnviando(true);
    try {
      if (isEditing) {
        // ✅ ARQUITECTURA SENIOR: Mapeo de promesas utilizando el servicio centralizado de pedidos
        const promesas = carrito.map(item => 
          pedidoService.crearPedido({ ...item, id_pedido_existente: mesa.id_pedido, modo: 'agregar' })
        );
        await Promise.all(promesas);
      } else {
        await pedidoService.crearPedido({
          id_mesa: mesa.id_mesa,
          id_mozo: userLogueado?.id_usuario,
          nombre_cliente: "CLIENTE DIRECTO",
          items: carrito,
          observacion: nota,
          total: carrito.reduce((a, b) => a + parseFloat(b.subtotal), 0)
        });
      }
      onSuccess();
      onClose();
    } catch (e) { 
      console.error("Error al enviar comanda:", e);
      alert("No se pudo enviar el pedido. Verifica la conexión con Render.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col h-full uppercase italic animate-in zoom-in-95 duration-300 text-[#2C3E50]">
      
      {/* HEADER ADAPTATIVO */}
      <div className="flex justify-between items-center mb-8 px-1">
        <h2 className="text-2xl font-black text-slate-800 italic underline decoration-blue-600 decoration-4 tracking-tighter">
          {isEditing ? `AÑADIR A MESA ${mesa.id_mesa}` : `NUEVA COMANDA MESA ${mesa.numero_mesa || mesa.id_mesa}`}
        </h2>
        <button onClick={onClose} className="text-rose-500 font-black text-[10px] tracking-widest hover:underline uppercase not-italic">CANCELAR</button>
      </div>

      {/* FILAS DE CATEGORIAS CON SCROLL TÁCTIL */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none shrink-0">
        {categorias.map(c => (
          <button 
            key={c} 
            onClick={() => setCat(c)} 
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all border uppercase not-italic
              ${cat === c 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* GRID RESPONSIVO DE SELECCIÓN DE PLATILLOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {productos
          .filter(p => p.categoria?.toUpperCase() === cat.toUpperCase() && parseInt(p.estado) === 1)
          .map(p => (
            <div key={p.id_producto} className="bg-white p-4 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-blue-500/30 transition-all h-20">
              <div className="min-w-0">
                <p className="font-black text-slate-800 text-xs truncate uppercase tracking-wide">{p.nombre}</p>
                <p className="text-blue-600 font-black text-[10px] mt-0.5 tracking-wider not-italic font-sans">S/ {parseFloat(p.precio).toFixed(2)}</p>
              </div>
              <button 
                onClick={() => agregar(p)} 
                className="bg-slate-50 text-slate-800 border border-slate-100 w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center shrink-0 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
              >
                +
              </button>
            </div>
          ))}
      </div>

      {/* PANEL FLOTANTE DE RESUMEN DE LA COMANDA ACTIVA */}
      {carrito.length > 0 && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_15px_50px_rgba(0,0,0,0.04)] mt-auto animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
            <span className="text-[10px] font-black text-slate-400 tracking-widest not-italic">RESUMEN COMANDA:</span>
            <span className="text-lg font-black text-blue-600 not-italic font-sans">
              S/ {carrito.reduce((a, b) => a + parseFloat(b.subtotal), 0).toFixed(2)}
            </span>
          </div>
          
          <div className="space-y-2.5 mb-4 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {carrito.map((i) => (
              <div key={i.id_producto} className="flex justify-between items-center bg-slate-50/60 p-3 rounded-xl border border-slate-100/50">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{i.cantidad}x {i.nombre}</span>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => quitarUno(i.id_producto)} className="bg-rose-50 text-rose-500 border border-rose-100/40 w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all">✕</button>
                  <button onClick={() => agregar(i)} className="bg-blue-50 text-blue-500 border border-blue-100/40 w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">+</button>
                </div>
              </div>
            ))}
          </div>

          {!isEditing && (
            <textarea 
              placeholder="Nota para cocina..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-[10px] text-slate-700 placeholder-slate-400 mb-4 focus:border-blue-500/40 outline-none h-16 resize-none font-bold uppercase tracking-wider transition-all"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
          )}      
          
          <button 
            onClick={enviar} 
            disabled={enviando} 
            className="w-full bg-[#0a0913] py-4 rounded-2xl font-black text-[10px] tracking-[0.3em] text-white shadow-md hover:bg-blue-600 transition-all uppercase not-italic"
          >
            {enviando ? 'SINCRONIZANDO...' : 'ENVIAR A COCINA 🚀'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ComanderoCarta;