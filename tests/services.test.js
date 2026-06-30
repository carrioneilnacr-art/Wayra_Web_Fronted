import { vi, describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../src/services/authService';
import { productoService } from '../src/services/productoService';
import { reservaService } from '../src/services/reservaService';
import { pedidoService } from '../src/services/pedidoService';
import wayraApi from '../src/api/wayraApi';

// Mock de wayraApi para simular respuestas HTTP
vi.mock('../src/api/wayraApi', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('🧪 Tests para authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUsuarios debería consumir GET /admin/usuarios', async () => {
    const mockData = [{ id_usuario: 1, nombre: 'Leonardo' }];
    vi.spyOn(wayraApi, 'get').mockResolvedValue({ data: mockData });

    const res = await authService.getUsuarios();
    expect(wayraApi.get).toHaveBeenCalledWith('/admin/usuarios');
    expect(res).toEqual(mockData);
  });

  it('createUsuario debería consumir POST /admin/usuarios', async () => {
    const payload = { nombre: 'New User' };
    const mockData = { id: 2, ...payload };
    vi.spyOn(wayraApi, 'post').mockResolvedValue({ data: mockData });

    const res = await authService.createUsuario(payload);
    expect(wayraApi.post).toHaveBeenCalledWith('/admin/usuarios', payload);
    expect(res).toEqual(mockData);
  });

  it('updateUsuario debería consumir PUT /admin/usuarios/:id', async () => {
    const payload = { nombre: 'Updated' };
    const mockData = { id: 3, ...payload };
    vi.spyOn(wayraApi, 'put').mockResolvedValue({ data: mockData });

    const res = await authService.updateUsuario(3, payload);
    expect(wayraApi.put).toHaveBeenCalledWith('/admin/usuarios/3', payload);
    expect(res).toEqual(mockData);
  });

  it('deleteUsuario debería consumir DELETE /admin/usuarios/:id', async () => {
    const mockData = { success: true };
    vi.spyOn(wayraApi, 'delete').mockResolvedValue({ data: mockData });

    const res = await authService.deleteUsuario(4);
    expect(wayraApi.delete).toHaveBeenCalledWith('/admin/usuarios/4');
    expect(res).toEqual(mockData);
  });
});

describe('🧪 Tests para productoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTodos debería consumir GET /admin/productos/todos', async () => {
    const mockData = [{ id_producto: 1, nombre: 'Maki' }];
    vi.spyOn(wayraApi, 'get').mockResolvedValue({ data: mockData });

    const res = await productoService.getTodos();
    expect(wayraApi.get).toHaveBeenCalledWith('/admin/productos/todos');
    expect(res).toEqual(mockData);
  });

  it('update debería consumir PUT /admin/productos/:id', async () => {
    const payload = { precio: 25.5 };
    const mockData = { id: 1, ...payload };
    vi.spyOn(wayraApi, 'put').mockResolvedValue({ data: mockData });

    const res = await productoService.update(1, payload);
    expect(wayraApi.put).toHaveBeenCalledWith('/admin/productos/1', payload);
    expect(res).toEqual(mockData);
  });

  it('create debería consumir POST /admin/productos con estado=1', async () => {
    const payload = { nombre: 'Tiradito' };
    const mockData = { id: 5, ...payload, estado: 1 };
    vi.spyOn(wayraApi, 'post').mockResolvedValue({ data: mockData });

    const res = await productoService.create(payload);
    expect(wayraApi.post).toHaveBeenCalledWith('/admin/productos', { ...payload, estado: 1 });
    expect(res).toEqual(mockData);
  });
});

describe('🧪 Tests para reservaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMesas debería consumir GET /mesas', async () => {
    const mockData = [{ id_mesa: 1, estado: 'disponible' }];
    vi.spyOn(wayraApi, 'get').mockResolvedValue({ data: mockData });

    const res = await reservaService.getMesas();
    expect(wayraApi.get).toHaveBeenCalledWith('/mesas');
    expect(res).toEqual(mockData);
  });

  it('getReservas debería consumir GET /reservas?fecha=...', async () => {
    const mockData = [{ id_reserva: 1, fecha: '2026-06-30' }];
    vi.spyOn(wayraApi, 'get').mockResolvedValue({ data: mockData });

    const res = await reservaService.getReservas('2026-06-30');
    expect(wayraApi.get).toHaveBeenCalledWith('/reservas?fecha=2026-06-30');
    expect(res).toEqual(mockData);
  });

  it('getAsignarMozo debería consumir GET /asignar-mozo', async () => {
    const mockData = { id_mozo: 10, nombre: 'Mozo A' };
    vi.spyOn(wayraApi, 'get').mockResolvedValue({ data: mockData });

    const res = await reservaService.getAsignarMozo();
    expect(wayraApi.get).toHaveBeenCalledWith('/asignar-mozo');
    expect(res).toEqual(mockData);
  });

  it('liberarMesaLimpieza debería consumir PUT /mesas/:id/liberar', async () => {
    const mockData = { success: true };
    vi.spyOn(wayraApi, 'put').mockResolvedValue({ data: mockData });

    const res = await reservaService.liberarMesaLimpieza(2);
    expect(wayraApi.put).toHaveBeenCalledWith('/mesas/2/liberar');
    expect(res).toEqual(mockData);
  });

  it('saveReserva sin idReserva debería consumir POST /reservas', async () => {
    const form = { nombre_cliente: 'Client A' };
    const mockData = { id_reserva: 100, ...form };
    vi.spyOn(wayraApi, 'post').mockResolvedValue({ data: mockData });

    const res = await reservaService.saveReserva(form, null, 15);
    expect(wayraApi.post).toHaveBeenCalledWith('/reservas', { ...form, id_usuario: 15 });
    expect(res).toEqual(mockData);
  });

  it('saveReserva con idReserva debería consumir PUT /reservas/:id', async () => {
    const form = { nombre_cliente: 'Client B' };
    const mockData = { id_reserva: 99, ...form };
    vi.spyOn(wayraApi, 'put').mockResolvedValue({ data: mockData });

    const res = await reservaService.saveReserva(form, 99, 15);
    expect(wayraApi.put).toHaveBeenCalledWith('/reservas/99', { ...form, id_usuario: 15 });
    expect(res).toEqual(mockData);
  });
});

describe('🧪 Tests para pedidoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getHistorial debería consumir GET /admin/historial?fecha=...', async () => {
    const mockData = [];
    vi.spyOn(wayraApi, 'get').mockResolvedValue({ data: mockData });
    const res = await pedidoService.getHistorial('2026-06-30');
    expect(wayraApi.get).toHaveBeenCalledWith('/admin/historial?fecha=2026-06-30');
    expect(res).toEqual(mockData);
  });

  it('getMesasMozo debería consumir GET /mozo/mesas?id_mozo=...', async () => {
    const mockData = [];
    vi.spyOn(wayraApi, 'get').mockResolvedValue({ data: mockData });
    const res = await pedidoService.getMesasMozo(5);
    expect(wayraApi.get).toHaveBeenCalledWith('/mozo/mesas?id_mozo=5');
    expect(res).toEqual(mockData);
  });

  it('crearPedido con modo=agregar debería consumir POST /pedidos/:id/agregar', async () => {
    const payload = { modo: 'agregar', id_pedido_existente: 10, items: [] };
    const mockData = { success: true };
    vi.spyOn(wayraApi, 'post').mockResolvedValue({ data: mockData });
    const res = await pedidoService.crearPedido(payload);
    expect(wayraApi.post).toHaveBeenCalledWith('/pedidos/10/agregar', payload);
    expect(res).toEqual(mockData);
  });

  it('crearPedido normal debería consumir POST /pedidos', async () => {
    const payload = { items: [] };
    const mockData = { id_pedido: 11 };
    vi.spyOn(wayraApi, 'post').mockResolvedValue({ data: mockData });
    const res = await pedidoService.crearPedido(payload);
    expect(wayraApi.post).toHaveBeenCalledWith('/pedidos', payload);
    expect(res).toEqual(mockData);
  });

  it('getEstatusPedidos debería consumir GET /mozo/pedidos/estatus?id_mozo=...', async () => {
    const mockData = [];
    vi.spyOn(wayraApi, 'get').mockResolvedValue({ data: mockData });
    const res = await pedidoService.getEstatusPedidos(10);
    expect(wayraApi.get).toHaveBeenCalledWith('/mozo/pedidos/estatus?id_mozo=10');
    expect(res).toEqual(mockData);
  });

  it('actualizarObservacion debería consumir PUT /pedidos/:id/observacion', async () => {
    const mockData = { success: true };
    vi.spyOn(wayraApi, 'put').mockResolvedValue({ data: mockData });
    const res = await pedidoService.actualizarObservacion(5, 'Sin picante');
    expect(wayraApi.put).toHaveBeenCalledWith('/pedidos/5/observacion', { observacion: 'Sin picante' });
    expect(res).toEqual(mockData);
  });

  it('pagarPedido debería consumir PUT /pedidos/:id/pagar', async () => {
    const mockRes = { status: 200, data: {} };
    vi.spyOn(wayraApi, 'put').mockResolvedValue(mockRes);
    const res = await pedidoService.pagarPedido(8);
    expect(wayraApi.put).toHaveBeenCalledWith('/pedidos/8/pagar');
    expect(res).toEqual(mockRes);
  });

  it('getReservasMozoHoy debería consumir GET /reservas/hoy?id_mozo=...', async () => {
    const mockData = [];
    vi.spyOn(wayraApi, 'get').mockResolvedValue({ data: mockData });
    const res = await pedidoService.getReservasMozoHoy(12);
    expect(wayraApi.get).toHaveBeenCalledWith('/reservas/hoy?id_mozo=12');
    expect(res).toEqual(mockData);
  });

  it('eliminarItemDetalle debería consumir DELETE /pedidos/detalle/:id', async () => {
    const mockData = { success: true };
    vi.spyOn(wayraApi, 'delete').mockResolvedValue({ data: mockData });
    const res = await pedidoService.eliminarItemDetalle(100);
    expect(wayraApi.delete).toHaveBeenCalledWith('/pedidos/detalle/100');
    expect(res).toEqual(mockData);
  });

  it('procesarCheckout debería consumir PUT /pedidos/:id/checkout', async () => {
    const payload = { tipo_doc: 'BOLETA' };
    const mockData = { success: true };
    vi.spyOn(wayraApi, 'put').mockResolvedValue({ data: mockData });
    const res = await pedidoService.procesarCheckout(50, payload);
    expect(wayraApi.put).toHaveBeenCalledWith('/pedidos/50/checkout', payload);
    expect(res).toEqual(mockData);
  });
});
