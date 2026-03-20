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
} from '../types';

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

  /**
   * Buscar producto por código de barras (para el scanner)
   */
  getByCodigoBarra: async (codigoBarra: string): Promise<ProductoSimple | null> => {
    try {
      const response = await apiClient.get<ProductoSimple>(
        `/productos/codigo-barra/${codigoBarra}`
      );
      return handleResponse(response);
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
      const response = await apiClient.get<ProductoSimple[]>(
        `/productos/kiosco/${kioscoId}/activos`
      );
      return handleResponse(response);
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
   * Activar/desactivar producto
   */
  toggleActivo: async (id: number): Promise<Producto> => {
    try {
      const response = await apiClient.patch<Producto>(
        `${API_ENDPOINTS.PRODUCTOS_BY_ID(id)}/toggle-activo`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Ajustar stock
   */
  ajustarStock: async (
    id: number,
    cantidad: number,
    operacion: 'agregar' | 'quitar'
  ): Promise<Producto> => {
    try {
      const response = await apiClient.patch<Producto>(
        `${API_ENDPOINTS.PRODUCTOS_BY_ID(id)}/ajustar-stock`,
        { cantidad, operacion }
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