import React, { useState, useEffect } from 'react';
import wayraApi from '../../api/wayraApi'; // Subes dos niveles para llegar a src/api
import MapaWayra from '../../views/Recepcion/MapaWayra'; // Ajusta según donde esté tu mapa
import ModalReserva from '../../modals/ModalReserva/ModalReserva';

const Recepcion = () => {
  const [mesas, setMesas] = useState([]);
  const [reservasSemana, setReservasSemana] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);

  const fetchData = async () => {
    try {
      const [resMesas, resRes] = await Promise.all([
        wayraApi.get('/mesas'),
        wayraApi.get('/reservas/semanal')
      ]);
      setMesas(resMesas.data);
      setReservasSemana(resRes.data);
    } catch (error) {
      console.error("Error cargando datos de recepción:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGuardarReserva = async (datos) => {
    try {
      await wayraApi.post('/reservas', datos);
      setMesaSeleccionada(null);
      fetchData();
    } catch (error) {
      alert("Error al guardar la reserva. Intenta nuevamente.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden font-sans uppercase italic">
      {/* PANEL IZQUIERDO: EL MAPA */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-5xl flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
              WAYRA <span className="text-blue-600">PISO 1</span>
            </h1>
            <p className="text-slate-500 font-medium text-[10px] tracking-widest">Panel de Recepción - Lima</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border text-right">
            <p className="text-[10px] font-bold text-slate-400">Sistema Wayra</p>
            <p className="text-green-500 font-bold flex items-center justify-end gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> Online
            </p>
          </div>
        </div>

        <MapaWayra 
          mesas={mesas} 
          onMesaClick={(m) => m.estado === 'disponible' ? setMesaSeleccionada(m) : null} 
        />
      </div>

      {/* PANEL DERECHO: CRONOGRAMA */}
      <div className="w-full lg:w-96 bg-white border-l shadow-2xl flex flex-col">
        <div className="p-6 border-b bg-slate-50">
          <h2 className="font-black text-lg text-slate-800 flex items-center gap-2 italic">
            📅 Próximas Reservas
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
          {reservasSemana.length > 0 ? reservasSemana.map((res) => (
            <div key={res.id_reserva} className="group p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-full uppercase">
                  Mesa #{res.numero_mesa}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{res.fecha_reserva.split('T')[0]} | {res.hora_reserva.substring(0,5)}</span>
              </div>
              <p className="font-black text-slate-800 uppercase italic">{res.nombre_cliente} {res.apellido_cliente}</p>
              <p className="text-[9px] text-slate-500 mt-1">📞 {res.telefono_cliente}</p>
              {res.observacion && (
                <div className="mt-2 p-2 bg-amber-50 rounded-lg text-[9px] text-amber-700 italic border border-amber-100">
                  " {res.observacion} "
                </div>
              )}
            </div>
          )) : (
            <div className="text-center py-10 text-[10px] text-slate-300 font-black tracking-widest">Sin reservas próximas</div>
          )}
        </div>
      </div>

      {/* MODAL DE RESERVA */}
      {mesaSeleccionada && (
        <ModalReserva 
          mesa={mesaSeleccionada} 
          todasLasReservas={reservasSemana}
          fechaSeleccionada={new Date().toLocaleDateString('en-CA')}
          onClose={() => setMesaSeleccionada(null)} 
          onSave={handleGuardarReserva} 
        />
      )}
    </div>
  );
};

export default Recepcion;