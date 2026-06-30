import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';

export const ViewUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null); 
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', usuario: '', password: '', rol: 'mozo' });

  // 1. CARGAR USUARIOS CONSUMIENDO EL SERVICIO CENTRALIZADO
  const cargarUsuarios = async () => {
    try {
      const data = await authService.getUsuarios();
      if (data && Array.isArray(data)) {
        setUsuarios(data);
      }
    } catch (e) { 
      console.error("Error al cargar staff desde el servicio:", e); 
    }
  };

  useEffect(() => { 
    cargarUsuarios(); 
    const interval = setInterval(cargarUsuarios, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. GUARDAR NUEVO
  const registrarPersonal = async (e) => {
    e.preventDefault();
    try {
      await authService.createUsuario(nuevoUsuario);
      setMostrarForm(false);
      setNuevoUsuario({ nombre: '', usuario: '', password: '', rol: 'mozo' });
      cargarUsuarios();
    } catch (err) { 
      console.error("Error al registrar personal:", err);
      alert("Error al registrar: Revisa si el usuario ya existe."); 
    }
  };

  // 3. ACTUALIZAR
  const actualizarPersonal = async (e) => {
    e.preventDefault();
    try {
      await authService.updateUsuario(usuarioEditar.id_usuario, usuarioEditar);
      setUsuarioEditar(null);
      cargarUsuarios();
    } catch (err) { 
      console.error("Error al actualizar el perfil:", err);
      alert("Error al actualizar el perfil."); 
    }
  };

  // 4. ELIMINAR
  const eliminarUsuario = async (id) => {
    if(!globalThis.confirm("¿ELIMINAR ACCESO DEFINITIVAMENTE?")) return;
    try {
      await authService.deleteUsuario(id);
      cargarUsuarios();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("Error al eliminar usuario.");
    }
  };

  const renderizarIconoRol = (rol) => {
    const rolNormalizado = rol ? rol.toLowerCase() : 'mozo';
    switch (rolNormalizado) {
      case 'admin':
        return (
          <svg className="w-5 h-5 text-[#b07d62]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'recepcionista':
        return (
          <svg className="w-5 h-5 text-[#b07d62]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-[#b07d62]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6 text-[#2C3E50]">
      
      {/* HEADER ALINEADO */}
      <header className="flex justify-between items-center w-full px-1">
        <div>
          <h2 className="text-2xl font-black text-slate-800 italic tracking-tighter uppercase">Control de Personal</h2>
          <p className="text-[9px] text-[#b07d62] font-black tracking-widest uppercase mt-1">Estatus del Staff en Tiempo Real</p>
        </div>
        <button 
          onClick={() => setMostrarForm(true)} 
          className="bg-[#0a0913] text-white py-3 px-6 rounded-full font-bold text-[10px] tracking-[0.2em] uppercase shadow-sm hover:bg-[#2d2a45] transition-all shrink-0"
        >
          + Registrar Personal
        </button>
      </header>

      {/* GRID DE TARJETAS FLUIDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {usuarios.map(u => {
          const estado = u.estado_sesion || 'offline';
          const rolUser = u.rol ? u.rol.toLowerCase() : 'mozo';
          
          let statusDotBgClass = 'bg-slate-300';
          if (estado === 'activo') {
            statusDotBgClass = 'bg-emerald-500';
          } else if (estado === 'break') {
            statusDotBgClass = 'bg-amber-500';
          }

          return (
            <div key={u.id_usuario} className="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.01)] relative overflow-hidden transition-all hover:border-slate-200/80">
              
              {/* BOTONES DE ACCIÓN FLOTANTES */}
              <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                <button 
                  onClick={() => setUsuarioEditar({ ...u, password: '' })} 
                  className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100/50"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button 
                  onClick={() => eliminarUsuario(u.id_usuario)} 
                  className="p-2 bg-rose-50/60 text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100/30"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* BRANDING DEL PERFIL */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-[#f4f1ea] flex items-center justify-center relative shadow-inner shrink-0">
                  {renderizarIconoRol(u.rol)}
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${statusDotBgClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#2C3E50] font-black text-xs uppercase tracking-wider truncate pr-14">{u.nombre}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] tracking-[0.2em] bg-[#b07d62]/10 text-[#b07d62] font-black px-2 py-0.5 rounded-md uppercase">
                      {u.rol}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase truncate">
                      ID: {u.usuario}
                    </span>
                  </div>
                </div>
              </div>

              {/* INDICADORES OPERATIVOS POR ROL */}
              <div className="py-4 flex-1">
                {rolUser === 'mozo' && (
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Carga de Trabajo:</span>
                    <span className="text-[10px] font-black text-[#b07d62] tracking-wider uppercase">
                      {u.mesas_asignadas || 0} Mesas Activas
                    </span>
                  </div>
                )}

                {rolUser === 'recepcionista' && (
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Ingresos Validados:</span>
                    <span className="text-[10px] font-black text-[#b07d62] tracking-wider uppercase">
                      {u.checkins_hoy || 0} Check-Ins Hoy
                    </span>
                  </div>
                )}

                {rolUser === 'admin' && (
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Privilegios:</span>
                    <span className="text-[10px] font-black text-emerald-600 tracking-wider uppercase">
                      Control Maestro
                    </span>
                  </div>
                )}
              </div>

              {/* TRACKING DE ÚLTIMA ACCIÓN */}
              <div className="border-t border-slate-50 pt-3 mt-1">
                <p className="text-[8px] font-black text-slate-400 tracking-widest uppercase">Última Acción Registrada</p>
                <p className="text-[10px] font-bold text-slate-600 truncate mt-1 bg-slate-50/50 py-1.5 px-2.5 rounded-lg border border-dashed border-slate-200/60">
                  {u.ultima_accion}
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* 🌫️ MODAL 1: REGISTRAR */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-[#0a0913]/40 flex items-center justify-center z-50 p-4 backdrop-blur-md transition-all">
          <form onSubmit={registrarPersonal} className="bg-white p-7 rounded-2xl border border-slate-100 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-[#0a0913] font-black text-lg mb-5 tracking-tight uppercase">Nuevo Perfil</h3>
            <div className="space-y-3.5">
              <input type="text" placeholder="NOMBRE COMPLETO" className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] outline-none font-bold uppercase text-[11px] focus:bg-white border border-transparent focus:border-[#b07d62]/30 transition-all" onChange={e => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value.toUpperCase()})} required />
              <input type="text" placeholder="USUARIO DE ACCESO" className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] outline-none font-bold text-[11px] focus:bg-white border border-transparent focus:border-[#b07d62]/30 transition-all" onChange={e => setNuevoUsuario({...nuevoUsuario, usuario: e.target.value})} required />
              <input type="password" placeholder="CONTRASEÑA" className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] outline-none font-bold text-[11px] focus:bg-white border border-transparent focus:border-[#b07d62]/30 transition-all" onChange={e => setNuevoUsuario({...nuevoUsuario, password: e.target.value})} required />
              <select className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] outline-none font-bold text-[11px] focus:bg-white border border-transparent focus:border-[#b07d62]/30 transition-all" onChange={e => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}>
                <option value="mozo">MOZO</option>
                <option value="recepcionista">RECEPCIONISTA</option>
                <option value="admin">ADMIN</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setMostrarForm(false)} className="flex-1 p-3 text-[#7F8C8D] font-bold text-[10px] tracking-widest uppercase">CANCELAR</button>
              <button type="submit" className="flex-1 bg-[#0a0913] py-3 rounded-xl text-white font-black text-[10px] tracking-widest uppercase hover:bg-[#2d2a45] transition-all shadow-md">GUARDAR</button>
            </div>
          </form>
        </div>
      )}

      {/* ⚙️ MODAL 2: EDITAR PERFIL */}
      {usuarioEditar && (
        <div className="fixed inset-0 bg-[#0a0913]/40 flex items-center justify-center z-50 p-4 backdrop-blur-md transition-all">
          <form onSubmit={actualizarPersonal} className="bg-white p-7 rounded-2xl border border-slate-100 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-[#0a0913] font-black text-lg mb-5 tracking-tight uppercase">Editar Perfil</h3>
            <div className="space-y-3.5">
              <div>
                <label htmlFor="editar-staff-nombre" className="text-[9px] font-black text-[#7F8C8D] uppercase block mb-1.5 tracking-wider">Nombre</label>
                <input id="editar-staff-nombre" type="text" value={usuarioEditar.nombre} className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] outline-none font-bold uppercase text-[11px] focus:bg-white border border-transparent focus:border-[#b07d62]/30 transition-all" onChange={e => setUsuarioEditar({...usuarioEditar, nombre: e.target.value.toUpperCase()})} />
              </div>
              <div>
                <label htmlFor="editar-staff-usuario" className="text-[9px] font-black text-[#7F8C8D] uppercase block mb-1.5 tracking-wider">Usuario</label>
                <input id="editar-staff-usuario" type="text" value={usuarioEditar.usuario} className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] outline-none font-bold text-[11px] focus:bg-white border border-transparent focus:border-[#b07d62]/30 transition-all" onChange={e => setUsuarioEditar({...usuarioEditar, usuario: e.target.value})} />
              </div>
              <div>
                <label htmlFor="editar-staff-password" className="text-[9px] font-black text-[#7F8C8D] uppercase block mb-1.5 tracking-wider">Nueva Contraseña (Opcional)</label>
                <input id="editar-staff-password" type="password" placeholder="DEJAR EN BLANCO PARA NO CAMBIAR" value={usuarioEditar.password || ''} className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] border border-dashed border-slate-200 outline-none font-bold text-[11px] focus:bg-white focus:border-solid focus:border-[#b07d62]/30 transition-all" onChange={e => setUsuarioEditar({...usuarioEditar, password: e.target.value})} />
              </div>
              <div>
                <label htmlFor="editar-staff-rol" className="text-[9px] font-black text-[#7F8C8D] uppercase block mb-1.5 tracking-wider">Rol</label>
                <select id="editar-staff-rol" value={usuarioEditar.rol} className="w-full bg-slate-50 p-3.5 rounded-xl text-[#2C3E50] outline-none font-bold text-[11px] focus:bg-white border border-transparent focus:border-[#b07d62]/30 transition-all" onChange={e => setUsuarioEditar({...usuarioEditar, rol: e.target.value})}>
                  <option value="mozo">MOZO</option>
                  <option value="recepcionista">RECEPCIONISTA</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setUsuarioEditar(null)} className="flex-1 p-3 text-[#7F8C8D] font-bold text-[10px] tracking-widest uppercase">CANCELAR</button>
              <button type="submit" className="flex-1 bg-[#0a0913] py-3 rounded-xl text-white font-black text-[10px] tracking-widest uppercase hover:bg-[#2d2a45] transition-all shadow-md">ACTUALIZAR</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};