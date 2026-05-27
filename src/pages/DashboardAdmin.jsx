import React, { useState } from 'react';
import { ViewStats } from "../views/Admin/ViewStats"; 
import { ViewCarta } from "../views/Admin/ViewCarta";
import { ViewUsuarios } from "../views/Admin/ViewUsuarios";
import { ViewHistorial } from "../views/Admin/ViewHistorial";

const DashboardAdmin = ({ onLogout, user }) => {
  const [seccion, setSeccion] = useState('stats');

  return (
    <div className="flex h-screen bg-[#f4f1ea] font-['Montserrat'] overflow-hidden">
      
      {/* 🥖 SIDEBAR: Minimalist Washi Style */}
      <aside className="w-20 md:w-64 bg-[#e2dbd5] p-8 flex flex-col z-20">
        
        {/* BRANDING MINIMAL */}
        <div className="mb-16 text-center md:text-left pl-2">
          <div className="text-[#2d3436] font-light tracking-[0.25em] text-sm font-sans uppercase">
            WAYRA
            <span className="block font-medium tracking-[0.38em] text-[10px] text-slate-500 mt-0.5">NIKKEI</span>
          </div>
          <p className="hidden md:block text-[8px] tracking-[0.3em] text-slate-400 font-medium uppercase mt-3">
            {user?.rol || 'ADMIN'}
          </p>
        </div>
        
        {/* NAVEGACIÓN LIMPIA */}
        <nav className="flex-1 space-y-3">
          {[
            { id: 'stats', label: 'Dashboard' },
            { id: 'carta', label: 'Gestión Carta' },
            { id: 'usuarios', label: 'Usuarios' },
            { id: 'historial', label: 'Historial' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setSeccion(item.id)} 
              className={`w-full text-left py-2.5 px-4 rounded-full transition-all duration-300 text-[10px] tracking-[0.25em] uppercase
                ${seccion === item.id 
                  ? 'bg-[#b07d62]/15 text-[#b07d62] font-bold' 
                  : 'text-[#6c757d] hover:text-[#2d3436] hover:bg-black/5'}`}
            >
              <span className="block truncate">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* CERRAR SESIÓN */}
        <button 
          onClick={onLogout} 
          className="mt-auto pt-4 border-t border-black/5 text-[#6c757d] hover:text-[#8a3324] text-[9px] tracking-[0.25em] uppercase transition-all font-medium pl-4 text-left"
        >
          Salir
        </button>
      </aside>

      {/* 🍽️ ÁREA DE CONTENIDO */}
      <main className="flex-1 overflow-y-auto p-8 md:p-14 relative bg-[#f4f1ea]">
        
        {/* CABECERA LIMPIA SIN BLOQUE DERECHO */}
        <header className="mb-10 pb-4 border-b border-black/[0.04]">
          <div className="animate-in slide-in-from-left duration-500">
            <h2 className="text-xl md:text-2xl font-light tracking-[0.4em] text-[#2d3436] uppercase">
              {seccion === 'stats' ? 'Métricas' : 
               seccion === 'carta' ? 'Gestión Carta' : 
               seccion === 'usuarios' ? 'Usuarios' : 'Historial'}
            </h2>
            <p className="text-[8px] tracking-[0.3em] text-[#b07d62] uppercase font-medium mt-1">
              Gestión Profesional · {seccion}
            </p>
          </div>
        </header>

        {/* VISTAS DINÁMICAS */}
        <div className="animate-in fade-in zoom-in-98 duration-300">
          {seccion === 'stats' && <ViewStats />}
          {seccion === 'carta' && <ViewCarta />}
          {seccion === 'usuarios' && <ViewUsuarios />}
          {seccion === 'historial' && <ViewHistorial />}
        </div>
      </main>

    </div>
  );
};

export default DashboardAdmin;
