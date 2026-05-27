import React, { useState } from 'react';
import { ViewStats } from "../views/Admin/ViewStats"; 
import { ViewCarta } from "../views/Admin/ViewCarta";
import { ViewUsuarios } from "../views/Admin/ViewUsuarios";
import { ViewHistorial } from "../views/Admin/ViewHistorial";

const DashboardAdmin = ({ onLogout, user }) => {
  const [seccion, setSeccion] = useState('stats');

  return (
    <div className="flex h-screen bg-[#f4f1ea] font-['Montserrat'] overflow-hidden">
      
      {/* 🌌 SIDEBAR: Ultra Minimalist Midnight Style (#0a0913) */}
      <aside className="w-20 md:w-64 bg-[#0a0913] p-6 flex flex-col z-20 shadow-[5px_0_25px_rgba(0,0,0,0.3)]">
        
        {/* BRANDING MINIMAL */}
        <div className="mb-14 text-center md:text-left pt-4 pl-2">
          <div className="text-white font-light tracking-[0.25em] text-sm uppercase">
            WAYRA
            <span className="block font-medium tracking-[0.38em] text-[10px] text-[#b07d62] mt-0.5">NIKKEI</span>
          </div>
          <p className="hidden md:block text-[8px] tracking-[0.3em] text-slate-500 font-medium uppercase mt-3">
            {user?.rol || 'ADMIN'}
          </p>
        </div>
        
        {/* NAVEGACIÓN CON ICONS LINEALES MINIMALISTAS */}
        <nav className="flex-1 space-y-2">
          {[
            { 
              id: 'stats', 
              label: 'Dashboard', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
              )
            },
            { 
              id: 'carta', 
              label: 'Gestión Carta', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              )
            },
            { 
              id: 'usuarios', 
              label: 'Usuarios', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )
            },
            { 
              id: 'historial', 
              label: 'Historial', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setSeccion(item.id)} 
              className={`w-full flex items-center gap-4 py-3 px-4 rounded-full transition-all duration-300 text-[10px] tracking-[0.2em] uppercase
                ${seccion === item.id 
                  ? 'bg-[#b07d62]/20 text-[#e0a885] font-bold shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className={`transition-transform duration-300 ${seccion === item.id ? 'scale-110 text-[#e0a885]' : 'text-slate-400 group-hover:text-white'}`}>
                {item.icon}
              </div>
              <span className="hidden md:block truncate">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* CERRAR SESIÓN */}
        <button 
          onClick={onLogout} 
          className="mt-auto pt-4 border-t border-white/5 flex items-center gap-4 text-slate-500 hover:text-[#d9534f] text-[9px] tracking-[0.2em] uppercase transition-all font-medium px-4 text-left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden md:block">Salir</span>
        </button>
      </aside>

      {/* 🍽️ ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8 md:p-14 relative bg-[#f4f1ea]">
        
        {/* CABECERA ULTRA LIMPIA */}
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
