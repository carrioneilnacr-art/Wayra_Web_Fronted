import React, { useState, useEffect } from 'react';
import wayraApi from '../../api/wayraApi'; 

export const ViewCarta = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [catSel, setCatSel] = useState("TODOS");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoProd, setNuevoProd] = useState({ 
    nombre: '', 
    precio: '', 
    categoria: 'Entradas', 
    tiempo_estimado: 15 
  });
  const categorias = ["TODOS", "ENTRADAS", "MAKIS", "FONDOS", "BEBIDAS", "POSTRES"];

  const cargarCarta = async () => {
    try {
      const res = await wayraApi.get('/productos');
      setProductos(res.data);
    } catch (e) { 
      console.error("Error cargando carta:", e); 
    }
  };
  useEffect(() => { 
    cargarCarta(); 
  }, []);

  const handleUpdate = async (id, field, value) => {
    try {
      await wayraApi.put(`/admin/productos/${id}`, { [field]: value });
      cargarCarta(); 
    } catch (e) { 
      alert("Error al actualizar el producto en Render."); 
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await wayraApi.post('/admin/productos', { ...nuevoProd, estado: 1 }); 
      if (res.status === 200 || res.status === 201) {
        setMostrarForm(false);
        setNuevoProd({ nombre: '', precio: '', categoria: 'Entradas', tiempo_estimado: 15 });
        cargarCarta();
      }
    } catch (e) { 
      alert("Error de red al guardar el plato."); 
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Gestión de Carta</h2>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar max-w-xl">
            {categorias.map(cat => (
              <button 
                key={cat} 
                onClick={() => setCatSel(cat)} 
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border whitespace-nowrap ${catSel === cat ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
              >
                {cat === "FONDOS" ? "PLATOS DE FONDO" : cat}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={() => setMostrarForm(true)}
          className="bg-blue-600 text-white p-4 rounded-2xl font-black text-[10px] shadow-lg shadow-blue-600/20 hover:scale-105 transition-all uppercase tracking-widest"
        >
          + Agregar Producto
        </button>
      </header>
      {/* MODAL PARA AGREGAR PRODUCTO */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[#161B22] p-8 rounded-[2.5rem] border border-white/10 w-full max-w-md animate-in zoom-in-95 duration-300">
            <h3 className="text-white font-black text-2xl mb-6 italic tracking-tighter uppercase text-blue-500">Nuevo Producto</h3>
            
            <div className="space-y-4">
              <input type="text" placeholder="NOMBRE DEL PLATO" className="w-full bg-white/5 p-4 rounded-2xl text-white border border-white/5 outline-none focus:border-blue-600 font-bold uppercase text-xs" 
                onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value.toUpperCase()})} required />
              
              <input type="number" step="0.01" placeholder="PRECIO (S/)" className="w-full bg-white/5 p-4 rounded-2xl text-white border border-white/5 outline-none focus:border-blue-600 font-bold text-xs" 
                onChange={e => setNuevoProd({...nuevoProd, precio: e.target.value})} required />
              
              <select className="w-full bg-white/5 p-4 rounded-2xl text-white border border-white/5 outline-none focus:border-blue-600 font-bold text-xs"
                onChange={e => setNuevoProd({...nuevoProd, categoria: e.target.value})}>
                <option value="Entradas" className="bg-slate-900">ENTRADAS</option>
                <option value="Makis" className="bg-slate-900">MAKIS</option>
                <option value="Fondos" className="bg-slate-900">PLATOS DE FONDO</option>
                <option value="Bebidas" className="bg-slate-900">BEBIDAS</option>
                <option value="Postres" className="bg-slate-900">POSTRES</option>
              </select>

              <input type="number" placeholder="TIEMPO ESTIMADO (MIN)" className="w-full bg-white/5 p-4 rounded-2xl text-white border border-white/5 outline-none focus:border-blue-600 font-bold text-xs" 
                onChange={e => setNuevoProd({...nuevoProd, tiempo_estimado: e.target.value})} required />
            </div>

            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setMostrarForm(false)} className="flex-1 p-4 text-slate-500 font-black hover:text-white transition-colors text-xs">CANCELAR</button>
              <button type="submit" className="flex-1 bg-blue-600 p-4 rounded-2xl text-white font-black shadow-lg shadow-blue-600/20 text-xs">GUARDAR</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <input 
          type="text" 
          placeholder="BUSCAR POR NOMBRE..." 
          className="w-full bg-[#161B22] border border-white/5 p-4 rounded-2xl text-[10px] text-white outline-none focus:border-blue-600 font-black uppercase tracking-widest"
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {productos
          .filter(p => {
            if (catSel === "TODOS") return true;
            return p.categoria.toUpperCase() === catSel.toUpperCase();
          })
          .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
          .map(p => {
            const esDisponible = parseInt(p.estado) === 1;

            return (
              <div key={p.id_producto} className={`bg-[#161B22] p-6 rounded-[2.8rem] border transition-all flex items-center justify-between ${esDisponible ? 'border-white/5' : 'border-rose-500/50 opacity-60'}`}>
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${esDisponible ? 'bg-blue-600/20 text-blue-500' : 'bg-slate-800 text-slate-500'}`}>
                    {p.categoria.toUpperCase() === 'BEBIDAS' ? '🍹' : '🍱'}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm uppercase italic">{p.nombre}</p>
                    <p className="text-[9px] text-slate-500 font-bold tracking-widest">{p.categoria.toUpperCase()} • <span className="text-emerald-500">S/ {parseFloat(p.precio).toFixed(2)}</span> • {p.tiempo_estimado} min</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => handleUpdate(p.id_producto, 'estado', esDisponible ? 0 : 1)}
                    className={`px-4 py-2 rounded-xl text-[8px] font-black border transition-all w-24 ${esDisponible ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/5' : 'border-rose-500/50 text-rose-500 bg-rose-500/5'}`}
                  >
                    {esDisponible ? 'DISPONIBLE' : 'AGOTADO'}
                  </button>                
                  <button 
                    onClick={() => {
                      const n = prompt("INGRESA EL NUEVO PRECIO PARA " + p.nombre, p.precio);
                      if(n && !isNaN(n)) handleUpdate(p.id_producto, 'precio', n);
                    }}
                    className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 text-white transition-all border border-white/5"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
