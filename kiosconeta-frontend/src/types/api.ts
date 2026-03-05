// ════════════════════════════════════════════════════════════════════════════
// TYPES: API Generales
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// RESPUESTAS DE LA API
// ────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// PAGINACIÓN
// ────────────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ────────────────────────────────────────────────────────────────────────────

export interface DashboardData {
  ventasHoy: {
    total: number;
    cantidad: number;
    comparacionAyer: number;    // Porcentaje: +15, -5, etc.
  };
  productosStockBajo: {
    cantidad: number;
    productos: {
      productoId: number;
      nombre: string;
      stock: number;
      stockMinimo: number;
    }[];
  };
  empleadosActivos: number;
  turnoActual?: {
    turnoId: number;
    fechaApertura: string;
    efectivoInicial: number;
  };
  topProductos: {
    productoId: number;
    nombre: string;
    cantidadVendida: number;
    totalVendido: number;
  }[];
  ventasPorHora: {
    hora: string;
    cantidad: number;
    total: number;
  }[];
  metodosPagoDia: {
    metodoPago: string;
    cantidad: number;
    total: number;
    porcentaje: number;
  }[];
}

// ────────────────────────────────────────────────────────────────────────────
// REPORTES
// ────────────────────────────────────────────────────────────────────────────

export interface ReporteVentas {
  fechaDesde: string;
  fechaHasta: string;
  totalVentas: number;
  cantidadVentas: number;
  promedioVenta: number;
  ventasPorDia: {
    fecha: string;
    cantidad: number;
    total: number;
  }[];
  ventasPorCategoria: {
    categoria: string;
    cantidad: number;
    total: number;
  }[];
  topProductos: {
    productoId: number;
    nombre: string;
    cantidad: number;
    total: number;
  }[];
}

export interface ReporteProductos {
  totalProductos: number;
  productosActivos: number;
  productosInactivos: number;
  stockBajo: number;
  valorInventario: number;
  productosMasVendidos: {
    productoId: number;
    nombre: string;
    cantidadVendida: number;
  }[];
  productosMenosVendidos: {
    productoId: number;
    nombre: string;
    cantidadVendida: number;
  }[];
}

// ────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DEL KIOSCO
// ────────────────────────────────────────────────────────────────────────────

export interface Kiosco {
  kioscoId: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface UpdateKioscoDTO {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}