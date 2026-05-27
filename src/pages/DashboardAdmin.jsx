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
      <aside className="w-20 md:w-64 bg-[#0a0913] p-6 flex flex-col z-20 border-r border-white/5">
        
        {/* 🍣 BRANDING ESTÉTICO: Logo de la Ola/Sushi de Fusión */}
        <div className="mb-14 pt-4 flex flex-col items-center md:items-start md:pl-3">
          <div className="flex items-center gap-3">
            {/* Isotipo Wave/Sushi en Terracota */}
            <div className="text-[#b07d62] animate-pulse">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12c3-2.5 6-2.5 9 0s6 2.5 9 0" />
                <path d="M2 17c3-2.5 6-2.5 9 0s6 2.5 9 0" />
                <path d="M12 2a4 4 0 0 1 4 4v2H8V6a4 4 0 0 1 4-4z" />
                <circle cx="12" cy="13" r="2" fill="currentColor" />
              </svg>
            </div>
            {/* Texto de Marca Sincronizado */}
            <div className="hidden md:block text-white font-light tracking-[0.2em] text-xs font-sans uppercase">
              WAYRA
              <span className="block font-black tracking-[0.35em] text-[9px] text-[#b07d62] mt-0.5">NIKKEI</span>
            </div>
          </div>
          <p className="hidden md:block text-[8px] tracking-[0.25em] text-slate-500 font-bold uppercase mt-4 pl-0.5">
            ROL: {user?.rol || 'ADMIN'}
          </p>
        </div>
        
        {/* NAVEGACIÓN CON ICONS LINEALES MINIMALISTAS */}
        <nav className="flex-1 space-y-1.5">
          {[
            { 
              id: 'stats', 
              label: 'Dashboard', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
              )
            },
            { 
              id: 'carta', 
              label: 'Gestión Carta', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              )
            },
            { 
              id: 'usuarios', 
              label: 'Usuarios', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )
            },
            { 
              id: 'historial', 
              label: 'Historial', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setSeccion(item.id)} 
              className={`w-full flex items-center gap-4 py-3 px-4 rounded-full transition-all duration-300 text-[10px] tracking-[0.22em] uppercase
                ${seccion === item.id 
                  ? 'bg-[#b07d62]/15 text-[#e0a885] font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className={`transition-transform duration-300 ${seccion === item.id ? 'scale-105 text-[#e0a885]' : 'text-slate-500 group-hover:text-slate-300'}`}>
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
          className="mt-auto pt-4 border-t border-white/5 flex items-center gap-4 text-slate-500 hover:text-[#c0392b] text-[9px] tracking-[0.2em] uppercase transition-all font-medium px-4 text-left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden md:block">Salir</span>
        </button>
      </aside>

      {/* 🍽️ ÁREA DE CONTENIDO PRINCIPAL: Limpieza Absoluta de Cabecera */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12 relative bg-[#f4f1ea]">
        
        {/* El header anterior fue removido para evitar la duplicación de títulos */}
        
        {/* VISTAS DINÁMICAS (Se renderizan al tope con espaciado limpio) */}
        <div className="animate-in fade-in zoom-in-98 duration-300 pt-2">
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
