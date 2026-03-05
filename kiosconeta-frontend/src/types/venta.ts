// ════════════════════════════════════════════════════════════════════════════
// TYPES: Ventas
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// VENTA (Entity completa)
// ────────────────────────────────────────────────────────────────────────────

export interface Venta {
  ventaId: number;
  fecha: string;                // ISO date string
  total: number;
  descuento: number;
  empleadoId: number;
  empleado?: {
    nombre: string;
    legajo?: string;
  };
  metodoPagoId: number;
  metodoPago?: {
    nombre: string;
  };
  turnoId?: number;
  anulada: boolean;
  motivoAnulacion?: string;
  kioscoId: number;
  detalles?: DetalleVenta[];
}

// ────────────────────────────────────────────────────────────────────────────
// DETALLE DE VENTA
// ────────────────────────────────────────────────────────────────────────────

export interface DetalleVenta {
  detalleVentaId: number;
  ventaId: number;
  productoId: number;
  producto?: {
    nombre: string;
  };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// ────────────────────────────────────────────────────────────────────────────
// CREAR VENTA (DTO para el POS)
// ────────────────────────────────────────────────────────────────────────────

export interface CreateVentaDTO {
  empleadoId: number;
  metodoPagoId: number;
  descuento?: number;
  kioscoId: number;
  detalles: CreateDetalleVentaDTO[];
}

export interface CreateDetalleVentaDTO {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

// ────────────────────────────────────────────────────────────────────────────
// CARRITO (para el POS)
// ────────────────────────────────────────────────────────────────────────────

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  stock: number;              // Stock disponible
}

export interface Carrito {
  items: ItemCarrito[];
  subtotal: number;
  descuento: number;
  total: number;
  metodoPagoId?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// MÉTODO DE PAGO
// ────────────────────────────────────────────────────────────────────────────

export interface MetodoPago {
  metodoPagoId: number;
  nombre: string;
  esEfectivo: boolean;
  activo: boolean;
  kioscoId: number;
}

// ────────────────────────────────────────────────────────────────────────────
// FILTROS DE VENTAS
// ────────────────────────────────────────────────────────────────────────────

export interface VentaFiltros {
  fechaDesde?: string;        // ISO date string
  fechaHasta?: string;        // ISO date string
  empleadoId?: number;
  metodoPagoId?: number;
  incluirAnuladas?: boolean;
}