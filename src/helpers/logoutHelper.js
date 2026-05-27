import wayraApi from '../api/wayraApi';

/**
 * Apaga el estado de sesión en Railway y limpia el almacenamiento local.
 * @param {Object} user - El objeto del usuario logueado actualmente.
 * @param {Function} onLogoutCallback - La función original encargada de resetear el estado en App.jsx.
 */
export const ejecutarCierreSesionGlobal = async (user, onLogoutCallback) => {
  try {
    if (user && user.id_usuario) {
      // Le avisa al servidor de Render que cambie el estado a 'offline' en Railway
      await wayraApi.post('/logout', { id_usuario: user.id_usuario });
    }
  } catch (error) {
    console.error("❌ Error en la traza de logout global:", error);
  } finally {
    // Limpieza absoluta de almacenes del navegador
    localStorage.clear();
    sessionStorage.clear();
    
    // Ejecuta la función nativa que desmonta la vista en el Front (el onLogout de tu App.jsx)
    if (onLogoutCallback) onLogoutCallback();
  }
};
