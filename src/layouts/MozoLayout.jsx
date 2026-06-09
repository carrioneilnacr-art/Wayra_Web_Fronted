import React from 'react';

export const MozoLayout = ({ children, panelIzquierdo, panelDerecho }) => {
  return (
    <div className="flex flex-col xl:flex-row h-screen bg-[#f4f1ea]/30 text-[#1a1a1a] overflow-hidden relative font-sans w-full">
      <div className="nazca-spirit"></div>

      {/* 📊 PANEL IZQUIERDO: Control de Carga y Grilla de Mesas (Adaptable) */}
      <aside className="w-full xl:w-[28%] border-b xl:border-b-0 xl:border-r border-black/5 p-4 lg:p-6 overflow-y-auto backdrop-blur-sm bg-white/20 shrink-0">
        {panelIzquierdo}
      </aside>

      {/* 🥢 PANEL CENTRAL: Comandero Táctil Dinámico */}
      <main className="flex-1 bg-white/40 p-4 lg:p-8 overflow-y-auto relative border-b xl:border-b-0 xl:border-r border-black/5 h-[50vh] xl:h-full w-full">
        {children}
      </main>

      {/* ⏱️ PANEL DERECHO: Monitor de Cocina y Tiempos de Entrega */}
      <aside className="w-full xl:w-[32%] p-4 lg:p-6 overflow-y-auto bg-white/40 backdrop-blur-sm shrink-0">
        {panelDerecho}
      </aside>
    </div>
  );
};