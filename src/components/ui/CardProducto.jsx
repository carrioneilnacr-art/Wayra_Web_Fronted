import React from 'react';

export const CardProducto = ({ producto, onAction, actionLabel = "+", showStock = true }) => {
  const { nombre, precio, categoria, estado } = producto;
  const esDisponible = parseInt(estado) === 1;

  return (
    <div className={`bg-white p-4 rounded-[2rem] border transition-all flex justify-between items-center h-20 shadow-[0_2px_8px_rgba(0,0,0,0.01)]
      ${esDisponible ? 'border-slate-100 hover:border-blue-500/30' : 'border-slate-100 bg-slate-50/50 opacity-60'}`}
    >
      <div className="min-w-0 pr-3">
        <span className="text-[7px] font-black tracking-widest text-[#b07d62] bg-[#b07d62]/10 px-2 py-0.5 rounded-md uppercase block w-max mb-1">
          {categoria}
        </span>
        <p className="font-black text-slate-800 text-xs truncate uppercase tracking-wide">{nombre}</p>
        <p className="text-blue-600 font-black text-[10px] mt-0.5 tracking-wider font-mono">S/ {parseFloat(precio).toFixed(2)}</p>
      </div>

      {onAction && esDisponible && (
        <button 
          onClick={() => onAction(producto)}
          className="bg-slate-900 text-white font-sans font-black text-sm w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-sm active:scale-95 shrink-0"
        >
          {actionLabel}
        </button>
      )}

      {!esDisponible && showStock && (
        <span className="text-[7px] font-black tracking-widest text-rose-600 bg-rose-50 px-2 py-1 rounded-md uppercase shrink-0">
          AGOTADO
        </span>
      )}
    </div>
  );
};