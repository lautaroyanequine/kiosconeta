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
import { useCart } from '@/hooks/useCart';
import { promocionesApi } from '@/apis/promocionesApi';
import type { PromocionResponseDTO, PromocionAplicadaDTO } from '@/apis/promocionesApi';
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
  const [combosVirtuales, setCombosVirtuales]       = useState<(ProductoSimple & { esCombo: true; promocionId: number; productosCombo: { productoId: number; nombre: string; cantidad: number }[] })[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<ProductoSimple[]>([]);
  const [busqueda, setBusqueda]                     = useState('');
  const [categoriaActiva, setCategoriaActiva]       = useState('todas');
  const [isLoadingProductos, setIsLoadingProductos] = useState(true);
  // Modal de selección de combo
  const [comboModal, setComboModal] = useState<{ combo: typeof combosVirtuales[0]; cantidades: Record<number, number> } | null>(null);

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
    const kioscoId = (empleadoActivo?.kioscoId ?? user?.kioscoId)!;
    try {
      const [data, promos] = await Promise.all([
        productosApi.getActivos(kioscoId),
        promocionesApi.getByKiosco(kioscoId).catch(() => [] as PromocionResponseDTO[]),
      ]);

      // Convertir combos activos en ítems virtuales seleccionables
      const combos = promos
        .filter(p => p.tipo === 1 && p.activa && p.precioCombo != null && p.productos?.length >= 2)
        .map(p => ({
          productoId:    -p.promocionId,
          nombre:        p.nombre,
          precioVenta:   p.precioCombo!,
          stock:         999,
          categoria:     'Combo',
          esCombo:       true as const,
          promocionId:   p.promocionId,
          productosCombo: p.productos.map(pp => ({
            productoId: pp.productoId,
            nombre:     pp.productoNombre,
            cantidad:   pp.cantidad,
          })),
        }));

      setCombosVirtuales(combos);
      setProductos(data);
      setProductosFiltrados([...(combos as any[]), ...data].slice(0, 12));
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

  // ── Filtrar ───────────────────────────────────────────────────────────────

  const filtrarProductos = useCallback((query: string, cat: string) => {
    const q = query.trim().toLowerCase();
    // Combos: siempre visibles en "todas", también en búsqueda de texto
    const combosVisibles = cat === 'todas'
      ? (q ? combosVirtuales.filter(c => c.nombre.toLowerCase().includes(q)) : combosVirtuales)
      : [];
    let prods = [...productos];
    if (cat !== 'todas') prods = prods.filter(p => p.categoria === cat);
    if (q) prods = prods.filter(p => p.nombre.toLowerCase().includes(q));
    // Combos primero, luego productos
    setProductosFiltrados([...(combosVisibles as any[]), ...prods].slice(0, 12));
  }, [productos, combosVirtuales]);

  const debouncedFilter = useMemo(
    () => debounce((q: string, c: string) => filtrarProductos(q, c), 300),
    [filtrarProductos]
  );

  useEffect(() => { debouncedFilter(busqueda, categoriaActiva); }, [busqueda, categoriaActiva]);

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
        {/* CORRECCIÓN 1: Buscador de productos */}
        <Search 
          size={16} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10 pointer-events-none" 
        />
        <input
          ref={busquedaRef}
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o escanear código... (Enter para agregar)"
          style={{ paddingLeft: '2.5rem' }} // Forzamos espacio para la lupa
          className="w-full pr-4 py-2.5 rounded-lg border border-neutral-300 text-sm
                     outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* ... (resto del código de feedback y categorías sin cambios) ... */}
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

    {/* ... (Grilla de productos sin cambios) ... */}
    <div className="flex-1 overflow-y-auto p-2">
      {productosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-neutral-300">
          <Package size={48} className="mb-3 opacity-30" />
          <p className="text-sm text-neutral-400">Sin resultados</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
          {productosFiltrados.map(p => {
            const esCombo = (p as any).esCombo === true;
            return (
              <ProductoCard
                key={p.productoId}
                producto={p}
                isCombo={esCombo}
                onClick={() => {
                  if (esCombo) {
                    const combo = combosVirtuales.find(c => c.productoId === p.productoId)!;
                    setComboModal({
                      combo,
                      cantidades: Object.fromEntries(combo.productosCombo.map(pc => [pc.productoId, pc.cantidad])),
                    });
                  } else {
                    cart.addItem(p);
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  </div>

  {/* Panel derecho: Carrito */}
  <div className="w-[480px] bg-white border-l border-neutral-200 flex flex-col shrink-0">
    {/* ... (Header e Items del carrito sin cambios) ... */}
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

    {/* Footer del Carrito */}
    <div className="border-t border-neutral-200 p-4 space-y-3">
      {/* ... (Subtotal, Descuentos y Métodos de Pago) ... */}
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

      {/* Efectivo + vuelto */}
      {esEfectivo && cart.items.length > 0 && (
        <div className="space-y-2">
          <div className="relative">
            {/* CORRECCIÓN 2: Símbolo de peso en el monto de efectivo */}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm z-10 pointer-events-none">$</span>
            <input 
              ref={efectivoRef} 
              type="number" 
              value={montoEfectivo}
              onChange={e => setMontoEfectivo(e.target.value)}
              placeholder="Monto recibido"
              style={{ paddingLeft: '1.7rem' }} // Forzamos espacio para el "$"
              className="w-full pr-4 py-2.5 rounded-lg border border-neutral-300 text-sm
                         outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" 
            />
          </div>
          {/* ... (Vuelto y Botón Cobrar) ... */}
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

      {/* Modal de selección de combo */}
      {comboModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setComboModal(null)}>
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-96 max-w-[90vw]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Tag size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-base leading-tight">{comboModal.combo.nombre}</h3>
                <p className="text-xs text-blue-500">Combo · {formatCurrency(comboModal.combo.precioVenta)}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-400 mb-4 mt-1">
              Ajustá las cantidades de cada componente antes de agregar al carrito.
            </p>
            <div className="space-y-3 mb-5">
              {comboModal.combo.productosCombo.map(pc => {
                const qty = comboModal.cantidades[pc.productoId] ?? pc.cantidad;
                const prod = productos.find(p => p.productoId === pc.productoId);
                const sinStock = prod && prod.stock < qty;
                return (
                  <div key={pc.productoId}
                    className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-800 text-sm leading-tight">{pc.nombre}</p>
                      {prod && (
                        <p className={`text-xs mt-0.5 ${sinStock ? 'text-red-500' : 'text-neutral-400'}`}>
                          Stock: {prod.stock}{sinStock && ' · insuficiente'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setComboModal(prev => prev && ({
                          ...prev,
                          cantidades: { ...prev.cantidades, [pc.productoId]: Math.max(1, qty - 1) }
                        }))}
                        className="w-7 h-7 rounded-full border-2 border-neutral-200 flex items-center justify-center text-neutral-400 hover:border-primary hover:text-primary transition-all">
                        <Minus size={11} />
                      </button>
                      <span className="w-7 text-center font-bold text-neutral-800">{qty}</span>
                      <button
                        onClick={() => setComboModal(prev => prev && ({
                          ...prev,
                          cantidades: { ...prev.cantidades, [pc.productoId]: qty + 1 }
                        }))}
                        className="w-7 h-7 rounded-full border-2 border-neutral-200 flex items-center justify-center text-neutral-400 hover:border-primary hover:text-primary transition-all">
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setComboModal(null)}
                className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                Cancelar
              </button>
              <button
                onClick={() => {
                  comboModal.combo.productosCombo.forEach(pc => {
                    const prod = productos.find(p => p.productoId === pc.productoId);
                    if (!prod) return;
                    const qty = comboModal.cantidades[pc.productoId] ?? pc.cantidad;
                    for (let i = 0; i < qty; i++) cart.addItem(prod);
                  });
                  setComboModal(null);
                }}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-[0.97] transition-all">
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}

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

const ProductoCard: React.FC<{ producto: ProductoSimple; isCombo?: boolean; onClick: () => void }> = ({ producto, isCombo, onClick }) => {
  const sinStock  = producto.stock === 0 && !isCombo;
  const stockBajo = !sinStock && !isCombo && producto.stock > 0 && producto.stock < 10;

  return (
    <button onClick={onClick} disabled={sinStock}
      className={`relative w-full bg-white rounded-xl p-3 text-left border-2 transition-all group flex flex-col gap-1.5
        ${sinStock  ? 'border-neutral-100 opacity-40 cursor-not-allowed'
        : isCombo   ? 'border-blue-200 hover:border-blue-400 hover:shadow-md active:scale-[0.97]'
                    : 'border-neutral-200 hover:border-primary hover:shadow-md active:scale-[0.97]'}`}>

      {/* Icono + badge de stock (arriba) */}
      <div className="flex items-center justify-between gap-1">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors
          ${isCombo ? 'bg-blue-100 group-hover:bg-blue-500' : 'bg-primary/10 group-hover:bg-primary'}`}>
          {isCombo
            ? <Tag     size={18} className="text-blue-600  group-hover:text-white transition-colors" />
            : <Package size={18} className="text-primary   group-hover:text-white transition-colors" />}
        </div>
        {isCombo && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
            Combo
          </span>
        )}
        {!isCombo && sinStock && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-500">
            Sin stock
          </span>
        )}
        {!isCombo && stockBajo && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">
            {producto.stock}u
          </span>
        )}
      </div>

      {/* Nombre grande + cantidad al costado */}
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <p className="font-bold text-neutral-900 leading-tight line-clamp-2 flex-1" style={{ fontSize: '0.95rem' }}>
          {producto.nombre}
        </p>
        {!isCombo && !sinStock && !stockBajo && producto.stock < 50 && (
          <span className="text-[10px] text-neutral-300 shrink-0 tabular-nums">{producto.stock}u</span>
        )}
      </div>

      {/* Precio */}
      <p className={`text-base font-extrabold tracking-tight ${isCombo ? 'text-blue-600' : 'text-primary'}`}>
        {formatCurrency(producto.precioVenta)}
      </p>
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