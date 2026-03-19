/// ════════════════════════════════════════════════════════════════════════════
// PAGE: POS (Punto de Venta)
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, CreditCard, DollarSign, Smartphone } from 'lucide-react';
import { Button, Input, Badge, LoadingOverlay, Card } from '@/components/commons';
import { ProductCard } from './ProductCard';
import { CartItem } from './CartItem';
import { VentaConfirmModal } from './VentaConfirmModal';
import { useCart } from './useCart';
import { useAuth } from '@/contexts/AuthContext';
import { productosApi, ventasApi, metodosPagoApi } from '@/apis';
import { formatCurrency } from '@/utils/formatters';
import { debounce } from '@/utils/helpers';
import type { ProductoSimple, MetodoPago } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

const POSPage= () => {
  const { user } = useAuth();
  const cart = useCart();

  // State: Productos
  const [productos, setProductos] = useState<ProductoSimple[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<ProductoSimple[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [isLoadingProductos, setIsLoadingProductos] = useState(true);

  // State: Métodos de pago
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [isLoadingMetodos, setIsLoadingMetodos] = useState(true);

  // State: Venta
  const [isProcessing, setIsProcessing] = useState(false);
  const [ventaConfirmada, setVentaConfirmada] = useState<{
    ventaId: number;
    total: number;
    metodoPago: string;
  } | null>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // CARGAR DATOS INICIALES
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadProductos();
    loadMetodosPago();
  }, []);

  const loadProductos = async () => {
    try {
      if (!user?.kioscoId) return;
      const data = await productosApi.getActivos(user.kioscoId);
      setProductos(data);
      setProductosFiltrados(data.slice(0, 6));
    } catch (error: any) {
      console.error('Error al cargar productos:', error);
    } finally {
      setIsLoadingProductos(false);
    }
  };

  const loadMetodosPago = async () => {
    try {
      const data = await metodosPagoApi.getActivos();
      setMetodosPago(data);
    } catch (error: any) {
      console.error('Error al cargar métodos de pago:', error);
    } finally {
      setIsLoadingMetodos(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // BUSCAR PRODUCTOS
  // ──────────────────────────────────────────────────────────────────────────

  const handleSearch = debounce((value: string) => {
    const query = value.toLowerCase().trim();

    if (!query) {
      setProductosFiltrados(productos.slice(0, 6));
      return;
    }

    const filtered = productos.filter((p) =>
      p.nombre.toLowerCase().includes(query)
    );
    setProductosFiltrados(filtered.slice(0, 8));
  }, 300);

  useEffect(() => {
    handleSearch(busqueda);
  }, [busqueda]);

  // ──────────────────────────────────────────────────────────────────────────
  // PROCESAR VENTA
  // ──────────────────────────────────────────────────────────────────────────

  const handleCobrar = async () => {
    if (!cart.isValid || !user) {
      alert('Completá todos los campos');
      return;
    }

    setIsProcessing(true);

    try {
      // Preparar productos para el backend
      const productos = cart.items.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
      }));

      // Crear venta
      const venta = await ventasApi.create({
        empleadoId: user.empleadoId,
        metodoPagoId: cart.metodoPagoId!,
        turnoId: 1,   // TODO: obtener turnoId real del turno abierto
        productos,
      });

      // Obtener nombre del método de pago
      const metodoPago = metodosPago.find(
        (m) => m.metodoDePagoID === cart.metodoPagoId
      );

      // Mostrar confirmación
      setVentaConfirmada({
        ventaId: venta.ventaId,
        total: cart.total,
        metodoPago: metodoPago?.nombre || 'Desconocido',
      });

      // Limpiar carrito
      cart.clearCart();
      setBusqueda('');
    } catch (error: any) {
      alert(error.message || 'Error al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: LOADING
  // ──────────────────────────────────────────────────────────────────────────

  if (isLoadingProductos || isLoadingMetodos) {
    return <LoadingOverlay message="Cargando punto de venta..." />;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Punto de Venta</h1>
            <p className="text-sm text-neutral-500">
              Empleado: {user?.nombre}
            </p>
          </div>
          <Badge variant="success" className="text-sm">
            Sistema activo
          </Badge>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL IZQUIERDO: Productos (60%) */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {/* Búsqueda */}
          <div className="mb-6">
            <Input
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              leftIcon={<Search size={20} />}
              autoFocus
            />
          </div>

          {/* Resultados de búsqueda o productos frecuentes */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">
              {busqueda ? 'Resultados' : 'Productos Frecuentes'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {productosFiltrados.map((producto) => (
                <ProductCard
                  key={producto.productoId}
                  producto={producto}
                  onClick={cart.addItem}
                />
              ))}
            </div>

            {productosFiltrados.length === 0 && (
              <p className="text-center text-neutral-500 py-8">
                No se encontraron productos
              </p>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: Carrito (40%) */}
        <div className="w-[40%] bg-white border-l border-neutral-200 flex flex-col">
          {/* Header del carrito */}
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart size={24} className="text-primary" />
              <h2 className="text-xl font-bold text-neutral-900">Carrito</h2>
            </div>
            <p className="text-sm text-neutral-500">
              {cart.items.length} {cart.items.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>

          {/* Items del carrito */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">El carrito está vacío</p>
              </div>
            ) : (
              cart.items.map((item) => (
                <CartItem
                  key={item.productoId}
                  item={item}
                  onIncrement={() => cart.incrementQuantity(item.productoId)}
                  onDecrement={() => cart.decrementQuantity(item.productoId)}
                  onRemove={() => cart.removeItem(item.productoId)}
                />
              ))
            )}
          </div>

          {/* Footer: Totales y pago */}
          <div className="border-t border-neutral-200 p-6 space-y-4">
            {/* Botón limpiar */}
            {cart.items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={cart.clearCart}
              >
                Limpiar carrito
              </Button>
            )}

            {/* Totales */}
            <div className="space-y-2 py-4 border-y border-neutral-200">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Descuento</span>
                <span>{formatCurrency(cart.descuento)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-primary pt-2">
                <span>TOTAL</span>
                <span>{formatCurrency(cart.total)}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <p className="text-sm font-semibold text-neutral-700 mb-3">
                Método de Pago
              </p>
              <div className="grid grid-cols-2 gap-2">
                {metodosPago.map((metodo) => {
                  const isSelected = cart.metodoPagoId === metodo.metodoDePagoID;
                  const Icon = metodo.nombre.toLowerCase().includes('efectivo')
                    ? DollarSign
                    : metodo.nombre.toLowerCase().includes('crédito') || metodo.nombre.toLowerCase().includes('credito')
                    ? CreditCard
                    : Smartphone;

                  return (
                    <button
                      key={metodo.metodoDePagoID}
                      onClick={() => cart.setMetodoPagoId(metodo.metodoDePagoID)}
                      className={`p-3 rounded-lg border-2 transition-all
                        ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary'
                        }`}
                    >
                      <Icon size={20} className="mx-auto mb-1" />
                      <p className="text-xs font-medium">{metodo.nombre}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón COBRAR */}
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              disabled={!cart.isValid || isProcessing}
              loading={isProcessing}
              onClick={handleCobrar}
            >
              💰 COBRAR
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {ventaConfirmada && (
        <VentaConfirmModal
          isOpen={!!ventaConfirmada}
          onClose={() => setVentaConfirmada(null)}
          ventaId={ventaConfirmada.ventaId}
          total={ventaConfirmada.total}
          metodoPago={ventaConfirmada.metodoPago}
        />
      )}
    </div>
  );
};

export default POSPage;
