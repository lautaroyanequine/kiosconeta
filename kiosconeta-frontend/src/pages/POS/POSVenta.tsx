// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: POSVenta — POS con detección automática de promociones
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Search, ShoppingCart, DollarSign, Smartphone,
  CreditCard, Trash2, Plus, Minus, CheckCircle2,
  Barcode, Package, Clock, Tag, Loader2
} from 'lucide-react';
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext';
import { productosApi, ventasApi, metodosPagoApi, auditoriaApi } from '@/apis';
import { formatCurrency } from '@/utils/formatters';
import { debounce, getStorage } from '@/utils/helpers';
import { STORAGE_KEYS } from '@/utils/constants';
import { useCart } from './useCart';
import type { ProductoSimple, MetodoPago } from '@/types';
import type { TurnoActual } from '@/types/gastoTurno';

interface POSVentaProps {
  turnoActual: TurnoActual;
  onTurnoActualizado: () => void;
}

const getMetodoIcon = (nombre: string) => {
  const n = nombre.toLowerCase();
  if (n.includes('efectivo'))                               return DollarSign;
  if (n.includes('débito') || n.includes('debito'))         return CreditCard;
  if (n.includes('transferencia') || n.includes('mercado')) return Smartphone;
  return CreditCard;
};

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════

export const POSVenta: React.FC<POSVentaProps> = ({ turnoActual, onTurnoActualizado }) => {
  const { empleadoActivo: user } = useEmpleadoActivo();
  const { empleadoActivo } = useEmpleadoActivo();

  // Pasar kioscoId al hook para detección de promos
  const cart = useCart(empleadoActivo?.kioscoId ?? user?.kioscoId);

  // Productos
  const [productos, setProductos]                   = useState<ProductoSimple[]>([]);
  // productosFiltrados calculado con useMemo — sin estado separado que cause race condition
  const [busqueda, setBusqueda]                     = useState('');
  const [categoriaActiva, setCategoriaActiva]       = useState('todas');
  const [isLoadingProductos, setIsLoadingProductos] = useState(true);

  // Métodos de pago
  const [metodosPago, setMetodosPago]           = useState<MetodoPago[]>([]);
  const [isLoadingMetodos, setIsLoadingMetodos] = useState(true);

  // Venta
  const [isProcessing, setIsProcessing] = useState(false);
  const [ventaConfirmada, setVentaConfirmada] = useState<{
    ventaId: number; total: number; metodoPago: string; vuelto?: number;
    descuento?: number;
  } | null>(null);

  // Efectivo / vuelto
  const [montoEfectivo, setMontoEfectivo] = useState('');

  // Scanner
  const [ultimoCodigo, setUltimoCodigo]     = useState('');
  const [codigoFeedback, setCodigoFeedback] = useState<'ok' | 'error' | null>(null);

  // Refs
  const busquedaRef = useRef<HTMLInputElement>(null);
  const efectivoRef = useRef<HTMLInputElement>(null);
  const lastKeyTime = useRef(0);
  const scanBuffer  = useRef('');
  const scanTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cargar datos ──────────────────────────────────────────────────────────

  useEffect(() => {
    loadProductos();
    loadMetodosPago();
    busquedaRef.current?.focus();
  }, []);

  const loadProductos = async () => {
    try {
      const data = await productosApi.getActivos((empleadoActivo?.kioscoId ?? user?.kioscoId)!);
      setProductos(data);
    } catch (err) { console.error(err); }
    finally { setIsLoadingProductos(false); }
  };

  const loadMetodosPago = async () => {
    try {
      const data = await metodosPagoApi.getActivos();
      setMetodosPago(data);
      const efectivo = data.find((m: MetodoPago) => m.nombre.toLowerCase().includes('efectivo'));
      if (efectivo) cart.setMetodoPagoId(efectivo.metodoDePagoID);
    } catch (err) { console.error(err); }
    finally { setIsLoadingMetodos(false); }
  };

  // ── Categorías ────────────────────────────────────────────────────────────

  const categorias = useMemo(() =>
    [...new Set(productos.map(p => p.categoria).filter(Boolean))].sort()
  , [productos]);

  // ── Filtrar (useMemo — sin estado separado) ──────────────────────────────

  const productosFiltrados = useMemo(() => {
    let r = [...productos];
    if (categoriaActiva !== 'todas') r = r.filter(p => p.categoria === categoriaActiva);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      r = r.filter(p => p.nombre.toLowerCase().includes(q));
    }
    return r.slice(0, 24); // mostrar hasta 24 productos
  }, [productos, busqueda, categoriaActiva]);

  // ── Scanner ───────────────────────────────────────────────────────────────

  const buscarPorCodigo = useCallback(async (codigo: string) => {
    setUltimoCodigo(codigo);
    try {
      const local = productos.find(p => (p as any).codigoBarra === codigo);
      if (local) { cart.addItem(local); setCodigoFeedback('ok'); }
      else {
        const remoto = await productosApi.getByCodigoBarra(codigo);
        if (remoto) { cart.addItem(remoto); setCodigoFeedback('ok'); }
        else setCodigoFeedback('error');
      }
    } catch { setCodigoFeedback('error'); }
    finally { setTimeout(() => setCodigoFeedback(null), 1500); }
  }, [productos, cart]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const now  = Date.now();
    const diff = now - lastKeyTime.current;
    lastKeyTime.current = now;

    if (document.activeElement === efectivoRef.current) return;

    if (e.key === 'Enter') {
      if (scanBuffer.current.length >= 4) {
        e.preventDefault();
        buscarPorCodigo(scanBuffer.current);
        scanBuffer.current = '';
        return;
      }
      if (busqueda.trim() && productosFiltrados.length > 0) {
        e.preventDefault();
        cart.addItem(productosFiltrados[0]);
        setBusqueda('');
        busquedaRef.current?.focus();
      }
      scanBuffer.current = '';
      return;
    }

    if (e.key === 'F1')  { e.preventDefault(); if (cart.isValid && !isProcessing) handleCobrar(); return; }
    if (e.key === 'F2')  { e.preventDefault(); handleLimpiarCarrito(); return; }
    if (e.key === 'Escape') { e.preventDefault(); setBusqueda(''); busquedaRef.current?.focus(); return; }

    if (diff < 50 && e.key.length === 1) {
      scanBuffer.current += e.key;
      if (scanTimer.current) clearTimeout(scanTimer.current);
      scanTimer.current = setTimeout(() => { scanBuffer.current = ''; }, 200);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
      busquedaRef.current?.focus();
    }
  }, [busqueda, productosFiltrados, cart, isProcessing]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Vuelto ────────────────────────────────────────────────────────────────

  const metodoPagoSeleccionado = metodosPago.find(m => m.metodoDePagoID === cart.metodoPagoId);
  const esEfectivo = metodoPagoSeleccionado?.nombre.toLowerCase().includes('efectivo');

  const vuelto = useMemo(() => {
    const monto = parseFloat(montoEfectivo);
    if (!isNaN(monto) && monto > 0) return monto - cart.total;
    return null;
  }, [montoEfectivo, cart.total]);

  // ── Limpiar carrito con auditoría ─────────────────────────────────────────

  const handleLimpiarCarrito = useCallback(async () => {
    if (user && cart.items.length > 0) {
      const total = cart.items.reduce((s, i) => s + i.subtotal, 0);
      await auditoriaApi.registrarCarritoLimpiado(
        user.empleadoId, user.kioscoId, total, cart.items.length
      );
    }
    cart.clearCart();
    setMontoEfectivo('');
  }, [cart, user]);

  // ── Cobrar ────────────────────────────────────────────────────────────────

  const handleCobrar = useCallback(async () => {
    if (!cart.isValid || !user) return;
    if (esEfectivo && montoEfectivo) {
      const monto = parseFloat(montoEfectivo);
      if (!isNaN(monto) && monto < cart.total) {
        alert('El monto ingresado es menor al total');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const venta = await ventasApi.create({
        empleadoId:   empleadoActivo?.empleadoId ?? user?.empleadoId,
        metodoPagoId: cart.metodoPagoId!,
        turnoId:      getStorage<number>(STORAGE_KEYS.TURNO_ID) ?? turnoActual.turnoId,
        productos:    cart.items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad })),
        descuento:    cart.totalDescuento > 0 ? cart.totalDescuento : undefined,
      });

      setVentaConfirmada({
        ventaId:    venta.ventaId,
        total:      cart.total,
        metodoPago: metodoPagoSeleccionado?.nombre || '',
        vuelto:     esEfectivo && vuelto !== null && vuelto >= 0 ? vuelto : undefined,
        descuento:  cart.totalDescuento > 0 ? cart.totalDescuento : undefined,
      });

      cart.clearCart();
      setMontoEfectivo('');
      setBusqueda('');
      onTurnoActualizado();
    } catch (err: any) {
      alert(err.message || 'Error al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  }, [cart, user, turnoActual, esEfectivo, montoEfectivo, vuelto, metodoPagoSeleccionado, onTurnoActualizado]);

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoadingProductos || isLoadingMetodos) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Cargando punto de venta...</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-neutral-100 overflow-hidden">

      {/* Barra superior */}
      <div className="bg-white border-b border-neutral-200 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-primary">Punto de Venta</h1>
          <span className="text-sm text-neutral-500">{user?.nombre}</span>
          <span className="flex items-center gap-1.5 text-xs bg-success-50 text-success-700
                           px-2.5 py-1 rounded-full font-medium">
            <Clock size={12} />
            Turno abierto — desde {turnoActual.fechaAperturaFormateada}
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-4 text-xs text-neutral-400">
          <span><kbd className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300 font-mono">F1</kbd> Cobrar</span>
          <span><kbd className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300 font-mono">F2</kbd> Limpiar</span>
          <span><kbd className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300 font-mono">Esc</kbd> Cancelar</span>
          <span><kbd className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300 font-mono">Enter</kbd> Agregar</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex overflow-hidden">

        {/* Panel izquierdo: Productos */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-white border-b border-neutral-200 space-y-1.5">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                ref={busquedaRef}
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o escanear código... (Enter para agregar)"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-neutral-300 text-sm
                           outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {ultimoCodigo && (
              <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg
                ${codigoFeedback === 'ok'    ? 'bg-success-50 text-success-700'
                : codigoFeedback === 'error' ? 'bg-danger-50 text-danger'
                : 'bg-neutral-50 text-neutral-500'}`}>
                <Barcode size={13} />
                {codigoFeedback === 'ok'    && `✓ Código ${ultimoCodigo} agregado`}
                {codigoFeedback === 'error' && `✗ Código ${ultimoCodigo} no encontrado`}
                {!codigoFeedback            && `Último código: ${ultimoCodigo}`}
              </div>
            )}

            {categorias.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {['todas', ...categorias].map(cat => (
                  <button key={cat} onClick={() => setCategoriaActiva(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all
                      ${categoriaActiva === cat
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                    {cat === 'todas' ? 'Todas' : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-300">
                <Package size={48} className="mb-3 opacity-30" />
                <p className="text-sm text-neutral-400">Sin resultados</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                {productosFiltrados.map(p => (
                  <ProductoCard key={p.productoId} producto={p} onClick={() => cart.addItem(p)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho: Carrito */}
        <div className="w-[480px] bg-white border-l border-neutral-200 flex flex-col shrink-0">

          {/* Header carrito */}
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary" />
              <span className="font-bold text-base text-neutral-800">Carrito</span>
              {cart.items.length > 0 && (
                <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cart.items.length}
                </span>
              )}
            </div>
            {cart.items.length > 0 && (
              <button onClick={handleLimpiarCarrito}
                className="text-xs text-neutral-400 hover:text-danger flex items-center gap-1">
                <Trash2 size={13} /> Limpiar
              </button>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-300">
                <ShoppingCart size={40} className="mb-3" />
                <p className="text-sm text-neutral-400">Carrito vacío</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {cart.items.map(item => (
                  <CartItemRow
                    key={item.productoId}
                    item={item}
                    onIncrement={() => cart.incrementQuantity(item.productoId)}
                    onDecrement={() => cart.decrementQuantity(item.productoId)}
                    onRemove={() => cart.removeItem(item.productoId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 p-4 space-y-3">

            {/* Promos aplicadas */}
            {cart.detectandoPromos && (
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Loader2 size={12} className="animate-spin" />
                Verificando promociones...
              </div>
            )}

            {cart.promosAplicadas.length > 0 && (
              <div className="bg-success-50 border border-success-200 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-semibold text-success-700 flex items-center gap-1.5">
                  <Tag size={12} />
                  ¡Promociones aplicadas!
                </p>
                {cart.promosAplicadas.map(p => (
                  <div key={p.promocionId} className="flex justify-between items-center">
                    <span className="text-xs text-success-600">{p.descripcion}</span>
                    <span className="text-xs font-bold text-success">-{formatCurrency(p.descuento)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between text-sm text-neutral-500">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>

            {cart.totalDescuento > 0 && (
              <div className="flex justify-between text-sm text-success font-medium">
                <span>Descuento promos</span>
                <span>-{formatCurrency(cart.totalDescuento)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pb-3 border-b border-neutral-100">
              <span className="text-xl font-bold text-neutral-900">TOTAL</span>
              <div className="text-right">
                {cart.totalDescuento > 0 && (
                  <p className="text-sm text-neutral-400 line-through">{formatCurrency(cart.subtotal)}</p>
                )}
                <span className="text-3xl font-bold text-primary">{formatCurrency(cart.total)}</span>
              </div>
            </div>

            {/* Métodos de pago */}
            <div>
              <p className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wide">Método de pago</p>
              <div className="grid grid-cols-3 gap-2">
                {metodosPago.map(m => {
                  const Icon = getMetodoIcon(m.nombre);
                  const sel  = cart.metodoPagoId === m.metodoDePagoID;
                  return (
                    <button key={m.metodoDePagoID}
                      onClick={() => { cart.setMetodoPagoId(m.metodoDePagoID); setMontoEfectivo(''); }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
                        ${sel ? 'border-primary bg-primary/5 text-primary'
                              : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'}`}>
                      <Icon size={20} />
                      <span className="text-xs font-medium text-center leading-tight">{m.nombre}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Efectivo + vuelto */}
            {esEfectivo && cart.items.length > 0 && (
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                  <input ref={efectivoRef} type="number" value={montoEfectivo}
                    onChange={e => setMontoEfectivo(e.target.value)}
                    placeholder="Monto recibido"
                    className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-neutral-300 text-sm
                               outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                {vuelto !== null && vuelto >= 0 && (
                  <div className="flex justify-between items-center bg-success-50 px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium text-success-700">Vuelto</span>
                    <span className="text-xl font-bold text-success">{formatCurrency(vuelto)}</span>
                  </div>
                )}
                {vuelto !== null && vuelto < 0 && (
                  <div className="flex justify-between items-center bg-danger-50 px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium text-danger-700">Falta</span>
                    <span className="text-xl font-bold text-danger">{formatCurrency(Math.abs(vuelto))}</span>
                  </div>
                )}
              </div>
            )}

            {/* Botón cobrar */}
            <button onClick={handleCobrar} disabled={!cart.isValid || isProcessing || cart.detectandoPromos}
              className={`w-full py-3.5 rounded-xl font-bold text-base transition-all
                flex items-center justify-center gap-2
                ${cart.isValid && !isProcessing && !cart.detectandoPromos
                  ? 'bg-primary text-white hover:bg-primary-600 active:scale-[0.98] shadow-lg shadow-primary/20'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}>
              {isProcessing
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Procesando...</>
                : <>💰 COBRAR <kbd className="text-xs opacity-50 font-mono">F1</kbd></>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Modal venta confirmada */}
      {ventaConfirmada && (
        <VentaModal
          data={ventaConfirmada}
          onClose={() => { setVentaConfirmada(null); busquedaRef.current?.focus(); }}
        />
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTES
// ════════════════════════════════════════════════════════════════════════════

const ProductoCard: React.FC<{ producto: ProductoSimple; onClick: () => void }> = ({ producto, onClick }) => {
  const sinStock  = producto.stock === 0;
  const stockBajo = !sinStock && producto.stock < 10;

  return (
    <button onClick={onClick} disabled={sinStock}
      className={`relative w-full bg-white rounded-xl p-4 text-left border-2 transition-all group
        ${sinStock ? 'border-neutral-100 opacity-40 cursor-not-allowed'
                   : 'border-neutral-200 hover:border-primary hover:shadow-md active:scale-[0.97]'}`}>
      {(stockBajo || sinStock) && (
        <span className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full font-medium
          ${sinStock ? 'bg-danger-100 text-danger' : 'bg-warning-100 text-warning-700'}`}>
          {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
        </span>
      )}
      <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary flex items-center
                      justify-center mb-3 transition-colors shrink-0">
        <span className="text-lg font-bold text-primary group-hover:text-white transition-colors">
          {producto.nombre.charAt(0).toUpperCase()}
        </span>
      </div>
      <p className="text-sm font-semibold text-neutral-800 line-clamp-2 min-h-[2.5rem] mb-1 leading-tight">{producto.nombre}</p>
      <p className="text-xs text-neutral-400 truncate mb-2">{producto.categoria}</p>
      <p className="text-lg font-bold text-primary">{formatCurrency(producto.precioVenta)}</p>
    </button>
  );
};

const CartItemRow: React.FC<{
  item: any; onIncrement: () => void; onDecrement: () => void; onRemove: () => void;
}> = ({ item, onIncrement, onDecrement, onRemove }) => (
  <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-neutral-800 truncate">{item.nombre}</p>
      <p className="text-xs text-neutral-400 mt-0.5">{formatCurrency(item.precioUnitario)} c/u</p>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={onDecrement}
        className="w-7 h-7 rounded-full border-2 border-neutral-200 flex items-center justify-center
                   text-neutral-400 hover:border-primary hover:text-primary transition-all active:scale-90">
        <Minus size={12} />
      </button>
      <span className="w-8 text-center text-base font-bold text-neutral-800">{item.cantidad}</span>
      <button onClick={onIncrement} disabled={item.cantidad >= item.stock}
        className="w-7 h-7 rounded-full border-2 border-neutral-200 flex items-center justify-center
                   text-neutral-400 hover:border-primary hover:text-primary transition-all active:scale-90
                   disabled:opacity-30 disabled:cursor-not-allowed">
        <Plus size={12} />
      </button>
    </div>
    <span className="text-base font-bold text-neutral-800 w-24 text-right">{formatCurrency(item.subtotal)}</span>
    <button onClick={onRemove} className="text-neutral-300 hover:text-danger transition-colors ml-1">
      <Trash2 size={15} />
    </button>
  </div>
);

const VentaModal: React.FC<{
  data: { ventaId: number; total: number; metodoPago: string; vuelto?: number; descuento?: number };
  onClose: () => void;
}> = ({ data, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-2xl text-center w-80">
        <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={36} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">¡Venta registrada!</h2>
        <p className="text-sm text-neutral-500 mb-4">#{data.ventaId} · {data.metodoPago}</p>
        {data.descuento && data.descuento > 0 && (
          <div className="mb-2 bg-success-50 rounded-xl px-4 py-2">
            <p className="text-xs text-success-600">🎉 Descuento aplicado: {formatCurrency(data.descuento)}</p>
          </div>
        )}
        <p className="text-4xl font-bold text-primary mb-2">{formatCurrency(data.total)}</p>
        {data.vuelto !== undefined && data.vuelto > 0 && (
          <div className="mt-3 bg-success-50 rounded-xl px-4 py-3">
            <p className="text-sm text-success-700">Vuelto al cliente</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(data.vuelto)}</p>
          </div>
        )}
        <button onClick={onClose}
          className="mt-5 w-full py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-600">
          Nueva venta
        </button>
        <p className="text-xs text-neutral-400 mt-2">Se cierra en 4 segundos</p>
      </div>
    </div>
  );
};
