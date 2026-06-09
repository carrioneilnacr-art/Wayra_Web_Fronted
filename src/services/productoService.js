import wayraApi from '../api/wayraApi';

export const productoService = {
  // 1. Obtener todos los productos (Para el Administrador)
  getTodos: async () => {
    const res = await wayraApi.get('/admin/productos/todos');
    return res.data;
  },

  // 2. Modificar cualquier campo de un producto (estado, precio, nombre, etc.)
  update: async (id, camposModificados) => {
    const res = await wayraApi.put(`/admin/productos/${id}`, camposModificados);
    return res.data;
  },

  // 3. Registrar un plato nuevo en la base de datos
  create: async (datosNuevoProducto) => {
    const res = await wayraApi.post('/admin/productos', { ...datosNuevoProducto, estado: 1 });
    return res.data;
  }
};