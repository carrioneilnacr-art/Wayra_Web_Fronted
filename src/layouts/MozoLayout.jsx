import React from 'react';
import PropTypes from 'prop-types';

export const MozoLayout = ({ children, panelIzquierdo, panelDerecho }) => {
  return (
    <div className="flex flex-col xl:flex-row h-screen bg-slate-50 text-slate-800 overflow-hidden relative font-sans w-full">

      {/* 🗺️ PANEL IZQUIERDO (70%): Mapa de Mesas y Floor Plan */}
      {/* Se agregó border-r border-slate-200 para la línea divisoria perfecta */}
      <main className="w-full xl:w-[70%] h-full p-6 lg:p-8 overflow-y-auto bg-slate-50 border-r border-slate-200 shrink-0 scrollbar-thin">
        {panelIzquierdo}
      </main>

      {/* ⚙️ PANEL DERECHO (30%): Monitor Operativo y Cobros */}
      {/* El fondo es estrictamente blanco (bg-white) para contrastar */}
      <aside className="w-full xl:w-[30%] h-full bg-white z-10 overflow-y-auto shrink-0">
        {panelDerecho}
      </aside>

      {/* 🚀 CAPA MODAL: Aquí se renderizarán el Comandero y el Checkout */}
      {children}
    </div>
  );
};

MozoLayout.propTypes = {
  children: PropTypes.node,
  panelIzquierdo: PropTypes.node.isRequired,
  panelDerecho: PropTypes.node.isRequired,
};