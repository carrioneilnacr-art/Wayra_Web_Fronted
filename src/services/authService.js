import wayraApi from '../api/wayraApi';

export const authService = {
  // 1. Listar al personal del restaurante
  getUsuarios: async () => {
    const res = await wayraApi.get('/admin/usuarios');
    return res.data;
  },

  // 2. Registrar un nuevo usuario
  createUsuario: async (datosUsuario) => {
    const res = await wayraApi.post('/admin/usuarios', datosUsuario);
    return res.data;
  },

  // 3. Actualizar perfil o credenciales
  updateUsuario: async (id, datosActualizados) => {
    const res = await wayraApi.put(`/admin/usuarios/${id}`, datosActualizados);
    return res.data;
  },

  // 4. Revocar acceso (Eliminar definitivamente)
  deleteUsuario: async (id) => {
    const res = await wayraApi.delete(`/admin/usuarios/${id}`);
    return res.data;
  }
};