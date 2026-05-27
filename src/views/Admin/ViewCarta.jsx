import React, { useState, useEffect } from 'react';
import wayraApi from '../../api/wayraApi'; 

export const ViewCarta = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [catSel, setCatSel] = useState("TODOS");
  const [mostrarForm, setMostrarForm] = useState(false);
  
  // ⚙️ Estado ampliado para controlar la edición integral del producto seleccionado
  const [modalEditar, setModalEditar] = useState({
    abierto: false,
    idProducto: null,
    nombre: "",
    precio: "",
    categoria: "Entradas",
    tiempo_estimado: ""
  });

  const [nuevoProd, setNuevoProd] = useState({ 
    nombre: '', 
    precio: '', 
    categoria: 'Entradas', 
    tiempo_estimado: '' 
  });

  const categorias = ["TODOS", "ENTRADAS", "MAKIS", "FONDOS", "BEBIDAS", "POSTRES"];

  // Diccionario de Iconos SVG Minimalistas por Categoría
  const obtenerIconoCategoria = (cat, esDisponible) => {
    const colorClass = esDisponible ? 'text-[#b07d62]' : 'text-slate-400';
    switch (cat.toUpperCase()) {
      case 'ENTRADAS':
        return (
          <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M6 6l12 12M6 18L12 12" />
          </svg>
        );
      case 'MAKIS':
        return (
          <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" strokeDasharray="2 2" />
          </svg>
        );
      case 'FONDOS':
        return (
          <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
          </svg>
        );
      case 'BEBIDAS':
        return (
          <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h12M6 16.5h12" />
          </svg>
        );
      case 'POSTRES':
        return (
          <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        );
    }
  };

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
      alert("Error al actualizar el estado del producto."); 
    }
  };

  // Enviar todos los campos modificados de forma síncrona al backend
  const handleUpdateProductoCompleto = async (e) => {
    e.preventDefault();
    try {
      await wayraApi.put(`/admin/productos/${modalEditar.idProducto}`, {
        nombre: modalEditar.nombre.toUpperCase(),
        precio: modalEditar.precio,
        categoria: modalEditar.categoria,
        tiempo_estimado: modalEditar.tiempo_estimado
      });
      setModalEditar({ abierto: false, idProducto: null, nombre: "", precio: "", categoria: "Entradas", tiempo_estimado: "" });
      cargarCarta();
    } catch (e) {
      alert("Error de red al actualizar los datos del plato.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await wayraApi.post('/admin/productos', { ...nuevoProd, estado: 1 }); 
      if (res.status === 200 || res.status === 201) {
        setMostrarForm(false);
        setNuevoProd({ nombre: '', precio: '', categoria: 'Entradas', tiempo_estimado: '' });
        cargarCarta();
      }
    } catch (e) { 
      alert("Error de red al guardar el plato."); 
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6 text-[#2C3E50]">
      
      {/* 🚀 BARRA SUPERIOR DE CATEGORÍAS FLEXIBLE */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {categorias.map(cat => (
            <button 
              key={cat} 
              onClick={() => setCatSel(cat)} 
              className={`px-4 py-2 rounded-full text-[10px] tracking-[0.2em] font-bold uppercase transition-all border
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
          className="bg-[#0a0913] text-white py-3 px-5 rounded-full font-bold text-[10px] tracking-[0.2em] uppercase shadow-sm hover:bg-[#2d2a45] transition-all flex items-center gap-2 self-end sm:self-auto"
        >
          <span>+ Agregar Producto</span>
        </button>
      </header>

      {/* 🔍 INPUT DE BÚSQUEDA */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="BUSCAR ELEMENTO EN LA CARTA..." 
          className="w-full bg-white border border-slate-100 p-4 pl-5 rounded-2xl text-[10px] text-[#2C3E50] placeholder-slate-400 outline-none focus:border-[#b07d62]/40 font-bold uppercase tracking-widest transition-all"
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* 🍱 LISTADO DE PLATOS */}
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
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                    ${esDisponible ? 'bg-[#f4f1ea]' : 'bg-slate-100'}`}>
                    {obtenerIconoCategoria(p.categoria, esDisponible)}
                  </div>
                  <div>
                    <p className="text-[#2C3E50] font-black text-xs uppercase tracking-wider">{p.nombre}</p>
                    <p className="text-[9px] text-[#7F8C8D] font-bold tracking-widest mt-0.5 uppercase">
                      {p.categoria} • <span className="text-emerald-600 font-extrabold">S/ {parseFloat(p.precio).toFixed(2)}</span> • {p.tiempo_estimado} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleUpdate(p.id_producto, 'estado', esDisponible ? 0 : 1)}
                    className={`px-3 py-1.5 rounded-full text-[8px] font-black tracking-widest border transition-all w-24
                      ${esDisponible 
                        ? 'border-emerald-200 text-emerald-600 bg-emerald-50/50' 
                        : 'border-rose-200 text-rose-500 bg-rose-50/50'}`}
                  >
                    {esDisponible ? 'DISPONIBLE' : 'AGOTADO'}
                  </button>
                  
                  {/* Botón que precarga TODOS los datos actuales del producto al modal de edición */}
                  <button 
                    onClick={() => setModalEditar({
                      abierto: true,
                      idProducto: p.id_producto,
                      nombre: p.nombre,
                      precio: p.precio,
                      categoria: p.categoria,
                      tiempo_estimado: p.tiempo_estimado
                    })}
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

      {/* 🌫️ MODAL 1: REGISTRAR PLATO NUEVO */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-[#0a0913]/40 flex items-center justify-center z-50 p-4 backdrop-blur-md transition-all">
          <form onSubmit={handleSave} className="bg-white p-7 rounded-2xl border border-slate-100 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-[#0a0913] font-black text-lg mb-5 tracking-tight uppercase">Nuevo Producto</h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-[9px] font-black text-[#7F8C8D] tracking-wider uppercase block mb-1.5">Nombre del Plato</label>
                <input type="text" placeholder="INGRESE NOMBRE" className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-slate-100 outline-none focus:border-[#b07d62]/40 font-bold uppercase text-[11px]" 
                  onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value.toUpperCase()})} required />
              </div>
              
              <div>
                <label className="text-[9px] font-black text-[#7F8C8D] tracking-wider uppercase block mb-1.5">Precio de Venta</label>
                <input type="number" step="0.01" placeholder="PRECIO" className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-slate-100 outline-none focus:border-[#b07d62]/40 font-bold text-[11px]" 
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
                <input type="number" placeholder="TIEMPO" className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-slate-100 outline-none focus:border-[#b07d62]/40 font-bold text-[11px]" 
                  onChange={e => setNuevoProd({...nuevoProd, tiempo_estimado: e.target.value})} required />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setMostrarForm(false)} className="flex-1 p-3 text-[#7F8C8D] font-bold hover:text-[#2C3E50] transition-colors text-[10px] tracking-widest">CANCELAR</button>
              <button type="submit" className="flex-1 bg-[#0a0913] py-3 rounded-xl text-white font-black text-[10px] tracking-widest uppercase hover:bg-[#2d2a45] transition-all shadow-md">GUARDAR</button>
            </div>
          </form>
        </div>
      )}

      {/* ⚙️ MODAL 2: EDICIÓN INTEGRAL DE DATOS DEL PRODUCTO (REEMPLAZO TOTAL DE ANTERIOR PRECIO MODAL) */}
      {modalEditar.abierto && (
        <div className="fixed inset-0 bg-[#0a0913]/40 flex items-center justify-center z-50 p-4 backdrop-blur-md transition-all">
          <form onSubmit={handleUpdateProductoCompleto} className="bg-white p-7 rounded-2xl border border-slate-100 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-[#0a0913] font-black text-lg mb-5 tracking-tight uppercase">Editar Producto</h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-[9px] font-black text-[#7F8C8D] tracking-wider uppercase block mb-1.5">Modificar Nombre</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-slate-100 outline-none focus:border-[#b07d62]/40 font-bold uppercase text-[11px]" 
                  value={modalEditar.nombre}
                  onChange={e => setModalEditar({ ...modalEditar, nombre: e.target.value })}
                  required 
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-[#7F8C8D] tracking-wider uppercase block mb-1.5">Modificar Precio (S/)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-slate-100 outline-none focus:border-[#b07d62]/40 font-bold text-[11px]" 
                  value={modalEditar.precio}
                  onChange={e => setModalEditar({ ...modalEditar, precio: e.target.value })}
                  required 
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-[#7F8C8D] tracking-wider uppercase block mb-1.5">Modificar Categoría</label>
                <select 
                  className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-slate-100 outline-none focus:border-[#b07d62]/40 font-bold text-[11px] appearance-none"
                  value={modalEditar.categoria}
                  onChange={e => setModalEditar({ ...modalEditar, categoria: e.target.value })}
                >
                  <option value="Entradas">ENTRADAS</option>
                  <option value="Makis">MAKIS</option>
                  <option value="Fondos">PLATOS DE FONDO</option>
                  <option value="Bebidas">BEBIDAS</option>
                  <option value="Postres">POSTRES</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-[#7F8C8D] tracking-wider uppercase block mb-1.5">Modificar Tiempo (Min)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-slate-100 outline-none focus:border-[#b07d62]/40 font-bold text-[11px]" 
                  value={modalEditar.tiempo_estimado}
                  onChange={e => setModalEditar({ ...modalEditar, tiempo_estimado: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                type="button" 
                onClick={() => setModalEditar({ abierto: false, idProducto: null, nombre: "", precio: "", categoria: "Entradas", tiempo_estimado: "" })} 
                className="flex-1 p-3 text-[#7F8C8D] font-bold hover:text-[#2C3E50] transition-colors text-[10px] tracking-widest"
              >
                CANCELAR
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-[#0a0913] py-3 rounded-xl text-white font-black text-[10px] tracking-widest uppercase hover:bg-[#2d2a45] transition-all shadow-md"
              >
                ACTUALIZAR
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
