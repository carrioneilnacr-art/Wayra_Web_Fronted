import wayraApi from '../api/wayraApi';

export const reservaService = {
  // Obtener estado actual de las mesas
  getMesas: async () => {
    const res = await wayraApi.get('/mesas');
    return res.data;
  },

  // Obtener reservas de una fecha específica
  getReservas: async (fecha) => {
    const res = await wayraApi.get(`/reservas?fecha=${fecha}`);
    return res.data;
  },
  // 🎯 NUEVO: Obtener mozo disponible automáticamente para atención inmediata
  getAsignarMozo: async () => {
    const res = await wayraApi.get('/asignar-mozo');
    return res.data;
  },
  // 🧼 Mozo: Cambiar estado de una mesa de 'limpieza' a 'disponible'
  liberarMesaLimpieza: async (idMesa) => {
    const res = await wayraApi.put(`/mesas/${idMesa}/liberar`);
    return res.data;
  },
  // Guardar o actualizar una admisión/reserva con la huella digital del usuario
  saveReserva: async (form, idReserva = null, idUsuario = null) => {
    const datosConIdentidad = { ...form, id_usuario: idUsuario };
    
    if (idReserva) {
      const res = await wayraApi.put(`/reservas/${idReserva}`, datosConIdentidad);
      return res.data;
    } else {
      const res = await wayraApi.post('/reservas', datosConIdentidad);
      return res.data;
    }
  }
  
};