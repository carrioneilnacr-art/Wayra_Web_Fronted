import React from 'react';

export const ScrollCategorias = ({ categorias = [], categoriaActiva, onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0 w-full animate-in fade-in duration-300">
      {categorias.map((cat) => {
        const esActivo = categoriaActiva?.toUpperCase() === cat?.toUpperCase();
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-5 py-2.5 rounded-xl text-[9px] font-black tracking-widest transition-all border uppercase whitespace-nowrap
              ${esActivo 
                ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};