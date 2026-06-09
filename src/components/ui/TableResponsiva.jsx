import React from 'react';

export const TableResponsiva = ({ columnas = [], datos = [], renderFila }) => {
  if (!datos || datos.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <span className="text-2xl opacity-40">📊</span>
        <p className="text-[9px] font-black text-slate-400 tracking-[0.3em] uppercase mt-2">No se encontraron registros en el sistema</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] overflow-hidden animate-in fade-in duration-500">
      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              {columnas.map((col, index) => (
                <th 
                  key={index} 
                  className="p-4 text-[9px] font-black text-slate-400 tracking-widest uppercase"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {datos.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                {renderFila(item, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};