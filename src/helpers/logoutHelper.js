import wayraApi from '../api/wayraApi';

/**
 * Apaga el estado de sesión en Railway y limpia el almacenamiento local.
 * @param {Object} user - El objeto del usuario logueado actualmente.
 * @param {Function} onLogoutCallback - La función original encargada de resetear el estado en App.jsx.
 */
export const ejecutarCierreSesionGlobal = async (user, onLogoutCallback) => {
  try {
    if (user?.id_usuario) {
      // 1. Le avisa al servidor de Render que cambie el estado a 'offline' en Railway
      await wayraApi.post('/logout', { id_usuario: user.id_usuario });
    }
  } catch (error) {
    console.error("❌ Error en la traza de logout global:", error);
  } finally {
    // 2. PROTECCIÓN SENIOR: Matar todos los intervalos cíclicos activos (Evita fugas de memoria de Render pooling)
    let id = globalThis.setInterval(function () { }, 0);
    while (id--) {
      globalThis.clearInterval(id);
    }

    // 3. Limpieza absoluta de almacenes del navegador
    localStorage.clear();
    sessionStorage.clear();

    // 4. Ejecuta la función nativa que desmonta la vista en el Front (el onLogout de tu App.jsx)
    if (onLogoutCallback) onLogoutCallback();

    // 5. Redirección limpia y forzada al Login
    globalThis.location.href = '/login';
  }
};