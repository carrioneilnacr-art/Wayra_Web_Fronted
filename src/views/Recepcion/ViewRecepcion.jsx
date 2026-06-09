import React, { useState, useEffect } from 'react';
import { reservaService } from '../../services/reservaService';
import { GridMesas } from '../../components/Recepcion/GridMesas';
import { ReporteTurnos } from '../../components/Recepcion/ReporteTurnos';
import { PanelDerechoReservas } from '../../components/Recepcion/PanelDerecho';
import ModalReserva from '../../Modals/ModalReserva/ModalReserva';
import { ModalDetalleTicket } from '../../Modals/ModalRecepcion/ModalesRecepcion';
import { RecepcionLayout } from '../../layouts/RecepcionLayout';

export const ViewRecepcion = ({ onLogout, user }) => {
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
      const [dataM, dataR] = await Promise.all([
        reservaService.getMesas(),
        reservaService.getReservas(fechaSeleccionada)
      ]);
      setMesas(dataM);
      setReservas(dataR);
      if (mesasVisibles.length === 0) setMesasVisibles(dataM.map(m => m.id_mesa));
    } catch (e) { 
      console.error("Error en la orquestación de datos de recepción:", e); 
    }
  };

  useEffect(() => { 
    cargarDatos(); 
    const t = setInterval(cargarDatos, 5000); 
    return () => clearInterval(t); 
  }, [fechaSeleccionada]);

  const handleGuardar = async (form) => {
    if (!form) { cargarDatos(); setMostrarForm(false); setMesaSel(null); setReservaAEditar(null); return; }
    
    try {
      await reservaService.saveReserva(form, reservaAEditar?.id_reserva, user?.id_usuario);
      setMostrarForm(false); setMesaSel(null); setReservaAEditar(null);
      cargarDatos();
    } catch (e) {
      alert("Error de red al procesar la reserva.");
    }
  };

  const stats = {
    libres: mesas.filter(m => m.estado === 'disponible').length,
    ocupadas: mesas.filter(m => m.estado === 'ocupada').length,
    pendientes: reservas.filter(r => r.fecha_reserva.split('T')[0] === hoyStr && r.estado_reserva !== 'confirmada' && r.estado_reserva !== 'cancelada').length
  };

  const reservasFiltradas = reservas.filter(r => 
    r.dni_cliente?.includes(busqueda) || r.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) || r.id_mesa?.toString() === busqueda
  );

  const diasMes = new Date(fechaNav.año, fechaNav.mes + 1, 0).getDate();
  const offset = (new Date(fechaNav.año, fechaNav.mes, 1).getDay() + 6) % 7;

  const renderPanelDerecho = () => (
    <PanelDerechoReservas 
      reservas={reservasFiltradas} mesasTotales={mesas} mesasVisibles={mesasVisibles} setMesasVisibles={setMesasVisibles}
      onSearch={setBusqueda} onEdit={(r) => { setReservaAEditar(r); setMesaSel(r); setMostrarForm(true); }}
      fechaSeleccionada={fechaSeleccionada} hoyStr={hoyStr} onCheckIn={cargarDatos} onTicketClick={setTicketDetalle}
      user={user}
    />
  );

  return (
    <RecepcionLayout panelDerecho={renderPanelDerecho()}>
      
      {/* HEADER DE CONTROL */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 px-2 animate-in fade-in slide-in-from-top-4 duration-700">
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

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
            <button onClick={() => setPestaña('hoy')} className={`px-5 py-2 rounded-xl text-[9px] font-black transition-all ${pestaña === 'hoy' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>MAPA</button>
            <button onClick={() => setPestaña('calendario')} className={`px-5 py-2 rounded-xl text-[9px] font-black transition-all ${pestaña === 'calendario' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>CALENDARIO</button>
          </div>

          <button onClick={onLogout} className="group flex items-center gap-2 bg-white border border-slate-100 p-2 pr-4 rounded-2xl shadow-sm hover:bg-rose-50 transition-all duration-300">
            <div className="bg-rose-100 p-2 rounded-xl group-hover:bg-rose-500 transition-colors">
              <svg className="h-3 w-3 text-rose-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
            </div>
            <span className="text-[9px] font-black text-slate-400 group-hover:text-rose-600">SALIR</span>
          </button>
        </div>
      </div>

      {/* METRICAS DE TURNOS */}
      {pestaña === 'hoy' && <ReporteTurnos reservas={reservas} totalMesas={mesas.length} />}

      {/* CANVAS DINÁMICO PRINCIPAL */}
      <div className="flex-1 w-full bg-white rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border-8 border-white relative">
        {pestaña === 'hoy' ? (
          <GridMesas 
            mesas={fechaSeleccionada !== hoyStr ? mesas.map(m => ({...m, estado:'disponible'})) : mesas} 
            onMesaClick={setMesaSel} 
            mesaSeleccionada={mesaSel} 
          />
        ) : (
          <div className="p-6 md:p-10 grid grid-cols-7 gap-2 md:gap-3 h-full overflow-y-auto animate-in fade-in duration-500">
             <div className="col-span-7 flex justify-between items-center mb-6 md:mb-10 px-4 md:px-8">
                <button onClick={() => setFechaNav(p => ({...p, mes: p.mes-1}))} className="p-3 md:p-4 bg-slate-50 rounded-full hover:bg-slate-100">❮</button>
                <div className="text-center">
                  <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">{new Date(fechaNav.año, fechaNav.mes).toLocaleString('es', {month: 'long'})}</h2>
                  <p className="text-[10px] font-black text-blue-500 tracking-[0.5em]">{fechaNav.año}</p>
                </div>
                <button onClick={() => setFechaNav(p => ({...p, mes: p.mes+1}))} className="p-3 md:p-4 bg-slate-50 rounded-full hover:bg-slate-100">❯</button>
             </div>
            {[...Array(offset + diasMes)].map((_, i) => {
              const d = i - offset + 1;
              if (d <= 0) return <div key={i} />;
              
              const fStr = `${fechaNav.año}-${String(fechaNav.mes + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
              
              const horaActual = new Date().getHours();
              let fechaLimiteControl = hoyStr;
              
              if (horaActual >= 0 && horaActual < 5) {
                const ayer = new Date();
                ayer.setDate(ayer.getDate() - 1);
                fechaLimiteControl = ayer.toLocaleDateString('en-CA');
              }

              const esPasado = fStr < fechaLimiteControl;
              const tks = reservas.filter(r => r.fecha_reserva?.split('T')[0] === fStr && r.estado_reserva !== 'cancelada');
              
              return (
                <div 
                  key={i} 
                  onClick={() => { if (esPasado) return; setFechaSeleccionada(fStr); setPestaña('hoy'); }}
                  className={`h-20 md:h-24 border-2 rounded-[2rem] md:rounded-[2.5rem] p-3 md:p-4 flex flex-col justify-between transition-all ${
                    esPasado 
                      ? 'border-slate-100 bg-slate-100/50 text-slate-300 cursor-not-allowed pointer-events-none select-none' 
                      : fStr === hoyStr 
                        ? 'border-emerald-500 bg-emerald-50/30 shadow-md cursor-pointer hover:scale-105 text-slate-800' 
                        : fStr === fechaSeleccionada 
                          ? 'border-blue-600 bg-blue-50 cursor-pointer hover:scale-105 text-slate-800' 
                          : 'border-slate-100 bg-white cursor-pointer hover:scale-105 text-slate-800' 
                  }`}
                >
                  <span className={`font-black text-base md:text-xl ${esPasado ? 'text-slate-300' : 'text-slate-800'}`}>{d}</span>
                  {tks.length > 0 && !esPasado && (
                    <span className="bg-blue-600 text-white text-[7px] md:text-[8px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg text-center truncate">
                      {tks.length} TK
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FORMULARIOS EMERGENTES */}
      {mesaSel && !mostrarForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] shadow-2xl text-center w-full max-w-xs animate-in zoom-in duration-300">
            <h2 className="text-4xl md:text-6xl font-black mb-4 italic text-slate-800 tracking-tighter underline decoration-blue-500 decoration-8">#{mesaSel.numero_mesa}</h2>
            <button onClick={() => setMostrarForm(true)} className="w-full bg-slate-900 text-white py-4 md:py-6 rounded-3xl font-black text-xs shadow-2xl hover:bg-blue-600 transition-all italic tracking-widest">Confirmar Mesa</button>
            <button onClick={() => setMesaSel(null)} className="mt-4 md:mt-6 text-slate-300 font-bold text-[9px] uppercase hover:text-rose-500 transition-all">Cancelar</button>
          </div>
        </div>
      )}

      {mostrarForm && <ModalReserva mesa={mesaSel} reservaEdit={reservaAEditar} fechaSeleccionada={fechaSeleccionada} onClose={() => {setMostrarForm(false); setMesaSel(null); setReservaAEditar(null);}} onSave={handleGuardar} todasLasReservas={reservas} />}
      {ticketDetalle && <ModalDetalleTicket ticket={ticketDetalle} onClose={() => setTicketDetalle(null)} />}
    </RecepcionLayout>
  );
};