import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { pedidoService } from '../../services/pedidoService';

function validateCheckoutForm(tipoDoc, documento, nombre, direccion) {
  if (tipoDoc === 'BOLETA') {
    return documento.length === 8 && nombre.trim().length >= 3;
  }
  if (tipoDoc === 'FACTURA') {
    return documento.length === 11 && nombre.trim().length >= 3 && direccion.trim().length >= 3;
  }
  return false;
}

export default function ModalCheckout({ pedido, reservas, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [procesando, setProcesando] = useState(false);

  // Paso 1: Formulario y Validaciones
  const [tipoDoc, setTipoDoc] = useState('BOLETA');
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState(''); // Nuevo para factura

  // Paso 2: Método de Pago
  const [metodoPago, setMetodoPago] = useState('TARJETA');



  // 🛡️ CONTROLADORES DE VALIDACIÓN EN VIVO
  const handleDocChange = (e) => {
    const soloNumeros = e.target.value.replace(/\D/g, ''); // Expresión regular: solo dígitos
    if (tipoDoc === 'BOLETA' && soloNumeros.length <= 8) setDocumento(soloNumeros);
    if (tipoDoc === 'FACTURA' && soloNumeros.length <= 11) setDocumento(soloNumeros);
  };

  const handleNombreChange = (e) => {
    if (tipoDoc === 'BOLETA') {
      const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      setNombre(soloLetras);
    } else {
      setNombre(e.target.value); // Razón social sí permite números y símbolos
    }
  };

  const procesarPagoFinal = async () => {
    setProcesando(true);
    try {
      await pedidoService.procesarCheckout(pedido.id_pedido, {
        metodo_pago: metodoPago,
        dni_cliente: documento || '00000000',
        nombre_cliente: nombre || 'CLIENTE DIRECTO',
        tipo_doc: tipoDoc
      });
      setStep(3);
      onSuccess();
    } catch (e) {
      console.error("Error al procesar el pago:", e);
      alert("Error al procesar el pago. Verifica la conexión.");
      setProcesando(false);
    }
  };

  // Evitamos ternario anidado para la clase de fondo del botón de pago
  let pagoButtonBgClass = 'bg-[#00a1e1]';
  if (procesando) {
    pagoButtonBgClass = 'bg-slate-400';
  } else if (metodoPago === 'YAPE') {
    pagoButtonBgClass = 'bg-[#742384]';
  } else if (metodoPago === 'PLIN') {
    pagoButtonBgClass = 'bg-teal-500';
  } else if (metodoPago === 'EFECTIVO') {
    pagoButtonBgClass = 'bg-emerald-500';
  }

  // Autocompletado si había reserva
  useEffect(() => {
    if (reservas && pedido) {
      const reservaMesa = reservas.find(r => r.id_mesa === pedido.id_mesa);
      if (reservaMesa) {
        setDocumento(reservaMesa.dni_cliente || '');
        setNombre(reservaMesa.nombre_cliente || '');
      }
    }
  }, [reservas, pedido]);

  // Limpiar campos al cambiar de tipo de documento
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setDocumento('');
    setNombre('');
    setDireccion('');
  }, [tipoDoc]);

  const isValid = validateCheckoutForm(tipoDoc, documento, nombre, direccion);

  return (
    <div className="fixed inset-0 bg-[#1a1a1a]/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4 animate-in fade-in duration-300 print:bg-white print:backdrop-blur-none">

      {step === 1 && (
        <Step1Billing
          tipoDoc={tipoDoc}
          setTipoDoc={setTipoDoc}
          documento={documento}
          handleDocChange={handleDocChange}
          nombre={nombre}
          handleNombreChange={handleNombreChange}
          direccion={direccion}
          setDireccion={setDireccion}
          isValid={isValid}
          setStep={setStep}
          onClose={onClose}
        />
      )}

      {step === 2 && (
        <Step2Niubiz
          pedido={pedido}
          metodoPago={metodoPago}
          setMetodoPago={setMetodoPago}
          procesarPagoFinal={procesarPagoFinal}
          procesando={procesando}
          pagoButtonBgClass={pagoButtonBgClass}
          setStep={setStep}
        />
      )}

      {step === 3 && (
        <Step3Boleta
          pedido={pedido}
          tipoDoc={tipoDoc}
          nombre={nombre}
          documento={documento}
          direccion={direccion}
          metodoPago={metodoPago}
          onClose={onClose}
        />
      )}
    </div>
  );
}

function Step1Billing({
  tipoDoc,
  setTipoDoc,
  documento,
  handleDocChange,
  nombre,
  handleNombreChange,
  direccion,
  setDireccion,
  isValid,
  setStep,
  onClose
}) {
  return (
    <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 print:hidden">
      <div className="bg-[#1a1a1a] p-5 flex justify-between items-center text-white">
        <h2 className="text-sm font-black tracking-[0.2em] uppercase italic">1. Datos de Facturación</h2>
        <button type="button" onClick={onClose} className="text-white/50 hover:text-white transition-colors">✕</button>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button type="button" onClick={() => setTipoDoc('BOLETA')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tipoDoc === 'BOLETA' ? 'bg-white shadow-sm text-[#1a1a1a]' : 'text-slate-400'}`}>Boleta</button>
          <button type="button" onClick={() => setTipoDoc('FACTURA')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tipoDoc === 'FACTURA' ? 'bg-white shadow-sm text-[#1a1a1a]' : 'text-slate-400'}`}>Factura</button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="doc-input" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              {tipoDoc === 'FACTURA' ? 'RUC (11 dígitos)' : 'DNI (8 dígitos)'}
            </label>
            <input
              id="doc-input"
              type="text"
              value={documento}
              onChange={handleDocChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 mt-1 font-bold text-slate-700 outline-none focus:border-[#c5a059] transition-colors"
              placeholder={tipoDoc === 'FACTURA' ? "Ingrese RUC" : "Ingrese DNI"}
            />
          </div>

          <div>
            <label htmlFor="nombre-input" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              {tipoDoc === 'FACTURA' ? 'Razón Social' : 'Nombres Completos'}
            </label>
            <input
              id="nombre-input"
              type="text"
              value={nombre}
              onChange={handleNombreChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 mt-1 font-bold text-slate-700 uppercase outline-none focus:border-[#c5a059] transition-colors"
              placeholder={tipoDoc === 'FACTURA' ? "Nombre de la empresa" : "Nombres y apellidos"}
            />
          </div>

          {tipoDoc === 'FACTURA' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label htmlFor="dir-input" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Dirección Fiscal
              </label>
              <input
                id="dir-input"
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 mt-1 font-bold text-slate-700 uppercase outline-none focus:border-[#c5a059] transition-colors"
                placeholder="Dirección completa"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={!isValid}
          className={`w-full font-black text-[11px] tracking-[0.2em] py-4 rounded-xl uppercase transition-all mt-4 ${isValid ? 'bg-[#c5a059] text-white hover:bg-[#b07d62] shadow-lg shadow-[#c5a059]/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          {isValid ? 'Continuar al Pago' : 'Complete los datos'}
        </button>
      </div>
    </div>
  );
}

Step1Billing.propTypes = {
  tipoDoc: PropTypes.string.isRequired,
  setTipoDoc: PropTypes.func.isRequired,
  documento: PropTypes.string.isRequired,
  handleDocChange: PropTypes.func.isRequired,
  nombre: PropTypes.string.isRequired,
  handleNombreChange: PropTypes.func.isRequired,
  direccion: PropTypes.string.isRequired,
  setDireccion: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
  setStep: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function Step2Niubiz({
  pedido,
  metodoPago,
  setMetodoPago,
  procesarPagoFinal,
  procesando,
  pagoButtonBgClass,
  setStep
}) {
  return (
    <div className="bg-white w-full max-w-[360px] rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-right-8 relative print:hidden border border-slate-100">
      <div className="bg-gradient-to-r from-[#00a1e1] to-[#0072bc] px-6 py-5 flex justify-between items-center">
        <h1 className="text-white text-xl font-black tracking-tighter flex items-center gap-1">niubiz <span className="w-1.5 h-1.5 bg-white rounded-full mt-1"></span></h1>
        <span className="text-white/80 font-bold text-[9px] tracking-widest uppercase border border-white/20 px-2 py-1 rounded-md">Pago Link</span>
      </div>

      <div className="p-6">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Orden #{pedido.id_pedido}</p>
            <h3 className="text-sm font-black text-slate-700 leading-tight mt-1">Consumo Mesa {pedido.id_mesa}</h3>
            <span className="text-[#c5a059] text-[9px] tracking-widest uppercase italic font-bold">Wayra Nikkei</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-[#1a1a1a]">S/ {Number(pedido.total).toFixed(2)}</p>
          </div>
        </div>

        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Seleccione método:</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button type="button" onClick={() => setMetodoPago('TARJETA')} className={`py-4 rounded-xl flex items-center justify-center gap-2 transition-all border ${metodoPago === 'TARJETA' ? 'bg-[#00a1e1]/10 border-[#00a1e1] text-[#0072bc]' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}><span className="text-xl">💳</span><span className="text-[10px] font-black uppercase tracking-wider">Tarjeta</span></button>
          <button type="button" onClick={() => setMetodoPago('EFECTIVO')} className={`py-4 rounded-xl flex items-center justify-center gap-2 transition-all border ${metodoPago === 'EFECTIVO' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}><span className="text-xl">💵</span><span className="text-[10px] font-black uppercase tracking-wider">Efectivo</span></button>
          <button type="button" onClick={() => setMetodoPago('YAPE')} className={`py-4 rounded-xl flex items-center justify-center gap-2 transition-all border ${metodoPago === 'YAPE' ? 'bg-[#742384]/10 border-[#742384] text-[#742384]' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}><span className="text-xl">📱</span><span className="text-[10px] font-black uppercase tracking-wider">Yape</span></button>
          <button type="button" onClick={() => setMetodoPago('PLIN')} className={`py-4 rounded-xl flex items-center justify-center gap-2 transition-all border ${metodoPago === 'PLIN' ? 'bg-[#00e3a5]/10 border-[#00e3a5] text-teal-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}><span className="text-xl">📲</span><span className="text-[10px] font-black uppercase tracking-wider">Plin</span></button>
        </div>

        {metodoPago === 'TARJETA' && (
          <div className="space-y-3 mb-6 animate-in fade-in">
            <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm tracking-widest font-mono text-slate-400 outline-none" disabled />
            <div className="flex gap-3">
              <input type="text" placeholder="MM/AA" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs tracking-widest text-slate-400 outline-none text-center" disabled />
              <input type="password" placeholder="CVV" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs tracking-widest text-slate-400 outline-none text-center" disabled />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button type="button" onClick={() => setStep(1)} className="py-4 px-4 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">Volver</button>
          <button
            type="button"
            onClick={procesarPagoFinal}
            disabled={procesando}
            className={`flex-1 text-white font-black text-xs tracking-widest py-4 rounded-xl uppercase shadow-lg transition-all ${pagoButtonBgClass}`}
          >
            {procesando ? 'PROCESANDO...' : `PAGAR S/ ${Number(pedido.total).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

Step2Niubiz.propTypes = {
  pedido: PropTypes.shape({
    id_pedido: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    id_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  metodoPago: PropTypes.string.isRequired,
  setMetodoPago: PropTypes.func.isRequired,
  procesarPagoFinal: PropTypes.func.isRequired,
  procesando: PropTypes.bool.isRequired,
  pagoButtonBgClass: PropTypes.string.isRequired,
  setStep: PropTypes.func.isRequired,
};

function Step3Boleta({
  pedido,
  tipoDoc,
  nombre,
  documento,
  direccion,
  metodoPago,
  onClose
}) {
  return (
    <div className="max-w-md w-full bg-[#fcfaf7] rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-100 print:shadow-none print:border-none animate-in slide-in-from-bottom-8 duration-500">
      <div className="kintsugi-accent !opacity-40 print:hidden"></div>

      <div className="p-8 md:p-10">
        <header className="text-center mb-6">
          <div className="border border-slate-900 text-slate-900 p-2 w-max mx-auto mb-4 text-[8px] font-black leading-none tracking-widest">
            WAYRA<br />NKK
          </div>
          <h1 className="text-2xl font-extralight tracking-[0.4em] uppercase gold-shimmer italic">Comprobante</h1>
          <div className="h-[1px] w-12 bg-[#c5a059] mx-auto mt-2 opacity-50"></div>
        </header>

        <div className="space-y-3 mb-6 text-[9px] tracking-[0.2em] uppercase text-slate-500 font-medium">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>Nº {tipoDoc}</span>
            <span className="text-slate-900 font-bold">#00{pedido.id_pedido}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>{tipoDoc === 'FACTURA' ? 'Razón Social' : 'Cliente'}</span>
            <span className="text-slate-900 font-bold truncate max-w-[150px] text-right">{nombre || 'CLIENTE GENERAL'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>{tipoDoc === 'FACTURA' ? 'RUC' : 'DNI'}</span>
            <span className="text-slate-900 font-bold">{documento || '---'}</span>
          </div>

          {tipoDoc === 'FACTURA' && direccion && (
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span>Dirección</span>
              <span className="text-slate-900 font-bold truncate max-w-[150px] text-right">{direccion}</span>
            </div>
          )}

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>Método</span>
            <span className="text-slate-900 font-bold">{metodoPago}</span>
          </div>
          <div className="flex justify-between">
            <span>Fecha</span>
            <span className="text-slate-900 font-bold">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString().substring(0, 5)}</span>
          </div>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="text-[8px] tracking-[0.3em] uppercase text-[#b07d62] border-b border-[#b07d62]/20">
              <th className="text-left py-2 font-black italic">Cant.</th>
              <th className="text-left py-2 font-black italic">Producto</th>
              <th className="text-right py-2 font-black italic">Subtotal</th>
            </tr>
          </thead>
          <tbody className="text-[10px] tracking-widest text-slate-700">
            {pedido.items?.map((item, index) => (
              <tr key={`checkout-item-${item.id_producto || item.nombre || index}-${index}`} className="border-b border-slate-100/60">
                <td className="py-3 font-bold text-[#b07d62]">{item.cantidad}</td>
                <td className="py-3 font-medium uppercase truncate max-w-[180px]">{item.nombre || item.producto}</td>
                <td className="py-3 text-right font-bold font-mono text-slate-800">S/ {Number.parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mb-6 border-t border-slate-100 pt-4">
          <span className="text-[8px] tracking-[0.5em] uppercase text-[#b07d62] font-black italic">Total</span>
          <span className="text-2xl font-black tracking-tighter text-slate-900 font-sans">
            S/ {Number.parseFloat(pedido.total).toFixed(2)}
          </span>
        </div>

        <footer className="text-center opacity-50 text-[7px] tracking-[0.3em] uppercase leading-loose text-slate-400">
          Gracias por compartir la experiencia<br />
          Wayra Nikkei · Lima — Tokyo<br />
        </footer>
      </div>

      <div className="flex border-t border-slate-100 print:hidden shrink-0">
        <button type="button" onClick={() => globalThis.print()} className="flex-1 py-4.5 bg-slate-50 text-slate-700 text-[9px] tracking-[0.3em] uppercase font-black hover:bg-[#b07d62] hover:text-white transition-all duration-300 border-r border-slate-100 flex items-center justify-center gap-1">
          🖨️ Imprimir
        </button>
        <button type="button" onClick={onClose} className="flex-1 py-4.5 bg-slate-50 text-rose-600 text-[9px] tracking-[0.3em] uppercase font-black hover:bg-rose-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-1">
          ✕ Liberar Mesa
        </button>
      </div>
    </div>
  );
}

Step3Boleta.propTypes = {
  pedido: PropTypes.shape({
    id_pedido: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id_producto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        cantidad: PropTypes.number,
        nombre: PropTypes.string,
        producto: PropTypes.string,
        subtotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
  }).isRequired,
  tipoDoc: PropTypes.string.isRequired,
  nombre: PropTypes.string.isRequired,
  documento: PropTypes.string.isRequired,
  direccion: PropTypes.string.isRequired,
  metodoPago: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

ModalCheckout.propTypes = {
  pedido: PropTypes.shape({
    id_pedido: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    id_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id_producto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        cantidad: PropTypes.number,
        nombre: PropTypes.string,
        producto: PropTypes.string,
        subtotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
  }).isRequired,
  reservas: PropTypes.arrayOf(
    PropTypes.shape({
      id_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      dni_cliente: PropTypes.string,
      nombre_cliente: PropTypes.string,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};