// ════════════════════════════════════════════════════════════════════════════
// API: Ventas
// ════════════════════════════════════════════════════════════════════════════

import apiClient, { handleResponse, handleError } from './client';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  Venta,
  CreateVentaDTO,
  VentaFiltros,
  MetodoPago,
} from '../types';

// ────────────────────────────────────────────────────────────────────────────
// VENTAS API
// ────────────────────────────────────────────────────────────────────────────

export const ventasApi = {
  /**
   * Ventas del kiosco con filtros — POST /ventas/kiosco/{id}/buscar
   */
  getByKiosco: async (kioscoId: number, filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    empleadoId?: number;
    metodoPagoId?: number;
    turnoId?: number;
    soloAnuladas?: boolean;
  }): Promise<Venta[]> => {
    try {
      const response = await apiClient.post<Venta[]>(
        `/ventas/kiosco/${kioscoId}/buscar`,
        filtros ?? {}
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Ventas de hoy — GET /ventas/kiosco/{id}/hoy
   */
  getHoy: async (kioscoId: number): Promise<Venta[]> => {
    try {
      const response = await apiClient.get<Venta[]>(`/ventas/kiosco/${kioscoId}/hoy`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Crear venta (desde el POS)
   */
  create: async (data: CreateVentaDTO): Promise<Venta> => {
    try {
      const response = await apiClient.post<Venta>(API_ENDPOINTS.VENTAS, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Anular venta — DELETE /ventas/{id}
   */
 anular: async (id: number, motivo: string): Promise<void> => {
  try {
    await apiClient.post(API_ENDPOINTS.VENTAS_ANULAR(id), { motivo });
  } catch (error) {
    return handleError(error);
  }
},
};

// ────────────────────────────────────────────────────────────────────────────
// MÉTODOS DE PAGO API
// ────────────────────────────────────────────────────────────────────────────

export const metodosPagoApi = {
  /**
   * Obtener todos los métodos de pago
   */
  getAll: async (): Promise<MetodoPago[]> => {
    try {
      const response = await apiClient.get<MetodoPago[]>(
        API_ENDPOINTS.METODOS_PAGO
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener métodos de pago activos (para POS)
   */
  getActivos: async (): Promise<MetodoPago[]> => {
    try {
      const response = await apiClient.get<MetodoPago[]>(
        API_ENDPOINTS.METODOS_PAGO   // el backend devuelve todos en /MetodoDePago
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Crear método de pago
   */
  create: async (data: {
    nombre: string;
    esEfectivo: boolean;
    kioscoId: number;
  }): Promise<MetodoPago> => {
    try {
      const response = await apiClient.post<MetodoPago>(
        API_ENDPOINTS.METODOS_PAGO,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Actualizar método de pago
   */
  update: async (id: number, data: Partial<MetodoPago>): Promise<MetodoPago> => {
    try {
      const response = await apiClient.put<MetodoPago>(
        `${API_ENDPOINTS.METODOS_PAGO}/${id}`,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};