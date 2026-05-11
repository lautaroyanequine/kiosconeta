// ════════════════════════════════════════════════════════════════════════════
// HOOK: useCart — Carrito con detección automática de promociones
// ════════════════════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { calcularSubtotal } from '@/utils/helpers';
import { promocionesApi } from '@/apis/promocionesApi';
import type { ItemCarrito, ProductoSimple } from '@/types';
import type { PromocionAplicadaDTO } from '@/apis/promocionesApi';

// ────────────────────────────────────────────────────────────────────────────
// HOOK
// ────────────────────────────────────────────────────────────────────────────

export const useCart = (kioscoId?: number) => {
  const [items, setItems]           = useState<ItemCarrito[]>([]);
  const [metodoPagoId, setMetodoPagoId] = useState<number | undefined>();

  // Promos
  const [promosAplicadas, setPromosAplicadas]     = useState<PromocionAplicadaDTO[]>([]);
  const [totalDescuento, setTotalDescuento]       = useState(0);
  const [detectandoPromos, setDetectandoPromos]   = useState(false);
  const detectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Detectar promos (debounced 500ms) ────────────────────────────────────

  const detectarPromos = useCallback(async (currentItems: ItemCarrito[]) => {
    if (!kioscoId || currentItems.length === 0) {
      setPromosAplicadas([]);
      setTotalDescuento(0);
      return;
    }
    setDetectandoPromos(true);
    try {
      const resultado = await promocionesApi.detectar(
        kioscoId,
        currentItems.map(i => ({
          productoId:     i.productoId,
          cantidad:       i.cantidad,
          precioUnitario: i.precioUnitario,
        }))
      );
      setPromosAplicadas(resultado.promocionesAplicadas);
      setTotalDescuento(resultado.totalDescuento);
    } catch {
      setPromosAplicadas([]);
      setTotalDescuento(0);
    } finally {
      setDetectandoPromos(false);
    }
  }, [kioscoId]);

  // Cada vez que cambian los items, re-detectar con debounce
  useEffect(() => {
    if (detectTimer.current) clearTimeout(detectTimer.current);
    if (items.length === 0) {
      setPromosAplicadas([]);
      setTotalDescuento(0);
      return;
    }
    detectTimer.current = setTimeout(() => detectarPromos(items), 500);
    return () => { if (detectTimer.current) clearTimeout(detectTimer.current); };
  }, [items, detectarPromos]);

  // ── Agregar ───────────────────────────────────────────────────────────────

  const addItem = (producto: ProductoSimple) => {
    setItems(prev => {
      const existing = prev.find(i => i.productoId === producto.productoId);
      if (existing) {
        if (existing.cantidad >= existing.stock) {
          alert('No hay stock suficiente');
          return prev;
        }
        return prev.map(i =>
          i.productoId === producto.productoId
            ? { ...i, cantidad: i.cantidad + 1, subtotal: calcularSubtotal(i.precioUnitario, i.cantidad + 1) }
            : i
        );
      }
      return [...prev, {
        productoId:     producto.productoId,
        nombre:         producto.nombre,
        precioUnitario: producto.precioVenta,
        cantidad:       1,
        subtotal:       producto.precioVenta,
        stock:          producto.stock,
      }];
    });
  };

  // ── Quitar ────────────────────────────────────────────────────────────────

  const removeItem = (productoId: number) => {
    setItems(prev => prev.filter(i => i.productoId !== productoId));
  };

  // ── Actualizar cantidad ───────────────────────────────────────────────────

  const updateQuantity = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) { removeItem(productoId); return; }
    setItems(prev => prev.map(i => {
      if (i.productoId !== productoId) return i;
      if (cantidad > i.stock) { alert('No hay stock suficiente'); return i; }
      return { ...i, cantidad, subtotal: calcularSubtotal(i.precioUnitario, cantidad) };
    }));
  };

  const incrementQuantity = (productoId: number) => {
    const item = items.find(i => i.productoId === productoId);
    if (item) updateQuantity(productoId, item.cantidad + 1);
  };

  const decrementQuantity = (productoId: number) => {
    const item = items.find(i => i.productoId === productoId);
    if (item) updateQuantity(productoId, item.cantidad - 1);
  };

  // ── Limpiar ───────────────────────────────────────────────────────────────

  const clearCart = () => {
    setItems([]);
    setMetodoPagoId(undefined);
    setPromosAplicadas([]);
    setTotalDescuento(0);
  };

  // ── Totales ───────────────────────────────────────────────────────────────

  const subtotal = useMemo(() =>
    items.reduce((sum, i) => sum + i.subtotal, 0)
  , [items]);

  const total = useMemo(() =>
    Math.max(0, subtotal - totalDescuento)
  , [subtotal, totalDescuento]);

  const isValid = items.length > 0 && metodoPagoId !== undefined;

  return {
    // Estado
    items,
    metodoPagoId,
    subtotal,
    descuento: totalDescuento,
    total,
    isValid,

    // Promos
    promosAplicadas,
    totalDescuento,
    detectandoPromos,

    // Acciones
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    setMetodoPagoId,
  };
};
