import axios from 'axios';

const API_URL = 'https://wayra-web-backend.onrender.com/api';
let token = '';

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDNI = () => Math.floor(10000000 + Math.random() * 90000000).toString();
const getRandomPhone = () => '9' + Math.floor(10000000 + Math.random() * 90000000).toString();

const nombres = ['Juan Pérez', 'María Gómez', 'Carlos López', 'Ana Silva', 'Luis Torres', 'Sofía Vargas', 'Pedro Castillo', 'Lucía Mendoza'];
const observaciones = ['Cumpleaños', 'Alérgico al maní', 'Mesa cerca a la ventana', 'Aniversario', '', '', ''];
const metodosPago = ['efectivo', 'tarjeta', 'yape', 'plin'];

let productosIds = [];
let mozosIds = [];

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function login() {
  console.log('Iniciando sesión como Administrador...');
  try {
    const res = await api.post('/login', { user: 'N00NEIL', pass: '213' });
    if (res.data.success) {
      token = res.data.token;
      console.log('✅ Login exitoso');
    } else {
      throw new Error('Credenciales inválidas');
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function loadDynamicData() {
  console.log('Cargando productos y mozos desde la base de datos...');
  try {
    const resProductos = await api.get('/admin/carta');
    // Asumiendo que devuelve un array de productos
    const carta = resProductos.data.carta || resProductos.data.data || resProductos.data || [];
    productosIds = carta.map(p => p.id_producto || p.id).filter(id => id);
    if (productosIds.length === 0) productosIds = [1, 2, 3, 4, 5, 6, 7];

    const resUsuarios = await api.get('/admin/usuarios');
    const usuarios = resUsuarios.data.usuarios || resUsuarios.data.data || resUsuarios.data || [];
    mozosIds = usuarios.filter(u => u.rol === 'mozo' || u.rol === 'Mozo').map(u => u.id_usuario);
    if (mozosIds.length === 0) mozosIds = [2]; // Fallback

    console.log(`✅ ${productosIds.length} productos y ${mozosIds.length} mozos listos para simulación.`);
  } catch (error) {
    console.log('⚠️ No se pudo cargar datos dinámicos, usando predeterminados.', error.message);
    productosIds = [1, 2, 3, 4, 5, 6, 7];
    mozosIds = [2];
  }
}

async function createReserva(fecha, hora, mesaId, isDirect) {
  const nombre = getRandomItem(nombres);
  const data = {
    id_mesa: mesaId,
    dni_cliente: getRandomDNI(),
    nombre_cliente: nombre,
    telefono_cliente: getRandomPhone(),
    fecha_reserva: fecha,
    hora_reserva: hora,
    observacion: isDirect ? 'Atención Inmediata (Walk-in)' : getRandomItem(observaciones),
    id_mozo: getRandomItem(mozosIds)
  };

  console.log(`Creando reserva para ${nombre} el ${fecha} a las ${hora}...`);
  try {
    await api.post('/reservas', data);
    console.log(`✅ Reserva enviada.`);
    return nombre;
  } catch (error) {
    console.error(`❌ Error creando reserva:`, error.response?.data || error.message);
    return null;
  }
}

async function createPedidoAndCheckout(idMesa, nombreCliente) {
  // 1. Crear el pedido con el payload exacto de ComanderoCarta
  const numPlatos = getRandomInt(1, 4);
  const items = [];
  let total = 0;

  for (let i = 0; i < numPlatos; i++) {
    const precio = getRandomInt(20, 80);
    const cant = getRandomInt(1, 3);
    const subtotalItem = precio * cant;
    items.push({
      id_producto: getRandomItem(productosIds),
      cantidad: cant,
      precio: precio,
      subtotal: subtotalItem
    });
    total += subtotalItem;
  }

  console.log(`Generando comanda (pedido) en mesa ${idMesa}...`);
  try {
    const resPedido = await api.post('/pedidos', {
      id_mesa: idMesa,
      id_mozo: getRandomItem(mozosIds),
      nombre_cliente: nombreCliente,
      items: items,
      observacion: "Atención rápida",
      total: total
    });

    const pedidoData = resPedido.data.pedido || resPedido.data.data || resPedido.data;
    const idPedido = pedidoData.id_pedido || pedidoData.insertId || pedidoData.id;
    if (!idPedido) {
      console.log('⚠️ No se obtuvo el ID del pedido:', resPedido.data);
      return;
    }

    console.log(`✅ Pedido ${idPedido} creado. Procesando Checkout...`);

    // 2. Procesar el Checkout
    const subtotalCalculado = total;
    const igv = Number((subtotalCalculado * 0.18).toFixed(2));
    const totalFinal = subtotalCalculado + igv;
    const metodo = getRandomItem(metodosPago);

    await api.put(`/pedidos/${idPedido}/checkout`, {
      subtotal: subtotalCalculado,
      igv,
      descuento: 0,
      total: totalFinal,
      metodo_pago: metodo
    });

    console.log(`💸 Checkout completado con ${metodo} (Total: S/${totalFinal})`);

  } catch (error) {
    console.error(`❌ Error en pedido/checkout:`, error.response?.data || error.message);
  }
}

async function runSeed() {
  await login();
  await loadDynamicData();

  // Generaremos datos para los días 1, 2, 3, 4, 5 de julio
  const fechas = [
    '2026-07-01',
    '2026-07-02',
    '2026-07-03',
    '2026-07-04',
    '2026-07-05'
  ];
  const turnos = ['13:00', '14:30', '19:00', '20:30', '21:15'];

  for (const fecha of fechas) {
    console.log(`\n--- Generando datos para la fecha: ${fecha} ---`);
    const atencionesDia = getRandomInt(3, 6);

    for (let i = 0; i < atencionesDia; i++) {
      const mesaId = getRandomInt(1, 8);
      const hora = getRandomItem(turnos);
      const isDirect = Math.random() > 0.5;

      const nombreCliente = await createReserva(fecha, hora, mesaId, isDirect);

      if (nombreCliente) {
        await createPedidoAndCheckout(mesaId, nombreCliente);
      }
    }
  }

  console.log('\n🎉 ¡Proceso de Seed finalizado! Revisa tus Dashboards.');
}

runSeed();
