import React from 'react';

export const RecepcionLayout = ({ children, panelDerecho }) => {
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900 uppercase italic w-full">
      {/* Área Izquierda: Mapa o Calendario */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col items-center relative overflow-hidden h-full w-full">
        {children}
      </main>
      
      {/* Área Derecha: Control de Admisiones */}
      <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 bg-white h-[40vh] lg:h-full overflow-hidden">
        {panelDerecho}
      </div>
    </div>
  );
};