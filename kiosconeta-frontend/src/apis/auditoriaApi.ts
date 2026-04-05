// ════════════════════════════════════════════════════════════════════════════
// API: Auditoría
// ════════════════════════════════════════════════════════════════════════════

import apiClient, { handleResponse, handleError } from './client';
import { API_ENDPOINTS } from '../utils/constants';

export interface AuditoriaLog {
  auditoriaLogId: number;
  fecha: string;
  fechaFormateada: string;
  empleadoId: number;
  empleadoNombre: string;
  tipoEvento: string;
  descripcion: string;
  datosJson?: string;
  esSospechoso: boolean;
  motivoSospecha?: string;
  kioscoId: number;
}

export const auditoriaApi = {
  getByKiosco: async (
    kioscoId: number,
    desde?: string,
    hasta?: string
  ): Promise<AuditoriaLog[]> => {
    try {
      const params: any = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      const response = await apiClient.get<AuditoriaLog[]>(
        API_ENDPOINTS.AUDITORIA_KIOSCO(kioscoId),
        { params }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getSospechosos: async (kioscoId: number): Promise<AuditoriaLog[]> => {
    try {
      const response = await apiClient.get<AuditoriaLog[]>(
        API_ENDPOINTS.AUDITORIA_SOSPECHOSOS(kioscoId)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getByEmpleado: async (
    empleadoId: number,
    desde?: string,
    hasta?: string
  ): Promise<AuditoriaLog[]> => {
    try {
      const params: any = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      const response = await apiClient.get<AuditoriaLog[]>(
        API_ENDPOINTS.AUDITORIA_EMPLEADO(empleadoId),
        { params }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  registrarCarritoLimpiado: async (
  empleadoId: number,
  kioscoId: number,
  montoCarrito: number,
  cantidadItems: number
): Promise<void> => {
  try {
    await apiClient.post('/auditoria/registrar', {
      empleadoId,
      kioscoId,
      tipoEvento:     'CARRITO_LIMPIADO',
      descripcion:    `Carrito limpiado con ${cantidadItems} producto(s) por $${montoCarrito}`,
      datos:          JSON.stringify({ montoCarrito, cantidadItems }),
      esSospechoso:   montoCarrito > 1000,
      motivoSospecha: montoCarrito > 1000 ? `Carrito con monto alto limpiado: $${montoCarrito}` : null,
    });
  } catch { /* silencioso — no interrumpir el flujo */ }
},
};
