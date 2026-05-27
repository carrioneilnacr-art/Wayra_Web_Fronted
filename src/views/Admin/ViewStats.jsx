import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
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
    <div className="flex h-full items-center justify-center bg-[#F8F9FA]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#1F497D]"></div>
    </div>
  );

  // Paleta de degradado sutil para las barras de platos más vendidos (Terracota a Índigo)
  const BAR_COLORS = ['#D35400', '#C0392B', '#A04000', '#2C3E50', '#1F497D'];

  return (
    <div className="animate-in fade-in duration-700 space-y-8 p-6 bg-[#F8F9FA] min-h-screen text-[#2C3E50]">
      
      {/* HEADER MINIMALISTA */}
      <header className="border-b border-slate-200 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-[#1F497D] tracking-tight uppercase">Dashboard</h2>

        </div>
        <div className="text-right">
          <span className="text-[10px] bg-[#1F497D] text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider">Nivel: Admin</span>
        </div>
      </header>

      {/* CARDS KPI - DISEÑO MODULAR BLANCO LIMPIO */}
      <div className="grid grid-cols-3 gap-6">
        {/* ÓRDENES HISTÓRICAS TOTALES */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[11px] font-black text-[#7F8C8D] tracking-wider uppercase">Órdenes Totales</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Histórico</span>
          </div>
          <h3 className="text-4xl font-black text-[#1F497D]">{data.kpis?.totalPedidosHistoricos || 0}</h3>
          <p className="text-[9px] text-[#7F8C8D] mt-2 font-medium">Volumen total de comandas en el sistema</p>
        </div>
        
        {/* TICKET PROMEDIO */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[11px] font-black text-[#7F8C8D] tracking-wider uppercase">Avg Ticket</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">↑ 5% vs ayer</span>
          </div>
          <h3 className="text-4xl font-black text-[#D35400]">S/ {Number(data.kpis?.ticketPromedio || 0).toFixed(2)}</h3>
          <p className="text-[9px] text-[#7F8C8D] mt-2 font-medium">Consumo medio por mesa física</p>
        </div>

        {/* EFICIENCIA */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[11px] font-black text-[#7F8C8D] tracking-wider uppercase">Eficiencia</p>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">↓ 3% vs ayer</span>
          </div>
          <h3 className="text-4xl font-black text-[#2C3E50]">87%</h3>
          <p className="text-[9px] text-[#7F8C8D] mt-2 font-medium">Tiempo óptimo de despacho a cocina</p>
        </div>
      </div>

      {/* GRÁFICAS PRINCIPALES */}
      <div className="grid grid-cols-5 gap-6">
        
        {/* EVOLUCIÓN DE INGRESOS (AREA CHART) */}
        <div className="col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-black mb-6 tracking-widest uppercase text-[#7F8C8D]">Ingresos últimos 7 días</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.ventasSemana}>
              <defs>
                <linearGradient id="colorTerracota" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D35400" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#D35400" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="fecha" stroke="#7F8C8D" fontSize={10} tickFormatter={(str) => str.split('-')[2]} />
              <YAxis stroke="#7F8C8D" fontSize={10} />
              <Tooltip contentStyle={{backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px', color: '#2C3E50'}} />
              <Area type="monotone" dataKey="total" stroke="#D35400" fillOpacity={1} fill="url(#colorTerracota)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* TOP DISHES (BAR CHART LAYOUT VERTICAL) */}
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-black mb-6 tracking-widest uppercase text-[#7F8C8D]">Top Dishes</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topProductos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="nombre" type="category" stroke="#2C3E50" fontSize={10} width={95} />
              <Tooltip cursor={{fill: '#F8F9FA'}} contentStyle={{backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px'}} />
              <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} barSize={16}>
                {data.topProductos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FOOTER: RANKING Y BLOQUE DE INSIGHTS / ALERTAS REACTIVOS */}
      <div className="grid grid-cols-5 gap-6 items-start">
        
        {/* COMPONENTE DE SEGUIMIENTO TRANSACCIONAL REACTIVO */}
        <div className="col-span-2 space-y-4">
          
          {/* INSIGHT COMPLIANCE (VERDE DE CONFIRMACIÓN) */}
          {data.notificaciones?.insight && (
            <div className="bg-[#E8F8F5] border border-[#A3E4D7] p-5 rounded-2xl flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mt-0.5 text-[#117A65]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-[#117A65] uppercase tracking-wider mb-1">Insight Clave</h4>
                <p className="text-xs text-[#16A085] font-semibold leading-relaxed">
                  {data.notificaciones.insight}
                </p>
              </div>
            </div>
          )}

          {/* CRITICAL ALERT (ROJO) */}
          {data.notificaciones?.alerta && (
            <div className="bg-[#FADBD8] border border-[#F5B7B1] p-5 rounded-2xl flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mt-0.5 text-[#78281F]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-[#78281F] uppercase tracking-wider mb-1">Alerta del Sistema</h4>
                <p className="text-xs text-[#943126] font-semibold leading-relaxed">
                  {data.notificaciones.alerta}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* TABLA DE RENDIMIENTO DEL STAFF (3 COLUMNAS COMPACTAS) */}
        <div className="col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-black mb-4 tracking-widest uppercase text-[#1F497D]">Desempeño del personal</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-[#7F8C8D] border-b border-slate-100">
                  <th className="pb-3 uppercase tracking-wider">Mozo</th>
                  <th className="pb-3 uppercase tracking-wider text-right">Monto</th>
                  <th className="pb-3 uppercase tracking-wider text-right">Rendimiento</th>
                </tr>
              </thead>
              <tbody className="text-xs text-[#2C3E50]">
                {data.rendimientoMozos.map((mozo, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-[#F8F9FA] transition-all">
                    <td className="py-3.5 font-bold">{mozo.nombre}</td>
                    <td className="py-3.5 text-right font-black text-emerald-600">S/ {parseFloat(mozo.total_vendido).toFixed(2)}</td>
                    <td className="py-3.5 pl-6">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-[10px] text-[#7F8C8D] font-bold">{mozo.mesas} ord.</span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1F497D] rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min((mozo.mesas / 12) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
