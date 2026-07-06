import axios from 'axios';

async function test() {
  const api = axios.create({ baseURL: 'https://wayra-web-backend.onrender.com/api' });
  const resLogin = await api.post('/login', { user: 'N00NEIL', pass: '213' });
  const token = resLogin.data.token;
  
  const resUsuarios = await api.get('/admin/usuarios', { headers: { Authorization: `Bearer ${token}` } });
  console.log(resUsuarios.data);
}
test();
