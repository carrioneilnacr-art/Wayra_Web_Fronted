import axios from 'axios';

const wayraApi = axios.create({
  // ✅ ESTÁNDAR SENIOR: Lee la URL del archivo .env, y si no existe, usa Render por defecto
  baseURL: import.meta.env.VITE_API_URL || 'https://wayra-web-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ INTERCEPTOR AUTOMÁTICO: Inyecta el JWT token en cada petición si existe en el LocalStorage
wayraApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wayra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default wayraApi;