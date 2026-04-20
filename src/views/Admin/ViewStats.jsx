import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';
import wayraApi from '../../api/wayraApi'; 

export const ViewStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const cargarMetricas = async () => {
    try {
      const res = await wayraApi.get('/admin/metrics');
      setData(res.data); 
    } catch (e) { 
      console.error("Error al obtener métricas de Render:", e); 
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    cargarMetricas();
    const interval = setInterval(cargarMetricas, 30000); 
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
    </div>
  );
  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <header>
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Métricas de Rendimiento</h2>
        <p className="text-[10px] text-blue-500 font-black tracking-[0.4em] mt-2">ANÁLISIS DE INGRESOS Y PRODUCTIVIDAD — WAYRA NIKKEI</p>
      </header>

      {/* CARDS KPI */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#161B22] p-8 rounded-[3rem] border border-white/5 shadow-2xl group hover:border-blue-500/50 transition-all">
          <p className="text-[9px] font-black text-blue-500 mb-2 tracking-widest uppercase">Ventas de Hoy</p>
          <h3 className="text-4xl font-black text-white italic">
            S/ {Number(data.kpis?.ventasHoy || 0).toFixed(2)}
          </h3>
          <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-blue-600 w-[70%] transition-all duration-1000"></div>
          </div>
        </div>
        
        <div className="bg-[#161B22] p-8 rounded-[3rem] border border-white/5 shadow-2xl group hover:border-emerald-500/50 transition-all">
          <p className="text-[9px] font-black text-emerald-500 mb-2 tracking-widest uppercase">Órdenes Cerradas</p>
          <h3 className="text-4xl font-black text-white italic">
            {data.kpis?.pedidos || 0}
          </h3>
          <p className="text-[8px] text-slate-500 mt-2 font-bold uppercase">Eficiencia de despacho: 94%</p>
        </div>

        <div className="bg-[#161B22] p-8 rounded-[3rem] border border-white/5 shadow-2xl group hover:border-purple-500/50 transition-all">
          <p className="text-[9px] font-black text-purple-500 mb-2 tracking-widest uppercase">Ticket Promedio</p>
          <h3 className="text-4xl font-black text-white italic">
            S/ {Number(data.kpis?.ticketPromedio || 0).toFixed(2)}
          </h3>
          <p className="text-[8px] text-slate-500 mt-2 font-bold uppercase">+12% vs semana pasada</p>
        </div>
      </div>

      {/* GRÁFICAS PRINCIPALES */}
      <div className="grid grid-cols-2 gap-8">
        {/* GRÁFICA DE VENTAS (AREA) */}
        <div className="bg-[#161B22] p-8 rounded-[4rem] border border-white/5 min-h-[400px]">
          <p className="text-[10px] font-black mb-8 tracking-widest uppercase text-slate-400">Evolución de Ingresos (7 Días)</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.ventasSemana}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
              <XAxis dataKey="fecha" stroke="#475569" fontSize={10} tickFormatter={(str) => str.split('-')[2]} />
              <YAxis stroke="#475569" fontSize={10} />
              <Tooltip contentStyle={{backgroundColor: '#0D1117', border: 'none', borderRadius: '15px', fontSize: '10px'}} />
              <Area type="monotone" dataKey="total" stroke="#2563eb" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* TOP PRODUCTOS (BAR) */}
        <div className="bg-[#161B22] p-8 rounded-[4rem] border border-white/5 min-h-[400px]">
          <p className="text-[10px] font-black mb-8 tracking-widest uppercase text-slate-400">Platos con mayor demanda</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topProductos} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="nombre" type="category" stroke="#94a3b8" fontSize={9} width={90} />
              <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#0D1117', border: 'none', borderRadius: '15px', fontSize: '10px'}} />
              <Bar dataKey="cantidad" radius={[0, 10, 10, 0]} barSize={25}>
                {data.topProductos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLA DE RENDIMIENTO */}
      <div className="bg-[#161B22] p-10 rounded-[4rem] border border-white/5 shadow-2xl">
        <p className="text-[10px] font-black mb-8 tracking-widest uppercase text-blue-500">Productividad del Staff (Ranking)</p>
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] text-slate-500 border-b border-white/5">
              <th className="pb-4 uppercase">Mozo</th>
              <th className="pb-4 uppercase">Órdenes</th>
              <th className="pb-4 uppercase">Venta Total</th>
              <th className="pb-4 uppercase">Rendimiento (KPI)</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-white italic">
            {data.rendimientoMozos.map((mozo, idx) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                <td className="py-6">{mozo.nombre}</td>
                <td className="py-6">{mozo.mesas} mesas</td>
                <td className="py-6 text-emerald-500 font-black uppercase">S/ {parseFloat(mozo.total_vendido).toFixed(2)}</td>
                <td className="py-6">
                  <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-1000" 
                      style={{ width: `${Math.min((mozo.mesas / 15) * 100, 100)}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
