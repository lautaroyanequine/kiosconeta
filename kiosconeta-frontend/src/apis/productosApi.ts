// ════════════════════════════════════════════════════════════════════════════
// API: Productos
// ════════════════════════════════════════════════════════════════════════════

import apiClient, { handleResponse, handleError } from './client';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  Producto,
  CreateProductoDTO,
  UpdateProductoDTO,
  ProductoSimple,
  ProductoFiltros,
  Categoria,
  CreateCategoriaDTO,
  ResultadoPaginado,
  AjustePrecioMasivoDTO,
  AjustePrecioMasivoResponseDTO,
  TipoAjustePrecio
} from '../types';

// El backend, en los endpoints usados para el POS (/activos y /codigo-barra),
// devuelve el ProductoResponseDTO completo (stockActual, categoriaNombre...),
// no un DTO liviano con los nombres que espera ProductoSimple (stock, categoria).
// Sin este mapeo, "stock" queda undefined para TODOS los productos — lo cual
// no tira error en ningún lado porque nada compara explícitamente contra
// undefined, pero deja el control de stock del POS desactivado en silencio.
const mapAProductoSimple = (p: any): ProductoSimple => ({
  ...p, // conserva TODO lo que venga (suelto, codigoBarra, etc.) — solo normalizamos abajo
  stock:     p.stock ?? p.stockActual, // soporta ambos por si el DTO cambia a futuro
  categoria: p.categoria ?? p.categoriaNombre ?? '',
});

// El backend deserializa los enums de C# como NÚMERO (comportamiento default
// de System.Text.Json, sin JsonStringEnumConverter configurado) — mandar el
// string literal rompe el model binding y da un 400 genérico de validación.
const TIPO_AJUSTE_NUM: Record<TipoAjustePrecio, number> = {
  Porcentaje: 0,
  MontoFijo: 1,
  PrecioFijo: 2,
};

// ────────────────────────────────────────────────────────────────────────────
// PRODUCTOS API
// ────────────────────────────────────────────────────────────────────────────

export const productosApi = {
  /**
   * Obtener todos los productos
   */
  getAll: async (filtros?: ProductoFiltros): Promise<Producto[]> => {
    try {
      const response = await apiClient.get<Producto[]>(API_ENDPOINTS.PRODUCTOS, {
        params: filtros,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  // AGREGAR en productosApi
getPaginado: async (
  kioscoId: number,
  pagina = 1,
  tamanoPagina = 30,
  filtros?: {
    busqueda?: string;
    categoriaId?: number | '';
    soloStockBajo?: boolean;
    soloActivos?: boolean;
  }
): Promise<ResultadoPaginado<Producto>> => {
  try {
    const params = new URLSearchParams({
      pagina: String(pagina),
      tamanoPagina: String(tamanoPagina),
    });
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros?.categoriaId) params.append('categoriaId', String(filtros.categoriaId));
    if (filtros?.soloStockBajo) params.append('soloStockBajo', 'true');
    if (filtros?.soloActivos !== undefined) 
      params.append('soloActivos', String(filtros.soloActivos));

    const response = await apiClient.get<ResultadoPaginado<Producto>>(
      `/productos/kiosco/${kioscoId}/paginado?${params}`
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
},

  /**
   * Obtener producto por ID
   */
  getById: async (id: number): Promise<Producto> => {
    try {
      const response = await apiClient.get<Producto>(
        API_ENDPOINTS.PRODUCTOS_BY_ID(id)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  getByKiosco: async (kioscoId: number) => {
  try {
    const response = await apiClient.get(`/Productos/kiosco/${kioscoId}`)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
},

  /**
   * Buscar producto por código de barras (para el scanner)
   */
  getByCodigoBarra: async (codigoBarra: string): Promise<ProductoSimple | null> => {
    try {
      const response = await apiClient.get<any>(
        `/productos/codigo-barra/${codigoBarra}`
      );
      const data = handleResponse(response);
      return data ? mapAProductoSimple(data) : null;
    } catch (error: any) {
      if (error.statusCode === 404) return null;
      return handleError(error);
    }
  },

  /**
   * Obtener productos activos del kiosco (para POS)
   */
  getActivos: async (kioscoId: number): Promise<ProductoSimple[]> => {
    try {
      const response = await apiClient.get<any[]>(
        `/productos/kiosco/${kioscoId}/activos`
      );
      const data = handleResponse(response);
      return (data ?? []).map(mapAProductoSimple);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener productos con stock bajo
   */
  getStockBajo: async (): Promise<Producto[]> => {
    try {
      const response = await apiClient.get<Producto[]>(
        API_ENDPOINTS.PRODUCTOS_STOCK_BAJO
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Crear producto
   */
  create: async (data: CreateProductoDTO): Promise<Producto> => {
    try {
      const response = await apiClient.post<Producto>(
        API_ENDPOINTS.PRODUCTOS,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Actualizar producto
   */
  update: async (id: number, data: UpdateProductoDTO): Promise<Producto> => {
    try {
      const response = await apiClient.put<Producto>(
        API_ENDPOINTS.PRODUCTOS_BY_ID(id),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Eliminar producto
   */
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.PRODUCTOS_BY_ID(id));
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Activar/desactivar producto — PATCH /productos/{id}/toggle-activo?activo=true|false
   */
  toggleActivo: async (id: number, activo?: boolean): Promise<void> => {
    try {
      const param = activo !== undefined ? `?activo=${activo}` : '';
      await apiClient.patch(
        `${API_ENDPOINTS.PRODUCTOS_BY_ID(id)}/toggle-activo${param}`
      );
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Ajustar stock — PATCH /productos/{id}/stock?cantidad=X
   * cantidad positiva = agregar, negativa = quitar
   */
  ajustarStock: async (
    id: number,
    cantidad: number,
    idEmpleado: number,
    kioscoId: number,
    _operacion?: 'agregar' | 'quitar'
  ): Promise<void> => {
    try {
      await apiClient.patch(
`${API_ENDPOINTS.PRODUCTOS_BY_ID(id)}/stock?cantidad=${cantidad}&idEmpleado=${idEmpleado}&kioscoId=${kioscoId}`      );
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Ajustar precios de varios productos a la vez (por %, o monto fijo)
   */
  ajustarPreciosMasivo: async (data: AjustePrecioMasivoDTO): Promise<AjustePrecioMasivoResponseDTO> => {
    try {
      const response = await apiClient.patch<AjustePrecioMasivoResponseDTO>(
        '/productos/ajuste-masivo',
        {
          ...data,
          tipoAjuste: TIPO_AJUSTE_NUM[data.tipoAjuste],
        }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS API
// ────────────────────────────────────────────────────────────────────────────

export const categoriasApi = {
  /**
   * Obtener todas las categorías
   */
  getAll: async (): Promise<Categoria[]> => {
    try {
      const response = await apiClient.get<Categoria[]>(API_ENDPOINTS.CATEGORIAS);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener categoría por ID
   */
  getById: async (id: number): Promise<Categoria> => {
    try {
      const response = await apiClient.get<Categoria>(
        API_ENDPOINTS.CATEGORIAS_BY_ID(id)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  getByKiosco: async (kioscoId: number) => {
  try {
    const response = await apiClient.get(`/Categorias/kiosco/${kioscoId}`)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
},

  /**
   * Crear categoría
   */
  create: async (data: CreateCategoriaDTO): Promise<Categoria> => {
    try {
      const response = await apiClient.post<Categoria>(
        API_ENDPOINTS.CATEGORIAS,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Actualizar categoría
   */
  update: async (id: number, data: Partial<Categoria>): Promise<Categoria> => {
    try {
      const response = await apiClient.put<Categoria>(
        API_ENDPOINTS.CATEGORIAS_BY_ID(id),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
      
    }
  },

  /**
   * Eliminar categoría
   */
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.CATEGORIAS_BY_ID(id));
    } catch (error) {
      return handleError(error);
    }
  },
};