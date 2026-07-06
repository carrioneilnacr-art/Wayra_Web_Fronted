import axios from 'axios';

async function test() {
  const api = axios.create({ baseURL: 'https://wayra-web-backend.onrender.com/api' });
  const resLogin = await api.post('/login', { user: 'N00NEIL', pass: '213' });
  const token = resLogin.data.token;
  
  // Asumiendo que el id_pedido 85 existe (fue creado en el seed anterior)
  try {
    const res = await api.get('/admin/boleta/85', { headers: { Authorization: `Bearer ${token}` } });
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.log(e.response?.data || e.message);
  }
}
test();
