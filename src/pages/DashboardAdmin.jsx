import React, { useState } from 'react';
// ✅ CORREGIDO: Ruta ajustada desde src/pages hacia src/helpers
import { ejecutarCierreSesionGlobal } from '../helpers/logoutHelper'; 
import { ViewStats } from "../views/Admin/ViewStats"; 
import { ViewCarta } from "../views/Admin/ViewCarta";
import { ViewUsuarios } from "../views/Admin/ViewUsuarios";
import { ViewHistorial } from "../views/Admin/ViewHistorial";

const DashboardAdmin = ({ onLogout, user }) => {
  const [seccion, setSeccion] = useState('stats');
  // 🌟 NUEVO ESTADO: Controla el despliegue del menú colapsable en tablets y móviles
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex h-screen bg-[#f4f1ea] font-['Montserrat'] overflow-hidden relative">
      
      {/* 📱 BOTÓN HAMBURGUESA FLOTANTE: Solo visible en pantallas móviles/tablets (hidden en md) */}
      <button 
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="md:hidden fixed top-6 left-6 z-40 bg-[#0a0913] text-white p-3 rounded-2xl shadow-xl border border-white/10 transition-all active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          {menuAbierto ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* 🌌 SIDEBAR: Ultra Minimalist Midnight Style (#0a0913) RESPONSIVO */}
      {/* 🌟 MODIFICADO: Añadidas clases de transformación e inset para colapsar de forma nativa en pantallas pequeñas */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#0a0913] p-6 flex flex-col border-r border-white/5 shadow-[5px_0_25px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:w-64
        ${menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* 🍣 BRANDING ESTÉTICO: Isotipo Oficial de Wayra Nikkei (Login Style) */}
        {/* 🌟 AJUSTADO: Eliminado el w-20 tosco para que en tablets se vea el menú completo al abrirse */}
        <div className="mb-14 pt-4 flex flex-col items-start pl-4">
          <div className="flex items-center gap-3.5">
            {/* Isotipo Oficial en Terracota */}
            <div className="text-[#b07d62]">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" strokeWidth="2.5" fill="#f4f1ea" stroke="#b07d62" />
                <path d="M7 12c2.5-3.5 5-3.5 10 0" strokeDasharray="3 2" />
                <path d="M7 17c2.5-3.5 5-3.5 10 0" strokeWidth="0.8" />
              </svg>
            </div>
            {/* Texto de Marca Sincronizado */}
            <div className="text-white font-light tracking-[0.2em] text-xs font-sans uppercase">
              WAYRA
              <span className="block font-black tracking-[0.35em] text-[9px] text-[#b07d62] mt-0.5">NIKKEI</span>
            </div>
          </div>
          <p className="text-[8px] tracking-[0.3em] text-slate-500 font-bold uppercase mt-4 pl-0.5">
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
              onClick={() => { setSeccion(item.id); setMenuAbierto(false); }} // 🌟 Cierra el menú al elegir sección en móviles
              className={`w-full flex items-center gap-4 py-3 px-4 rounded-full transition-all duration-300 text-[10px] tracking-[0.2em] uppercase
                ${seccion === item.id 
                  ? 'bg-[#b07d62]/15 text-[#e0a885] font-bold shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className={`transition-transform duration-300 ${seccion === item.id ? 'scale-105 text-[#e0a885]' : 'text-slate-400 group-hover:text-white'}`}>
                {item.icon}
              </div>
              <span className="truncate">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* 🚪 BOTÓN DE CIERRE DE SESIÓN CENTRALIZADO */}
        <button 
          onClick={() => ejecutarCierreSesionGlobal(user, onLogout)} 
          className="mt-auto pt-4 border-t border-white/5 flex items-center gap-4 text-slate-500 hover:text-[#d9534f] text-[9px] tracking-[0.2em] uppercase transition-all font-medium px-4 text-left group"
        >
          <svg className="w-4 h-4 transition-colors group-hover:text-[#d9534f]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="transition-colors group-hover:text-[#d9534f]">Salir</span>
        </button>
      </aside>

      {/* 🌟 BLUR OVERLAY EN MÓVIL: Oscurece el fondo al abrir el menú en tablets */}
      {menuAbierto && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden" 
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* 🍽️ ÁREA DE CONTENIDO PRINCIPAL */}
      {/* 🌟 MODIFICADO: Agregado pl-24 en móviles para evitar colisión con el botón flotante y p-6 para aire en pantallas pequeñas */}
      <main className="flex-1 overflow-y-auto p-6 pt-24 md:p-14 relative bg-[#f4f1ea] w-full max-w-full">
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
