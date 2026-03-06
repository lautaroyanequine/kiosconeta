// ════════════════════════════════════════════════════════════════════════════
// HOOK: useCart (Manejo del carrito de compras)
// ════════════════════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { calcularSubtotal, calcularTotal } from '@/utils/helpers';
import type { ItemCarrito, Carrito, ProductoSimple } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// HOOK
// ────────────────────────────────────────────────────────────────────────────

export const useCart = () => {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [metodoPagoId, setMetodoPagoId] = useState<number | undefined>();
  const [descuento, setDescuento] = useState(0);

  // ──────────────────────────────────────────────────────────────────────────
  // AGREGAR AL CARRITO
  // ──────────────────────────────────────────────────────────────────────────

  const addItem = (producto: ProductoSimple) => {
    setItems((prevItems) => {
      // Si ya existe, incrementar cantidad
      const existingItem = prevItems.find(
        (item) => item.productoId === producto.productoId
      );

      if (existingItem) {
        // Verificar stock
        if (existingItem.cantidad >= existingItem.stock) {
          alert('No hay stock suficiente');
          return prevItems;
        }

        return prevItems.map((item) =>
          item.productoId === producto.productoId
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: calcularSubtotal(item.precioUnitario, item.cantidad + 1),
              }
            : item
        );
      }

      // Si no existe, agregar nuevo
      return [
        ...prevItems,
        {
          productoId: producto.productoId,
          nombre: producto.nombre,
          precioUnitario: producto.precioVenta,
          cantidad: 1,
          subtotal: producto.precioVenta,
          stock: producto.stock,
        },
      ];
    });
  };

  // ──────────────────────────────────────────────────────────────────────────
  // QUITAR DEL CARRITO
  // ──────────────────────────────────────────────────────────────────────────

  const removeItem = (productoId: number) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.productoId !== productoId)
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ACTUALIZAR CANTIDAD
  // ──────────────────────────────────────────────────────────────────────────

  const updateQuantity = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productoId === productoId) {
          // Verificar stock
          if (cantidad > item.stock) {
            alert('No hay stock suficiente');
            return item;
          }

          return {
            ...item,
            cantidad,
            subtotal: calcularSubtotal(item.precioUnitario, cantidad),
          };
        }
        return item;
      })
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // INCREMENTAR/DECREMENTAR
  // ──────────────────────────────────────────────────────────────────────────

  const incrementQuantity = (productoId: number) => {
    const item = items.find((i) => i.productoId === productoId);
    if (item) {
      updateQuantity(productoId, item.cantidad + 1);
    }
  };

  const decrementQuantity = (productoId: number) => {
    const item = items.find((i) => i.productoId === productoId);
    if (item) {
      updateQuantity(productoId, item.cantidad - 1);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // LIMPIAR CARRITO
  // ──────────────────────────────────────────────────────────────────────────

  const clearCart = () => {
    setItems([]);
    setMetodoPagoId(undefined);
    setDescuento(0);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // CALCULAR TOTALES
  // ──────────────────────────────────────────────────────────────────────────

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [items]);

  const total = useMemo(() => {
    return calcularTotal(subtotal, descuento, true);
  }, [subtotal, descuento]);

  // ──────────────────────────────────────────────────────────────────────────
  // CARRITO COMPLETO
  // ──────────────────────────────────────────────────────────────────────────

  const carrito: Carrito = {
    items,
    subtotal,
    descuento,
    total,
    metodoPagoId,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // VALIDAR CARRITO
  // ──────────────────────────────────────────────────────────────────────────

  const isValid = items.length > 0 && metodoPagoId !== undefined;

  // ──────────────────────────────────────────────────────────────────────────
  // RETURN
  // ──────────────────────────────────────────────────────────────────────────

  return {
    // Estado
    carrito,
    items,
    metodoPagoId,
    descuento,
    subtotal,
    total,
    isValid,

    // Acciones
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    setMetodoPagoId,
    setDescuento,
  };
};
