// ════════════════════════════════════════════════════════════════════════════
// API: Dashboard y Reportes
// ════════════════════════════════════════════════════════════════════════════

import apiClient, { handleResponse, handleError } from './client';
import { API_ENDPOINTS } from '../utils/constants';
import type { DashboardData, ReporteVentas, ReporteProductos } from '../types';

// ────────────────────────────────────────────────────────────────────────────
// DASHBOARD API
// ────────────────────────────────────────────────────────────────────────────

export const dashboardApi = {
  /**
   * Obtener datos del dashboard
   */
  getData: async (): Promise<DashboardData> => {
    try {
      const response = await apiClient.get<DashboardData>(API_ENDPOINTS.DASHBOARD);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ────────────────────────────────────────────────────────────────────────────
// REPORTES API
// ────────────────────────────────────────────────────────────────────────────

export const reportesApi = {
  /**
   * Reporte de ventas
   */
  ventas: async (fechaDesde: string, fechaHasta: string): Promise<ReporteVentas> => {
    try {
      const response = await apiClient.get<ReporteVentas>(
        `${API_ENDPOINTS.DASHBOARD}/reporte-ventas`,
        {
          params: { fechaDesde, fechaHasta },
        }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reporte de productos
   */
  productos: async (): Promise<ReporteProductos> => {
    try {
      const response = await apiClient.get<ReporteProductos>(
        `${API_ENDPOINTS.DASHBOARD}/reporte-productos`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};