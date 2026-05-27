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
      alert("Error al actualizar el producto."); 
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
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6 text-[#2C3E50]">
      
      {/* SECCIÓN SUPERIOR DE ACCIONES (SIN TÍTULO DUPLICADO) */}
      <header className="flex justify-between items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-xl scrollbar-none">
          {categorias.map(cat => (
            <button 
              key={cat} 
              onClick={() => setCatSel(cat)} 
              className={`px-4 py-2 rounded-full text-[10px] tracking-[0.2em] font-bold uppercase transition-all border whitespace-nowrap 
                ${catSel === cat 
                  ? 'bg-[#b07d62]/15 text-[#b07d62] border-[#b07d62]/30' 
                  : 'bg-white border-slate-100 text-[#7F8C8D] hover:border-slate-300'}`}
            >
              {cat === "FONDOS" ? "PLATOS DE FONDO" : cat}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setMostrarForm(true)}
          className="bg-[#0a0913] text-white py-3 px-5 rounded-full font-bold text-[10px] tracking-[0.2em] uppercase shadow-sm hover:bg-[#2d2a45] transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <span>+ Agregar Producto</span>
        </button>
      </header>

      {/* 🔍 BARRA DE BÚSQUEDA MINIMALISTA */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="BUSCAR ELEMENTO EN LA CARTA..." 
          className="w-full bg-white border border-slate-100 p-4 pl-5 rounded-2xl text-[10px] text-[#2C3E50] placeholder-slate-400 outline-none focus:border-[#b07d62]/40 font-bold uppercase tracking-widest transition-all"
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* 🍱 LISTADO DE PRODUCTOS (ESTILO MOCKUP BLANCO LIMPIO) */}
      <div className="grid grid-cols-1 gap-3.5">
        {productos
          .filter(p => {
            if (catSel === "TODOS") return true;
            return p.categoria.toUpperCase() === catSel.toUpperCase();
          })
          .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
          .map(p => {
            const esDisponible = parseInt(p.estado) === 1;

            return (
              <div 
                key={p.id_producto} 
                className={`bg-white p-5 rounded-2xl border transition-all flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)]
                  ${esDisponible ? 'border-slate-100' : 'border-rose-200/60 bg-rose-50/20 opacity-75'}`}
              >
                <div className="flex items-center gap-5">
                  {/* Indicador de categoría minimalista plano */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black
                    ${esDisponible ? 'bg-[#f4f1ea] text-[#b07d62]' : 'bg-slate-100 text-slate-400'}`}>
                    {p.categoria.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[#2C3E50] font-black text-xs uppercase tracking-wider">{p.nombre}</p>
                    <p className="text-[9px] text-[#7F8C8D] font-bold tracking-widest mt-0.5 uppercase">
                      {p.categoria} • <span className="text-emerald-600 font-extrabold">S/ {parseFloat(p.precio).toFixed(2)}</span> • {p.tiempo_estimado} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Toggle de Disponibilidad */}
                  <button 
                    onClick={() => handleUpdate(p.id_producto, 'estado', esDisponible ? 0 : 1)}
                    className={`px-3 py-1.5 rounded-full text-[8px] font-black tracking-widest border transition-all w-24
                      ${esDisponible 
                        ? 'border-emerald-200 text-emerald-600 bg-emerald-50/50' 
                        : 'border-rose-200 text-rose-500 bg-rose-50/50'}`}
                  >
                    {esDisponible ? 'DISPONIBLE' : 'AGOTADO'}
                  </button>
                  
                  {/* Botón de configuración de precio */}
                  <button 
                    onClick={() => {
                      const n = prompt("INGRESA EL NUEVO PRECIO PARA " + p.nombre, p.precio);
                      if(n && !isNaN(n)) handleUpdate(p.id_producto, 'precio', n);
                    }}
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-[#2C3E50] transition-all border border-slate-100/70"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* 🌫️ MODAL FORM CON FILTRO DE CRISTAL MINIMALISTA */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-[#0a0913]/40 flex items-center justify-center z-50 p-4 backdrop-blur-md transition-all">
          <form onSubmit={handleSave} className="bg-white p-7 rounded-2xl border border-slate-100 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-[#0a0913] font-black text-lg mb-5 tracking-tight uppercase">Nuevo Producto</h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-[9px] font-black text-[#7F8C8D] tracking-wider uppercase block mb-1.5">Nombre del Plato</label>
                <input type="text" placeholder="EJ. CEVICHE NIKKEI" className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-slate-100 outline-none focus:border-[#b07d62]/40 font-bold uppercase text-[11px]" 
                  onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value.toUpperCase()})} required />
              </div>
              
              <div>
                <label className="text-[9px] font-black text-[#7F8C8D] tracking-wider uppercase block mb-1.5">Precio de Venta</label>
                <input type="number" step="0.01" placeholder="S/ 0.00" className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-slate-100 outline-none focus:border-[#b07d62]/40 font-bold text-[11px]" 
                  onChange={e => setNuevoProd({...nuevoProd, precio: e.target.value})} required />
              </div>
              
              <div>
                <label className="text-[9px] font-black text-[#7F8C8D] tracking-wider uppercase block mb-1.5">Categoría de la Carta</label>
                <select className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-slate-100 outline-none focus:border-[#b07d62]/40 font-bold text-[11px] appearance-none"
                  onChange={e => setNuevoProd({...nuevoProd, categoria: e.target.value})}>
                  <option value="Entradas">ENTRADAS</option>
                  <option value="Makis">MAKIS</option>
                  <option value="Fondos">PLATOS DE FONDO</option>
                  <option value="Bebidas">BEBIDAS</option>
                  <option value="Postres">POSTRES</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-[#7F8C8D] tracking-wider uppercase block mb-1.5">Tiempo Estimado (Minutos)</label>
                <input type="number" placeholder="15 MIN" className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-slate-100 outline-none focus:border-[#b07d62]/40 font-bold text-[11px]" 
                  onChange={e => setNuevoProd({...nuevoProd, tiempo_estimado: e.target.value})} required />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setMostrarForm(false)} className="flex-1 p-3 text-[#7F8C8D] font-bold hover:text-[#2C3E50] transition-colors text-[10px] tracking-widest">CANCELAR</button>
              <button type="submit" className="flex-1 bg-[#0a0913] py-3 rounded-xl text-white font-black text-[10px] tracking-widest uppercase hover:bg-[#2d2a45] transition-all shadow-md shadow-slate-200">GUARDAR</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
