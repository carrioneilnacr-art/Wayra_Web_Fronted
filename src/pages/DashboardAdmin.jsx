import React, { useState } from 'react';
import { ViewStats } from "../views/Admin/ViewStats"; 
import { ViewCarta } from "../views/Admin/ViewCarta";
import { ViewUsuarios } from "../views/Admin/ViewUsuarios";
import { ViewHistorial } from "../views/Admin/ViewHistorial";

const DashboardAdmin = ({ onLogout, user }) => {
  const [seccion, setSeccion] = useState('stats');

  return (
    <div className="flex h-screen bg-admin-wayra font-['Montserrat'] overflow-hidden">
      
      {/* SIDEBAR: Slate Style (#2d3436) */}
      <aside className="w-20 md:w-64 bg-[#2d3436] p-8 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.05)] z-20">
        <div className="mb-12 text-center md:text-left">
          <div className="hanko-status inline-block text-[#b07d62] border-[#b07d62] bg-white/5 p-2 mb-2">
            WAYRA<br/>ADMIN
          </div>
          <p className="hidden md:block text-[7px] tracking-[0.5em] text-[#b07d62] font-black uppercase opacity-60">
            Nivel: {user?.rol || 'Staff'}
          </p>
        </div>
        
        <nav className="flex-1 space-y-6">
          {[
            { id: 'stats', label: 'Dashboard', icon: '📊' },
            { id: 'carta', label: 'Gestión Carta', icon: '🍕' },
            { id: 'usuarios', label: 'Usuarios', icon: '👥' },
            { id: 'historial', label: 'Historial', icon: '📜' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setSeccion(item.id)} 
              className={`w-full text-left flex items-center gap-4 transition-all duration-500 group
                ${seccion === item.id ? 'text-[#b07d62]' : 'text-slate-400 hover:text-white'}`}
            >
              <span className={`text-xl transition-transform duration-500 ${seccion === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span> 
              <span className={`hidden md:block text-[9px] tracking-[0.4em] uppercase font-light
                ${seccion === item.id ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {seccion === item.id && <div className="ml-auto w-1 h-1 bg-[#b07d62] rounded-full shadow-[0_0_8px_#b07d62]"></div>}
            </button>
          ))}
        </nav>

        <button 
          onClick={onLogout} 
          className="mt-auto py-4 border-t border-white/5 text-slate-500 hover:text-[#8a3324] text-[8px] tracking-[0.5em] uppercase transition-all font-bold"
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* ÁREA DE CONTENIDO: Washi Style (#f4f1ea) */}
      <main className="flex-1 overflow-y-auto p-8 md:p-16 relative">
        
        {/* Header de Sección */}
        <header className="mb-12 flex justify-between items-end">
          <div className="animate-in slide-in-from-left duration-700">
            <h2 className="text-3xl md:text-5xl font-extralight tracking-[0.6em] text-[#2d3436] uppercase italic">
              {seccion === 'stats' ? 'Métricas' : 
               seccion === 'carta' ? 'Inventario' : 
               seccion === 'usuarios' ? 'Personal' : 'Archivo'}
            </h2>
            <div className="h-[1.5px] w-12 bg-[#b07d62] mt-4 mb-2"></div>
            <p className="text-[9px] tracking-[0.4em] text-[#b07d62] uppercase font-medium">
              Gestión Profesional · {seccion}
            </p>
          </div>

          <div className="hidden lg:block text-right">
            <p className="text-[7px] tracking-[0.3em] text-slate-400 uppercase">Patrimonio Nikkei</p>
            <p className="text-[8px] tracking-[0.2em] text-[#2d3436] font-bold">LIMA — TOKYO</p>
          </div>
        </header>

        {/* Contenido Dinámico envuelto en una transición suave */}
        <div className="animate-in fade-in zoom-in-95 duration-500">
          {seccion === 'stats' && <ViewStats />}
          {seccion === 'carta' && <ViewCarta />}
          {seccion === 'usuarios' && <ViewUsuarios />}
          {seccion === 'historial' && <ViewHistorial />}
        </div>

        {/* Decoración Nazca en el fondo del contenido */}
        <div className="nazca-spirit opacity-[0.01] pointer-events-none absolute bottom-10 right-10 w-64 h-64"></div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
