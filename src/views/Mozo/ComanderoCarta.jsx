import React, { useState, useEffect } from 'react';
import wayraApi from '../../api/wayraApi'; // Instancia maestra

const ComanderoCarta = ({ mesa, onClose, onSuccess, isEditing = false, userLogueado }) => {
  const [productos, setProductos] = useState([]);
  const [cat, setCat] = useState('MAKIS');
  const [carrito, setCarrito] = useState([]);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  
  const categorias = ['ENTRADAS', 'FONDOS', 'MAKIS', 'POSTRES', 'BEBIDAS'];

  // 1. Cargar productos con Axios
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await wayraApi.get('/productos');
        setProductos(res.data);
      } catch (e) {
        console.error("Error al cargar carta:", e);
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

  // 2. Enviar Comanda con Axios
  const enviar = async () => {
    if (carrito.length === 0) return alert("Selecciona al menos un plato");
    setEnviando(true);
    try {
      if (isEditing) {
        // Optimización: Usar Promise.all para enviar items en paralelo si la API lo permite,
        // o mantener el flujo controlado con wayraApi.
        const promesas = carrito.map(item => 
          wayraApi.post(`/pedidos/${mesa.id_pedido}/agregar`, item)
        );
        await Promise.all(promesas);
      } else {
        await wayraApi.post('/pedidos', {
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
    <div className="flex flex-col h-full uppercase italic animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-white italic underline decoration-blue-600">
          {isEditing ? `AÑADIR A MESA ${mesa.id_mesa}` : `NUEVA COMANDA MESA ${mesa.numero_mesa || mesa.id_mesa}`}
        </h2>
        <button onClick={onClose} className="text-rose-500 font-black text-[10px] tracking-widest hover:underline">CANCELAR</button>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {categorias.map(c => (
          <button 
            key={c} 
            onClick={() => setCat(c)} 
            className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${cat === c ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 overflow-y-auto pr-2 no-scrollbar">
        {productos.filter(p => p.categoria?.toUpperCase() === cat).map(p => (
          <div key={p.id_producto} className="bg-white/5 p-5 rounded-[2.5rem] border border-white/5 flex justify-between items-center hover:border-blue-500/30 transition-all">
            <div>
              <p className="font-black text-white text-[11px]">{p.nombre}</p>
              <p className="text-blue-500 font-black text-[9px] mt-1">S/ {parseFloat(p.precio).toFixed(2)}</p>
            </div>
            <button onClick={() => agregar(p)} className="bg-white text-black w-10 h-10 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all">+</button>
          </div>
        ))}
      </div>

      {carrito.length > 0 && (
        <div className="bg-[#161B22] p-8 rounded-[3rem] border border-blue-500/20 shadow-2xl mt-auto animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black text-slate-500">RESUMEN COMANDA:</span>
            <span className="text-xl font-black text-blue-500">
              S/ {carrito.reduce((a, b) => a + parseFloat(b.subtotal), 0).toFixed(2)}
            </span>
          </div>
          
          <div className="space-y-3 mb-6 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {carrito.map((i) => (
              <div key={i.id_producto} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-300">{i.cantidad}x {i.nombre}</span>
                <div className="flex gap-2">
                  <button onClick={() => quitarUno(i.id_producto)} className="bg-rose-500/20 text-rose-500 w-6 h-6 rounded-lg text-[10px] hover:bg-rose-500 hover:text-white transition-all">✕</button>
                  <button onClick={() => agregar(i)} className="bg-blue-500/20 text-blue-500 w-6 h-6 rounded-lg text-[10px] hover:bg-blue-500 hover:text-white transition-all">+</button>
                </div>
              </div>
            ))}
          </div>

          {!isEditing && (
            <textarea 
              placeholder="Nota para cocina..."
              className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] text-white mb-6 focus:border-blue-500 outline-none h-20 resize-none"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
          )}
          
          <button 
            onClick={enviar} 
            disabled={enviando} 
            className="w-full bg-blue-600 py-6 rounded-[2.5rem] font-black text-[11px] tracking-[0.4em] text-white shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
          >
            {enviando ? 'SINCRONIZANDO...' : 'ENVIAR A COCINA 🚀'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ComanderoCarta;