import React, { useState, useEffect } from 'react';
// 1. Apunta a la nueva carpeta de views
import MapaWayra from "../views/Recepcion/MapaWayra"; 

// 2. Apunta a la nueva carpeta raíz de modals (con M mayúscula)
import ModalReserva from "../Modals/ModalReserva/ModalReserva";

// 3. PanelDerecho se quedó en components/Recepcion según tu imagen
import { PanelDerechoReservas } from "../components/Recepcion/PanelDerecho"; 

// 4. EL ERROR PRINCIPAL: ModalesRecepcion ahora está en su propia carpeta dentro de /modals
import { ModalDetalleTicket } from "../Modals/ModalRecepcion/ModalesRecepcion";

// COMPONENTE DE REPORTE DE OCUPACIÓN
const ReporteOcupacion = ({ reservas, totalMesas }) => {
  const turnos = ['12:00', '14:05', '16:10', '18:15', '20:20', '22:25'];
  
  return (
    <div className="grid grid-cols-6 gap-2 mb-6 w-full max-w-5xl animate-in fade-in slide-in-from-left duration-700">
      {turnos.map((t, i) => {
        const ocupadas = reservas.filter(r => r.hora_reserva.startsWith(t) && r.estado_reserva !== 'cancelada').length;
        const porcentaje = (ocupadas / totalMesas) * 100;
        
        return (
          <div key={t} className="bg-white p-3 rounded-[1.8rem] shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-[7px] font-black text-slate-400">TURNO {i+1}</span>
            <span className="text-[9px] font-black my-0.5">{t}</span>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full transition-all duration-1000 ${porcentaje > 80 ? 'bg-rose-500' : 'bg-blue-600'}`}
                style={{ width: `${porcentaje}%` }}
              ></div>
            </div>
            <span className="text-[8px] font-black mt-1 text-slate-500">{ocupadas}/{totalMesas}</span>
          </div>
        );
      })}
    </div>
  );
};

const DashboardRecepcion = ({ onLogout }) => { 
  const [mesas, setMesas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [pestaña, setPestaña] = useState('hoy');
  const [mesaSel, setMesaSel] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [reservaAEditar, setReservaAEditar] = useState(null);
  const [ticketDetalle, setTicketDetalle] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mesasVisibles, setMesasVisibles] = useState([]);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toLocaleDateString('en-CA'));
  const [fechaNav, setFechaNav] = useState({ mes: new Date().getMonth(), año: new Date().getFullYear() });
  const hoyStr = new Date().toLocaleDateString('en-CA');

  const cargarDatos = async () => {
    try {
      const [resM, resR] = await Promise.all([
        fetch('https://wayra-web-backend.onrender.com/api/mesas'),
        fetch(`https://wayra-web-backend.onrender.com/api/reservas?fecha=${fechaSeleccionada}`)
      ]);
      const dataM = await resM.json();
      setMesas(dataM);
      setReservas(await resR.json());
      if (mesasVisibles.length === 0) setMesasVisibles(dataM.map(m => m.id_mesa));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { 
    cargarDatos(); 
    const t = setInterval(cargarDatos, 5000); 
    return () => clearInterval(t); 
  }, [fechaSeleccionada]);

  const handleGuardar = async (form) => {
    if (!form) { cargarDatos(); setMostrarForm(false); setMesaSel(null); setReservaAEditar(null); return; }
    const url = reservaAEditar ? `https://wayra-web-backend.onrender.com/api/reservas/${reservaAEditar.id_reserva}` : 'https://wayra-web-backend.onrender.com/api/reservas';
    const method = reservaAEditar ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(form)
    });
    setMostrarForm(false); setMesaSel(null); setReservaAEditar(null);
    cargarDatos();
  };

  const stats = {
    libres: mesas.filter(m => m.estado === 'disponible').length,
    ocupadas: mesas.filter(m => m.estado === 'ocupada').length,
    pendientes: reservas.filter(r => r.fecha_reserva.split('T')[0] === hoyStr && r.estado_reserva !== 'confirmada' && r.estado_reserva !== 'cancelada').length
  };

  const reservasFiltradas = reservas
    .filter(r => r.dni_cliente?.includes(busqueda) || r.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) || r.id_mesa?.toString() === busqueda);

  const diasMes = new Date(fechaNav.año, fechaNav.mes + 1, 0).getDate();
  const offset = (new Date(fechaNav.año, fechaNav.mes, 1).getDay() + 6) % 7;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900 uppercase italic">
      <main className="flex-1 p-6 flex flex-col items-center relative overflow-hidden">
        
        {/* HEADER */}
        <div className="w-full max-w-5xl flex justify-between items-center mb-8 px-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex gap-6 items-center">
            <h1 className="text-2xl font-black italic tracking-tighter">Wayra <span className="text-blue-600">Reception</span></h1>
            <div className="flex gap-4 border-l pl-6 border-slate-200">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400">{stats.libres} LIBRES</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                 <span className="text-[10px] font-black text-slate-400">{stats.ocupadas} OCUPADAS</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 <span className="text-[10px] font-black text-slate-400">{stats.pendientes} TICKETS</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
              <button onClick={() => setPestaña('hoy')} className={`px-5 py-2 rounded-xl text-[9px] font-black transition-all ${pestaña === 'hoy' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>MAPA</button>
              <button onClick={() => setPestaña('calendario')} className={`px-5 py-2 rounded-xl text-[9px] font-black transition-all ${pestaña === 'calendario' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>CALENDARIO</button>
            </div>

            <button onClick={onLogout} className="group flex items-center gap-2 bg-white border border-slate-100 p-2 pr-4 rounded-2xl shadow-sm hover:bg-rose-50 transition-all duration-300">
              <div className="bg-rose-100 p-2 rounded-xl group-hover:bg-rose-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-rose-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
              </div>
              <span className="text-[9px] font-black text-slate-400 group-hover:text-rose-600">SALIR</span>
            </button>
          </div>
        </div>

        {/* REPORTE DE OCUPACIÓN */}
        {pestaña === 'hoy' && <ReporteOcupacion reservas={reservas} totalMesas={mesas.length} />}

        {/* ÁREA PRINCIPAL */}
        <div className="flex-1 w-full bg-white rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border-8 border-white relative">
          {pestaña === 'hoy' ? (
            <MapaWayra mesas={fechaSeleccionada !== hoyStr ? mesas.map(m => ({...m, estado:'disponible'})) : mesas} onMesaClick={setMesaSel} mesaSeleccionada={mesaSel} />
          ) : (
            <div className="p-10 grid grid-cols-7 gap-3 h-full overflow-y-auto animate-in fade-in duration-500">
               <div className="col-span-7 flex justify-between items-center mb-10 px-8">
                  <button onClick={() => setFechaNav(p => ({...p, mes: p.mes-1}))} className="p-4 bg-slate-50 rounded-full hover:bg-slate-100">❮</button>
                  <div className="text-center">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">{new Date(fechaNav.año, fechaNav.mes).toLocaleString('es', {month: 'long'})}</h2>
                    <p className="text-[10px] font-black text-blue-500 tracking-[0.5em]">{fechaNav.año}</p>
                  </div>
                  <button onClick={() => setFechaNav(p => ({...p, mes: p.mes+1}))} className="p-4 bg-slate-50 rounded-full hover:bg-slate-100">❯</button>
               </div>
               {[...Array(offset + diasMes)].map((_, i) => {
                  const d = i - offset + 1;
                  if (d <= 0) return <div key={i} />;
                  const fStr = `${fechaNav.año}-${String(fechaNav.mes + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                  const tks = reservas.filter(r => r.fecha_reserva?.split('T')[0] === fStr && r.estado_reserva !== 'cancelada');
                  return (
                    <div key={i} onClick={() => { setFechaSeleccionada(fStr); setPestaña('hoy'); }}
                      className={`h-24 border-2 rounded-[2.5rem] p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-105 ${fStr === hoyStr ? 'border-emerald-500 bg-emerald-50/30 shadow-md' : fStr === fechaSeleccionada ? 'border-blue-600 bg-blue-50' : 'border-slate-50 opacity-40'}`}
                    >
                      <span className="font-black text-xl">{d}</span>
                      {tks.length > 0 && <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-lg text-center">{tks.length} TK</span>}
                    </div>
                  );
               })}
            </div>
          )}
        </div>
      </main>

      <PanelDerechoReservas 
        reservas={reservasFiltradas} mesasTotales={mesas} mesasVisibles={mesasVisibles} setMesasVisibles={setMesasVisibles}
        onSearch={setBusqueda} onEdit={(r) => { setReservaAEditar(r); setMesaSel(r); setMostrarForm(true); }}
        fechaSeleccionada={fechaSeleccionada} hoyStr={hoyStr} onCheckIn={cargarDatos} onTicketClick={setTicketDetalle}
      />

      {mesaSel && !mostrarForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[500]">
          <div className="bg-white p-12 rounded-[4rem] shadow-2xl text-center w-80 animate-in zoom-in duration-300">
            <h2 className="text-6xl font-black mb-2 italic text-slate-800 tracking-tighter underline decoration-blue-500 decoration-8">#{mesaSel.numero_mesa}</h2>
            <button onClick={() => setMostrarForm(true)} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xs shadow-2xl hover:bg-blue-600 transition-all italic tracking-widest">Confirmar Mesa</button>
            <button onClick={() => setMesaSel(null)} className="mt-6 text-slate-300 font-bold text-[9px] uppercase hover:text-rose-500 transition-all">Cancelar</button>
          </div>
        </div>
      )}

      {mostrarForm && <ModalReserva mesa={mesaSel} reservaEdit={reservaAEditar} fechaSeleccionada={fechaSeleccionada} onClose={() => {setMostrarForm(false); setMesaSel(null); setReservaAEditar(null);}} onSave={handleGuardar} todasLasReservas={reservas} />}
      {ticketDetalle && <ModalDetalleTicket ticket={ticketDetalle} onClose={() => setTicketDetalle(null)} />}
    </div>
  );
};

export default DashboardRecepcion;
