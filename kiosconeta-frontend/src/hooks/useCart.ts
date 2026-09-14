// ════════════════════════════════════════════════════════════════════════════
// HOOK: useCart — Carrito con detección automática de promociones
// ════════════════════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { calcularSubtotal } from '@/utils/helpers';
import { promocionesApi } from '@/apis/promocionesApi';
import type { ItemCarrito, ProductoSimple } from '@/types';
import type { PromocionAplicadaDTO } from '@/apis/promocionesApi';

// Línea ya resuelta de un combo: qué producto puntual cubre cada componente
// (necesario cuando el componente del combo era "cualquier producto con tag X"
// y el cajero eligió uno concreto al armarlo).
export interface ResolucionComboLinea {
  productoId: number;
  nombre: string;
  cantidad: number; // cantidad por UNIDAD de combo (se multiplica x item.cantidad al cobrar)
}

// Un producto "por kilo" guarda cantidad en GRAMOS y precioUnitario "por kilo"
// (misma convención que el backend — ver Domain.Enums.UnidadMedida). El resto
// del sistema sigue tratando "cantidad" como unidades enteras.
const esKilogramo = (unidadMedida: unknown) =>
  unidadMedida === 'Kilogramo' || unidadMedida === 1;

// Subtotal de una línea del carrito, respetando la unidad de medida.
// No reemplaza calcularSubtotal (que puede estar en uso en otros lugares) —
// solo bifurca acá, donde sabemos si el ítem es por kilo o por unidad.
const calcularSubtotalItem = (
  precioUnitario: number,
  cantidad: number,
  unidadMedida?: unknown
) =>
  esKilogramo(unidadMedida)
    ? Math.round((cantidad / 1000) * precioUnitario * 100) / 100
    : calcularSubtotal(precioUnitario, cantidad);

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
  //
  // resolucionCombo: solo se pasa para combos que tienen al menos una línea
  // "por tag" ya resuelta a un producto puntual. Cuando viene presente, el
  // ítem se agrega SIEMPRE como una línea nueva del carrito (no se mergea con
  // otra unidad del mismo combo), porque dos unidades del mismo combo pueden
  // haber resuelto el tag con productos distintos (ej: alfajor Mondelez A
  // vs B) y no tiene sentido sumarlas en una sola fila.

  const addItem = (
    producto: ProductoSimple,
    precioOverride?: number,
    resolucionCombo?: ResolucionComboLinea[],
    cantidadInicial?: number // gramos, para productos por kilo agregados desde el modal de peso
  ) => {
    const precio = precioOverride ?? producto.precioVenta;
    const unidadMedida = (producto as any).unidadMedida;
    const esPorKilo = esKilogramo(unidadMedida);
    const cantidad = cantidadInicial ?? 1;

    setItems(prev => {
      if (!resolucionCombo) {
        const existing = prev.find(i => i.productoId === producto.productoId && !i.resolucionCombo);
        if (existing) {
          // Por kilo: cada "agregar" suma el peso elegido (no +1 gramo).
          // Por unidad: se comporta como siempre, +1.
          const nuevaCantidad = esPorKilo ? existing.cantidad + cantidad : existing.cantidad + 1;
          if (nuevaCantidad > existing.stock) {
            alert('No hay stock suficiente');
            return prev;
          }
          return prev.map(i =>
            i.lineId === existing.lineId
              ? { ...i, cantidad: nuevaCantidad, subtotal: calcularSubtotalItem(i.precioUnitario, nuevaCantidad, (i as any).unidadMedida) }
              : i
          );
        }
      }

      const lineId = resolucionCombo
        ? `${producto.productoId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        : String(producto.productoId);

      return [...prev, {
        lineId,
        productoId:     producto.productoId,
        nombre:         producto.nombre,
        precioUnitario: precio,
        cantidad,
        subtotal:       calcularSubtotalItem(precio, cantidad, unidadMedida),
        stock:          producto.stock,
        unidadMedida,
        resolucionCombo,
      } as ItemCarrito];
    });
  };

  // ── Quitar ────────────────────────────────────────────────────────────────

  const removeItem = (lineId: string) => {
    setItems(prev => prev.filter(i => i.lineId !== lineId));
  };

  // ── Actualizar cantidad ───────────────────────────────────────────────────

  const updateQuantity = (lineId: string, cantidad: number) => {
    if (cantidad <= 0) { removeItem(lineId); return; }
    setItems(prev => prev.map(i => {
      if (i.lineId !== lineId) return i;
      if (cantidad > i.stock) { alert('No hay stock suficiente'); return i; }
      return { ...i, cantidad, subtotal: calcularSubtotalItem(i.precioUnitario, cantidad, (i as any).unidadMedida) };
    }));
  };

  const incrementQuantity = (lineId: string) => {
    const item = items.find(i => i.lineId === lineId);
    if (item) updateQuantity(lineId, item.cantidad + 1);
  };

  const decrementQuantity = (lineId: string) => {
    const item = items.find(i => i.lineId === lineId);
    if (item) updateQuantity(lineId, item.cantidad - 1);
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