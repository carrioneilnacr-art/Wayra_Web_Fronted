import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import wayraApi from '../../api/wayraApi'; 

export const ViewStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

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

  // Colores Base
  const BAR_COLORS = ['#D35400', '#C0392B', '#A04000', '#2C3E50', '#1F497D'];

  const topProductosConColores = data.topProductos?.map((p, index) => ({
    ...p,
    fill: BAR_COLORS[index % BAR_COLORS.length]
  })) || [];

  // ----------------------------------------------------
  // BI MOCKS ADVANCED (Data simulada derivada del total)
  // ----------------------------------------------------
  const totalOrders = data.kpis?.totalPedidosHistoricos || 100;
  
  // Reservas vs Walkins
  const dataCanal = [
    { name: 'Reservas (Digital)', value: Math.floor(totalOrders * 0.65) },
    { name: 'Walk-ins (Directo)', value: Math.floor(totalOrders * 0.35) },
  ];
  const COLORS_CANAL = ['#1F497D', '#D35400'];

  // Métodos de Pago
  const dataPagos = [
    { name: 'Yape / Plin', value: 45 },
    { name: 'Tarjeta (Niubiz)', value: 40 },
    { name: 'Efectivo', value: 15 },
  ];
  const COLORS_PAGOS = ['#742384', '#00a1e1', '#117A65'];

  // Categorías de Platos
  const dataCategorias = [
    { name: 'Fondos', value: 48 },
    { name: 'Entradas', value: 25 },
    { name: 'Bebidas/Bar', value: 27 },
  ];
  const COLORS_CAT = ['#A04000', '#2C3E50', '#7F8C8D'];

  // Horarios de mayor tráfico (Busiest hours)
  const dataHorarios = [
    { hora: '12:00', ocupacion: 20 },
    { hora: '13:30', ocupacion: 95 },
    { hora: '15:00', ocupacion: 40 },
    { hora: '19:00', ocupacion: 75 },
    { hora: '20:30', ocupacion: 98 },
    { hora: '22:00', ocupacion: 30 },
  ];

  return (
    <div className="animate-in fade-in duration-700 space-y-6 p-6 bg-[#F8F9FA] min-h-screen text-[#2C3E50]">
      
      {/* HEADER MINIMALISTA Y TABS */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-black text-[#1F497D] tracking-tight uppercase">Wayra Business Intelligence</h2>
          <p className="text-[10px] text-[#7F8C8D] font-bold mt-1 tracking-widest uppercase">Análisis avanzado de restaurante</p>
        </div>
        
        {/* NAVEGACIÓN TABS */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200/60">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-[#1F497D] text-white shadow-md' : 'text-slate-400 hover:text-slate-700'}`}
          >
            General
          </button>
          <button 
            onClick={() => setActiveTab('operaciones')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'operaciones' ? 'bg-[#1F497D] text-white shadow-md' : 'text-slate-400 hover:text-slate-700'}`}
          >
            Operaciones
          </button>
          <button 
            onClick={() => setActiveTab('finanzas')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'finanzas' ? 'bg-[#1F497D] text-white shadow-md' : 'text-slate-400 hover:text-slate-700'}`}
          >
            Finanzas
          </button>
        </div>
      </header>

      {/* CARDS KPI GLOBALES (Siempre Visibles) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-[#7F8C8D] tracking-wider uppercase mb-1">Órdenes Totales</p>
          <h3 className="text-3xl font-black text-[#1F497D]">{data.kpis?.totalPedidosHistoricos || 0}</h3>
          <p className="text-[8px] text-emerald-600 mt-2 font-bold bg-emerald-50 w-max px-2 py-0.5 rounded-full">↑ 12% VOLUMEN</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-[#7F8C8D] tracking-wider uppercase mb-1">Avg Ticket</p>
          <h3 className="text-3xl font-black text-[#D35400]">S/ {Number(data.kpis?.ticketPromedio || 0).toFixed(2)}</h3>
          <p className="text-[8px] text-emerald-600 mt-2 font-bold bg-emerald-50 w-max px-2 py-0.5 rounded-full">↑ 5% VS AYER</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-[#7F8C8D] tracking-wider uppercase mb-1">Eficiencia Cocina</p>
          <h3 className="text-3xl font-black text-[#2C3E50]">96%</h3>
          <p className="text-[8px] text-emerald-600 mt-2 font-bold bg-emerald-50 w-max px-2 py-0.5 rounded-full">↑ 18% VS MANUAL</p>
        </div>
        <div className="bg-[#1F497D] p-5 rounded-2xl border border-[#15345A] shadow-md flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <p className="text-[10px] font-black text-[#A9C3E5] tracking-wider uppercase mb-1 z-10">Rotación de Mesas</p>
          <h3 className="text-3xl font-black text-white z-10">42 min</h3>
          <p className="text-[8px] text-[#A9C3E5] mt-2 font-bold uppercase z-10">Tiempo Promedio</p>
        </div>
      </div>

      {/* CONTENIDO POR TABS */}
      <div className="mt-8">
        
        {/* ======================= TAB 1: GENERAL ======================= */}
        {activeTab === 'general' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-5 gap-6">
            <div className="col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-black mb-6 tracking-widest uppercase text-[#7F8C8D]">Evolución de Ingresos (7 días)</p>
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

            <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-black mb-6 tracking-widest uppercase text-[#7F8C8D]">Top Dishes (Volumen)</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProductosConColores} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="nombre" type="category" stroke="#2C3E50" fontSize={10} width={95} />
                  <Tooltip cursor={{fill: '#F8F9FA'}} contentStyle={{backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px'}} />
                  <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: OPERACIONES ======================= */}
        {activeTab === 'operaciones' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              
              {/* HORARIOS PICOS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[11px] font-black mb-6 tracking-widest uppercase text-[#1F497D]">Mapa de Tráfico (Horas Pico)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={dataHorarios}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="hora" stroke="#7F8C8D" fontSize={10} />
                    <YAxis stroke="#7F8C8D" fontSize={10} />
                    <Tooltip contentStyle={{backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px'}} />
                    <Line type="monotone" dataKey="ocupacion" stroke="#1F497D" strokeWidth={4} dot={{ r: 4, fill: '#D35400', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* RETENCIÓN DE RESERVAS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                <p className="text-[11px] font-black mb-4 tracking-widest uppercase text-[#1F497D]">Efectividad de Reservas</p>
                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-8 border-emerald-500 flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl font-black text-slate-800">92%</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Atendidas</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-8 border-red-400 flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl font-black text-slate-800">8%</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No-Shows</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLA DE DESEMPEÑO DEL PERSONAL */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[11px] font-black tracking-widest uppercase text-[#1F497D]">Rendimiento del Personal de Salón</p>
                <span className="text-[9px] text-[#7F8C8D] uppercase font-bold bg-slate-100 px-3 py-1 rounded-lg">Evaluación Automática</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-[#7F8C8D] border-b border-slate-100">
                      <th className="pb-3 uppercase tracking-wider">Mozo</th>
                      <th className="pb-3 uppercase tracking-wider text-right">Monto Generado</th>
                      <th className="pb-3 uppercase tracking-wider text-right">Ticket Promedio</th>
                      <th className="pb-3 uppercase tracking-wider text-right">Velocidad / Rendimiento</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-[#2C3E50]">
                    {data.rendimientoMozos.map((mozo, idx) => (
                      <tr key={`staff-${mozo.nombre}-${idx}`} className="border-b border-slate-50 hover:bg-[#F8F9FA] transition-all">
                        <td className="py-4 font-bold flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-500 font-black">
                            {mozo.nombre.substring(0, 2).toUpperCase()}
                          </div>
                          {mozo.nombre}
                        </td>
                        <td className="py-4 text-right font-black text-emerald-600">S/ {Number.parseFloat(mozo.total_vendido).toFixed(2)}</td>
                        <td className="py-4 text-right font-bold text-slate-600">
                          S/ {(mozo.mesas > 0 ? (mozo.total_vendido / mozo.mesas) : 0).toFixed(2)}
                        </td>
                        <td className="py-4 pl-6">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-[10px] text-[#7F8C8D] font-bold">{mozo.mesas} ord.</span>
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#1F497D] rounded-full transition-all duration-1000" 
                                style={{ width: `${Math.min((mozo.mesas / 15) * 100, 100)}%` }}
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
        )}

        {/* ======================= TAB 3: FINANZAS ======================= */}
        {activeTab === 'finanzas' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-3 gap-6">
            
            {/* CANAL DE INGRESO */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <p className="text-[11px] font-black mb-2 tracking-widest uppercase text-[#1F497D] w-full text-left">Canal de Ingreso</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={dataCanal} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {dataCanal.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_CANAL[index % COLORS_CANAL.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 w-full justify-center mt-2">
                {dataCanal.map((c, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS_CANAL[i]}}></span>
                    <span className="text-[9px] font-bold uppercase text-slate-600">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MÉTODOS DE PAGO */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <p className="text-[11px] font-black mb-2 tracking-widest uppercase text-[#1F497D] w-full text-left">Métodos de Pago</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={dataPagos} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {dataPagos.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_PAGOS[index % COLORS_PAGOS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 w-full justify-center mt-2 flex-wrap">
                {dataPagos.map((c, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS_PAGOS[i]}}></span>
                    <span className="text-[9px] font-bold uppercase text-slate-600">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CATEGORÍAS VENDIDAS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <p className="text-[11px] font-black mb-2 tracking-widest uppercase text-[#1F497D] w-full text-left">Desglose de Carta</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={dataCategorias} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {dataCategorias.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_CAT[index % COLORS_CAT.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 w-full justify-center mt-2">
                {dataCategorias.map((c, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS_CAT[i]}}></span>
                    <span className="text-[9px] font-bold uppercase text-slate-600">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
