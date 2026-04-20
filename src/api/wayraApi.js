import axios from 'axios';

const wayraApi = axios.create({
  // URL base de tu backend en Render
  baseURL: 'https://wayra-web-backend.onrender.com/api',
  // Tiempo máximo de espera (10 segundos)
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default wayraApi;