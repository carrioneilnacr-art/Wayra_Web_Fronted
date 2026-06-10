import wayraApi from '../api/wayraApi';

export const pedidoService = {
  
  // 1. Obtener el historial completo de ventas por fecha (Admin)
  getHistorial: async (fecha) => {
    const res = await wayraApi.get(`/admin/historial?fecha=${fecha}`);
    return res.data;
  },
  
  // 2. Obtener las mesas asignadas al mozo logueado
  getMesasMozo: async (idMozo) => {
    const res = await wayraApi.get(`/mozo/mesas?id_mozo=${idMozo}`);
    return res.data;
  },
  // 3. Despachar comanda o agregar platos
  crearPedido: async (datosComanda) => {
    if (datosComanda.modo === 'agregar') {
      const res = await wayraApi.post(`/pedidos/${datosComanda.id_pedido_existente}/agregar`, datosComanda);
      return res.data;
    }
    const res = await wayraApi.post('/pedidos', datosComanda);
    return res.data;
  },

  // 4. Monitorear el estatus de los pedidos del turno
  getEstatusPedidos: async (idMozo) => {
    const res = await wayraApi.get(`/mozo/pedidos/estatus?id_mozo=${idMozo}`);
    return res.data;
  },
// 🌟 NUEVO: Actualizar la nota/observación de un pedido activo
  actualizarObservacion: async (idPedido, observacion) => {
    const res = await wayraApi.put(`/pedidos/${idPedido}/observacion`, { observacion });
    return res.data;
  },
  // 5. Procesar el cobro e integración IZIPAY
  pagarPedido: async (idPedido) => {
    const res = await wayraApi.put(`/pedidos/${idPedido}/pagar`);
    return res;
  },

  // 6. 🌟 NUEVO: Obtener las reservas del mozo logueado para el turno de hoy
  getReservasMozoHoy: async (idMozo) => {
    const res = await wayraApi.get(`/reservas/hoy?id_mozo=${idMozo}`);
    return res.data;
  },

  // 7. 🌟 NUEVO: Eliminar un plato específico de la comanda en cocina
  eliminarItemDetalle: async (idDetalle) => {
    const res = await wayraApi.delete(`/pedidos/detalle/${idDetalle}`);
    return res.data;
  },

  // 8. 🌟 NUEVO: Realizar el checkout final (Generación de boleta/factura en base de datos)
  procesarCheckout: async (idPedido, datosCheckout) => {
    const res = await wayraApi.put(`/pedidos/${idPedido}/checkout`, datosCheckout);
    return res.data;
  }
  
};