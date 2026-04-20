import axios from 'axios';

const wayraApi = axios.create({
  baseURL: 'https://wayra-web-backend.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
export default wayraApi;
