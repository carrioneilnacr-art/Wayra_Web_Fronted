import React, { useState, useEffect } from 'react';
import { pedidoService } from '../../services/pedidoService';

export default function ModalCheckout({ pedido, reservas, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const [tipoDoc, setTipoDoc] = useState('BOLETA');
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [metodoPago, setMetodoPago] = useState('TARJETA');

  useEffect(() => {
    if (reservas && pedido) {
      const reservaMesa = reservas.find(r => r.id_mesa === pedido.id_mesa);
      if (reservaMesa) {
        setDocumento(reservaMesa.dni_cliente || '');
        setNombre(reservaMesa.nombre_cliente || '');
      }
    }
  }, [reservas, pedido]);

  useEffect(() => {
    setDocumento(''); setNombre(''); setDireccion('');
  }, [tipoDoc]);

  const handleDocChange = (e) => {
    const soloNumeros = e.target.value.replace(/\D/g, '');
    if (tipoDoc === 'BOLETA' && soloNumeros.length <= 8) setDocumento(soloNumeros);
    if (tipoDoc === 'FACTURA' && soloNumeros.length <= 11) setDocumento(soloNumeros);
  };

  const handleNombreChange = (e) => {
    if (tipoDoc === 'BOLETA') {
      setNombre(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''));
    } else {
      setNombre(e.target.value);
    }
  };

  const isFormValid = () => {
    if (tipoDoc === 'BOLETA') return documento.length === 8 && nombre.trim().length >= 3;
    if (tipoDoc === 'FACTURA') return documento.length === 11 && nombre.trim().length >= 3 && direccion.trim().length >= 3;
    return false;
  };

  const procesarPagoFinal = async () => {
    setProcesando(true);
    try {
      await pedidoService.procesarCheckout(pedido.id_pedido, {
        metodo_pago: metodoPago, dni_cliente: documento || '00000000', nombre_cliente: nombre || 'CLIENTE', tipo_doc: tipoDoc
      });
      setStep(3);
      onSuccess();
    } catch (e) {
      alert("Error al procesar el pago.");
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[3000] flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans print:bg-white print:backdrop-blur-none">
      
      {/* PASO 1: DATOS (Estilo Stripe Checkout) */}
      {step === 1 && (
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative animate-in zoom-in-95 border border-slate-100">
          <button onClick={onClose} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
          
          <h2 className="text-xl font-bold text-slate-900 mb-6">Detalles de Facturación</h2>
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button onClick={() => setTipoDoc('BOLETA')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tipoDoc === 'BOLETA' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Boleta</button>
            <button onClick={() => setTipoDoc('FACTURA')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tipoDoc === 'FACTURA' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Factura</button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">{tipoDoc === 'FACTURA' ? 'RUC' : 'DNI'}</label>
              <input type="text" value={documento} onChange={handleDocChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-shadow placeholder:text-slate-300" placeholder={tipoDoc === 'FACTURA' ? "11 dígitos" : "8 dígitos"} />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">{tipoDoc === 'FACTURA' ? 'Razón Social' : 'Nombre Completo'}</label>
              <input type="text" value={nombre} onChange={handleNombreChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-shadow placeholder:text-slate-300 capitalize" placeholder="Nombre que aparecerá en el comprobante" />
            </div>

            {tipoDoc === 'FACTURA' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Dirección Fiscal</label>
                <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-shadow placeholder:text-slate-300 capitalize" placeholder="Dirección completa" />
              </div>
            )}
          </div>

          <button onClick={() => setStep(2)} disabled={!isFormValid()} className={`w-full font-semibold text-sm py-3.5 rounded-xl transition-all mt-8 ${isFormValid() ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            Continuar al Pago
          </button>
        </div>
      )}

      {/* PASO 2: SELECCIÓN DE PAGO (Fintech) */}
      {step === 2 && (
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-right-8 print:hidden border border-slate-100">
          <div className="bg-slate-50 px-8 py-6 text-center border-b border-slate-200">
            <p className="text-sm text-slate-500 font-medium mb-1">Mesa {pedido.id_mesa}</p>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">S/ {Number(pedido.total).toFixed(2)}</p>
          </div>

          <div className="p-8">
            <p className="text-sm font-semibold text-slate-900 mb-4">Método de pago</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {['TARJETA', 'EFECTIVO', 'YAPE', 'PLIN'].map(m => (
                <button key={m} onClick={() => setMetodoPago(m)} className={`py-4 rounded-xl text-xs font-semibold uppercase transition-all border ${metodoPago === m ? 'bg-teal-50 border-teal-600 text-teal-700 ring-1 ring-teal-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>{m}</button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="py-3.5 px-6 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm">Atrás</button>
              <button onClick={procesarPagoFinal} disabled={procesando} className={`flex-1 text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-sm ${procesando ? 'bg-slate-400' : 'bg-teal-600 hover:bg-teal-700'}`}>
                {procesando ? 'Procesando...' : `Pagar S/ ${Number(pedido.total).toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 3: BOLETA DIGITAL (Clean Receipt) */}
      {step === 3 && (
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-2xl relative border border-slate-200 print:shadow-none print:border-none animate-in zoom-in-95">
          <div className="p-8">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 className="text-center text-xl font-bold text-slate-900 mb-6">Pago Exitoso</h1>

            <div className="space-y-3 mb-6 text-sm text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-3"><span>Comprobante</span><span className="text-slate-900 font-medium">{tipoDoc}</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-3"><span>Cliente</span><span className="text-slate-900 font-medium truncate max-w-[150px]">{nombre}</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-3"><span>{tipoDoc === 'FACTURA' ? 'RUC' : 'DNI'}</span><span className="text-slate-900 font-medium">{documento}</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-3"><span>Método</span><span className="text-slate-900 font-medium">{metodoPago}</span></div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              {pedido.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-start mb-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-slate-500">{item.cantidad}x</span>
                    <span className="text-slate-900">{item.nombre}</span>
                  </div>
                  <span className="text-slate-900 font-medium">S/ {parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-200">
                <span className="text-sm font-semibold text-slate-900">Total</span>
                <span className="text-xl font-bold text-slate-900">S/ {parseFloat(pedido.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex border-t border-slate-100 print:hidden shrink-0">
            <button onClick={() => window.print()} className="flex-1 py-4 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors border-r border-slate-100">Imprimir</button>
            <button onClick={onClose} className="flex-1 py-4 text-teal-600 text-sm font-semibold hover:bg-teal-50 transition-colors">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}