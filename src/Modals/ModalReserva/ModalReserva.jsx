import React, { useState } from 'react';
import PropTypes from 'prop-types'; // ✅ Paso 1: Importar prop-types
import { reservaService } from '../../services/reservaService';

const ModalReserva = ({ mesa, onClose, onSave, todasLasReservas = [], fechaSeleccionada, reservaEdit }) => {
  const [form, setForm] = useState({
    id_reserva: reservaEdit?.id_reserva || null,
    id_mesa: reservaEdit?.id_mesa || mesa?.id_mesa || mesa?.numero_mesa || '',
    dni_cliente: reservaEdit?.dni_cliente || '',
    nombre_cliente: reservaEdit?.nombre_cliente || '',
    telefono_cliente: reservaEdit?.telefono_cliente || '',
    fecha_reserva: reservaEdit ? reservaEdit.fecha_reserva.split('T')[0] : fechaSeleccionada,
    hora_reserva: reservaEdit?.hora_reserva?.substring(0, 5) || '',
    observacion: reservaEdit?.observacion || '',
    id_mozo: reservaEdit?.id_mozo || null
  });

  const turnos = [
    { id: 1, label: 'T1', hora: '03:47' }, { id: 2, label: 'T2', hora: '03:48' },
    { id: 3, label: 'T3', hora: '16:10' }, { id: 4, label: 'T4', hora: '18:15' },
    { id: 5, label: 'T5', hora: '21:21' }, { id: 6, label: 'T6', hora: '22:25' },
  ];

  const hoyStr = new Date().toLocaleDateString('en-CA');
  const ahora = new Date();
  const horaActualNum = ahora.getHours() * 100 + ahora.getMinutes();

  const turnosOcupados = new Set(
    todasLasReservas
      .filter(r => {
        const mismaMesa = Number.parseInt(r.id_mesa) === Number.parseInt(form.id_mesa);
        const mismaFecha = r.fecha_reserva.split('T')[0] === form.fecha_reserva;
        const noEsLaMismaQueEdito = r.id_reserva !== reservaEdit?.id_reserva;
        const noEstaCancelada = r.estado_reserva !== 'cancelada';
        return mismaMesa && mismaFecha && noEsLaMismaQueEdito && noEstaCancelada;
      })
      .map(r => r.hora_reserva.substring(0, 5))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hora_reserva) return alert("Selecciona un turno");

    if (!reservaEdit && form.fecha_reserva === hoyStr) {
      try {
        const dataMozo = await reservaService.getAsignarMozo();
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[2000] flex items-center justify-center p-4 uppercase italic font-black animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 md:p-10 border border-slate-100 animate-in zoom-in duration-300">

        <header className="text-center mb-6">
          <h2 className="text-2xl italic tracking-tighter text-slate-900 font-black uppercase">Wayra Ticket</h2>
          <div className={`inline-block px-4 py-1 rounded-full text-[8px] mt-2 tracking-widest font-sans font-black text-white not-italic
            ${form.fecha_reserva === hoyStr ? 'bg-amber-500 shadow-sm shadow-amber-500/20' : 'bg-blue-600 shadow-sm shadow-blue-600/20'}`}>
            {form.fecha_reserva === hoyStr ? 'ATENCIÓN INMEDIATA ⚡' : 'RESERVA PROGRAMADA 📅'}
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="DNI"
                className={`w-full bg-slate-50 p-4 rounded-2xl text-[11px] outline-none border-2 transition-all font-black uppercase
                  ${form.dni_cliente.length === 8 ? 'border-emerald-500 bg-white' : 'border-transparent focus:border-blue-500 focus:bg-white'}`}
                value={form.dni_cliente}
                onChange={e => setForm({ ...form, dni_cliente: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                required
              />
              {form.dni_cliente.length === 8 && <span className="absolute right-4 top-4 text-emerald-500 text-xs not-italic">✅</span>}
            </div>
            <input
              type="text"
              placeholder="CELULAR"
              className="bg-slate-50 p-4 rounded-2xl text-[11px] outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-black uppercase"
              value={form.telefono_cliente}
              onChange={e => setForm({ ...form, telefono_cliente: e.target.value.replace(/\D/g, "").slice(0, 9) })}
              required
            />
          </div>

          <input
            type="text"
            placeholder="NOMBRE COMPLETO"
            className="w-full bg-slate-50 p-4 rounded-2xl text-[11px] outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all uppercase font-black"
            value={form.nombre_cliente}
            onChange={e => setForm({ ...form, nombre_cliente: e.target.value.toUpperCase() })}
            required
          />

          <div className="py-1">
            <p className="text-[9px] text-slate-400 mb-3 tracking-widest text-center uppercase font-black not-italic">
              HORARIOS MESA #{mesa?.id_mesa || mesa?.numero_mesa}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {turnos.map(t => {
                const horaTurnoNum = Number.parseInt(t.hora.replace(':', ''));
                const ocupado = turnosOcupados.has(t.hora);
                const yaPaso = form.fecha_reserva === hoyStr && horaTurnoNum < horaActualNum;
                const bloqueado = ocupado || yaPaso;
                const seleccionado = form.hora_reserva === t.hora;

                let buttonBgBorderClass = 'bg-white border-slate-100 text-slate-500 hover:border-blue-300';
                if (bloqueado) {
                  buttonBgBorderClass = 'bg-slate-100 border-slate-100 text-slate-300 opacity-50 cursor-not-allowed';
                } else if (seleccionado) {
                  buttonBgBorderClass = 'bg-blue-600 border-blue-600 text-white scale-105 shadow-md shadow-blue-600/20';
                }

                let statusBadge = null;
                if (ocupado) {
                  statusBadge = <span className="text-[6px] font-black text-rose-500 not-italic font-sans">OCUPADO</span>;
                } else if (yaPaso) {
                  statusBadge = <span className="text-[6px] font-black text-slate-400 not-italic font-sans">PASADO</span>;
                } else {
                  const statusColor = seleccionado ? 'text-blue-200' : 'text-emerald-500';
                  statusBadge = <span className={`text-[6px] font-black not-italic font-sans ${statusColor}`}>DISPONIBLE</span>;
                }

                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={bloqueado}
                    onClick={() => setForm({ ...form, hora_reserva: t.hora })}
                    className={`p-3 rounded-2xl text-[10px] border flex flex-col items-center justify-center transition-all duration-300 gap-0.5 uppercase font-black shrink-0 ${buttonBgBorderClass}`}
                  >
                    <span className={ocupado ? 'line-through font-mono' : 'font-mono'}>{t.hora}</span>
                    {statusBadge}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            placeholder="NOTAS (EJ: CUMPLEAÑOS, ALERGIAS...)"
            className="w-full bg-slate-50 p-4 rounded-2xl text-[10px] h-16 outline-none uppercase resize-none border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-bold tracking-wide"
            value={form.observacion}
            onChange={e => setForm({ ...form, observacion: e.target.value })}
          />

          <button type="submit" className="w-full bg-[#0a0913] text-white py-4 rounded-xl text-[10px] hover:bg-blue-600 transition-all shadow-md font-black italic tracking-widest uppercase not-italic mt-2">
            {reservaEdit ? 'ACTUALIZAR TICKET' : 'CONFIRMAR Y FINALIZAR 🚀'}
          </button>

          <button type="button" onClick={onClose} className="w-full text-slate-400 hover:text-rose-600 transition-colors text-[9px] uppercase font-black tracking-wider not-italic mt-2">
            Cerrar sin guardar
          </button>
        </form>
      </div>
    </div>
  );
};

// ✅ Paso 2: Definición estricta de propTypes para el ecosistema del Modal
ModalReserva.propTypes = {
  mesa: PropTypes.shape({
    id_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    numero_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  fechaSeleccionada: PropTypes.string.isRequired,
  todasLasReservas: PropTypes.arrayOf(
    PropTypes.shape({
      id_reserva: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      id_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      fecha_reserva: PropTypes.string.isRequired,
      hora_reserva: PropTypes.string.isRequired,
      estado_reserva: PropTypes.string,
    })
  ),
  reservaEdit: PropTypes.shape({
    id_reserva: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dni_cliente: PropTypes.string,
    nombre_cliente: PropTypes.string,
    telefono_cliente: PropTypes.string,
    fecha_reserva: PropTypes.string,
    hora_reserva: PropTypes.string,
    observacion: PropTypes.string,
    id_mozo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default ModalReserva;