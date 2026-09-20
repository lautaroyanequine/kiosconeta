// ════════════════════════════════════════════════════════════════════════════
// TYPES: Productos
// ════════════════════════════════════════════════════════════════════════════

// Reflejo de Domain.Enums.UnidadMedida del backend.
// OJO: si tu API serializa enums de C# como número (comportamiento default de
// System.Text.Json), vas a recibir/tener que mandar 0/1. Si tenés configurado
// JsonStringEnumConverter, es 'Unidad'/'Kilogramo'. Este tipo cubre ambos casos
// a propósito — mirá el Network tab una vez contra tu API y, si querés, lo
// achicamos a uno solo. Ver también ProductoModal.tsx (constante ES_ENUM_STRING).
export type UnidadMedida = 'Unidad' | 'Kilogramo' | 0 | 1;

// ────────────────────────────────────────────────────────────────────────────
// PRODUCTO (Entity completa)
// ────────────────────────────────────────────────────────────────────────────

export interface Producto {
  productoId: number;
  nombre: string;
  codigoBarra?: string;
  precioCosto: number;
  precioVenta: number;
  unidadMedida?: UnidadMedida; // default: 'Unidad' / 0
  stockActual: number;
  stockMinimo: number;
  categoriaId: number;
  categoriaNombre?: string;
  fechaVencimiento?: string;
  activo: boolean;
  kioscoId: number;
  bajoStock?: boolean;
  margenGanancia?: number;
  suelto?: boolean;
  distribuidorId?: number;        
  tags?: Tag[];
distribuidorNombre?: string;       
}

// ────────────────────────────────────────────────────────────────────────────
// PRODUCTO DTO (para crear/editar)
// ────────────────────────────────────────────────────────────────────────────

export interface CreateProductoDTO {
  nombre: string;
  codigoBarra?: string;
  precioCosto: number;
  precioVenta: number;
  unidadMedida?: UnidadMedida; // default: 'Unidad' / 0
  stockActual: number;
  stockMinimo: number;
  categoriaId: number;
  fechaVencimiento?: string;
  kioscoId: number;
  tagIds?: number[];
  suelto?: boolean;
}

export interface UpdateProductoDTO {
  productoId: number;
  nombre: string;
  codigoBarra?: string;
  precioCosto: number;
  precioVenta: number;
  unidadMedida?: UnidadMedida;
  stockActual: number;
  stockMinimo: number;
  tagIds?: number[];
  categoriaId: number;
  fechaVencimiento?: string;
  activo: boolean;
  suelto?: boolean;
  distribuidorId?: number;         
distribuidorNombre?: string; 
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
  unidadMedida?: UnidadMedida; // clave para el carrito: define si stock/cantidad son gramos
  stock: number;               // para unidadMedida='Kilogramo', stock está en GRAMOS
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

export interface Distribuidor {
  distribuidorId: number;
  nombre: string;
  telefono?: string;
  email?: string;
  notas?: string;
  activo: boolean;
  cantidadProductos: number;
}

export interface CreateDistribuidorDTO {
  nombre: string;
  telefono?: string;
  email?: string;
  notas?: string;
}



export interface Tag {
  tagId: number;
  nombre: string;
  activo: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// AJUSTE MASIVO DE PRECIOS
// ────────────────────────────────────────────────────────────────────────────

export type TipoAjustePrecio = 'Porcentaje' | 'MontoFijo';

export interface AjustePrecioMasivoDTO {
  kioscoId: number;
  productoIds: number[];
  tipoAjuste: TipoAjustePrecio;
  valorVenta?: number; // undefined = no tocar precio de venta
  valorCosto?: number; // undefined = no tocar precio de costo
}

export interface AjustePrecioMasivoResponseDTO {
  cantidadActualizados: number;
  productos: Producto[];
  errores: string[];
}