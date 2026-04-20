import React, { useState } from 'react';
import wayraApi from '../../api/wayraApi'; 
import styles from './ModalReserva.module.css';

const ModalReserva = ({ mesa, onClose, onSave, todasLasReservas, fechaSeleccionada, reservaEdit }) => {
  const [form, setForm] = useState({
    id_reserva: reservaEdit?.id_reserva || null,
    id_mesa: reservaEdit?.id_mesa || mesa.id_mesa || mesa.numero_mesa,
    dni_cliente: reservaEdit?.dni_cliente || '',
    nombre_cliente: reservaEdit?.nombre_cliente || '',
    telefono_cliente: reservaEdit?.telefono_cliente || '',
    fecha_reserva: reservaEdit ? reservaEdit.fecha_reserva.split('T')[0] : fechaSeleccionada,
    hora_reserva: reservaEdit?.hora_reserva?.substring(0, 5) || '',
    observacion: reservaEdit?.observacion || '',
    id_mozo: reservaEdit?.id_mozo || null 
  });
  const turnos = [
    { id: 1, label: 'T1', hora: '12:00' }, { id: 2, label: 'T2', hora: '14:05' },
    { id: 3, label: 'T3', hora: '16:10' }, { id: 4, label: 'T4', hora: '18:15' },
    { id: 5, label: 'T5', hora: '20:20' }, { id: 6, label: 'T6', hora: '22:25' },
  ];
  const hoyStr = new Date().toLocaleDateString('en-CA');
  const ahora = new Date();
  const horaActualNum = ahora.getHours() * 100 + ahora.getMinutes();
  const turnosOcupados = todasLasReservas
    .filter(r => {
      const mismaMesa = parseInt(r.id_mesa) === parseInt(form.id_mesa);
      const mismaFecha = r.fecha_reserva.split('T')[0] === form.fecha_reserva;
      const noEsLaMismaQueEdito = r.id_reserva !== reservaEdit?.id_reserva;
      const noEstaCancelada = r.estado_reserva !== 'cancelada';
      return mismaMesa && mismaFecha && noEsLaMismaQueEdito && noEstaCancelada;
    })
    .map(r => r.hora_reserva.substring(0, 5));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hora_reserva) return alert("Selecciona un turno");
    if (!reservaEdit && form.fecha_reserva === hoyStr) {
      try {
        const resMozo = await wayraApi.get('/asignar-mozo');
        const dataMozo = resMozo.data; 
        if (dataMozo.success) {
          alert(`Mozo asignado: ${dataMozo.mozo.nombre}`);
          onSave({ ...form, id_mozo: dataMozo.mozo.id_usuario });
        } else {
          onSave(form);
        }
      } catch (err) { 
        console.error("Error asignando mozo:", err);
        onSave(form); 
      }
    } else {
      onSave(form);
    }
  };
  return (
    <div className={`${styles.overlay} uppercase italic font-black`}>
      <div className={`${styles.modalCard} animate-in zoom-in duration-300`}>
        <header className="text-center mb-8">
          <h2 className="text-3xl italic tracking-tighter text-slate-900 font-black uppercase">Wayra Ticket</h2>
          <div className={`inline-block px-4 py-1 rounded-full text-[8px] mt-2 tracking-widest text-white ${form.fecha_reserva === hoyStr ? 'bg-amber-500' : 'bg-blue-600'}`}>
            {form.fecha_reserva === hoyStr ? 'ATENCIÓN INMEDIATA ⚡' : 'RESERVA PROGRAMADA 📅'}
          </div>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="DNI" 
                className={`w-full bg-slate-50 p-4 rounded-2xl text-[11px] outline-none border-2 transition-all ${form.dni_cliente.length === 8 ? 'border-emerald-500' : 'border-transparent focus:border-blue-500'}`} 
                value={form.dni_cliente} 
                onChange={e => setForm({...form, dni_cliente: e.target.value.replace(/\D/g, "").slice(0,8)})} 
                required 
              />
              {form.dni_cliente.length === 8 && <span className="absolute right-3 top-4 text-emerald-500 text-[8px]">✅</span>}
            </div>          
            <input 
              type="text" 
              placeholder="CELULAR" 
              className="bg-slate-50 p-4 rounded-2xl text-[11px] outline-none border-2 border-transparent focus:border-blue-500"
              value={form.telefono_cliente} 
              onChange={e => setForm({...form, telefono_cliente: e.target.value.replace(/\D/g, "").slice(0,9)})} 
              required 
            />
          </div>
          <input 
            type="text" 
            placeholder="NOMBRE COMPLETO" 
            className="w-full bg-slate-50 p-4 rounded-2xl text-[11px] outline-none border-2 border-transparent focus:border-blue-500 uppercase"
            value={form.nombre_cliente} 
            onChange={e => setForm({...form, nombre_cliente: e.target.value.toUpperCase()})} 
            required 
          />
          <div className="py-2">
            <p className="text-[9px] text-slate-400 mb-3 tracking-widest text-center">
              HORARIOS MESA {mesa.id_mesa || mesa.numero_mesa}
            </p>
            <div className={styles.gridTurnos}>
              {turnos.map(t => {
                const horaTurnoNum = parseInt(t.hora.replace(':', ''));
                const ocupado = turnosOcupados.includes(t.hora);
                const yaPaso = form.fecha_reserva === hoyStr && horaTurnoNum < horaActualNum;
                const bloqueado = ocupado || yaPaso;
                return (
                  <button 
                    key={t.id} 
                    type="button" 
                    disabled={bloqueado}
                    onClick={() => setForm({...form, hora_reserva: t.hora})}
                    className={`
                      ${styles.turnoBtn} 
                      ${bloqueado ? styles.turnoBloqueado : 
                        form.hora_reserva === t.hora ? styles.turnoSeleccionado : styles.turnoDisponible}
                    `}
                  >
                    <span className={ocupado ? 'line-through' : ''}>{t.hora}</span>
                    {ocupado ? <span className="text-[6px] font-bold text-rose-500 uppercase">OCUPADO</span> : 
                     yaPaso ? <span className="text-[6px] font-bold text-rose-400 uppercase">PASADO</span> : 
                     <span className="text-[6px] opacity-50">DISPONIBLE</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea 
            placeholder="NOTAS (EJ: CUMPLEAÑOS, ALERGIAS...)" 
            className="w-full bg-slate-50 p-4 rounded-2xl text-[10px] h-20 outline-none uppercase resize-none border-2 border-transparent focus:border-blue-500"
            value={form.observacion} 
            onChange={e => setForm({...form, observacion: e.target.value})}
          />
          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl text-[11px] hover:bg-blue-600 transition-all shadow-xl font-black italic tracking-widest">
            {reservaEdit ? 'ACTUALIZAR TICKET' : 'CONFIRMAR Y FINALIZAR'}
          </button>     
          <button type="button" onClick={onClose} className="w-full text-slate-300 text-[9px] mt-2 uppercase font-bold">
            Cerrar sin guardar
          </button>
        </form>
      </div>
    </div>
  );
};
export default ModalReserva;
