// ════════════════════════════════════════════════════════════════════════════
// TYPES: Ventas
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// VENTA (Entity completa)
// ────────────────────────────────────────────────────────────────────────────

export interface Venta {
  ventaId: number;
  fecha: string;
  total: number;
  precioCosto: number;
  ganancia: number;
  margenGanancia: number;
  detalles: string | null;
  anulada: boolean;
  numeroVenta: number;
  // Empleado
  empleadoId: number;
  empleadoNombre: string;
  // Método de pago
  metodoPagoId: number;
  metodoPagoNombre: string;
  // Turno
  turnoId: number;
  turnoNombre: string;
  // Productos
  productos: ProductoVenta[];
}

export interface ProductoVenta {
  productoVentaId: number;
  productoId: number;
  productoNombre: string;
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
  turnoId: number;
  detalles?: string;        // Observaciones opcionales
  productos: CreateProductoVentaDTO[];
}

export interface CreateProductoVentaDTO {
  productoId: number;
  cantidad: number;
  // precioUnitario lo toma el backend del producto directamente
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
  metodoDePagoID: number;   // el backend devuelve "metodoDePagoID" con mayúscula
  nombre: string;
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