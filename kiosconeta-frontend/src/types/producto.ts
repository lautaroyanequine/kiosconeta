// ════════════════════════════════════════════════════════════════════════════
// TYPES: Productos
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// PRODUCTO (Entity completa)
// ────────────────────────────────────────────────────────────────────────────

export interface Producto {
  productoId: number;
  nombre: string;
  codigoBarra?: string;         // backend: CodigoBarra
  precioCosto: number;
  precioVenta: number;
  stockActual: number;          // backend: StockActual
  stockMinimo: number;
  categoriaId: number;
  categoriaNombre?: string;     // backend: CategoriaNombre
  fechaVencimiento?: string;
  activo: boolean;
  kioscoId: number;
  bajoStock?: boolean;          // backend: BajoStock (calculado)
  margenGanancia?: number;
  suelto?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// PRODUCTO DTO (para crear/editar)
// ────────────────────────────────────────────────────────────────────────────

export interface CreateProductoDTO {
  nombre: string;
  codigoBarra?: string;
  precioCosto: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  categoriaId: number;
  fechaVencimiento?: string;
  kioscoId: number;
  suelto?: boolean;
}

export interface UpdateProductoDTO {
  productoId: number;
  nombre: string;
  codigoBarra?: string;
  precioCosto: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  categoriaId: number;
  fechaVencimiento?: string;
  activo: boolean;
  suelto?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// CATEGORÍA
// ────────────────────────────────────────────────────────────────────────────

export interface Categoria {
  categoriaID: number;          // backend: CategoriaID (mayúscula)
  nombre: string;
  cantidadProductos?: number;
  activo?: boolean;
  kioscoId?: number;
}

export interface CreateCategoriaDTO {
  nombre: string;
  kioscoId?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// PRODUCTO SIMPLE (para POS y listas)
// ────────────────────────────────────────────────────────────────────────────

export interface ProductoSimple {
  productoId: number;
  nombre: string;
  precioVenta: number;
  stock: number;
  categoria: string;
}

// ────────────────────────────────────────────────────────────────────────────
// FILTROS
// ────────────────────────────────────────────────────────────────────────────

export interface ProductoFiltros {
  busqueda?: string;
  categoriaId?: number;
  stockBajo?: boolean;      // true = solo productos con stock < stockMinimo
  activo?: boolean;
}