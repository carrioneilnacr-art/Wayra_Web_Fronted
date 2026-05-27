import React, { useState } from 'react';
import { ViewStats } from "../views/Admin/ViewStats"; 
import { ViewCarta } from "../views/Admin/ViewCarta";
import { ViewUsuarios } from "../views/Admin/ViewUsuarios";
import { ViewHistorial } from "../views/Admin/ViewHistorial";

const DashboardAdmin = ({ onLogout, user }) => {
  const [seccion, setSeccion] = useState('stats');

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-['Montserrat'] overflow-hidden">
      
      {/* 💻 SIDEBAR: Estilo Azul Índigo Profundo Sincronizado */}
      <aside className="w-20 md:w-64 bg-[#111E38] p-8 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.03)] z-20">
        
        {/* LOGO BRANDING */}
        <div className="mb-12 text-center md:text-left">
          <div className="hanko-status inline-block text-[#D35400] border border-[#D35400]/30 bg-white/5 px-4 py-2 mb-2 font-black tracking-widest text-xs rounded-lg">
            WAYRA<br/>NIKKEI
          </div>
          <p className="hidden md:block text-[8px] tracking-[0.4em] text-slate-400 font-bold uppercase opacity-80 mt-1">
            Nivel: {user?.rol || 'Admin'}
          </p>
        </div>
        
        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="flex-1 space-y-5">
          {[
            { id: 'stats', label: 'Dashboard', icon: '📊' },
            { id: 'carta', label: 'Gestión Carta', icon: '🍣' },
            { id: 'usuarios', label: 'Personal', icon: '👥' },
            { id: 'historial', label: 'Historial', icon: '📜' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setSeccion(item.id)} 
              className={`w-full text-left flex items-center gap-4 py-2.5 px-3 rounded-xl transition-all duration-300 group
                ${seccion === item.id ? 'bg-white/5 text-[#D35400] font-bold shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <span className={`text-lg transition-transform duration-300 ${seccion === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span> 
              <span className={`hidden md:block text-[10px] tracking-[0.3em] uppercase font-medium
                ${seccion === item.id ? 'text-white' : ''}`}>
                {item.label}
              </span>
              {seccion === item.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-[#D35400] rounded-full shadow-[0_0_8px_#D35400]"></div>
              )}
            </button>
          ))}
        </nav>

        {/* LOGOUT BUTTON */}
        <button 
          onClick={onLogout} 
          className="mt-auto py-4 border-t border-white/10 text-slate-500 hover:text-[#C0392B] text-[9px] tracking-[0.4em] uppercase transition-all font-black"
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* 🍽️ ÁREA DE TRABAJO PRINCIPAL: Fondo Off-White Limpio */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12 relative bg-[#F8F9FA]">
        
        {/* CABECERA DINÁMICA REESTRUCTURADA */}
        <header className="mb-8 flex justify-between items-end border-b border-slate-200/60 pb-5">
          <div className="animate-in slide-in-from-left duration-500">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-[#1F497D] uppercase">
              {seccion === 'stats' ? 'Panel de Control' : 
               seccion === 'carta' ? 'Inventario de Carta' : 
               seccion === 'usuarios' ? 'Gestión de Personal' : 'Archivo Histórico'}
            </h2>
            <p className="text-[9px] tracking-[0.3em] text-[#7F8C8D] uppercase font-bold mt-1.5">
              Administración General · Sistema de Resiliencia Operativa
            </p>
          </div>

          <div className="hidden lg:block text-right">
            <p className="text-[8px] tracking-[0.3em] text-slate-400 uppercase font-medium">Patrimonio Nikkei</p>
            <p className="text-[10px] tracking-[0.15em] text-[#1F497D] font-black uppercase">Lima — Tokyo</p>
          </div>
        </header>

        {/* CONTENEDOR DE VISTAS CON ANIMACIÓN SUAVE */}
        <div className="animate-in fade-in zoom-in-95 duration-400">
          {seccion === 'stats' && <ViewStats />}
          {seccion === 'carta' && <ViewCarta />}
          {seccion === 'usuarios' && <ViewUsuarios />}
          {seccion === 'historial' && <ViewHistorial />}
        </div>

        {/* WATERMARK DECORATIVO TRANSPARENTE */}
        <div className="nazca-spirit opacity-[0.005] pointer-events-none absolute bottom-10 right-10 w-64 h-64"></div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
