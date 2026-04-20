import React, { useState, useEffect } from 'react';
import wayraApi from '../../api/wayraApi'; // Nuestra instancia maestra

export const ViewUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null); 
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', usuario: '', password: '', rol: 'mozo' });

  // 1. CARGAR USUARIOS con Axios
  const cargarUsuarios = async () => {
    try {
      const res = await wayraApi.get('/admin/usuarios');
      setUsuarios(res.data);
    } catch (e) { 
      console.error("Error al cargar staff:", e); 
    }
  };

  useEffect(() => { 
    cargarUsuarios(); 
  }, []);

  // 2. GUARDAR NUEVO con Axios
  const registrarPersonal = async (e) => {
    e.preventDefault();
    try {
      const res = await wayraApi.post('/admin/usuarios', nuevoUsuario);
      
      if (res.status === 200 || res.status === 201) {
        setMostrarForm(false);
        setNuevoUsuario({ nombre: '', usuario: '', password: '', rol: 'mozo' });
        cargarUsuarios();
      }
    } catch (e) { 
      alert("Error al registrar: Revisa si el usuario ya existe o la conexión con Render."); 
    }
  };

  // 3. ACTUALIZAR con Axios
  const actualizarPersonal = async (e) => {
    e.preventDefault();
    try {
      await wayraApi.put(`/admin/usuarios/${usuarioEditar.id_usuario}`, usuarioEditar);
      setUsuarioEditar(null);
      cargarUsuarios();
    } catch (e) { 
      alert("Error al actualizar el perfil."); 
    }
  };

  // 4. ELIMINAR con Axios
  const eliminarUsuario = async (id) => {
    if(!window.confirm("¿ELIMINAR ACCESO DEFINITIVAMENTE?")) return;
    try {
      await wayraApi.delete(`/admin/usuarios/${id}`);
      cargarUsuarios();
    } catch (e) {
      alert("Error al eliminar usuario.");
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Staff Wayra</h2>
        <button 
          onClick={() => setMostrarForm(true)} 
          className="bg-emerald-600 text-white p-4 rounded-2xl font-black text-[10px] hover:scale-105 transition-all shadow-lg shadow-emerald-600/20 uppercase tracking-widest"
        >
          + Registrar Personal
        </button>
      </div>

      {/* MODAL REGISTRAR */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={registrarPersonal} className="bg-[#161B22] p-8 rounded-[2.5rem] border border-white/10 w-full max-w-md">
            <h3 className="text-white font-black text-2xl mb-6 italic text-emerald-500 uppercase">Nuevo Perfil</h3>
            <div className="space-y-4">
              <input type="text" placeholder="NOMBRE COMPLETO" className="w-full bg-white/5 p-4 rounded-2xl text-white outline-none border border-white/5 uppercase text-xs" 
                onChange={e => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value.toUpperCase()})} required />
              
              <input type="text" placeholder="USUARIO ACCESO" className="w-full bg-white/5 p-4 rounded-2xl text-white outline-none border border-white/5 text-xs" 
                onChange={e => setNuevoUsuario({...nuevoUsuario, usuario: e.target.value})} required />
              
              <input type="password" placeholder="CONTRASEÑA" className="w-full bg-white/5 p-4 rounded-2xl text-white outline-none border border-white/5 text-xs" 
                onChange={e => setNuevoUsuario({...nuevoUsuario, password: e.target.value})} required />
              
              <select className="w-full bg-white/5 p-4 rounded-2xl text-white border border-white/5 text-xs font-bold" 
                onChange={e => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}>
                <option value="mozo" className="bg-slate-900">MOZO</option>
                <option value="recepcionista" className="bg-slate-900">RECEPCIONISTA</option>
                <option value="admin" className="bg-slate-900">ADMIN</option>
              </select>
            </div>
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setMostrarForm(false)} className="flex-1 text-slate-500 font-black text-xs">CANCELAR</button>
              <button type="submit" className="flex-1 bg-emerald-600 p-4 rounded-2xl text-white font-black text-xs uppercase">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDITAR */}
      {usuarioEditar && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={actualizarPersonal} className="bg-[#161B22] p-8 rounded-[2.5rem] border border-white/10 w-full max-w-md">
            <h3 className="text-white font-black text-2xl mb-6 italic text-blue-500 uppercase">Editar Perfil</h3>
            <div className="space-y-4">
              <input type="text" value={usuarioEditar.nombre} className="w-full bg-white/5 p-4 rounded-2xl text-white outline-none border border-white/5 uppercase text-xs" 
                onChange={e => setUsuarioEditar({...usuarioEditar, nombre: e.target.value.toUpperCase()})} />
              
              <input type="text" value={usuarioEditar.usuario} className="w-full bg-white/5 p-4 rounded-2xl text-white outline-none border border-white/5 text-xs" 
                onChange={e => setUsuarioEditar({...usuarioEditar, usuario: e.target.value})} />
              
              <select value={usuarioEditar.rol} className="w-full bg-white/5 p-4 rounded-2xl text-white border border-white/5 text-xs font-bold" 
                onChange={e => setUsuarioEditar({...usuarioEditar, rol: e.target.value})}>
                <option value="mozo" className="bg-slate-900">MOZO</option>
                <option value="recepcionista" className="bg-slate-900">RECEPCIONISTA</option>
                <option value="admin" className="bg-slate-900">ADMIN</option>
              </select>
            </div>
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setUsuarioEditar(null)} className="flex-1 text-slate-500 font-black text-xs">CANCELAR</button>
              <button type="submit" className="flex-1 bg-blue-600 p-4 rounded-2xl text-white font-black text-xs uppercase">Actualizar</button>
            </div>
          </form>
        </div>
      )}

      {/* GRID DE STAFF */}
      <div className="grid grid-cols-2 gap-6">
        {usuarios.map(u => (
          <div key={u.id_usuario} className="bg-[#161B22] p-8 rounded-[3rem] border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30 text-2xl">
                {u.rol === 'admin' ? '👑' : u.rol === 'recepcionista' ? '📅' : '🏃'}
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase italic">{u.nombre}</p>
                <p className="text-[9px] text-blue-500 font-black tracking-[0.3em] uppercase">{u.rol}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setUsuarioEditar(u)} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all text-xs">✏️</button>
              <button onClick={() => eliminarUsuario(u.id_usuario)} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all text-xs">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};