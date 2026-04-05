import apiClient, { handleResponse, handleError } from './client';
import type { GastoResponse, CreateGastoDTO, TipoDeGasto } from '../types/gastoTurno';

// ────────────────────────────────────────────────────────────────────────────
// GASTOS API
// ────────────────────────────────────────────────────────────────────────────

export const gastosApi = {

  // Gastos del turno actual
  getByTurno: async (cierreTurnoId: number): Promise<GastoResponse[]> => {
    try {
      const response = await apiClient.get<GastoResponse[]>(
        `/Gastos/turno/${cierreTurnoId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Todos los gastos del kiosco (para el admin)
  getByKiosco: async (kioscoId: number): Promise<GastoResponse[]> => {
    try {
      const response = await apiClient.get<GastoResponse[]>(
        `/Gastos/kiosco/${kioscoId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Crear gasto
  create: async (data: CreateGastoDTO): Promise<GastoResponse> => {
    try {
      const response = await apiClient.post<GastoResponse>('/Gastos', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Eliminar gasto
  delete: async (id: number): Promise<void> => {
    try {
      const response = await apiClient.delete(`/Gastos/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Buscar con filtros (para la página de admin)
  buscar: async (kioscoId: number, filtros: any): Promise<GastoResponse[]> => {
    try {
      const response = await apiClient.post<GastoResponse[]>(
        `/Gastos/kiosco/${kioscoId}/buscar`,
        filtros
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ────────────────────────────────────────────────────────────────────────────
// TIPOS DE GASTO API
// ────────────────────────────────────────────────────────────────────────────

export const tiposGastoApi = {

  getByKiosco: async (kioscoId: number): Promise<TipoDeGasto[]> => {
    try {
      const response = await apiClient.get<TipoDeGasto[]>(
        `/TiposDeGasto/kiosco/${kioscoId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getActivos: async (): Promise<TipoDeGasto[]> => {
    try {
      const response = await apiClient.get<TipoDeGasto[]>('/TiposDeGasto/activos');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  create: async (data: { nombre: string; descripcion: string; kioscoId: number }): Promise<TipoDeGasto> => {
    try {
      const response = await apiClient.post<TipoDeGasto>('/TiposDeGasto', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (id: number, data: { tipoDeGastoId: number; nombre: string; descripcion: string; kioscoId: number ;activo : boolean}): Promise<TipoDeGasto> => {
    try {
      const response = await apiClient.put<TipoDeGasto>(`/TiposDeGasto/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  toggleActivo: async (id: number, activo: boolean): Promise<void> => {
    try {
      const response = await apiClient.patch(`/TiposDeGasto/${id}/toggle-activo?activo=${activo}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};