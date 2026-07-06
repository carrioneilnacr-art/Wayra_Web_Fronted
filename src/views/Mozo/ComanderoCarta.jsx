import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { pedidoService } from '../../services/pedidoService';

export const ComanderoCarta = ({ mesa, onClose, onSuccess, pedidoExistente, userLogueado, productosCache }) => {
  // 1. Usamos productosCache inicial en lugar de hacer fetch
  const [productos] = useState(productosCache || []);
  const [cat, setCat] = useState('MAKIS');
  const [carrito, setCarrito] = useState([]);
  const [nota, setNota] = useState(pedidoExistente?.observacion || "");
  const [enviando, setEnviando] = useState(false);
  
  const categorias = ['ENTRADAS', 'FONDOS', 'MAKIS', 'POSTRES', 'BEBIDAS'];

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
    const notaCambiada = nota.trim() !== (pedidoExistente?.observacion || "");
    
    if (carrito.length === 0 && !notaCambiada) {
      return alert("Selecciona platos nuevos o modifica la nota para actualizar.");
    }

    setEnviando(true);
    try {
      if (pedidoExistente) {
        const promesas = [];

        if (carrito.length > 0) {
          const promesasPlatos = carrito.map(item => 
            pedidoService.crearPedido({ 
              ...item, 
              id_pedido_existente: pedidoExistente.id_pedido, 
              modo: 'agregar' 
            })
          );
          promesas.push(...promesasPlatos);
        }
        
        if (notaCambiada) {
          promesas.push(pedidoService.actualizarObservacion(pedidoExistente.id_pedido, nota));
        }
        
        await Promise.all(promesas);

      } else {
        await pedidoService.crearPedido({
          id_mesa: mesa.id_mesa,
          id_mozo: userLogueado?.id_usuario,
          nombre_cliente: "CLIENTE DIRECTO",
          items: carrito,
          observacion: nota,
          total: carrito.reduce((a, b) => a + Number.parseFloat(b.subtotal), 0)
        });
      }
      onSuccess();
    } catch (e) { 
      console.error("Error al enviar comanda:", e);
      alert("No se pudo enviar el pedido. Verifica la conexión.");
    } finally {
      setEnviando(false);
    }
  };

  let submitButtonText = 'ENVIAR A COCINA';
  if (enviando) {
    submitButtonText = 'PROCESANDO...';
  } else if (pedidoExistente) {
    submitButtonText = 'ACTUALIZAR COMANDA';
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-800 rounded-3xl overflow-hidden">
      
      {/* HEADER DEL COMANDERO */}
      <div className="flex justify-between items-center bg-white px-8 py-6 border-b border-slate-200 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {pedidoExistente ? `Editando Mesa ${mesa.numero_mesa || mesa.id_mesa}` : `Nueva Comanda - Mesa ${mesa.numero_mesa || mesa.id_mesa}`}
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Seleccione los platos a agregar</p>
        </div>
        <button aria-label="Cerrar" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LADO IZQUIERDO: CATÁLOGO DE PRODUCTOS */}
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-50/50">
          {/* Tabs Categorías */}
          <div className="flex gap-2 p-6 overflow-x-auto scrollbar-none shrink-0 bg-white/50 border-b border-slate-100">
            {categorias.map(c => (
              <button 
                key={c} onClick={() => setCat(c)} 
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all uppercase
                  ${cat === c ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grilla Productos */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {productos.filter(p => p.categoria?.toUpperCase() === cat.toUpperCase() && Number.parseInt(p.estado) === 1).map(p => (
                <button 
                  key={p.id_producto} 
                  type="button"
                  className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer min-h-[80px] text-left w-full" 
                  onClick={() => agregar(p)}
                >
                  <div className="min-w-0 pr-3 w-full">
                    {/* 2. Solución visual: line-clamp-2 reemplaza a truncate para permitir múltiples líneas */}
                    <p className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2 mb-1.5">{p.nombre}</p>
                    <p className="text-slate-500 font-medium text-sm">S/ {Number.parseFloat(p.precio).toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 text-slate-600 border border-slate-200 w-10 h-10 rounded-xl font-medium text-xl flex items-center justify-center shrink-0 transition-colors pointer-events-none">
                    +
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LADO DERECHO: TICKET / CARRITO DE ESTA OPERACIÓN */}
        <div className="w-[300px] md:w-[350px] lg:w-[380px] bg-white flex flex-col shrink-0 border-l border-slate-200">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-widest">Resumen a enviar</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {carrito.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <span className="text-4xl mb-3">🍽️</span>
                  <p className="text-sm font-medium">Aún no has agregado platos</p>
               </div>
            ) : (
               <div className="space-y-3">
                  {carrito.map((i) => (
                    <div key={i.id_producto} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors group border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{i.cantidad}</span>
                         <span className="text-sm font-medium text-slate-900 line-clamp-2">{i.nombre}</span>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => quitarUno(i.id_producto)} className="bg-red-50 text-red-500 w-8 h-8 rounded-lg font-bold flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">-</button>
                        <button onClick={() => agregar(i)} className="bg-teal-50 text-teal-600 w-8 h-8 rounded-lg font-bold flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all">+</button>
                      </div>
                    </div>
                  ))}
               </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-200 bg-slate-50 shrink-0">
             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                {pedidoExistente ? "Editar Nota a Cocina:" : "Nota a Cocina:"}
             </span>
             <textarea 
                placeholder="Ej. Sin picante, bien cocido..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 mb-4 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none h-20 resize-none font-medium transition-all"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
             />
             
             {carrito.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                   <span className="text-sm font-semibold text-slate-500">Subtotal</span>
                   <span className="text-xl font-bold text-slate-900">+ S/ {carrito.reduce((a, b) => a + Number.parseFloat(b.subtotal), 0).toFixed(2)}</span>
                </div>
             )}

             <button 
                onClick={enviar} 
                disabled={enviando || (carrito.length === 0 && nota.trim() === (pedidoExistente?.observacion || ""))} 
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm
                  ${enviando || (carrito.length === 0 && nota.trim() === (pedidoExistente?.observacion || "")) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-teal-600/20 shadow-md'}`}
             >
                {submitButtonText}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ComanderoCarta.propTypes = {
  mesa: PropTypes.shape({
    id_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    numero_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  pedidoExistente: PropTypes.shape({
    id_pedido: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    observacion: PropTypes.string,
  }),
  userLogueado: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  productosCache: PropTypes.arrayOf(
    PropTypes.shape({
      id_producto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nombre: PropTypes.string.isRequired,
      precio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      categoria: PropTypes.string,
      estado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
};

export default ComanderoCarta;