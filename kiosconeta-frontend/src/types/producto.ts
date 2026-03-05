// ════════════════════════════════════════════════════════════════════════════
// TYPES: Productos
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// PRODUCTO (Entity completa)
// ────────────────────────────────────────────────────────────────────────────

export interface Producto {
  productoId: number;
  nombre: string;
  codigoBarras?: string;
  precioCosto: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  categoriaId: number;
  categoria?: Categoria;
  fechaVencimiento?: string;    // ISO date string
  activo: boolean;
  kioscoId: number;
}

// ────────────────────────────────────────────────────────────────────────────
// PRODUCTO DTO (para crear/editar)
// ────────────────────────────────────────────────────────────────────────────

export interface CreateProductoDTO {
  nombre: string;
  codigoBarras?: string;
  precioCosto: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  categoriaId: number;
  fechaVencimiento?: string;
  kioscoId: number;
}

export interface UpdateProductoDTO {
  productoId: number;
  nombre?: string;
  codigoBarras?: string;
  precioCosto?: number;
  precioVenta?: number;
  stock?: number;
  stockMinimo?: number;
  categoriaId?: number;
  fechaVencimiento?: string;
  activo?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// CATEGORÍA
// ────────────────────────────────────────────────────────────────────────────

export interface Categoria {
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  kioscoId: number;
}

export interface CreateCategoriaDTO {
  nombre: string;
  descripcion?: string;
  kioscoId: number;
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